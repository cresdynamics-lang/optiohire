#!/bin/bash
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Digital Ocean server details
REMOTE_HOST="root@143.244.162.13"
APP_DIR="/opt/optiohire"

echo -e "${GREEN}🚀 Deploying OptioHire to Digital Ocean server...${NC}"

# Check if REMOTE_HOST is set
if [ "$REMOTE_HOST" = "root@YOUR_DIGITAL_OCEAN_IP_OR_DOMAIN" ]; then
    echo -e "${RED}Error: Please set your Digital Ocean server IP/domain in REMOTE_HOST${NC}"
    echo -e "${YELLOW}Update the REMOTE_HOST variable in this script${NC}"
    exit 1
fi

# Build backend
echo -e "${YELLOW}Building backend...${NC}"
cd backend
npm install --production=false
npm run build
cd ..

# Build frontend
echo -e "${YELLOW}Building frontend...${NC}"
cd frontend
npm install --production=false
npm run build
cd ..

# Copy files to server
echo -e "${YELLOW}Copying files to Digital Ocean server...${NC}"
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    ./ $REMOTE_HOST:$APP_DIR/

# Update environment variables on server
echo -e "${YELLOW}Updating environment variables on server...${NC}"
ssh $REMOTE_HOST "cat > $APP_DIR/backend/.env << 'EOF'
# ============================================================================
# COMPLETE .ENV FILE - Production Ready (Digital Ocean)
# ============================================================================

# ============================================================================
# PostgreSQL Database Configuration (REQUIRED)
# ============================================================================
DATABASE_URL=postgresql://optiohire_user:optiohire_pass_2024@localhost:5432/optiohire
DB_SSL=false
DATABASE_URL_POOLER=your_pooler_connection_string
DATABASE_URL_DIRECT=your_direct_connection_string

# ============================================================================
# Backend Server Configuration
# ============================================================================
PORT=3001
NODE_ENV=production
JWT_SECRET=a6869b3fb2a7b56cb33c58d07cf69548ee1ccbe9f6ec2aa54ce13d1a1bafeedae2d88ee36ed7d92f0e29d573d68c2335fe187eb7cf3890be9b7d4bf216cfd568

# ============================================================================
# Frontend Configuration
# ============================================================================
NEXT_PUBLIC_BACKEND_URL=http://143.244.162.13:3001
NEXTAUTH_URL=http://143.244.162.13:3000
NEXTAUTH_SECRET=Qp1zBfvTdo7wjiK5BxRhj8VzqLKHZuj6y349jdARSJE=
NEXT_PUBLIC_APP_URL=http://143.244.162.13

# ============================================================================
# Google SSO / OAuth Configuration
# ============================================================================
GOOGLE_CLIENT_ID=22019726883-av15fmt3osj3feqsbm539bdg05728tsj.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_REDIRECT_URI=http://143.244.162.13:3000/auth/google/callback

# ============================================================================
# Email Configuration - Priority: Resend > SendGrid > SMTP
# ============================================================================
USE_RESEND=true
RESEND_API_KEY=re_a3ZF8uD6_FRk3Xo8ATzYKCNhFK2RLHTsP
RESEND_DOMAIN=optiohire.com
RESEND_FROM_EMAIL=noreply@optiohire.com
RESEND_FROM_NAME=OptioHire

USE_SENDGRID=false
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=noreply@optiohire.com
SENDGRID_FROM_NAME=OptioHire

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=nelsonochieng516@gmail.com
SMTP_PASS=mfbt hngy awnu guou

MAIL_HOST=smtp.gmail.com
MAIL_USER=hirebitapplications@gmail.com
MAIL_PASS=mfbt hngy awnu guou
MAIL_PORT=587

# ============================================================================
# IMAP Configuration (Email Reading)
# ============================================================================
IMAP_HOST=imap.gmail.com
IMAP_PORT=993
IMAP_USER=nelsonochieng516@gmail.com
IMAP_PASS=mfbt hngy awnu guou
IMAP_SECURE=true
IMAP_POLL_MS=10000
ENABLE_EMAIL_READER=true

# ============================================================================
# Groq AI Configuration (Primary - Fast & Cost-Effective)
# ============================================================================
# Using Groq for testing and development - much faster and cheaper than Gemini
# API Keys assigned by complexity/task requirements:

# Primary API Key (General use, scoring, fast tasks)
GROQ_API_KEY=your_groq_api_key
GROQ_MODEL=llama-3.1-8b-instant  # Fast model for general tasks

# Advanced API Key (Reports, complex analysis)
GROQ_API_KEY_002=your_groq_api_key_002
GROQ_REPORT_MODEL=llama-3.3-70b-versatile  # Better model for report generation

# Premium API Key (Resume parsing, structured data extraction)
GROQ_API_KEY_003=your_groq_api_key_003
GROQ_SCORING_MODEL=llama-3.1-8b-instant  # For candidate scoring
GROQ_RESUME_PARSER_MODEL=moonshotai/kimi-k2-instruct  # For CV parsing

# AI Provider Selection (currently using Groq)
AI_PROVIDER=groq

# ============================================================================
# Gemini API Configuration (Future Production - Advanced Features)
# ============================================================================
# NOTE: Keep for future production use - better at structured JSON extraction
# GEMINI_API_KEY=your_gemini_api_key
# GEMINI_API_KEY_002=your_gemini_api_key_002
# GEMINI_API_KEY_003=your_gemini_api_key_003
# REPORT_AI_MODEL=gemini-2.0-flash
# SCORING_MODEL=gemini-2.0-flash
# RESUME_PARSER_MODEL=gemini-2.0-flash
# CV_EXTRACTION_MODEL=gemini-2.0-flash

