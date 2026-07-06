'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap, Plus, Send, Eye, ExternalLink,
  RefreshCw, Building2, Users, CheckCircle2, Clock,
  MoreHorizontal, Search, Filter
} from 'lucide-react';

type InstitutionStatus = 'active' | 'pending' | 'draft';

interface Institution {
  id: string;
  name: string;
  type: 'University' | 'College' | 'TVET/Polytechnic';
  location: string;
  contactName: string;
  contactEmail: string;
  contactTitle: string;
  status: InstitutionStatus;
  candidatesInPool: number;
  cohortsCount: number;
  onboardedAt: string | null;
  onboardToken: string;
}

const MOCK_INSTITUTIONS: Institution[] = [
  {
    id: 'strathmore',
    name: 'Strathmore University',
    type: 'University',
    location: 'Nairobi, KE',
    contactName: 'Joyce Nduta',
    contactEmail: 'j.nduta@strathmore.edu',
    contactTitle: 'Head, Career Services',
    status: 'active',
    candidatesInPool: 600,
    cohortsCount: 3,
    onboardedAt: 'Jun 14, 2026',
    onboardToken: 'preview-token',
  },
  {
    id: 'kca',
    name: 'KCA University',
    type: 'University',
    location: 'Nairobi, KE',
    contactName: 'Peter Waweru',
    contactEmail: 'p.waweru@kca.ac.ke',
    contactTitle: 'Career Services Coordinator',
    status: 'pending',
    candidatesInPool: 0,
    cohortsCount: 0,
    onboardedAt: null,
    onboardToken: 'kca-token',
  },
  {
    id: 'kabarak',
    name: 'Kabarak University',
    type: 'University',
    location: 'Nakuru, KE',
    contactName: 'Mary Cheptoo',
    contactEmail: 'm.cheptoo@kabarak.ac.ke',
    contactTitle: 'Placements Officer',
    status: 'draft',
    candidatesInPool: 0,
    cohortsCount: 0,
    onboardedAt: null,
    onboardToken: 'kabarak-token',
  },
  {
    id: 'multimedia',
    name: 'Multimedia University of Kenya',
    type: 'University',
    location: 'Nairobi, KE',
    contactName: 'Samuel Karanja',
    contactEmail: 's.karanja@mmu.ac.ke',
    contactTitle: 'Dean of Students',
    status: 'active',
    candidatesInPool: 312,
    cohortsCount: 1,
    onboardedAt: 'May 28, 2026',
    onboardToken: 'mmu-token',
  },
  {
    id: 'zetech',
    name: 'Zetech University',
    type: 'College',
    location: 'Nairobi, KE',
    contactName: 'Alice Mwangi',
    contactEmail: 'a.mwangi@zetech.ac.ke',
    contactTitle: 'Careers Manager',
    status: 'pending',
    candidatesInPool: 0,
    cohortsCount: 0,
    onboardedAt: null,
    onboardToken: 'zetech-token',
  },
];

const STATUS_STYLES: Record<InstitutionStatus, { label: string; bg: string; color: string; dot: string }> = {
  active: { label: 'Active', bg: '#E4EEE7', color: '#1F4D3D', dot: '#2F6B54' },
  pending: { label: 'Pending onboarding', bg: '#F5EAD2', color: '#B98A2E', dot: '#B98A2E' },
  draft: { label: 'Draft', bg: '#F0F0F0', color: '#666', dot: '#999' },
};

function StatusBadge({ status }: { status: InstitutionStatus }) {
  const s = STATUS_STYLES[status];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      background: s.bg, color: s.color, borderRadius: 20,
      padding: '3px 10px', fontSize: 12, fontWeight: 600,
    }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: s.dot, flexShrink: 0 }} />
      {s.label}
    </span>
  );
}

