const fs = require('fs');
const path = require('path');

const walk = (dir) => {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walk(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('./frontend/src');
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let changed = false;

  if (file.includes('captcha-provider.tsx')) {
    content = `export function CaptchaProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}`;
    changed = true;
  } else if (content.includes('react-google-recaptcha-v3')) {
    // Comment out import
    content = content.replace(/import\s+\{([^}]*)\}\s+from\s+['"]react-google-recaptcha-v3['"]/g, 
    "// removed recaptcha import");
    
    // Replace useGoogleReCaptcha hook call
    content = content.replace(/const\s+\{\s*executeRecaptcha\s*\}\s*=\s*useGoogleReCaptcha\(\)/g,
    "const executeRecaptcha = async () => 'dummy-token'");
    
    changed = true;
  }
  
  if (changed) {
    fs.writeFileSync(file, content);
    console.log('Modified', file);
  }
});
