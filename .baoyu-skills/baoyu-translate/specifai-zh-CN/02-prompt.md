# 中文化共用约定

目标：面向软件需求、开发和测试人员，将应用的所有用户可见文案准确改为简体中文。
采用自然、简明的技术文案，禁止机械替换、夸张宣传或添加多余注释。

统一术语：Solution→解决方案；Application/App→应用；Epic→史诗；User Story→用户故事；
Acceptance Criteria→验收标准；Requirement→需求；Task→任务；Test Case→测试用例；
Business Process→业务流程；Strategic Initiative→战略举措；Provider→模型服务商；
API Key→API 密钥；Settings→设置；Working Directory→工作目录；
Guardrails→安全护栏；Observability→可观测性；MCP→MCP；PRD→产品需求文档（PRD）。

专有名词和技术标识（DeepSeek、OpenAI、Jira、Azure DevOps、模型 ID、URL、路径、
IPC/channel、JSON/schema 字段名、状态枚举、CSS/class、HTML 属性名等）保持原样。
显示标签与内部值不同，不要更改逻辑中的比较值和持久化名称。
保留模板插值、Angular 指令、格式化占位符、参数和原有验证/错误处理。
UI 标签无需括注英文；用户输入和已有业务数据不属于源码翻译。
生成文档、聊天和图示中的自然语言默认简体中文；技术代码和 JSON 字段名保持协议格式。
用户明确要求其他语言时应遵从其要求。

初稿直接修改各自负责的源文件；在 chunks 中记录覆盖范围、疑点和检查结果。
主代理随后对照原始 git 版本进行准确性、术语、协议完整性和运行效果复核。
