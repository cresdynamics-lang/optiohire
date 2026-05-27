const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  const cmd = `
    echo "=== CSS Directory ==="
    ls -l /var/www/optiohire/frontend/.next/static/css/
    CSS_FILE=$(ls /var/www/optiohire/frontend/.next/static/css/ | grep .css | head -n 1)
    echo "CSS_FILE: $CSS_FILE"
    echo "=== Curl localhost:3000 ==="
    curl -I http://localhost:3000/_next/static/css/$CSS_FILE
    echo "=== Curl https ==="
    curl -I https://optiohire.com/_next/static/css/$CSS_FILE
  `;
  conn.exec(cmd, (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
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
