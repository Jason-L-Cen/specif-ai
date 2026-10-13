# UI TypeScript 中文化初稿

已按项目 EXTEND.md 与 02-prompt.md 的术语约定完成简体中文初稿，直接修改所属源文件，未提交或推送。

## 覆盖范围

- 共享需求显示名称、确认对话框、通知与校验文案、提示信息；Excel 表头和工作表名称。JSON 字段、导出格式及需求 ID 保持原协议。
- 通用组件默认按钮、搜索和选择提示、无障碍加载文案、面包屑、失败信息、工作流取消确认、上传和 AI 编辑反馈。
- 设置、MCP 配置、预定义 AWS Bedrock 知识库字段；Jira/Azure DevOps 的连接状态、导入、推送、错误和未命名条目。
- 解决方案创建、需求编辑、用户故事、任务、业务流程图、战略举措、测试用例各页面的动态标题、通知、菜单和上下文提示。
- 测试用例优先级、类型、状态、筛选选项与卡片显示的中文标签；保留原始英文枚举值。详情页提供 getOptionLabel(value, options)，模板代理负责将其用于只读显示。
- 三个环境文件的欢迎文案与 APP_VERSION=2.8.2-zh.1；失败时间及 ADF 日期使用 zh-CN。
- 应用初始化、IPC 模型配置提示、项目创建服务、Jira 引用迁移和导出失败信息。

## 兼容处理

- PRD 的 Screens/Personas 与“界面/用户画像”、任务和用户故事的 Acceptance Criteria 与“验收标准”，均同时识别半角及全角冒号。
- requirement.utils.ts 的 Markdown 标题识别与旧的普通文本回退都保留。旧英文资料无需迁移，中文生成内容可独立截断各节。
- 业务逻辑的路由、IPC/action/channel、模型 ID、配置键、目录、JSON/schema 键、Jira/ADO 事项类型以及 DRAFT/COMPLETE、测试用例枚举等保持原值。
- FileTypeEnum 经全部调用核对后仅用于显示名称，因此中文化其显示值；键与需求文件夹标识保持不变。
- AI 聊天的需求类型使用已有显示映射，避免按尾部固定字符数截取需求编号，并保留未知类型的文件名回退。

## 检查与交接

- 已用 TypeScript AST 检查所属范围直接显示的通知、对话框和属性文案；最终剩余的 Azure DevOps 为品牌名，保留。
- 已检查受文案改动影响的现有小测试，未发现需要同步的英文 UI 断言。
- 新增 ui/src/app/utils/requirement.utils.spec.ts，验证中英文标题、两种冒号、PRD 界面/用户画像、用户故事/任务验收标准在正文截断后仍然保留，并检查 UtilityService 的分节显示。
- 构建与测试由主代理统一执行；本代理没有重复运行完整构建或真实服务商调用。
- store 的 projects/user-stories/llm-config 三个 state、electron-bridge/electron.service.ts、guards/auth.guard.ts 已交接模板代理处理。本代理未覆盖这些文件。
- 已提醒交接代理：projects.state.ts 的“Project already exists”与“Aborted”错误字符串判断需兼容中文消息，不能仅翻译异常而保留不匹配的判断。

## 保留与疑点

- SDK 或服务端返回的自由格式 error.message、用户输入及已有业务内容保持原内容，可能仍出现外部英文；源码内可控的正常流程、默认及回退提示已中文化。
- Excel 表头已中文化；JSON 的字段名及枚举值保持接口兼容，导出已有业务数据不会自动翻译。
- 战略举措的删除实现采用 ArchiveFile，原菜单“Remove permanently”改为“删除此文档”，避免承诺与归档实现不符。
- HTML、LLM 服务商配置及模型常量、Angular locale 注册和主入口由其他代理负责，本初稿不覆盖这些所有权。
