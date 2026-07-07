'use client'

import { useInstitution } from '../layout'

export default function SettingsPage() {
    const { institution } = useInstitution()

    return (
        <div style={{ padding: '40px 34px', maxWidth: 1000 }}>
            <h1 style={{ fontFamily: 'Fraunces, serif', fontSize: 28, color: '#152A22', marginBottom: 8 }}>
                Settings
            </h1>
            <p style={{ color: '#3E5449', fontSize: 14 }}>
                Manage your institution profile and console preferences.
            </p>
            
            <div style={{ marginTop: 40, padding: 30, background: '#fff', border: '1px dashed #DCE1D5', borderRadius: 12, textAlign: 'center' }}>
                <div style={{ color: '#7FA292', fontSize: 13 }}>Settings page is currently under construction.</div>
            </div>
        </div>
    )
}
