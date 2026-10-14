// Run manually against the user's demo server; credentials are read locally and never printed.
const fs = require('node:fs');
const path = require('node:path');
const { ZentaoClient } = require('../build/integrations/zentao');

(async () => {
  const loginFile = process.env.ZENTAO_LOGIN_FILE;
  const baseUrl = process.env.ZENTAO_BASE_URL;
  if (!loginFile || !baseUrl) throw new Error('Set ZENTAO_LOGIN_FILE and ZENTAO_BASE_URL for the demo instance.');
  const login = fs.readFileSync(loginFile, 'utf8');
  const account = login.match(/管理员账号[:：]\s*(.+)/)?.[1].trim();
  const password = login.match(/管理员密码[:：]\s*(.+)/)?.[1].trim();
  if (!account || !password) throw new Error('Local login file format is unsupported.');
  const client = new ZentaoClient(baseUrl);
  await client.login(account, password);
  let resources = await client.resources();
  const productName = 'Ace PDA 宿舍管理 PoC';
  let product = resources.products.find(p => p.name === productName);
  if (!product) {
    const result = await client.request('POST', '/products', { name: productName, code: 'ace-pda-poc', type: 'normal', acl: 'private', PO: account, desc: 'Ace PDA 与禅道集成演示，使用虚构宿舍管理需求。' });
    const id = Number(result.id || result.product?.id);
    product = { id, name: productName };
    if (!id) throw new Error('Product creation was not confirmed. Check ZenTao before retrying.');
  }
  let execution = resources.executions.find(e => e.name === 'Ace PDA PoC 演示执行');
  if (!execution) {
    let projects = await client.list('/projects?browseType=all', 'projects');
    let project = projects.find(p => p.name === 'Ace PDA PoC 演示项目');
    if (!project) {
      const result = await client.request('POST', '/projects', { name: 'Ace PDA PoC 演示项目', code: 'ace-pda-poc', model: 'scrum', begin: '2026-10-14', end: '2026-11-14', products: [product.id], acl: 'private', PM: account });
      project = result.project || { id: result.id };
      if (!project.id) throw new Error('Project creation was not confirmed.');
    }
    const result = await client.request('POST', '/executions', { project: Number(project.id), name: 'Ace PDA PoC 演示执行', code: 'ace-pda-poc', begin: '2026-10-14', end: '2026-11-14', products: [product.id], acl: 'private', PM: account });
    execution = result.execution || { id: result.id };
    if (!execution.id) throw new Error('Execution creation was not confirmed.');
  }
  const config = { baseUrl: client.baseUrl, productId: Number(product.id), executionId: Number(execution.id), reviewer: account };
  const reportPath = path.join(__dirname, '../dist/zentao-check/demo-result.json');
  const report = fs.existsSync(reportPath) ? JSON.parse(fs.readFileSync(reportPath, 'utf8')) : { ...config };
  if (report.baseUrl !== config.baseUrl || report.productId !== config.productId || report.executionId !== config.executionId) throw new Error('Demo report belongs to a different destination.');
  const save = () => { fs.mkdirSync(path.dirname(reportPath), { recursive: true }); fs.writeFileSync(reportPath, JSON.stringify(report, null, 2)); };
  await client.validate(config);
  console.log('Demo connection validated', JSON.stringify(config));
  const result = await client.upsert(config, { kind: 'PRD', id: report.parent, title: '联调验证：需求与用例关联', description: '验证 Ace PDA 到禅道的需求、用户故事、任务、测试用例链路。' });
  report.parent = result.id; save();
  const child = await client.upsert(config, { kind: 'User Story', id: report.story, parentId: result.id, title: '联调验证：只能接受一份录取', description: '作为学生，我只能接受一份有效录取。\n验收：重复接受另一份录取时应拒绝。' });
  report.story = child.id; save();
  const task = await client.upsert(config, { kind: 'Task', id: report.task, parentId: child.id, title: '联调验证：实现唯一录取校验', description: '重复接受返回明确提示。' });
  report.task = task.id; save();
  const testcase = await client.upsert(config, { kind: 'Test Case', id: report.testcase, parentId: child.id, title: '联调验证：重复接受录取被拒绝', type: 'Functional', priority: 'High', preConditions: ['学生已接受一份有效录取'], steps: [{ action: '接受第二份录取', expectedResult: '拒绝操作，保留原录取' }] });
  report.testcase = testcase.id; save();
  await client.upsert(config, { kind: 'User Story', id: child.id, parentId: result.id, title: '联调验证：只能接受一份录取', description: '作为学生，我只能接受一份有效录取。\n验收：重复接受另一份录取时应拒绝。\n更新验证：保留工作项编号。' });
  const hierarchy = await client.hierarchy(config);
  const requirement = (await client.request('GET', `/stories/${child.id}`)).story;
  const caseDetail = (await client.request('GET', `/testcases/${testcase.id}`)).testcase;
  if (Number(requirement.parent) !== result.id || Number(caseDetail.story) !== child.id || !hierarchy.some(p => p.child.some(s => s.child.some(t => Number(t.pmoId) === task.id)))) throw new Error('Demo relationship check failed.');
  console.log('Live create/update/pull/case association passed', JSON.stringify(report));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
