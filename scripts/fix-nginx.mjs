import { Client } from 'ssh2';

const HOST = '67.205.164.114';
const USER = 'root';
const PASSWORD = 'Manage@1Optiohire';

const conn = new Client();
conn.on('ready', () => {
  const nginxConfig = `
server {
    server_name optiohire.com www.optiohire.com;

    # Static assets
    location /_next/static/ {
        alias /root/optiohire/frontend/.next/static/;
        expires 365d;
        access_log off;
    }

    # Frontend Proxy
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    listen 443 ssl; # managed by Certbot
    ssl_certificate /etc/letsencrypt/live/optiohire.com-0001/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/optiohire.com-0001/privkey.pem; # managed by Certbot
    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem; # managed by Certbot
}

server {
    if ($host = www.optiohire.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    if ($host = optiohire.com) {
        return 301 https://$host$request_uri;
    } # managed by Certbot

    listen 80;
    server_name optiohire.com www.optiohire.com;
    return 404; # managed by Certbot
}
`;
  
  conn.exec(`cat << 'EOF' > /etc/nginx/sites-available/optiohire\n${nginxConfig}\nEOF\nnginx -t && systemctl reload nginx`, (err, stream) => {
    let out = '';
    stream.on('data', d => out += d);
    stream.stderr.on('data', d => out += d);
    stream.on('close', () => { console.log(out); conn.end(); });
  });
}).connect({ host: HOST, port: 22, username: USER, password: PASSWORD, readyTimeout: 15000 });
