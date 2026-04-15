const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const outDir = path.join(root, 'www');
const filesToCopy = [
  'index.html',
  'download.html',
  'styles.css',
  'app.js',
  'supabaseClient.js',
  'events.json'
];

function copyFile(src, dest) {
  fs.copyFileSync(src, dest);
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function cleanDir(dir) {
  if (fs.existsSync(dir)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

function copyDir(srcDir, destDir) {
  if (!fs.existsSync(srcDir)) return;
  ensureDir(destDir);
  const entries = fs.readdirSync(srcDir, { withFileTypes: true });
  entries.forEach((entry) => {
    const srcPath = path.join(srcDir, entry.name);
    const destPath = path.join(destDir, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      copyFile(srcPath, destPath);
    }
  });
}

function build() {
  cleanDir(outDir);
  ensureDir(outDir);

  filesToCopy.forEach((fileName) => {
    const sourcePath = path.join(root, fileName);
    const targetPath = path.join(outDir, fileName);
    copyFile(sourcePath, targetPath);
  });

  copyDir(path.join(root, 'downloads'), path.join(outDir, 'downloads'));

  console.log(`Web build created in ${outDir}`);
}

build();
