import { Client } from 'ssh2';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PRIVATE_KEY = readFileSync(resolve(__dirname, 'optiohire_server_key'), 'utf8');

function runRemote(conn, command, timeoutMs = 60000) {
  return new Promise((resolve, reject) => {
    let output = '';
    const timer = setTimeout(() => reject(new Error(`Timeout: ${command}`)), timeoutMs);
    conn.exec(command, (err, stream) => {
      if (err) { clearTimeout(timer); return reject(err); }
      stream.on('data', d => output += d.toString());
      stream.stderr.on('data', d => output += d.toString());
      stream.on('close', () => { clearTimeout(timer); resolve(output); });
    });
  });
}

async function main() {
  const conn = new Client();
  await new Promise((res, rej) =>
    conn.on('ready', res).on('error', rej)
      .connect({ host: '49.13.75.61', port: 22, username: 'root', privateKey: PRIVATE_KEY, readyTimeout: 30000 })
  );

  console.log('=== ADDING DATABASE_URL TO FRONTEND ===');
  const dbUrl = await runRemote(conn, `grep DATABASE_URL /var/www/optiohire/backend/.env`);
  await runRemote(conn, `echo "${dbUrl.trim()}" >> /var/www/optiohire/frontend/.env.production`);
  console.log(await runRemote(conn, `cat /var/www/optiohire/frontend/.env.production | grep DATABASE_URL`));
  
  console.log('=== RESTARTING FRONTEND ===');
  console.log(await runRemote(conn, `cd /var/www/optiohire/frontend && pm2 restart optiohire-frontend`));

  conn.end();
}

main().catch(console.error);
