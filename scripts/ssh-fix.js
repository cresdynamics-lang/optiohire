const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  console.log('Connected!');
  conn.exec('pm2 kill && cd /var/www/optiohire && rm -rf frontend/.next frontend/.next/standalone && make build && systemctl restart optiohire && systemctl status optiohire -n 10', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      console.log('Stream closed with code ' + code);
      conn.end();
    }).on('data', (data) => {
      process.stdout.write(data);
    }).stderr.on('data', (data) => {
      process.stderr.write(data);
    });
  });
}).on('error', (err) => {
  console.error('SSH Error:', err);
}).connect({
  host: '67.205.164.114',
  port: 22,
  username: 'root',
  password: 'Manage@1Optiohire',
  readyTimeout: 30000
});
