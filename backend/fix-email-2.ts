import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), 'src/services/emailService.ts');
let content = fs.readFileSync(file, 'utf8');

const newMethods = `
  async sendSupportTicketSeen(userEmail: string, subject: string) {
    const html = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">We've seen your message</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">This is a quick note to let you know that our administrative team has seen your support ticket: <strong>\${subject}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">We are actively looking into it and will take the necessary actions. You will hear from us shortly.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    \`;
    await this.sendEmail({
      to: userEmail,
      subject: 'Your Support Ticket is Being Reviewed',
      html,
      text: \`Hello, this is a quick note to let you know that our administrative team has seen your support ticket: \${subject}. We are actively looking into it and will take the necessary actions.\`,
      emailType: 'SupportTicketSeen'
    });
  }

  async sendDemoSeen(userEmail: string, demoTime: string) {
    const html = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #f8fafc; border: 1px solid #e2e8f0;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h2 style="color: #1e293b; margin: 0;">Demo Confirmed</h2>
        </div>
        <div style="background-color: white; padding: 24px; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <p style="color: #334155; font-size: 16px; margin-top: 0;">Hello,</p>
          <p style="color: #334155; font-size: 16px;">Our team has been notified about your demo scheduled for <strong>\${new Date(demoTime).toLocaleString()}</strong>.</p>
          <p style="color: #334155; font-size: 16px;">We look forward to speaking with you! If you need to reschedule or have any questions beforehand, please reply to this email.</p>
          <p style="color: #334155; font-size: 16px; margin-bottom: 0;">Best regards,<br/>The OptioHire Team</p>
        </div>
      </div>
    \`;
    await this.sendEmail({
      to: userEmail,
      subject: 'OptioHire Demo Confirmed',
      html,
      text: \`Hello, our team has been notified about your demo scheduled for \${new Date(demoTime).toLocaleString()}.\`,
      emailType: 'DemoSeen'
    });
  }

  async sendDemoScheduledAdminAlert(adminEmail: string, hrInfo: any, demoTime: string, meetingLink?: string) {
    const meetingHtml = meetingLink ? \`<li><strong>Meeting Link:</strong> <a href="\${meetingLink}">\${meetingLink}</a></li>\` : '';
    const html = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border-radius: 8px; background-color: #fffbeb; border: 1px solid #fde68a;">
        <h2 style="color: #92400e; margin-top: 0;">New Demo Scheduled!</h2>
        <p style="color: #92400e;">A new demo has been booked.</p>
        <ul style="color: #92400e;">
          <li><strong>Email:</strong> \${hrInfo.email}</li>
          <li><strong>Company:</strong> \${hrInfo.companyName || 'N/A'}</li>
          <li><strong>Time:</strong> \${new Date(demoTime).toLocaleString()}</li>
          \${meetingHtml}
        </ul>
        <p style="color: #92400e; margin-bottom: 0;">Check the admin dashboard to mark it as seen.</p>
      </div>
    \`;
    await this.sendEmail({
      to: adminEmail,
      subject: 'New Demo Scheduled',
      html,
      text: \`A new demo has been booked by \${hrInfo.email} at \${new Date(demoTime).toLocaleString()}.\`,
      emailType: 'AdminDemoAlert'
    });
  }
`;

// Insert the methods right before the closing brace of EmailService
// Find the last occurrence of "\n}" before "function escapeHtml"
const escapeHtmlIndex = content.indexOf('function escapeHtml');
const classEndIndex = content.lastIndexOf('}', escapeHtmlIndex);

if (classEndIndex !== -1) {
  content = content.substring(0, classEndIndex) + newMethods + '\\n' + content.substring(classEndIndex);
  fs.writeFileSync(file, content);
  console.log('Appended methods cleanly to EmailService');
} else {
  console.log('Could not find EmailService class end');
}
