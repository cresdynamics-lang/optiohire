'use client';
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import './institutions.css';

export default function InstitutionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ institutionId: string }>;
}) {
  const unwrappedParams = React.use(params);
  const pathname = usePathname();
  const instId = unwrappedParams.institutionId || 'strathmore';

  // Helper to determine active state
  const isActive = (path: string) => {
    return pathname.includes(`/institutions/${instId}/${path}`) ? 'active' : '';
  };

  return (
    <div className="institutions-body">
      <div className="shell">
        {/* ============ SIDEBAR ============ */}
        <aside className="sidebar">
          <div className="brand">
            <div className="mark">O</div>
            <div>
              <div className="name">OptioHire</div>
              <div className="sub">Institution Console</div>
            </div>
          </div>

          <div className="institution-chip">
            <div className="crest"></div>
            <div>
              <div className="t1">Strathmore University</div>
              <div className="t2">Career Services · Nairobi, KE</div>
            </div>
          </div>

          <nav className="navlist">
            <div className="nav-group-label">Pipeline</div>
            <Link href={`/institutions/${instId}/overview`} className={isActive('overview')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="9" rx="1.5" />
                <rect x="14" y="3" width="7" height="5" rx="1.5" />
                <rect x="14" y="12" width="7" height="9" rx="1.5" />
                <rect x="3" y="16" width="7" height="5" rx="1.5" />
              </svg>
              Overview
            </Link>
            <Link href={`/institutions/${instId}/onboarding`} className={isActive('onboarding')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12" />
                <path d="M7 10l5 5 5-5" />
                <path d="M4 20h16" />
              </svg>
              Bulk Onboarding
            </Link>
            <Link href={`/institutions/${instId}/roster`} className={isActive('roster')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="9" cy="8" r="3.2" />
                <path d="M3.5 20c0-3.6 2.5-6 5.5-6s5.5 2.4 5.5 6" />
                <circle cx="18" cy="9" r="2.4" />
                <path d="M15 20c0-2.6 1.8-4.6 4-4.9" />
              </svg>
              Candidate Roster
              <span className="navcount">600</span>
            </Link>
            <Link href={`/institutions/${instId}/tracker`} className={isActive('tracker')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M3 12h18M3 18h10" />
              </svg>
              Placement Tracker
            </Link>
            <div className="nav-group-label">Communication</div>
            <Link href={`/institutions/${instId}/notifications`} className={isActive('notifications')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.7 21a2 2 0 01-3.4 0" />
              </svg>
              Notifications
              <span className="navcount">12</span>
            </Link>
            <div className="nav-group-label">Programme</div>
            <Link href={`/institutions/${instId}/cohorts`} className={isActive('cohorts')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 10L12 5 2 10l10 5 10-5z" />
                <path d="M6 12.5V17c0 1.5 3 3 6 3s6-1.5 6-3v-4.5" />
              </svg>
              Cohorts
            </Link>
            <Link href={`/institutions/${instId}/settings`} className={isActive('settings')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 00.3 1.9l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.9-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1-1.6 1.7 1.7 0 00-1.9.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.9 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1 1.7 1.7 0 00-.3-1.9l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.9.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.6 1.7 1.7 0 001.9-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.9V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" />
              </svg>
              Settings
            </Link>
          </nav>

          <div className="sidebar-footer">
            <div className="avatar">JN</div>
            <div>
              <div className="who">Joyce Nduta</div>
              <div className="role">Head, Career Services</div>
            </div>
          </div>
        </aside>

        {/* ============ MAIN ============ */}
        <main className="main">
          {children}
        </main>
      </div>
    </div>
  );
}
