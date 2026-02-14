# Azure Deployment Guide for OptioHire

**Correlation ID:** `ca364276-2b17-4d41-ae12-39769aa29b5b`

This guide covers deploying your Next.js frontend and Express backend to Azure App Service, along with PostgreSQL and Redis.

---

## 📋 Prerequisites

1. **Azure Account** with active subscription
2. **Azure CLI** installed: `az --version`
3. **Git** repository (GitHub/Azure DevOps)
4. **Node.js 18+** (for local builds/testing)

---

## 🏗️ Architecture Overview

```
┌─────────────────┐     ┌─────────────────┐
│  Azure App      │     │  Azure App      │
│  Service        │────▶│  Service        │
│  (Frontend)     │     │  (Backend)      │
│  Next.js        │     │  Express API    │
└─────────────────┘     └─────────────────┘
         │                       │
         │                       │
         └───────────┬───────────┘
                     │
         ┌───────────┴───────────┐
         │                       │
┌─────────────────┐     ┌─────────────────┐
│ Azure Database  │     │ Azure Cache     │
│ for PostgreSQL  │     │ for Redis       │
└─────────────────┘     └─────────────────┘
```

---

## 🚀 Step 1: Create Azure Resources

### 1.1 Login to Azure CLI

```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 1.2 Create Resource Group

```bash
az group create \
  --name optiohire-rg \
  --location eastus
```

### 1.3 Create PostgreSQL Database

```bash
# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --resource-group optiohire-rg \
  --name optiohire-db \
  --location eastus \
  --admin-user optiohire_admin \
  --admin-password "YOUR_SECURE_PASSWORD_HERE" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0-255.255.255.255

# Create database
az postgres flexible-server db create \
  --resource-group optiohire-rg \
  --server-name optiohire-db \
  --database-name optiohire

# Allow Azure services to access
az postgres flexible-server firewall-rule create \
  --resource-group optiohire-rg \
  --name optiohire-db \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0
```

**Note:** Replace `YOUR_SECURE_PASSWORD_HERE` with a strong password. Save it securely!

### 1.4 Create Redis Cache (Optional but Recommended)

```bash
az redis create \
  --resource-group optiohire-rg \
  --name optiohire-redis \
  --location eastus \
  --sku Basic \
  --vm-size c0
```

### 1.5 Create App Service Plans

```bash
# Frontend App Service Plan (Linux, Node 18)
az appservice plan create \
  --name optiohire-frontend-plan \
  --resource-group optiohire-rg \
  --sku B1 \
  --is-linux

# Backend App Service Plan (Linux, Node 18)
az appservice plan create \
  --name optiohire-backend-plan \
  --resource-group optiohire-rg \
  --sku B1 \
  --is-linux
```

### 1.6 Create App Services

```bash
# Frontend App Service
az webapp create \
  --resource-group optiohire-rg \
  --plan optiohire-frontend-plan \
  --name optiohire-frontend \
  --runtime "NODE:18-lts"

# Backend App Service
az webapp create \
  --resource-group optiohire-rg \
  --plan optiohire-backend-plan \
  --name optiohire-backend \
  --runtime "NODE:18-lts"
```

---

## ⚙️ Step 2: Configure Backend App Service

### 2.1 Set Backend Environment Variables

```bash
# Database
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    DATABASE_URL="postgresql://optiohire_admin:YOUR_PASSWORD@optiohire-db.postgres.database.azure.com:5432/optiohire" \
    DB_SSL="true" \
    PORT="3001" \
    NODE_ENV="production" \
    JWT_SECRET="YOUR_JWT_SECRET_CHANGE_THIS"

# Redis (if using)
REDIS_HOST=$(az redis show \
  --resource-group optiohire-rg \
  --name optiohire-redis \
  --query hostName -o tsv)
REDIS_PORT=$(az redis show \
  --resource-group optiohire-rg \
  --name optiohire-redis \
  --query port -o tsv)
REDIS_KEY=$(az redis list-keys \
  --resource-group optiohire-rg \
  --name optiohire-redis \
  --query primaryKey -o tsv)

az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    REDIS_HOST="$REDIS_HOST" \
    REDIS_PORT="$REDIS_PORT" \
    REDIS_PASSWORD="$REDIS_KEY"

