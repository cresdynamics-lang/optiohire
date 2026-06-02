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
  pgm.createTable('support_tickets', {
    ticket_id: {
      type: 'uuid',
      primaryKey: true,
      default: pgm.func('gen_random_uuid()'),
    },
    user_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    user_email: {
      type: 'text',
      notNull: true,
    },
    subject: {
      type: 'text',
    },
    message: {
      type: 'text',
      notNull: true,
    },
    status: {
      type: 'text',
      notNull: true,
      default: 'open',
    },
    priority: {
      type: 'text',
      notNull: true,
      default: 'normal',
    },
    context_data: {
      type: 'jsonb',
      default: '{}',
    },
    assigned_admin_id: {
      type: 'uuid',
      references: '"users"',
      onDelete: 'SET NULL',
    },
    created_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
    updated_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('now()'),
    },
  });

  pgm.createIndex('support_tickets', 'status');
  pgm.createIndex('support_tickets', 'user_id');
  pgm.createIndex('support_tickets', 'created_at');

  // Trigger for updated_at
  pgm.createFunction(
    'update_support_tickets_updated_at',
    [],
    {
      returns: 'TRIGGER',
      language: 'plpgsql',
      replace: true,
    },
    `
    BEGIN
      NEW.updated_at = now();
      RETURN NEW;
    END;
    `
  );

  pgm.createTrigger('support_tickets', 'trg_support_tickets_updated_at', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'update_support_tickets_updated_at',
  });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.dropTrigger('support_tickets', 'trg_support_tickets_updated_at');
  pgm.dropFunction('update_support_tickets_updated_at', []);
  pgm.dropTable('support_tickets');
};
