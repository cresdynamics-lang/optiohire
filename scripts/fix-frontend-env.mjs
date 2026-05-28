import { Client } from 'ssh2';

const HOST = '67.205.164.114';
const USER = 'root';
const PASSWORD = 'Manage@1Optiohire';

function runRemote(conn, command) {
  return new Promise((resolve, reject) => {
    let output = '';
    let errorOutput = '';
    conn.exec(command, (err, stream) => {
      if (err) return reject(err);
      stream
        .on('data', (data) => { const t = data.toString(); process.stdout.write(t); output += t; })
        .stderr.on('data', (data) => { const t = data.toString(); process.stderr.write(t); errorOutput += t; });
      stream.on('close', (code) => {
        if (code !== 0) reject(new Error(`Command failed (exit ${code}): ${command}\n${errorOutput}`));
        else resolve(output);
      });
    });
  });
}

async function fixEnv() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject)
      .connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 20000 });
  });
  console.log('\n✅ Connected!\n');

  try {
    // 1. Read existing backend env to get relevant vars
    console.log('=== Reading backend .env ===');
    const envContent = await runRemote(conn, 'cat /root/optiohire/backend/.env');

    // 2. Write frontend .env.local with the critical BACKEND_URL pointing to local backend
    console.log('\n=== Writing frontend .env.local ===');
    await runRemote(conn, `cat > /root/optiohire/frontend/.env.local << 'ENVEOF'
BACKEND_URL=http://localhost:3001
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
NEXTAUTH_URL=https://optiohire.com
NEXTAUTH_SECRET=Qp1zBfvTdo7wjiK5BxRhj8VzqLKHZuj6y349jdARSJE=
NEXT_PUBLIC_APP_URL=https://optiohire.com
NODE_ENV=production
ENVEOF`);

    console.log('\n=== Verifying .env.local ===');
    await runRemote(conn, 'cat /root/optiohire/frontend/.env.local');

    // 3. Rebuild frontend with the correct env
    console.log('\n=== Rebuilding frontend with correct env ===');
    await runRemote(conn, 'cd /root/optiohire/frontend && npm run build 2>&1 | tail -30');

    // 4. Restart frontend PM2 process
    console.log('\n=== Restarting frontend ===');
    await runRemote(conn, 'pm2 restart optiohire-frontend --update-env && pm2 save');

    // 5. Final status
    console.log('\n=== PM2 Status ===');
    await runRemote(conn, 'pm2 list');

    console.log('\n🎉 Frontend env fixed and restarted!');
  } catch (err) {
    console.error('\n❌ Failed:', err.message);
  } finally {
    conn.end();
  }
}

fixEnv();
