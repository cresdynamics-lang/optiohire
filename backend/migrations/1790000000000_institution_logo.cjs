/* eslint-disable camelcase */
exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    ALTER TABLE institutions
      ADD COLUMN IF NOT EXISTS logo_url TEXT;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    ALTER TABLE institutions
      DROP COLUMN IF EXISTS logo_url;
  `);
};
