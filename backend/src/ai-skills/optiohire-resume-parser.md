---
name: optiohire-resume-parser
description: >
  Use this skill whenever a candidate uploads a resume or CV on the OptioHire platform
  and it needs to be parsed into a structured JSON profile. This covers all three intake
  channels: web form upload, shareable link submission, and inbound email attachment.
  Triggers on any task involving `resumeParser.ts`, CV text extraction, PDF/DOCX parsing,
  candidate profile creation, or the phrase "parse resume", "extract skills", "process CV",
  or "ingest application". Always use this skill before any scoring or matching step —
  parsing is the required first stage of the Watcher Engine pipeline.
---

# OptioHire Resume Parser Skill

## What This Skill Does
Parses a raw candidate resume (PDF or DOCX) into a structured JSON profile using OpenRouter
as the LLM gateway. Feeds output directly into the `candidate_profiles` and `candidate_skills`
tables. This is **Job 1** of the Watcher Engine three-job pipeline.

## Architecture Context
- **File:** `src/services/ai/resumeParser.ts`
- **LLM Gateway:** OpenRouter (`meta-llama/llama-3-8b-instruct` or configured model)
- **Database Client:** Raw PostgreSQL queries (`src/db/index.ts`)
- **Input:** Raw resume text (extracted from PDF/DOCX before this step)
- **Output:** Structured JSON → written to `candidate_profiles` + `candidate_skills` tables
- **Confidence threshold:** If `confidence < 0.7`, set `ai_status = 'FLAG'` or mark the application for manual review.

---

## Step-by-Step Implementation

### Step 1 — Extract raw text from the uploaded file
Before calling the LLM, extract plain text from the uploaded file:
```ts
import pdfParse from 'pdf-parse';
// Store extracted text as a string: rawText
```
If text extraction fails or returns < 100 characters, flag the application and skip the LLM call.

### Step 2 — Build the OpenRouter prompt
Send the raw text to OpenRouter with this exact system + user prompt structure:

```ts
const systemPrompt = `
You are a precise resume parser for a hiring platform.
Extract structured data from the resume text provided.
Respond ONLY with valid JSON. No explanation, no markdown, no preamble.
Use null for any field you cannot confidently extract.
`;

const userPrompt = `
Parse this resume and return a JSON object with this exact structure:
{
  "full_name": string,
  "email": string,
  "phone": string | null,
  "location": string | null,
  "years_of_experience": number,
  "current_title": string | null,
  "summary": string | null,
  "skills": [
    {
      "skill_name": string,
      "proficiency_level": "beginner" | "intermediate" | "advanced" | "expert",
      "years_used": number | null
    }
  ],
  "work_history": [
    {
      "company": string,
      "title": string,
      "start_date": string | null,
      "end_date": string | null,
      "description": string | null
    }
  ],
  "education": [
    {
      "institution": string,
      "degree": string,
      "field": string | null,
      "graduation_year": number | null
    }
  ],
  "confidence": number  // 0.0 to 1.0 — your confidence in the extraction accuracy
}

Resume text:
\${rawText}
`;
```

### Step 3 — Call OpenRouter
```ts
const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': \`Bearer \${process.env.OPENROUTER_API_KEY}\`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://optiohire.com',
    'X-Title': 'OptioHire Watcher Engine'
  },
  body: JSON.stringify({
    model: process.env.OPENROUTER_MODEL ?? 'meta-llama/llama-3-8b-instruct',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,  // Low temp — we want deterministic extraction, not creativity
    max_tokens: 2000
  })
});

const data = await response.json();
const raw = data.choices[0].message.content;
```

### Step 4 — Parse and validate the JSON response
```ts
let parsed;
try {
  // Strip any accidental markdown fences the model may have added
  const clean = raw.replace(/\`\`\`json|\`\`\`/g, '').trim();
  parsed = JSON.parse(clean);
} catch (err) {
  // Parsing failed — flag for review, do not crash the job
  await markRequiresReview(applicationId, 'JSON parse failed from LLM response');
  return;
}

// Confidence gate
if (!parsed.confidence || parsed.confidence < 0.7) {
  await markRequiresReview(applicationId, \`Low confidence: \${parsed.confidence}\`);
  // Still write what we have — partial profiles are better than nothing
}
```

### Step 5 — Write to database (PostgreSQL)
```ts
import { query } from '../db/index.js';

// 1. Insert/Update candidate_profiles
const profileRes = await query(\`
  INSERT INTO candidate_profiles (user_id, metadata, updated_at)
  VALUES ($1, $2, now())
  ON CONFLICT (user_id) 
  DO UPDATE SET metadata = EXCLUDED.metadata, updated_at = now()
  RETURNING profile_id;
\`, [userId, JSON.stringify(parsed)]);

const profileId = profileRes.rows[0].profile_id;

// 2. Write each skill to candidate_skills
for (const skill of parsed.skills) {
  await query(\`
    INSERT INTO candidate_skills (profile_id, skill_name, proficiency_score, is_verified)
    VALUES ($1, $2, $3, false)
    ON CONFLICT (profile_id, skill_name) 
    DO UPDATE SET proficiency_score = EXCLUDED.proficiency_score, updated_at = now();
  \`, [profileId, skill.skill_name, mapProficiencyToScore(skill.proficiency_level)]);
}
```

### Step 6 — Enqueue scoring
After writing the profile, generate an embedding if needed.
Then immediately trigger the `match-job` scoring logic (Job 2).

---

## Error Handling Rules
| Condition | Action |
|-----------|--------|
| File extraction returns < 100 chars | Flag for manual HR review, skip LLM |
| OpenRouter API error / timeout | Retry 3× with exponential backoff, then alert |
| JSON parse fails | Flag for review, log raw response |
| `confidence < 0.7` | Write partial profile, Flag for manual review |
| Email already in DB | Merge/Update existing candidate profile using UPSERT |

---

## Key Environment Variables
```
OPENROUTER_API_KEY=
OPENROUTER_MODEL=meta-llama/llama-3-8b-instruct
DATABASE_URL=postgresql://user:pass@localhost:5432/db
```

## What to do next
After this skill completes successfully → load `optiohire-ai-scoring` skill for Job 2.
