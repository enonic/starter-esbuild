import {
  //exec,
  execSync
} from 'child_process';
import {
  mkdirSync,
  readFileSync,
  writeFileSync
} from 'fs';
import glob from 'glob';
import watch from 'node-watch';
import path from 'path';

const toStr = v => JSON.stringify(v, null, 4);
//console.log(`process.env:${toStr(process.env)}`);

//const NODE_ENV = 'development';
const NODE_ENV = 'production';

const SRC_DIR = 'src/main/resources';
const DST_DIR = 'build/resources/main';
const DST_ESBUILD_DIR = 'build/esbuild';
const ASSETS_PATH_GLOB_BRACE = '{site/assets,assets}';
const JS_EXTENSION_GLOB_BRACE = '*.{es,es6,mjs,jsx,flow,js}';
const ALL_JS_ASSETS_GLOB = `${SRC_DIR}/${ASSETS_PATH_GLOB_BRACE}/**/${JS_EXTENSION_GLOB_BRACE}`;

const ALL_JS_ASSETS_FILES = glob.sync(ALL_JS_ASSETS_GLOB);
//console.log(`ALL_JS_ASSETS_FILES:${toStr(ALL_JS_ASSETS_FILES)}`);

const IGNORE_FILES = ALL_JS_ASSETS_FILES;
const SHIMS = [
  `${SRC_DIR}/lib/nashorn/global.es`,
  `${SRC_DIR}/lib/nashorn/assign.js`
];
SHIMS.forEach((SHIM) => {
  IGNORE_FILES.push(SHIM)
});

const COMMAND_ARGS = [
  'npx',
  'esbuild',
  '--bundle',
  '--format=cjs',
  '--loader:.es=ts',
  //'--minify'
  `--outdir=${DST_ESBUILD_DIR}`,
  '--platform=browser',
  //'--strict', // Allow code bloat to support obscure edge case
  '--target=es2015'
];

const EXTERNALS = [
  '/lib/nashorn/ponyfills',
  '/lib/nashorn/polyfills',
  '/lib/xp/io',
  '/lib/xp/portal'
];
EXTERNALS.forEach((EXTERNAL) => {
  IGNORE_FILES.push(`${SRC_DIR}/${EXTERNAL}.es`);
  COMMAND_ARGS.push(`--external:${EXTERNAL}`);
});
//console.log(`IGNORE_FILES:${toStr(IGNORE_FILES)}`);

const SERVER_JS_FILES = glob.sync(`${SRC_DIR}/**/${JS_EXTENSION_GLOB_BRACE}`, {
	ignore: IGNORE_FILES
});
//console.log(`SERVER_JS_FILES:${toStr(SERVER_JS_FILES)}`);

/*SERVER_JS_FILES.forEach((srcFile) => {
  COMMAND_ARGS.push(srcFile);
});*/

const COMMAND = COMMAND_ARGS.join(' ');
//console.log(`COMMAND: ${COMMAND}`);

/*exec(COMMAND, (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    return;
  }

  // the *entire* stdout and stderr (buffered)
  console.log(`stdout: ${stdout}`);
  console.log(`stderr: ${stderr}`);
});*/

let stdout = '';
stdout += execSync(COMMAND + ' ' + SERVER_JS_FILES.join(' '));
if (stdout) {
  console.log(stdout);
}

const ESBUILT_FILES = glob.sync(`${DST_ESBUILD_DIR}/**/*.js`);
//console.log(`ESBUILT_FILES:${toStr(ESBUILT_FILES)}`);

ESBUILT_FILES.forEach((ESBUILT_FILE) => {
  //console.log(`ESBUILT_FILE:${toStr(ESBUILT_FILE)}`);
  const REL_PATH = ESBUILT_FILE.replace(DST_ESBUILD_DIR, DST_DIR);
  //console.log(`REL_PATH:${toStr(REL_PATH)}`);
  const DIRNAME = path.dirname(REL_PATH);
  //console.log(`DIRNAME:${toStr(DIRNAME)}`);
  mkdirSync(DIRNAME, { recursive: true });
  var output = [...SHIMS, ESBUILT_FILE].map((f) => {
    return readFileSync(f).toString();
  }).join('');
  writeFileSync(REL_PATH, output);
});

var myArgs = process.argv.slice(2);
//console.log(process.argv);
if (myArgs[0] === '--watch') {
  console.log('Watching for changes in ./');
  watch('./', { recursive: true }, function(evt, name) {
    if(SERVER_JS_FILES.includes(name)) {
      console.log('Re-transpiling %s', name);
      let stdoutWatch = '';
      stdoutWatch += execSync(COMMAND + ' ' + name);
      if (stdoutWatch) {
        console.log(stdoutWatch);
      }
    } else if (ESBUILT_FILES.includes(name)) {
      console.log('Re-concatinating %s', name);
      const REL_PATH = name.replace(DST_ESBUILD_DIR, DST_DIR);
      const DIRNAME = path.dirname(REL_PATH);
      mkdirSync(DIRNAME, { recursive: true });
      var output = [...SHIMS, name].map((f) => {
        return readFileSync(f).toString();
      }).join('');
      writeFileSync(REL_PATH, output);
    } else {
      console.log('Ignoring change to %s', name);
    }
  });
}
