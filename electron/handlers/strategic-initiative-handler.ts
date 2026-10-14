import { handleLanguageTask } from "./language-handler";
import { ipcMain } from "electron";
import { generateStrategicInitiative } from "../api/core/strategic-initiative";

export function setupSIHandlers() {
  handleLanguageTask("strategic-initiative:generate", async (_event, data: any) => {
    try {
      const result = await generateStrategicInitiative(_event, data);
      return result;
    } catch (error: any) {
      throw error;
    }
  });
}
