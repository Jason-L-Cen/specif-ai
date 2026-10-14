const assert = require('node:assert/strict');
const { test } = require('node:test');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { utilityFunctionMap } = require('../build/file-system.utility');

test('bulk document reads preserve Chinese and emoji across UTF-8 chunk boundaries', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-pda-chunk-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const title = '中文需求标题';
  const prefix = JSON.stringify({ title }).slice(0, -1) + ',"requirement":"';
  for (const offset of [598, 599]) {
    const requirement = '.'.repeat(offset - Buffer.byteLength(prefix)) + '中🙂文边界\n'.repeat(160);
    const original = { title, requirement, pmoId: 'ZT-S12', linkedBRDIds: ['BRD01'] };
    const file = path.join(directory, `PRD${offset}-base.json`);
    fs.writeFileSync(file, JSON.stringify(original));
    const result = await utilityFunctionMap.readFileChunk({ path: file, filterString: 'base' });
    assert.equal(result.title, title);
    assert.equal(result.requirement, requirement);
    assert.equal(result.pmoId, original.pmoId);
    assert.deepEqual(result.linkedBRDIds, original.linkedBRDIds);
    assert.ok(!result.requirement.includes('\uFFFD'));
  }
});
