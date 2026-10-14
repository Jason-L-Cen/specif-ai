const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const ts = require('typescript');
const { test } = require('node:test');

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
    const expected = isPackaged ? '/tmp/user-config/Specif AI' : '/tmp/dev-config';
    assert.equal(app.name, 'Ace PDA');
    assert.equal(paths.userData, expected);
    assert.equal(load('utils/file.ts', app).exports.getSpecifaiAppDataPath(), expected);
    assert.equal(load('mcp/utils.ts', app).exports.getGlobalMCPSettingsFilePath(),
      `${expected}/Settings/mcp/global_mcp_settings.json`);
    const theme = { appIcons: { mac: 'assets/icons/ace-pda.icns' } };
    assert.equal(startup.getIconPath(theme),
      `${isPackaged ? '/tmp/ace/resources' : '/tmp/ace'}/assets/icons/ace-pda.icns`);
  });
}
