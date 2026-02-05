const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

const root = path.resolve(__dirname, '..');
const serverDir = path.join(root, 'server');
const clientDir = path.join(root, 'client');

const BACKEND_URL = 'http://localhost:3000';
const FRONTEND_URL = 'http://localhost:5173';
const OPEN_AFTER_MS = 3000;

function run(cmd, cwd, name) {
  const isWin = process.platform === 'win32';
  const child = spawn(isWin ? 'cmd' : 'sh', isWin ? ['/c', cmd] : ['-c', cmd], {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
  child.on('error', (err) => {
    console.error(`[${name}] error:`, err);
  });
  child.on('exit', (code) => {
    if (code !== 0 && code !== null) console.error(`[${name}] exited with ${code}`);
  });
  return child;
}

function waitFor(url, maxAttempts = 30) {
  return new Promise((resolve) => {
    let attempts = 0;
    const tryReq = () => {
      attempts++;
      const req = http.get(url, () => {
        resolve(true);
      });
      req.on('error', () => {
        if (attempts >= maxAttempts) {
          resolve(false);
          return;
        }
        setTimeout(tryReq, 500);
      });
    };
    tryReq();
  });
}

async function main() {
  console.log('Starting backend...');
  run('npm run dev', serverDir, 'server');

  console.log('Starting frontend...');
  run('npm run dev', clientDir, 'client');

  const backendUp = await waitFor(BACKEND_URL);
  const frontendUp = await waitFor(FRONTEND_URL);

  if (frontendUp) {
    console.log(`\nApp ready at ${FRONTEND_URL}`);
    setTimeout(() => {
      if (process.platform === 'win32') {
        spawn('cmd', ['/c', 'start', '', FRONTEND_URL], { stdio: 'inherit' });
      } else {
        const open = process.platform === 'darwin' ? 'open' : 'xdg-open';
        spawn(open, [FRONTEND_URL], { stdio: 'inherit' });
      }
    }, OPEN_AFTER_MS);
  } else {
    console.log('\nOpen the app manually at', FRONTEND_URL);
  }
}

main().catch(console.error);
