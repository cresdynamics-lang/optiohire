import * as fs from 'fs';
import * as path from 'path';

// 1. Update frontend profile-section.tsx handleSaveCompany
const profilePath = path.join(process.cwd(), '../frontend/src/components/dashboard/sections/profile-section.tsx');
let profileContent = fs.readFileSync(profilePath, 'utf8');

if (!profileContent.includes('companyLocation: formData.company_location,')) {
  profileContent = profileContent.replace(
    /companyLogoUrl: formData\.company_logo_url/,
    `companyLogoUrl: formData.company_logo_url,\n          companyLocation: formData.company_location`
  );
  
  // also add location into setCompany after save success
  profileContent = profileContent.replace(
    /company_logo_url: formData\.company_logo_url \|\| null\n\s*\}\)/,
    `company_logo_url: formData.company_logo_url || null,\n            company_location: formData.company_location\n          })`
  );
  
  fs.writeFileSync(profilePath, profileContent);
  console.log('Updated profile-section.tsx handleSaveCompany');
}

// 2. Update backend userController.ts updateCompanySettings
const userControllerPath = path.join(process.cwd(), 'src/api/userController.ts');
let userControllerContent = fs.readFileSync(userControllerPath, 'utf8');

if (!userControllerContent.includes('companyLocation')) {
  // Add to destructuring
  userControllerContent = userControllerContent.replace(
    /const \{ companyName, companyEmail, hrEmail, hiringManagerEmail, companyLogoUrl \} = req\.body/,
    `const { companyName, companyEmail, hrEmail, hiringManagerEmail, companyLogoUrl, companyLocation } = req.body`
  );

  // Add to SQL query
  userControllerContent = userControllerContent.replace(
    /hiring_manager_email = \$4,\n\s*company_logo_url = \$5\n\s*WHERE/,
    `hiring_manager_email = $4,\n        company_logo_url = $5,\n        company_location = $6\n      WHERE`
  );

  // Add to values array
  userControllerContent = userControllerContent.replace(
    /companyLogoUrl \|\| null,\n\s*user\.companyId\n\s*\]/,
    `companyLogoUrl || null,\n        companyLocation || null,\n        user.companyId\n      ]`
  );
  
  fs.writeFileSync(userControllerPath, userControllerContent);
  console.log('Updated userController.ts updateCompanySettings');
}
