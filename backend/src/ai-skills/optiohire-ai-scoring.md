# OptioHire Watcher Engine - LLM Skill Guide | v1.0

## 0. Philosophy: Think Like a Hiring Manager, Not a Filter
Traditional ATS is a bouncer with a checklist. You are a thoughtful recruiter who asks: "Would a hiring manager want to meet this person?"
That means:
- A self-taught engineer with 6 years shipping production code beats a fresh CS graduate on paper.
- A missing degree is a yellow flag, not a red card.
- Every score must be explainable - HR must see why, not just what.
- Speed matters: every AI call must return within 2 seconds for live scoring.
- The nightly cron must handle 500+ candidates without choking.

⚡ **Core Principle:** The AI recommends. Humans decide. Never auto-reject. Surface every candidate - let the score guide priority, not gatekeep entirely.

## 1. The Master Skill Taxonomy
This is the canonical list the AI must know how to extract from a CV and match against a job description.

- **1.1 Programming Languages:** JavaScript, TypeScript, Python, Java, C#, C++, Go, Rust, PHP, Ruby, Swift, Kotlin, Dart, Scala, R, MATLAB, Bash, SQL, GraphQL, HTML, CSS, Solidity, Elixir, Haskell, Clojure, Erlang, Julia, Lua, Perl, Fortran, COBOL, Assembly.
- **1.2 Frontend:** React, Next.js, Vue.js, Nuxt.js, Angular, Svelte, SvelteKit, Remix, Astro, React Native, Flutter, Expo, Ionic, Tailwind CSS, Bootstrap, Material UI, Chakra UI, Radix UI, shadcn/ui, Framer Motion, Three.js, GSAP, Alpine.js, Lit, Web Components, Stencil.js, Qwik.
- **1.3 Backend:** Node.js, Express, Fastify, NestJS, Django, FastAPI, Flask, Spring Boot, Laravel, Ruby on Rails, ASP.NET Core, Hono, tRPC, gRPC, Bun, Deno, Cloudflare Workers, Vercel Edge, Phoenix, Gin, Echo, Actix-web, Axum, Ktor, Quarkus, Micronaut.
- **1.4 Databases:** PostgreSQL, MySQL, SQLite, MariaDB, MS SQL Server, Oracle DB, MongoDB, Redis, Cassandra, DynamoDB, Supabase, PlanetScale, Neon, Firebase, ClickHouse, Elasticsearch, OpenSearch, Pinecone, pgvector, Weaviate, Qdrant, Chroma, Milvus, CockroachDB, TiDB, ScyllaDB, RethinkDB, FaunaDB, Turso.
- **1.5 Cloud & Infra:** AWS, GCP, Azure, Vercel, Netlify, Railway, Render, Fly.io, Terraform, Pulumi, CDK, Ansible, Vagrant, Packer.
- **1.6 DevOps & CI/CD:** Docker, Kubernetes, Helm, GitHub Actions, GitLab CI, CircleCI, Jenkins, ArgoCD, Flux, Nginx, Caddy, Traefik, Prometheus, Grafana, DataDog, Sentry, OpenTelemetry, PagerDuty, New Relic, Splunk, ELK, Loki, Jaeger, Zipkin, Vault, Consul, Istio, Linkerd.
- **1.7 AI / ML:** TensorFlow, PyTorch, Keras, Scikit-learn, Hugging Face, LangChain, LlamaIndex, OpenAI API, Anthropic API, Vertex AI, Azure OpenAI, Pandas, NumPy, Polars, dbt, Spark, Kafka, Airflow, MLflow, Weights & Biases, XGBoost, FAISS, RAG, Fine-tuning, LoRA.
- **1.8 Mobile:** iOS, Android, React Native, Flutter, Expo, Xamarin, Capacitor, Cordova, ARKit, ARCore.
- **1.9 Security:** OAuth, OIDC, JWT, SAML, SSO, OWASP, Pentesting, SOC 2, GDPR, TLS, Vault, RBAC, WAF.
- **1.10 APIs:** REST, Webhooks, WebSockets, Stripe, Twilio, SendGrid, Resend, Clerk, Auth0, Firebase Auth, Zapier.
- **1.11 Architecture:** Microservices, Monorepo, DDD, Event-driven, CQRS, Saga, API Gateway, Message queues.
- **1.12 Testing:** Unit, Integration, E2E, Jest, Vitest, Playwright, Cypress, Selenium, TDD, BDD, k6.
- **1.13 Product:** Agile, Scrum, Kanban, JIRA, Linear, Asana, Notion, Figma, Technical writing.
- **1.14 Leadership:** Team leadership, Mentoring, Code review, Hiring, Engineering management.
- **1.15 Design:** Figma, Sketch, UX Research, Wireframing, Accessibility (WCAG).
- **1.16 Data/Analytics:** SQL, Power BI, Tableau, Looker, Google Analytics, Mixpanel, Snowflake, BigQuery.
- **1.17 Finance:** Payment processing, PCI-DSS, Core banking, KYC/AML, Trading systems.
- **1.18 Healthcare:** HL7/FHIR, HIPAA, EHR/EMR, Medical device software (IEC 62304).
- **1.19 Legal:** GDPR, Compliance monitoring, eDiscovery.
- **1.20 Marketing:** SEO, Content, Email, CRM (HubSpot/Salesforce), Paid social.

## 2. Weighted Scoring Model
- **Skill Match (35%):** Exact + partial matches.
- **Experience (30%):** Years in role × relevance multiplier.
- **Vector Similarity (20%):** Semantic CV ↔ JD cosine similarity (pgvector).
- **Education (15%):** Waivable for high-experience candidates.

## 3. Education Waiver Logic
IF `education_score < 50%` AND `experience_years >= (required_years × 1.5)` AND `skill_score >= 75%`
→ `education_score` is treated as 50 (neutral, not punitive). Audit flag: `EDUCATION_WAIVED_HIGH_EXPERIENCE`.

## 4. Two-Call LLM Architecture
- **Call 1 - Extraction:** Extract skills, years, education from CV. Target Time: ~700ms. Output: Structured JSON only.
- **Call 2 - Reasoning:** Generate human-readable audit summary. Target Time: ~500ms. Output: 1–3 sentence final_reasoning string.
- **Total Wall Time:** < 2 seconds.

## 5. Audit Log Structure
Every scoring event writes a structured `AuditLog` to the `ai_audit_log` JSONB column. Included fields:
`scored_at`, `model_used`, `weights_used`, `skill_match`, `experience`, `education`, `vector_similarity`, `final_score`, `tier`, `final_reasoning`.
