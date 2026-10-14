import { handleLanguageTask } from "./language-handler";
import { ipcMain } from "electron";
import { updateRequirement } from "../api/requirement/update";
import { chatUpdateRequirement } from "../api/requirement/chat";
import { addRequirement } from "../api/requirement/add";
import { addBusinessProcess } from "../api/requirement/business-process/add";
import { updateBusinessProcess } from "../api/requirement/business-process/update";

export function setupRequirementHandlers() {
  handleLanguageTask('requirement:update', async (_event, data: any) => {
    try {
      const result = await updateRequirement(_event, data);
      return result;
    } catch (error: any) {
      console.error('Error handling requirement:update:', error.message);
      throw error;
    }
  });

  handleLanguageTask('requirement:chat', async (_event, data: any) => {
    try {
      const result = await chatUpdateRequirement(_event, data);
      return result;
    } catch (error: any) {
      console.error('Error handling requirement:chat:', error.message);
      throw error;
    }
  });

  handleLanguageTask('requirement:add', async (_event, data: any) => {
    try {
      const result = await addRequirement(_event, data);
      return result;
    } catch (error: any) {
      console.error('Error handling requirement:add:', error.message);
      throw error;
    }
  });

  handleLanguageTask('requirement:bp-add', async (_event, data: any) => {
    try {
      const result = await addBusinessProcess(_event, data);
      return result;
    } catch (error: any) {
      console.error('Error handling requirement:business-process:add:', error.message);
      throw error;
    }
  });

  handleLanguageTask('requirement:bp-update', async (_event, data: any) => {
    try {
      const result = await updateBusinessProcess(_event, data);
      return result;
    } catch (error: any) {
      console.error('Error handling requirement:business-process:update:', error.message);
      throw error;
    }
  });
}
