'use client';
import React, { useState } from 'react';

export default function RosterPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';
  const [activeFilter, setActiveFilter] = useState('All candidates (600)');

  const filters = [
    'All candidates (600)',
    'Enrolled (113)',
    'Activated (487)',
    'Shortlisted (152)',
    'Interviewing (64)',
    'Placed (129)'
  ];

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Candidate Roster</div>
          <h1>2026 · Informatics &amp; Business IT</h1>
        </div>
        <div className="topbar-actions">
          <button className="btn">Export CSV</button>
          <button className="btn btn-primary">Add student</button>
        </div>
      </div>

      <div className="panel">
        <div className="toolbar">
          <input type="text" className="search" placeholder="Search by name, student ID, or email..." />
          {filters.map(f => (
            <button
              key={f}
              className={`filter-chip ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <table style={{ borderTop: 'none', borderRadius: '0 0 10px 10px' }}>
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Pathway</th>
              <th>Status in pipeline</th>
              <th>Companies</th>
              <th>Match Profile</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av">AW</div>
                  <div className="info">
                    <div className="n">Amina Wafula</div>
                    <div className="id">STR/2026/0142</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Job-Ready Grad</td>
              <td><span className="seal placed"><span className="dot"></span>Placed</span></td>
              <td style={{ fontSize: '12px' }}>Safaricom PLC</td>
              <td><span className="score hi">92%</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn" title="View profile">👁</button>
                  <button className="icon-btn" title="Edit details">✎</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>BO</div>
                  <div className="info">
                    <div className="n">Brian Otieno</div>
                    <div className="id">STR/2026/0143</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Internship</td>
              <td><span className="seal interviewing"><span className="dot"></span>Interviewing</span></td>
              <td style={{ fontSize: '12px' }}>Twiga, Equity Bank</td>
              <td><span className="score hi">84%</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn">👁</button>
                  <button className="icon-btn">✎</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av">FC</div>
                  <div className="info">
                    <div className="n">Faith Chebet</div>
                    <div className="id">STR/2026/0144</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Job-Ready Grad</td>
              <td><span className="seal shortlisted"><span className="dot"></span>Shortlisted</span></td>
              <td style={{ fontSize: '12px' }}>Cres Dynamics</td>
              <td><span className="score hi">88%</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn">👁</button>
                  <button className="icon-btn">✎</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av" style={{ background: 'var(--sky-pale)', color: 'var(--sky)' }}>KM</div>
                  <div className="info">
                    <div className="n">Kevin Mutua</div>
                    <div className="id">STR/2026/0145</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Attachment</td>
              <td><span className="seal activated"><span className="dot"></span>Activated</span></td>
              <td style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>Waiting for matches</td>
              <td><span className="score mid">68%</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn">👁</button>
                  <button className="icon-btn">✎</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av">DN</div>
                  <div className="info">
                    <div className="n">Diana Njuguna</div>
                    <div className="id">STR/2026/0146</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Job-Ready Grad</td>
              <td><span className="seal enrolled"><span className="dot"></span>Enrolled</span></td>
              <td style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>—</td>
              <td><span className="score lo">N/A</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn">👁</button>
                  <button className="icon-btn">✎</button>
                </div>
              </td>
            </tr>
            <tr>
              <td>
                <div className="cand-name">
                  <div className="av" style={{ background: 'var(--rust-pale)', color: 'var(--rust)' }}>EM</div>
                  <div className="info">
                    <div className="n">Erick Mwangi</div>
                    <div className="id">STR/2026/0147</div>
                  </div>
                </div>
              </td>
              <td style={{ fontSize: '11.5px', color: 'var(--ink-soft)' }}>Internship</td>
              <td><span className="seal review"><span className="dot"></span>Review flagged</span></td>
              <td style={{ fontSize: '12px', color: 'var(--ink-soft)' }}>—</td>
              <td><span className="score lo">N/A</span></td>
              <td>
                <div className="row-actions">
                  <button className="icon-btn">👁</button>
                  <button className="icon-btn">✎</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </>
  );
}
