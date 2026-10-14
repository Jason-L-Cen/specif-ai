import Store from 'electron-store';
import { store as storeService } from "../services/store"; 
import { ipcMain } from 'electron';
import { setApplicationLanguage } from '../services/language';

export function setupStore() {
  try {
    const store = new Store();
    storeService.initialize(store);

    ipcMain.handle("store-get", async (_event, key: string) => {
      return storeService.get(key);
    });

    ipcMain.handle("store-set", async (_event, key: string, value: any) => {
      if (key === 'language') {
        setApplicationLanguage(value);
        return true;
      }
      storeService.set(key, value);
      return true;
    });

    ipcMain.handle("removeStoreValue", async (_event, key: string) => {
      if (key === 'language') {
        setApplicationLanguage('zh-CN');
        return true;
      }
      storeService.delete(key);
      return true;
    });
    
    return true;
  } catch (error) {
    console.error('Failed to initialize electron-store:', error);
    return false;
  }
}
