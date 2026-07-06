'use client';
import React, { useState } from 'react';

export default function OnboardingPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';
  const [step, setStep] = useState(1);
  const [level, setLevel] = useState('degree');
  const [tracks, setTracks] = useState<Record<string, boolean>>({ internship: false, attachment: true, 'job-ready': true });
  
  // Upload simulation state
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success'>('idle');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState('Reading file…');
  const [sendProgress, setSendProgress] = useState(false);

  const toggleTrack = (track: string) => {
    setTracks(prev => ({ ...prev, [track]: !prev[track] }));
  };

  const simulateUpload = () => {
    setUploadState('uploading');
    const stages = [
        { p: 20, t: 'Reading file…' },
        { p: 45, t: 'Detecting columns…' },
        { p: 70, t: 'Validating email addresses…' },
        { p: 90, t: 'Checking for duplicates…' },
        { p: 100, t: 'Finalising…' }
    ];
    let i = 0;
    setUploadProgress(0);
    
    const nextStep = () => {
        if (i < stages.length) {
            setUploadProgress(stages[i].p);
            setUploadLabel(stages[i].t);
            i++;
            setTimeout(nextStep, 450);
        } else {
            setTimeout(() => {
                setUploadState('success');
            }, 300);
        }
    };
    nextStep();
  };

  const resetUpload = () => setUploadState('idle');

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Bulk Onboarding</div>
          <h1>Bring a new cohort into OptioHire</h1>
          <div className="desc">
            Upload your student list once. Everyone gets an account, an onboarding email,
            and a place in the pipeline — automatically.
          </div>
        </div>
      </div>

      <div className="panel">
        <div className="wizard-steps">
          <button className={`wstep ${step === 1 ? 'active' : step > 1 ? 'done' : ''}`} onClick={() => setStep(1)}>
            <span className="num">1</span><span className="label">Cohort details</span>
          </button>
          <button className={`wstep ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`} onClick={() => setStep(2)}>
            <span className="num">2</span><span className="label">Upload list</span>
          </button>
          <button className={`wstep ${step === 3 ? 'active' : step > 3 ? 'done' : ''}`} onClick={() => setStep(3)}>
            <span className="num">3</span><span className="label">Map fields</span>
          </button>
          <button className={`wstep ${step === 4 ? 'active' : step > 4 ? 'done' : ''}`} onClick={() => setStep(4)}>
            <span className="num">4</span><span className="label">Review</span>
          </button>
          <button className={`wstep ${step === 5 ? 'active' : step > 5 ? 'done' : ''}`} onClick={() => setStep(5)}>
            <span className="num">5</span><span className="label">Send invitations</span>
          </button>
        </div>

        {/* Step 1 — Cohort details */}
        {step === 1 && (
          <div className="panel-body wizard-panel">
            <div className="cohort-form-section">
              <label className="field-label">Cohort name</label>
              <p className="field-hint">This is how the batch will appear across your dashboard and to students in their onboarding email.</p>
              <input
                style={{ width: '100%', maxWidth: '420px', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', background: 'var(--paper)' }}
                defaultValue="2026 · Informatics & Business IT"
              />
            </div>

            <div className="cohort-form-section">
              <label className="field-label">Academic level</label>
              <p className="field-hint">Select the qualification this cohort is studying towards. This tailors the roles OptioHire matches them to.</p>
              <div className="select-pill-group">
                <button className={`select-pill ${level === 'certificate' ? 'active' : ''}`} onClick={() => setLevel('certificate')}>
                  Certificate<span className="sub">6–12 months</span>
                </button>
                <button className={`select-pill ${level === 'diploma' ? 'active' : ''}`} onClick={() => setLevel('diploma')}>
                  Diploma<span className="sub">1–2 years</span>
                </button>
                <button className={`select-pill ${level === 'degree' ? 'active' : ''}`} onClick={() => setLevel('degree')}>
                  Undergraduate Degree<span className="sub">3–4 years</span>
                </button>
                <button className={`select-pill ${level === 'postgraduate' ? 'active' : ''}`} onClick={() => setLevel('postgraduate')}>
                  Postgraduate<span className="sub">Masters / PGD</span>
                </button>
              </div>
            </div>

            <div className="cohort-form-section">
              <label className="field-label">Programme / department</label>
              <p className="field-hint">Used for matching and shown on each candidate&apos;s profile.</p>
              <input
                style={{ width: '100%', maxWidth: '420px', border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', background: 'var(--paper)' }}
                defaultValue="Informatics & Business IT"
              />
            </div>

            <div className="cohort-form-section">
              <label className="field-label">What are you onboarding them for?</label>
              <p className="field-hint">Select every pathway that applies — a cohort can be matched to more than one. This decides which employer roles they can be shortlisted against.</p>
              <div className="select-pill-group">
                <button className={`select-pill gold-active ${tracks['internship'] ? 'active' : ''}`} onClick={() => toggleTrack('internship')}>
                  Internship<span className="sub">Short-term, learning-focused</span>
                </button>
                <button className={`select-pill gold-active ${tracks['attachment'] ? 'active' : ''}`} onClick={() => toggleTrack('attachment')}>
                  Industrial Attachment<span className="sub">Academic requirement, fixed term</span>
                </button>
                <button className={`select-pill gold-active ${tracks['job-ready'] ? 'active' : ''}`} onClick={() => toggleTrack('job-ready')}>
                  Job-Ready Graduate<span className="sub">Full-time placement</span>
                </button>
              </div>
            </div>

            <div className="cohort-form-section" style={{ marginBottom: '6px' }}>
              <label className="field-label">Expected completion</label>
              <input
                type="month"
                style={{ border: '1px solid var(--line)', borderRadius: '8px', padding: '9px 12px', fontSize: '13px', fontFamily: 'inherit', background: 'var(--paper)' }}
                defaultValue="2026-11"
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '18px' }}>
              <button className="btn btn-primary" onClick={() => setStep(2)}>Continue to upload list</button>
            </div>
          </div>
        )}

        {/* Step 2 — Upload */}
        {step === 2 && (
          <div className="panel-body wizard-panel">
            {uploadState === 'idle' && (
              <div className="dropzone">
                <div className="icon">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 3v12" />
                    <path d="M7 10l5 5 5-5" />
                    <path d="M4 20h16" />
                  </svg>
                </div>
                <h3>Drag your student list here</h3>
                <p>CSV or Excel — name, email, student ID, department, expected graduation. Up to 5,000 rows.</p>
                <button className="btn btn-primary" onClick={simulateUpload}>Choose file</button>
                <div style={{ marginTop: '16px', fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                  or paste from Google Sheets · <a href="#" style={{ color: 'var(--primary)', fontWeight: 600 }} onClick={e => e.preventDefault()}>download our template</a>
                </div>
              </div>
            )}

            {uploadState === 'uploading' && (
              <div className="upload-progress-card">
                <div className="file-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                    <path d="M14 2v6h6" />
                  </svg>
                </div>
                <h3 style={{ fontSize: '14.5px', marginBottom: '4px' }}>graduating_class_2026.csv</h3>
                <p style={{ marginBottom: '14px' }}>Uploading and scanning rows…</p>
                <div className="progress-track" style={{ maxWidth: '360px', margin: '0 auto 8px' }}>
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <div style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>{uploadLabel}</div>
              </div>
            )}

            {uploadState === 'success' && (
              <div>
                <div className="upload-success-card">
                  <div className="head">
                    <div className="check">✓</div>
                    <div>
                      <div className="t1">graduating_class_2026.csv uploaded successfully</div>
                      <div className="t2">Ready to map fields</div>
                    </div>
                  </div>
                  <div className="meta-grid">
                    <div className="meta-tile">
                      <div className="n">600</div>
                      <div className="l">Rows detected</div>
                    </div>
                    <div className="meta-tile">
                      <div className="n">6</div>
                      <div className="l">Columns found</div>
                    </div>
                    <div className="meta-tile">
                      <div className="n">82 KB</div>
                      <div className="l">File size</div>
                    </div>
                    <div className="meta-tile">
                      <div className="n">596</div>
                      <div className="l">Valid email rows</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--ink-soft)', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '6px' }}>
                    Columns detected
                  </div>
                  <div className="col-chip-row">
                    <span className="col-chip">full_name</span>
                    <span className="col-chip">student_email</span>
                    <span className="col-chip">reg_no</span>
                    <span className="col-chip">programme</span>
                    <span className="col-chip">grad_year</span>
                    <span className="col-chip">phone</span>
                  </div>
                  <table style={{ background: '#fff', borderRadius: '8px', overflow: 'hidden' }}>
                    <thead>
                      <tr>
                        <th>full_name</th>
                        <th>student_email</th>
                        <th>reg_no</th>
                        <th>programme</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Amina Wafula</td>
                        <td className="mono">a.wafula@strathmore.edu</td>
                        <td className="mono">STR/2026/0142</td>
                        <td>Informatics</td>
                      </tr>
                      <tr>
                        <td>Brian Otieno</td>
                        <td className="mono">b.otieno@strathmore.edu</td>
                        <td className="mono">STR/2026/0143</td>
                        <td>Business IT</td>
                      </tr>
                      <tr>
                        <td>Faith Chebet</td>
                        <td className="mono">f.chebet@strathmore.edu</td>
                        <td className="mono">STR/2026/0144</td>
                        <td>Informatics</td>
                      </tr>
                    </tbody>
                  </table>
                  <div style={{ fontSize: '11px', color: 'var(--ink-soft)', marginTop: '10px' }}>
                    Showing 3 of 600 rows · 4 rows flagged with missing or invalid emails will be skipped, and 3 duplicates were removed automatically.
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '18px' }}>
                  <button className="btn" onClick={resetUpload}>Replace file</button>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="btn" onClick={() => setStep(1)}>Back</button>
                    <button className="btn btn-primary" onClick={() => setStep(3)}>Continue to map fields</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3 — Map fields */}
        {step === 3 && (
          <div className="panel-body wizard-panel">
            <div style={{ marginBottom: '14px', fontSize: '13px', color: 'var(--ink-soft)' }}>
              <b>graduating_class_2026.csv</b> — 600 rows detected. Match each column to an OptioHire field.
            </div>
            {[
              { csv: 'full_name', target: 'Candidate name' },
              { csv: 'student_email', target: 'Email address' },
              { csv: 'reg_no', target: 'Student ID' },
              { csv: 'programme', target: 'Department / Programme' },
              { csv: 'grad_year', target: 'Expected graduation year' },
              { csv: 'phone', target: 'Phone number' },
            ].map((f, idx) => (
              <div className="mapping-row" key={idx}>
                <div className="csvcol">{f.csv}</div>
                <div>→</div>
                <select defaultValue={f.target}>
                  <option>{f.target}</option>
                </select>
              </div>
            ))}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button className="btn" onClick={() => setStep(2)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(4)}>Continue to review</button>
            </div>
          </div>
        )}

        {/* Step 4 — Review */}
        {step === 4 && (
          <div className="panel-body wizard-panel">
            <div className="summary-line"><div className="k">Institution</div><div className="v">Strathmore University</div></div>
            <div className="summary-line"><div className="k">Cohort name</div><div className="v">2026 · Informatics &amp; Business IT</div></div>
            <div className="summary-line"><div className="k">Academic level</div><div className="v">Undergraduate Degree</div></div>
            <div className="summary-line"><div className="k">Onboarding for</div><div className="v">Industrial Attachment, Job-Ready Graduate</div></div>
            <div className="summary-line"><div className="k">Rows detected</div><div className="v">600</div></div>
            <div className="summary-line"><div className="k">Valid emails</div><div className="v">596</div></div>
            <div className="summary-line"><div className="k">Duplicate entries removed</div><div className="v">3</div></div>
            <div className="summary-line"><div className="k">Flagged for manual check</div><div className="v" style={{ color: 'var(--rust)' }}>4 (missing email)</div></div>
            
            <div style={{ marginTop: '16px' }}>
              <table>
                <thead>
                  <tr><th>Name</th><th>Student ID</th><th>Department</th><th>Email</th></tr>
                </thead>
                <tbody>
                  <tr><td>Amina Wafula</td><td className="mono">STR/2026/0142</td><td>Informatics</td><td>a.wafula@strathmore.edu</td></tr>
                  <tr><td>Brian Otieno</td><td className="mono">STR/2026/0143</td><td>Business IT</td><td>b.otieno@strathmore.edu</td></tr>
                  <tr><td>Faith Chebet</td><td className="mono">STR/2026/0144</td><td>Informatics</td><td>f.chebet@strathmore.edu</td></tr>
                  <tr><td colSpan={4} style={{ color: 'var(--ink-soft)', textAlign: 'center' }}>+ 593 more rows</td></tr>
                </tbody>
              </table>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '18px' }}>
              <button className="btn" onClick={() => setStep(3)}>Back</button>
              <button className="btn btn-primary" onClick={() => setStep(5)}>Looks good — continue</button>
            </div>
          </div>
        )}

        {/* Step 5 — Send invitations */}
        {step === 5 && (
          <div className="panel-body wizard-panel">
            <div style={{ textAlign: 'center', padding: '10px 0 20px' }}>
              <h3 style={{ fontSize: '19px', marginBottom: '8px' }}>Ready to onboard 596 students</h3>
              <p style={{ color: 'var(--ink-soft)', fontSize: '13px', maxWidth: '480px', margin: '0 auto' }}>
                Each student receives a personal onboarding email inviting them to activate their OptioHire account, complete their profile, and upload their CV. Institution data (student ID, department, cohort, and pathway) is pre-filled for them.
              </p>
            </div>
            <div style={{ background: 'var(--paper)', border: '1px solid var(--line)', borderRadius: '10px', padding: '16px 20px', maxWidth: '520px', margin: '0 auto 20px' }}>
              <div className="field-group" style={{ marginBottom: '10px' }}>
                <label>Email preview — subject line</label>
                <input defaultValue="Your Strathmore Career Profile is ready — activate on OptioHire" />
              </div>
              <div className="field-group" style={{ marginBottom: 0 }}>
                <label>Sender</label>
                <input defaultValue="careers@strathmore.edu, via OptioHire" />
              </div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <button className="btn btn-gold" style={{ padding: '12px 28px', fontSize: '14px' }} onClick={() => setSendProgress(true)}>
                Send 596 invitations
              </button>
            </div>
            
            {sendProgress && (
              <div style={{ maxWidth: '520px', margin: '20px auto 0' }}>
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: '74%' }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11.5px', color: 'var(--ink-soft)' }}>
                  <span>441 of 596 sent</span><span>Estimated 40 seconds remaining</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
