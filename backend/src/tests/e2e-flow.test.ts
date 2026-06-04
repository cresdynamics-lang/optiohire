import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

// Import app after global setup
const { createTestApp } = await import('./utils/testApp.js');
const app = createTestApp();
const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key-for-unit-tests';

describe('End-to-End Flow: Full Lifecycle', () => {
  let token: string;

  beforeEach(() => {
    vi.clearAllMocks();
    token = jwt.sign({ sub: 'hr_user_1', email: 'hr@company.com' }, JWT_SECRET);
  });

  it('should complete a full job posting and application cycle', async () => {
    // 1. Create Job Posting
    const jobResponse = await request(app)
      .post('/api/job-postings')
      .set('Authorization', `Bearer ${token}`)
      .send({
        company_name: 'Tech Corp',
        company_email: 'contact@techcorp.com',
        hr_email: 'hr@techcorp.com',
        job_title: 'Senior Developer',
        job_description: 'A great role for a great developer with lots of experience and more than fifty characters of description text.',
        required_skills: ['Node.js', 'Postgres'],
        application_deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(jobResponse.status).toBe(201);
    const jobId = jobResponse.body.job_posting_id;
    expect(jobId).toBe('job_123');

    // 2. Public Application
    const appResponse = await request(app)
      .post('/applications/public-submit')
      .send({
        job_posting_id: jobId,
        candidate_name: 'John Doe',
        email: 'john@doe.com',
        resume_url: 'http://storage/john_resume.pdf'
      });

    expect(appResponse.status).toBe(201);
    expect(appResponse.body.application_id).toBe('app_123');

    // 3. Update Candidate Status
    const statusResponse = await request(app)
      .patch(`/api/hr/candidates/app_123/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'HIRED', reason: 'Great candidate, hired!' });

    expect(statusResponse.status).toBe(200);
    expect(statusResponse.body.success).toBe(true);
  });
});
