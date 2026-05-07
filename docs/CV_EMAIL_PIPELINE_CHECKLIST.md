# CV email pipeline — confirmation checklist & backlog

This document confirms how OptioHire handles **inbound application emails → CV extraction → AI screening → candidate emails → HR dashboard**, and lists **done** vs **future** work.

Legend: ✅ implemented in repo · 🔄 partial / env-dependent · 📋 backlog / not in scope of current code

---

## 1. Email watcher (inbound CVs)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 1.1 | Single monitored IMAP inbox receives applications | ✅ | Configured via `MAIL_USER` / IMAP env vars; not one mailbox per HR. |
| 1.2 | Poll interval **10 seconds** (product default) | ✅ | `IMAP_POLL_MS` defaults to **10000** ms in `email-reader.ts`. Override in env if needed (e.g. `1000` for dev). |
| 1.3 | Watcher runs when backend starts | ✅ | Gated by `ENABLE_EMAIL_READER` (and similar) — see `server.ts`. |
| 1.4 | Match incoming message to **active job posting** | ✅ | Subject/body patterns in `email-reader.ts` (not “per HR private inbox”). |
| 1.5 | **Per-company** or **per-HR** dedicated inbox | 📋 | Would need multi-account IMAP or forwarding rules + routing table. |
| 1.6 | Health / diagnostics endpoint | ✅ | `/health/email-reader` and email diagnostics API expose `pollInterval`. |

---

## 2. CV extraction & “AI-ready” representation

| # | Item | Status | Notes |
|---|------|--------|--------|
| 2.1 | Extract **PDF / DOCX** (and related) attachments | ✅ | Email reader + parsers; failures may mark application `FLAG` for review. |
| 2.2 | Convert to **plain text** (+ links where available) | ✅ | `parsed.textContent`, LinkedIn/GitHub fields passed into scoring input. |
| 2.3 | **Blind / redaction** path for fair scoring | ✅ | PII handling in `ai-scoring` pipeline before model call. |
| 2.4 | OCR for scanned PDFs | 🔄 / 📋 | Depends on parser stack; verify with real samples. |
| 2.5 | Non-English CVs | 📋 | May need explicit language detection + prompts. |

---

## 3. AI screening vs job post (responsibilities & skills)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 3.1 | Job **required skills**, description, responsibilities in prompt | ✅ | `ScoringInput` from job posting + company context. |
| 3.2 | Model returns dimensions + overall score | ✅ | `ai-scoring.ts` (Groq/Gemini) with calibration + evidence anchor. |
| 3.3 | **Heuristic fallback** (batch / degraded mode) | ✅ | `services/ai/screening.ts` — thresholds aligned with main bands. |
| 3.4 | Human override from HR UI | 🔄 | Depends on dashboard/API features; not fully enumerated here. |

---

## 4. Score → status bands (calibrated 0–100)

| # | Item | Status | Notes |
|---|------|--------|--------|
| 4.1 | **REJECT** for scores **0–50** | ✅ | `deriveStatus` in `ai-scoring.ts`; heuristic path in `screening.ts`. |
| 4.2 | **FLAG** for scores **51–79** | ✅ | Human review bucket. |
| 4.3 | **SHORTLIST** for scores **80–100** | ✅ | |
| 4.4 | Legacy “50 counts as flag” behavior | ❌ removed | Was `>= 50` for flag; now **50 = reject**, **51+ = flag** (until 80). |

---

## 5. Candidate emails by status

| # | Item | Status | Notes |
|---|------|--------|--------|
| 5.1 | **Rejection** email for **REJECT** | ✅ | `EmailService.sendRejectionEmail` from email reader + retry checker. |
| 5.2 | **Shortlist** email for **SHORTLIST** | ✅ | `sendShortlistEmail`. |
| 5.3 | **Under review / flagged** email for **FLAG** (51–79) | ✅ | `sendFlagReviewEmail` — neutral “still under review”, not a rejection. |
| 5.4 | Retry unsent feedback emails | ✅ | `email-retry-checker.ts` includes **shortlist, rejection, flag_review** types. |
| 5.5 | Template customization per company | 📋 | Mostly static templates today. |

---

## 6. HR dashboard “real-time” applications

| # | Item | Status | Notes |
|---|------|--------|--------|
| 6.1 | Candidates list loads from API | ✅ | e.g. `/api/hr/candidates?jobId=`. |
| 6.2 | **Polling ~10s** while tab visible (job candidates view) | ✅ | `shortlisted/page.tsx` uses **10s** interval when document is visible. |
| 6.3 | True **WebSocket / SSE** push | 📋 | Would remove poll delay entirely; not implemented. |
| 6.4 | Shows **SHORTLIST / FLAG / REJECT** and scores | ✅ | API + UI badges (verify per screen). |

---

## 7. Operations & verification (runbook)

| # | Item | Status |
|---|------|--------|
| 7.1 | Confirm `ENABLE_EMAIL_READER=true` in production | 🔄 ops |
| 7.2 | Confirm `IMAP_POLL_MS` if non-default | 🔄 ops |
| 7.3 | Monitor `/health/email-reader` | ✅ |
| 7.4 | Spot-check Resend/SMTP logs + `email_logs` for `shortlist` / `rejection` / `flag_review` | 🔄 ops |

---

## 8. Backlog (ideas)

- Multi-inbox / per-company application addresses with routing.
- SSE for zero-delay dashboard updates.
- Candidate-facing email for FLAG with company-branded HTML editor.
- Explicit env flag to **disable** flag emails (`SEND_FLAG_REVIEW_EMAIL=false`) if ever needed.
- Audit report: latency from email received → score → email sent → dashboard poll.

---

*Last updated with implementation of: 10s IMAP default, strict 0–50 / 51–79 / 80–100 bands, flag review email, 10s dashboard polling, checklist doc.*
