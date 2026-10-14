import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BasePmoService } from '../../services/pmo-integration/base-pmo.service';
import { PmoService } from '../../services/pmo-integration/pmo-service.interface';
import { Ticket } from '../../services/pmo-integration/pmo-integration.service';
import { ProjectsState } from '../../store/projects/projects.state';
import { GetProjectFiles, GetProjectListAction } from '../../store/projects/projects.actions';
import { IProjectMetadata, ZentaoIntegrationConfig } from '../../model/interfaces/projects.interface';
import { ElectronService } from '../../electron-bridge/electron.service';
import { AppSystemService } from '../../services/app-system/app-system.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { htmlToMarkdown } from '../../utils/html.utils';

type SelectedItems = { prds: Ticket[]; userStories: Ticket[]; tasks: Ticket[] };

@Injectable({ providedIn: 'root' })
export class ZentaoService extends BasePmoService implements PmoService {
  private metadata!: IProjectMetadata;
  private config!: ZentaoIntegrationConfig;
  // shortcut: one sync per app; use per-project locks if simultaneous syncs are needed.
  private syncing = false;

  constructor(store: Store, toast: ToasterService, router: Router, private electron: ElectronService, private files: AppSystemService) {
    super(store, toast, router);
  }

  getIssueType(type: string): string { return type === 'Task' ? 'task' : 'story'; }

  async configure(): Promise<void> {
    if (this.syncing) throw new Error('禅道同步正在进行，请等待完成后再操作。');
    this.metadata = this.store.selectSnapshot(ProjectsState.getMetadata);
    const config = this.metadata?.integration?.zentao;
    if (!config) throw new Error('尚未配置禅道，请先保存集成连接。');
    this.config = config;
  }

  private operation(operation: string, item?: unknown) {
    return this.electron.zentao('operation', { projectId: this.metadata.id, baseUrl: this.config.baseUrl, config: this.config, operation, item });
  }

  async validateCredentials(): Promise<{ isValid: boolean; errorMessage?: string }> {
    try { await this.operation('validate'); return { isValid: true }; }
    catch (error) { return { isValid: false, errorMessage: error instanceof Error ? error.message : '禅道连接验证失败。' }; }
  }

  async getWorkPlanItemsHierarchy(skip = 0, top = 100): Promise<{ tickets: Ticket[]; totalCount: number }> {
    const result = await this.operation('hierarchy');
    const tag = (ticket: Ticket): Ticket => ({ ...ticket,
      pmoId: `ZT-${ticket.specifaiType === 'Task' ? 'T' : 'S'}${ticket.pmoId}`,
      pmoParentId: ticket.pmoParentId ? `ZT-S${ticket.pmoParentId}` : null,
      child: ticket.child.map(tag),
    });
    return { tickets: result.tickets.slice(skip, skip + top).map(tag), totalCount: result.tickets.length };
  }

  private remoteId(value: string | undefined, kind: 'S' | 'T' | 'C'): number | undefined {
    if (!value) return undefined;
    const match = value.match(new RegExp(`^ZT-${kind}([1-9]\\d*)$`));
    if (!match || !Number.isSafeInteger(Number(match[1]))) throw new Error('工作项编号不属于禅道，已停止同步。');
    return Number(match[1]);
  }

  async processZentaoSelectedItems(_folderName: string, action: 'pull' | 'push', selected: SelectedItems, metadata: IProjectMetadata, includeTestCases = false): Promise<void> {
    if (this.syncing) { this.toast.showWarning('禅道同步正在进行，请等待完成。'); return; }
    this.syncing = true;
    try {
      this.metadata = metadata;
      if (!metadata.integration?.zentao) throw new Error('尚未配置禅道连接。');
      this.config = metadata.integration.zentao;
      const project = this.store.selectSnapshot(ProjectsState.getProjects).find(p => p.metadata.id === metadata.id);
      if (!project) throw new Error('未找到解决方案目录。');
      await this.operation('validate');
      this.toast.showInfo(action === 'push' ? '正在向禅道推送所选工作项…' : '正在从禅道拉取所选工作项…');
      if (action === 'push') await this.push(selected, project.project, includeTestCases);
      else await this.pull(selected, project.project);
      await firstValueFrom(this.store.dispatch(new GetProjectListAction()));
      if (this.store.selectSnapshot(ProjectsState.getMetadata)?.id === metadata.id) await firstValueFrom(this.store.dispatch(new GetProjectFiles(metadata.id)));
      this.toast.showSuccess(action === 'push' ? '禅道推送完成，工作项关联已保存。' : '禅道拉取完成，未选中的本地内容已保留。');
    } catch (error) {
      this.toast.showError(`禅道同步已停止：${error instanceof Error ? error.message : '请重试。'} 已完成的关联会保留。`);
    } finally { this.syncing = false; }
  }

