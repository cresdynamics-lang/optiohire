import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), 'src/services/emailService.ts');
let content = fs.readFileSync(file, 'utf8');

// The file has a broken end. Let's find "function escapeAttr"
const badEndIndex = content.indexOf('function escapeAttr(s: string): string {');

if (badEndIndex !== -1) {
  // Trim everything from escapeAttr downwards
  content = content.substring(0, badEndIndex);
  
  // Re-add the proper escapeAttr
  content += `function escapeAttr(s: string): string {
  return escapeHtml(s).replace(/'/g, '&#39;')
}
`;
  
  // Find where EmailService ends.
  // It ends right before "function escapeHtml"
  const escapeHtmlIndex = content.indexOf('function escapeHtml(s: string): string {');
  
  // Find the last '}' before escapeHtmlIndex
  const classEndIndex = content.lastIndexOf('}', escapeHtmlIndex);
  
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
      sourceAction: 'SupportTicketSeen'
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
      sourceAction: 'DemoSeen'
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
      sourceAction: 'AdminDemoAlert'
    });
  }
`;

  content = content.substring(0, classEndIndex) + newMethods + content.substring(classEndIndex);
  
  fs.writeFileSync(file, content);
  console.log('Fixed emailService.ts');
} else {
  console.log('Could not find escapeAttr');
}
