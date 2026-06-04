-- Migration to add demos table and seen_at status for tickets

CREATE TABLE IF NOT EXISTS demos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    hr_email VARCHAR(255) NOT NULL,
    company_name VARCHAR(255),
    demo_time TIMESTAMP WITH TIME ZONE NOT NULL,
    meeting_link TEXT,
    status VARCHAR(50) DEFAULT 'open', -- 'open', 'seen'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add seen_at to support_tickets if it doesn't exist
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS seen_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE support_tickets ADD COLUMN IF NOT EXISTS seen_by VARCHAR(255);
