const { execFileSync } = require('child_process');
const token = process.argv[2] || process.env.GITHUB_TOKEN;
const supabaseUrl = process.argv[3] || process.env.SUPABASE_URL;
const serviceKey = process.argv[4] || process.env.SUPABASE_SERVICE_KEY;
const repoSlug = process.argv[5] || process.env.GITHUB_REPOSITORY || 'kast1016/subculture-calendar';

if (!token || !supabaseUrl || !serviceKey) {
  console.error('Usage: node set-github-secrets.js <GITHUB_TOKEN> <SUPABASE_URL> <SUPABASE_SERVICE_KEY> [GITHUB_REPOSITORY]');
  process.exit(1);
}

try {
  const env = { ...process.env, GITHUB_TOKEN: token, GH_TOKEN: token };
  console.log(`Using GitHub repository: ${repoSlug}`);
  execFileSync('gh', ['secret', 'set', 'SUPABASE_URL', '--repo', repoSlug, '--body', supabaseUrl], { env, stdio: ['ignore', 'inherit', 'inherit'] });
  execFileSync('gh', ['secret', 'set', 'SUPABASE_SERVICE_KEY', '--repo', repoSlug, '--body', serviceKey], { env, stdio: ['ignore', 'inherit', 'inherit'] });
  console.log('GitHub secrets set successfully.');
} catch (error) {
  console.error('GitHub secret setup failed:', error.message || error);
  process.exit(1);
}
