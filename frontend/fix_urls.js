import fs from 'fs';
import path from 'path';

function walk(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const p = path.join(dir, file);
    if (fs.statSync(p).isDirectory()) {
      walk(p, callback);
    } else if (p.endsWith('.ts') || p.endsWith('.tsx')) {
      callback(p);
    }
  }
}

let count = 0;
walk('./src/app/api', (file) => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Find places where it's purely hardcoded string
  const hardcodedRegex1 = /const BACKEND_URL = 'https:\/\/api\.optiohire\.com'/g;
  const hardcodedRegex2 = /const backendUrl = 'https:\/\/api\.optiohire\.com'/g;
  
  let changed = false;
  if (hardcodedRegex1.test(content)) {
    content = content.replace(hardcodedRegex1, "const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://api.optiohire.com'");
    changed = true;
  }
  if (hardcodedRegex2.test(content)) {
    content = content.replace(hardcodedRegex2, "const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.BACKEND_URL || 'https://api.optiohire.com'");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(file, content, 'utf8');
    count++;
  }
});
console.log(`Replaced hardcoded urls in ${count} files`);
