const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const supabaseUrl = process.argv[2] || process.env.SUPABASE_URL;
const serviceKey = process.argv[3] || process.env.SUPABASE_SERVICE_KEY;
const dbUrl = process.argv[4] || process.env.SUPABASE_DB_URL;
const dbPassword = process.argv[5] || process.env.SUPABASE_DB_PASSWORD;
const projectRef = process.env.SUPABASE_PROJECT_REF || (supabaseUrl ? (() => {
  try { return new URL(supabaseUrl).hostname.split('.')[0]; } catch (_) { return undefined; }
})() : undefined);
const windowsSupabasePath = path.join('tools', 'supabase.exe');
const supabaseCommand = process.platform === 'win32' && fs.existsSync(windowsSupabasePath)
  ? windowsSupabasePath
  : 'supabase';

if (!supabaseUrl || !serviceKey) {
  console.error('Usage: node apply-supabase-schema.js <SUPABASE_URL> <SUPABASE_SERVICE_KEY> [SUPABASE_DB_URL] [SUPABASE_DB_PASSWORD] [SUPABASE_PROJECT_REF]');
  process.exit(1);
}

try {
  const env = { ...process.env, SUPABASE_URL: supabaseUrl, SUPABASE_SERVICE_KEY: serviceKey };
  const args = ['db', 'query', '--file', 'supabase-schema.sql'];

  if (dbUrl) {
    console.log('Using SUPABASE_DB_URL for remote schema apply.');
    args.push('--db-url', dbUrl);
  } else if (dbPassword && projectRef) {
    const encodedPassword = encodeURIComponent(dbPassword);
    const inferredUrl = `postgresql://postgres:${encodedPassword}@db.${projectRef}.supabase.co:5432/postgres`;
    console.log(`Using inferred database URL for project ref '${projectRef}'.`);
    args.push('--db-url', inferredUrl);
  } else {
    console.warn('No SUPABASE_DB_URL or SUPABASE_DB_PASSWORD provided. Running against local/linked database if available.');
  }

  execFileSync(supabaseCommand, args, { env, stdio: ['ignore', 'inherit', 'inherit'] });
  console.log('Supabase schema applied successfully.');
} catch (error) {
  console.error('Supabase schema apply failed:', error.message || error);
  process.exit(1);
}
