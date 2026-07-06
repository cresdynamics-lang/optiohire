'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Send, Eye, RefreshCw, Mail, CheckCircle2, Clock, AlertCircle, ExternalLink } from 'lucide-react';

type FormStatus = 'completed' | 'opened' | 'not_opened';

interface OnboardingRecord {
  id: string;
  institution: string;
  sentTo: string;
  sentAt: string;
  openedAt: string | null;
  completedAt: string | null;
  status: FormStatus;
  token: string;
}

const MOCK_RECORDS: OnboardingRecord[] = [
  {
    id: '1',
    institution: 'Strathmore University',
    sentTo: 'j.nduta@strathmore.edu',
    sentAt: 'Jun 14, 2026 · 09:14',
    openedAt: 'Jun 14, 2026 · 10:02',
    completedAt: 'Jun 14, 2026 · 10:28',
    status: 'completed',
    token: 'preview-token',
  },
  {
    id: '2',
    institution: 'Multimedia University of Kenya',
    sentTo: 's.karanja@mmu.ac.ke',
    sentAt: 'May 28, 2026 · 11:30',
    openedAt: 'May 28, 2026 · 14:15',
    completedAt: 'May 28, 2026 · 14:44',
    status: 'completed',
    token: 'mmu-token',
  },
  {
    id: '3',
    institution: 'KCA University',
    sentTo: 'p.waweru@kca.ac.ke',
    sentAt: 'Jul 1, 2026 · 08:00',
    openedAt: 'Jul 1, 2026 · 09:45',
    completedAt: null,
    status: 'opened',
    token: 'kca-token',
  },
  {
    id: '4',
    institution: 'Zetech University',
    sentTo: 'a.mwangi@zetech.ac.ke',
    sentAt: 'Jul 3, 2026 · 16:22',
    openedAt: null,
    completedAt: null,
    status: 'not_opened',
    token: 'zetech-token',
  },
  {
    id: '5',
    institution: 'Kabarak University',
    sentTo: 'm.cheptoo@kabarak.ac.ke',
    sentAt: 'Jul 4, 2026 · 10:05',
    openedAt: null,
    completedAt: null,
    status: 'not_opened',
    token: 'kabarak-token',
  },
];

const STATUS_CONFIG: Record<FormStatus, { label: string; icon: React.ReactNode; bg: string; color: string }> = {
  completed: {
    label: 'Completed',
    icon: <CheckCircle2 size={13} />,
    bg: '#E4EEE7', color: '#1F4D3D',
  },
  opened: {
    label: 'Opened — in progress',
    icon: <Clock size={13} />,
    bg: '#F5EAD2', color: '#B98A2E',
  },
  not_opened: {
    label: 'Not opened',
    icon: <AlertCircle size={13} />,
    bg: '#F5E3DE', color: '#9C3B2C',
  },
};

export default function AdminOnboardingFormsPage() {
  const [records, setRecords] = useState<OnboardingRecord[]>(MOCK_RECORDS);
  const [resendingId, setResendingId] = useState<string | null>(null);

  const completed = records.filter(r => r.status === 'completed').length;
  const opened = records.filter(r => r.status === 'opened').length;
  const notOpened = records.filter(r => r.status === 'not_opened').length;

  async function handleResend(id: string) {
    setResendingId(id);
    await new Promise(r => setTimeout(r, 1200));
    setResendingId(null);
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
          <Mail size={20} color="#1F4D3D" />
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 600, color: '#152A22', margin: 0 }}>
            Onboarding Forms
          </h1>
        </div>
        <p style={{ fontSize: 13, color: '#3E5449', margin: 0 }}>
          Track all institution onboarding invitations — who has opened, completed, or not yet responded.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Completed', value: completed, ...STATUS_CONFIG.completed },
          { label: 'Opened — in progress', value: opened, ...STATUS_CONFIG.opened },
          { label: 'Not opened', value: notOpened, ...STATUS_CONFIG.not_opened },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, padding: '16px 20px' }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 30, fontWeight: 600, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: '#3E5449', marginTop: 4 }}>{s.label}</div>
            <div style={{ marginTop: 8, height: 4, background: '#F0F0F0', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ height: '100%', background: s.color, width: `${(s.value / records.length) * 100}%`, borderRadius: 10 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#F3F5EF' }}>
              {['Institution', 'Sent to', 'Sent at', 'Opened at', 'Completed at', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #DCE1D5' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r, idx) => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <tr key={r.id} style={{ borderBottom: idx < records.length - 1 ? '1px solid #DCE1D5' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAF7')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: '#152A22' }}>{r.institution}</td>
                  <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#3E5449' }}>{r.sentTo}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: '#3E5449' }}>{r.sentAt}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: r.openedAt ? '#152A22' : '#bbb' }}>{r.openedAt || '—'}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: r.completedAt ? '#1F4D3D' : '#bbb', fontWeight: r.completedAt ? 600 : 400 }}>{r.completedAt || '—'}</td>
                  <td style={{ padding: '13px 14px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: cfg.bg, color: cfg.color,
                      borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 600,
                    }}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </td>
                  <td style={{ padding: '13px 14px' }}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <Link
                        href={`/institutions/onboard/${r.token}`}
                        target="_blank"
                        title="Preview form"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 6, border: '1.5px solid #DCE1D5',
                          background: '#fff', color: '#3E5449', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none',
                        }}
                      >
                        <Eye size={12} /> Preview
                      </Link>
                      {r.status !== 'completed' && (
                        <button
                          onClick={() => handleResend(r.id)}
                          disabled={resendingId === r.id}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            padding: '5px 10px', borderRadius: 6, border: '1.5px solid #B98A2E',
                            background: '#F5EAD2', color: '#B98A2E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                          }}
                        >
                          {resendingId === r.id ? <RefreshCw size={12} /> : <Send size={12} />}
                          {resendingId === r.id ? 'Sending…' : 'Resend'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
