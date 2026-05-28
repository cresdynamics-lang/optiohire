import { Client } from 'ssh2';

const HOST = '67.205.164.114';
const USER = 'root';
const PASSWORD = 'Manage@1Optiohire';

const conn = new Client();
conn.on('ready', () => {
  conn.exec('cd /root/optiohire && export BACKEND_URL=http://localhost:3001 && export NEXT_PUBLIC_BACKEND_URL=http://localhost:3001 && pm2 delete optiohire-frontend && pm2 start "node frontend/.next/standalone/server.js" --name optiohire-frontend && pm2 save', (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 15000 });
