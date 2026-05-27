const { Client } = require('ssh2');

const conn = new Client();

console.log('🔄 Connecting to 67.205.164.114...');

conn.on('ready', () => {
  console.log('🔑 SSH Connection Ready!');
  
  const cmd = `
    echo "=== Current Dir ==="
    pwd
    echo "=== PM2 Status ==="
    pm2 status || echo "No PM2"
    echo "=== Systemctl OptioHire ==="
    systemctl status optiohire --no-pager || echo "No optiohire systemd service"
    echo "=== Optiohire Folders ==="
    find /opt /var /root /home -maxdepth 2 -name "*optiohire*" -type d 2>/dev/null || true
    echo "=== Nginx and Certbot ==="
    which nginx certbot || true
    nginx -v || true
  `;

  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('\n🚪 Connection closed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).connect({
  host: '67.205.164.114',
  port: 22,
  username: 'root',
  password: 'Manage@1Optiohire'
});
