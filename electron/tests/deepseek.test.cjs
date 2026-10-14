const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { test } = require('node:test');

// Keep the real SDKs and HTTP transport; isolate telemetry from the desktop user's store.
const telemetryPath = require.resolve('../build/services/observability/observability.manager');
require.cache[telemetryPath] = {
  id: telemetryPath, filename: telemetryPath, loaded: true,
  exports: { ObservabilityManager: { getInstance: () => ({
    createTrace: () => ({ generation: () => {} }),
  }) } },
};
const { buildLLMHandler } = require('../build/services/llm');
const { buildLangchainModelProvider } = require('../build/services/llm/llm-langchain');
const { LLMUtils } = require('../build/services/llm/llm-utils');
const { buildGenerateStructuredResponseNode } = require('../build/agentic/react-agent/nodes');
const { HumanMessage, ToolMessage, AIMessage } = require('@langchain/core/messages');
const { langChainGuardrailsHandler, GuardrailsShouldBlock } = require('../build/guardrails');

test('DeepSeek works through both SDK paths, including structured output and tool calls', async (t) => {
  const requests = [];
  const server = http.createServer(async (req, res) => {
    let raw = '';
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    requests.push(body);
    assert.equal(req.url, '/chat/completions');
    assert.equal(req.headers.authorization, 'Bearer test-deepseek-key');
    if (body.messages.some(message => message.role === 'tool')) {
      assert.equal(body.messages.find(message => message.role === 'tool').tool_call_id, 'call_1');
      assert.equal(body.messages.find(message => message.role === 'assistant').tool_calls[0].function.name, 'lookup');
    }
    const tool = body.messages.some(message => message.role === 'tool') ? undefined : body.tools?.[0]?.function;
    const message = tool
      ? { role: 'assistant', content: null, tool_calls: [{
          id: 'call_1', type: 'function', function: {
            name: tool.name, arguments: JSON.stringify({ title: '中文需求' }),
          },
        }] }
      : { role: 'assistant', content: '连接成功' };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      id: 'test', object: 'chat.completion', created: 1, model: body.model,
      choices: [{ index: 0, message, finish_reason: tool ? 'tool_calls' : 'stop' }],
      usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
    }));
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  const baseURL = `http://127.0.0.1:${server.address().port}`;
  const { z } = require('zod');

  for (const model of ['deepseek-flash', 'deepseek-v4-pro']) {
    const config = { apiKey: ' test-deepseek-key ', model, baseUrl: 'https://untrusted.invalid' };
    const handler = buildLLMHandler('deepseek', config);
    assert.equal(handler.getModel().provider, 'deepseek');
    assert.equal(handler.client.baseURL, 'https://api.deepseek.com');
    assert.equal(handler.isValid(), true);
    handler.client.baseURL = baseURL;
    assert.equal(await handler.invoke([{ role: 'user', content: '你好' }]), '连接成功');

    const provider = buildLangchainModelProvider('deepseek', config);
    assert.equal(provider.getModel().provider, 'deepseek');
    const chat = provider.getChatModel();
    assert.equal(chat.clientConfig.baseURL, 'https://api.deepseek.com');
    chat.clientConfig.baseURL = baseURL;
    assert.equal((await chat.invoke('你好')).content, '连接成功');
    const schema = z.object({ title: z.string() });
    for (const format of [schema, { prompt: '生成中文需求', schema }]) {
      const generate = buildGenerateStructuredResponseNode(provider, format);
      const result = await generate({ messages: [new HumanMessage('生成需求')] });
      assert.deepEqual(result.structuredResponse, { title: '中文需求' });
    }
    const withTools = chat.bindTools([{ name: 'lookup', description: '查询', schema: z.object({ title: z.string() }) }]);
    const user = new HumanMessage('查询需求');
    const toolCall = await withTools.invoke([user]);
    assert.equal(toolCall.tool_calls[0].name, 'lookup');
    const answer = await withTools.invoke([user, toolCall, new ToolMessage({ content: '需求已找到', tool_call_id: 'call_1' })]);
    assert.equal(answer.content, '连接成功', JSON.stringify(requests.at(-1).messages));
  }
  assert.equal(requests.length, 12);
  for (const body of requests) {
    assert.equal(body.thinking.type, 'disabled');
    assert.notEqual(body.response_format?.type, 'json_schema');
  }
  for (const factory of [buildLLMHandler, buildLangchainModelProvider]) {
    assert.throws(() => factory('deepseek', { apiKey: '  ', model: 'deepseek-flash' }), /API 密钥/);
    assert.throws(() => factory('deepseek', { apiKey: 'test', model: '  ' }), /模型 ID/);
    assert.equal(factory('openai-native', { apiKey: 'test', model: 'gpt-4o' }).getModel().provider, 'openai');
  }
});

