#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 Deploying OptioHire Improvements${NC}"
echo ""

# Step 1: Update environment configuration
echo -e "${YELLOW}Step 1: Updating environment configuration...${NC}"
./scripts/update-env-config.sh
echo ""

# Step 2: Apply database migrations
echo -e "${YELLOW}Step 2: Applying database migrations...${NC}"
if [ -z "$DATABASE_URL" ] && [ -f "backend/.env" ]; then
    export $(grep -v '^#' backend/.env | grep DATABASE_URL | xargs)
fi

if [ -n "$DATABASE_URL" ]; then
    ./scripts/apply-migrations.sh
else
    echo -e "${RED}⚠️  DATABASE_URL not set. Skipping migration.${NC}"
    echo -e "${YELLOW}Run manually: psql \$DATABASE_URL -f backend/src/db/migrations/add_performance_indexes.sql${NC}"
fi
echo ""

# Step 3: Setup Redis (optional)
echo -e "${YELLOW}Step 3: Setting up Redis (optional)...${NC}"
read -p "Do you want to setup Redis cache? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ./scripts/setup-redis.sh
else
    echo -e "${YELLOW}⚠️  Skipping Redis setup. Caching will be disabled.${NC}"
fi
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}Step 4: Installing dependencies...${NC}"
cd backend
npm install
cd ..
echo ""

# Step 5: Build backend
echo -e "${YELLOW}Step 5: Building backend...${NC}"
cd backend
npm run build
cd ..
echo ""

# Step 6: Verify installation
echo -e "${YELLOW}Step 6: Verifying installation...${NC}"
if [ -f "backend/dist/server.js" ]; then
    echo -e "${GREEN}✅ Backend build successful${NC}"
else
    echo -e "${RED}❌ Backend build failed${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ All improvements deployed successfully!${NC}"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. Review backend/.env and update any placeholder values"
echo "  2. Start the backend: cd backend && npm start"
echo "  3. Test health endpoint: curl http://localhost:3001/health"
echo "  4. Check admin debugging tools: curl http://localhost:3001/api/admin/debug/diagnostics"
echo ""
