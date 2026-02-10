#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ENV_FILE="backend/.env"
ENV_EXAMPLE="env.example"

echo -e "${BLUE}📝 Updating Environment Configuration...${NC}"

# Check if .env exists
if [ ! -f "$ENV_FILE" ]; then
    echo -e "${YELLOW}⚠️  backend/.env not found. Creating from example...${NC}"
    cp "$ENV_EXAMPLE" "$ENV_FILE"
    echo -e "${GREEN}✅ Created backend/.env from example${NC}"
    echo -e "${YELLOW}⚠️  Please update backend/.env with your actual values${NC}"
    exit 0
fi

# Function to add or update env variable
add_or_update_env() {
    local key=$1
    local value=$2
    local comment=$3
    
    if grep -q "^${key}=" "$ENV_FILE"; then
        # Update existing
        if [ -n "$comment" ]; then
            sed -i "s|^${key}=.*|${key}=${value}  # ${comment}|" "$ENV_FILE"
        else
            sed -i "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
        fi
        echo -e "${GREEN}✅ Updated ${key}${NC}"
    else
        # Add new
        if [ -n "$comment" ]; then
            echo "" >> "$ENV_FILE"
            echo "# ${comment}" >> "$ENV_FILE"
            echo "${key}=${value}" >> "$ENV_FILE"
        else
            echo "${key}=${value}" >> "$ENV_FILE"
        fi
        echo -e "${GREEN}✅ Added ${key}${NC}"
    fi
}

# Generate secure admin token if not exists
if ! grep -q "^ADMIN_SECRET_TOKEN=" "$ENV_FILE" || grep -q "^ADMIN_SECRET_TOKEN=your_secure_admin_token_here" "$ENV_FILE"; then
    ADMIN_TOKEN=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    add_or_update_env "ADMIN_SECRET_TOKEN" "$ADMIN_TOKEN" "Admin bypass security token"
fi

# Add Redis configuration section if not exists
if ! grep -q "^# Redis Cache Configuration" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# Redis Cache Configuration (Optional but Recommended)" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    add_or_update_env "REDIS_URL" "redis://localhost:6379" "Redis connection URL (optional)"
    add_or_update_env "REDIS_HOST" "localhost" "Redis host (if not using REDIS_URL)"
    add_or_update_env "REDIS_PORT" "6379" "Redis port"
    add_or_update_env "REDIS_PASSWORD" "" "Redis password (if required)"
fi

# Add Security Configuration section if not exists
if ! grep -q "^# Security Configuration" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# Security Configuration" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    if ! grep -q "^ADMIN_SECRET_TOKEN=" "$ENV_FILE"; then
        ADMIN_TOKEN=$(openssl rand -hex 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
        add_or_update_env "ADMIN_SECRET_TOKEN" "$ADMIN_TOKEN" "Admin bypass security token"
    fi
    add_or_update_env "ADMIN_EMAILS" "manage@optiohire.com" "Comma-separated list of admin emails"
fi

# Add Webhook Configuration section if not exists
if ! grep -q "^# Webhook Configuration" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# Webhook Configuration" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    add_or_update_env "WEBHOOK_URL" "" "Webhook endpoint URL (optional)"
    add_or_update_env "WEBHOOK_SECRET" "" "Webhook secret for signature verification"
fi

# Add AI Batch Processing Configuration if not exists
if ! grep -q "^AI_BATCH_SIZE=" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# AI Batch Processing Configuration" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    add_or_update_env "AI_BATCH_SIZE" "5" "Number of AI requests to batch together"
    add_or_update_env "AI_BATCH_DELAY_MS" "1000" "Delay in ms before processing batch"
fi

# Add Database Pool Configuration if not exists
if ! grep -q "^DB_POOL_MAX=" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# Database Pool Configuration" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    add_or_update_env "DB_POOL_MAX" "20" "Maximum database pool size"
    add_or_update_env "DB_POOL_MIN" "5" "Minimum database pool size"
    add_or_update_env "DB_POOL_IDLE_TIMEOUT" "30000" "Idle timeout in milliseconds"
    add_or_update_env "DB_POOL_CONNECTION_TIMEOUT" "10000" "Connection timeout in milliseconds"
    add_or_update_env "DB_STATEMENT_TIMEOUT" "30000" "Statement timeout in milliseconds"
fi

# Add Logging Configuration if not exists
if ! grep -q "^LOG_LEVEL=" "$ENV_FILE"; then
    echo "" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    echo "# Logging Configuration" >> "$ENV_FILE"
    echo "# ============================================================================" >> "$ENV_FILE"
    add_or_update_env "LOG_LEVEL" "info" "Log level: debug, info, warn, error"
fi

# Update JWT_SECRET if it's still the default
if grep -q "^JWT_SECRET=your_jwt_secret_key_change_this_in_production" "$ENV_FILE" || grep -q "^JWT_SECRET=a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568" "$ENV_FILE"; then
    NEW_JWT_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
    echo -e "${YELLOW}⚠️  Updating JWT_SECRET (old one detected)${NC}"
    sed -i "s|^JWT_SECRET=.*|JWT_SECRET=${NEW_JWT_SECRET}|" "$ENV_FILE"
    echo -e "${GREEN}✅ Updated JWT_SECRET${NC}"
    echo -e "${RED}⚠️  WARNING: All existing user sessions will be invalidated!${NC}"
fi

echo ""
echo -e "${GREEN}✅ Environment configuration updated successfully!${NC}"
echo -e "${YELLOW}📝 Please review backend/.env and update any placeholder values${NC}"
