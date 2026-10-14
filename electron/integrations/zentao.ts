import axios from "axios";
import { z } from "zod";

export const zentaoConfigSchema = z.object({
  baseUrl: z.string().max(2048).transform(normalizeZentaoUrl),
  productId: z.number().int().positive(),
  executionId: z.number().int().nonnegative().default(0),
  reviewer: z.string().trim().min(1).max(100),
});
const id = z.number().int().positive();
export const zentaoItemSchema = z.object({
  kind: z.enum(["PRD", "User Story", "Task", "Test Case"]),
  id: id.optional(),
  parentId: id.optional(),
  title: z.string().trim().min(1).max(255),
  description: z.string().max(200000).nullable().default(""),
  preConditions: z.array(z.string().max(10000)).max(200).optional(),
  postConditions: z.array(z.string().max(10000)).max(200).optional(),
  steps: z.array(z.object({ action: z.string().max(10000), expectedResult: z.string().max(10000) })).min(1).max(500).optional(),
  priority: z.enum(["High", "Medium", "Low"]).optional(),
  type: z.string().max(40).optional(),
});
export type ZentaoConfig = z.infer<typeof zentaoConfigSchema>;
export type ZentaoItem = z.infer<typeof zentaoItemSchema>;

export function normalizeZentaoUrl(value: string): string {
  let url: URL;
  try { url = new URL(value.trim()); }
  catch { throw new Error("请输入有效的禅道站点地址，例如 https://zentao.example.com。"); }
  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password || url.search || url.hash) {
    throw new Error("请输入不含账号、密码或查询参数的禅道站点地址。");
  }
  url.pathname = url.pathname.replace(/\/(?:index\.php|api\.php(?:\/v[12])?)\/?$/, "").replace(/\/+$/, "");
  return url.toString().replace(/\/$/, "");
}