  private async read(folder: string, path: string, fallback?: any): Promise<any> {
    const raw = await this.files.readFile(`${folder}/${path}`);
    if (raw === undefined) {
      if (fallback !== undefined) return fallback;
      throw new Error(`未找到本地文件：${path}`);
    }
    return JSON.parse(raw);
  }

  private async write(folder: string, path: string, content: any): Promise<void> {
    await this.files.createFileWithContent(`${folder}/${path}`, JSON.stringify(content, null, 2));
  }

  private async push(selected: SelectedItems, folder: string, includeTestCases: boolean): Promise<void> {
    if (selected.tasks.length && !this.config.executionId) throw new Error('所选工作项含任务，请先配置禅道执行，或取消任务的勾选。');
    const stories = new Map(selected.userStories.map(s => [s.specifaiId, s]));
    const prds = new Map(selected.prds.map(p => [p.specifaiId, p]));
    for (const item of [...selected.prds, ...selected.userStories, ...selected.tasks]) {
      const isTask = item.specifaiType === 'Task';
      const parent = item.specifaiParentId ? (isTask ? stories : prds).get(item.specifaiParentId) : undefined;
      if (item.specifaiType !== 'PRD' && !parent?.pmoId) throw new Error('请同时选择父需求和用户故事。');
      const prdId = item.specifaiType === 'PRD' ? item.specifaiId : isTask ? parent?.specifaiParentId : item.specifaiParentId;
      if (!prdId?.match(/^PRD\d+$/)) throw new Error('本地产品需求编号格式有误。');
      const path = `PRD/${prdId}-${item.specifaiType === 'PRD' ? 'base' : 'feature'}.json`;
      const content = await this.read(folder, path);
      const target = item.specifaiType === 'PRD' ? content : isTask
        ? content.features?.find((s: any) => s.id === parent?.specifaiId)?.tasks?.find((t: any) => t.id === item.specifaiId)
        : content.features?.find((s: any) => s.id === item.specifaiId);
      if (!target) throw new Error('所选工作项已在本地删除，请刷新列表。');
      const result = await this.operation('upsert', { kind: item.specifaiType, id: this.remoteId(target.pmoId, isTask ? 'T' : 'S'),
        parentId: this.remoteId(parent?.pmoId, 'S'), title: item.title, description: item.description });
      item.pmoId = `ZT-${isTask ? 'T' : 'S'}${result.id}`;
      item.pmoIssueType = isTask ? 'task' : 'story';
      target.pmoId = item.pmoId; target.pmoIssueType = item.pmoIssueType;
      // Save each confirmed remote ID before creating the next item, including on partial failure.
      await this.write(folder, path, content);
    }
    if (!includeTestCases) return;
    if (!await this.files.fileExists(`${folder}/TC`)) return;
    const folders = await this.files.getFolders(`${folder}/TC`, 'base');
    for (const story of selected.userStories) {
      if (!/^US\d+$/.test(story.specifaiId)) throw new Error('本地用户故事编号格式有误。');
      const filenames = folders?.find((f: any) => f.name === story.specifaiId)?.children || [];
      for (const filename of filenames) {
        if (!/^TC\d+-base\.json$/.test(filename)) continue;
        const path = `TC/${story.specifaiId}/${filename}`;
        const tc = await this.read(folder, path);
        const result = await this.operation('upsert', { kind: 'Test Case', id: this.remoteId(tc.pmoId, 'C'), parentId: this.remoteId(story.pmoId, 'S'),
          title: tc.title, description: tc.description, preConditions: tc.preConditions, postConditions: tc.postConditions, steps: tc.steps, priority: tc.priority, type: tc.type });
        tc.pmoId = `ZT-C${result.id}`; tc.pmoIssueType = 'testcase';
        await this.write(folder, path, tc);
      }
    }
  }

