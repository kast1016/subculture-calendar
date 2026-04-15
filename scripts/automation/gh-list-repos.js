const https = require('https');
const token = process.argv[2];
if (!token) {
  console.error('Usage: node gh-list-repos.js <GITHUB_TOKEN>');
  process.exit(1);
}
function get(url) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'node.js', Authorization: `token ${token}` } }, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    }).on('error', reject);
  });
}
(async () => {
  const user = await get('https://api.github.com/user');
  if (user.status !== 200) {
    console.error('Failed to authenticate GitHub token:', user.body);
    process.exit(1);
  }
  const info = JSON.parse(user.body);
  const reposRes = await get(`https://api.github.com/users/${info.login}/repos?per_page=100`);
  if (reposRes.status !== 200) {
    console.error('Failed to list repos:', reposRes.body);
    process.exit(1);
  }
  const repos = JSON.parse(reposRes.body);
  repos.forEach(repo => console.log(`${repo.full_name}`));
})();
