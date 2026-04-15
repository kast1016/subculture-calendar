const fs = require('fs');
const path = require('path');
const homedir = require('os').homedir();
const candidates = [
  path.join(homedir, '.config', 'gh'),
  path.join(homedir, 'AppData', 'Roaming', 'GitHub CLI'),
  path.join(homedir, '.config', 'git'),
  path.join(homedir, '.gitconfig')
];
for (const candidate of candidates) {
  if (fs.existsSync(candidate)) {
    const stat = fs.statSync(candidate);
    if (stat.isDirectory()) {
      console.log('DIR', candidate);
      const entries = fs.readdirSync(candidate).slice(0, 20);
      for (const entry of entries) console.log('  ', entry);
    } else {
      console.log('FILE', candidate);
    }
  }
}
