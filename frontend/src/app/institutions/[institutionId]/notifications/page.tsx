'use client';
import React from 'react';

export default function NotificationsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Communication Log</div>
          <h1>System Notifications &amp; Emails</h1>
        </div>
      </div>

      <div className="panel">
        <div className="metric-row">
          <div className="metric">
            <div className="n">596</div>
            <div className="l">Emails sent this week</div>
          </div>
          <div className="metric">
            <div className="n">91%</div>
            <div className="l">Open rate</div>
          </div>
          <div className="metric">
            <div className="n">12</div>
            <div className="l">Bounced / invalid</div>
          </div>
        </div>
        <div className="timeline">
          <div className="tl-item">
            <div className="tl-icon" style={{ background: 'var(--gold-pale)', color: 'var(--gold)' }}>!</div>
            <div className="tl-body">
              <div className="t">Action Required: 12 emails bounced</div>
              <div className="d">Review the roster to correct invalid email addresses for the 2026 cohort.</div>
              <div className="time">2 hours ago</div>
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-icon" style={{ background: 'var(--primary-pale)', color: 'var(--primary)' }}>✓</div>
            <div className="tl-body">
              <div className="t">596 Onboarding Invitations Sent</div>
              <div className="d">Bulk action triggered by Joyce Nduta for cohort &quot;2026 · Informatics & Business IT&quot;</div>
              <div className="time">1 day ago</div>
            </div>
          </div>
          <div className="tl-item">
            <div className="tl-icon" style={{ background: 'var(--sky-pale)', color: 'var(--sky)' }}>✉</div>
            <div className="tl-body">
              <div className="t">Weekly Placement Digest Sent</div>
              <div className="d">Delivered to careers@strathmore.edu - 14 new placements this week.</div>
              <div className="time">3 days ago</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
