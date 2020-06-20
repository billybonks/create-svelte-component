const fs = require('fs');
const path = require('path');
const execa = require('execa');
const skipInstall = process.argv.includes('--no-install');

let packages = {
  "@rollup/plugin-multi-entry": "^3.0.1",
  "@rollup/plugin-node-resolve": "^8.0.0",
  "rollup-plugin-svelte": "^5.2.2",
}

const DETECT_TRAILING_WHITESPACE = /\s+$/;

const ROLLUP_CONFIG = ```
import svelte from 'rollup-plugin-svelte';

export default {
  input: [
    'src/component.svelte',
  ],
  plugins: [
    typescript({
      exclude: 'node_modules/**',
    }),
    svelte({
      include: 'src/ui/**/*.svelte',
      customElement: true,
    }),
    multi()
  ],

  output: {
    file: 'dist/bundle.js',
    format: 'iife',
    sourcemap: true,
  },
};
```

async function main() {
  await updatePackage();
  fs.writeFileSync('rollup.js', ROLLUP_CONFIG, { encoding: 'utf8' });
  execa('npm', ['install']);
  await installDependencies();
}

function isYarn() {
  return fs.existsSync('yarn.lock');
}

async function installDependencies() {
  if (labelsOnly || skipInstall) {
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
  Object.entries(packages).forEach(function(entry){
    pkg.devDependencies[entry[0]] = entry[1];
  });
  let updatedContents = JSON.stringify(pkg, null, 2);

  if (trailingWhitespace) {
    updatedContents += trailingWhitespace[0];
  }

  fs.writeFileSync('package.json', updatedContents, { encoding: 'utf8' });
}

if (require.main === module) {
  main();
}
