# 模板与补充状态文案中文化初稿

已通读 ui/src/app 下全部 72 个 HTML 模板，修改其中 51 个包含用户可见静态文案的模板。随后接管并通读 5 个 TS 文件，补齐状态管理、Electron 通信层与鉴权守卫中的用户可见文案。未修改 index.html、Electron 主进程、路由和持久化协议。

## 覆盖范围

- 通用控件、富文本菜单、导航与面包屑、登录和用户名弹窗、空状态、文件上传、导出提示、自动更新与端口错误弹窗。
- 设置中的模型服务商配置、使用分析与 Langfuse、存储目录、自动更新和关于页面。
- MCP 配置与验证、连接状态、工具/资源列表；Jira/Azure DevOps 配置、字段映射、工作项拉取和推送。
- 解决方案创建与查看、需求编辑、业务流程及流程图、战略举措、用户故事、任务、测试用例与生成工作流。
- AI 聊天、反馈、行内修改建议及失败重试界面。

## 精确性与协议边界

- Solution=解决方案，User Story=用户故事，Provider=模型服务商；业务需求文档、产品需求文档等按页面语境表达，术语遵从共用 02-prompt.md。
- `server.status` 的 connected/error 仅在显示处映射为已连接/连接错误；战略举措 DRAFT/COMPLETE 仅映射显示为草稿/已完成。
- 与 TS 负责人协作，测试详情只读 type/status/priority 调用 getOptionLabel(value, options)，中文标签来自现有选项，英文 value 不变。
- AWS Session Key 已追踪到实际 sessionToken 映射，显示为“会话令牌”；Access Key 显示“访问密钥 ID”，Secret Key 显示“秘密访问密钥”。
- Jira 事项类型示例 Epic、Story、Sub-task 保留为实际集成名称，加中文说明提示用户输入 Jira 中的实际名称，避免将类型值翻译后导致同步失败。
- 面包屑 click 事件只将传入对象的显示 label 改为“解决方案”；已查看 navigateTo，路由由 url/state 决定，均保持原值。
- app-info 原 `aria-labelledby="Main Content"` 未指向有效元素，替换为 `aria-label="主要内容"`；所有 id、aria-controls、表单字段、路由、CSS、图标和技术标识保留。

## 英语残留审计

对文本节点、显示属性、Angular 显示绑定及 SVG 文本进行了扫描。没有发现尚未翻译的静态自然语言文案；保留项目品牌和技术标识：HAI、AI、AWS Bedrock、SpecifAI/Specifai、MCP、Jira、Azure DevOps、Langfuse、JSON、README、stdio/sse、ID、URI、PRD/BRD/UIR/NFR，以及示例 URL 和实际 Jira 类型名。SVG 内没有 title/desc/text 文本。

用户既有内容、第三方 MCP 工具描述/响应和工作项类型名称属于数据，保持原文。已有英文业务数据不会因模板中文化而变为中文。

## 检查结果

- 使用已安装 @angular/compiler 的 parseTemplate 解析全部 72 个模板：errors=[]。
- 对比 HEAD 与当前 HTML 标签/属性：标签数量和顺序相同；非显示属性唯一变化是面包屑对象的显示 label，已核实不会影响路由。
- git diff --check -- ui/src/app：通过。
- TS helper 接入后未单独执行完整 Angular 构建、Electron 打包或界面视觉检查，交给主代理统一完成。

## 待主代理最终校审

- Langfuse Public/Secret Key 当前显示“公开密钥/私密密钥”，可与 TS 配置术语统一。
- PRD/BRD 在生成数量配置处按原句显示“产品需求/业务需求”，在文件纳入与编辑处显示“产品需求文档/业务需求文档”。请确认最终产品术语的一致性与原始语境。
- 确认较长的中文集成字段名和工具提示在实际窗口宽度下无截断。

## 修改文件

