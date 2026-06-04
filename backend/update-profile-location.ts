import * as fs from 'fs';
import * as path from 'path';

const profilePath = path.join(process.cwd(), '../frontend/src/components/dashboard/sections/profile-section.tsx');
let content = fs.readFileSync(profilePath, 'utf8');

// 1. Add to CompanyData interface
if (!content.includes('company_location?: string')) {
  content = content.replace(
    /company_logo_url\?: string \| null/,
    `company_logo_url?: string | null\n  company_location?: string`
  );
}

// 2. Add to formData state
if (!content.includes("company_location: '',")) {
  content = content.replace(
    /company_logo_url: '',/,
    `company_logo_url: '',\n    company_location: '',`
  );
}

// 3. Populate from user data
if (!content.includes("company_location: (user as any).companyLocation || '',")) {
  content = content.replace(
    /company_logo_url: \(user as any\)\.companyLogoUrl \|\| null/,
    `company_logo_url: (user as any).companyLogoUrl || null,\n        company_location: (user as any).companyLocation || ''`
  );
  
  content = content.replace(
    /company_logo_url: \(user as any\)\.companyLogoUrl \|\| ''/,
    `company_logo_url: (user as any).companyLogoUrl || '',\n        company_location: (user as any).companyLocation || ''`
  );
}

// 4. Also fetch from Supabase if needed (fallback block)
if (!content.includes("company_location: data.company_location || '',")) {
  content = content.replace(
    /company_logo_url: data\.company_logo_url \|\| '',/,
    `company_logo_url: data.company_logo_url || '',\n            company_location: data.company_location || '',`
  );
}

// 5. Add UI Input field right before "Upload Logo" or "Company Email"
const locationUI = `
                <div className="space-y-2">
                  <Label htmlFor="company_location" className="text-gray-700 dark:text-gray-300">Company Location</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      id="company_location"
                      value={formData.company_location}
                      onChange={(e) => setFormData({ ...formData, company_location: e.target.value })}
                      disabled={!isEditingCompany}
                      placeholder="e.g. San Francisco, CA"
                      className="pl-10 border-gray-200 dark:border-gray-800 disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
`;

if (!content.includes('id="company_location"')) {
  content = content.replace(
    /<div className="space-y-2">\s*<Label htmlFor="company_email"/,
    `${locationUI}\n                <div className="space-y-2">\n                  <Label htmlFor="company_email"`
  );
  
  // Add to the non-edit display section
  const displayLocationUI = `
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                      <Globe className="h-4 w-4" /> Location
                    </p>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {company.company_location || <span className="text-gray-400 italic">Not set</span>}
                    </p>
                  </div>
  `;
  content = content.replace(
    /<div className="space-y-1">\s*<p className="text-sm font-medium text-gray-500 flex items-center gap-2">\s*<Mail className="h-4 w-4" \/> HR Contact/,
    `${displayLocationUI}\n                  <div className="space-y-1">\n                    <p className="text-sm font-medium text-gray-500 flex items-center gap-2">\n                      <Mail className="h-4 w-4" /> HR Contact`
  );

  fs.writeFileSync(profilePath, content);
  console.log('Updated profile-section.tsx to include company location');
} else {
  console.log('Profile section already has company location');
}
