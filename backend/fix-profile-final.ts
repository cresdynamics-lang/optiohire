import * as fs from 'fs';
import * as path from 'path';

const file = path.join(process.cwd(), '../frontend/src/components/dashboard/sections/profile-section.tsx');
let txt = fs.readFileSync(file, 'utf8');

// Replace company_logo_url with company_logo_url + company_location in setFormData
// Ensure we handle different line endings and spacing
txt = txt.replace(
  /company_logo_url: userData\.companyLogoUrl \|\| '',\r?\n\s*\}/g,
  `company_logo_url: userData.companyLogoUrl || '',\n            company_location: userData.companyLocation || '',\n          }`
);

fs.writeFileSync(file, txt);
console.log('Fixed profile-section location successfully');
