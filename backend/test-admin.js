import fetch from 'node-fetch';

async function testUpdateUser() {
  const adminEmail = 'admin@optiohire.com';
  
  // We can bypass auth since the middleware allows x-admin-email in development
  // Let's get a list of users first
  const res = await fetch('http://localhost:3000/api/admin/users', {
    headers: { 'x-admin-email': adminEmail }
  });
  
  if (!res.ok) {
    console.error('Failed to fetch users:', await res.text());
    return;
  }
  
  const data = await res.json();
  const users = data.users;
  
  if (!users || users.length === 0) {
    console.log('No users found');
    return;
  }
  
  // Find a non-admin user
  const targetUser = users.find(u => u.role !== 'admin');
  if (!targetUser) {
    console.log('No non-admin user found to test on');
    return;
  }
  
  console.log(`Testing role change on user: ${targetUser.email} (current role: ${targetUser.role})`);
  
  // Try to update their role to 'hr'
  const patchRes = await fetch(`http://localhost:3000/api/admin/users/${targetUser.user_id}`, {
    method: 'PATCH',
    headers: { 
      'x-admin-email': adminEmail,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ role: 'hr' })
  });
  
  console.log('Update User Status:', patchRes.status);
  console.log('Update User Response:', await patchRes.text());
}

testUpdateUser();
