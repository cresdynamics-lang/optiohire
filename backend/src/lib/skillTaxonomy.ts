export const SKILL_TAXONOMY = {
  "Programming Languages": [
    "JavaScript", "TypeScript", "Python", "Java", "C#", "C++", "Go", "Rust", "PHP", "Ruby",
    "Swift", "Kotlin", "Dart", "Scala", "R", "MATLAB", "Bash/Shell", "SQL", "GraphQL", "HTML", "CSS"
  ],
  "Frontend Frameworks & Libraries": [
    "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit",
    "Remix", "Astro", "React Native", "Flutter", "Expo", "Tailwind CSS", "Bootstrap",
    "Material UI", "Chakra UI", "Radix UI", "shadcn/ui", "Framer Motion", "Three.js"
  ],
  "Backend Frameworks & Runtimes": [
    "Node.js", "Express", "Fastify", "NestJS", "Django", "FastAPI", "Flask", "Spring Boot",
    "Laravel", "Rails", "ASP.NET Core", "Hono", "tRPC", "GraphQL (server)", "gRPC",
    "Bun", "Deno", "Cloudflare Workers", "Vercel Edge"
  ],
  "Databases & Data Stores": [
    "PostgreSQL", "MySQL", "SQLite", "MongoDB", "Redis", "Cassandra", "DynamoDB",
    "Supabase", "PlanetScale", "Neon", "Firebase Firestore", "ClickHouse",
    "Elasticsearch", "Pinecone", "pgvector", "Weaviate", "Qdrant", "Chroma"
  ],
  "Cloud & Infrastructure": [
    "AWS", "EC2", "S3", "Lambda", "RDS", "SQS", "SNS", "ECS", "EKS", "CloudFront",
    "GCP", "Cloud Run", "BigQuery", "GKE", "Pub/Sub",
    "Azure", "App Service", "AKS", "Blob Storage",
    "Vercel", "Netlify", "Railway", "Render", "Fly.io",
    "Terraform", "Pulumi", "CDK", "Ansible"
  ],
  "DevOps & CI/CD": [
    "Docker", "Kubernetes", "Helm", "GitHub Actions", "GitLab CI", "CircleCI",
    "Jenkins", "ArgoCD", "Flux", "Nginx", "Caddy", "Traefik",
    "Prometheus", "Grafana", "DataDog", "Sentry", "OpenTelemetry", "PagerDuty"
  ],
  "AI / ML & Data": [
    "TensorFlow", "PyTorch", "Keras", "Scikit-learn", "Hugging Face Transformers",
    "LangChain", "LlamaIndex", "OpenAI API", "Anthropic API", "Vertex AI",
    "Pandas", "NumPy", "Polars", "dbt", "Apache Spark", "Kafka", "Airflow",
    "Vector embeddings", "RAG", "Fine-tuning", "Prompt engineering"
  ],
  "Mobile": [
    "iOS", "UIKit", "SwiftUI", "Android", "Jetpack Compose", "XML",
    "Push Notifications", "App Store deployment", "Play Store deployment",
    "Fastlane", "Bitrise"
  ],
  "Security & Auth": [
    "OAuth 2.0", "OpenID Connect", "JWT", "SAML", "SSO",
    "OWASP Top 10", "Penetration testing", "SOC 2", "GDPR compliance",
    "Cryptography", "Vault", "AWS Secrets Manager",
    "Row-level security", "RBAC"
  ],
  "APIs & Integrations": [
    "REST API", "Webhooks", "WebSockets", "Server-Sent Events",
    "Stripe", "Twilio", "SendGrid", "Resend", "Clerk", "Auth0",
    "Zapier", "Make", "HubSpot", "Salesforce", "Slack API",
    "Google Workspace APIs", "Microsoft Graph"
  ],
  "Architecture & System Design": [
    "Microservices", "Monorepo", "Domain-Driven Design", "DDD",
    "Event-driven architecture", "CQRS", "Saga pattern",
    "API Gateway", "Message queues", "Rate limiting", "Caching",
    "Horizontal scaling", "Load balancing", "CDN",
    "12-factor app", "Serverless", "Edge computing"
  ],
  "Testing & Quality": [
    "Unit testing", "Integration testing", "E2E testing",
    "Jest", "Vitest", "Playwright", "Cypress", "Selenium",
    "Testing Library", "Storybook", "TDD", "BDD",
    "Code coverage", "Mutation testing", "Snapshot testing"
  ],
  "Project & Product Skills": [
    "Agile", "Scrum", "Kanban", "Sprint planning", "Roadmap ownership",
    "JIRA", "Linear", "Notion", "Confluence", "Figma",
    "Technical writing", "API documentation", "ADRs",
    "Cross-functional collaboration", "Stakeholder management"
  ],
  "Leadership & Soft Skills": [
    "Team leadership", "Mentoring", "Code review",
    "Hiring", "interviewing", "Engineering management",
    "Conflict resolution", "Presentation skills", "Remote collaboration",
    "OKR setting", "Performance reviews", "Budget management"
  ],
  "Industry-Specific (Finance / Fintech)": [
    "Payment processing", "PCI-DSS", "Open Banking", "KYC", "AML",
    "Core banking systems", "Trading systems", "Risk modelling",
    "Financial modelling", "Excel", "VBA", "Bloomberg Terminal"
  ],
  "Industry-Specific (Healthcare / MedTech)": [
    "HL7", "FHIR", "HIPAA compliance", "EHR", "EMR",
    "Medical device software", "IEC 62304", "Clinical data management",
    "DICOM", "Telemedicine"
  ]
};

/**
 * Helper to generate a compact string representation for the LLM prompt.
 */
export function getCompactSkillTaxonomy(): string {
  return Object.entries(SKILL_TAXONOMY)
    .map(([category, skills]) => `${category}: ${skills.join(', ')}`)
    .join('\n');
}
