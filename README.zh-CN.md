# Specifai 中文版与 DeepSeek

本分支基于上游发布标签 `v2.8.2`，本地版本为 `2.8.2-zh.3`。
界面、桌面菜单、提示、表单、导出字段、工作流进度与默认 AI 自然语言输出使用简体中文。
模型 ID、协议字段、状态值、品牌名称和既有用户内容保持原格式。

## 技术栈填写

创建解决方案时，“技术细节”提供三个单选模式：

- **选择技术栈**：从一个逐级展开的菜单选择应用架构、开发语言、应用框架、前端/界面和数据库，自动生成技术说明。提供 B/S Web、C/S 桌面、移动 App 和后端/API 四类；完整选中后才替换技术栈，关闭菜单不改变已有选择。
- **自定义输入**：保留文本输入框，可填写其他技术组合。
- **None（暂时没有技术栈）**：允许先创建方案，将技术选型标记为待定，并提示 AI 不要假定具体语言、框架或数据库。

切换模式时保留自定义草稿与选择状态。菜单支持鼠标展开及方向键、Enter、Escape 操作。

桌面/移动框架自动采用其界面组件，API 服务自动采用“无前端”，数据库可选择“不使用数据库”。
技术说明继续保存到原有 `technicalDetails` 字符串，供后续需求、任务和测试用例生成使用。
表单测试：`cd ui && npm run test:tech-stack`（需要 Chrome）。
下拉选项列出常见技术组合，可参考 [Spring Boot Web](https://docs.spring.io/spring-boot/reference/web/index.html)、[Qt for Python](https://doc.qt.io/qtforpython-6/index.html)、[Flutter](https://docs.flutter.dev/reference/supported-platforms) 与 [Electron](https://www.electronjs.org/docs/latest)。

## DeepSeek

在“设置 → 大语言模型配置”选择 DeepSeek，填写 API 密钥，选择模型并保存。
支持 `deepseek-flash` 和 `deepseek-v4-pro`，默认使用 Flash；接口固定为 `https://api.deepseek.com`。
普通生成/聊天、结构化输出、MCP 工具调用使用同一套已有 OpenAI SDK 接入。
当前 LangChain 版本不能正确回传 DeepSeek 的 `reasoning_content`，因此使用非思考模式，结构化输出使用工具调用格式。
模型与接口依据：[DeepSeek 官方文档](https://api-docs.deepseek.com/quick_start/pricing/)、[思考模式与工具调用](https://api-docs.deepseek.com/guides/thinking_mode/)。

## 本地构建

```sh
cd ui
npm ci
cd ../electron
npm ci
npm run build:ui
npm run build
npm test
CSC_IDENTITY_AUTO_DISCOVERY=false npm run package:mac:local
```

输出位于 `electron/dist`，适用于 Apple Silicon Mac。该本地安装包未进行 Apple 公证；不自动发布 GitHub Release。
安装时沿用产品名称 `Specif AI` 和应用标识 `com.electron.specifai`，配置文件与工作目录不随应用替换而迁移。
个人构建的更新源指向本 fork，防止上游安装包覆盖中文版本。

中文文档分节的定向浏览器测试：`cd ui && npm run test:localization`。
需要已安装 Chrome；macOS 可先设置 `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`。
该定向配置避开上游已有的失效测试夹具；原始完整 Angular 测试套件仍有与本次改动无关的编译错误。
