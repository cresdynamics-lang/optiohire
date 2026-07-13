# Vite frontend PM2 config — run after `npm run build`
module.exports = {
  apps: [
    {
      name: 'optiohire-vite',
      cwd: '/var/www/optiohire/frontend-vite',
      script: 'npx',
      args: 'serve dist -s -l 5173',
      env: {
        NODE_ENV: 'production',
      },
      max_restarts: 10,
      restart_delay: 3000,
    },
  ],
}
