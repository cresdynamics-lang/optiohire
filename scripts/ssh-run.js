const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  conn.exec('cd /var/www/optiohire && git status && git log -n 5 --oneline && ls -la frontend/.next/standalone/.next/static/css', (err, stream) => {
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
