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
      stream.on('close', (code) => { resolve(output); }); // don't reject on non-zero, just collect
    });
  });
}

async function checkEnvs() {
  const conn = new Client();
  await new Promise((resolve, reject) => {
    conn.on('ready', resolve).on('error', reject)
      .connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 20000 });
  });
  console.log('✅ Connected!\n');

  try {
    console.log('══════════════════════════════════════════');
    console.log('  BACKEND .env  (/root/optiohire/backend/.env)');
    console.log('══════════════════════════════════════════');
    // Show all env vars but mask sensitive values
    await runRemote(conn, `awk -F= '
      /^#/ { print; next }
      /^$/ { print; next }
      /SECRET|PASSWORD|API_KEY|PASS|TOKEN|PRIVATE/ { print $1"=[REDACTED]"; next }
      { print }
    ' /root/optiohire/backend/.env`);

    console.log('\n══════════════════════════════════════════');
    console.log('  FRONTEND .env.local  (/root/optiohire/frontend/.env.local)');
    console.log('══════════════════════════════════════════');
    await runRemote(conn, `awk -F= '
      /^#/ { print; next }
      /^$/ { print; next }
      /SECRET|PASSWORD|API_KEY|PASS|TOKEN|PRIVATE/ { print $1"=[REDACTED]"; next }
      { print }
    ' /root/optiohire/frontend/.env.local 2>/dev/null || echo "FILE MISSING"`);

    console.log('\n══════════════════════════════════════════');
    console.log('  CRITICAL CHECKS');
    console.log('══════════════════════════════════════════');

    // Check DATABASE_URL is set and not placeholder
    await runRemote(conn, `
      echo "--- DATABASE_URL ---"
      grep "^DATABASE_URL=" /root/optiohire/backend/.env | sed 's/:[^:]*@/:[PASS]@/'

      echo ""
      echo "--- DB Connectivity ---"
      cd /root/optiohire/backend && node -e "
        const { Pool } = require('pg');
        require('dotenv').config();
        const p = new Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false });
        p.query('SELECT NOW()').then(r => { console.log('DB OK:', r.rows[0].now); p.end(); }).catch(e => { console.log('DB ERROR:', e.message); p.end(); });
      " 2>/dev/null || echo "Node DB check failed"

      echo ""
      echo "--- BACKEND_URL in frontend env ---"
      grep "BACKEND_URL" /root/optiohire/frontend/.env.local 2>/dev/null || echo "NOT SET"

      echo ""
      echo "--- NEXTAUTH settings ---"
      grep "NEXTAUTH" /root/optiohire/frontend/.env.local 2>/dev/null || echo "NOT SET"

      echo ""
      echo "--- Email service (RESEND/SMTP) ---"
      grep "^USE_RESEND\|^RESEND_API_KEY\|^SMTP_HOST" /root/optiohire/backend/.env | sed 's/=.*/=[CHECK]/'

      echo ""
      echo "--- JWT_SECRET set? ---"
      grep "^JWT_SECRET=" /root/optiohire/backend/.env | sed 's/=.*/=[REDACTED]/' | head -1

      echo ""
      echo "--- GROQ AI set? ---"
      grep "^GROQ_API_KEY=" /root/optiohire/backend/.env | sed 's/=.*/=[REDACTED]/' | head -1

      echo ""
      echo "--- PM2 Processes ---"
      pm2 list

      echo ""
      echo "--- Health check: backend ---"
      curl -s http://localhost:3001/health | head -c 500

      echo ""
      echo "--- Health check: frontend ---"
      curl -s -o /dev/null -w "HTTP %{http_code}" http://localhost:3000
    `);

  } catch (err) {
    console.error('\n❌ Failed:', err.message);
  } finally {
    conn.end();
  }
}

checkEnvs();
