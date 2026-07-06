'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import './onboard.css';

// Mock institution data pre-filled from admin record (keyed by token)
const MOCK_INSTITUTIONS: Record<string, {
  name: string;
  shortName: string;
  type: string;
  location: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  pathways: string[];
  levels: string[];
}> = {
  'preview-token': {
    name: 'Strathmore University',
    shortName: 'SU',
    type: 'University',
    location: 'Nairobi, KE',
    contactName: 'Joyce Nduta',
    contactEmail: 'j.nduta@strathmore.edu',
    contactTitle: 'Head, Career Services',
    pathways: ['attachment', 'job-ready'],
    levels: ['degree'],
  },
  'kca-token': {
    name: 'KCA University',
    shortName: 'KCA',
    type: 'University',
    location: 'Nairobi, KE',
    contactName: 'Peter Waweru',
    contactEmail: 'p.waweru@kca.ac.ke',
    contactTitle: 'Career Services Coordinator',
    pathways: ['internship', 'attachment'],
    levels: ['diploma', 'degree'],
  },
};

const STEPS = [
  { num: 1, label: 'Verify identity' },
  { num: 2, label: 'Institution profile' },
  { num: 3, label: 'Cohort preferences' },
  { num: 4, label: 'Activate account' },
  { num: 5, label: 'Done!' },
];

