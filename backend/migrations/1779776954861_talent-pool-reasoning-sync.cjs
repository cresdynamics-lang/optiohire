/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Enhanced sync logic to extract data from both parsed_resume_json AND reasoning
    CREATE OR REPLACE FUNCTION sync_application_to_talent_pool() RETURNS trigger AS $$
    DECLARE
        v_talent_id UUID;
        v_skills TEXT[];
        v_summary TEXT;
        v_reasoning JSONB;
    BEGIN
        -- 1. Try to extract from reasoning (currently stores AI summary/strengths)
        IF NEW.reasoning IS NOT NULL AND NEW.reasoning != '' THEN
            BEGIN
                v_reasoning := NEW.reasoning::JSONB;
                v_summary := COALESCE(v_reasoning->>'overview', v_reasoning->>'summary');
                -- Extract strengths as skills if skills array is empty
                v_skills := ARRAY(SELECT jsonb_array_elements_text(COALESCE(v_reasoning->'strengths', '[]'::jsonb)));
            EXCEPTION WHEN OTHERS THEN
                -- Not valid JSON, ignore
            END;
        END IF;

        -- 2. Try to extract from parsed_resume_json (override reasoning if available)
        IF NEW.parsed_resume_json IS NOT NULL THEN
            v_skills := COALESCE(ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.parsed_resume_json->'skills', '[]'::jsonb))), v_skills);
            v_summary := COALESCE(NEW.parsed_resume_json->>'summary', v_summary);
        END IF;

        -- 3. Insert or update candidate in talent_pool
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

        -- 4. Link application to history
        IF TG_OP = 'INSERT' THEN
            INSERT INTO talent_pool_applications (talent_id, job_posting_id, application_id, applied_at)
            VALUES (v_talent_id, NEW.job_posting_id, NEW.application_id, NEW.created_at)
            ON CONFLICT DO NOTHING;
        END IF;

        -- 5. Update total application count
        UPDATE talent_pool 
        SET total_applications = (SELECT COUNT(*) FROM talent_pool_applications WHERE talent_id = v_talent_id)
        WHERE talent_id = v_talent_id;

        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    -- Update trigger to also fire on 'reasoning' column updates
    DROP TRIGGER IF EXISTS trg_sync_application_to_talent_pool ON applications;
    CREATE TRIGGER trg_sync_application_to_talent_pool
    AFTER INSERT OR UPDATE OF candidate_name, phone, resume_url, parsed_resume_json, reasoning ON applications
    FOR EACH ROW EXECUTE FUNCTION sync_application_to_talent_pool();

    -- Trigger update on all applications to backfill the data from reasoning
    UPDATE applications SET updated_at = NOW();
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    CREATE OR REPLACE FUNCTION sync_application_to_talent_pool() RETURNS trigger AS $$
    DECLARE
        v_talent_id UUID;
        v_skills TEXT[];
        v_summary TEXT;
    BEGIN
        IF NEW.parsed_resume_json IS NOT NULL THEN
            v_skills := ARRAY(SELECT jsonb_array_elements_text(COALESCE(NEW.parsed_resume_json->'skills', '[]'::jsonb)));
            v_summary := NEW.parsed_resume_json->>'summary';
        END IF;

        INSERT INTO talent_pool (email, candidate_name, phone, resume_url, parsed_resume_json, skills, experience_summary, updated_at)
        VALUES (NEW.email, NEW.candidate_name, NEW.phone, NEW.resume_url, NEW.parsed_resume_json, COALESCE(v_skills, '{}'::TEXT[]), v_summary, NOW())
        ON CONFLICT (email) DO UPDATE SET
            candidate_name = EXCLUDED.candidate_name,
            phone = COALESCE(EXCLUDED.phone, talent_pool.phone),
            resume_url = COALESCE(EXCLUDED.resume_url, talent_pool.resume_url),
            parsed_resume_json = COALESCE(EXCLUDED.parsed_resume_json, talent_pool.parsed_resume_json),
            updated_at = NOW();

        IF TG_OP = 'INSERT' THEN
            INSERT INTO talent_pool_applications (talent_id, job_posting_id, application_id, applied_at)
            VALUES (v_talent_id, NEW.job_posting_id, NEW.application_id, NEW.created_at)
            ON CONFLICT DO NOTHING;
        END IF;

        RETURN NEW;
    END
    $$ LANGUAGE plpgsql;
  `);
};
