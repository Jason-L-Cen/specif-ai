const assert = require('node:assert/strict');
const http = require('node:http');
const Module = require('node:module');
const { test } = require('node:test');
const { ZentaoClient, normalizeZentaoUrl, zentaoConfigSchema } = require('../build/integrations/zentao');

async function server(t, handler) {
  const requests = [];
  const srv = http.createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const input = { method: req.method, url: req.url, token: req.headers.token, data: raw ? JSON.parse(raw) : undefined };
    requests.push(input);
    const output = await handler(input);
    res.writeHead(output?.http || 200, { 'Content-Type': 'application/json', ...output?.headers });
    res.end(JSON.stringify(output?.body ?? output));
  });
  await new Promise(resolve => srv.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => srv.close(resolve)));
  return { url: `http://127.0.0.1:${srv.address().port}/zentao`, requests };
}

test('Config accepts remote/subdirectory servers and rejects credential-bearing or non-HTTP URLs', () => {
  assert.equal(normalizeZentaoUrl('https://example.com/zentao/api.php/v2/'), 'https://example.com/zentao');
  for (const bad of ['不是地址', 'file:///tmp/zentao', 'http://admin:password@example.com', 'http://example.com/?token=secret', 'https://example.com/#x']) assert.throws(() => normalizeZentaoUrl(bad));
  assert.throws(() => normalizeZentaoUrl('不是地址'), /请输入有效/);
  assert.equal(zentaoConfigSchema.parse({ baseUrl: 'https://example.com', productId: 1, reviewer: 'user' }).executionId, 0);
  assert.throws(() => zentaoConfigSchema.parse({ baseUrl: 'https://example.com', productId: -1 }));
});

test('Login and pagination use API v2 at the configured root and keep token in headers', async t => {
  const { url, requests } = await server(t, input => {
    if (input.url.endsWith('/users/login')) return { status: 'success', token: 'private-token' };
    const u = new URL(input.url, 'http://mock');
    if (u.pathname.endsWith('/executions')) return { status: 'success', executions: [], pager: { recTotal: 0 } };
    const page = Number(u.searchParams.get('pageID'));
    return { status: 'success', products: Array.from({ length: page === 1 ? 100 : 1 }, (_, i) => ({ id: i + (page - 1) * 100 + 1, name: `产品${i}` })), pager: { recTotal: 101 } };
  });
  const client = new ZentaoClient(url);
  await client.login('user', 'password');
  const result = await client.resources();
  assert.equal(result.products.length, 101);
  assert.equal(requests[0].token, undefined);
  assert.ok(requests.slice(1).every(r => r.token === 'private-token' && !r.url.includes('private-token') && !r.data));
});

test('Redirects and authorization failures return safe messages without credentials', async t => {
  const { url } = await server(t, input => input.url.includes('redirect') ? { http: 302, headers: { Location: 'http://other.example' }, body: {} } : { http: 401, body: { message: 'password private-token' } });
  const client = new ZentaoClient(url, 'private-token');
  await assert.rejects(client.request('GET', '/redirect'), /跳转/);
  await assert.rejects(client.request('GET', '/products'), e => e.message.includes('登录') && !/password|private-token/.test(e.message));
});

test('Requirements, tasks and cases preserve native parent/story references and safe text', async t => {
  const { url, requests } = await server(t, input => {
    if (input.url.endsWith('/stories/10')) return { story: { id: 10, product: 1 } };
    if (input.url.includes('/executions/2/stories?')) return { stories: [], pager: { recTotal: 0 } };
    if (input.url.endsWith('/stories/link')) return { status: 'success' };
    return { status: 'success', id: 20 };
  });
  const client = new ZentaoClient(url, 'private-token'), config = { baseUrl: url, productId: 1, executionId: 2, reviewer: 'user' };
  await client.upsert(config, { kind: 'User Story', parentId: 10, title: '申请', description: '<script>alert(1)</script>\n条件' });
  await client.upsert(config, { kind: 'Task', parentId: 10, title: '开发', description: '验收标准' });
  await client.upsert(config, { kind: 'Test Case', parentId: 10, title: '权限测试', priority: 'High', type: 'Security', steps: [{ action: '访问他人申请', expectedResult: '禁止访问' }] });
  const story = requests.find(r => r.url.endsWith('/stories') && r.method === 'POST');
  assert.equal(story.data.parent, 10);
  assert.match(story.data.spec, /&lt;script&gt;/);
  const task = requests.find(r => r.url.endsWith('/tasks'));
  assert.equal(task.data.story, 10); assert.equal(task.data.executionID, 2);
  const testcase = requests.find(r => r.url.endsWith('/testcases'));
  assert.equal(testcase.data.story, 10); assert.deepEqual(testcase.data.expects, ['禁止访问']); assert.equal(testcase.data.type, 'security');
  assert.ok(requests.find(r => r.url.endsWith('/stories/link')));
});