- ui/src/app/components/accordion/accordion.component.html
- ui/src/app/components/ai-chat/ai-chat.component.html
- ui/src/app/components/analytics-modal/analytics-modal.component.html
- ui/src/app/components/auto-update-modal/auto-update-modal.component.html
- ui/src/app/components/confirmation-dialog/confirmation-dialog.component.html
- ui/src/app/components/core/alert/alert.component.html
- ui/src/app/components/core/breadcrumbs/breadcrumbs.component.html
- ui/src/app/components/core/list-item/list-item.component.html
- ui/src/app/components/core/rich-text-editor/link-dialog/link-dialog.component.html
- ui/src/app/components/core/rich-text-editor/rich-text-editor.component.html
- ui/src/app/components/document-listing/document-listing.component.html
- ui/src/app/components/dropdown/dropdown.component.html
- ui/src/app/components/empty-state/empty-state.component.html
- ui/src/app/components/inline-edit-prompt/inline-edit-prompt.component.html
- ui/src/app/components/layout/header/header.component.html
- ui/src/app/components/mcp-integration-configurator/mcp-integration-configurator.component.html
- ui/src/app/components/mcp-integration-configurator/new-mcp-server/new-mcp-server.component.html
- ui/src/app/components/mcp-integration-configurator/predefined-mcp-server/predefined-mcp-server.component.html
- ui/src/app/components/mcp/mcp-servers-list-item/mcp-servers-list-item.component.html
- ui/src/app/components/mcp/mcp-servers-list/mcp-servers-list.component.html
- ui/src/app/components/modal-dialog/modal-dialog.component.html
- ui/src/app/components/multi-upload/multi-upload.component.html
- ui/src/app/components/pill/pill.component.html
- ui/src/app/components/pmo-integration-modal/pmo-integration-modal.component.html
- ui/src/app/components/pmo-integration/ado-integration/ado-integration.component.html
- ui/src/app/components/pmo-integration/jira-integration/jira-integration.component.html
- ui/src/app/components/pmo-integration/pmo-integration.component.html
- ui/src/app/components/port-error-dialog/port-error-dialog.component.html
- ui/src/app/components/project-failure-message/project-failure-message.component.html
- ui/src/app/components/settings/settings.component.html
- ui/src/app/components/sidebar/sidebar.component.html
- ui/src/app/components/test-case-context-modal/test-case-context-modal.component.html
- ui/src/app/components/user-profile-dialog/user-profile-dialog.component.html
- ui/src/app/components/warning-root-modal/warning-root-modal.component.html
- ui/src/app/components/workflow-progress/workflow-progress.component.html
- ui/src/app/export-dropdown/export-dropdown.component.html
- ui/src/app/pages/app-info/app-info.component.html
- ui/src/app/pages/apps/apps.component.html
- ui/src/app/pages/business-process-flow/business-process-flow.component.html
- ui/src/app/pages/business-process/business-process.component.html
- ui/src/app/pages/create-solution/create-solution.component.html
- ui/src/app/pages/edit-solution/edit-solution.component.html
- ui/src/app/pages/edit-user-stories/edit-user-stories.component.html
- ui/src/app/pages/login/login.component.html
- ui/src/app/pages/strategic-initiative/strategic-initiative.component.html
- ui/src/app/pages/tasks/add-task/add-task.component.html
- ui/src/app/pages/tasks/task-list/task-list.component.html
- ui/src/app/pages/test-cases/test-case-detail/test-case-detail.component.html
- ui/src/app/pages/test-cases/test-case-home/test-case-home.component.html
- ui/src/app/pages/test-cases/test-case-list/test-case-list.component.html
- ui/src/app/pages/user-stories/user-stories.component.html

## 补充：5 个 TS 文件

- ui/src/app/store/user-stories/user-stories.state.ts：用户故事导出/复制提示、导出失败与未知错误。
- ui/src/app/store/projects/projects.state.ts：项目重名、创建时的未知错误、需求批量更新失败、需求数据导出/复制与导出错误。
- ui/src/app/store/llm-config/llm-config.state.ts：模型服务商配置缺失与配置验证失败提示。
- ui/src/app/electron-bridge/electron.service.ts：各调用路径的 Electron 环境不可用异常、Jira OAuth 授权未收到令牌、令牌刷新未收到令牌。
- ui/src/app/guards/auth.guard.ts：缺少保存目录时的登录提示。

逐一核对上述文件中的自然语言字符串在上下文是否可见。仍保留的英文均为 logger/console 技术日志；IPC channel、NGXS action/state names、状态枚举、存储键、外部错误哨兵与用户数据不变。

ProjectsState 原项目重名异常同时被 `includes('Project already exists')` 用作本地分类哨兵。检索代码确认仅同一函数这两处；抛出的异常与匹配片段同步改为“项目已存在”，保持不写失败元数据的原有行为。`Aborted` 识别片段保持不变。需求编号列表的显示分隔符改为中文顿号。

补充验证：TypeScript 编译器语法解析 5 个文件均通过；与 HEAD 的 AST 对比排除字符串/模板字面量后完全相同，未增删控制流或更改标识符；项目重名抛出/识别哨兵及 Aborted 保留检查通过；5 个 TS 文件的 git diff --check 通过。完整构建和应用端运行仍由主代理统一验证。

未提交或推送。