# Email Configuration
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    USE_RESEND="true" \
    RESEND_API_KEY="re_YOUR_RESEND_KEY" \
    RESEND_FROM_EMAIL="noreply@optiohire.com" \
    RESEND_FROM_NAME="OptioHire" \
    SMTP_HOST="smtp.gmail.com" \
    SMTP_PORT="587" \
    SMTP_USER="nelsonochieng516@gmail.com" \
    SMTP_PASS="YOUR_SMTP_PASSWORD"

# IMAP Configuration (Email Reader)
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    IMAP_HOST="imap.gmail.com" \
    IMAP_PORT="993" \
    IMAP_USER="nelsonochieng516@gmail.com" \
    IMAP_PASS="YOUR_IMAP_PASSWORD" \
    IMAP_SECURE="true" \
    IMAP_POLL_MS="10000" \
    ENABLE_EMAIL_READER="true"

# AI Configuration (Groq)
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    AI_PROVIDER="groq" \
    GROQ_API_KEY="gsk_YOUR_GROQ_KEY" \
    GROQ_API_KEY_002="gsk_YOUR_GROQ_KEY_002" \
    GROQ_API_KEY_003="gsk_YOUR_GROQ_KEY_003" \
    SCORING_MODEL="llama-3.1-8b-instant" \
    REPORT_AI_MODEL="llama-3.1-8b-instant" \
    RESUME_PARSER_MODEL="llama-3.1-8b-instant"

# CORS - Allow frontend domain
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    CORS_ORIGIN="https://optiohire-frontend.azurewebsites.net"
```

### 2.2 Configure Backend Startup Command

```bash
az webapp config set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --startup-file "npm start"
```

### 2.3 Enable Always On (Backend)

```bash
az webapp config set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --always-on true
```

---

## 🎨 Step 3: Configure Frontend App Service

### 3.1 Set Frontend Environment Variables

```bash
# Backend URL
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-frontend \
  --settings \
    NEXT_PUBLIC_BACKEND_URL="https://optiohire-backend.azurewebsites.net" \
    NEXTAUTH_URL="https://optiohire-frontend.azurewebsites.net" \
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET" \
    NODE_ENV="production"

# Database (if frontend API routes need direct DB access)
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-frontend \
  --settings \
    DATABASE_URL="postgresql://optiohire_admin:YOUR_PASSWORD@optiohire-db.postgres.database.azure.com:5432/optiohire" \
    DB_SSL="true"
```

### 3.2 Configure Frontend Startup Command

```bash
az webapp config set \
  --resource-group optiohire-rg \
  --name optiohire-frontend \
  --startup-file "npm start"
```

---

## 📦 Step 4: Prepare Deployment Files

### 4.1 Create Backend Dockerfile (if not exists)

Create `backend/Dockerfile`:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist ./dist
COPY --from=build /app/node_modules ./node_modules
COPY package*.json ./
EXPOSE 3001
CMD ["node", "dist/server.js"]
```

### 4.2 Update Frontend Dockerfile (if needed)

The existing `frontend/Dockerfile` should work, but ensure it uses Node 18:

```dockerfile
FROM node:18-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

FROM node:18-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
EXPOSE 3000
ENV PORT=3000
CMD ["node", "server.js"]
```

**Important:** Ensure `next.config.js` has `output: 'standalone'`:

```javascript
const nextConfig = {
  output: 'standalone', // Required for Azure App Service
  // ... rest of config
}
```

### 4.3 Create `.deployment` Files

Create `backend/.deployment`:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

Create `frontend/.deployment`:

```ini
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

---

## 🔄 Step 5: Deploy via Azure CLI

### 5.1 Deploy Backend

```bash
cd backend

# Option 1: Deploy from local directory
az webapp up \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --runtime "NODE:18-lts" \
  --plan optiohire-backend-plan

# Option 2: Deploy via ZIP (recommended)
npm install
npm run build
zip -r ../backend-deploy.zip . -x "node_modules/*" ".git/*" "*.log"
az webapp deployment source config-zip \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --src ../backend-deploy.zip
```

### 5.2 Deploy Frontend

```bash
cd frontend

# Build locally first
npm install
npm run build

# Deploy ZIP
zip -r ../frontend-deploy.zip . -x "node_modules/*" ".git/*" "*.log" ".next/cache/*"
az webapp deployment source config-zip \
  --resource-group optiohire-rg \
  --name optiohire-frontend \
  --src ../frontend-deploy.zip
