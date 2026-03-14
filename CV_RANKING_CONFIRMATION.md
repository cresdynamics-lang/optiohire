# CV Ranking Against Job Role & Description - Confirmation

## ✅ Confirmed: Ranking Uses Job Role & Description

### Current Implementation

The email watcher **correctly screens and ranks CVs** against:
1. ✅ **Job Title** (`job.job_title`)
2. ✅ **Job Description** (`job.job_description`) 
3. ✅ **Required Skills** (`job.required_skills`)

---

## 🔍 How It Works

### 1. Email Processing Flow

**Location:** `backend/src/server/email-reader.ts`

**Step 1: Find Unread Emails**
```typescript
// Line 294-297: Search for unseen (unread) emails
const messages = await this.client!.search({
  seen: false  // Only process unread emails
})
```

**Step 2: Match Email to Job**
- Email subject matched to job posting
- Job details fetched from database including:
  - `job_title`
  - `job_description` 
  - `skills_required` (as `required_skills`)

**Step 3: Extract CV**
- CV attachment extracted (PDF/DOCX)
- CV parsed to extract text content

**Step 4: Rank Against Job Requirements**
```typescript
// Line 1062-1077: Scoring uses job details
const scoringResult = await this.aiScoring.scoreCandidate({
  job: {
    title: job.job_title,           // ✅ Job role
    description: job.job_description, // ✅ Job description
    required_skills: job.required_skills || [] // ✅ Required skills
  },
  company: { ... },
  cvText: parsed.textContent // Full CV text
})
```

### 2. AI Scoring Engine

**Location:** `backend/src/lib/ai-scoring.ts`

**Scoring Prompt Includes:**
```typescript
// Line 242-247: Job details in prompt
JOB DETAILS:
- Job Title: ${input.job.title}
- Job Description: ${input.job.description}  // ✅ Full description used
- Required Skills: ${input.job.required_skills.join(', ')}
```

**System Instruction:**
- Evaluates candidate against **specific job requirements**
- Uses **job description** to understand role expectations
- Matches **required skills** against CV content
- Provides score (0-100) and status (SHORTLIST/FLAG/REJECT)

---

## 📊 Ranking Criteria

### What Gets Evaluated:

1. **Job Title Match**
   - How well CV aligns with role title
   - Experience level appropriate for role

2. **Job Description Requirements**
   - ✅ **FULL job description is used** in AI prompt
   - Responsibilities and expectations evaluated
   - Role-specific requirements checked

3. **Required Skills**
   - Each skill in `required_skills` checked against CV
   - Skills extraction and matching
   - Transferable skills considered

4. **Overall Fit**
   - Career trajectory
   - Experience relevance
   - Cultural alignment

---

## ✅ Confirmation Checklist

- [x] **Unread emails processed** - `seen: false` search (line 296)
- [x] **Job description fetched** - `job.job_description` (line 490, 528)
- [x] **Job description used in scoring** - Passed to `scoreCandidate` (line 1065)
- [x] **Job description in AI prompt** - Included in prompt (line 246)
- [x] **Required skills used** - `job.required_skills` (line 1066)
- [x] **Full CV text analyzed** - `parsed.textContent` (line 1076)
- [x] **Ranking happens for all matched emails** - `processCandidateCV` called (line 800)

---

## 🔄 Processing Flow for Unread Emails

```
1. Email Watcher polls inbox (every 5 seconds)
   ↓
2. Finds unread emails (seen: false)
   ↓
3. For each unread email:
   a. Extract subject and sender
   b. Match subject to job posting
   c. Fetch job details (title, description, skills)
   ↓
4. Extract CV attachment (PDF/DOCX)
   ↓
5. Parse CV to text
   ↓
6. Rank CV against job:
   - Job Title ✅
   - Job Description ✅ (FULL description used)
   - Required Skills ✅
   ↓
7. Assign score (0-100) and status
   ↓
8. Store in database
   ↓
9. Send feedback email (after 5 seconds)
   ↓
10. Mark email as read
```

---

## 📝 Example: What Gets Evaluated

**Job Posting:**
- **Title:** "Sales Role"
- **Description:** "We are looking for an experienced Sales professional... Responsibilities include identifying new business opportunities, managing client accounts, and achieving sales targets."
- **Required Skills:** ["Sales", "Customer Relations", "Communication", "Negotiation", "CRM"]

**CV Evaluation:**
- ✅ Checks if candidate has sales experience
- ✅ Evaluates against full job description requirements
- ✅ Matches required skills against CV content
- ✅ Scores based on how well CV matches description
- ✅ Provides reasoning based on job requirements

---

## 🎯 Key Points

1. **Full Job Description Used**
   - Not just title or skills
   - Complete description passed to AI
   - AI evaluates against all requirements

2. **All Unread Emails Processed**
   - Watcher checks for `seen: false`
   - Processes every unread email
   - Ranks each CV against matched job

3. **Comprehensive Evaluation**
   - Job title relevance
   - Job description alignment
   - Required skills matching
   - Overall fit assessment

---

## ✅ Conclusion

**The system is correctly configured to:**
- ✅ Process all unread emails
- ✅ Rank CVs against job role (title)
- ✅ Rank CVs against job description (FULL description)
- ✅ Rank CVs against required skills
- ✅ Provide comprehensive scoring and reasoning

**Everything is working as expected!** 🎉
