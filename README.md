<div align="center">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License" />
  <img src="https://img.shields.io/github/issues/Jason-L-Cen/specif-ai" alt="Issues" />
  <img src="https://img.shields.io/github/stars/Jason-L-Cen/specif-ai" alt="Stars" />
  <img src="https://img.shields.io/github/forks/Jason-L-Cen/specif-ai" alt="Forks" />
</div>
<br />
<div align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/static/img/ace_white.svg">
    <source media="(prefers-color-scheme: light)" srcset="docs/static/img/ace.svg">
    <img alt="Ace PDA Logo" src="docs/static/img/ace.svg" height="96">
  </picture>
</div>
<br />  
<div align="center">
  <em>Accelerate your SDLC process with AI-powered intelligence.<br>
  From ideas to actionable tasks in minutes.</em>
</div>
<br>

# 爱思 产品研发助手 · Ace PDA

**Ace Product Development Assistant**, abbreviated **Ace PDA**. The AI assistant is named **Ace**.

Settings → Language switches the interface and future AI-generated content between English and Simplified Chinese, regardless of the input language. Switching refreshes the current page and is blocked while tasks are running or generated files are being saved. Existing documents keep their content; Jira and ZenTao synchronization preserves the saved document language.

See the [Chinese usage and build guide](README.zh-CN.md) for this branch, including DeepSeek, document upload, and requirement-to-test-case traceability. The original project copyright and MIT license are preserved in [LICENSE](LICENSE).

**Ace PDA** is an AI-powered platform that transforms the project requirements management. It combines AI technology with intuitive workflows to automate documentation, generate and manage tasks - all while adapting to your team's specific needs.
<div align="center">
    <img src="docs/static/gif/specifai-overview.gif" alt="Ace PDA in Action" width="900">
</div>

