import { ipcMain, IpcMainInvokeEvent } from 'electron';
import { getLanguageStatus, runLanguageTask } from '../services/language';

export function setupLanguageHandlers() {
  ipcMain.handle('language:status', () => getLanguageStatus());
}

export function handleLanguageTask(channel: string, listener: (event: IpcMainInvokeEvent, ...args: any[]) => any) {
  ipcMain.handle(channel, (event, ...args) => runLanguageTask(() => listener(event, ...args)));
}
