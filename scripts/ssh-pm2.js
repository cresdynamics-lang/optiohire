const { Client } = require('ssh2');

const conn = new Client();

conn.on('ready', () => {
  conn.exec('pm2 list && systemctl status optiohire -n 20', (err, stream) => {
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