```

---

## 🔗 Step 6: Configure Custom Domain & SSL

### 6.1 Add Custom Domain (Frontend)

```bash
az webapp config hostname add \
  --webapp-name optiohire-frontend \
  --resource-group optiohire-rg \
  --hostname www.yourdomain.com
```

### 6.2 Enable HTTPS

```bash
# Azure automatically provisions SSL certificates via App Service Managed Certificates
az webapp config ssl bind \
  --name optiohire-frontend \
  --resource-group optiohire-rg \
  --certificate-thumbprint AUTO \
  --ssl-type SNI
```

---

## 🔍 Step 7: Verify Deployment

### 7.1 Check Backend Health

```bash
curl https://optiohire-backend.azurewebsites.net/health
curl https://optiohire-backend.azurewebsites.net/health/email-reader
```

### 7.2 Check Frontend

Visit: `https://optiohire-frontend.azurewebsites.net`

### 7.3 View Logs

```bash
# Backend logs
az webapp log tail \
  --resource-group optiohire-rg \
  --name optiohire-backend

# Frontend logs
az webapp log tail \
  --resource-group optiohire-rg \
  --name optiohire-frontend
```

---

## 🔄 Step 8: Set Up CI/CD (GitHub Actions)

Create `.github/workflows/azure-deploy.yml`:

```yaml
name: Deploy to Azure

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Deploy Backend
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'optiohire-backend'
          package: './backend'

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      - name: Deploy Frontend
        uses: azure/webapps-deploy@v2
        with:
          app-name: 'optiohire-frontend'
          package: './frontend'
```

**Setup Azure Credentials:**

```bash
az ad sp create-for-rbac --name "optiohire-github-actions" \
  --role contributor \
  --scopes /subscriptions/YOUR_SUBSCRIPTION_ID/resourceGroups/optiohire-rg \
  --sdk-auth
```

Copy the JSON output to GitHub Secrets as `AZURE_CREDENTIALS`.

---

## 📝 Step 9: Database Migrations

Run migrations after deployment:

```bash
# SSH into backend app service
az webapp ssh --resource-group optiohire-rg --name optiohire-backend

# Run migrations
cd /home/site/wwwroot
npm run migrate:remove-username  # or your migration script
```

---

## 🛠️ Troubleshooting

### Backend Not Starting

1. Check logs: `az webapp log tail --name optiohire-backend --resource-group optiohire-rg`
2. Verify environment variables: `az webapp config appsettings list --name optiohire-backend --resource-group optiohire-rg`
3. Check startup command: `az webapp config show --name optiohire-backend --resource-group optiohire-rg`

### Frontend Build Fails

1. Ensure `output: 'standalone'` in `next.config.js`
2. Check Node version: `az webapp config show --name optiohire-frontend --resource-group optiohire-rg`
3. Increase build timeout if needed

### Database Connection Issues

1. Verify firewall rules allow Azure services
2. Check `DB_SSL=true` in environment variables
3. Test connection: `az postgres flexible-server db show --name optiohire --server-name optiohire-db --resource-group optiohire-rg`

---

## 💰 Cost Optimization

- **Use Basic tier** for development/testing
- **Scale down** when not in use (stop App Services)
- **Use Azure Database for PostgreSQL Basic tier** (cheapest)
- **Consider Azure Static Web Apps** for frontend (free tier available)

---

## 📚 Additional Resources

- [Azure App Service Documentation](https://docs.microsoft.com/azure/app-service/)
- [Next.js on Azure](https://docs.microsoft.com/azure/static-web-apps/nextjs)
- [PostgreSQL Flexible Server](https://docs.microsoft.com/azure/postgresql/flexible-server/)

---

## ✅ Post-Deployment Checklist

- [ ] Backend health endpoint responds
- [ ] Frontend loads correctly
- [ ] Database connection works
- [ ] Email sending works (test signup)
- [ ] IMAP email reader is running (if enabled)
- [ ] SSL certificates are active
- [ ] Custom domain is configured
- [ ] CI/CD pipeline is set up
- [ ] Monitoring/alerts are configured

---

**Need Help?** Reference your correlation ID: `ca364276-2b17-4d41-ae12-39769aa29b5b` when contacting Azure support.
