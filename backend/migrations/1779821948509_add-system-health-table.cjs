/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('system_health', {
    health_id: { type: 'bigserial', primaryKey: true },
    component_key: { type: 'text', notNull: true, unique: true },
    status: { type: 'text', notNull: true, default: 'unknown' },
    last_run_at: { type: 'timestamptz' },
    last_error: { type: 'text' },
    error_count: { type: 'integer', notNull: true, default: 0 },
    metadata: { type: 'jsonb', default: '{}' },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('system_health', 'component_key');
};

exports.down = (pgm) => {
  pgm.dropTable('system_health');
};
