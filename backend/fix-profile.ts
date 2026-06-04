import * as fs from 'fs';
import * as path from 'path';

const profilePath = path.join(process.cwd(), '../frontend/src/components/dashboard/sections/profile-section.tsx');
let content = fs.readFileSync(profilePath, 'utf8');

// There are two places with setFormData({ ... }) inside loadCompanyData / refreshCompanyFromBackend that need fixing
// Place 1: in the fallback try block of loadCompanyData
content = content.replace(
  /hiring_manager_email: userData\.hiring_manager_email \|\| userData\.hiringManagerEmail \|\| '',\n\s*company_logo_url: userData\.companyLogoUrl \|\| '',\n\s*\}/g,
  `hiring_manager_email: userData.hiring_manager_email || userData.hiringManagerEmail || '',\n            company_logo_url: userData.companyLogoUrl || '',\n            company_location: userData.companyLocation || '',\n          }`
);

fs.writeFileSync(profilePath, content);
console.log('Fixed profile-section.tsx missing company_location property in setFormData');
