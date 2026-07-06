'use client';
import React from 'react';
import Link from 'next/link';

export default function CohortsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Academic Programmes</div>
          <h1>Cohorts</h1>
          <div className="desc">Manage different graduating classes and departments across your institution.</div>
        </div>
      </div>

      <div className="cohort-grid">
        <div className="cohort-card">
          <div className="tag">Active Pipeline</div>
          <h3>2026 · Informatics &amp; IT</h3>
          <div className="meta">600 students · onboarded 2 days ago</div>
          <div className="bar"><span style={{ width: '81%' }}></span></div>
          <div className="stat-line"><span>487 activated</span><span>81%</span></div>
        </div>
        <div className="cohort-card">
          <div className="tag">Active Pipeline</div>
          <h3>2026 · Commerce</h3>
          <div className="meta">310 students · onboarded 2 weeks ago</div>
          <div className="bar"><span style={{ width: '94%' }}></span></div>
          <div className="stat-line"><span>291 activated</span><span>94%</span></div>
        </div>
        <div className="cohort-card" style={{ opacity: 0.7 }}>
          <div className="tag" style={{ color: 'var(--ink-soft)' }}>Graduated</div>
          <h3>2025 · Informatics &amp; IT</h3>
          <div className="meta">540 students · onboarded May 2025</div>
          <div className="bar"><span style={{ width: '88%' }}></span></div>
          <div className="stat-line"><span>475 placed / interning</span><span>88%</span></div>
        </div>
        <div className="cohort-card" style={{ opacity: 0.7 }}>
          <div className="tag" style={{ color: 'var(--ink-soft)' }}>Graduated</div>
          <h3>2024 · Informatics &amp; IT</h3>
          <div className="meta">467 students · onboarded May 2024</div>
          <div className="bar"><span style={{ width: '71%' }}></span></div>
          <div className="stat-line"><span>331 placed / interning</span><span>71%</span></div>
        </div>
        
        <Link href={`/institutions/${instId}/onboarding`}>
          <div className="cohort-card"
            style={{ borderStyle: 'dashed', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--ink-soft)', cursor: 'pointer', height: '100%' }}>
            <div>
              <div style={{ fontSize: '26px' }}>+</div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Onboard a new cohort</div>
            </div>
          </div>
        </Link>
      </div>
    </>
  );
}
