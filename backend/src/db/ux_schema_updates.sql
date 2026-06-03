-- Migration to add fields for UX improvements

-- 1. Add company_location to companies table
ALTER TABLE companies ADD COLUMN IF NOT EXISTS company_location TEXT;

-- 2. Add job_poster_url to job_postings table
ALTER TABLE job_postings ADD COLUMN IF NOT EXISTS job_poster_url TEXT;

-- 3. Add interview_reminders to applications table
ALTER TABLE applications ADD COLUMN IF NOT EXISTS interview_reminders JSONB DEFAULT '[]'::jsonb;
