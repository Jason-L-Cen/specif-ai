import { I18nPipe } from "../../../i18n/i18n.pipe";
import { t as uiText } from "../../../i18n/translate";
import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { McpServersListItemComponent } from '../mcp-servers-list-item/mcp-servers-list-item.component';
import { MCPServerDetails } from '../../../types/mcp.types';
import { CustomAccordionComponent } from '../../custom-accordion/custom-accordion.component';

@Component({
  selector: 'app-mcp-servers',
  templateUrl: './mcp-servers-list.component.html',
  standalone: true,
  imports: [NgForOf, NgIf, McpServersListItemComponent, CustomAccordionComponent, I18nPipe]
})
export class McpServersListComponent {
  @Input() mcpServers: MCPServerDetails[] = [];
  @Input() isLoading = false;

  @Input() heading = uiText("模型上下文协议（MCP）服务器");
  @Input() subHeading = uiText("查看已连接的 MCP 服务器及其能力");
  @Input() showHeading = true;
}
