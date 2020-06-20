const fs = require('fs');
const path = require('path');
const Project = require('fixturify-project');
const BinScript = require('../bin/create-svelte-web-component');
const execa = require('execa');

const BIN_PATH = require.resolve('../bin/create-svelte-web-component');
const ROOT = process.cwd();
const PATH = process.env.PATH;

function exec(args=[]) {
  return execa(process.execPath, ['--unhandled-rejections=strict', BIN_PATH, ...args]);
}

describe('main binary', function () {
  let project;

  beforeEach(function () {
    project = new Project('some-thing-cool', '0.1.0');
    project.writeSync();
    process.chdir(path.join(project.root, project.name));
  });

  afterEach(function () {
    process.chdir(ROOT);
    process.env.PATH = PATH;
  });

  describe('package.json', function () {
    it('adds repository info when discoverable from `.git/config`', async function () {
      project.writeSync();

      await exec(['--no-install']);

      let pkg = JSON.parse(fs.readFileSync('package.json', { encoding: 'utf8' }));

      expect(pkg).toMatchInlineSnapshot(`
        Object {
          "dependencies": Object {},
          "devDependencies": Object {
            "@rollup/plugin-multi-entry": "^3.0.1",
            "@rollup/plugin-node-resolve": "^8.0.0",
            "rollup-plugin-svelte": "^5.2.2",
          },
          "keywords": Array [],
          "name": "some-thing-cool",
          "version": "0.1.0",
        }
      `);
    });
  });
});
