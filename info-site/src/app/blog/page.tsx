import { 
  BrainCircuit, 
  Scale, 
  Lightbulb 
} from "lucide-react";

export default function BlogPage() {
  return (
    <div className="blog-layout">
      <div className="blog-header">
        <h1 className="page-title">The OptioHire Blog</h1>
        <p className="page-lead" style={{ border: 'none', margin: '0 auto', maxWidth: '600px' }}>
          Insights, guides, and engineering deep-dives from the team building the future of hiring in Africa.
        </p>
      </div>

      <div className="blog-featured">
        <div className="blog-card">
          <div className="blog-card-img" style={{ background: 'var(--bg-3)' }}>
            <BrainCircuit size={48} className="text-primary" />
          </div>
          <div className="blog-card-body">
            <span className="blog-tag tag-tech">Engineering</span>
            <h2 className="blog-card-title large">How we built the Watcher Engine to score CVs in 2 seconds</h2>
            <p className="blog-card-excerpt">A deep dive into our multi-pass LLM architecture, semantic chunking, and why we chose a taxonomy-driven extraction model over raw vector search.</p>
            <div className="blog-card-meta">
              <div className="blog-meta-avatar" style={{ background: 'var(--primary)' }}>A</div>
              <div className="blog-meta-info">
                <div className="blog-meta-name">Engineering Team</div>
                <div className="blog-meta-date">Oct 12, 2026</div>
              </div>
              <div className="blog-read-time">8 min read</div>
            </div>
          </div>
        </div>
        <div className="blog-card">
          <div className="blog-card-img" style={{ background: 'var(--bg-2)' }}>
            <Scale size={48} className="text-text-3" />
          </div>
          <div className="blog-card-body">
            <span className="blog-tag tag-hr">Compliance</span>
            <h2 className="blog-card-title medium">Navigating the Kenya Data Protection Act in Recruitment</h2>
            <p className="blog-card-excerpt">What HR teams need to know about processing CVs, storing candidate data, and remaining compliant under the DPA 2019 framework.</p>
            <div className="blog-card-meta">
              <div className="blog-meta-avatar" style={{ background: 'var(--text-3)' }}>L</div>
              <div className="blog-meta-info">
                <div className="blog-meta-name">Legal Desk</div>
                <div className="blog-meta-date">Sep 28, 2026</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <h2 className="blog-grid-title">Latest Posts</h2>
      <div className="blog-grid">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="blog-card">
            <div className="blog-card-body">
              <span className="blog-tag tag-trend">Trend</span>
              <h3 className="blog-card-title medium">The End of the Cover Letter</h3>
              <p className="blog-card-excerpt">Why top candidates are refusing to write cover letters, and how AI-driven skills extraction is replacing them entirely.</p>
              <div className="blog-card-meta">
                <div className="blog-meta-avatar" style={{ background: 'var(--text)' }}>H</div>
                <div className="blog-meta-info">
                  <div className="blog-meta-name">HR Insights</div>
                  <div className="blog-meta-date">Sep 15, 2026</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
