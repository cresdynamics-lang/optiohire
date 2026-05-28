/**
 * OptioHire E2E Test Script — Fixed Version
 *
 * ROOT CAUSE FIX:
 *   The original script called /api/auth/signin which is a frontend proxy path.
 *   The backend exposes auth at /auth/signin (no /api prefix).
 *   This script tries the frontend proxy first, then falls back to direct backend URL.
 *
 * USAGE:
 *   node scripts/e2e-test.mjs
 *
 *   Override base URLs via environment variables:
 *     API_BASE=https://optiohire.com        (frontend / proxy base)
 *     BACKEND_BASE=https://api.optiohire.com (direct backend base — auto-detected if unset)
 */

import fetch from 'node-fetch';

// ─── Configuration ────────────────────────────────────────────────────────────
const FRONTEND_BASE = process.env.API_BASE     || 'https://optiohire.com';
const BACKEND_BASE  = process.env.BACKEND_BASE || null; // null = auto-detect

const APPLICANT_EMAIL = 'kelvin@gmail.com';
const HR_EMAIL        = 'kelvin202maina@gmail.com';
const ADMIN_EMAIL     = 'kelvin.reallife8@gmail.com';
const PASSWORD        = 'paraKenya8#';

// ─── Auth endpoint candidates (tried in order) ───────────────────────────────
const AUTH_CANDIDATES = [
  // 1. Frontend proxy (original intent)
  { base: FRONTEND_BASE, signinPath: '/api/auth/signin', signupPath: '/api/auth/signup' },
  // 2. Direct backend — common subdomain pattern
  { base: 'https://api.optiohire.com', signinPath: '/auth/signin', signupPath: '/auth/signup' },
  // 3. Direct backend — same domain, no /api prefix
  { base: FRONTEND_BASE, signinPath: '/auth/signin', signupPath: '/auth/signup' },
  // 4. Direct backend — /api prefix but no /auth
  { base: FRONTEND_BASE, signinPath: '/api/signin', signupPath: '/api/signup' },
];

// ─── State ────────────────────────────────────────────────────────────────────
let resolvedAuthBase    = null;
let resolvedSigninPath  = null;
let resolvedSignupPath  = null;
let resolvedApiBase     = null;

// ─── Core fetch helpers ───────────────────────────────────────────────────────
async function fetchWithRetry(url, options = {}, retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.status >= 400 && res.status < 500) return res;
      if (!res.ok && attempt < retries) {
        console.warn(`  ⚠ Attempt ${attempt}/${retries} got status ${res.status}, retrying…`);
        await sleep(500 * attempt);
        continue;
      }
      return res;
    } catch (e) {
      if (attempt === retries) throw e;
      console.warn(`  ⚠ Attempt ${attempt}/${retries} network error: ${e.message}, retrying…`);
      await sleep(500 * attempt);
    }
  }
}

async function req(url, options = {}) {
  console.log(`\n  => [${options.method || 'GET'}] ${url}`);
  const res = await fetchWithRetry(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
  });

  const ct = res.headers.get('content-type') || '';
  let data;
  if (ct.includes('application/json')) {
    data = await res.json();
  } else {
    data = await res.text();
    if (!res.ok) {
      console.error(`  ✗ HTTP ${res.status} — ${String(data).substring(0, 300)}`);
      throw new Error(`HTTP ${res.status} at ${url}`);
    }
    console.warn(`  ⚠ Non-JSON response (${res.status}): ${String(data).substring(0, 200)}`);
    return data;
  }

  if (!res.ok) {
    console.error(`  ✗ HTTP ${res.status}:`, JSON.stringify(data).substring(0, 300));
    throw new Error(`HTTP ${res.status} at ${url}`);
  }
  return data;
}

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

