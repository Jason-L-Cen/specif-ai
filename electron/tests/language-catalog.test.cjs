const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const cp = require('node:child_process');
const ts = require('typescript');
const root = path.resolve(__dirname, '../..');
const catalog = require('../i18n/en.json');
const chinese = /[\u4e00-\u9fff]/;

test('every localized application string has an English translation', async () => {
  const files = cp.execFileSync('rg', ['--files', 'ui/src/app', 'ui/src/environments', 'electron'], { cwd: root, encoding: 'utf8' })
    .trim().split('\n').filter(file => /\.(ts|html)$/.test(file) && !/\.spec\.ts$|\/dist\/|\/build\//.test(file));
  const { parseTemplate, TmplAstText } = await import('../../ui/node_modules/@angular/compiler/fesm2022/compiler.mjs');
  const missing = new Set();
  const untranslated = [];
  function check(key, file) {
    if (chinese.test(key) && !Object.hasOwn(catalog, key.trim())) missing.add(`${file}: ${key.trim()}`);
  }
  function expression(node, file) {
    if (!node || typeof node !== 'object') return;
    if (node.constructor?.name === 'BindingPipe' && node.name === 'i18n') {
      function key(value) {
        if (!value || typeof value !== 'object') return;
        if (value.constructor?.name === 'LiteralPrimitive' && typeof value.value === 'string') check(value.value, file);
        else if (value.constructor?.name === 'Conditional') { key(value.trueExp); key(value.falseExp); }
      }
      key(node.exp);
    }
    for (const [name, value] of Object.entries(node)) {
      if (name === 'sourceSpan' || name === 'span') continue;
      if (Array.isArray(value)) value.forEach(child => expression(child, file));
      else if (value && typeof value === 'object') expression(value, file);
    }
  }
  for (const file of files) {
    const text = fs.readFileSync(path.join(root, file), 'utf8');
    if (file.endsWith('.ts')) {
      const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
      function visit(node) {
        if (ts.isCallExpression(node) && ['uiText', 'appText', 't'].includes(node.expression.getText(source)) && node.arguments[0] && ts.isStringLiteralLike(node.arguments[0])) check(node.arguments[0].text, file);
        ts.forEachChild(node, visit);
      }
      visit(source);
    } else {
      const parsed = parseTemplate(text, file);
      assert.equal(parsed.errors?.length || 0, 0, file);
      function visit(nodes) {
        for (const node of nodes) {
          if (node instanceof TmplAstText && chinese.test(node.value)) untranslated.push(`${file}:${node.sourceSpan.start.line + 1}: ${node.value.trim()}`);
          if (node.value?.ast) expression(node.value.ast, file);
          for (const attr of node.inputs || []) expression(attr.value.ast, file);
          for (const attr of node.attributes || []) if (chinese.test(attr.value) && !/^(id|name|class|value|for|formControlName|href|src)$/.test(attr.name)) untranslated.push(`${file}: ${attr.name}=${attr.value}`);
          if (node.children) visit(node.children);
        }
      }
      visit(parsed.nodes);
    }
  }
  assert.deepEqual(untranslated, [], 'Unlocalized interface text');
  assert.deepEqual([...missing], [], 'Missing English catalog keys');
});
