/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Update function to handle BOTH insert and update of critical data
    CREATE OR REPLACE FUNCTION sync_application_to_talent_pool() RETURNS trigger AS $$
    DECLARE
        v_talent_id UUID;
        v_skills TEXT[];
        v_summary TEXT;
    BEGIN
        -- 1. Extract skills and summary from parsed_resume_json if available
        -- We assume the JSON structure has 'skills' (array) and 'summary' (text)
        IF NEW.parsed_resume_json IS NOT NULL THEN
            v_skills := ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.parsed_resume_json->'skills', '[]'::jsonb)));
            v_summary := NEW.parsed_resume_json->>'summary';
        END IF;

        -- 2. Insert or update candidate in talent_pool
        INSERT INTO talent_pool (
            email, 
            candidate_name, 
            phone, 
            resume_url, 
            parsed_resume_json, 
            skills,
            experience_summary,
            updated_at
        )
        VALUES (
            NEW.email, 
            NEW.candidate_name, 
            NEW.phone, 
            NEW.resume_url, 
            NEW.parsed_resume_json, 
            COALESCE(v_skills, '{}'::TEXT[]),
            v_summary,
            NOW()
        )
        ON CONFLICT (email) DO UPDATE SET
            candidate_name = EXCLUDED.candidate_name,
            phone = COALESCE(EXCLUDED.phone, talent_pool.phone),
            resume_url = COALESCE(EXCLUDED.resume_url, talent_pool.resume_url),
            parsed_resume_json = COALESCE(EXCLUDED.parsed_resume_json, talent_pool.parsed_resume_json),
            skills = CASE WHEN array_length(EXCLUDED.skills, 1) > 0 THEN EXCLUDED.skills ELSE talent_pool.skills END,
            experience_summary = COALESCE(EXCLUDED.experience_summary, talent_pool.experience_summary),
            updated_at = NOW()
        RETURNING talent_id INTO v_talent_id;

        -- 3. Link application to history (only if it's a new application row)
        -- Note: TG_OP is 'INSERT' or 'UPDATE'
        IF TG_OP = 'INSERT' THEN
            INSERT INTO talent_pool_applications (talent_id, job_posting_id, application_id, applied_at)
            VALUES (v_talent_id, NEW.job_posting_id, NEW.application_id, NEW.created_at)
            ON CONFLICT DO NOTHING;
        END IF;

        -- 4. Always update total application count for accuracy
        UPDATE talent_pool 
        SET total_applications = (SELECT COUNT(*) FROM talent_pool_applications WHERE talent_id = v_talent_id)
        WHERE talent_id = v_talent_id;

        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    -- 5. Update trigger to fire on BOTH INSERT and UPDATE of relevant columns
    DROP TRIGGER IF EXISTS trg_sync_application_to_talent_pool ON applications;
    CREATE TRIGGER trg_sync_application_to_talent_pool
    AFTER INSERT OR UPDATE OF candidate_name, phone, resume_url, parsed_resume_json ON applications
    FOR EACH ROW EXECUTE FUNCTION sync_application_to_talent_pool();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    -- Revert to original INSERT-only logic if needed
    DROP TRIGGER IF EXISTS trg_sync_application_to_talent_pool ON applications;
    
    CREATE OR REPLACE FUNCTION sync_application_to_talent_pool() RETURNS trigger AS $$
    DECLARE
        v_talent_id UUID;
    BEGIN
        INSERT INTO talent_pool (email, candidate_name, phone, resume_url, parsed_resume_json, updated_at)
        VALUES (NEW.email, NEW.candidate_name, NEW.phone, NEW.resume_url, NEW.parsed_resume_json, NOW())
        ON CONFLICT (email) DO UPDATE SET
            candidate_name = EXCLUDED.candidate_name,
            phone = COALESCE(EXCLUDED.phone, talent_pool.phone),
            resume_url = COALESCE(EXCLUDED.resume_url, talent_pool.resume_url),
            parsed_resume_json = COALESCE(EXCLUDED.parsed_resume_json, talent_pool.parsed_resume_json),
            updated_at = NOW()
        RETURNING talent_id INTO v_talent_id;

        INSERT INTO talent_pool_applications (talent_id, job_posting_id, application_id, applied_at)
        VALUES (v_talent_id, NEW.job_posting_id, NEW.application_id, NEW.created_at)
        ON CONFLICT DO NOTHING;

        UPDATE talent_pool 
        SET total_applications = (SELECT COUNT(*) FROM talent_pool_applications WHERE talent_id = v_talent_id)
        WHERE talent_id = v_talent_id;

        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_sync_application_to_talent_pool
    AFTER INSERT ON applications
    FOR EACH ROW EXECUTE FUNCTION sync_application_to_talent_pool();
  `);
};
