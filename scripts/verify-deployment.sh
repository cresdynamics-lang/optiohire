#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Verifying Deployment...${NC}"
echo ""

# Check if backend is built
echo -e "${YELLOW}Checking backend build...${NC}"
if [ -f "backend/dist/server.js" ]; then
    echo -e "${GREEN}✅ Backend build exists${NC}"
else
    echo -e "${RED}❌ Backend not built. Run: cd backend && npm run build${NC}"
fi

# Check environment file
echo -e "${YELLOW}Checking environment configuration...${NC}"
if [ -f "backend/.env" ]; then
    echo -e "${GREEN}✅ backend/.env exists${NC}"
    
    # Check for required variables
    if grep -q "^DATABASE_URL=" backend/.env && ! grep -q "^DATABASE_URL=$" backend/.env; then
        echo -e "${GREEN}✅ DATABASE_URL is set${NC}"
    else
        echo -e "${RED}❌ DATABASE_URL not configured${NC}"
    fi
    
    if grep -q "^JWT_SECRET=" backend/.env && ! grep -q "your_jwt_secret\|a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568" backend/.env; then
        echo -e "${GREEN}✅ JWT_SECRET is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  JWT_SECRET may need updating${NC}"
    fi
    
    if grep -q "^ADMIN_SECRET_TOKEN=" backend/.env && ! grep -q "^ADMIN_SECRET_TOKEN=your_secure_admin_token_here" backend/.env; then
        echo -e "${GREEN}✅ ADMIN_SECRET_TOKEN is configured${NC}"
    else
        echo -e "${YELLOW}⚠️  ADMIN_SECRET_TOKEN may need updating${NC}"
    fi
else
    echo -e "${RED}❌ backend/.env not found${NC}"
fi

# Check Redis (optional)
echo -e "${YELLOW}Checking Redis (optional)...${NC}"
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null 2>&1; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis is installed but not running${NC}"
    fi
elif docker ps | grep -q optiohire-redis; then
    echo -e "${GREEN}✅ Redis container is running${NC}"
else
    echo -e "${YELLOW}⚠️  Redis not configured (optional - caching will be disabled)${NC}"
fi

# Check dependencies
echo -e "${YELLOW}Checking dependencies...${NC}"
if [ -d "backend/node_modules" ]; then
    echo -e "${GREEN}✅ Backend dependencies installed${NC}"
else
    echo -e "${RED}❌ Backend dependencies not installed. Run: cd backend && npm install${NC}"
fi

echo ""
echo -e "${BLUE}Verification complete!${NC}"