function plainHtml(value: string | null | undefined): string {
  return (value || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;").replace(/\r?\n/g, "<br>");
}

export class ZentaoClient {
  readonly baseUrl: string;
  constructor(baseUrl: string, private token?: string) {
    this.baseUrl = normalizeZentaoUrl(baseUrl);
  }

  async request(method: "GET" | "POST" | "PUT", path: string, data?: unknown, version: "v1" | "v2" = "v2"): Promise<any> {
    try {
      const response = await axios.request({
        method, url: `${this.baseUrl}/api.php/${version}${path}`, data,
        headers: { "Content-Type": "application/json", ...(this.token ? { Token: this.token } : {}) },
        timeout: 20000, maxRedirects: 0, maxContentLength: 20 * 1024 * 1024,
      });
      if (!response.data || typeof response.data !== "object") throw new Error("站点未返回禅道 API 数据，请检查地址与版本。");
      if (response.data.status === "fail" || response.data.result === "fail") {
        if (path === "/users/login") throw new Error("禅道登录失败，请检查账号和密码。");
        throw new Error("禅道拒绝了操作，请检查权限、必填字段和需求评审设置。");
      }
      return response.data;
    } catch (error) {
      if (!axios.isAxiosError(error)) throw error;
      const status = error.response?.status;
      if (status === 401 || status === 403) throw new Error("禅道登录已过期或账号权限不足，请重新登录。");
      if (status && status >= 300 && status < 400) throw new Error("禅道地址发生跳转，请填写跳转后的站点地址。");
      if (status) throw new Error(`禅道请求失败（HTTP ${status}），请检查权限、必填字段与 API 版本。`);
      if (method === "POST" && path !== "/users/login") throw new Error("禅道创建结果未确认，请先在禅道核实，再决定是否重试，避免重复创建。");
      throw new Error("无法连接禅道，请检查服务器地址与网络。");
    }
  }

  async login(account: string, password: string): Promise<string> {
    const result = await this.request("POST", "/users/login", { account, password });
    if (typeof result.token !== "string" || !result.token) throw new Error("禅道登录失败，请检查账号和密码。");
    this.token = result.token;
    return result.token;
  }

  async list(path: string, key: string): Promise<any[]> {
    const items: any[] = [];
    for (let page = 1; ; page++) {
      const response = await this.request("GET", `${path}${path.includes("?") ? "&" : "?"}recPerPage=100&pageID=${page}`);
      if (!Array.isArray(response[key])) throw new Error("禅道列表格式不兼容，请使用支持 API v2 的版本。");
      items.push(...response[key]);
      const total = Number(response.pager?.recTotal);
      if (!response[key].length || (Number.isFinite(total) ? page * Number(response.pager?.recPerPage || 100) >= total : response[key].length < 100)) break;
      if (page >= 1000) throw new Error("禅道列表超过十万条，请缩小产品或执行范围。");
    }
    return items;
  }

  async resources(): Promise<{ products: any[]; executions: any[] }> {
    const [products, executions] = await Promise.all([
      this.list("/products?browseType=all&orderBy=id_asc", "products"),
      this.list("/executions?browseType=all&orderBy=rawID_asc", "executions"),
    ]);
    return {
      products: products.filter(p => Number(p.deleted) !== 1 && p.status !== "closed").map(p => ({ id: Number(p.id), name: p.name })),
      executions: executions.filter(e => Number(e.deleted) !== 1 && e.status !== "closed").map(e => ({ id: Number(e.id), name: e.name, project: Number(e.project) })),
    };
  }

  async validate(config: ZentaoConfig): Promise<void> {
    const { product } = await this.request("GET", `/products/${config.productId}`);
    if (!product || Number(product.deleted) === 1) throw new Error("所选禅道产品不存在或已删除。");
    if (config.executionId) {
      // API v2's execution view omits product links; the v1 view exposes them on 22.7.
      const execution = await this.request("GET", `/executions/${config.executionId}`, undefined, "v1");
      if (!execution || Number(execution.deleted) === 1) throw new Error("所选禅道执行不存在或已删除。");
      const linked = Object.values(execution.products || {}) as any[];
      if (!linked.some(p => Number(typeof p === "object" ? p.id : p) === config.productId)) {
        throw new Error("所选执行未关联该产品，请先在禅道中关联产品。");
      }
    }
  }

  async hierarchy(config: ZentaoConfig): Promise<any[]> {
    // shortcut: full-detail reads and O(n²) parent scans suit small products; index and page this hierarchy for products with thousands of requirements.
    const stories = await this.list(`/products/${config.productId}/stories?browseType=allstory&orderBy=id_asc`, "stories");
    const tasks = config.executionId ? await this.list(`/executions/${config.executionId}/tasks?browseType=all&orderBy=id_asc`, "tasks") : [];
    const all = new Map<number, any>();
    const collect = (s: any) => { all.set(Number(s.id), s); (s.children || []).forEach(collect); };
    stories.forEach(collect);
    const ticket = (s: any, kind: string, parent: number | null) => ({
      pmoId: String(s.id), pmoIssueType: kind === "Task" ? "task" : "story", pmoParentId: parent ? String(parent) : null,
      specifaiId: `${kind === "Task" ? "task" : "story"}-${s.id}`, reqId: String(s.id),
      specifaiType: kind, specifaiParentId: parent ? `story-${parent}` : null,
      title: s.title || s.name, description: s.spec || s.desc || "", child: [],
    });
    const roots = [...all.values()].filter(s => !Number(s.parent) || !all.has(Number(s.parent)));
    if (tasks.some(t => roots.some(s => Number(s.id) === Number(t.story)))) throw new Error("当前执行有任务直接关联父需求；此同步入口要求任务关联子需求，请先在禅道核对层级。");
    const result = [];
    for (const root of roots) {
      const prd: any = ticket(root, "PRD", null);
      const children = [...all.values()].filter(s => Number(s.parent) === Number(root.id));
      for (const child of children) {
        if ([...all.values()].some(s => Number(s.parent) === Number(child.id))) throw new Error("该产品含三层以上软件需求，当前同步仅支持父需求、子需求、任务三层。");
        const detail = (await this.request("GET", `/stories/${child.id}`)).story;
        const us: any = ticket(detail || child, "User Story", Number(root.id));
        us.child = tasks.filter(t => Number(t.story) === Number(child.id)).map(t => ticket(t, "Task", Number(child.id)));
        prd.child.push(us);
      }
      const detail = (await this.request("GET", `/stories/${root.id}`)).story;
      prd.description = detail?.spec || root.spec || "";
      result.push(prd);
    }
    return result;
  }

  async upsert(config: ZentaoConfig, input: ZentaoItem): Promise<{ id: number }> {
    const item = zentaoItemSchema.parse(input);
    const collection = item.kind === "Task" ? "tasks" : item.kind === "Test Case" ? "testcases" : "stories";
    if (item.kind !== "PRD" && !item.parentId) throw new Error("缺少父需求，请先同步产品需求和用户故事。");
    if (item.kind === "Task" && !config.executionId) throw new Error("同步任务前请在集成设置中选择禅道执行。");
    if (item.kind === "Test Case" && !item.steps?.length) throw new Error("测试用例至少需要一个操作步骤。");
    if (item.parentId) {
      const { story } = await this.request("GET", `/stories/${item.parentId}`);
      if (!story || Number(story.deleted) === 1 || Number(story.product) !== config.productId) throw new Error("父需求不属于当前禅道产品，已停止同步。");
    }
    let existing: any;
    if (item.id) {
      const response = await this.request("GET", `/${collection}/${item.id}`);
      existing = response.story || response.task || response.testcase;
      if (!existing || Number(existing.deleted) === 1 || (collection === "tasks" ? Number(existing.execution) !== config.executionId : Number(existing.product) !== config.productId)) {
        throw new Error("已关联工作项不在当前同步范围，已停止同步；请勿修改已绑定的产品或执行。");
      }
    }
    let payload: any;
    if (collection === "stories") {
      payload = { productID: config.productId, title: item.title, spec: plainHtml(item.description), parent: item.parentId || 0, pri: 3, category: "feature", estimate: 0, status: "draft", reviewer: [config.reviewer] };
      if (existing) {
        // ZenTao requires the change action to version a requirement's description.
        if ((existing.spec || "") !== payload.spec) await this.request("PUT", `/stories/${item.id}/change`, { title: item.title, spec: payload.spec, verify: existing.verify || "", reviewer: [config.reviewer] });
        await this.request("PUT", `/stories/${item.id}`, { title: item.title, parent: payload.parent, reviewer: [config.reviewer] });
        return { id: item.id! };
      }
    } else if (collection === "tasks") {
      const linked = await this.list(`/executions/${config.executionId}/stories?browseType=allstory`, "stories");
      if (!linked.some(s => Number(s.id) === item.parentId)) await this.request("POST", `/executions/${config.executionId}/stories/link`, { stories: [item.parentId] });
      payload = { executionID: config.executionId, name: item.title, desc: plainHtml(item.description), story: item.parentId, type: "devel", estimate: 0, assignedTo: "" };
    } else {
      const steps = item.steps!;
      payload = { productID: config.productId, title: item.title, story: item.parentId, pri: item.priority === "High" ? 1 : item.priority === "Low" ? 4 : 3,
        type: ({ Integration: "interface", Performance: "performance", Security: "security" } as Record<string, string>)[item.type || ""] || "feature",
        precondition: plainHtml([item.description ? `用例说明：\n${item.description}` : "", item.preConditions?.length ? `前置条件：\n${item.preConditions.join("\n")}` : "",
          item.postConditions?.length ? `后置条件（验收）：\n${item.postConditions.join("\n")}` : ""].filter(Boolean).join("\n\n")),
        steps: steps.map(s => plainHtml(s.action)), expects: steps.map(s => plainHtml(s.expectedResult)), stepType: steps.map(() => "step") };
    }
    const response = await this.request(item.id ? "PUT" : "POST", item.id ? `/${collection}/${item.id}` : `/${collection}`, payload);
    const resultId = item.id || Number(response.id || response.story?.id || response.task?.id || response.testcase?.id);
    if (!Number.isSafeInteger(resultId) || resultId <= 0) throw new Error("禅道未返回工作项编号，请在禅道确认创建结果后重试，避免重复创建。");
    return { id: resultId };
  }
}