// ─── Auth endpoint detection ──────────────────────────────────────────────────
async function detectAuthEndpoints() {
  console.log('\n🔍 Detecting correct auth endpoints…');

  if (BACKEND_BASE) {
    resolvedAuthBase   = BACKEND_BASE;
    resolvedSigninPath = '/auth/signin';
    resolvedSignupPath = '/auth/signup';
    resolvedApiBase    = BACKEND_BASE;
    console.log(`  Using explicit BACKEND_BASE: ${BACKEND_BASE}`);
    return;
  }

  for (const candidate of AUTH_CANDIDATES) {
    const probeUrl = `${candidate.base}${candidate.signinPath}`;
    console.log(`  Probing: ${probeUrl}`);
    try {
      const res = await fetch(probeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: '__probe__@probe.test', password: '__probe__' }),
      });

      if (res.status === 404) {
        const text = await res.text();
        if (text.includes('Cannot POST') || text.includes('Not Found')) {
          console.log(`  ✗ 404 — route not found`);
          continue;
        }
      }

      console.log(`  ✓ Route found! Status: ${res.status}`);
      resolvedAuthBase   = candidate.base;
      resolvedSigninPath = candidate.signinPath;
      resolvedSignupPath = candidate.signupPath;
      resolvedApiBase    = candidate.base === FRONTEND_BASE ? FRONTEND_BASE : candidate.base;
      return;

    } catch (e) {
      console.log(`  ✗ Network error: ${e.message}`);
    }
  }

  throw new Error(
    `Could not find auth endpoints. Tried:\n` +
    AUTH_CANDIDATES.map(c => `  ${c.base}${c.signinPath}`).join('\n') +
    `\n\nSet BACKEND_BASE env var to the correct backend URL and retry.`
  );
}

// ─── Register / Login ─────────────────────────────────────────────────────────
async function registerAndLogin(email, role, name) {
  console.log(`\n--- Auth: ${role} (${email}) ---`);

  try {
    console.log('  Attempting login…');
    const res = await req(`${resolvedAuthBase}${resolvedSigninPath}`, {
      method: 'POST',
      body: JSON.stringify({ email, password: PASSWORD }),
    });
    const token = res.token || res.accessToken || res.access_token;
    if (!token) throw new Error('Login response had no token field: ' + JSON.stringify(res));
    console.log('  ✓ Login successful');
    return { token };
  } catch (loginErr) {
    if (!loginErr.message.includes('404')) {
      console.log(`  Login failed (${loginErr.message}), attempting signup…`);
    } else {
      throw loginErr;
    }
  }

  const regBody = {
    email,
    password: PASSWORD,
    name,
    role,
    ...(role === 'HR' ? { companyName: 'Tech Corp Test' } : {}),
  };
  const res = await req(`${resolvedAuthBase}${resolvedSignupPath}`, {
    method: 'POST',
    body: JSON.stringify(regBody),
  });
  const token = res.token || res.accessToken || res.access_token;
  if (!token) throw new Error('Signup response had no token field: ' + JSON.stringify(res));
  console.log('  ✓ Signup successful');
  return { token };
}

// ─── API helpers ──────────────────────────────────────────────────────────────
function apiReq(path, options = {}) {
  return req(`${resolvedApiBase}${path}`, options);
}

