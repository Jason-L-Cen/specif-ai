export const PRD_DEFINITION_CONTEXT = `A product requirement document describes the capabilities and qualities of a solution that meets the business needs. They provide the appropriate functionality level of detail to allow for the development and implementation of the solution.
- The PRD must contain specific functionalities and features the app must have.
- Include user interface (UI) requirements, user experience (UX) considerations, and any necessary integrations with other systems.
- Address the needs and expectations of end-users.
- 根据每份 PRD 生成以下内容：
    界面：根据该 PRD 的具体产品需求，说明应用中的各个界面或页面、其用途和关键元素。
    用户画像：识别与应用交互的不同用户类型、其目标和使用方式，并结合该 PRD 的具体需求与功能进行说明。`;

export const PRD_CONTEXT = `${PRD_DEFINITION_CONTEXT}

STRICT:
(!) The examples below are for formatting purposes only and should not be replicated verbatim in actual documents.

"A search feature allows users to search content/items by entering the product details in the search bar."

"The user can review items in the cart, change their number, or remove them before checkout."

"The app should allow users to create accounts and log in using credentials like email and password."

Instructions:
- Generate an apt title for all the following requirements. Title should be a one-liner not more than 5 words.
- Generate feature specifications related to the strategic initiative and domain.
- List the capabilities and qualities the solution should have. Provide the appropriate level of detail to allow for the development and implementation of the solution.`;
