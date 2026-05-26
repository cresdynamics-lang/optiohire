exports.up = (pgm) => {
  pgm.addColumn('applications', {
    ai_audit_log: { type: 'jsonb', default: null }
  });

  pgm.sql(`CREATE INDEX idx_applications_audit_tier ON applications ((ai_audit_log->>'tier'))`);

  pgm.createTable('talent_pool_matches', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', references: 'job_postings(job_posting_id)', onDelete: 'CASCADE' },
    candidate_id: { type: 'uuid', references: 'talent_pool(talent_id)', onDelete: 'CASCADE' },
    final_score: { type: 'numeric(5,2)' },
    tier: { type: 'text' },
    ai_audit_log: { type: 'jsonb' },
    matched_at: { type: 'timestamptz', default: pgm.func('NOW()') }
  });
  
  pgm.addConstraint('talent_pool_matches', 'talent_pool_matches_job_candidate_unique', {
    unique: ['job_id', 'candidate_id']
  });

  pgm.createTable('talent_pool_scan_log', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    job_id: { type: 'uuid', references: 'job_postings(job_posting_id)' },
    scanned_at: { type: 'timestamptz', default: pgm.func('NOW()') },
    candidates_evaluated: { type: 'integer' },
    strong_matches_found: { type: 'integer' }
  });

  pgm.addColumn('job_postings', {
    scoring_config: { 
      type: 'jsonb', 
      default: `{
        "weights": {
          "skill": 0.35,
          "experience": 0.30,
          "education": 0.15,
          "vector": 0.20
        }
      }` 
    }
  });
};

exports.down = (pgm) => {
  pgm.dropColumn('job_postings', 'scoring_config');
  pgm.dropTable('talent_pool_scan_log');
  pgm.dropTable('talent_pool_matches');
  pgm.dropIndex('applications', { name: 'idx_applications_audit_tier' });
  pgm.dropColumn('applications', 'ai_audit_log');
};
