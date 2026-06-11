exports.up = (pgm) => {
  pgm.addColumns('ai_usage_logs', {
    provider: { type: 'text', notNull: false },
    finish_reason: { type: 'text', notNull: false },
    speed: { type: 'real', notNull: false },
    session_id: { type: 'text', notNull: false },
    app_name: { type: 'text', notNull: false }
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('ai_usage_logs', ['provider', 'finish_reason', 'speed', 'session_id', 'app_name']);
};
