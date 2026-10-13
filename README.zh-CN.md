# Specifai 中文版与 DeepSeek

本分支基于上游发布标签 `v2.8.2`，本地版本为 `2.8.2-zh.1`。
界面、桌面菜单、提示、表单、导出字段、工作流进度与默认 AI 自然语言输出使用简体中文。
模型 ID、协议字段、状态值、品牌名称和既有用户内容保持原格式。

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
