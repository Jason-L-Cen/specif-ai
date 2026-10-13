export const OUTPUT_LANGUAGE_INSTRUCTIONS = `输出语言要求：除非用户明确要求其他语言，所有新生成的自然语言（包括回复、标题、Markdown 章节标题、需求说明、建议、评估理由、图示标签和摘要）均使用准确、自然的简体中文。固定 JSON 属性名、schema、工具名、标识符、机器状态或枚举值、代码、URL 和用户要求原样保留的内容保持不变；保留既有输入中的表格和链接。`;

export const MARKDOWN_RULES = `- Allowed Markdown:
    - Headings: #, ##, ###, ####, #####, ######
    - Bold: **bold text**
    - Italic: _italic text_ or *_italic text_*
    - Lists: Ordered (1., 2., 3.) and Unordered (*, -)
    - Horizontal Rules: ---, ***, or ___
  - ABSOLUTELY NO other formatting or syntax is permitted. you MUST NOT use links, code, images, or any Markdown beyond the allowed markdown.
  - You MUST NOT use code formatting in the text.
  - Apply Markdown formatting from the allowed list ONLY when it enhances the clarity and readability of your response.
    If your response is perfectly clear and understandable without Markdown, then do not use it.
  - Markdown formatting is optional and should be used thoughtfully to improve understanding, not just for the sake of formatting.`;
