import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Hiring Tips & Best Practices | OptioHire',
  description: 'Actionable advice for African HR teams to attract better talent, write sharper job descriptions, and streamline recruitment processes.',
}

export default function TipsPage() {
  return (
    <div className="tips-layout">
      <div className="tips-header text-center">
        <h1 className="page-title">Hiring Tips & Best Practices</h1>
        <p className="page-lead" style={{ border: 'none', margin: '0 auto', maxWidth: '600px' }}>
          Actionable advice to attract better talent and streamline your recruitment process.
        </p>
      </div>

      <div className="tips-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="tip-card">
            <div className="tip-number">Tip 0{i + 1}</div>
            <h2 className="tip-title">Stop asking for &quot;5 Years Experience&quot; if 2 will do</h2>
            <p className="tip-text">
              Over-inflating years of experience filters out highly capable, ambitious talent. Define the specific tasks they need to accomplish in the first 90 days instead.
            </p>
            <span className="tip-tag">Job Descriptions</span>
          </div>
        ))}
      </div>
    </div>
  );
}
