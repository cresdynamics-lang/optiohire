/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Create the talent_pool table for unique candidates
  pgm.createTable('talent_pool', {
    talent_id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    email: { type: 'text', notNull: true, unique: true },
    candidate_name: { type: 'text' },
    phone: { type: 'text' },
    resume_url: { type: 'text' },
    parsed_resume_json: { type: 'jsonb' },
    skills: { type: 'text[]', default: '{}' },
    experience_summary: { type: 'text' },
    total_applications: { type: 'integer', default: 0 },
    search_vector: { type: 'tsvector' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  // 2. Create the talent_pool_applications table for history tracking
  pgm.createTable('talent_pool_applications', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    talent_id: { 
      type: 'uuid', 
      notNull: true, 
      references: '"talent_pool"', 
      onDelete: 'CASCADE' 
    },
    job_posting_id: { 
      type: 'uuid', 
      notNull: true, 
      references: '"job_postings"', 
      onDelete: 'CASCADE' 
    },
    application_id: { 
      type: 'uuid', 
      notNull: true, 
      references: '"applications"', 
      onDelete: 'CASCADE' 
    },
    applied_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('talent_pool_applications', 'unique_talent_application', {
    unique: ['talent_id', 'application_id'],
  });

  // 3. Indexes
  pgm.createIndex('talent_pool', 'email', { name: 'idx_talent_pool_email' });
  pgm.createIndex('talent_pool', 'skills', { method: 'gin', name: 'idx_talent_pool_skills_gin' });
  pgm.createIndex('talent_pool', 'parsed_resume_json', { method: 'gin', name: 'idx_talent_pool_parsed_json_gin' });
  pgm.createIndex('talent_pool', 'search_vector', { method: 'gin', name: 'idx_talent_pool_search_vector' });
  pgm.createIndex('talent_pool_applications', 'talent_id', { name: 'idx_talent_pool_apps_talent_id' });
  pgm.createIndex('talent_pool_applications', 'applied_at', { name: 'idx_talent_pool_apps_applied_at' });

  // 4. Triggers and Sync Logic
  pgm.sql(`
    CREATE OR REPLACE FUNCTION talent_pool_search_vector_trigger() RETURNS trigger AS $$
    BEGIN
      NEW.search_vector :=
        setweight(to_tsvector('english', coalesce(NEW.candidate_name, '')), 'A') ||
        setweight(to_tsvector('english', coalesce(NEW.experience_summary, '')), 'B') ||
        setweight(to_tsvector('english', array_to_string(NEW.skills, ' ')), 'B');
      RETURN NEW;
    END
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_talent_pool_search_vector
    BEFORE INSERT OR UPDATE ON talent_pool
    FOR EACH ROW EXECUTE FUNCTION talent_pool_search_vector_trigger();

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

  // 5. Backfill
  pgm.sql(`
    INSERT INTO talent_pool (email, candidate_name, phone, resume_url, parsed_resume_json, created_at, updated_at)
    SELECT DISTINCT ON (email) email, candidate_name, phone, resume_url, parsed_resume_json, created_at, updated_at
    FROM applications
    ON CONFLICT (email) DO NOTHING;

    INSERT INTO talent_pool_applications (talent_id, job_posting_id, application_id, applied_at)
    SELECT t.talent_id, a.job_posting_id, a.application_id, a.created_at
    FROM applications a
    JOIN talent_pool t ON a.email = t.email
    ON CONFLICT DO NOTHING;

    UPDATE talent_pool t
    SET total_applications = (SELECT COUNT(*) FROM talent_pool_applications ta WHERE ta.talent_id = t.talent_id);
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('talent_pool_applications');
  pgm.dropTable('talent_pool');
  pgm.sql(`
    DROP FUNCTION IF EXISTS sync_application_to_talent_pool CASCADE;
    DROP FUNCTION IF EXISTS talent_pool_search_vector_trigger CASCADE;
  `);
};
