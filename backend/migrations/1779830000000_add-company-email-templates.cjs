/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('company_email_templates', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    company_id: { type: 'uuid', notNull: true, references: 'companies(company_id)', onDelete: 'CASCADE' },
    template_type: { type: 'text', notNull: true }, // 'SHORTLIST', 'REJECT', 'INTERVIEW'
    subject: { type: 'text', notNull: true },
    body_html: { type: 'text', notNull: true },
    body_text: { type: 'text' }, // Optional, can be derived
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('now()') },
  });

  pgm.addConstraint('company_email_templates', 'unique_company_template_type', {
    unique: ['company_id', 'template_type'],
  });

  pgm.createTrigger('company_email_templates', 'update_updated_at_trigger', {
    when: 'BEFORE',
    operation: 'UPDATE',
    level: 'ROW',
    function: 'update_updated_at_column',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('company_email_templates');
};
