import { ipcMain, safeStorage } from "electron";
import { z } from "zod";
import { store } from "../services/store";
import { normalizeZentaoUrl, ZentaoClient, zentaoConfigSchema, zentaoItemSchema } from "../integrations/zentao";

const projectIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/);
type Session = { baseUrl: string; token: string };
const sessions = new Map<string, Session>();
const canRemember = () => safeStorage.isEncryptionAvailable() && safeStorage.getSelectedStorageBackend?.() !== "basic_text";

export function setupZentaoHandlers() {
  ipcMain.handle("zentao:login", async (_event, params: unknown) => {
    try {
      const input = z.object({ projectId: projectIdSchema, baseUrl: z.string().max(2048), account: z.string().trim().min(1).max(100), password: z.string().min(1).max(1000) }).parse(params);
      const client = new ZentaoClient(input.baseUrl);
      const token = await client.login(input.account, input.password);
      const resources = await client.resources();
      sessions.set(input.projectId, { baseUrl: client.baseUrl, token });
      if (canRemember()) {
        store.set(`zentao-token-${input.projectId}`, { baseUrl: client.baseUrl, token: safeStorage.encryptString(token).toString("base64") });
      }
      return { baseUrl: client.baseUrl, ...resources, remembered: canRemember() };
    } catch (error) {
      return { error: error instanceof z.ZodError ? "禅道连接信息格式有误。" : error instanceof Error ? error.message : "禅道登录失败。" };
    }
  });
  ipcMain.handle("zentao:disconnect", async (_event, projectId: unknown) => {
    const id = projectIdSchema.parse(projectId);
    sessions.delete(id);
    store.delete(`zentao-token-${id}`);
    return true;
  });
  ipcMain.handle("zentao:operation", async (_event, params: unknown) => {
    try {
      const input = z.object({ projectId: projectIdSchema, operation: z.enum(["resources", "validate", "hierarchy", "upsert"]), baseUrl: z.string().max(2048), config: zentaoConfigSchema.optional(), item: zentaoItemSchema.optional() }).parse(params);
      let session = sessions.get(input.projectId);
      if (!session && canRemember()) {
        const saved = store.get<{ baseUrl: string; token: string }>(`zentao-token-${input.projectId}`);
        if (saved) session = { baseUrl: saved.baseUrl, token: safeStorage.decryptString(Buffer.from(saved.token, "base64")) };
      }
      if (!session || session.baseUrl !== normalizeZentaoUrl(input.baseUrl)) throw new Error("请先登录当前禅道服务器。");
      const client = new ZentaoClient(session.baseUrl, session.token);
      if (input.operation === "resources") return await client.resources();
      const config = zentaoConfigSchema.parse(input.config);
      if (config.baseUrl !== session.baseUrl) throw new Error("禅道服务器地址与登录地址不一致。");
      if (input.operation === "validate") { await client.validate(config); return { isValid: true }; }
      if (input.operation === "hierarchy") return { tickets: await client.hierarchy(config) };
      return await client.upsert(config, zentaoItemSchema.parse(input.item));
    } catch (error) {
      return { error: error instanceof z.ZodError ? "禅道同步参数格式有误。" : error instanceof Error ? error.message : "禅道操作失败。" };
    }
  });
}
