/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('applications', {
    candidate_meta: { type: 'jsonb', default: '{}' },
    cv_analysis: { type: 'jsonb', default: '{}' },
    ai_review: { type: 'jsonb', default: '{}' }
  });

  // Data migration: Populate new columns from old ones
  pgm.sql(`
    UPDATE applications
    SET 
      candidate_meta = jsonb_build_object(
        'name', candidate_name,
        'phone', phone,
        'email', email,
        'links', COALESCE(parsed_resume_json->'links', '{}'::jsonb)
      ),
      cv_analysis = jsonb_build_object(
        'resume_url', resume_url,
        'textContent', COALESCE(parsed_resume_json->>'textContent', ''),
        'parsed_resume', parsed_resume_json
      ),
      ai_review = jsonb_build_object(
        'score', ai_score,
        'status', ai_status,
        'reasoning', reasoning,
        'audit_log', ai_audit_log
      )
    WHERE candidate_meta = '{}'::jsonb;
  `);
};

exports.down = (pgm) => {
  pgm.dropColumns('applications', ['candidate_meta', 'cv_analysis', 'ai_review']);
};
