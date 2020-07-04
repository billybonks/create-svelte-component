#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const execa = require('execa');
const skipInstall = process.argv.includes('--no-install');

let packages = {
  "@rollup/plugin-node-resolve": "^8.0.0",
  "rollup-plugin-svelte": "^5.2.2",
  "svelte": "^3.23.2"
}

const DETECT_TRAILING_WHITESPACE = /\s+$/;

const ROLLUP_CONFIG = `
import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';

export default {
  input: [
    'src/ui/my-component.svelte',
  ],
  plugins: [
    svelte({
      include: 'src/ui/**/*.svelte',
      customElement: true,
    }),
    resolve()
  ],

  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
};
`

const indexHtml = `
<html>
<body>
  <my-component />
</body>
<script src="dist/bundle.js"></script>
</html>
`

const svelteBaseTemplate = `hello world\n<svelte:options tag="my-component"/>`

async function main() {
  console.log('updating package')
  await updatePackage();
  fs.writeFileSync('rollup.config.js', ROLLUP_CONFIG, { encoding: 'utf8' });
  execa('npm', ['install']);
  await installDependencies();
}

function isYarn() {
  return fs.existsSync('yarn.lock');
}

async function installDependencies() {
  if (skipInstall) {
    return;
  }

  if (isYarn()) {
    await execa('yarn');
  } else {
    await execa('npm', ['install']);
  }
}

function updatePackage(){
  let contents = fs.readFileSync('package.json', { encoding: 'utf8' });
  let trailingWhitespace = DETECT_TRAILING_WHITESPACE.exec(contents);
  let pkg = JSON.parse(contents);
  if(!pkg.devDependencies) {
    pkg.devDependencies = {};
  }
  fs.mkdirSync('./src/ui', { recursive: true });
  Object.entries(packages).forEach(function(entry){
    pkg.devDependencies[entry[0]] = entry[1];
  });
  let updatedContents = JSON.stringify(pkg, null, 2);

  if (trailingWhitespace) {
    updatedContents += trailingWhitespace[0];
  }

  fs.writeFileSync('package.json', updatedContents, { encoding: 'utf8' });
  fs.writeFileSync('index.html', indexHtml, { encoding: 'utf8' });
  fs.writeFileSync('./src/ui/my-component.svelte', svelteBaseTemplate, { encoding: 'utf8' });
}

if (require.main === module) {
  main();
}
