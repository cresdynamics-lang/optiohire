const fetch = require('node-fetch'); // Wait, let's use dynamic import or just standard global fetch if node version supports it.
// Node 18+ has global fetch. Let's use global fetch.

async function test() {
  console.log('Testing signin via API proxy...');
  try {
    const resProxy = await fetch('http://localhost:3000/api/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@optiohire.com', password: 'OptiohIre@Admin123' })
    });
    console.log('Proxy Response Status:', resProxy.status);
    const dataProxy = await resProxy.json().catch(err => ({ err: err.message }));
    console.log('Proxy Response Body:', JSON.stringify(dataProxy, null, 2));
  } catch (err) {
    console.error('Proxy Fetch Error:', err.message);
  }

  console.log('\nTesting signin directly to backend...');
  try {
    const resBackend = await fetch('https://api.optiohire.com/auth/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@optiohire.com', password: 'OptiohIre@Admin123' })
    });
    console.log('Backend Response Status:', resBackend.status);
    const dataBackend = await resBackend.json().catch(err => ({ err: err.message }));
    console.log('Backend Response Body:', JSON.stringify(dataBackend, null, 2));
  } catch (err) {
    console.error('Backend Fetch Error:', err.message);
  }
}

test();
