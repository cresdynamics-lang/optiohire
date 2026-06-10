exports.up = (pgm) => {
  pgm.addColumns('ai_usage_logs', {
    task: { type: 'text', notNull: false },
    user_email: { type: 'text', notNull: false },
    job_posting_id: { type: 'uuid', notNull: false }
  });

  pgm.createIndex('ai_usage_logs', 'task', { name: 'idx_ai_usage_logs_task' });
  pgm.createIndex('ai_usage_logs', 'user_email', { name: 'idx_ai_usage_logs_user_email' });
};

exports.down = (pgm) => {
  pgm.dropIndex('ai_usage_logs', 'user_email', { name: 'idx_ai_usage_logs_user_email' });
  pgm.dropIndex('ai_usage_logs', 'task', { name: 'idx_ai_usage_logs_task' });
  
  pgm.dropColumns('ai_usage_logs', ['task', 'user_email', 'job_posting_id']);
};
