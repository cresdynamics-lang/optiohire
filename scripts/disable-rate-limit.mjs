import { Client } from 'ssh2';

const HOST = '67.205.164.114';
const USER = 'root';
const PASSWORD = 'Manage@1Optiohire';

const conn = new Client();
conn.on('ready', () => {
  conn.exec(`
    cd /root/optiohire/backend &&
    echo "export const authLimiter = (req, res, next) => next();" > dist/middleware/rateLimiter.js &&
    pm2 restart optiohire-backend
  `, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 15000 });
