#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔴 Setting up Redis Cache...${NC}"

# Check if Redis is already running
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is already running${NC}"
        redis-cli info server | grep redis_version
        exit 0
    fi
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    echo -e "${YELLOW}🐳 Docker detected. Starting Redis container...${NC}"
    
    # Check if container already exists
    if docker ps -a | grep -q optiohire-redis; then
        echo -e "${YELLOW}Container exists, starting it...${NC}"
        docker start optiohire-redis
    else
        echo -e "${GREEN}Creating new Redis container...${NC}"
        docker run -d \
            --name optiohire-redis \
            -p 6379:6379 \
            redis:7-alpine \
            redis-server --appendonly yes
    fi
    
    sleep 2
    
    if docker ps | grep -q optiohire-redis; then
        echo -e "${GREEN}✅ Redis container started successfully${NC}"
        echo -e "${BLUE}Redis is running on: redis://localhost:6379${NC}"
        exit 0
    else
        echo -e "${RED}❌ Failed to start Redis container${NC}"
        exit 1
    fi
fi

# Check if Redis is installed locally
if command -v redis-server &> /dev/null; then
    echo -e "${YELLOW}Redis is installed locally${NC}"
    echo -e "${BLUE}Starting Redis server...${NC}"
    
    # Try to start Redis
    if redis-server --daemonize yes --port 6379; then
        sleep 1
        if redis-cli ping &> /dev/null; then
            echo -e "${GREEN}✅ Redis started successfully${NC}"
            exit 0
        fi
    fi
fi

# Installation instructions
echo -e "${YELLOW}Redis is not installed. Choose an installation method:${NC}"
echo ""
echo -e "${BLUE}Option 1: Install via Docker (Recommended)${NC}"
echo "  docker run -d --name optiohire-redis -p 6379:6379 redis:7-alpine"
echo ""
echo -e "${BLUE}Option 2: Install locally${NC}"
echo "  # Ubuntu/Debian:"
echo "  sudo apt-get update && sudo apt-get install redis-server"
echo ""
echo "  # macOS:"
echo "  brew install redis"
echo "  brew services start redis"
echo ""
echo -e "${YELLOW}After installation, run this script again to verify${NC}"
