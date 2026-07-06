'use client';
import React from 'react';

export default function TrackerPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Placement Tracker</div>
          <h1>Live Pipeline Kanban</h1>
        </div>
      </div>

      <div className="kanban">
        {/* Enrolled Column */}
        <div className="kcol">
          <div className="kcol-head">
            <span>Enrolled</span>
            <span>113</span>
          </div>
          <div className="kcard">
            <div className="n">Diana Njuguna</div>
            <div className="m">Invitation sent 4d ago</div>
          </div>
          <div className="kcard">
            <div className="n">Erick Mwangi</div>
            <div className="m">CV flagged for review</div>
          </div>
        </div>

        {/* Activated Column */}
        <div className="kcol">
          <div className="kcol-head">
            <span>Activated</span>
            <span>335</span>
          </div>
          <div className="kcard">
            <div className="n">Kevin Mutua</div>
            <div className="m">Profile complete</div>
            <div className="sc">Avg Match: 68%</div>
          </div>
        </div>

        {/* Shortlisted Column */}
        <div className="kcol">
          <div className="kcol-head">
            <span style={{ color: 'var(--gold)' }}>Shortlisted</span>
            <span>152</span>
          </div>
          <div className="kcard">
            <div className="n">Faith Chebet</div>
            <div className="m">Cres Dynamics</div>
            <div className="sc">Match: 88%</div>
          </div>
          <div className="kcard">
            <div className="n">Sarah Njeri</div>
            <div className="m">Safaricom PLC</div>
            <div className="sc">Match: 81%</div>
          </div>
        </div>

        {/* Interviewing Column */}
        <div className="kcol">
          <div className="kcol-head">
            <span style={{ color: '#6B4FA0' }}>Interviewing</span>
            <span>64</span>
          </div>
          <div className="kcard">
            <div className="n">Brian Otieno</div>
            <div className="m">Round 1 · Twiga Foods</div>
            <div className="sc">Match: 84%</div>
          </div>
        </div>

        {/* Placed Column */}
        <div className="kcol" style={{ background: '#F1F8F3', borderColor: '#BFE0CC' }}>
          <div className="kcol-head" style={{ borderColor: '#BFE0CC' }}>
            <span style={{ color: '#2A7A52' }}>Placed (FT)</span>
            <span>38</span>
          </div>
          <div className="kcard">
            <div className="n">Amina Wafula</div>
            <div className="m">Safaricom PLC</div>
            <div className="sc" style={{ color: '#2A7A52' }}>Accepted offer</div>
          </div>
        </div>

        {/* Interning Column */}
        <div className="kcol" style={{ background: '#F2FAFB', borderColor: '#C8E8EB' }}>
          <div className="kcol-head" style={{ borderColor: '#C8E8EB' }}>
            <span style={{ color: '#1E7E8C' }}>Interning</span>
            <span>91</span>
          </div>
          <div className="kcard">
            <div className="n">John Kamau</div>
            <div className="m">Equity Bank</div>
            <div className="sc" style={{ color: '#1E7E8C' }}>Started 1 Jun</div>
          </div>
        </div>
      </div>
    </>
  );
}
