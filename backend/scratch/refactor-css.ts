import * as fs from 'fs'
import * as path from 'path'

const ADMIN_DIR = path.join(process.cwd(), '../frontend/src/app/admin')
const HR_DIR = path.join(process.cwd(), '../frontend/src/app/dashboard')

const CLASS_MAPPINGS = [
  // Backgrounds
  { regex: /\bbg-slate-50\b/g, replacement: 'bg-background' },
  { regex: /\bbg-gray-50\b/g, replacement: 'bg-background' },
  
  // Notice we only replace bg-white inside Card components or explicit layout components
  // To avoid breaking buttons, we'll replace text-white only if it's not preceded by a strong background color like bg-blue-600
  // But a safer regex for text colors:
  { regex: /\btext-slate-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-gray-900\b/g, replacement: 'text-foreground' },
  { regex: /\btext-gray-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-500\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-gray-600\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-slate-400\b/g, replacement: 'text-muted-foreground' },
  { regex: /\btext-slate-500\b/g, replacement: 'text-muted-foreground' },

  // Borders
  { regex: /\bborder-slate-200\b/g, replacement: 'border-border' },
  { regex: /\bborder-gray-200\b/g, replacement: 'border-border' },
  { regex: /\bborder-slate-300\b/g, replacement: 'border-border' },

  // Hover states
  { regex: /\bhover:bg-slate-50\b/g, replacement: 'hover:bg-muted' },
  { regex: /\bhover:bg-slate-100\b/g, replacement: 'hover:bg-accent' },
]

// Specialized mapping for `text-white` and `bg-white`
// We only want to replace `text-white` if it is a primary typography element. 
// A naive replacement of `text-white` will break buttons (e.g. `bg-blue-600 text-white`).
// So we use negative lookbehinds or contextual logic if possible, or just skip it and rely on manual/targeted updates.
// Since JS regex lookbehinds for variable length aren't great, we'll do a string-based sweep for explicit combinations.

function processFile(filePath: string) {
  let content = fs.readFileSync(filePath, 'utf8')
  let modified = false

  // Apply standard mappings
  CLASS_MAPPINGS.forEach(({ regex, replacement }) => {
    if (regex.test(content)) {
      content = content.replace(regex, replacement)
      modified = true
    }
  })

  // Specific Card logic: <Card className="border-slate-200 bg-white"> -> <Card> or <Card className="border-border bg-card">
  const cardRegex = /<Card\s+className=(['"])(.*?)bg-white(.*?)\1>/g
  if (cardRegex.test(content)) {
    content = content.replace(cardRegex, (match, quote, p1, p2) => {
      const newClass = `${p1}${p2}`.replace(/\s+/g, ' ').trim()
      if (newClass) {
         // Re-run standard mappings on the remaining classes
         return `<Card className=${quote}${newClass}${quote}>`
      }
      return `<Card>`
    })
    modified = true
  }

  // Replace text-white ONLY when it's immediately after className=" or if it's explicitly used in standard paragraphs
  // E.g. <p className="text-white"> -> <p className="text-foreground">
  const pRegex = /<[p|h1|h2|h3|div|label|span]\s+className=(['"])(.*?)\btext-white\b(.*?)\1/g
  if (pRegex.test(content)) {
    content = content.replace(pRegex, (match) => {
      // If it contains a primary brand color background, don't touch text-white
      if (match.includes('bg-blue-') || match.includes('bg-orange-') || match.includes('bg-red-') || match.includes('bg-indigo-') || match.includes('bg-[#') || match.includes('from-') || match.includes('bg-slate-900') || match.includes('bg-black')) {
        return match
      }
      return match.replace(/\btext-white\b/g, 'text-foreground')
    })
    modified = true
  }

  // Same for bg-white but for generic containers, as long as it's not a button
  const divRegex = /<div\s+className=(['"])(.*?)\bbg-white\b(.*?)\1/g
  if (divRegex.test(content)) {
    content = content.replace(divRegex, (match) => {
      if (match.includes('text-slate-900')) {
         return match.replace(/\bbg-white\b/g, 'bg-card')
      }
      return match.replace(/\bbg-white\b/g, 'bg-background')
    })
    modified = true
  }
  
  // Remove hardcoded dark mode variants (e.g. dark:text-white) because the semantic variables handle it
  const darkRegex = /\bdark:text-[a-z0-9-]+\b/g
  if (darkRegex.test(content)) {
    content = content.replace(darkRegex, '')
    modified = true
  }
  const darkBgRegex = /\bdark:bg-[a-z0-9-]+\b/g
  if (darkBgRegex.test(content)) {
    content = content.replace(darkBgRegex, '')
    modified = true
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8')
    console.log(`[UPDATED] ${filePath.split('frontend/src/app/')[1]}`)
  }
}

function walkDir(dir: string) {
  if (!fs.existsSync(dir)) return
  const files = fs.readdirSync(dir)
  for (const file of files) {
    const fullPath = path.join(dir, file)
    const stat = fs.statSync(fullPath)
    if (stat.isDirectory()) {
      walkDir(fullPath)
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath)
    }
  }
}

console.log('Starting CSS Refactor...')
walkDir(ADMIN_DIR)
walkDir(HR_DIR)
console.log('Done.')
