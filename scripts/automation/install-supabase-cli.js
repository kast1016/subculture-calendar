const https = require('https');
const fs = require('fs');
const path = require('path');

const releaseUrl = 'https://github.com/supabase/cli/releases/download/v2.90.0/supabase_windows_amd64.tar.gz';
const outDir = path.join(__dirname, '..', 'tools');
const archivePath = path.join(outDir, 'supabase_windows_amd64.tar.gz');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, { headers: { 'User-Agent': 'node.js' } }, (res) => {
      if (res.statusCode >= 400) return reject(new Error(`Download failed: ${res.statusCode}`));
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => {
      fs.unlinkSync(dest);
      reject(err);
    });
  });
}

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  console.log('Downloading Supabase CLI...');
  await download(releaseUrl, archivePath);
  console.log('Extracting Supabase CLI...');
  const { execSync } = require('child_process');
  execSync(`tar -xzf "${archivePath}" -C "${outDir}"`, { stdio: 'inherit' });
  fs.unlinkSync(archivePath);
  const exePath = path.join(outDir, 'supabase.exe');
  if (!fs.existsSync(exePath)) {
    throw new Error('supabase.exe 설치에 실패했습니다.');
  }
  console.log('Supabase CLI installed at', exePath);
})();