test('Updates existing IDs and stops before writing items outside the selected scope', async t => {
  const { url, requests } = await server(t, input => input.url.endsWith('/stories/5') && input.method === 'GET'
    ? { story: { id: 5, product: 1, spec: '旧描述', verify: '保留验收条件' } } : input.method === 'GET' ? { story: { id: 9, product: 99 } } : { status: 'success' });
  const client = new ZentaoClient(url, 'token'), config = { baseUrl: url, productId: 1, executionId: 2, reviewer: 'user' };
  assert.deepEqual(await client.upsert(config, { kind: 'PRD', id: 5, title: '新标题', description: '新描述' }), { id: 5 });
  assert.ok(requests.some(r => r.url.endsWith('/stories/5/change') && r.method === 'PUT'));
  const metadataEdit = requests.find(r => r.url.endsWith('/stories/5') && r.method === 'PUT');
  assert.equal(metadataEdit.data.spec, '新描述');
  assert.equal(metadataEdit.data.verify, '保留验收条件');
  assert.ok(!requests.some(r => r.method === 'POST'));
  await assert.rejects(client.upsert(config, { kind: 'User Story', parentId: 9, title: '不可跨产品' }), /不属于/);
  await assert.rejects(client.upsert({ ...config, executionId: 0 }, { kind: 'Task', parentId: 5, title: '缺少执行' }), /选择禅道执行/);
  assert.ok(!requests.some(r => r.url.endsWith('/tasks')));
});

test('Pull hierarchy includes child requirements and execution tasks with full descriptions', async t => {
  const { url } = await server(t, input => {
    if (input.url.includes('/products/1/stories?')) return { stories: [{ id: 1, title: '分配', parent: 0, children: [{ id: 2, title: '录取', parent: 1 }] }], pager: { recTotal: 1 } };
    if (input.url.includes('/executions/3/tasks?')) return { tasks: [{ id: 5, name: '开发录取', story: 2, desc: '验证唯一录取' }], pager: { recTotal: 1 } };
    if (input.url.endsWith('/stories/1')) return { story: { id: 1, spec: '完整产品描述' } };
    return { story: { id: 2, title: '录取', spec: '完整用户故事描述' } };
  });
  const hierarchy = await new ZentaoClient(url, 'token').hierarchy({ baseUrl: url, productId: 1, executionId: 3, reviewer: 'user' });
  assert.equal(hierarchy[0].description, '完整产品描述');
  assert.equal(hierarchy[0].child[0].pmoParentId, '1');
  assert.equal(hierarchy[0].child[0].child[0].pmoParentId, '2');
});

test('IPC keeps passwords out of storage/returns and binds encrypted tokens to the login server', async t => {
  const { url } = await server(t, input => input.url.endsWith('/users/login') ? { status: 'success', token: 'secret-session' }
    : input.url.includes('/products?') ? { products: [], pager: { recTotal: 0 } } : { executions: [], pager: { recTotal: 0 } });
  const handlers = new Map(), saved = new Map();
  const originalLoad = Module._load;
  Module._load = function(name, ...args) {
    if (name === 'electron') return { ipcMain: { handle: (channel, cb) => handlers.set(channel, cb) }, safeStorage: {
      isEncryptionAvailable: () => true, getSelectedStorageBackend: () => 'keychain',
      encryptString: token => Buffer.from(`encrypted:${token}`), decryptString: value => value.toString().replace(/^encrypted:/, ''),
    } };
    if (name === '../services/store') return { store: { get: key => saved.get(key), set: (key, value) => saved.set(key, value), delete: key => saved.delete(key) } };
    return originalLoad.call(this, name, ...args);
  };
  try { require('../build/handlers/zentao-handler').setupZentaoHandlers(); } finally { Module._load = originalLoad; }
  const result = await handlers.get('zentao:login')(null, { projectId: 'project-1', baseUrl: url, account: 'user', password: 'never-save-password' });
  assert.equal(result.remembered, true);
  const visible = JSON.stringify([result, [...saved.values()]]);
  assert.ok(!visible.includes('never-save-password') && !visible.includes('secret-session'));
  const otherServer = await handlers.get('zentao:operation')(null, { projectId: 'project-1', baseUrl: 'http://other.example', operation: 'resources' });
  assert.match(otherServer.error, /先登录/);
  await handlers.get('zentao:disconnect')(null, 'project-1');
  assert.equal(saved.size, 0);
  const disconnected = await handlers.get('zentao:operation')(null, { projectId: 'project-1', baseUrl: url, operation: 'resources' });
  assert.match(disconnected.error, /先登录/);
});
