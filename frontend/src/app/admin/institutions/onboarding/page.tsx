
'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Send, Eye, RefreshCw, Mail, CheckCircle2, Clock, AlertCircle, ExternalLink, Plus } from 'lucide-react';
import { format } from 'date-fns';

type FormStatus = 'completed' | 'opened' | 'not_opened';

interface OnboardingRecord {
  id: string;
  institution_name: string;
  sent_to: string;
  sent_at: string;
  opened_at: string | null;
  completed_at: string | null;
  status: FormStatus;
  token: string;
}

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
  const [records, setRecords] = useState<OnboardingRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [resendingId, setResendingId] = useState<string | null>(null);
  
  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newInstName, setNewInstName] = useState('');
  const [newInstEmail, setNewInstEmail] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  async function fetchRecords() {
    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      const res = await fetch(`${url}/api/admin/institutions/onboarding`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setRecords(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleResend(id: string) {
    setResendingId(id);
    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      await fetch(`${url}/api/admin/institutions/onboarding/${id}/resend`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });
      await fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setResendingId(null);
    }
  }

  async function handleCreateInvite(e: React.FormEvent) {
    e.preventDefault();
    setCreating(true);
    try {
      const url = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3001';
      const token = localStorage.getItem('token');
      await fetch(`${url}/api/admin/institutions/onboarding/invite`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ institutionName: newInstName, contactEmail: newInstEmail })
      });
      setShowModal(false);
      setNewInstName('');
      setNewInstEmail('');
      await fetchRecords();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
    }
  }

  const completed = records.filter(r => r.status === 'completed').length;
  const opened = records.filter(r => r.status === 'opened').length;
  const notOpened = records.filter(r => r.status === 'not_opened').length;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return format(new Date(dateStr), 'MMM d, yyyy · HH:mm');
  };

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
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
        <button 
          onClick={() => setShowModal(true)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            background: '#1F4D3D', color: 'white', padding: '10px 16px',
            borderRadius: 6, border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer'
          }}
        >
          <Plus size={16} /> New Invite
        </button>
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
              <div style={{ height: '100%', background: s.color, width: records.length > 0 ? `${(s.value / records.length) * 100}%` : '0%', borderRadius: 10 }} />
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
            {loading ? (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center' }}>Loading...</td></tr>
            ) : records.length === 0 ? (
              <tr><td colSpan={7} style={{ padding: 20, textAlign: 'center', color: '#666' }}>No invites found.</td></tr>
            ) : records.map((r, idx) => {
              const cfg = STATUS_CONFIG[r.status];
              return (
                <tr key={r.id} style={{ borderBottom: idx < records.length - 1 ? '1px solid #DCE1D5' : 'none' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F9FAF7')}
                  onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
                >
                  <td style={{ padding: '13px 14px', fontWeight: 600, color: '#152A22' }}>{r.institution_name}</td>
                  <td style={{ padding: '13px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, color: '#3E5449' }}>{r.sent_to}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: '#3E5449' }}>{formatDate(r.sent_at)}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: r.opened_at ? '#152A22' : '#bbb' }}>{formatDate(r.opened_at)}</td>
                  <td style={{ padding: '13px 14px', fontSize: 12, color: r.completed_at ? '#1F4D3D' : '#bbb', fontWeight: r.completed_at ? 600 : 400 }}>{formatDate(r.completed_at)}</td>
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
      
      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div style={{ background: '#fff', padding: 30, borderRadius: 12, width: 400 }}>
            <h2 style={{ marginTop: 0, color: '#1F4D3D' }}>Send Onboarding Invite</h2>
            <form onSubmit={handleCreateInvite}>
              <div style={{ marginBottom: 15 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Institution Name</label>
                <input 
                  required
                  value={newInstName}
                  onChange={e => setNewInstName(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 6 }} 
                  placeholder="e.g. Strathmore University"
                />
              </div>
              <div style={{ marginBottom: 25 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 5 }}>Contact Email</label>
                <input 
                  required
                  type="email"
                  value={newInstEmail}
                  onChange={e => setNewInstEmail(e.target.value)}
                  style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: 6 }} 
                  placeholder="jane.doe@univ.edu"
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '10px 16px', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
                <button type="submit" disabled={creating} style={{ padding: '10px 16px', background: '#1F4D3D', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}>
                  {creating ? 'Sending...' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
