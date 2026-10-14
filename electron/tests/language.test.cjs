const assert = require('node:assert/strict');
const { test } = require('node:test');
const { store } = require('../build/services/store');
const { setApplicationLanguage, getLanguageStatus, runLanguageTask } = require('../build/services/language');
const { getOutputLanguageInstructions } = require('../build/prompts/context/markdown-rules');
const { withOutputLanguage } = require('../build/services/llm/language-messages');
const { LLMHandler } = require('../build/services/llm/llm-handler');
const { contentGenerationManager } = require('../build/services/content-generation/content-generation.service');
const { translate } = require('../build/i18n/translate');
const { SystemMessage, HumanMessage } = require('@langchain/core/messages');
const catalog = require('../build/i18n/en.json');

const values = new Map([['language', 'zh-CN']]);
store.initialize({ get: key => values.get(key), set: (key, value) => values.set(key, value) });

test('language validation never changes settings on unsupported input', () => {
  setApplicationLanguage('zh-CN');
  for (const input of ['fr', null, { language: 'en' }]) assert.throws(() => setApplicationLanguage(input));
  assert.equal(values.get('language'), 'zh-CN');
});

test('language stays locked until every concurrent task has finished', async () => {
  let releaseFirst, releaseSecond;
  const first = runLanguageTask(() => new Promise(resolve => { releaseFirst = resolve; }));
  const second = runLanguageTask(() => new Promise(resolve => { releaseSecond = resolve; }));
  try {
    assert.equal(getLanguageStatus().busy, true);
    assert.throws(() => setApplicationLanguage('en'), /任务正在运行/);
    releaseFirst(); await first;
    assert.equal(getLanguageStatus().busy, true);
    assert.throws(() => setApplicationLanguage('en'));
    releaseSecond(); await second;
    assert.equal(getLanguageStatus().busy, false);
    setApplicationLanguage('en');
    assert.equal(values.get('language'), 'en');
  } finally {
    releaseFirst(); releaseSecond(); await Promise.all([first, second]);
  }
});

test('failed and aborted tasks release their language lock', async () => {
  for (const error of [new Error('model failed'), new DOMException('cancelled', 'AbortError')]) {
    await assert.rejects(runLanguageTask(async () => { throw error; }), error);
    assert.equal(getLanguageStatus().busy, false);
  }
});

test('saving generated files keeps the renderer lock after the backend completes', () => {
  contentGenerationManager.setContentGenerationStatus('US-1', 'test_case', true, 'renderer:7');
  contentGenerationManager.setContentGenerationStatus('US-1', 'test_case', true);
  assert.equal(contentGenerationManager.getActiveContentGenerationProcesses().length, 1);
  contentGenerationManager.setContentGenerationStatus('US-1', 'test_case', false);
  assert.equal(getLanguageStatus().busy, true);
  assert.throws(() => setApplicationLanguage('zh-CN'));
  contentGenerationManager.clearOwner('renderer:7');
  assert.equal(getLanguageStatus().busy, false);
  contentGenerationManager.clearAllContentGenerationProcesses();
});

test('both model paths use the chosen language without altering inputs, history or keys', async () => {
  class Probe extends LLMHandler {
    invokeModel(messages, systemPrompt) { this.request = { messages, systemPrompt }; return Promise.resolve('ok'); }
    getConfig(config) { return config; }
    getModel() { return { id: 'probe', provider: 'probe' }; }
    isValid() { return true; }
  }
  const source = [new SystemMessage('Existing system instructions'), new HumanMessage('请用中文回答。ID: US-1')];
  const original = JSON.stringify(source);
  for (const [language, expected] of [['en', 'English'], ['zh-CN', 'Simplified Chinese']]) {
    setApplicationLanguage(language);
    const instruction = getOutputLanguageInstructions();
    assert.match(instruction, new RegExp(`APPLICATION OUTPUT LANGUAGE: ${expected}`));
    assert.match(instruction, /takes precedence/);
    assert.match(instruction, /JSON property names/);
    const formatted = withOutputLanguage(source);
    assert.equal(formatted[1], source[1]);
    assert.ok(formatted[0].content.endsWith(instruction));
    assert.equal(JSON.stringify(source), original);
    assert.equal(withOutputLanguage('English input')[1].content, 'English input');
    const provider = new Probe();
    const messages = [{ role: 'user', content: '中文输入，保留 US-1 和 JSON 字段 title' }];
    await provider.invoke(messages, 'JSON only');
    assert.equal(provider.request.messages[0], messages[0]);
    assert.equal(messages.length, 1);
    assert.match(provider.request.messages.at(-1).content, new RegExp(`strictly in ${expected}`));
    assert.ok(provider.request.systemPrompt.endsWith(instruction));
    assert.ok(provider.request.systemPrompt.startsWith('JSON only'));
  }
});

test('catalog preserves placeholders and literal identifiers; formatting handles empty translations', () => {
  for (const [source, english] of Object.entries(catalog)) {
    const placeholders = text => (text.match(/\{\d+\}/g) || []).sort();
    assert.deepEqual(placeholders(english), placeholders(source), source);
  }
  assert.equal(translate(' 在 {0} 中打开 ', 'en', ['ZenTao']), ' Open in ZenTao ');
  assert.equal(translate('在 {0} 中打开', 'zh-CN', ['禅道']), '在 禅道 中打开');
  assert.equal(translate('中打开', 'en'), '');
  assert.equal(translate('US-1: 学生接受录取', 'en'), 'US-1: 学生接受录取');
});

test('story and task generation examples follow the current language on every call', () => {
  const factories = [
    require('../build/prompts/feature/evaluation/refine').refinePrompt,
    require('../build/prompts/feature/story/add').addUserStoryPrompt,
    require('../build/prompts/feature/story/update').updateStoryPrompt,
    require('../build/prompts/feature/task/create').createTaskPrompt,
    require('../build/prompts/feature/task/add').addTaskPrompt,
    require('../build/prompts/feature/task/update').updateTaskPrompt,
  ];
  const params = { name: 'Application', description: 'Business context', reqName: 'Requirement', reqDesc: 'Requirement context' };
  for (const [language, heading] of [['en', 'Acceptance Criteria:'], ['zh-CN', '验收标准：'], ['en', 'Acceptance Criteria:']]) {
    setApplicationLanguage(language);
    for (const factory of factories) {
      const prompt = factory(params);
      assert.ok(prompt.includes(`#### ${heading}`), factory.name);
      if (language === 'en') assert.doesNotMatch(prompt, /[\u4e00-\u9fff]/, factory.name);
    }
  }
});
