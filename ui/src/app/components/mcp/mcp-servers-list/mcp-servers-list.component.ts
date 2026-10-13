import { Component, Input } from '@angular/core';
import { NgForOf, NgIf } from '@angular/common';
import { McpServersListItemComponent } from '../mcp-servers-list-item/mcp-servers-list-item.component';
import { MCPServerDetails } from '../../../types/mcp.types';
import { CustomAccordionComponent } from '../../custom-accordion/custom-accordion.component';

@Component({
  selector: 'app-mcp-servers',
  templateUrl: './mcp-servers-list.component.html',
  standalone: true,
  imports: [NgForOf, NgIf, McpServersListItemComponent, CustomAccordionComponent]
})
export class McpServersListComponent {
  @Input() mcpServers: MCPServerDetails[] = [];
  @Input() isLoading = false;

  @Input() heading = "模型上下文协议（MCP）服务器";
  @Input() subHeading = "查看已连接的 MCP 服务器及其能力";
  @Input() showHeading = true;
}
