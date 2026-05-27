/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('processed_webhook_deliveries', {
    id: { type: 'bigserial', primaryKey: true },
    delivery_id: { type: 'text', notNull: true, unique: true },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });
  
  pgm.createIndex('processed_webhook_deliveries', 'delivery_id');
};

exports.down = (pgm) => {
  pgm.dropTable('processed_webhook_deliveries');
};
