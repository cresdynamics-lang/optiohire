import { Client } from 'ssh2';
const conn = new Client();
conn.on('ready', () => {
  conn.exec('echo "ggGU^Mo!uJu_p-hauU94" | sudo -S kill -9 566877 && echo "ggGU^Mo!uJu_p-hauU94" | sudo -S pm2 restart optiohire-frontend', (err, stream) => {
    if (err) throw err;
    stream.on('close', (code, signal) => {
      conn.end();
    }).on('data', (data) => {
      console.log('STDOUT: ' + data);
    }).stderr.on('data', (data) => {
      console.log('STDERR: ' + data);
    });
  });
}).on('error', (err) => {
  console.log('Client :: error', err);
}).connect({
  host: '49.13.75.61',
  port: 22,
  username: 'ops',
  password: 'ggGU^Mo!uJu_p-hauU94',
  readyTimeout: 10000
});
