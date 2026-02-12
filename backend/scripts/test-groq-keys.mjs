#!/usr/bin/env node
/**
 * Test all Groq API keys: connectivity, resume-style JSON parse, scoring-style JSON.
 * Run from repo root: node backend/scripts/test-groq-keys.mjs
 * Or from backend: node scripts/test-groq-keys.mjs (after loading .env)
 */
import 'dotenv/config'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import Groq from 'groq-sdk'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Load backend .env if we're in backend
const envPath = join(__dirname, '..', '.env')
try {
  const env = readFileSync(envPath, 'utf8')
  env.split('\n').forEach(line => {
    const m = line.match(/^([^#=]+)=(.*)$/)
    if (m) {
      const key = m[1].trim()
      const val = m[2].trim().replace(/^["']|["']$/g, '')
      if (!process.env[key]) process.env[key] = val
    }
  })
} catch (e) {
  // .env might not exist; dotenv may have loaded from cwd
}

const KEYS = {
  primary: process.env.GROQ_API_KEY,
  secondary: process.env.GROQ_API_KEY_002,
  tertiary: process.env.GROQ_API_KEY_003,
}

const MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant'

async function testKey(name, apiKey) {
  if (!apiKey || apiKey.startsWith('your_')) {
    console.log(`   ⏭ ${name}: not set or placeholder`)
    return { ok: false, reason: 'not configured' }
  }
  const groq = new Groq({ apiKey })
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [{ role: 'user', content: 'Reply with exactly: OK' }],
      max_tokens: 10,
      temperature: 0,
    })
    const text = completion.choices[0]?.message?.content?.trim() || ''
    console.log(`   ✅ ${name}: connected (model ${MODEL})`)
    return { ok: true, text }
  } catch (err) {
    console.log(`   ❌ ${name}: ${err.message || err}`)
    return { ok: false, error: err.message }
  }
}

async function testResumeParseStyle(apiKey) {
  const groq = new Groq({ apiKey })
  const prompt = `Resume Text:
John Doe, john@example.com. 5 years React and Node.js. Worked at Acme Corp as Senior Developer.
---
Extract JSON with keys: personal{name,email}, skills[string[]], experience[{company,role}]. Return ONLY valid JSON.`
  const sys = 'You are a resume parser. Return only valid JSON, no markdown.'
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.1,
    })
    const content = completion.choices[0]?.message?.content || '{}'
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    if (parsed.personal || parsed.skills || parsed.experience) {
      console.log('   ✅ Resume-style parse: valid JSON with expected keys')
      return { ok: true, parsed }
    }
    console.log('   ⚠ Resume-style parse: JSON missing expected keys')
    return { ok: false, parsed }
  } catch (err) {
    console.log('   ❌ Resume-style parse:', err.message)
    return { ok: false, error: err.message }
  }
}

async function testScoringStyle(apiKey) {
  const groq = new Groq({ apiKey })
  const prompt = `Evaluate this candidate for Software Engineer. Required skills: JavaScript, React.
CV: 3 years React, 2 years Node.js. Bachelor CS.
Return ONLY this JSON: {"score": 85, "status": "SHORTLIST", "reasoning": "Strong match."}`
  const sys = 'You are a recruitment assistant. Return only valid JSON.'
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      messages: [
        { role: 'system', content: sys },
        { role: 'user', content: prompt },
      ],
      max_tokens: 256,
      temperature: 0.1,
    })
    const content = completion.choices[0]?.message?.content || '{}'
    const jsonMatch = content.match(/\{[\s\S]*\}/)
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : content)
    if (typeof parsed.score === 'number' && parsed.status && parsed.reasoning) {
      console.log(`   ✅ Scoring-style: score=${parsed.score} status=${parsed.status}`)
      return { ok: true, parsed }
    }
    console.log('   ⚠ Scoring-style: JSON missing score/status/reasoning')
    return { ok: false, parsed }
  } catch (err) {
    console.log('   ❌ Scoring-style:', err.message)
    return { ok: false, error: err.message }
  }
}

async function main() {
  console.log('🔍 Groq API keys test (parse + score + connectivity)\n')
  console.log('Model:', MODEL)
  console.log('')

  // 1) Connectivity per key
  console.log('1) Connectivity (each key):')
  const conn = {
    primary: await testKey('primary', KEYS.primary),
    secondary: await testKey('secondary', KEYS.secondary),
    tertiary: await testKey('tertiary', KEYS.tertiary),
  }
  const working = Object.values(conn).filter(r => r.ok).length
  console.log('')

  // 2) Resume parse (use first working key)
  const firstKey = KEYS.primary || KEYS.secondary || KEYS.tertiary
  if (!firstKey || firstKey.startsWith('your_')) {
    console.log('2) Resume parse: skipped (no key)')
    console.log('3) Scoring: skipped (no key)')
    console.log('\n❌ No Groq API keys configured. Set GROQ_API_KEY in backend/.env')
    process.exit(1)
  }

  console.log('2) Resume-style JSON parse (primary key):')
  const parseResult = await testResumeParseStyle(KEYS.primary || firstKey)
  console.log('')

  console.log('3) Scoring-style JSON (primary key):')
  const scoreResult = await testScoringStyle(KEYS.primary || firstKey)
  console.log('')

  // Summary
  console.log('--- Summary ---')
  console.log(`Keys working: ${working}/3`)
  console.log(`Resume parse: ${parseResult.ok ? 'OK' : 'FAIL'}`)
  console.log(`Scoring:      ${scoreResult.ok ? 'OK' : 'FAIL'}`)
  if (working >= 1 && parseResult.ok && scoreResult.ok) {
    console.log('\n✅ Groq APIs are working and suitable for parsing and scoring.')
    process.exit(0)
  }
  console.log('\n⚠ Some checks failed. Fix keys or model and re-run.')
  process.exit(1)
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
