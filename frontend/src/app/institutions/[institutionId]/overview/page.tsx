'use client';
import React from 'react';
import Link from 'next/link';

export default function OverviewPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">2026 Graduating Cohort</div>
          <h1>Good morning, Joyce.</h1>
          <div className="desc">
            600 finalists from B.Sc. Informatics &amp; Business IT are moving through the
            OptioHire pipeline. Here&apos;s where they stand today.
          </div>
        </div>
        <div className="topbar-actions">
          <select className="cohort-select" defaultValue="2026 · Informatics & IT (600)">
            <option>2026 · Informatics &amp; IT (600)</option>
            <option>2025 · Informatics &amp; IT (540)</option>
            <option>2026 · Commerce (310)</option>
          </select>
          <Link href={`/institutions/${instId}/onboarding`} className="btn btn-primary">
            + New Cohort Upload
          </Link>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <div className="n">600</div>
          <div className="l">Students onboarded</div>
          <div className="delta flat">Full cohort loaded</div>
        </div>
        <div className="stat-card">
          <div className="n">487</div>
          <div className="l">Accounts activated</div>
          <div className="delta up">↑ 81% activation rate</div>
        </div>
        <div className="stat-card">
          <div className="n">152</div>
          <div className="l">Shortlisted somewhere</div>
          <div className="delta up">↑ 18 this week</div>
        </div>
        <div className="stat-card">
          <div className="n">64</div>
          <div className="l">In interview stage</div>
          <div className="delta up">↑ 9 this week</div>
        </div>
        <div className="stat-card">
          <div className="n">38</div>
          <div className="l">Placed — full-time</div>
          <div className="delta up">↑ 6 this week</div>
        </div>
        <div className="stat-card">
          <div className="n">91</div>
          <div className="l">Placed — internship</div>
          <div className="delta up">↑ 14 this week</div>
        </div>
      </div>

      <div className="panel">
        <div className="panel-head">
          <div>
            <h2>The Matriculation Ledger</h2>
            <div className="hint">Every student&apos;s journey from enrolment to placement, stamped stage by stage.</div>
          </div>
          <button className="btn btn-ghost">Export ledger →</button>
        </div>
        <div className="ledger">
          <div className="ledger-stage s1">
            <div className="stamp">600</div>
            <div className="stage-name">Enrolled by institution</div>
            <div className="stage-count">100% of cohort</div>
          </div>
          <div className="ledger-stage s2">
            <div className="stamp">487</div>
            <div className="stage-name">Invitation activated</div>
            <div className="stage-count">81% opened &amp; set up profile</div>
          </div>
          <div className="ledger-stage s3">
            <div className="stamp">152</div>
            <div className="stage-name">Shortlisted by employer</div>
            <div className="stage-count">31% of activated</div>
          </div>
          <div className="ledger-stage s4">
            <div className="stamp">64</div>
            <div className="stage-name">Interviewing</div>
            <div className="stage-count">42% of shortlisted</div>
          </div>
          <div className="ledger-stage s5">
            <div className="stamp">129</div>
            <div className="stage-name">Placed or interning</div>
            <div className="stage-count">38 hired · 91 interning</div>
          </div>
        </div>
      </div>

      <div className="two-col">
        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>Where our graduates are landing</h2>
              <div className="hint">Top employers matching this cohort, by placements secured</div>
            </div>
          </div>
          <div className="panel-body">
            <table>
              <thead>
                <tr>
                  <th>Employer</th>
                  <th>Role type</th>
                  <th>Placed</th>
                  <th>Avg. match score</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Cres Dynamics</td>
                  <td>Backend Engineering</td>
                  <td>11</td>
                  <td className="score hi">88%</td>
                </tr>
                <tr>
                  <td>Safaricom PLC</td>
                  <td>Graduate Trainee</td>
                  <td>9</td>
                  <td className="score hi">84%</td>
                </tr>
                <tr>
                  <td>Equity Bank</td>
                  <td>Data &amp; Analytics Intern</td>
                  <td>7</td>
                  <td className="score mid">76%</td>
                </tr>
                <tr>
                  <td>Twiga Foods</td>
                  <td>Software Engineering Intern</td>
                  <td>6</td>
                  <td className="score mid">73%</td>
                </tr>
                <tr>
                  <td>iHub Nairobi</td>
                  <td>Product Design Intern</td>
                  <td>4</td>
                  <td className="score mid">71%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <div>
              <h2>This week</h2>
              <div className="hint">Activity across the cohort</div>
            </div>
          </div>
          <div className="timeline">
            <div className="tl-item">
              <div className="tl-icon" style={{ background: 'var(--primary-pale)', color: 'var(--primary)' }}>✓</div>
              <div className="tl-body">
                <div className="t">6 students moved to Placed</div>
                <div className="d">Cres Dynamics, Safaricom, Equity Bank</div>
                <div className="time">2 days ago</div>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>★</div>
              <div className="tl-body">
                <div className="t">18 new shortlists issued</div>
                <div className="d">Across 9 open roles matched to this cohort</div>
                <div className="time">3 days ago</div>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon" style={{ background: 'var(--sky-pale)', color: 'var(--sky)' }}>✉</div>
              <div className="tl-body">
                <div className="t">113 activation reminders sent</div>
                <div className="d">To students who haven&apos;t opened onboarding email</div>
                <div className="time">4 days ago</div>
              </div>
            </div>
            <div className="tl-item">
              <div className="tl-icon" style={{ background: 'var(--rust-pale)', color: 'var(--rust)' }}>!</div>
              <div className="tl-body">
                <div className="t">7 profiles flagged for review</div>
                <div className="d">Low extraction confidence on uploaded CVs</div>
                <div className="time">5 days ago</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
