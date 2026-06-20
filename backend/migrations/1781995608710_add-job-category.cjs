exports.up = (pgm) => {
  pgm.addColumns('job_postings', {
    job_category: {
      type: 'text',
      default: 'Other',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('job_postings', ['job_category']);
};
