# Electron 中文化初稿覆盖报告

范围：Electron 的用户可见消息与生成内容默认语言。未修改 UI、模型服务商实现、app.ts、更新处理器、包与构建配置；guardrails/index.ts 的两条错误文案完成后，文件由主代理接管。

## 已覆盖

- 共用需求显示名称、生成任务名称、退出确认按钮及进度丢失提示。
- 原生打开文件、保存文件与选择工作目录对话框的标题和按钮。
- 解决方案、用户故事、任务、测试用例、战略举措的生成、调研、评估、完善、失败及工具执行进度。
- API 配置验证、模型响应解析、知识库配置、文件读取、取消操作、本地存储及 MCP 连接/资源/工具错误。
- Jira 授权回调页面的成功和失败信息；响应 Content-Type 同时声明 UTF-8，保证中文正常显示。
- 两份显式 Zod 非空校验消息，保留 schema 字段名和校验规则。
- 回退需求标题、请求未能处理及安全护栏拦截消息。

## 生成语言规则

在已有 prompts/context/markdown-rules.ts 中定义 OUTPUT_LANGUAGE_INSTRUCTIONS，主代理的旧式 LLMUtils.prepareMessages 复用该常量。

LangChain 路径的 29 个实际 prompt builder、23 个模块已经将同一规则插入实际返回字符串，覆盖：

- 调研、调研摘要和对话压缩摘要。
- BRD、PRD、UIR、NFR 生成，用户故事生成/完善/评估，任务生成。
- 测试用例调研、生成/完善和评估。
- 战略举措调研、摘要、提案和结构化响应格式。
- 聊天、改进建议、行内编辑。

默认新生成的回复、说明、标题、Markdown 分节、评估理由、建议和摘要为简体中文；用户明确指定其他语言时遵从其请求。固定 JSON 属性名、schema、机器枚举/状态、工具名、标识符、代码与 URL 保持协议。表格、链接和要求保留的用户内容保持原样。

PRD、用户故事和任务模板中的固定分节已改为“界面：”“用户画像：”“验收标准：”，对应 UI 的旧英文/新中文兼容解析需求已交给 translate_ui。Mermaid 模板明确要求默认中文显示标题、节点和连线标签，同时保留图示语法、节点 ID 和指令关键字。

## 检查结果

- electron/npm run check（tsc --noEmit）通过。
- 对源码在内存中转译并逐一调用 29 个 prompt builder：全部返回包含共同语言规则的字符串；英文用户请求文本仍保留；APPROVED AND READY FOR REFINEMENT 协议状态仍保留。
- 固定英文分节标题 #### Screens:、#### Personas:、#### Acceptance Criteria: 在生成模板及 get-context 中剩余 0 处。
- git diff --check -- electron 通过。
- 英文可见 title/message/error 扫描只剩内部 schema 描述；未将程序值与比较值误译为显示文案。

## 复核边界与疑点

- 默认 Zod 错误确实可从 createSolutionSchema.parseAsync 经 IPC reject 进入 metadata.failureInfo.reason，并由 project-failure-message 展示。主代理已接管 message.constants.ts 与 app.ts 的统一错误映射；本初稿没有逐字段重复改写默认校验。
- High/Medium/Low、Functional/Integration/UI/UX/Performance/Security、PASS/FAIL 与评估批准状态均是程序值，须由 UI 的显示映射呈现中文，不能改写值本身。
- MCP 服务器提供的工具名称、描述、资源和外部错误细节属于外部数据，保留原文；本地解释性前缀已中文化。
- 内部日志、内部提示词的分析说明与工具说明保留英文。展开原始模型输入或外部工具响应时可能看到这些原始数据；普通提示与生成内容遵循中文规则。
- Settings 目录名、JSON 文件名、IPC channel、事件类型及持久化枚举保持不变，避免现有用户数据和协议失效。
- 未调用付费模型或使用用户 API 密钥；最终模型行为、UI 展示、打包与本地应用更新由主代理整体验证。
