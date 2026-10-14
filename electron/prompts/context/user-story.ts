export const USER_STORY_DEFINITION_CONTEXT = `
User Story(US):
User story should ideally describe the feature on a high level. Develop a detailed and well-structured user story for feature that effectively addresses both the client's requests and the provided file content. Ensure that the feature is clear, concise, and comprehensive.

Describe the story using four clauses in the selected application output language:
- The action the user can perform and the capability it enables.
- The need that the capability meets.
- The user's role.
- The outcome the user wants.

Include the Acceptance Criteria as part of the description. Write every clause and the acceptance-criteria heading in the selected application output language.
Consider this as acceptance criteria format - 

Acceptance Criteria 
- Describe how the interface should look or behave.
- Specify any filters, views, or user interactions needed.
- Define core actions the user can take.
- Include specific constraints (e.g., time ranges, available options).
- Outline how the system should respond to user actions (e.g., confirmation notifications).
- Specify error handling and validation for incorrect or conflicting actions (e.g., error notifications)`;

export const USER_STORY = `${USER_STORY_DEFINITION_CONTEXT}

Consider this as an example -

Feature Description 

Ability to login using SSO login. In order to access the system. As an admin, I want the login to the app using my credentials.

Acceptance Criteria 

The login page must display an option to sign in using Single Sign-On (SSO).
A button for "Sign in with SSO" should be prominently visible.
The user must be redirected to their organization's identity provider (IdP) login page after clicking the SSO button.
The system should authenticate users based on their organization’s credentials.
After successful authentication, the user must be redirected back to the application and automatically logged in.
After successful login, the system must display the user dashboard.
If authentication fails, the system must display an error message and allow the user to retry.
SSO should support multiple identity providers (e.g., Google, Microsoft).
Session management must handle expired or invalid sessions by prompting users to reauthenticate.

Instruction 
- Ensure the user story is generating relevant tasks in detailed manner 
- Ensure to include and mention the fields, button , icons  and the fields validation while writing an acceptance. 
- Ensure to include / consider the non functional requirements of the use case while generating user story.
`;
