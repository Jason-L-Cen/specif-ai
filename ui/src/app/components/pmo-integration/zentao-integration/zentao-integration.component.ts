import { Component, Input, Output, EventEmitter, OnInit, signal } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngxs/store';
import { firstValueFrom } from 'rxjs';
import { InputFieldComponent } from '../../core/input-field/input-field.component';
import { ButtonComponent } from '../../core/button/button.component';
import { ElectronService } from '../../../electron-bridge/electron.service';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { AppSystemService } from '../../../services/app-system/app-system.service';
import { ProjectsState } from '../../../store/projects/projects.state';
import { UpdateMetadata } from '../../../store/projects/projects.actions';
import { IProjectMetadata, ZentaoIntegrationConfig } from '../../../model/interfaces/projects.interface';

@Component({
  selector: 'app-zentao-integration', standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, InputFieldComponent, ButtonComponent],
  templateUrl: './zentao-integration.component.html',
})
export class ZentaoIntegrationComponent implements OnInit {
  @Input({ required: true }) projectId!: string;
  @Input({ required: true }) projectMetadata!: IProjectMetadata;
  @Output() connectionStatusChange = new EventEmitter<boolean>();
  isConnected = signal(false);
  isProcessing = signal(false);
  loggedIn = signal(false);
  error = signal('');
  products: { id: number; name: string }[] = [];
  executions: { id: number; name: string }[] = [];
  form = this.fb.nonNullable.group({
    baseUrl: ['', Validators.required], account: ['', Validators.required], password: [''],
    productId: [0, Validators.min(1)], executionId: [0],
    reviewer: ['', Validators.required],
  });

  constructor(private fb: FormBuilder, private electron: ElectronService, private store: Store,
    private toast: ToasterService, private files: AppSystemService) {}

  get saved(): ZentaoIntegrationConfig | undefined { return this.projectMetadata.integration?.zentao; }

  async ngOnInit(): Promise<void> {
    if (!this.saved) return;
    this.form.patchValue(this.saved);
    this.lockTarget();
    this.isProcessing.set(true);
    try {
      const resources = await this.operation('resources');
      this.products = resources.products;
      this.executions = resources.executions;
      await this.operation('validate');
      this.loggedIn.set(true);
      this.setConnected(true);
      this.form.disable();
    } catch (error) { this.error.set(error instanceof Error ? error.message : '请重新登录禅道。'); }
    finally { this.isProcessing.set(false); }
  }

  private operation(operation: string) {
    return this.electron.zentao('operation', { projectId: this.projectId, operation, baseUrl: this.form.getRawValue().baseUrl,
      config: this.saved });
  }

  private lockTarget() {
    if (this.saved) ['baseUrl', 'productId', 'executionId'].forEach(key => this.form.get(key)?.disable());
  }

  private setConnected(value: boolean) { this.isConnected.set(value); this.connectionStatusChange.emit(value); }

  async onLogin(): Promise<void> {
    if (this.isProcessing()) return;
    const { baseUrl, account, password } = this.form.getRawValue();
    if (!baseUrl.trim() || !account.trim() || !password) { this.error.set('请填写服务器地址、账号和密码。'); return; }
    this.isProcessing.set(true); this.error.set('');
    try {
      const resources = await this.electron.zentao('login', { projectId: this.projectId, baseUrl, account, password });
      this.products = resources.products; this.executions = resources.executions;
      this.form.patchValue({ baseUrl: resources.baseUrl, password: '', reviewer: this.form.controls.reviewer.value || account.trim() });
      this.loggedIn.set(true);
      this.form.controls.baseUrl.disable();
      if (!resources.remembered) this.toast.showInfo('系统加密存储不可用，本次登录仅在 App 运行期间有效。');
      if (this.saved) await this.onConnect();
    } catch (error) { this.error.set(error instanceof Error ? error.message : '禅道登录失败。'); this.form.controls.password.setValue(''); }
    finally { this.isProcessing.set(false); }
  }

  async onConnect(): Promise<void> {
    if (!this.loggedIn() || !this.form.valid) return;
    this.isProcessing.set(true); this.error.set('');
    const value = this.form.getRawValue();
    const config: ZentaoIntegrationConfig = { baseUrl: value.baseUrl, account: value.account.trim(), productId: Number(value.productId),
      productName: this.products.find(p => p.id === Number(value.productId))?.name || '',
      executionId: Number(value.executionId), executionName: this.executions.find(e => e.id === Number(value.executionId))?.name || '', reviewer: value.reviewer.trim() };
    try {
      await this.electron.zentao('operation', { projectId: this.projectId, operation: 'validate', baseUrl: config.baseUrl, config });
      const integration = { ...this.projectMetadata.integration, selectedPmoTool: 'zentao', zentao: config };
      await firstValueFrom(this.store.dispatch(new UpdateMetadata(this.projectId, { integration })));
      const project = this.store.selectSnapshot(ProjectsState.getProjects).find(p => p.metadata.id === this.projectId);
      const saved = project && JSON.parse(await this.files.readFile(`${project.project}/.metadata.json`));
      if (!saved || JSON.stringify(saved.integration?.zentao) !== JSON.stringify(config)) throw new Error('保存连接失败，请检查项目目录权限。');
      this.projectMetadata = saved;
      this.setConnected(true); this.form.disable();
      this.toast.showSuccess('禅道连接已保存。可在产品需求列表选择拉取或推送。');
    } catch (error) { this.error.set(error instanceof Error ? error.message : '保存禅道连接失败。'); }
    finally { this.isProcessing.set(false); }
  }

  async onDisconnect(): Promise<void> {
    if (this.isProcessing()) return;
    this.isProcessing.set(true);
    try {
      await this.electron.zentao('disconnect', this.projectId);
      this.setConnected(false); this.loggedIn.set(false); this.form.enable(); this.lockTarget();
      this.toast.showSuccess('已断开禅道连接，工作项关联仍保留。');
    } catch { this.error.set('断开禅道连接失败。'); }
    finally { this.isProcessing.set(false); }
  }
}
