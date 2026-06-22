import fs from 'fs';
import path from 'path';

const apiDir = path.join(process.cwd(), 'backend', 'src', 'api');

function cleanFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Remove the import
  content = content.replace(/import\s*{\s*verifyCaptcha\s*}\s*from\s*['"]\.\.\/utils\/captcha\.js['"];?\n?/g, '');
  
  // Remove captchaToken parsing
  content = content.replace(/const\s+captchaToken\s*=\s*req\.headers\['x-captcha-token'\].*?\n/g, '');
  content = content.replace(/const\s+captchaToken\s*=\s*req\.body\.captchaToken.*?\n/g, '');
  
  // Remove if (!isCaptchaValid) blocks
  content = content.replace(/\/\/\s*Verify\s+captcha\s*const\s+isCaptchaValid\s*=\s*await\s+verifyCaptcha\(captchaToken\)\s*if\s*\(!isCaptchaValid\)\s*{\s*return\s+res\.status\(400\)\.json\({[^}]+}\)\s*}\s*/g, '');
  
  // Remove inline blocks
  content = content.replace(/const\s+isCaptchaValid\s*=\s*await\s+verifyCaptcha\(captchaToken\)\s*if\s*\(!isCaptchaValid\)\s*{\s*return\s+res\.status\(400\)\.json\({[^}]+}\)\s*}\s*/g, '');
  content = content.replace(/if\s*\(!\(await\s+verifyCaptcha\(captchaToken\)\)\)\s*{\s*return\s+res\.status\(400\)\.json\({[^}]+}\)\s*}\s*/g, '');
  content = content.replace(/if\s*\(!\(await\s+verifyCaptcha\(captchaToken\)\)\)\s*return\s+res\.status\(400\)\.json\({[^}]+}\)\s*/g, '');

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`Cleaned ${filePath}`);
}

const files = fs.readdirSync(apiDir).filter(f => f.endsWith('.ts'));
for (const file of files) {
  cleanFile(path.join(apiDir, file));
}