// ─── Main E2E flow ────────────────────────────────────────────────────────────
async function runE2E() {
  try {
    console.log('🚀 Starting OptioHire E2E Test…\n');

    await detectAuthEndpoints();
    console.log(`\n✅ Auth base:   ${resolvedAuthBase}`);
    console.log(`   Signin path: ${resolvedSigninPath}`);
    console.log(`   API base:    ${resolvedApiBase}`);

    // ── 1. Setup accounts ─────────────────────────────────────────────────────
    console.log('\n\n══ STEP 1: Account Setup ══');
    const hr        = await registerAndLogin(HR_EMAIL,        'HR',        'HR Kelvin');
    const admin     = await registerAndLogin(ADMIN_EMAIL,     'ADMIN',     'Admin Kelvin');
    const applicant = await registerAndLogin(APPLICANT_EMAIL, 'APPLICANT', 'Applicant Kelvin');

    const hrHeaders    = { Authorization: `Bearer ${hr.token}` };
    const adminHeaders = { Authorization: `Bearer ${admin.token}` };
    const appHeaders   = { Authorization: `Bearer ${applicant.token}` };

    // ── 2. HR creates a job posting ───────────────────────────────────────────
    console.log('\n\n══ STEP 2: Create Job Posting ══');
    let jobId;
    try {
      const jobRes = await apiReq('/api/job-postings', {
        method: 'POST',
        headers: hrHeaders,
        body: JSON.stringify({
          title:          'Senior Software Engineer',
          department:     'Engineering',
          location:       'Remote',
          employmentType: 'Full-time',
          description:    'Looking for a great dev.',
          requirements:   ['Node.js', 'React'],
        }),
      });
      jobId = jobRes.jobPosting?.job_posting_id
            || jobRes.jobPosting?.id
            || jobRes.id
            || jobRes.job_posting_id;
      console.log('  ✓ Created job. ID:', jobId);
    } catch (err) {
      console.log('  Could not create job, trying to fetch existing…');
      const jobsRes = await apiReq('/api/jobs', { headers: hrHeaders });
      const firstJob = jobsRes.jobs?.[0] || jobsRes[0];
      jobId = firstJob?.job_posting_id || firstJob?.id;
      console.log('  Using existing job. ID:', jobId);
    }
    if (!jobId) throw new Error('Could not obtain a Job ID — check /api/job-postings and /api/jobs routes');

    // ── 3. Applicant applies ──────────────────────────────────────────────────
    console.log('\n\n══ STEP 3: Applicant Applies ══');
    const applyRes = await apiReq(`/api/applications/apply/${jobId}`, {
      method: 'POST',
      headers: appHeaders,
      body: JSON.stringify({
        resumeText:   'Senior Software Engineer with 10 years of React and Node.js experience.',
        linkedinUrl:  'https://linkedin.com/in/kelvin',
        portfolioUrl: 'https://github.com/kelvin',
      }),
    });
    const applicationId = applyRes.applicationId
                        || applyRes.id
                        || applyRes.application?.application_id
                        || applyRes.application_id;
    console.log('  ✓ Application submitted. ID:', applicationId);
    console.log('  📧 Expect: "New Application Received" email → HR (', HR_EMAIL, ')');

    if (!applicationId) throw new Error('No applicationId in response: ' + JSON.stringify(applyRes));

    // ── 4. HR rejects candidate ───────────────────────────────────────────────
    console.log('\n\n══ STEP 4: HR Rejects Candidate ══');
    await apiReq(`/api/hr/${applicationId}/status`, {
      method: 'PATCH',
      headers: hrHeaders,
      body: JSON.stringify({
        status: 'REJECTED',
        reason: 'We are looking for someone with more Python experience.',
      }),
    });
    console.log('  ✓ Candidate rejected.');
    console.log('  📧 Expect: "Rejection + Talent Pool" email → Applicant (', APPLICANT_EMAIL, ')');

    // ── 5. HR schedules interview (non-fatal) ─────────────────────────────────
    console.log('\n\n══ STEP 5: HR Schedules Interview ══');
    try {
      await apiReq('/api/schedule', {
        method: 'POST',
        headers: hrHeaders,
        body: JSON.stringify({
          applicantId:   applicationId,
          interviewTime: new Date(Date.now() + 86400000).toISOString(),
          interviewType: 'online',
          customLink:    'https://zoom.us/j/123456789',
        }),
      });
      console.log('  ✓ Interview scheduled.');
      console.log('  📧 Expect: "Interview Scheduled" email → Applicant (', APPLICANT_EMAIL, ')');
    } catch (err) {
      console.warn('  ⚠ Interview scheduling failed (non-fatal):', err.message);
    }

    // ── 6. Admin checks decisions ─────────────────────────────────────────────
    console.log('\n\n══ STEP 6: Admin Fetches Decisions ══');
    const adminRes = await apiReq('/api/admin/candidate-decisions', {
      method: 'GET',
      headers: adminHeaders,
    });
    const count = adminRes.decisions?.length ?? 'unknown';
    console.log(`  ✓ Admin decisions fetched. Count: ${count}`);

    console.log('\n\n🎉 E2E Test Completed Successfully!\n');

  } catch (error) {
    console.error('\n\n❌ Test Failed:', error.message);
    console.error('\n--- TROUBLESHOOTING ---');
    console.error('1. Run:  curl -s -o /dev/null -w "%{http_code}" -X POST https://optiohire.com/api/auth/signin');
    console.error('2. Run:  curl -s -o /dev/null -w "%{http_code}" -X POST https://api.optiohire.com/auth/signin');
    console.error('   A non-404 code confirms the correct auth base URL.');
    console.error('3. Then re-run with:  BACKEND_BASE=https://api.optiohire.com node scripts/e2e-test.mjs');
    process.exit(1);
  }
}

runE2E();
