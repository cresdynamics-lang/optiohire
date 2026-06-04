import * as fs from 'fs';
import * as path from 'path';

const chatbotPath = path.join(process.cwd(), '../frontend/src/components/dashboard/chatbot-widget.tsx');
let content = fs.readFileSync(chatbotPath, 'utf8');

if (!content.includes('open-hr-assistant')) {
  // Add useEffect to listen for custom event
  content = content.replace(
    /const messagesEndRef = useRef<HTMLDivElement>\(null\)/,
    `const messagesEndRef = useRef<HTMLDivElement>(null)\n\n  useEffect(() => {\n    const handleOpenAssistant = () => setIsOpen(true);\n    document.addEventListener('open-hr-assistant', handleOpenAssistant);\n    return () => document.removeEventListener('open-hr-assistant', handleOpenAssistant);\n  }, []);`
  );
  
  if (!content.includes('useEffect')) {
    content = content.replace(
      /import { useState, useRef } from 'react'/,
      `import { useState, useRef, useEffect } from 'react'`
    );
  }
  
  fs.writeFileSync(chatbotPath, content);
  console.log('Added custom event listener to ChatbotWidget');
} else {
  console.log('ChatbotWidget already listens to open-hr-assistant');
}