export default function OnboardPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = React.use(params);
  const inst = MOCK_INSTITUTIONS[token] || MOCK_INSTITUTIONS['preview-token'];

  const [step, setStep] = useState(1);
  const [contactName, setContactName] = useState(inst.contactName);
  const [contactTitle, setContactTitle] = useState(inst.contactTitle);
  const [contactPhone, setContactPhone] = useState('+254 7');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [accreditation, setAccreditation] = useState('');
  const [yearEst, setYearEst] = useState('');
  const [cohortSize, setCohortSize] = useState('');
  const [gradPeriod, setGradPeriod] = useState('2026-11');
  const [levels, setLevels] = useState<string[]>(inst.levels);
  const [pathways, setPathways] = useState<string[]>(inst.pathways);
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [sending, setSending] = useState(false);

  function toggleLevel(l: string) {
    setLevels(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l]);
  }
  function togglePathway(p: string) {
    setPathways(prev => prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p]);
  }

  async function handleActivate() {
    setSending(true);
    await new Promise(r => setTimeout(r, 1800));
    setSending(false);
    setStep(5);
  }

  const instId = inst.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

  return (
    <div className="onboard-root">
      <div className="onboard-shell">
        {/* ===== LEFT PANEL ===== */}
        <aside className="onboard-left">
          <div className="onboard-brand">
            <div className="mark">O</div>
            <div>
              <div className="bname">OptioHire</div>
              <div className="bsub">Institution Console</div>
            </div>
          </div>

          <div className="inst-chip">
            <div className="crest">{inst.shortName}</div>
            <div>
              <div className="ct1">{inst.name}</div>
              <div className="ct2">{inst.type} · {inst.location}</div>
            </div>
          </div>

          <div className="onboard-welcome">
            <div className="eyebrow">Welcome aboard</div>
            <h2>Set up your Institution Console</h2>
            <p>
              You've been invited to connect {inst.name} to OptioHire.
              Complete these steps to activate your account and start onboarding your graduating cohort.
            </p>
          </div>

          <nav className="onboard-steps">
            {STEPS.map(s => (
              <div
                key={s.num}
                className={`ostep ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
              >
                <div className="num">
                  {step > s.num ? '✓' : s.num}
                </div>
                <div className="slabel">{s.label}</div>
              </div>
            ))}
          </nav>
        </aside>

        {/* ===== RIGHT PANEL ===== */}
        <main className="onboard-right">
          {/* Progress dots */}
          <div className="onboard-progress">
            {STEPS.map(s => (
              <div
                key={s.num}
                className={`prog-dot ${step === s.num ? 'active' : ''} ${step > s.num ? 'done' : ''}`}
              />
            ))}
          </div>

          {/* ===== STEP 1 — Verify Identity ===== */}
          <div className={`step-panel ${step === 1 ? 'active' : ''}`}>
            <div className="step-eyebrow">Step 1 of 4</div>
            <h1 className="step-title">Confirm your details</h1>
            <p className="step-desc">
              We've pre-filled this from your invitation. Review and correct anything that's wrong before continuing.
            </p>

            <div className="form-section">
              <label className="field-label">
                Institution name
                <span className="prefilled-badge">✓ Pre-filled</span>
              </label>
              <input className="prefilled-field" value={inst.name} readOnly />
            </div>

            <div className="form-section">
              <label className="field-label">
                Institution type
                <span className="prefilled-badge">✓ Pre-filled</span>
              </label>
              <input className="prefilled-field" value={inst.type} readOnly />
            </div>

            <div className="form-row-2">
              <div className="form-section">
                <label className="field-label">Your full name</label>
                <input value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" />
              </div>
              <div className="form-section">
                <label className="field-label">Your job title</label>
                <input value={contactTitle} onChange={e => setContactTitle(e.target.value)} placeholder="e.g. Head, Career Services" />
              </div>
            </div>

            <div className="form-section">
              <label className="field-label">
                Work email
                <span className="prefilled-badge">✓ Pre-filled</span>
              </label>
              <input className="prefilled-field" value={inst.contactEmail} readOnly />
            </div>

            <div className="form-section">
              <label className="field-label">Phone number</label>
              <input value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+254 7XX XXX XXX" />
            </div>

            <div className="form-footer">
              <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>Step 1 of 4</span>
              <button className="btn btn-primary" onClick={() => setStep(2)}>
                Confirm my details →
              </button>
            </div>
          </div>

          {/* ===== STEP 2 — Institution Profile ===== */}
          <div className={`step-panel ${step === 2 ? 'active' : ''}`}>
            <div className="step-eyebrow">Step 2 of 4</div>
            <h1 className="step-title">Institution profile</h1>
            <p className="step-desc">
              Help employers and students discover your institution. This information will appear on all cohort profiles.
            </p>

            <div className="form-section">
              <label className="field-label">Website URL</label>
              <input
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="https://strathmore.edu"
              />
            </div>

            <div className="form-section">
              <label className="field-label">Physical address</label>
              <input
                value={address}
                onChange={e => setAddress(e.target.value)}
                placeholder="Ole Sangale Road, Madaraka, Nairobi"
              />
            </div>

            <div className="form-row-2">
              <div className="form-section">
                <label className="field-label">Accreditation body</label>
                <select value={accreditation} onChange={e => setAccreditation(e.target.value)}>
                  <option value="">Select…</option>
                  <option>CUE (Commission for University Education)</option>
                  <option>KNEC (Kenya National Examinations Council)</option>
                  <option>TVETA (Technical and Vocational Education)</option>
                  <option>KASNEB</option>
                  <option>Other</option>
                </select>
              </div>
              <div className="form-section">
                <label className="field-label">Year established</label>
                <input
                  value={yearEst}
                  onChange={e => setYearEst(e.target.value)}
                  placeholder="e.g. 1961"
                  maxLength={4}
                />
              </div>
            </div>

            <div className="form-footer">
              <button className="btn" onClick={() => setStep(1)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(3)}>
                Continue →
              </button>
            </div>
          </div>

          {/* ===== STEP 3 — Cohort Preferences ===== */}
          <div className={`step-panel ${step === 3 ? 'active' : ''}`}>
            <div className="step-eyebrow">Step 3 of 4</div>
            <h1 className="step-title">Cohort preferences</h1>
            <p className="step-desc">
              Tell us what your graduates are looking for. These defaults apply to all cohorts you upload — you can override them per cohort later.
            </p>

            <div className="form-section">
              <label className="field-label">Academic levels offered</label>
              <p className="field-hint">Select all qualifications your institution offers.</p>
              <div className="pill-group">
                {[
                  { key: 'certificate', label: 'Certificate', sub: '6–12 months' },
                  { key: 'diploma', label: 'Diploma', sub: '1–2 years' },
                  { key: 'degree', label: 'Undergraduate Degree', sub: '3–4 years' },
                  { key: 'postgraduate', label: 'Postgraduate', sub: 'Masters / PGD' },
                ].map(l => (
                  <button
                    key={l.key}
                    className={`select-pill ${levels.includes(l.key) ? 'active' : ''}`}
                    onClick={() => toggleLevel(l.key)}
                  >
                    {l.label}
                    <span className="sub">{l.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-section">
              <label className="field-label">Default pathways</label>
              <p className="field-hint">What are you primarily onboarding students for? Select all that apply.</p>
              <div className="pill-group">
                {[
                  { key: 'internship', label: 'Internship', sub: 'Short-term, learning-focused' },
                  { key: 'attachment', label: 'Industrial Attachment', sub: 'Academic requirement, fixed term' },
                  { key: 'job-ready', label: 'Job-Ready Graduate', sub: 'Full-time placement' },
                ].map(p => (
                  <button
                    key={p.key}
                    className={`select-pill gold-active ${pathways.includes(p.key) ? 'active' : ''}`}
                    onClick={() => togglePathway(p.key)}
                  >
                    {p.label}
                    <span className="sub">{p.sub}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="form-row-2">
              <div className="form-section">
                <label className="field-label">Typical annual cohort size</label>
                <input
                  value={cohortSize}
                  onChange={e => setCohortSize(e.target.value)}
                  placeholder="e.g. 600"
                />
              </div>
              <div className="form-section">
                <label className="field-label">Typical graduation period</label>
                <input
                  type="month"
                  value={gradPeriod}
                  onChange={e => setGradPeriod(e.target.value)}
                />
              </div>
            </div>

            <div className="form-footer">
              <button className="btn" onClick={() => setStep(2)}>← Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>
                Continue →
              </button>
            </div>
          </div>

          {/* ===== STEP 4 — Activate Account ===== */}
          <div className={`step-panel ${step === 4 ? 'active' : ''}`}>
            <div className="step-eyebrow">Step 4 of 4</div>
            <h1 className="step-title">Set your password</h1>
            <p className="step-desc">
              Create a password to secure your Institution Console. You'll use your email address and this password to sign in.
            </p>

            <div
              style={{
                background: 'var(--primary-pale)',
                border: '1px solid var(--primary)',
                borderRadius: 10,
                padding: '14px 16px',
                marginBottom: 24,
                fontSize: 13,
                color: 'var(--primary)',
                fontWeight: 500,
              }}
            >
              Signing in as: <strong>{inst.contactEmail}</strong>
            </div>

            <div className="form-section">
              <label className="field-label">New password</label>
              <div className="pw-wrap">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                />
                <button className="pw-toggle" type="button" onClick={() => setShowPw(v => !v)}>
                  {showPw ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            <div className="form-section">
              <label className="field-label">Confirm password</label>
              <input
                type="password"
                value={confirmPw}
                onChange={e => setConfirmPw(e.target.value)}
                placeholder="Repeat your password"
              />
            </div>

            <div className="terms-row">
              <input
                type="checkbox"
                id="terms-cb"
                checked={termsAccepted}
                onChange={e => setTermsAccepted(e.target.checked)}
              />
              <label htmlFor="terms-cb">
                I agree to the OptioHire{' '}
                <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Terms of Service</a>
                {' '}and{' '}
                <a href="/privacy" style={{ color: 'var(--primary)', fontWeight: 600 }}>Privacy Policy</a>.
                I confirm I am authorised to represent <strong>{inst.name}</strong> on this platform.
              </label>
            </div>

            <div className="form-footer">
              <button className="btn" onClick={() => setStep(3)}>← Back</button>
              <button
                className={`btn btn-gold btn-lg ${(!termsAccepted || password.length < 8 || password !== confirmPw || sending) ? '' : ''}`}
                onClick={handleActivate}
                disabled={!termsAccepted || password.length < 8 || password !== confirmPw || sending}
                style={{ opacity: (!termsAccepted || password.length < 8 || password !== confirmPw) ? 0.5 : 1 }}
              >
                {sending ? 'Activating…' : '🎓 Activate my Institution Console'}
              </button>
            </div>
          </div>

          {/* ===== STEP 5 — Success ===== */}
          <div className={`step-panel ${step === 5 ? 'active' : ''}`}>
            <div className="success-screen">
              <div className="success-icon">🎓</div>
              <h2>Your console is ready!</h2>
              <p>
                <strong>{inst.name}</strong> is now live on OptioHire. You can start uploading your first cohort CSV and your graduates will begin receiving their onboarding invitations.
              </p>

              <div className="next-steps">
                <h4>What to do next</h4>
                <div className="next-step-item">
                  <div className="ns-num">1</div>
                  <div>
                    <strong>Upload your graduating cohort CSV</strong><br />
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      Go to Bulk Onboarding and drag in your student list — name, email, student ID, department.
                    </span>
                  </div>
                </div>
                <div className="next-step-item">
                  <div className="ns-num">2</div>
                  <div>
                    <strong>Review the 5-column field map</strong><br />
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      OptioHire will auto-detect columns. You just confirm the mapping.
                    </span>
                  </div>
                </div>
                <div className="next-step-item">
                  <div className="ns-num">3</div>
                  <div>
                    <strong>Send 596 invitations in one click</strong><br />
                    <span style={{ fontSize: 12, color: 'var(--ink-soft)' }}>
                      Each student gets a personalised onboarding email and their profile is pre-loaded.
                    </span>
                  </div>
                </div>
              </div>

              <Link
                href={`/institutions/${instId}/overview`}
                className="btn btn-primary btn-lg"
                style={{ textDecoration: 'none' }}
              >
                Open my Institution Console →
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