test('Chinese output instructions preserve the user prompt and existing chat history', async () => {
  const history = [{ assistant: '旧记录' }];
  const messages = await LLMUtils.prepareMessages('生成用户故事', history);
  assert.deepEqual(messages[0], { role: 'assistant', content: '旧记录' });
  assert.match(messages[1].content, /^生成用户故事/);
  assert.match(messages[1].content, /简体中文/);
  assert.match(messages[1].content, /JSON property names/);
  assert.match(messages[1].content, /takes precedence over any conflicting language request/);
  assert.deepEqual(history, [{ assistant: '旧记录' }]);
});

test('DeepSeek is discoverable and configurable in the actual UI constants', async () => {
  const ts = require('typescript');
  const vm = require('node:vm');
  const root = path.resolve(__dirname, '../../ui/src/app/constants');
  function load(file, dependencies = {}) {
    const source = fs.readFileSync(path.join(root, file), 'utf8');
    const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
    const exports = {};
    vm.runInNewContext(code, { exports, require: name => name.endsWith('i18n/translate')
      ? { t: (source, values) => require('../build/i18n/translate').translate(source, 'zh-CN', values) }
      : dependencies[name], fetch, console });
    return exports;
  }
  const models = load('llm.models.constants.ts');
  assert.equal(models.AvailableProviders.filter(p => p.key === 'deepseek').length, 1);
  assert.deepEqual(Array.from(await models.getProviderModels('deepseek')), ['deepseek-flash', 'deepseek-v4-pro']);
  const fields = (await load('llm-provider-config.ts', { './llm.models.constants': models }).getLLMProviderConfig('deepseek')).fields;
  assert.equal(fields.find(f => f.name === 'apiKey').type, 'password');
  assert.equal(fields.find(f => f.name === 'apiKey').required, true);
  assert.equal(fields.find(f => f.name === 'model').defaultValue, 'deepseek-flash');
});

test('Guardrails preserve tool metadata and image inputs while redacting and blocking', async () => {
  const image = { type: 'image_url', image_url: { url: 'https://example.com/image.png' } };
  const messages = [
    new HumanMessage({ content: [{ type: 'text', text: 'private' }, image] }),
    new AIMessage({ content: '', tool_calls: [{ name: 'lookup', id: 'call_1', args: {} }] }),
    new ToolMessage({ content: 'private', tool_call_id: 'call_1' }),
  ];
  const engine = { run: async input => ({
    messages: input.map(message => ({ ...message, content: message.content.replaceAll('private', '已脱敏') })),
    messagesWithGuardResult: [],
  }) };
  const result = await langChainGuardrailsHandler.invoke(input => input, {}, {}, [messages, {}], engine);
  assert.equal(result[0].content[0].text, '已脱敏');
  assert.deepEqual(result[0].content[1], image);
  assert.equal(result[1].tool_calls[0].id, 'call_1');
  assert.equal(result[2].tool_call_id, 'call_1');
  assert.equal(result[2].content, '已脱敏');
  assert.equal(messages[0].content[0].text, 'private');
  assert.equal(messages[2].content, 'private');
  const blocked = { run: async input => ({ messages: input, messagesWithGuardResult: [{ messages: [{ passed: false }] }] }) };
  let called = false;
  await assert.rejects(langChainGuardrailsHandler.invoke(() => { called = true; }, {}, {}, ['blocked', {}], blocked), GuardrailsShouldBlock);
  assert.equal(called, false);
});

