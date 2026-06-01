# OptioHire — Watcher Engine Platform

> **AI-powered hiring management for HR professionals.**  
> Post a role. The Watcher Engine does the rest.

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Redis](https://img.shields.io/badge/Redis-BullMQ-DC382D?logo=redis&logoColor=white)](https://redis.io)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?logo=docker&logoColor=white)](https://docker.com)
[![License](https://img.shields.io/badge/License-Proprietary-lightgrey)](LICENSE)

---

## Table of Contents

- [What is OptioHire?](#what-is-optiohire)
- [Robust Application Channels (Email & Web)](#robust-application-channels)
- [The Watcher Engine Architecture](#the-watcher-engine-architecture)
- [AI Skills & Dynamic Taxonomy](#ai-skills--dynamic-taxonomy)
- [Tech Stack](#tech-stack)
- [Deployment Architecture (Nginx & PM2)](#deployment-architecture)
- [Environment Variables](#environment-variables)
- [Running the Services](#running-the-services)

---

## What is OptioHire?

OptioHire is a **B2B HR-technology SaaS platform**. It transforms hiring by eliminating manual CV screening entirely using our proprietary **Watcher Engine**.

HR teams post a role. Candidates apply via web or email. The Engine automatically extracts structured profiles using AI, scores every applicant against the job requirements using deterministic math and semantic vectors, and delivers a ranked, explainable shortlist to the HR's inbox.

---

## Robust Application Channels

OptioHire guarantees zero dropped applications by supporting multiple ingestion channels with built-in fallbacks.

### 1. Web Platform & Shareable Links
Candidates can apply directly via `optiohire.com` web forms or via unique shareable links (`?ref=share`) posted on LinkedIn, Twitter, or WhatsApp. 

### 2. Email Ingestion Service
Candidates can simply email `jobs@optiohire.com` with their CV attached. The platform features a highly robust dual-ingestion email architecture:
- **Primary (Resend Webhooks):** Resend intercepts the inbound email and pushes a JSON payload to `/api/webhooks/email` instantly. The backend extracts the attachments and fuzzy-matches the subject line to the correct job opening.
- **Fallback (IMAP Polling):** If the webhook fails or drops, a cron job polls the Gmail inbox via IMAP every 5 minutes. It downloads unprocessed `.eml` files, extracts the PDF/DOCX attachments, and syncs them into the database to guarantee 100% data durability.

---

## The Watcher Engine Architecture

The Watcher Engine is the intelligent core of OptioHire. It operates as a decoupled background service using **BullMQ** to process hundreds of candidates asynchronously without blocking the main web server.

### Stage 1: The Resume Parser Skill
When an application arrives, it triggers the `optiohire-resume-parser` skill. 
- The raw PDF/DOCX text is sent to the LLM Gateway.
- The AI extracts structured JSON (Name, Contact, Education, Work History, Skills).
- A 1536-dimensional vector embedding is generated and stored in PostgreSQL (`pgvector`) for semantic search.

### Stage 2: The Two-Pass Scoring Pipeline
We achieve sub-2-second latency for live scoring by decoupling extraction from reasoning:
1. **Extraction Pass (Llama-3-8b via Groq/OpenRouter):** An ultra-fast LLM call extracts boolean matches (e.g., *Does the candidate have React? Yes/No*).
2. **Deterministic Math:** The Node.js backend (`scoringWeights.ts`) executes the actual scoring:
   - **35% Skill Match** (Exact & Partial)
   - **30% Experience**
   - **20% Vector Similarity** (Cosine similarity against the Job Description)
   - **15% Education** (Waivable via the *Education Waiver Logic* if the candidate has 1.5x the required experience).
3. **Reasoning Pass (Gemini/Claude):** A final, fast LLM call takes the computed math and generates a 2-sentence human-readable explanation for the HR Dashboard.

---

## AI Skills & Dynamic Taxonomy

To keep LLM latency low and avoid token-bloat, OptioHire uses **Dynamic Taxonomy Injection**. 

Instead of passing the entire 5-page Master Skill Taxonomy (defined in `optiohire-ai-scoring.md`) to the AI for every candidate, the system intercepts the job description, looks up the relevant sub-taxonomies (e.g., only *Frontend* and *Databases*), and injects a heavily compacted schema into the prompt. 

**Result:** A 90% reduction in prompt size, resulting in lightning-fast inference and massively reduced API costs via **OpenRouter**.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| Frontend | Next.js 14, React, TailwindCSS | Public interface & HR dashboard (SSR) |
| Backend API | Node.js 18+, Express | REST API, file handling, email ingestion |
| Database | PostgreSQL 14+ with pgvector | Application data + vector embeddings |
| Queue | Redis + BullMQ | Persistent, event-driven job queue |
| AI Gateways | OpenRouter, Groq, Gemini | Intelligent resume parsing and reasoning |
| Deployment | Ubuntu, PM2, Nginx, Certbot | Highly available production architecture |

---

## Deployment Architecture

The entire platform runs on an Ubuntu DigitalOcean Droplet (`67.205.164.114`).

- **Process Management:** The backend and frontend are managed independently by **PM2** (`optiohire-backend` and `optiohire-frontend`), ensuring automatic restarts on crash and zero-downtime reloads.
- **Reverse Proxy:** **Nginx** routes traffic securely.
  - `optiohire.com` → Proxies to Next.js Frontend
  - `optiohire.com/api` → Proxies to Express Backend
  - `guide.optiohire.com` → Serves static HTML/CSS directly from `/var/www/guide.optiohire.com/html` with advanced cache-control.
- **Security:** Fully secured with Let's Encrypt SSL (`certbot`).

---

## Environment Variables

All variables are documented in `.env.example`. Key variables for the AI & Email systems include:

| Variable | Description |
|---|---|
| `AI_PROVIDER` | Determines the active gateway (`openrouter`, `groq`, `gemini`) |
| `OPENROUTER_API_KEY` | Primary LLM routing key for Llama 3 / Claude / Gemini |
| `IMAP_USER` / `IMAP_PASS` | Gmail credentials for the resilient email fallback scraper |
| `USE_RESEND` | Boolean to enable/disable webhook ingestion |
| `DATABASE_URL` | PostgreSQL connection string |

---

## Running the Services

### Start everything locally (Docker)
```bash
docker compose up --build
```

### Run database migrations
```bash
docker compose exec backend npm run db:migrate
```

### Production Deployment (SSH)
```bash
# Pull latest code and restart PM2 processes gracefully
git pull origin main
npm install
npm run build
pm2 reload all
```

---

*Platform: [optiohire.com](https://optiohire.com) · Inbound Email: jobs@optiohire.com · Version 2.0 · June 2026*
