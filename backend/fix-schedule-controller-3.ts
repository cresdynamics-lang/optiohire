import * as fs from 'fs';
import * as path from 'path';

const scheduleCtrlFile = path.join(process.cwd(), 'src/api/scheduleInterviewController.ts');
let content = fs.readFileSync(scheduleCtrlFile, 'utf8');

// 1. Remove applicationId completely
content = content.replace(
  /\s*applicationId:[^,]*,/g,
  ''
);

// 2. Fix sendInterviewUpdated call on line 271
content = content.replace(
  /await emailService\.sendInterviewUpdated\(candidateEmail\)/g,
  'await emailService.sendInterviewUpdated(candidateEmail, hrEmail, new_time, jobTitle)'
);

// 3. Fix sendHRInterviewUpdated call on line 285
content = content.replace(
  /await emailService\.sendHRInterviewUpdated\(hrEmail\)/g,
  'await emailService.sendHRInterviewUpdated(hrEmail, candidateName, new_time, jobTitle)'
);

fs.writeFileSync(scheduleCtrlFile, content);
console.log('Fixed scheduleInterviewController.ts completely');