test('Validation errors are Chinese and preserve bounds and valid inputs', () => {
  const { z } = require('zod');
  const { ZH_ERROR_MAP } = require('../build/constants/message.constants');
  const previous = z.getErrorMap();
  z.setErrorMap(ZH_ERROR_MAP);
  try {
    for (const [schema, input] of [[z.string(), undefined], [z.string(), 42], [z.string().email(), 'invalid'], [z.number().finite(), Infinity], [z.enum(['DRAFT', 'COMPLETE']), 'invalid']]) {
      const result = schema.safeParse(input);
      assert.equal(result.success, false);
      assert.match(result.error.issues[0].message, /[\u4e00-\u9fff]/);
    }
    assert.match(z.string().min(8).safeParse('a').error.issues[0].message, /8/);
    assert.match(z.number().max(10).safeParse(11).error.issues[0].message, /10/);
    assert.equal(z.string().parse('中文用户故事'), '中文用户故事');
    assert.equal(z.enum(['DRAFT', 'COMPLETE']).parse('DRAFT'), 'DRAFT');
  } finally { z.setErrorMap(previous); }
});

test('Document previews read both Chinese and existing English section headings', () => {
  const ts = require('typescript');
  const vm = require('node:vm');
  const ui = path.resolve(__dirname, '../../ui');
  const uiRequire = require('node:module').createRequire(path.join(ui, 'package.json'));
  const cache = {};
  function load(file) {
    if (cache[file]) return cache[file];
    const exports = cache[file] = {};
    const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
    vm.runInNewContext(code, { exports, console, require: name => name.startsWith('.') ? load(path.resolve(path.dirname(file), name + '.ts')) : uiRequire(name) });
    return exports;
  }
  const story = load(path.join(ui, 'src/app/utils/user-story.utils.ts')).processUserStoryContentForView;
  const task = load(path.join(ui, 'src/app/utils/task.utils.ts')).processTaskContentForView;
  for (const heading of ['Acceptance Criteria:', 'Acceptance Criteria：', '验收标准:', '验收标准：']) {
    for (const preview of [story, task]) {
      const result = preview(`说明\n\n## ${heading}\n\n必须能够登录`);
      assert.match(result, /必须能够登录/);
      assert.ok(result.includes(`#### ${heading}`));
    }
  }
  const prd = load(path.join(ui, 'src/app/utils/prd.utils.ts')).processPRDContentForView;
  for (const [screens, personas] of [['Screens:', 'Personas:'], ['界面：', '用户画像：']]) {
    const result = prd(`需求\n\n## ${screens}\n\n首页\n\n## ${personas}\n\n管理员`);
    assert.ok(result.includes(`#### ${screens}`));
    assert.ok(result.includes(`#### ${personas}`));
    assert.match(result, /首页/);
    assert.match(result, /管理员/);
  }
});

test('Chinese dates show the actual system offset, including half-hour zones and daylight saving', () => {
  const ts = require('typescript');
  const vm = require('node:vm');
  const file = path.resolve(__dirname, '../../ui/src/app/pipes/timezone-pipe.ts');
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, experimentalDecorators: true } }).outputText;
  const exports = {};
  vm.runInNewContext(code, { exports, require: () => ({ Pipe: () => cls => cls }), Intl, Date });
  const pipe = new exports.TimeZonePipe();
  const previous = process.env.TZ;
  try {
    for (const [zone, date, offset] of [
      ['Asia/Shanghai', '2026-10-13T00:00:00Z', 'GMT+8'],
      ['Asia/Kolkata', '2026-10-13T00:00:00Z', 'GMT+5:30'],
      ['America/Los_Angeles', '2026-07-13T00:00:00Z', 'GMT-7'],
      ['America/Los_Angeles', '2026-01-13T00:00:00Z', 'GMT-8'],
    ]) {
      process.env.TZ = zone;
      assert.ok(pipe.transform(date).includes(offset));
      assert.ok(!pipe.transform(date).includes('PT'));
    }
    assert.equal(pipe.transform(undefined), '');
    assert.equal(pipe.transform('invalid'), '时间无效');
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});
