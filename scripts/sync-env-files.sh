#!/bin/bash
# ============================================================================
# Sync Environment Files Script
# ============================================================================
# This script helps keep all .env.example files in sync
# Run: bash scripts/sync-env-files.sh
# ============================================================================

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_ROOT"

echo "🔄 Syncing environment files..."
echo ""

# Check if root env.example exists
if [ ! -f "env.example" ]; then
    echo "❌ Error: env.example not found in project root"
    exit 1
fi

echo "✅ Found env.example in project root"
echo ""

# Update backend/.env.example
if [ -f "backend/.env.example" ]; then
    echo "📝 Updating backend/.env.example..."
    # Extract backend-specific variables from root env.example
    grep -E "^# =|^DATABASE_URL|^DB_SSL|^PORT|^NODE_ENV|^JWT_SECRET|^SMTP_|^IMAP_|^ENABLE_EMAIL|^GEMINI_|^REPORT_AI|^SCORING_MODEL|^RESUME_PARSER|^N8N_|^PUBLIC_API|^CRON_SECRET|^DISABLE_|^S3_|^PDF_BUCKET" env.example > backend/.env.example.tmp || true
    # Add backend-specific header
    {
        echo "# ============================================================================"
        echo "# Backend Environment Variables (.env)"
        echo "# ============================================================================"
        echo "# Copy this file to backend/.env and fill in your actual values"
        echo "# See env.example in project root for complete documentation"
        echo "# ============================================================================"
        echo ""
        grep -E "^# =|^DATABASE_URL|^DB_SSL|^PORT|^NODE_ENV|^JWT_SECRET|^SMTP_|^IMAP_|^ENABLE_EMAIL|^GEMINI_|^REPORT_AI|^SCORING_MODEL|^RESUME_PARSER|^N8N_|^PUBLIC_API|^CRON_SECRET|^DISABLE_|^S3_|^PDF_BUCKET" env.example
    } > backend/.env.example
    echo "✅ Updated backend/.env.example"
else
    echo "⚠️  backend/.env.example not found, creating..."
    cp env.example backend/.env.example
    echo "✅ Created backend/.env.example"
fi

# Update frontend/.env.example
if [ -f "frontend/.env.example" ]; then
    echo "📝 Updating frontend/.env.example..."
    # Extract frontend-specific variables
    {
        echo "# ============================================================================"
        echo "# Frontend Environment Variables (.env.local)"
        echo "# ============================================================================"
        echo "# Copy this file to frontend/.env.local and fill in your actual values"
        echo "# See env.example in project root for complete documentation"
        echo "# ============================================================================"
        echo ""
        grep -E "^# =|^NEXT_PUBLIC_|^NEXTAUTH_|^SMTP_" env.example
    } > frontend/.env.example
    echo "✅ Updated frontend/.env.example"
else
    echo "⚠️  frontend/.env.example not found, creating..."
    {
        echo "# ============================================================================"
        echo "# Frontend Environment Variables (.env.local)"
        echo "# ============================================================================"
        echo "# Copy this file to frontend/.env.local and fill in your actual values"
        echo "# ============================================================================"
        echo ""
        grep -E "^# =|^NEXT_PUBLIC_|^NEXTAUTH_|^SMTP_" env.example
    } > frontend/.env.example
    echo "✅ Created frontend/.env.example"
fi

echo ""
echo "✅ All environment files synced!"
echo ""
echo "📋 Files updated:"
echo "   - env.example (root - master template)"
echo "   - backend/.env.example"
echo "   - frontend/.env.example"
echo ""
echo "💡 Next steps:"
echo "   1. Copy backend/.env.example to backend/.env and fill in values"
echo "   2. Copy frontend/.env.example to frontend/.env.local and fill in values"
echo "   3. Never commit .env or .env.local files (they're in .gitignore)"

