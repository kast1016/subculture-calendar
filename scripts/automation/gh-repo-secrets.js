const { execFileSync } = require('child_process');
const token = process.argv[2];
const supabaseUrl = process.argv[3];
const serviceKey = process.argv[4];
if (!token || !supabaseUrl || !serviceKey) {
  console.error('Usage: node gh-repo-secrets.js <GITHUB_TOKEN> <SUPABASE_URL> <SUPABASE_SERVICE_KEY>');
  process.exit(1);
}
const env = { ...process.env, GITHUB_TOKEN: token };
try {
  const listOutput = execFileSync('gh', ['repo', 'list', 'kast1016', '--limit', '100', '--json', 'name,owner,url'], { env, encoding: 'utf8' });
  const repos = JSON.parse(listOutput);
  const targetName = repos.find(r => r.name === 'subculture-calendar') ? 'subculture-calendar' : (repos[0] && repos[0].name);
  if (!targetName) {
    console.error('No repository found in GitHub account kast1016.');
    process.exit(1);
  }
  console.log('Using repository:', targetName);
  execFileSync('gh', ['repo', 'set-default', `kast1016/${targetName}`], { env, stdio: 'inherit' });
  execFileSync('gh', ['secret', 'set', 'SUPABASE_URL', '--body', supabaseUrl], { env, stdio: 'inherit' });
  execFileSync('gh', ['secret', 'set', 'SUPABASE_SERVICE_KEY', '--body', serviceKey], { env, stdio: 'inherit' });
  console.log('GitHub secrets set successfully for', targetName);
} catch (error) {
  console.error('GitHub secret setup failed:', error.message || error);
  process.exit(1);
}