  private async pull(selected: SelectedItems, folder: string): Promise<void> {
    const directories = await this.files.getFolders(folder, 'base');
    const filenames = directories?.find((d: any) => d.name === 'PRD')?.children || [];
    const local: { base: any; feature: any }[] = [];
    const metadata = await this.read(folder, '.metadata.json');
    let prdNumber = Number(metadata.PRD?.count) || 0;
    let usNumber = Number(metadata.US?.count) || 0;
    let taskNumber = Number(metadata.TASK?.count) || 0;
    for (const filename of filenames) {
      const match = filename.match(/^PRD(\d+)-base(?:-archived)?\.json$/);
      if (!match) continue;
      prdNumber = Math.max(prdNumber, Number(match[1]));
      if (filename.includes('-archived')) continue;
      const base = await this.read(folder, `PRD/${filename}`);
      const feature = await this.read(folder, `PRD/${base.id}-feature.json`, { features: [] });
      for (const s of [...(feature.features || []), ...(feature.archivedFeatures || [])]) {
        usNumber = Math.max(usNumber, Number(s.id?.replace(/^US/, '')) || 0);
        for (const t of [...(s.tasks || []), ...(s.archivedTasks || [])]) taskNumber = Math.max(taskNumber, Number(t.id?.replace(/^TASK/, '')) || 0);
      }
      local.push({ base, feature });
    }
    for (const prd of selected.prds) {
      const old = local.find(p => p.base.pmoId === prd.pmoId);
      const prdId = old?.base.id || `PRD${String(++prdNumber).padStart(2, '0')}`;
      const feature = old?.feature || { features: [] };
      for (const story of selected.userStories.filter(s => s.pmoParentId === prd.pmoId)) {
        const previous = local.find(p => (p.feature.features || []).some((s: any) => s.pmoId === story.pmoId));
        if (previous && previous.base.id !== prdId) throw new Error('已关联的用户故事在禅道中更换了父需求，请先核对本地关系。');
        let target = (feature.features || []).find((s: any) => s.pmoId === story.pmoId);
        if (!target) { target = { id: `US${++usNumber}`, tasks: [], chatHistory: [] }; feature.features.push(target); }
        Object.assign(target, { name: story.title, description: String(await htmlToMarkdown(story.description || '')), pmoId: story.pmoId, pmoIssueType: 'story' });
        target.tasks ||= [];
        for (const task of selected.tasks.filter(t => t.pmoParentId === story.pmoId)) {
          let t = target.tasks.find((t: any) => t.pmoId === task.pmoId);
          if (!t) { t = { id: `TASK${++taskNumber}`, chatHistory: [] }; target.tasks.push(t); }
          Object.assign(t, { list: task.title, acceptance: String(await htmlToMarkdown(task.description || '')), pmoId: task.pmoId, pmoIssueType: 'task' });
        }
      }
      await this.write(folder, `PRD/${prdId}-base.json`, { ...(old?.base || { id: prdId, state: 'Active', createdAt: new Date().toISOString(), chatHistory: [], linkedBRDIds: [] }),
        title: prd.title, requirement: String(await htmlToMarkdown(prd.description || '')), pmoId: prd.pmoId, pmoIssueType: 'story', updatedAt: new Date().toISOString() });
      await this.write(folder, `PRD/${prdId}-feature.json`, feature);
    }
    await this.write(folder, '.metadata.json', { ...metadata, PRD: { ...metadata.PRD, count: prdNumber }, US: { ...metadata.US, count: usNumber }, TASK: { ...metadata.TASK, count: taskNumber } });
  }
}
