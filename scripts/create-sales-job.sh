#!/bin/bash

# Create Sales job posting at Cres Dynamics
# This script creates a job posting via the backend API

BACKEND_URL=${BACKEND_URL:-"http://localhost:3001"}
ADMIN_TOKEN=${ADMIN_TOKEN:-""}

echo "📝 Creating Sales job posting at Cres Dynamics..."
echo ""

# Job posting data
JOB_DATA=$(cat <<EOF
{
  "company_name": "Cres Dynamics",
  "company_email": "hr@cresdynamics.com",
  "hr_email": "hr@cresdynamics.com",
  "job_title": "Sales",
  "job_description": "We are looking for an experienced Sales professional to join our team. The ideal candidate will have a proven track record in sales, excellent communication skills, and the ability to build strong client relationships. Responsibilities include identifying new business opportunities, managing client accounts, and achieving sales targets.",
  "required_skills": "Sales, Customer Relations, Communication, Negotiation, CRM",
  "application_deadline": "$(date -u -v+30d +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d '+30 days' +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u +%Y-%m-%dT%H:%M:%SZ)",
  "meeting_link": null
}
EOF
)

if [ -z "$ADMIN_TOKEN" ]; then
  echo "⚠️  ADMIN_TOKEN not set. Creating job via frontend API route..."
  echo ""
  echo "To create the job:"
  echo "1. Login to admin dashboard: http://localhost:3000/admin/login"
  echo "2. Navigate to job creation page"
  echo "3. Use the following details:"
  echo ""
  echo "$JOB_DATA" | jq '.'
  echo ""
  echo "Or set ADMIN_TOKEN and run this script again."
else
  echo "Creating job via API..."
  RESPONSE=$(curl -s -X POST "$BACKEND_URL/api/job-postings" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d "$JOB_DATA")
  
  echo "$RESPONSE" | jq '.'
  
  if echo "$RESPONSE" | jq -e '.success == true' > /dev/null 2>&1; then
    JOB_ID=$(echo "$RESPONSE" | jq -r '.job_posting_id')
    echo ""
    echo "✅ Job created successfully!"
    echo "   Job ID: $JOB_ID"
    echo "   Company: Cres Dynamics"
    echo "   Position: Sales"
    echo ""
    echo "📧 Email watcher will now match emails with subject containing:"
    echo "   - 'Sales'"
    echo "   - 'Cres Dynamics'"
    echo "   - 'Sales at Cres Dynamics'"
    echo "   - Or any combination of these keywords"
  else
    echo ""
    echo "❌ Failed to create job posting"
    echo "Response: $RESPONSE"
  fi
fi
