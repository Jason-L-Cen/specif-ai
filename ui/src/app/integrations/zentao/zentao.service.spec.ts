import { of } from 'rxjs';
import { Store } from '@ngxs/store';
import { Router } from '@angular/router';
import { ZentaoService } from './zentao.service';
import { ProjectsState } from '../../store/projects/projects.state';
import { IProjectMetadata } from '../../model/interfaces/projects.interface';
import { Ticket } from '../../services/pmo-integration/pmo-integration.service';
import { ElectronService } from '../../electron-bridge/electron.service';
import { AppSystemService } from '../../services/app-system/app-system.service';
import { ToasterService } from '../../services/toaster/toaster.service';
import { TestBed } from '@angular/core/testing';
import { NGXLogger } from 'ngx-logger';
import { PmoUrlService } from '../../services/pmo-url/pmo-url.service';
import { IntegrationCredentialsService } from '../../services/integration-credentials/integration-credentials.service';
import { InputFieldComponent } from '../../components/core/input-field/input-field.component';
import { TestCaseService } from '../../services/test-case/test-case.service';
import { RequirementIdService } from '../../services/requirement-id.service';

describe('禅道同步与本地数据保护', () => {
  const folder = '宿舍 Demo';
  let service: ZentaoService;
  let metadata: IProjectMetadata;
  let saved: Map<string, string>;
  let calls: any[];
  let failTask: boolean;
  let toast: any;
  const ticket = (id: string, type: string, parent: string | null): Ticket => ({ specifaiId: id, reqId: id, specifaiType: type, specifaiParentId: parent,
    pmoId: '', pmoIssueType: type === 'Task' ? 'task' : 'story', pmoParentId: null, title: id, description: '中文验收描述', child: [] });
  const get = (path: string) => JSON.parse(saved.get(`${folder}/${path}`)!);

  beforeEach(() => {
    metadata = { id: 'demo-project', name: folder, PRD: { count: 1 }, US: { count: 2 }, TASK: { count: 1 },
      integration: { selectedPmoTool: 'zentao', zentao: { baseUrl: 'https://zentao.example.com/team', account: 'user', productId: 1, productName: '宿舍', executionId: 3, executionName: '演示执行', reviewer: 'user' } } } as IProjectMetadata;
    saved = new Map(Object.entries({
      '.metadata.json': metadata,
      'PRD/PRD01-base.json': { id: 'PRD01', title: '原需求', requirement: '原描述', linkedBRDIds: ['BRD01'], chatHistory: ['保留聊天'] },
      'PRD/PRD01-feature.json': { features: [
        { id: 'US1', name: '录取', description: '原故事', chatHistory: ['保留故事聊天'], tasks: [{ id: 'TASK1', list: '校验', acceptance: '验收' }] },
        { id: 'US2', name: '不参与同步', tasks: [] },
      ] },
      'TC/US1/TC01-base.json': { id: 'TC01', title: '录取唯一性', description: '关联 PRD01 / US1', preConditions: ['已接受录取'], steps: [{ action: '再次接受', expectedResult: '拒绝' }], priority: 'High', type: 'Functional' },
    }).map(([p, c]) => [`${folder}/${p}`, JSON.stringify(c)]));
    calls = []; failTask = false;
    const store = { dispatch: () => of({}), selectSnapshot: (selector: any) => selector === ProjectsState.getProjects ? [{ project: folder, metadata }] : metadata };
    const files = {
      readFile: async (path: string) => saved.get(path),
      createFileWithContent: async (path: string, content: string) => { saved.set(path, content); },
      fileExists: async () => true,
      getFolders: async (path: string, filter: string) => { expect(filter).toBe('base'); return path.endsWith('/TC') ? [{ name: 'US1', children: ['TC01-base.json'] }] : [{ name: 'PRD', children: ['PRD01-base.json'] }]; },
    };
    const electron = { zentao: async (_channel: string, input: any) => {
      if (input.operation === 'validate') return { isValid: true };
      calls.push(input.item);
      if (failTask && input.item.kind === 'Task') throw new Error('模拟网络中断');
      return { id: input.item.id || ({ PRD: 10, 'User Story': 20, Task: 30, 'Test Case': 40 } as any)[input.item.kind] };
    } };
    toast = { showInfo: jasmine.createSpy(), showSuccess: jasmine.createSpy(), showError: jasmine.createSpy(), showWarning: jasmine.createSpy() };
    service = new ZentaoService(store as unknown as Store, toast as ToasterService, {} as Router, electron as unknown as ElectronService, files as unknown as AppSystemService);
  });

  it('按父子关系推送并绑定测试用例，重复推送复用编号', async () => {
    const selected = { prds: [ticket('PRD01', 'PRD', null)], userStories: [ticket('US1', 'User Story', 'PRD01')], tasks: [ticket('TASK1', 'Task', 'US1')] };
    await service.processZentaoSelectedItems('PRD', 'push', selected, metadata, true);
    expect(calls.map(c => c.parentId)).toEqual([undefined, 10, 20, 20]);
    expect(get('TC/US1/TC01-base.json').pmoId).toBe('ZT-C40');
    expect(get('PRD/PRD01-base.json').linkedBRDIds).toEqual(['BRD01']);
    expect(get('PRD/PRD01-feature.json').features[1].name).toBe('不参与同步');
    calls = [];
    await service.processZentaoSelectedItems('PRD', 'push', selected, metadata, true);
    expect(calls.map(c => c.id)).toEqual([10, 20, 30, 40]);
    expect(toast.showError).not.toHaveBeenCalled();
  });

  it('中途失败仍保存已确认的需求编号，随后可从现有编号继续', async () => {
    const selected = { prds: [ticket('PRD01', 'PRD', null)], userStories: [ticket('US1', 'User Story', 'PRD01')], tasks: [ticket('TASK1', 'Task', 'US1')] };
    failTask = true;
    await service.processZentaoSelectedItems('PRD', 'push', selected, metadata);
    expect(get('PRD/PRD01-base.json').pmoId).toBe('ZT-S10');
    expect(get('PRD/PRD01-feature.json').features[0].pmoId).toBe('ZT-S20');
    expect(toast.showError).toHaveBeenCalled();
    expect(toast.showSuccess).not.toHaveBeenCalled();
    failTask = false; calls = [];
    await service.processZentaoSelectedItems('PRD', 'push', selected, metadata);
    expect(calls[0].id).toBe(10); expect(calls[1].id).toBe(20);
  });

  it('拉取更新保留 BRD 关联、聊天、本地未选中故事和原测试用例', async () => {
    const base = get('PRD/PRD01-base.json'); base.pmoId = 'ZT-S10'; saved.set(`${folder}/PRD/PRD01-base.json`, JSON.stringify(base));
    const feature = get('PRD/PRD01-feature.json'); feature.features[0].pmoId = 'ZT-S20'; feature.features[0].tasks[0].pmoId = 'ZT-T30'; saved.set(`${folder}/PRD/PRD01-feature.json`, JSON.stringify(feature));
    const tc = saved.get(`${folder}/TC/US1/TC01-base.json`);
    const prd = { ...ticket('story-10', 'PRD', null), pmoId: 'ZT-S10', description: '<p>新产品描述</p>' };
    const story = { ...ticket('story-20', 'User Story', 'story-10'), pmoId: 'ZT-S20', pmoParentId: 'ZT-S10', description: '<p>新故事描述</p>' };
    const task = { ...ticket('task-30', 'Task', 'story-20'), pmoId: 'ZT-T30', pmoParentId: 'ZT-S20', description: '<p>新验收标准</p>' };
    await service.processZentaoSelectedItems('PRD', 'pull', { prds: [prd], userStories: [story], tasks: [task] }, metadata);
    expect(toast.showError).not.toHaveBeenCalled();
    expect(get('PRD/PRD01-base.json').linkedBRDIds).toEqual(['BRD01']);
    expect(get('PRD/PRD01-base.json').chatHistory).toEqual(['保留聊天']);
    expect(get('PRD/PRD01-feature.json').features[0].id).toBe('US1');
    expect(get('PRD/PRD01-feature.json').features[1].name).toBe('不参与同步');
    expect(saved.get(`${folder}/TC/US1/TC01-base.json`)).toBe(tc);
    expect(get('.metadata.json').US.count).toBe(2);
  });

  it('没有执行时在推送任何需求前停止任务同步', async () => {
    metadata.integration!.zentao!.executionId = 0;
    await service.processZentaoSelectedItems('PRD', 'push', { prds: [ticket('PRD01', 'PRD', null)], userStories: [], tasks: [ticket('TASK1', 'Task', 'US1')] }, metadata);
    expect(calls.length).toBe(0);
    expect(toast.showError).toHaveBeenCalled();
  });

  it('工作项按钮打开配置服务器的真实需求、任务、用例地址，沿用 Jira 与 ADO 地址规则', async () => {
    const open = jasmine.createSpy().and.resolveTo(undefined);
    const credentials = { getCredentials: jasmine.createSpy().and.callFake(async (_name: string, _id: string, type: string) => type === 'jira'
      ? { baseUrl: 'https://jira.example.com' } : { organization: 'team', projectName: 'demo' }) };
    TestBed.configureTestingModule({ providers: [PmoUrlService,
      { provide: ElectronService, useValue: { openExternalUrl: open } },
      { provide: IntegrationCredentialsService, useValue: credentials }, { provide: NGXLogger, useValue: { error: () => {} } },
    ] });
    const urls = TestBed.inject(PmoUrlService);
    for (const [pmoId, module, key] of [['ZT-S20', 'story', 'storyID'], ['ZT-T30', 'task', 'taskID'], ['ZT-C40', 'testcase', 'caseID']]) {
      expect(await urls.openPmoItem(pmoId, 'zentao', metadata)).toBeTrue();
      const url = new URL(open.calls.mostRecent().args[0]);
      expect(url.origin).toBe('https://zentao.example.com'); expect(url.pathname).toBe('/team/index.php');
      expect(url.searchParams.get('m')).toBe(module); expect(url.searchParams.has(key)).toBeTrue();
    }
    expect(credentials.getCredentials).not.toHaveBeenCalled();
    expect(await urls.generatePmoUrl('ABC-1', 'jira', metadata)).toBe('https://jira.example.com/browse/ABC-1');
    expect(await urls.generatePmoUrl('12', 'ado', metadata)).toBe('https://dev.azure.com/team/demo/_workitems/edit/12');
  });

  it('登录后重置控件会清空实际密码框，避免视图保留旧输入', () => {
    TestBed.configureTestingModule({ imports: [InputFieldComponent] });
    const fixture = TestBed.createComponent(InputFieldComponent);
    fixture.componentInstance.elementType = 'password';
    fixture.componentInstance.registerOnChange(() => {});
    fixture.componentInstance.registerOnTouched(() => {});
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = 'temporary-demo-password';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    fixture.componentInstance.writeValue('');
    fixture.detectChanges();
    expect(input.value).toBe('');
  });

  it('用例编辑保存保留禅道编号和原有附加字段，后续推送可更新原用例', async () => {
    let written: any;
    const fileService = {
      readFile: async (path: string) => { expect(path).toBe('宿舍 Demo/TC/US1/TC01-base.json'); return JSON.stringify({
        id: 'TC01', title: '原标题', pmoId: 'ZT-C40', pmoIssueType: 'testcase', trace: 'PRD01 / US1 / AC1',
      }); },
      createFileWithContent: async (path: string, text: string) => { expect(path).toBe('宿舍 Demo/TC/US1/TC01-base.json'); written = JSON.parse(text); },
    };
    TestBed.configureTestingModule({ providers: [TestCaseService,
      { provide: AppSystemService, useValue: fileService }, { provide: ElectronService, useValue: {} },
      { provide: Store, useValue: {} }, { provide: RequirementIdService, useValue: {} }, { provide: NGXLogger, useValue: { error: () => {} } },
    ] });
    const cases = TestBed.inject(TestCaseService);
    await new Promise<void>((resolve, reject) => cases.saveTestCase('宿舍 Demo', 'US1', { id: 'TC01', title: '修改后的用例' } as any, false)
      .subscribe({ complete: resolve, error: reject }));
    expect(written.title).toBe('修改后的用例');
    expect(written.pmoId).toBe('ZT-C40'); expect(written.trace).toBe('PRD01 / US1 / AC1');
  });
});
