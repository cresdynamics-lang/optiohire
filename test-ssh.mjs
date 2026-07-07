import { Client } from 'ssh2';
const conn = new Client();
conn.on('ready', () => {
  console.log('Client :: ready');
  conn.end();
}).on('error', (err) => {
  console.log('Client :: error', err);
}).connect({
  host: '49.13.75.61',
  port: 22,
  username: 'root',
  password: '%c#Bx@D-+r2rof=0H3dY',
  readyTimeout: 10000
});
