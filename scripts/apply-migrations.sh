#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Applying Database Migrations...${NC}"

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo -e "${YELLOW}⚠️  DATABASE_URL not set. Loading from backend/.env...${NC}"
    if [ -f "backend/.env" ]; then
        export $(grep -v '^#' backend/.env | xargs)
    else
        echo -e "${RED}❌ Error: DATABASE_URL not found and backend/.env doesn't exist${NC}"
        echo -e "${YELLOW}Please set DATABASE_URL environment variable or create backend/.env${NC}"
        exit 1
    fi
fi

if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ Error: DATABASE_URL is still not set${NC}"
    exit 1
fi

# Apply performance indexes migration
echo -e "${YELLOW}📊 Applying performance indexes migration...${NC}"
psql "$DATABASE_URL" -f backend/src/db/migrations/add_performance_indexes.sql

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Performance indexes migration applied successfully${NC}"
else
    echo -e "${RED}❌ Error applying migration${NC}"
    exit 1
fi

echo -e "${GREEN}✅ All migrations applied successfully!${NC}"
