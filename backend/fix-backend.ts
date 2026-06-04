import * as fs from 'fs';
import * as path from 'path';

// 1. Fix scheduleInterviewController.ts
const scheduleCtrlFile = path.join(process.cwd(), 'src/api/scheduleInterviewController.ts');
let scheduleContent = fs.readFileSync(scheduleCtrlFile, 'utf8');

// Remove applicationId from sendInterviewScheduled parameters
scheduleContent = scheduleContent.replace(
  /applicationId: application_id,/g,
  ''
);

fs.writeFileSync(scheduleCtrlFile, scheduleContent);
console.log('Fixed scheduleInterviewController.ts');

// 2. Add sendInterviewUpdated and sendHRInterviewUpdated to emailService.ts
const emailServiceFile = path.join(process.cwd(), 'src/services/emailService.ts');
let emailContent = fs.readFileSync(emailServiceFile, 'utf8');

const missingMethods = `
  async sendInterviewUpdated(candidateEmail: string, hrEmail: string, meetingTime: string, jobTitle: string) {
    const html = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Interview Updated</h2>
        <p>Your interview for <strong>\${jobTitle}</strong> has been updated.</p>
        <p>New time: \${new Date(meetingTime).toLocaleString()}</p>
        <p>Please contact \${hrEmail} if you have any questions.</p>
      </div>
    \`;
    await this.sendEmail({
      to: candidateEmail,
      subject: 'Interview Updated',
      html,
      text: \`Your interview for \${jobTitle} has been updated to \${new Date(meetingTime).toLocaleString()}\`,
      emailType: 'InterviewUpdated'
    });
  }

  async sendHRInterviewUpdated(hrEmail: string, candidateName: string, meetingTime: string, jobTitle: string) {
    const html = \`
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Interview Updated</h2>
        <p>The interview with <strong>\${candidateName}</strong> for <strong>\${jobTitle}</strong> has been updated.</p>
        <p>New time: \${new Date(meetingTime).toLocaleString()}</p>
      </div>
    \`;
    await this.sendEmail({
      to: hrEmail,
      subject: 'Interview Updated',
      html,
      text: \`The interview with \${candidateName} for \${jobTitle} has been updated to \${new Date(meetingTime).toLocaleString()}\`,
      emailType: 'HRInterviewUpdated'
    });
  }
`;

const escapeHtmlIndex = emailContent.indexOf('function escapeHtml');
const classEndIndex = emailContent.lastIndexOf('}', escapeHtmlIndex);

if (classEndIndex !== -1) {
  emailContent = emailContent.substring(0, classEndIndex) + missingMethods + '\\n' + emailContent.substring(classEndIndex);
  fs.writeFileSync(emailServiceFile, emailContent);
  console.log('Added missing methods to emailService.ts');
} else {
  console.log('Could not find EmailService class end');
}
