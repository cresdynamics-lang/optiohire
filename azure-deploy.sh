#!/bin/bash

# Azure Deployment Script for OptioHire
# Usage: ./azure-deploy.sh [frontend|backend|all]

set -e

RESOURCE_GROUP="optiohire-rg"
FRONTEND_APP="optiohire-frontend"
BACKEND_APP="optiohire-backend"

DEPLOY_TARGET="${1:-all}"

echo "🚀 OptioHire Azure Deployment Script"
echo "===================================="

# Check Azure CLI
if ! command -v az &> /dev/null; then
    echo "❌ Azure CLI not found. Install it from: https://docs.microsoft.com/cli/azure/install-azure-cli"
    exit 1
fi

# Check if logged in
if ! az account show &> /dev/null; then
    echo "⚠️  Not logged in to Azure. Running 'az login'..."
    az login
fi

deploy_backend() {
    echo ""
    echo "📦 Deploying Backend..."
    echo "----------------------"
    
    cd backend
    
    echo "Installing dependencies..."
    npm install --production=false
    
    echo "Building backend..."
    npm run build
    
    echo "Creating deployment package..."
    zip -r ../backend-deploy.zip . \
        -x "node_modules/*" \
        -x ".git/*" \
        -x "*.log" \
        -x ".env" \
        -x "dist/*" \
        -x "*.ts" \
        -x "!dist/**"
    
    echo "Deploying to Azure..."
    az webapp deployment source config-zip \
        --resource-group "$RESOURCE_GROUP" \
        --name "$BACKEND_APP" \
        --src ../backend-deploy.zip
    
    echo "✅ Backend deployed!"
    echo "Backend URL: https://$BACKEND_APP.azurewebsites.net"
    
    cd ..
}

deploy_frontend() {
    echo ""
    echo "🎨 Deploying Frontend..."
    echo "------------------------"
    
    cd frontend
    
    echo "Installing dependencies..."
    npm install --legacy-peer-deps
    
    echo "Building frontend..."
    npm run build
    
    echo "Creating deployment package..."
    # Include only necessary files for standalone build
    zip -r ../frontend-deploy.zip . \
        -x "node_modules/*" \
        -x ".git/*" \
        -x "*.log" \
        -x ".env.local" \
        -x ".next/cache/*" \
        -x "src/**" \
        -x "!src/app/**" \
        -x "!src/components/**" \
        -x "!src/lib/**" \
        -x "!src/hooks/**" \
        -x "!src/types/**" \
        -x "!src/utils/**" \
        -x "!src/contexts/**" \
        -x "!public/**" \
        -x "!.next/standalone/**" \
        -x "!.next/static/**"
    
    echo "Deploying to Azure..."
    az webapp deployment source config-zip \
        --resource-group "$RESOURCE_GROUP" \
        --name "$FRONTEND_APP" \
        --src ../frontend-deploy.zip
    
    echo "✅ Frontend deployed!"
    echo "Frontend URL: https://$FRONTEND_APP.azurewebsites.net"
    
    cd ..
}

# Main deployment logic
case "$DEPLOY_TARGET" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        ;;
    *)
        echo "❌ Invalid target: $DEPLOY_TARGET"
        echo "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac

echo ""
echo "✨ Deployment complete!"
echo ""
echo "Check logs:"
echo "  Backend:  az webapp log tail --name $BACKEND_APP --resource-group $RESOURCE_GROUP"
echo "  Frontend: az webapp log tail --name $FRONTEND_APP --resource-group $RESOURCE_GROUP"
