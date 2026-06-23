exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE candidate_profiles 
    ADD COLUMN IF NOT EXISTS bio text,
    ADD COLUMN IF NOT EXISTS job_category text,
    ADD COLUMN IF NOT EXISTS cv_url text,
    ADD COLUMN IF NOT EXISTS cover_letter_url text,
    ADD COLUMN IF NOT EXISTS recommendation_letter_url text;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE candidate_profiles 
    DROP COLUMN IF EXISTS bio,
    DROP COLUMN IF EXISTS job_category,
    DROP COLUMN IF EXISTS cv_url,
    DROP COLUMN IF EXISTS cover_letter_url,
    DROP COLUMN IF EXISTS recommendation_letter_url;
  `);
};
