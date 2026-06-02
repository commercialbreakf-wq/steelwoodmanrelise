const fs = require('fs');
const path = require('path');
const root = __dirname;
const skipDirs = new Set(['temp_backup', 'node_modules', '.git', 'scratch', 'docs', '.kiro', '.codex', '.cursor', '.gemini', '.openclaw', '.superpowers', '.agents']);
let count = 0;
function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    if (skipDirs.has(name)) continue;
    const full = path.join(dir, name);
    const st = fs.statSync(full);
    if (st.isDirectory()) { walk(full); continue; }
    if (!name.endsWith('.html')) continue;
    const before = fs.readFileSync(full, 'utf8');
    let after = before
      .replace(/(shared-ui\.js\?v=)\d+/g, '$110')
      .replace(/(theme\.js\?v=)\d+/g, '$11');
    if (after !== before) { fs.writeFileSync(full, after, 'utf8'); count++; }
  }
}
walk(root);
fs.writeFileSync(path.join(root, '_unify_result.txt'), 'Updated: ' + count + ' files\n', 'utf8');
