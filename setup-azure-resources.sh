#!/bin/bash

# Azure Resource Setup Script for OptioHire
# Run this AFTER: az login

set -e

RESOURCE_GROUP="optiohire-rg"
LOCATION="eastus"
DB_NAME="optiohire-db"
DB_ADMIN="optiohire_admin"
# IMPORTANT: Change this password!
DB_PASSWORD="YOUR_SECURE_PASSWORD_HERE"
FRONTEND_APP="optiohire-frontend"
BACKEND_APP="optiohire-backend"

echo "🚀 Setting up Azure Resources for OptioHire"
echo "============================================="
echo ""

# Check if logged in
if ! az account show &> /dev/null; then
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
fi

echo "✅ Logged in to Azure"
echo ""

# Step 1: Create Resource Group
echo "📦 Step 1: Creating Resource Group..."
az group create \
  --name "$RESOURCE_GROUP" \
  --location "$LOCATION"
echo "✅ Resource Group created"
echo ""

# Step 2: Create PostgreSQL Database
echo "🗄️  Step 2: Creating PostgreSQL Database..."
echo "⚠️  This may take 5-10 minutes..."
az postgres flexible-server create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DB_NAME" \
  --location "$LOCATION" \
  --admin-user "$DB_ADMIN" \
  --admin-password "$DB_PASSWORD" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32 \
  --public-access 0.0.0.0-255.255.255.255

az postgres flexible-server db create \
  --resource-group "$RESOURCE_GROUP" \
  --server-name "$DB_NAME" \
  --database-name optiohire

az postgres flexible-server firewall-rule create \
  --resource-group "$RESOURCE_GROUP" \
  --name "$DB_NAME" \
  --rule-name AllowAzureServices \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 0.0.0.0

echo "✅ PostgreSQL Database created"
echo "   Database URL: postgresql://$DB_ADMIN:$DB_PASSWORD@$DB_NAME.postgres.database.azure.com:5432/optiohire"
echo ""

# Step 3: Create App Service Plans
echo "📋 Step 3: Creating App Service Plans..."
az appservice plan create \
  --name optiohire-frontend-plan \
  --resource-group "$RESOURCE_GROUP" \
  --sku B1 \
  --is-linux

az appservice plan create \
  --name optiohire-backend-plan \
  --resource-group "$RESOURCE_GROUP" \
  --sku B1 \
  --is-linux

echo "✅ App Service Plans created"
echo ""

# Step 4: Create App Services
echo "🌐 Step 4: Creating App Services..."
az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan optiohire-frontend-plan \
  --name "$FRONTEND_APP" \
  --runtime "NODE:18-lts"

az webapp create \
  --resource-group "$RESOURCE_GROUP" \
  --plan optiohire-backend-plan \
  --name "$BACKEND_APP" \
  --runtime "NODE:18-lts"

echo "✅ App Services created"
echo ""

# Step 5: Configure Backend Environment Variables
echo "⚙️  Step 5: Configuring Backend Environment Variables..."
DB_URL="postgresql://$DB_ADMIN:$DB_PASSWORD@$DB_NAME.postgres.database.azure.com:5432/optiohire"

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --settings \
    DATABASE_URL="$DB_URL" \
    DB_SSL="true" \
    PORT="3001" \
    NODE_ENV="production" \
    JWT_SECRET="optiohire_jwt_secret_change_in_production_2024" \
    NEXT_PUBLIC_BACKEND_URL="https://$BACKEND_APP.azurewebsites.net" \
    CORS_ORIGIN="https://$FRONTEND_APP.azurewebsites.net"

echo "✅ Backend environment variables configured"
echo "   ⚠️  Remember to add your email, AI, and other API keys manually!"
echo ""

# Step 6: Configure Frontend Environment Variables
echo "🎨 Step 6: Configuring Frontend Environment Variables..."
az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$FRONTEND_APP" \
  --settings \
    NEXT_PUBLIC_BACKEND_URL="https://$BACKEND_APP.azurewebsites.net" \
    NEXTAUTH_URL="https://$FRONTEND_APP.azurewebsites.net" \
    NEXTAUTH_SECRET="optiohire_nextauth_secret_change_this" \
    NODE_ENV="production"

echo "✅ Frontend environment variables configured"
echo ""

# Step 7: Enable Always On
echo "🔧 Step 7: Enabling Always On..."
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$BACKEND_APP" \
  --always-on true

echo "✅ Always On enabled for backend"
echo ""

echo "✨ Azure Resources Setup Complete!"
echo ""
echo "📋 Summary:"
echo "   Resource Group: $RESOURCE_GROUP"
echo "   Frontend URL: https://$FRONTEND_APP.azurewebsites.net"
echo "   Backend URL: https://$BACKEND_APP.azurewebsites.net"
echo "   Database: $DB_NAME.postgres.database.azure.com"
echo ""
echo "⚠️  IMPORTANT NEXT STEPS:"
echo "   1. Add your email API keys (Resend, SMTP) to backend settings"
echo "   2. Add your AI API keys (Groq) to backend settings"
echo "   3. Add IMAP credentials if enabling email reader"
echo "   4. Run database migrations"
echo "   5. Deploy your code using: ./azure-deploy.sh all"
echo ""
echo "💾 Save your database password securely: $DB_PASSWORD"
