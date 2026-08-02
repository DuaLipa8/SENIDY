const { spawn } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

function loadEnv(filePath) {
  const values = {};
  if (!fs.existsSync(filePath)) {
    return values;
  }

  const content = fs.readFileSync(filePath, 'utf8');
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const separatorIndex = line.indexOf('=');
    if (separatorIndex === -1) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    values[key] = value;
  }

  return values;
}

const workspaceDir = path.resolve(__dirname, '..');
const envFile = path.join(workspaceDir, '.env');
const envValues = loadEnv(envFile);

const accessToken = process.env.SUPABASE_ACCESS_TOKEN || envValues.SUPABASE_ACCESS_TOKEN || '';
const projectRef = process.env.SUPABASE_PROJECT_REF || envValues.SUPABASE_PROJECT_REF || '';

if (!accessToken && !projectRef) {
  console.error('[supabase-mcp] Missing configuration. Fill the values in .env or set them in your shell.');
  console.error('[supabase-mcp] Required: SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF');
  process.exit(2);
}

const args = ['-y', '@supabase/mcp-server-supabase@latest'];
if (accessToken) {
  args.push('--access-token', accessToken);
}
if (projectRef) {
  args.push('--project-ref', projectRef);
}

const command = process.platform === 'win32' ? 'cmd.exe' : 'sh';
const commandArgs = process.platform === 'win32'
  ? ['/d', '/c', 'npx.cmd', ...args]
  : ['-lc', `npx ${args.join(' ')}`];

const child = spawn(command, commandArgs, {
  cwd: workspaceDir,
  stdio: 'inherit',
  env: {
    ...process.env,
    ...envValues,
  },
});

child.on('error', (error) => {
  console.error(`[supabase-mcp] failed to start: ${error.message}`);
  process.exit(1);
});

child.on('exit', (code, signal) => {
  if (signal) {
    console.error(`[supabase-mcp] exited with signal ${signal}`);
  } else {
    console.error(`[supabase-mcp] exited with code ${code}`);
  }
  process.exit(code ?? 0);
});
