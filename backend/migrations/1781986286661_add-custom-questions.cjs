exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('job_postings', {
    custom_questions: {
      type: 'jsonb',
      default: '[]',
      notNull: true
    }
  });

  pgm.addColumns('applications', {
    custom_answers: {
      type: 'jsonb',
      default: '{}',
      notNull: true
    }
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('job_postings', ['custom_questions']);
  pgm.dropColumns('applications', ['custom_answers']);
};
