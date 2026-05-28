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
        .on('data', (data) => {
          const text = data.toString();
          process.stdout.write(text);
          output += text;
        })
        .stderr.on('data', (data) => {
          const text = data.toString();
          process.stderr.write(text);
          errorOutput += text;
        });
      stream.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Command failed (exit ${code}): ${command}\n${errorOutput}`));
        } else {
          resolve(output);
        }
      });
    });
  });
}

async function deploy() {
  const conn = new Client();

  await new Promise((resolve, reject) => {
    conn
      .on('ready', resolve)
      .on('error', reject)
      .connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 20000 });
  });

  console.log('\n✅ Connected to server!\n');

  try {
    // --- 0. Set up Swap File to prevent OOM during build ---
    console.log('\n💾 === CHECKING SWAP FILE ===');
    const swapCheck = await runRemote(conn, 'swapon --show');
    if (!swapCheck.includes('/swapfile')) {
      console.log('Creating 2GB swap file...');
      await runRemote(conn, `
        fallocate -l 2G /swapfile || true
        chmod 600 /swapfile || true
        mkswap /swapfile || true
        swapon /swapfile || true
        echo '/swapfile none swap sw 0 0' >> /etc/fstab || true
      `);
    } else {
      console.log('Swap file already exists.');
    }

    // --- 1. Check server info ---
    console.log('\n📋 === SERVER INFO ===');
    await runRemote(conn, 'uname -a && node -v && npm -v && git --version');

    // --- 2. Check if optiohire repo already exists ---
    console.log('\n🔍 === CHECKING APP ===');
    const appCheck = await runRemote(conn, 'ls /root/optiohire 2>/dev/null && echo "EXISTS" || echo "NOT_FOUND"');

    if (appCheck.includes('NOT_FOUND')) {
      // Clone the repo
      console.log('\n📥 === CLONING REPO ===');
      await runRemote(conn, 'cd /root && git clone https://github.com/cresdynamics-lang/optiohire.git');
    } else {
      // Pull latest
      console.log('\n⬇️  === PULLING LATEST CODE ===');
      await runRemote(conn, 'cd /root/optiohire && git checkout main && git pull origin main');
    }

    // --- 3. Copy ENV files from old location if needed ---
    console.log('\n🔐 === COPYING ENV FILES ===');
    await runRemote(conn, `
      cp -n /var/www/optiohire/backend/.env /root/optiohire/backend/.env 2>/dev/null || true
      cp -n /var/www/optiohire/frontend/.env.local /root/optiohire/frontend/.env.local 2>/dev/null || true
    `);
    
    await runRemote(conn, 'ls /root/optiohire/backend/.env 2>/dev/null && echo "BACKEND_ENV_OK" || echo "BACKEND_ENV_MISSING"');
    await runRemote(conn, 'ls /root/optiohire/frontend/.env.local 2>/dev/null && echo "FRONTEND_ENV_OK" || echo "FRONTEND_ENV_MISSING"');

    // --- 4. Install & Build Backend ---
    console.log('\n📦 === BUILDING BACKEND ===');
    await runRemote(conn, 'cd /root/optiohire/backend && npm ci && npm run build');

    // --- 5. Install & Build Frontend ---
    console.log('\n🎨 === BUILDING FRONTEND ===');
    await runRemote(conn, 'cd /root/optiohire/frontend && npm ci --legacy-peer-deps && npm run build');

    // --- 6. Check PM2 ---
    console.log('\n🔄 === CHECKING PM2 ===');
    const pm2Check = await runRemote(conn, 'which pm2 2>/dev/null && echo "PM2_OK" || echo "PM2_MISSING"');

    if (pm2Check.includes('PM2_MISSING')) {
      console.log('Installing PM2...');
      await runRemote(conn, 'npm install -g pm2');
    }

    // --- 7. Restart PM2 processes ---
    console.log('\n🚀 === RESTARTING SERVICES ===');
    await runRemote(conn, `
      cd /root/optiohire
      pm2 delete optiohire-backend 2>/dev/null || true
      pm2 delete optiohire-frontend 2>/dev/null || true
      pm2 start backend/dist/server.js --name optiohire-backend --env production
      pm2 start "node frontend/.next/standalone/server.js" --name optiohire-frontend --env production
      pm2 save
      pm2 startup systemd -u root --hp /root 2>/dev/null || true
    `);

    // --- 8. Check Nginx ---
    console.log('\n🌐 === CHECKING NGINX ===');
    const nginxCheck = await runRemote(conn, 'which nginx 2>/dev/null && echo "NGINX_OK" || echo "NGINX_MISSING"');

    if (nginxCheck.includes('NGINX_MISSING')) {
      console.log('Installing Nginx...');
      await runRemote(conn, 'apt-get update -y && DEBIAN_FRONTEND=noninteractive apt-get install -y nginx');
    }

    // --- 9. Configure Nginx for optiohire.com ---
    console.log('\n⚙️  === CONFIGURING NGINX ===');
    const nginxConfig = `
server {
    listen 80;
    server_name optiohire.com www.optiohire.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
`;

    await runRemote(conn, `cat > /etc/nginx/sites-available/optiohire << 'NGINX_EOF'
${nginxConfig}
NGINX_EOF`);

    await runRemote(conn, `
      ln -sf /etc/nginx/sites-available/optiohire /etc/nginx/sites-enabled/optiohire
      rm -f /etc/nginx/sites-enabled/default
      nginx -t && systemctl reload nginx
    `);

    // --- 10. Install Certbot & get SSL ---
    console.log('\n🔒 === SETTING UP SSL ===');
    await runRemote(conn, 'which certbot 2>/dev/null || (DEBIAN_FRONTEND=noninteractive apt-get install -y certbot python3-certbot-nginx)');

    // Try to get SSL certificate
    await runRemote(conn, `
      certbot --nginx -d optiohire.com -d www.optiohire.com \\
        --non-interactive --agree-tos --email admin@optiohire.com \\
        --redirect 2>&1 || echo "SSL_CERT_PENDING - may need DNS to propagate first"
    `);

    // --- 11. Final status ---
    console.log('\n✅ === DEPLOYMENT STATUS ===');
    await runRemote(conn, 'pm2 list');
    await runRemote(conn, 'systemctl status nginx --no-pager -l');

    console.log('\n🎉 DEPLOYMENT COMPLETE!');
    console.log('Frontend: http://optiohire.com');
    console.log('Backend API: http://optiohire.com/api/');

  } catch (err) {
    console.error('\n❌ Deployment failed:', err.message);
  } finally {
    conn.end();
  }
}

deploy();