## Table of Contents
- [🌟 Overview](#overview)
- [📥 Getting Started](#getting-started)
- [✨ Key Features](#key-features)
   - [🔌 Integrations](#integrations)
- [🏗 Architecture](#architecture)
- [📝 Version-Controlled Requirements Management](#version-controlled-requirements-management)
- [🗺 Roadmap](#roadmap)
- [🤝 Contributing](#contributing)
- [📜 License](#license)
- [📧 Contact](#-contact)

## 🌟 Overview

In today's fast-paced software development landscape, delivering high-quality solutions quickly is more critical than ever. Ace PDA is a cutting-edge platform that revolutionizes how teams generate, manage, and refine software requirements by combining AI intelligence with human context.

By simply providing a solution name, description, and tech stack details, Ace PDA automatically generates comprehensive documentation, including:

- 📄 Business Requirement Documents (BRD)
- 🔧 Non-Functional Requirements Documents (NFRD)
- 📱 Product Requirement Documents (PRD)
- 🎨 User Interface Requirements (UIR)


<div align="center">
    <img src="docs/static/gif/specifai-sections.gif" alt="Document Generation Demo" width="900">
</div>

## 📥 Getting Started

<img src="docs/static/img/welcome-page.png" alt="Welcome Page" width="900" />

1. **Download the Ace PDA desktop application** from the [releases page](https://github.com/Jason-L-Cen/specif-ai/releases).
2. **Start** the Desktop Application
3. **Enter the Username and Working directory and get started!**

### 🧩 For Developers
1. **Clone the repository**
   ```bash
   git clone https://github.com/Jason-L-Cen/specif-ai.git
   cd specif-ai
   ```
2. **Set up the development environment**
   - [Electron Desktop Application Setup](./electron/README.md)
   - [Angular UI Setup](./ui/README.md)

## ✨ Key Features

- **🤖 AI-Powered Document Generation**: Effortlessly create detailed SDLC documentation.
- **💬 Intelligent Chat Interface**: Get real-time requirement edits and context-specific suggestions.

<div align="center">

![AI powered chat feature in action](docs/static/gif/specifai-chat.gif)  
*AI powered chat feature in action*

</div>

- **🪄 AI-Powered Inline Editing**: Ace PDA's inline editing feature allows you to instantly improve any text within editable fields using AI assistance, without disrupting your workflow.

<div align="center">

![Inline Editing Feature](docs/static/gif/specifai-inline-edit.gif)
*Inline Editing Demo*

</div>

- **📊 Business Process Visualization**: Easily generate and manage process flows.
- **🔗 Linking BRDs and PRDs**: Share BRD context to PRDs for holistic output.
- **📋 User Story Generation**: Convert requirements into actionable user stories and tasks.

<div align="center">

![User story and task generation](docs/static/gif/specifai-user-stories.gif)  
*User story and task generation*
</div>

- **🧪 Automated Test Case Generation**: Generate comprehensive test cases from user stories through an intelligent workflow. 

For Test Case Generation instructions, please refer to our [Automated Test Case Generation Guide](docs/docs/current/core-features.md#-automating-test-case-generation).
<div align="center">

![Test Case Generation](docs/static/gif/specifai-test-cases.gif)  
*Automated test case generation workflow*
</div>

- **🎯 Strategic Initiative Management**: Revolutionize the way you align strategy with execution. Design and manage powerful strategic initiatives that seamlessly connect high-level business goals with on-the-ground execution. Bridge the gap between vision and action, ensuring every technical effort directly supports your strategic priorities. Enhance your initiatives with external research by adding URLs that provide valuable context and documentation.

<div align="center">

![Strategic Initiative Management](docs/static/gif/specifai-si.gif)  
*Strategic Initiative management workflow*
</div>

- **🔍 Analytics & Observability**: Optional analytics and observability tracked in PostHog and Langfuse.
- **🔄 Multi-Model Support**: Choose the model that best suits your needs. Supported models include:
   - Azure OpenAI
      - gpt-4o
      - gpt-4o-mini
   - OpenAI Native
      - gpt-4o
      - gpt-4o-mini
   - AWS Bedrock
      - anthropic.claude-opus-4-20250514-v1:0
      - anthropic.claude-sonnet-4-20250514-v1:0
      - anthropic.claude-3-7-sonnet-20250219-v1:0
      - anthropic.claude-3-5-sonnet-20241022-v2:0
      - anthropic.claude-3-5-haiku-20241022-v1:0
      - anthropic.claude-3-5-sonnet-20240620-v1:0
      - anthropic.claude-3-haiku-20240307-v1:0
      - anthropic.claude-3-opus-20240229-v1:0
      - anthropic.claude-3-sonnet-20240229-v1:0
   - Gemini
      - gemini-2.0-flash-001
      - gemini-2.0-flash-lite-preview-02-05
      - gemini-2.0-pro-exp-02-05
      - gemini-2.0-flash-thinking-exp-01-21
      - gemini-2.0-flash-thinking-exp-1219
      - gemini-2.0-flash-exp
      - gemini-1.5-flash-002
      - gemini-1.5-flash-exp-0827
      - gemini-1.5-flash-8b-exp-0827
      - gemini-1.5-pro-002
      - gemini-1.5-pro-exp-0827
      - gemini-exp-1206
   - Anthropic
      - claude-opus-4-20250514
      - claude-sonnet-4-20250514
      - claude-3-7-sonnet-20250219
      - claude-3-5-sonnet-20241022
      - claude-3-5-haiku-20241022
      - claude-3-5-sonnet-20240620
      - claude-3-haiku-20240307
      - claude-3-opus-20240229
      - claude-3-sonnet-20240229
   - OpenRouter
   - Ollama

<div align="center">

![Model Switch](docs/static/gif/specifai-settings.gif)  
*Easily configurable multi provider support*

</div>

#### Custom Langfuse Configuration

Ace PDA supports custom Langfuse configuration for enhanced observability and analytics:

<div align="center">
  <img src="docs/static/img/specifai-custom-langfuse-settings.png" alt="Custom Langfuse Configuration" width="800">
  <em>Custom Langfuse configuration settings</em>
</div>

Key configuration options include:
- **Enable Analytics Tracking**: Toggle to enable/disable analytics tracking
- **Use Custom Langfuse Account**: Switch to use your own Langfuse instance
- **Base URL**: Custom Langfuse instance URL
- **Public Key**: Langfuse public key for authentication
- **Secret Key**: Langfuse secret key for secure access
- **Enable Detailed Traces**: Option to capture detailed execution traces includes detailed input and output.


#### ✨ Agentic Solution Requirement Generation Flow

Ace PDA utilises the Langgraph framework to deliver an efficient agentic workflow, enhancing the creation of solution requirements with precision. Following are the key phases involved:

- **Context Gathering Phase:** 
  - **Summarisation:** Analyses solution metadata and conversation history, employing summarisation to manage conversation context data effectively.
  - **Context Gathering:** Integrates data from a Knowledge-Base, incorporating adaptable MCP server tools for enhanced flexibility.
  - **Decision Point:** Assesses the need for Large Language Model (LLM) tool execution, iterating until the tool executions phase is complete.
  - **Data Consolidation** Organises data into a structured ReferenceInfo format.
- **Requirement Generation Phase**: The structured output from previous phase drives the creation of Business Requirements Document (BRD), Product Requirements Document (PRD), Non-functional Requirements Document (NFR) and User Interface Requirements (UIR). 

This Agentic architecture ensures seamless task orchestration and accelerates the solution  creation process.

![Agentic Flow](docs/static/img/specifai-create-solution-agentic-flow.png)  



### 🔌 Integrations

Ace PDA seamlessly integrates with popular tools to enhance your workflow:

#### Jira Integration
The stories and tasks generated as part of the solutions can be used to create actual stories and tasks in your Jira instance using the Jira integration provided by the application. Features include:
- Automatic story and task creation in Jira.
- Bidirectional sync capabilities.
- Bulk export capabilities.

For Jira setup instructions, please refer to our [Jira Setup Guide](docs/docs/current/JIRA-README.md).

#### Azure DevOps Integration
Seamlessly integrate with Azure DevOps to synchronize your requirements and work items. The ADO integration supports hierarchical work item management and bidirectional synchronization. Features include:
- **Hierarchical Work Item Management**: Support for Features → Platform Features → User Stories mapping
- **Bidirectional Sync**: Pull work items from ADO or push Ace PDA requirements to ADO
- **Flexible Mapping**: Configure work item types to match your ADO project structure
- **Bulk Operations**: Import/export multiple work items efficiently
- **Personal Access Token Authentication**: Secure authentication using Azure DevOps PATs

For Azure DevOps setup instructions, please refer to our [Azure DevOps Setup Guide](docs/docs/current/ADO-README.md).

#### AWS Bedrock Knowledge Base
The enterprise knowledge base is integrated with AI-powered chat to enhance suggestions and enable iterative conversations for Business Requirement Documents (BRDs), Product Requirement Documents (PRDs), Non-functional Requirements, User Stories, and Tasks. Features include: 

- Enhanced chat suggestions through enterprise knowledge.
- Context-aware requirement generation.
- Historical data integration.

## 🧠 Model Context Protocol (MCP) Integration

<div align="center">
  <em>Supercharge your development workflow with powerful tools and knowledge bases through the flexible Model Context Protocol (MCP)</em>
</div>

The Model Context Protocol (MCP) is a powerful integration framework that enables Ace PDA to connect with external tools, services, and knowledge bases. This extensible architecture allows you to enhance your requirement generation workflow with custom capabilities while maintaining a seamless user experience.

---

### 📚 Built-in Integration: AWS Bedrock Knowledge Base

Ace PDA includes native support for **AWS Bedrock Knowledge Base (KB)**. Configuration is available directly in the UI. For detailed setup instructions, see our [AWS Bedrock KB Configuration Guide](docs/docs/current/aws-bedrock-kb-configuration.md).

<div align="center">
  <img src="docs/static/img/mcp/aws-bedrock-kb-config.png" alt="AWS Bedrock KB Configuration" width="800">
  <em>AWS Bedrock KB visual configuration</em>
</div>

---

### 🛠 Add Custom MCP Servers

Ace PDA also supports integration with custom MCP-compatible tools and services. For example, you can connect a file system MCP server, which will automatically surface its tools and resources in the UI.

<div align="center">
  <img src="docs/static/img/mcp/custom-mcp-config.png" alt="Custom MCP Server Configuration" width="800">
  <em>UI for managing custom MCP server integrations</em>
</div>

---

All MCP integrations can be managed from the **Integrations** page, where you can easily add, configure, or remove both built-in and custom servers.

<div align="center">
  <img src="docs/static/img/mcp/custom-server-management.png" alt="Custom Server Management Interface" width="800">
  <em>Manage all MCP integrations from a single place</em>
</div>

## 🏗 Architecture

Ace PDA follows a modern, scalable architecture designed for optimal performance and maintainability.

<div align="center">

![Ace PDA Architecture](docs/static/gif/specifai-architecture.gif)
*Ace PDA Architecture*

</div>

## 📝 Version Controlled Requirements Management Made Easy

Ace PDA is a powerful desktop application built to streamline and organize your project requirements. With Ace PDA, users can create a unified directory where all essential files are not only accessible and editable but also seamlessly synced with platforms like OneDrive, Dropbox etc. This setup allows users to point to specific artifacts and data sources in a version-controlled environment, making collaboration and tracking effortless. Our goal is to enhance your development workflow by integrating seamlessly with the tools you already use, without adding complexity or obstacles.


## 🗺 Roadmap
- [x] Advanced BRD-PRD linking capabilities.
- [x] Agentic Workflow.
- [x] Test Case Generation from User Stories.
- [ ] Custom template support.

## 🤝 Contributing

To contribute to the project, start by exploring [open issues](https://github.com/Jason-L-Cen/specif-ai/issues) or checking our [feature request board](https://github.com/Jason-L-Cen/specif-ai/discussions/categories/feature-requests?discussions_q=is%3Aopen+category%3A%22Feature+Requests%22+sort%3Atop).

Please read our [Contributing Guidelines](./CONTRIBUTING.md) for more details.

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## 🙏 Acknowledgments

Thanks to all contributors and users for their support and feedback.

<a href="https://github.com/Jason-L-Cen/specif-ai/graphs/contributors">
  <img src="https://contrib.rocks/image?repo=Jason-L-Cen/specif-ai" />
</a>

## 📧 Contact

For any questions or feedback, please contact us at [project issues](https://github.com/Jason-L-Cen/specif-ai/issues).
