/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('system_health_history', {
    history_id: { type: 'bigserial', primaryKey: true },
    component_key: { type: 'text', notNull: true },
    check_date: { type: 'date', notNull: true, default: pgm.func('current_date') },
    success_count: { type: 'integer', notNull: true, default: 0 },
    error_count: { type: 'integer', notNull: true, default: 0 },
  });

  pgm.addConstraint('system_health_history', 'unique_component_date', {
    unique: ['component_key', 'check_date'],
  });
  
  pgm.createIndex('system_health_history', ['component_key', 'check_date']);
};

exports.down = (pgm) => {
  pgm.dropTable('system_health_history');
};
