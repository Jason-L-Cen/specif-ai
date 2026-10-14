# 爱思 产品研发助手 · Ace PDA

英文名称：**Ace Product Development Assistant**，简称 **Ace PDA**。AI 助手名称为 **Ace**。

本分支基于上游发布标签 `v2.8.2`，本地版本为 `2.8.2-zh.8`。
界面、桌面菜单、提示、表单、导出字段、工作流进度与默认 AI 自然语言输出使用简体中文。
模型 ID、协议字段、状态值和既有用户内容保持原格式。应用自身的界面、聊天头像、欢迎页、关于页、菜单及安装图标使用提供的 ACE 品牌资产。

## 需求类型与演示操作

### 连接禅道

1. 打开解决方案 → **集成** → **PMO 集成**，选择 **禅道**。
2. 填写禅道站点根地址、账号和密码，点击 **登录并加载产品**。支持本地、远程服务器和子目录部署；远程连接建议使用 HTTPS。
3. 选择产品、已关联该产品的执行，以及需求评审人账号，点击 **保存连接**。执行可暂不选择，此时不能推送任务。
4. 打开 **产品需求** 列表的导出菜单，选择 **推送到禅道** 或 **从禅道拉取**，逐项勾选要同步的工作项。
5. 推送时可勾选 **同时推送测试用例**，所选用户故事下的全部用例会关联到对应的禅道子需求，步骤、预期结果与条件随用例保存。用例同步不会执行测试。

映射关系为 PRD → 父软件需求，用户故事 → 子软件需求，任务 → 执行任务。新需求按草稿创建，变更使用禅道原生评审流程；工作项编号会回写本地，后续同步更新原工作项。拉取只更新所选内容，保留本地 BRD 关联、聊天和未选中的故事、任务；当前不反向导入测试用例。

连接配置不包含密码，令牌由系统加密保存；系统安全存储不可用时仅保留当前运行期间的登录。断开连接会删除令牌，保留已建立的工作项关联。绑定后固定服务器、产品和执行，防止已有编号被用于其他目标；新解决方案可独立配置其他禅道服务器。

使用支持 API v2 的禅道版本；已在禅道 22.7 轻量模式上实测。执行与产品的关联验证补读 API v1。当前拉取支持父、子软件需求与关联任务，不支持三层以上软件需求或直接挂在父需求上的任务；不会自动启用禅道需求分层或更改系统模式。参考 [禅道官方 API SDK 与版本说明](https://github.com/easysoft/zentao-api)。

### 各类需求的用途

| 类型 | 用途 |
| --- | --- |
| BRD 业务需求 | 业务目标、规则和范围 |
| PRD 产品需求 | 产品功能和行为，关联 BRD |
| US 用户故事 | 在某条 PRD 下描述角色、目标和验收标准 |
| TASK 任务 | 实现某条用户故事的具体工作 |
| NFR 非功能需求 | 性能、安全、一致性等约束 |
| UIR 用户界面需求 | 页面和交互要求 |
| TC 测试用例 | 归属用户故事，包含前置条件、步骤和预期结果 |
| SI 战略举措 | 阶段目标和验证计划 |
| BP 业务流程 | 业务步骤，选择关联的 PRD |

操作入口：**产品需求 → 对应 PRD 卡片上的“用户故事” → 新增**。填写名称及描述，描述中使用 AC1、AC2 等编号写明验收标准，再点击“添加”。空故事列表可点击“生成用户故事”，补充上下文后由 AI 生成故事及任务。
从故事卡片的“测试用例”进入，可手动添加或生成用例；用例自动归入该故事，描述中补充 PRD、US、AC 编号可解释验证范围。比如 `PRD02 → US1 → AC3 → TC05` 验证五分钟临时锁定。
现场可先演示已保存的需求、故事和用例，再在无故事的 PRD 下新增样例。AI 评估通过表示内容评估完成，不能视为业务测试实际执行通过。

## 多文件解决方案描述

创建解决方案时可在描述框下添加多份 DOCX、PDF、TXT、Markdown 文件。手写描述与附件正文可同时使用，也可仅通过附件提供描述；支持继续添加和逐份移除，移除附件不改写手写内容。
页面显示实际用于生成的描述字符数，超过 1 万字符时建议精简。这是长度提示，不是模型容量或速度保证；不自动截断或改写内容。Demo 建议先使用短需求说明，并把每类需求的最小条数设为 3-5。
原有 App 只在需求、用户故事和任务编辑中提供代码文件上传，创建页没有此功能。这里复用该上传组件并修正原有读取顺序和重选时残留旧内容的问题。

正文在本地解析，连同来源文件名保存到原有 `description` 字符串，再传入已有创建及需求生成流程。上传时不调用 AI；创建时沿用已配置的模型。
Word 复用已安装的 Mammoth；PDF 使用 [unpdf](https://github.com/unjs/unpdf) 和配套 [PDF.js](https://github.com/mozilla/pdf.js) 字符映射资源，包含中文字符映射。解析在独立工作线程完成，限制时间与堆内存；读取失败不覆盖已有文件和手写内容。

最多 10 份，每份不超过 10 MB，附件合计正文不超过 20 万字符。只提取文字正文，不进行 OCR；扫描 PDF 请先识别文字。TXT/Markdown 支持 UTF-8 及带 BOM 的 UTF-16；旧 `.doc` 文件请转换为 `.docx`。
文件资料中的指令不具有改变生成任务或工具权限的效力；生成提示要求保留来源文件名并指出资料冲突。
检查：`cd ui && npm run test:solution-form`；`cd electron && npm run build && npm test`。测试包含真实中文 Word 和中英文 PDF 样本。

## 需求与测试用例关联

用户故事卡片的“查看任务”和“测试用例”按钮只打开对应页面，操作按钮不再同时触发卡片的编辑跳转。测试用例通过用户故事关联所属 PRD，并由 PRD 的 `linkedBRDIds` 追溯业务需求。
从“产品需求 → 用户故事 → 测试用例”创建时自动归入相应故事；测试区也可先选择 PRD，再选择其用户故事。用例保存于 `TC/<用户故事ID>/`，所属 PRD 由 `PRD/<PRD编号>-feature.json` 中的故事确定。具体验收条件编号可写入用例描述，便于评审；目前不提供自动覆盖率或真实测试执行结果。

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

构建与后端检查需要 Node.js 22.13 或更新版本；桌面包内的 Electron 提供运行时。

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
安装包和系统简称为 `Ace PDA`，显示名称为“爱思 产品研发助手”。保留原应用标识 `com.electron.specifai`；打包应用继续读取原有 `Specif AI` 配置目录，MCP 设置共用此目录，已有 DeepSeek 设置和工作目录无需重新配置。
个人构建的更新源指向本 fork，防止上游安装包覆盖中文版本。

中文文档分节的定向浏览器测试：`cd ui && npm run test:localization`。
需要已安装 Chrome；macOS 可先设置 `CHROME_BIN='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'`。
该定向配置避开上游已有的失效测试夹具；原始完整 Angular 测试套件仍有与本次改动无关的编译错误。

## 开源来源

基于 [Specifai](https://github.com/presidio-oss/specif-ai) 开发。原始版权及 MIT 许可保留在 [LICENSE](LICENSE) 中；ACE 标志由项目使用者提供。
