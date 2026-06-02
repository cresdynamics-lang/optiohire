import { 
  FileText, 
  Settings, 
  Key, 
  TerminalSquare 
} from "lucide-react";

export default function ApiDocs() {
  return (
    <div className="api-layout">
      
      {/* SIDEBAR */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">API Reference</div>
          <button className="sidebar-link active">
            <span className="sidebar-link-icon"><TerminalSquare size={16} /></span> Endpoints
          </button>
          <button className="sidebar-link">
            <span className="sidebar-link-icon"><Settings size={16} /></span> Integrations
          </button>
          <button className="sidebar-link">
            <span className="sidebar-link-icon"><Key size={16} /></span> Authentication
          </button>
        </div>
      </aside>

      <main className="api-main">
        <div className="page-eyebrow">API Reference</div>
        <h1 className="page-title">Core Endpoints</h1>
        <p className="page-lead">
          Connect your existing HR software directly to the Watcher Engine.
        </p>

        <h2 className="section-h">Inbound Webhooks</h2>
        
        <div className="endpoint-card">
          <div className="endpoint-header">
            <span className="method-badge method-post">POST</span>
            <span className="endpoint-path">https://optiohire.com/api/webhooks/email</span>
            <span className="endpoint-desc">Inbound email parsing</span>
          </div>
          <div className="endpoint-body">
            <p className="guide-p">
              Used by Resend to automatically ingest applications sent via email. 
              The backend validates the signature, extracts the CV, and enqueues it to the Watcher Engine.
            </p>
          </div>
        </div>

        <h2 className="section-h">REST API</h2>

        <div className="endpoint-card">
          <div className="endpoint-header">
            <span className="method-badge method-get">GET</span>
            <span className="endpoint-path">https://optiohire.com/api/jobs/:id/shortlist</span>
            <span className="endpoint-desc">Retrieve ranked candidates</span>
          </div>
          <div className="endpoint-body">
            <p className="guide-p">
              Returns the AI-scored shortlist for a specific job posting, including the 0-100 match score and the plain-English reasoning.
            </p>
            
            <div className="code-tabs">
              <div className="code-tab-nav">
                <button className="code-tab-btn active">Response</button>
              </div>
              <div className="code-block-dark">
                <div><span className="syntax-keyword">const</span> data = {'{'}</div>
                <div style={{ paddingLeft: '20px' }}>
                  <span className="syntax-prop">&quot;status&quot;</span>: <span className="syntax-string">&quot;success&quot;</span>,
                  <br />
                  <span className="syntax-prop">&quot;shortlist&quot;</span>: [
                  <br />
                  <span style={{ paddingLeft: '20px', display: 'block' }}>{'{'} <span className="syntax-prop">&quot;id&quot;</span>: <span className="syntax-number">1042</span>, <span className="syntax-prop">&quot;score&quot;</span>: <span className="syntax-number">95</span>, <span className="syntax-prop">&quot;reasoning&quot;</span>: <span className="syntax-string">&quot;...&quot;</span> {'}'}</span>
                  ]
                </div>
                <div>{'}'};</div>
              </div>
            </div>

          </div>
        </div>

      </main>
    </div>
  );
}
