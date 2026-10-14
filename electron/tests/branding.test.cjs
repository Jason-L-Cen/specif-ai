const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');
const os = require('node:os');
const { spawnSync } = require('node:child_process');

function load(file, app, platform = 'darwin') {
  const context = {
    exports: {}, __dirname: '/tmp/ace/build', console,
    process: { platform, resourcesPath: '/tmp/ace/resources' },
    require(name) {
      if (name === 'electron') return { app };
      if (name === 'zod') return { z: { setErrorMap() {} } };
      if (name === 'path' || name.startsWith('node:')) return require(name);
      return {};
    },
  };
  const source = fs.readFileSync(path.join(__dirname, '..', file), 'utf8');
  vm.runInNewContext(ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, context);
  return context;
}

for (const isPackaged of [true, false]) {
  test(`Ace PDA preserves ${isPackaged ? 'installed' : 'development'} settings and MCP paths`, () => {
    const paths = { appData: '/tmp/user-config', userData: '/tmp/dev-config' };
    const app = {
      isPackaged, name: 'Ace PDA', commandLine: { appendSwitch() {} },
      getPath: name => paths[name],
      setPath: (name, value) => { paths[name] = value; },
      setName: name => { app.name = name; },
      whenReady: () => ({ then() {} }),
    };
    const startup = load('app.ts', app);
    const expected = isPackaged ? path.join('/tmp/user-config', 'Specif AI') : '/tmp/dev-config';
    assert.equal(app.name, 'Ace PDA');
    assert.equal(paths.userData, expected);
    assert.equal(load('utils/file.ts', app).exports.getSpecifaiAppDataPath(), expected);
    assert.equal(load('mcp/utils.ts', app).exports.getGlobalMCPSettingsFilePath(),
      `${expected}/Settings/mcp/global_mcp_settings.json`);
    const theme = { appIcons: { mac: 'assets/icons/ace-pda.icns' } };
    assert.equal(startup.getIconPath(theme), path.join(
      isPackaged ? '/tmp/ace/resources' : path.resolve('/tmp/ace/build', '..'),
      'assets/icons/ace-pda.icns'));
  });
}

test('release upload preserves Ace PDA filenames used by updater metadata', { skip: process.platform === 'win32' }, () => {
  const workflow = fs.readFileSync(path.join(__dirname, '../../.github/workflows/create-release.yml'), 'utf8');
  const script = workflow.split('        run: |\n')[1].split('\n      - name: Modify Changelog')[0]
    .replaceAll('${{ inputs.version }}', '2.8.2-zh.7')
    .split('\n').map(line => line.replace(/^          /, '')).join('\n');
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'ace-release-'));
  try {
    const files = [
      'windows/Ace PDA Setup 2.8.2-zh.7.exe',
      'windows/Ace PDA Setup 2.8.2-zh.7.exe.blockmap',
      'windows/latest.yml',
      'macos-arm64/Ace PDA-2.8.2-zh.7-arm64-mac.zip',
      'macos-arm64/Ace PDA-2.8.2-zh.7-arm64.dmg',
      'macos-arm64/latest-mac.yml',
      'macos-intel/Ace PDA-2.8.2-zh.7-mac.zip',
    ];
    for (const file of files) {
      const target = path.join(directory, 'release-assets', file);
      fs.mkdirSync(path.dirname(target), { recursive: true });
      fs.writeFileSync(target, file);
    }
    const run = spawnSync('bash', ['-e', '-c', script], { cwd: directory, encoding: 'utf8' });
    assert.equal(run.status, 0, run.stderr);
    for (const file of files) {
      assert.equal(fs.readFileSync(path.join(directory, 'renamed-assets', path.basename(file)), 'utf8'), file);
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true });
  }
});
