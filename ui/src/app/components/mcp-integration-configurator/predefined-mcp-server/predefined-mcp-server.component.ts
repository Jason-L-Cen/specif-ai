import { I18nPipe } from "../../../i18n/i18n.pipe";
import { t as uiText } from "../../../i18n/translate";
import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MCPServerDetails, PredefinedMCPIntegration, FormField } from 'src/app/types/mcp.types';
import { ElectronService } from '../../../electron-bridge/electron.service';
import { ToasterService } from '../../../services/toaster/toaster.service';
import { ButtonComponent } from '../../core/button/button.component';
import { InputFieldComponent } from '../../core/input-field/input-field.component';
import { TextareaFieldComponent } from '../../core/textarea-field/textarea-field.component';
import { McpServersListItemComponent } from '../../mcp/mcp-servers-list-item/mcp-servers-list-item.component';

@Component({
  selector: 'app-predefined-mcp-server',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputFieldComponent,
    TextareaFieldComponent,
    McpServersListItemComponent,
   I18nPipe,],
  templateUrl: './predefined-mcp-server.component.html',
  styleUrls: ['./predefined-mcp-server.component.scss'],
})
export class PredefinedMcpServerComponent implements OnInit {
  form!: FormGroup;
  isValidated = false;
  isValidating = false;
  showServerInformation = true;
  validatedServerStatus: MCPServerDetails | null = null;

  constructor(
    private fb: FormBuilder,
    private electronService: ElectronService,
    private toasterService: ToasterService,
    public dialogRef: MatDialogRef<PredefinedMcpServerComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { integration: PredefinedMCPIntegration<FormField[]>, existingServer?: MCPServerDetails },
  ) {}

  ngOnInit() {
    this.createForm();
    if (this.data.existingServer) {
      this.patchFormWithExistingData();
      this.isValidated = true;
      this.showServerInformation = false;
    }

    this.form.valueChanges.subscribe(() => {
      this.isValidated = false;
      this.validatedServerStatus = null;
      this.showServerInformation = true;
    });
  }

  createForm() {
    const formConfig: { [key: string]: any } = {};
    this.data.integration.formFields.forEach((field) => {
      formConfig[field.name] = [field.default || '', field.required ? Validators.required : []];
    });
    this.form = this.fb.group(formConfig);
  }

  patchFormWithExistingData() {
    if (this.data.existingServer) {
      const formData = this.data.integration.buildFormDataFromConfig(this.data.existingServer);
      this.form.patchValue(formData);
    }
  }

  async onValidate() {
    if (this.form.invalid) {
      this.toasterService.showError(uiText("验证前，请填写所有必填项。"));
      return;
    }

    this.isValidating = true;
    try {
      const formData = this.form.value;
      const config = this.data.integration.buildConfig(formData);
      const validationResult = await this.electronService.validateMCPSettings({ mcpServers: { [this.data.integration.id]: config } });
      this.validatedServerStatus = validationResult[0];
      this.isValidated = true;
      this.showServerInformation = true;
      
      if (this.validatedServerStatus.status === 'connected') {
        this.toasterService.showSuccess(uiText("MCP 服务器验证成功。"));
      } else {
        this.toasterService.showWarning(uiText("连接 MCP 服务器时出现问题，请查看详情。"));
      }
    } catch (error) {
      this.toasterService.showError(uiText("验证 MCP 服务器失败：") + (error instanceof Error ? error.message : uiText("未知错误")));
    } finally {
      this.isValidating = false;
    }
  }

  onSubmit() {
    if (this.form.valid && this.isValidated && this.validatedServerStatus) {
      const formData = this.form.value;
      const config = this.data.integration.buildConfig(formData);
      this.dialogRef.close({
        id: this.data.integration.id,
        ...config
      })
    } else if (!this.isValidated) {
      this.toasterService.showError(uiText("提交前，请先验证 MCP 服务器。"));
    }
  }

  onCancel() {
    this.dialogRef.close(null);
  }

  async openExternalUrl(url: string) {
    try {
      await this.electronService.openExternalUrl(url);
    } catch (error) {
      this.toasterService.showError(uiText("打开外部链接失败"));
    }
  }

  getFieldErrorMessage(fieldName: string): string {
    const field = this.form.get(fieldName);
    if (field?.hasError('required')) {
      return uiText("此项为必填项。");
    }
    return '';
  }
}
