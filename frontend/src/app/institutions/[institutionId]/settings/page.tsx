'use client';
import React from 'react';

export default function SettingsPage({ params }: { params: Promise<{ institutionId: string }> }) {
  const unwrappedParams = React.use(params);
  const instId = unwrappedParams.institutionId || 'strathmore';

  return (
    <>
      <div className="topbar">
        <div className="heading">
          <div className="eyebrow">Institution profile</div>
          <h1>Settings</h1>
          <div className="desc">Branding, admin access, and how student data flows in and out of OptioHire.</div>
        </div>
      </div>

      <div className="settings-grid">
        <div className="panel">
          <div className="panel-head">
            <h2>Branding</h2>
          </div>
          <div className="panel-body">
            <div className="field-group">
              <label>Institution name</label>
              <input defaultValue="Strathmore University" />
            </div>
            <div className="field-group">
              <label>Careers office contact email</label>
              <input defaultValue="careers@strathmore.edu" />
            </div>
            <div className="field-group">
              <label>Accent colour shown to your students</label>
              <div className="swatches">
                <div className="swatch" style={{ background: '#1F4D3D' }}></div>
                <div className="swatch" style={{ background: '#B98A2E' }}></div>
                <div className="swatch" style={{ background: '#3E6C8E' }}></div>
                <div className="swatch" style={{ background: '#9C3B2C' }}></div>
              </div>
            </div>
            <div className="field-group">
              <label>Onboarding email signature</label>
              <textarea rows={3} defaultValue={"Career Services Office — Strathmore University\nMadaraka Estate, Ole Sangale Road, Nairobi"}></textarea>
            </div>
            <button className="btn btn-primary">Save branding</button>
          </div>
        </div>

        <div className="panel">
          <div className="panel-head">
            <h2>Admin access</h2>
          </div>
          <div className="panel-body">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Access</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Joyce Nduta</td>
                  <td>Head, Career Services</td>
                  <td><span className="seal placed">Full access</span></td>
                </tr>
                <tr>
                  <td>Peter Kariuki</td>
                  <td>Careers Officer</td>
                  <td><span className="seal activated">Roster &amp; uploads</span></td>
                </tr>
                <tr>
                  <td>Susan Adhiambo</td>
                  <td>Registrar liaison</td>
                  <td><span className="seal pool">View only</span></td>
                </tr>
              </tbody>
            </table>
            <button className="btn" style={{ marginTop: '14px' }}>+ Invite team member</button>
          </div>

          <div className="panel-head" style={{ borderTop: '1px solid var(--line)' }}>
            <h2>Data &amp; integrations</h2>
          </div>
          <div className="panel-body">
            <div className="field-group">
              <label>Student Information System sync</label>
              <input defaultValue="Not connected — upload CSV manually" />
            </div>
            <div className="field-group">
              <label>Data retention for graduated cohorts</label>
              <input defaultValue="Indefinite — for Talent Pool re-matching" />
            </div>
            <button className="btn">Request SIS integration</button>
          </div>
        </div>
      </div>
    </>
  );
}
