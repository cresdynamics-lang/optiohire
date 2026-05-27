const { Client } = require('ssh2');

const conn = new Client();

console.log('🔄 Connecting to 67.205.164.114...');

conn.on('ready', () => {
  console.log('🔑 SSH Connection Ready!');
  
  const cmd = `
    echo "=== Running Certbot ==="
    certbot --nginx -d optiohire.com -d www.optiohire.com --non-interactive --agree-tos -m admin@optiohire.com || echo "Certbot failed, check logs"
    echo "=== Nginx Test ==="
    nginx -t
    echo "=== Restart Nginx ==="
    systemctl reload nginx
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
