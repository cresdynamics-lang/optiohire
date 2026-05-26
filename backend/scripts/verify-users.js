import { query } from '../src/db/index.js';
async function update() {
  try {
    await query("UPDATE users SET email_verified = true, admin_approval_status = 'approved'");
    console.log('All users verified and approved!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}
update();
