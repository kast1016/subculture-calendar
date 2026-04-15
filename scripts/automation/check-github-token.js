const https = require('https');
const token = process.argv[2];
if (!token) {
  console.error('Usage: node check-github-token.js <token>');
  process.exit(1);
}
function get(path) {
  return new Promise((resolve, reject) => {
    https.get({ hostname: 'api.github.com', path, headers: { 'User-Agent': 'node.js', Authorization: `token ${token}` } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}
(async () => {
  const user = await get('/user');
  console.log(user.status);
  if (user.status === 200) {
    const info = JSON.parse(user.body);
    console.log('LOGIN', info.login);
  } else {
    console.log('FAILED', user.body);
    process.exit(1);
  }
})();
