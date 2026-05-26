/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  // Create pgvector extension
  pgm.createExtension('vector', { ifNotExists: true });

  // Add embedding column to applications
  pgm.addColumns('applications', {
    embedding: { type: 'vector(1536)' }
  });

  // Add embedding column to job_postings
  pgm.addColumns('job_postings', {
    embedding: { type: 'vector(1536)' }
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropColumns('job_postings', ['embedding']);
  pgm.dropColumns('applications', ['embedding']);
  pgm.dropExtension('vector', { ifExists: true });
};
