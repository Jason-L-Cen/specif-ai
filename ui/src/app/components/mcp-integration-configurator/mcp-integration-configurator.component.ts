import { I18nPipe } from "../../i18n/i18n.pipe";
import { t as uiText } from "../../i18n/translate";
import { Component, Input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import {
  MCPServerDetails,
  MCPServerOptions,
  MCPSettings,
  PredefinedMCPIntegration,
} from 'src/app/types/mcp.types';
import { MatDialog } from '@angular/material/dialog';
import { PredefinedMcpServerComponent } from './predefined-mcp-server/predefined-mcp-server.component';
import { NewMcpServerComponent } from './new-mcp-server/new-mcp-server.component';
import { ToasterService } from '../../services/toaster/toaster.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { PREDEFINED_MCP_INTEGRATIONS } from 'src/app/integrations/predefined-mcps';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { heroCheck, heroXMark } from '@ng-icons/heroicons/outline';

@Component({
  selector: 'app-mcp-integration-configurator',
  standalone: true,
  imports: [CommonModule, NgIcon, I18nPipe],
  templateUrl: './mcp-integration-configurator.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => McpIntegrationConfiguratorComponent),
      multi: true,
    },
    provideIcons({
      heroCheck,
      heroXMark,
    }),
  ],
})
export class McpIntegrationConfiguratorComponent
  implements ControlValueAccessor
{
  @Input() heading!: string;
  @Input() mcpSettings: MCPSettings = { mcpServers: {} };
  predefinedIntegrations = PREDEFINED_MCP_INTEGRATIONS;

  onChange: any = () => {};
  onTouched: any = () => {};

  constructor(
    private dialog: MatDialog,
    private toasterService: ToasterService,
    private dialogService: DialogService,
  ) {}

  writeValue(value: MCPSettings): void {
    if (value) {
      this.mcpSettings = value;
    }
  }

  registerOnChange(fn: (settings: MCPSettings) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  configurePredefinedMCPServer(integration: PredefinedMCPIntegration<any>) {
    const existingServer = this.mcpSettings['mcpServers'][integration.id];
    const dialogRef = this.dialog.open(PredefinedMcpServerComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: { integration, existingServer },
    });

    dialogRef.afterClosed().subscribe((result: MCPServerOptions | null) => {
      if (result) {
        this.mcpSettings.mcpServers[integration.id] = result;
        this.onChange(this.mcpSettings);
        this.toasterService.showSuccess(
          uiText("MCP 服务器配置已更新。"),
        );
      }
    });
  }

  configureCustomMCPServer(serverId: string, server: MCPServerOptions) {
    const dialogRef = this.dialog.open(NewMcpServerComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: { server, id: serverId },
    });

    dialogRef.afterClosed().subscribe((result: MCPServerDetails | null) => {
      if (result) {
        delete this.mcpSettings.mcpServers[serverId];
        this.mcpSettings.mcpServers[result.id] = result;
        this.onChange(this.mcpSettings);
        this.toasterService.showSuccess(
          uiText("自定义 MCP 服务器配置已更新。"),
        );
      } else {
        this.toasterService.showInfo(
          uiText("已取消配置自定义 MCP 服务器。"),
        );
      }
    });
  }

  configureNewMCPServer() {
    const dialogRef = this.dialog.open(NewMcpServerComponent, {
      width: '800px',
      maxHeight: '80vh',
      data: {},
    });

    dialogRef.afterClosed().subscribe(
      (
        result:
          | ({
              id: string;
            } & MCPServerOptions)
          | null,
      ) => {
        if (result) {
          this.mcpSettings.mcpServers[result.id] = result;
          this.onChange(this.mcpSettings);
        this.toasterService.showSuccess(uiText("MCP 服务器已添加。"));
        }
      },
    );
  }

  getCustomMCPServersInfo() {
    if (!this.mcpSettings.mcpServers) {
      return [];
    }

    return Object.keys(this.mcpSettings.mcpServers)
      .filter(
        (serverId) =>
          !this.predefinedIntegrations.some(
            (integration) => integration.id === serverId,
          ),
      )
      .map((serverId) => ({
        id: serverId,
        serverOptions: this.mcpSettings.mcpServers[serverId],
      }));
  }

  isServerConfigured(id: string) {
    if (!this.mcpSettings.mcpServers) {
      return false;
    }

    return !!this.mcpSettings.mcpServers[id];
  }

  removeServer({ id, name }: { id: string; name?: string }, event: Event) {
    event.stopPropagation();
    if (this.mcpSettings.mcpServers[id]) {
      this.dialogService
        .confirm({
        title: uiText("确认移除"),
        description: uiText("确定要移除 MCP 服务器 {0} 吗？", [name ?? id]),
        confirmButtonText: uiText("移除"),
        cancelButtonText: uiText("取消"),
        })
        .subscribe((confirmed) => {
          if (confirmed) {
            delete this.mcpSettings.mcpServers[id];
            this.onChange(this.mcpSettings);
          this.toasterService.showSuccess(uiText("MCP 服务器已移除。"));
          }
        });
    }
  }
}
