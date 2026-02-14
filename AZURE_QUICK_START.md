# Azure Quick Start Guide

**Correlation ID:** `ca364276-2b17-4d41-ae12-39769aa29b5b`

## 🚀 Quick Deployment (5 Steps)

### 1. Install Azure CLI
```bash
# macOS
brew install azure-cli

# Linux
curl -sL https://aka.ms/InstallAzureCLIDeb | sudo bash

# Windows
# Download from: https://aka.ms/installazurecliwindows
```

### 2. Login & Set Subscription
```bash
az login
az account set --subscription "YOUR_SUBSCRIPTION_ID"
```

### 3. Run Setup Script (One-Time)
```bash
# Create all Azure resources
az group create --name optiohire-rg --location eastus

# Create PostgreSQL
az postgres flexible-server create \
  --resource-group optiohire-rg \
  --name optiohire-db \
  --location eastus \
  --admin-user optiohire_admin \
  --admin-password "YOUR_SECURE_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --public-access 0.0.0.0-255.255.255.255

az postgres flexible-server db create \
  --resource-group optiohire-rg \
  --server-name optiohire-db \
  --database-name optiohire

# Create App Service Plans
az appservice plan create \
  --name optiohire-frontend-plan \
  --resource-group optiohire-rg \
  --sku B1 --is-linux

az appservice plan create \
  --name optiohire-backend-plan \
  --resource-group optiohire-rg \
  --sku B1 --is-linux

# Create App Services
az webapp create \
  --resource-group optiohire-rg \
  --plan optiohire-frontend-plan \
  --name optiohire-frontend \
  --runtime "NODE:18-lts"

az webapp create \
  --resource-group optiohire-rg \
  --plan optiohire-backend-plan \
  --name optiohire-backend \
  --runtime "NODE:18-lts"
```

### 4. Configure Environment Variables

**Backend:**
```bash
# Get database connection string
DB_URL="postgresql://optiohire_admin:YOUR_PASSWORD@optiohire-db.postgres.database.azure.com:5432/optiohire"

az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-backend \
  --settings \
    DATABASE_URL="$DB_URL" \
    DB_SSL="true" \
    PORT="3001" \
    NODE_ENV="production" \
    JWT_SECRET="YOUR_JWT_SECRET" \
    NEXT_PUBLIC_BACKEND_URL="https://optiohire-backend.azurewebsites.net" \
    USE_RESEND="true" \
    RESEND_API_KEY="YOUR_RESEND_KEY" \
    RESEND_FROM_EMAIL="noreply@optiohire.com" \
    CORS_ORIGIN="https://optiohire-frontend.azurewebsites.net"
```

**Frontend:**
```bash
az webapp config appsettings set \
  --resource-group optiohire-rg \
  --name optiohire-frontend \
  --settings \
    NEXT_PUBLIC_BACKEND_URL="https://optiohire-backend.azurewebsites.net" \
    NEXTAUTH_URL="https://optiohire-frontend.azurewebsites.net" \
    NEXTAUTH_SECRET="YOUR_NEXTAUTH_SECRET" \
    NODE_ENV="production"
```

### 5. Deploy
```bash
# Make script executable
chmod +x azure-deploy.sh

# Deploy everything
./azure-deploy.sh all

# Or deploy individually
./azure-deploy.sh backend
./azure-deploy.sh frontend
```

## 📍 URLs After Deployment

- **Frontend:** https://optiohire-frontend.azurewebsites.net
- **Backend:** https://optiohire-backend.azurewebsites.net
- **Health Check:** https://optiohire-backend.azurewebsites.net/health

## 🔍 Check Logs

```bash
# Backend logs
az webapp log tail --name optiohire-backend --resource-group optiohire-rg

# Frontend logs
az webapp log tail --name optiohire-frontend --resource-group optiohire-rg
```

## 📚 Full Documentation

See `AZURE_DEPLOYMENT_GUIDE.md` for complete instructions.

## ⚠️ Important Notes

1. **Database Password:** Save it securely - you'll need it for migrations
2. **Environment Variables:** Update all `YOUR_*` placeholders with actual values
3. **SSL:** Azure automatically provisions SSL certificates
4. **Cost:** Basic tier (B1) costs ~$13/month per App Service Plan

## 🆘 Troubleshooting

**Backend not starting?**
```bash
az webapp log tail --name optiohire-backend --resource-group optiohire-rg
```

**Database connection failed?**
- Check firewall rules allow Azure services
- Verify `DB_SSL=true` in backend settings
- Test connection: `az postgres flexible-server show --name optiohire-db --resource-group optiohire-rg`

**Frontend build fails?**
- Ensure `output: 'standalone'` in `next.config.js` ✅ (Already configured)
- Check Node version: `az webapp config show --name optiohire-frontend --resource-group optiohire-rg`

---

**Support:** Reference correlation ID `ca364276-2b17-4d41-ae12-39769aa29b5b` when contacting Azure support.
