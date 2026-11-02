// Carrega scripts do site (caminhos relativos a site/) num contexto vm isolado.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const SITE = path.join(__dirname, '..');

function loadScripts(paths, ctx) {
  const context = ctx || vm.createContext({ console });
  if (!ctx) context.globalThis = context;
  for (const p of paths) {
    const code = fs.readFileSync(path.join(SITE, p), 'utf8');
    vm.runInContext(code, context, { filename: p });
  }
  return context;
}

function siteFileExists(p) {
  return fs.existsSync(path.join(SITE, p));
}

module.exports = { loadScripts, siteFileExists, SITE };
