const https = require('https');

https.get('https://optiohire.com', res => {
  let data = '';
  res.on('data', d => data += d);
  res.on('end', () => {
    const cssLinks = data.match(/href="[^"]+\.css[^"]*"/g);
    console.log(cssLinks || 'No CSS found');
  });
});
