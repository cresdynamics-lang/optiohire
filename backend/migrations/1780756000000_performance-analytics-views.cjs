/**
 * @param {import('node-pg-migrate').MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  // 1. Performance Indexes
  pgm.createIndex('applications', ['company_id', 'ai_status'], { name: 'idx_applications_funnel_perf' });
  pgm.createIndex('applications', ['company_id', 'created_at'], { name: 'idx_applications_velocity_perf' });
  pgm.createIndex('applications', ['job_posting_id', 'ai_status'], { name: 'idx_applications_job_perf' });

  // 2. Materialized View for Company Funnel & Global Stats
  pgm.sql(`
    CREATE MATERIALIZED VIEW mv_company_funnel_stats AS
    SELECT 
        company_id,
        COUNT(*) as total_applied,
        COUNT(*) FILTER (WHERE ai_status = 'SHORTLIST') as shortlisted,
        COUNT(*) FILTER (WHERE ai_status = 'HIRED') as hired,
        COUNT(*) FILTER (WHERE ai_status IN ('REJECT', 'REJECTED')) as rejected,
        COUNT(*) FILTER (WHERE ai_status = 'FLAG') as flagged,
        AVG(CASE WHEN ai_status = 'HIRED' AND hired_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (hired_at - created_at)) / 86400 END)::numeric(10,1) as avg_days_to_hire
    FROM applications
    GROUP BY company_id;
  `);

  pgm.sql(`CREATE UNIQUE INDEX idx_mv_company_funnel_company_id ON mv_company_funnel_stats(company_id);`);

  // 3. Materialized View for Job Title Performance
  pgm.sql(`
    CREATE MATERIALIZED VIEW mv_job_performance_stats AS
    SELECT 
        j.company_id,
        j.job_title,
        COUNT(a.application_id) as total_apps,
        SUM(CASE WHEN a.ai_status = 'HIRED' THEN 1 ELSE 0 END) as hired_apps,
        AVG(a.ai_score)::numeric(10,1) as avg_score,
        AVG(CASE WHEN a.ai_status = 'HIRED' AND a.hired_at IS NOT NULL 
            THEN EXTRACT(EPOCH FROM (a.hired_at - a.created_at)) / 86400 END)::numeric(10,1) as avg_days_to_hire
    FROM job_postings j
    LEFT JOIN applications a ON j.job_posting_id = a.job_posting_id
    GROUP BY j.company_id, j.job_title;
  `);

  pgm.sql(`CREATE UNIQUE INDEX idx_mv_job_perf_company_title ON mv_job_performance_stats(company_id, job_title);`);
};

exports.down = (pgm) => {
  pgm.dropIndex('applications', [], { name: 'idx_applications_funnel_perf' });
  pgm.dropIndex('applications', [], { name: 'idx_applications_velocity_perf' });
  pgm.dropIndex('applications', [], { name: 'idx_applications_job_perf' });
  pgm.sql('DROP MATERIALIZED VIEW IF EXISTS mv_company_funnel_stats');
  pgm.sql('DROP MATERIALIZED VIEW IF EXISTS mv_job_performance_stats');
};