AI_CV_ANALYSIS_ENABLED=true
AI_CV_CONFIDENCE_THRESHOLD=0.7
AI_CV_MAX_FILE_SIZE=10485760
AI_CV_SUPPORTED_FORMATS=pdf,doc,docx,txt
CV_SKILLS_EXTRACTION_ENABLED=true

# ============================================================================
# Job Posting APIs
# ============================================================================
LINKEDIN_ACCESS_TOKEN=your_linkedin_access_token
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret
INDEED_PUBLISHER_ID=your_indeed_publisher_id
INDEED_API_KEY=your_indeed_api_key
GLASSDOOR_PARTNER_ID=your_glassdoor_partner_id
GLASSDOOR_KEY=your_glassdoor_key

# ============================================================================
# CV Cron Watch & Processing
# ============================================================================
CV_WATCH_ENABLED=true
CV_WATCH_INTERVAL=300000
CV_PROCESSING_BATCH_SIZE=10
CV_WATCH_DIRECTORIES=./uploads/cvs,./storage/resumes

# ============================================================================
# Activation APIs
# ============================================================================
ACTIVATION_EMAIL_TEMPLATE_ID=activation_welcome_template
AUTO_ACTIVATION_ENABLED=true
ACTIVATION_WEBHOOK_URL=https://your-webhook.com/activation
USER_ACTIVATION_TOKEN_SECRET=KSF7gYJSQPUcgHTZ5mK7ZLcgrxWnNPgi0qbcjiDKskA=

# ============================================================================
# Email Automation (Rejected & Shortlisted Candidates)
# ============================================================================
REJECTION_EMAIL_TEMPLATE_ID=template_rejection
SHORTLIST_EMAIL_TEMPLATE_ID=template_shortlist
AUTO_EMAIL_REJECTION=true
AUTO_EMAIL_SHORTLIST=true
HR_NOTIFICATION_EMAIL=hr@company.com
CANDIDATE_UPDATE_WEBHOOK=https://your-webhook.com/candidate-updates

# ============================================================================
# HR Notifications & Updates
# ============================================================================
HR_NOTIFICATION_WEBHOOK=https://your-n8n-instance.com/webhook/hr-notifications
HR_EMAIL_NOTIFICATIONS=true
HR_SLACK_WEBHOOK=https://hooks.slack.com/services/your/slack/webhook
HR_UPDATE_FREQUENCY=3600000
NEW_APPLICATION_ALERTS=true

# ============================================================================
# Webhook Configuration (N8N)
# ============================================================================
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook/company-details
N8N_INCOMING_WEBHOOK_URL=https://your-n8n-instance.com/webhook/incoming-data
PUBLIC_API_BASE_URL=http://143.244.162.13:3001

# ============================================================================
# Cron/Security Configuration
# ============================================================================
CRON_SECRET=your_cron_secret_key_here
DISABLE_REPORT_SCHEDULER=false

# ============================================================================
# Admin Configuration
# ============================================================================
ADMIN_EMAIL=manage@optiohire.com
ADMIN_PASSWORD=Admin@2026

# ============================================================================
# Storage Configuration (S3 Compatible)
# ============================================================================
S3_BUCKET=resumes
S3_ACCESS_KEY=your-access-key-id
S3_SECRET_KEY=your-secret-access-key
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=us-east-1
S3_BUCKET_URL=https://your-s3-bucket-url.com/resumes
PDF_BUCKET_URL=https://your-s3-bucket-url.com/resumes
PDF_BUCKET_KEY=your-bucket-key
FILE_STORAGE_DIR=./storage

# ============================================================================
# Performance & Monitoring
# ============================================================================
ENABLE_PERFORMANCE_MONITORING=true
LOG_LEVEL=info
METRICS_WEBHOOK=https://your-monitoring.com/webhook

# ============================================================================
# Deployment & Environment Control
# ============================================================================
ENV_FILE=./backend/.env
EOF"

# Install production dependencies on server
echo -e "${YELLOW}Installing production dependencies on server...${NC}"
ssh $REMOTE_HOST "cd $APP_DIR/backend && npm install --production"
ssh $REMOTE_HOST "cd $APP_DIR/frontend && npm install --production"

# Restart services
echo -e "${YELLOW}Restarting services on server...${NC}"
ssh $REMOTE_HOST "cd $APP_DIR && pm2 restart ecosystem.config.js --update-env"
ssh $REMOTE_HOST "pm2 save"

# Test the deployment
echo -e "${YELLOW}Testing deployment...${NC}"
sleep 5

# Extract IP from REMOTE_HOST for health checks
SERVER_IP=$(echo $REMOTE_HOST | cut -d'@' -f2)

if curl -s --max-time 10 http://$SERVER_IP:3001/health > /dev/null; then
    echo -e "${GREEN}✅ Backend is responding${NC}"
else
    echo -e "${RED}❌ Backend not responding${NC}"
fi

if curl -s --max-time 10 http://$SERVER_IP:3000 > /dev/null; then
    echo -e "${GREEN}✅ Frontend is responding${NC}"
else
    echo -e "${RED}❌ Frontend not responding${NC}"
fi

echo -e "${GREEN}✅ Deployment to Digital Ocean complete!${NC}"
echo -e "${YELLOW}Your application should now be running with Resend email functionality${NC}"