function AddInstitutionModal({ onClose, onAdd }: { onClose: () => void; onAdd: (inst: Institution) => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<Institution['type']>('University');
  const [location, setLocation] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactTitle, setContactTitle] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    const token = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-token';
    onAdd({
      id: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      name, type, location, contactName, contactEmail, contactTitle,
      status: 'pending',
      candidatesInPool: 0,
      cohortsCount: 0,
      onboardedAt: null,
      onboardToken: token,
    });
    setSubmitting(false);
    onClose();
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      background: 'rgba(21, 42, 34, 0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#fff', borderRadius: 14, width: '100%', maxWidth: 560,
        boxShadow: '0 8px 40px rgba(0,0,0,0.18)', overflow: 'hidden',
      }}>
        <div style={{
          background: '#1F4D3D', padding: '20px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ color: '#B9D3C6', fontSize: 11, fontWeight: 700, letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 3 }}>
              Add Institution
            </div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: 20, color: '#fff', margin: 0 }}>
              Create & send onboarding link
            </h2>
          </div>
          <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.12)', border: 'none', borderRadius: 8, color: '#fff', width: 32, height: 32, cursor: 'pointer', fontSize: 18 }}>×</button>
        </div>
        <form onSubmit={handleSubmit} style={{ padding: 24 }}>
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Institution name *</label>
            <input required value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Moi University" style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Type *</label>
              <select value={type} onChange={e => setType(e.target.value as Institution['type'])} style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit', appearance: 'none' }}>
                <option>University</option>
                <option>College</option>
                <option>TVET/Polytechnic</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Location</label>
              <input value={location} onChange={e => setLocation(e.target.value)} placeholder="e.g. Eldoret, KE" style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ borderTop: '1px solid #DCE1D5', paddingTop: 16, marginBottom: 16 }}>
            <p style={{ fontSize: 12, color: '#3E5449', marginBottom: 12, fontWeight: 600 }}>Institution contact (will receive the onboarding email)</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Full name *</label>
                <input required value={contactName} onChange={e => setContactName(e.target.value)} placeholder="Full name" style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Job title</label>
                <input value={contactTitle} onChange={e => setContactTitle(e.target.value)} placeholder="e.g. Head, Career Services" style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit' }} />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: 5 }}>Work email *</label>
              <input required type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="careers@institution.ac.ke" style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '9px 13px', fontSize: 13.5, fontFamily: 'inherit' }} />
            </div>
          </div>
          <div style={{ background: '#E4EEE7', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#1F4D3D', marginBottom: 20 }}>
            <strong>What happens next:</strong> An onboarding email with a personal setup link will be sent to {contactEmail || 'the institution contact'}. Once they complete the form, their Institution Console will be activated automatically.
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" onClick={onClose} style={{ padding: '9px 18px', borderRadius: 8, border: '1.5px solid #DCE1D5', background: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, color: '#152A22' }}>Cancel</button>
            <button type="submit" disabled={submitting} style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#1F4D3D', color: '#fff', cursor: 'pointer', fontSize: 13.5, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 7, opacity: submitting ? 0.7 : 1 }}>
              <Send size={14} />
              {submitting ? 'Sending…' : 'Create & send onboarding link'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AdminInstitutionsPage() {
  const [institutions, setInstitutions] = useState<Institution[]>(MOCK_INSTITUTIONS);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<InstitutionStatus | 'all'>('all');
  const [resendingId, setResendingId] = useState<string | null>(null);

  const filtered = institutions.filter(i => {
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) || i.contactEmail.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || i.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const total = institutions.length;
  const active = institutions.filter(i => i.status === 'active').length;
  const pending = institutions.filter(i => i.status === 'pending').length;
  const totalCandidates = institutions.reduce((s, i) => s + i.candidatesInPool, 0);

  async function handleResend(id: string) {
    setResendingId(id);
    await new Promise(r => setTimeout(r, 1200));
    setResendingId(null);
    alert('Onboarding link resent!');
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, margin: '0 auto', fontFamily: "'Inter', sans-serif" }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <GraduationCap size={22} color="#1F4D3D" />
            <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: 26, fontWeight: 600, color: '#152A22', margin: 0 }}>
              Institutions
            </h1>
          </div>
          <p style={{ fontSize: 13.5, color: '#3E5449', margin: 0 }}>
            Manage partner universities, colleges, and TVET institutions. Create accounts and track onboarding.
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 8, border: 'none',
            background: '#1F4D3D', color: '#fff', cursor: 'pointer',
            fontSize: 13.5, fontWeight: 600,
          }}
        >
          <Plus size={15} />
          Add Institution
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { icon: Building2, label: 'Total institutions', value: total, color: '#1F4D3D', bg: '#E4EEE7' },
          { icon: CheckCircle2, label: 'Active consoles', value: active, color: '#2F6B54', bg: '#E4EEE7' },
          { icon: Clock, label: 'Pending onboarding', value: pending, color: '#B98A2E', bg: '#F5EAD2' },
          { icon: Users, label: 'Candidates in pool', value: totalCandidates.toLocaleString(), color: '#3E6C8E', bg: '#E1EBF0' },
        ].map(stat => (
          <div key={stat.label} style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, padding: '18px 20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <stat.icon size={18} color={stat.color} />
              </div>
            </div>
            <div style={{ fontFamily: "'Fraunces', serif", fontSize: 28, fontWeight: 600, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: '#3E5449', marginTop: 4 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 340 }}>
          <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#3E5449' }} />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search institutions or email…"
            style={{ width: '100%', border: '1.5px solid #DCE1D5', borderRadius: 8, padding: '8px 12px 8px 34px', fontSize: 13.5, fontFamily: 'inherit', outline: 'none' }}
          />
        </div>
        {(['all', 'active', 'pending', 'draft'] as const).map(s => (
          <button
            key={s}
            onClick={() => setFilterStatus(s)}
            style={{
              padding: '7px 14px', borderRadius: 20, border: '1.5px solid #DCE1D5',
              background: filterStatus === s ? '#1F4D3D' : '#fff',
              color: filterStatus === s ? '#fff' : '#3E5449',
              fontSize: 12.5, fontWeight: 600, cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {s === 'all' ? `All (${total})` : s}
          </button>
        ))}
      </div>

      {/* Table */}
      <div style={{ background: '#fff', border: '1px solid #DCE1D5', borderRadius: 10, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: '#F3F5EF' }}>
              {['Institution', 'Type', 'Contact', 'Status', 'Candidates', 'Cohorts', 'Onboarded', 'Actions'].map(h => (
                <th key={h} style={{ padding: '11px 14px', textAlign: 'left', fontSize: 11.5, fontWeight: 700, color: '#3E5449', textTransform: 'uppercase', letterSpacing: '.04em', borderBottom: '1px solid #DCE1D5' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((inst, idx) => (
              <tr key={inst.id} style={{ borderBottom: idx < filtered.length - 1 ? '1px solid #DCE1D5' : 'none', transition: 'background .1s' }}
                onMouseEnter={e => (e.currentTarget.style.background = '#F9FAF7')}
                onMouseLeave={e => (e.currentTarget.style.background = '#fff')}
              >
                <td style={{ padding: '14px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 34, height: 34, borderRadius: 8,
                      background: 'linear-gradient(135deg, #B98A2E, #8f6a1f)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Fraunces', serif", fontSize: 13, fontWeight: 700, color: '#1F4D3D',
                      flexShrink: 0,
                    }}>
                      {inst.name.split(' ').map(w => w[0]).slice(0, 2).join('')}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#152A22' }}>{inst.name}</div>
                      <div style={{ fontSize: 11.5, color: '#3E5449', marginTop: 1 }}>{inst.location}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '14px 14px', color: '#3E5449' }}>{inst.type}</td>
                <td style={{ padding: '14px 14px' }}>
                  <div style={{ fontWeight: 500, color: '#152A22', fontSize: 13 }}>{inst.contactName}</div>
                  <div style={{ fontSize: 11.5, color: '#3E5449', marginTop: 1 }}>{inst.contactEmail}</div>
                </td>
                <td style={{ padding: '14px 14px' }}><StatusBadge status={inst.status} /></td>
                <td style={{ padding: '14px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: inst.candidatesInPool > 0 ? '#1F4D3D' : '#999' }}>
                  {inst.candidatesInPool > 0 ? inst.candidatesInPool.toLocaleString() : '—'}
                </td>
                <td style={{ padding: '14px 14px', fontFamily: "'IBM Plex Mono', monospace", fontSize: 13, color: inst.cohortsCount > 0 ? '#152A22' : '#999' }}>
                  {inst.cohortsCount > 0 ? inst.cohortsCount : '—'}
                </td>
                <td style={{ padding: '14px 14px', fontSize: 12.5, color: inst.onboardedAt ? '#152A22' : '#999' }}>
                  {inst.onboardedAt || 'Not yet'}
                </td>
                <td style={{ padding: '14px 14px' }}>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {inst.status === 'active' && (
                      <Link
                        href={`/institutions/${inst.id}/overview`}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 6, border: '1.5px solid #DCE1D5',
                          background: '#fff', color: '#152A22', fontSize: 12, fontWeight: 600,
                          textDecoration: 'none',
                        }}
                        title="View Institution Console"
                      >
                        <ExternalLink size={12} /> Console
                      </Link>
                    )}
                    {(inst.status === 'pending' || inst.status === 'draft') && (
                      <button
                        onClick={() => handleResend(inst.id)}
                        disabled={resendingId === inst.id}
                        title="Resend onboarding link"
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          padding: '5px 10px', borderRadius: 6, border: '1.5px solid #B98A2E',
                          background: '#F5EAD2', color: '#B98A2E', fontSize: 12, fontWeight: 600, cursor: 'pointer',
                        }}
                      >
                        {resendingId === inst.id ? <><RefreshCw size={12} className="animate-spin" /> Sending…</> : <><Send size={12} /> Resend</>}
                      </button>
                    )}
                    <Link
                      href={`/institutions/onboard/${inst.onboardToken}`}
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '5px 10px', borderRadius: 6, border: '1.5px solid #DCE1D5',
                        background: '#fff', color: '#3E5449', fontSize: 12, fontWeight: 600,
                        textDecoration: 'none',
                      }}
                      title="Preview onboarding form"
                      target="_blank"
                    >
                      <Eye size={12} /> Preview form
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ padding: 40, textAlign: 'center', color: '#3E5449', fontSize: 14 }}>
            No institutions match your search.
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <AddInstitutionModal
          onClose={() => setShowModal(false)}
          onAdd={inst => setInstitutions(prev => [inst, ...prev])}
        />
      )}
    </div>
  );
}
