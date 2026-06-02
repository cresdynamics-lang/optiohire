import Link from "next/link";
import { Topbar } from "@/components/Topbar";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <Topbar />
      <main id="view-landing">
        {/* HERO */}
        <section className="hero">
          <div className="hero-bg"></div>
          <div className="hero-grid"></div>
          <div className="hero-content">
            <div className="hero-eyebrow">
              <span>🌍</span> Built for African hiring teams
            </div>
            <h1 className="hero-title">
              Hiring in 2026 is<br />
              <span className="strike">broken.</span><br />
              <span className="hl">OptioHire fixes it.</span>
            </h1>
            <p className="hero-sub">
              Your inbox shouldn't be the battleground for 300 CVs. Let AI do the screening — you make the decisions.
            </p>
            <div className="hero-actions">
              <Link href="https://optiohire.com/auth/signup" className="btn btn-primary btn-xl">
                Post your first job free →
              </Link>
              <Link href="/guide" className="btn btn-ghost btn-lg">
                Read the Guide
              </Link>
            </div>
            <div className="hero-social-proof">
              <div className="hero-avatars">
                <div className="hero-avatar ha1">AK</div>
                <div className="hero-avatar ha2">MW</div>
                <div className="hero-avatar ha3">JO</div>
                <div className="hero-avatar ha4">PN</div>
              </div>
              <span>Trusted by HR teams across Kenya, Nigeria & beyond</span>
            </div>
          </div>
        </section>

        {/* MARQUEE */}
        <div className="marquee-strip">
          <div className="marquee-track">
            <div className="marquee-item"><span className="marquee-dot"></span>Zero manual CV screening</div>
            <div className="marquee-item"><span className="marquee-dot"></span>AI-ranked shortlists in seconds</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Apply by email, web, or link</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Talent Pool auto-matching</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Kenya Data Protection Act compliant</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Built for Africa</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Interview scheduling built-in</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Complete audit trail</div>
            {/* duplicate for seamless loop */}
            <div className="marquee-item"><span className="marquee-dot"></span>Zero manual CV screening</div>
            <div className="marquee-item"><span className="marquee-dot"></span>AI-ranked shortlists in seconds</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Apply by email, web, or link</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Talent Pool auto-matching</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Kenya Data Protection Act compliant</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Built for Africa</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Interview scheduling built-in</div>
            <div className="marquee-item"><span className="marquee-dot"></span>Complete audit trail</div>
          </div>
        </div>

        {/* PROBLEM SECTION */}
        <section className="problem-section">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ maxWidth: 540 }}>
              <div className="section-label">📌 The Problem</div>
              <h2 className="section-title">You shouldn't spend a week reading CVs</h2>
              <p className="section-sub">
                The average African HR team receives 250+ applications per role. Without tools, that's 3–5 days of grinding — before a single interview is even booked.
              </p>
            </div>
          </div>
          <div className="problem-grid">
            <div className="problem-card">
              <div className="problem-number">250+</div>
              <div className="problem-title">Applications per role, on average</div>
              <div className="problem-desc">Most HR teams in Kenya and Nigeria receive hundreds of applications for a single mid-level position. Without automation, every single one needs a human eye.</div>
            </div>
            <div className="problem-card">
              <div className="problem-number">4 days</div>
              <div className="problem-title">Lost to manual shortlisting</div>
              <div className="problem-desc">Before OptioHire, teams reported spending 3 to 5 business days building a shortlist — time stolen from strategy, onboarding, and team culture work.</div>
            </div>
            <div className="problem-card">
              <div className="problem-number">0%</div>
              <div className="problem-title">Auditability in traditional hiring</div>
              <div className="problem-desc">When a rejected candidate asks "Why wasn't I selected?" — most HR teams have no documented answer. That's a legal and reputational risk every time.</div>
            </div>
            <div className="problem-card">
              <div className="problem-number">60%</div>
              <div className="problem-title">Of strong candidates missed</div>
              <div className="problem-desc">Fatigue screening is real. By the 80th CV, pattern recognition breaks down. Great candidates buried at the bottom of the inbox never get their shot.</div>
            </div>
          </div>
        </section>

        {/* SOLUTION SECTION */}
        <section className="solution-section">
          <div className="solution-bg"></div>
          <div className="solution-content" style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ maxWidth: 560 }}>
              <div className="section-label">⚡ The OptioHire Way</div>
              <h2 className="section-title">Post. Collect. Shortlist.<br />Interview. Hire.</h2>
              <p className="section-sub">The entire hiring workflow — from posting to signed offer — lives in one place. The AI handles the volume. You handle the judgment.</p>
            </div>
            <div className="flow-cards">
              <div className="flow-card">
                <div className="flow-arrow">→</div>
                <div className="flow-icon">📋</div>
                <div className="flow-step">Step 01</div>
                <div className="flow-title">Post the Role</div>
                <div className="flow-desc">Define your requirements. The more specific you are, the sharper the AI scoring.</div>
              </div>
              <div className="flow-card">
                <div className="flow-arrow">→</div>
                <div className="flow-icon">📡</div>
                <div className="flow-step">Step 02</div>
                <div className="flow-title">Applications Come In</div>
                <div className="flow-desc">Via web form, your unique link, or email — all three channels feed the same pipeline.</div>
              </div>
              <div className="flow-card">
                <div className="flow-arrow">→</div>
                <div className="flow-icon">🤖</div>
                <div className="flow-step">Step 03</div>
                <div className="flow-title">AI Ranks Them</div>
                <div className="flow-desc">The Watcher Engine extracts, profiles, and scores every CV within seconds of arrival.</div>
              </div>
              <div className="flow-card">
                <div className="flow-icon">📅</div>
                <div className="flow-step">Step 04</div>
                <div className="flow-title">You Hire</div>
                <div className="flow-desc">Review the shortlist, send interview invites, and mark your hire — all in one dashboard.</div>
              </div>
            </div>
          </div>
        </section>

        {/* STATS SECTION */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <div className="stat-number">&lt;30s</div>
              <div className="stat-label">To process each application</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">3×</div>
              <div className="stat-label">Faster time-to-shortlist</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">100%</div>
              <div className="stat-label">Audit trail on every decision</div>
            </div>
            <div className="stat-item">
              <div className="stat-number">∞</div>
              <div className="stat-label">Talent Pool — no application wasted</div>
            </div>
          </div>
        </section>

        {/* FEATURES SECTION */}
        <section className="features-section">
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
            <div style={{ maxWidth: 500 }}>
              <div className="section-label">🛠 Features</div>
              <h2 className="section-title">Everything your team needs. Nothing it doesn't.</h2>
            </div>
            <div className="features-grid">
              <Link href="/guide" className="feature-card">
                <div className="feature-card-icon">🤖</div>
                <div className="feature-card-title">Watcher Engine AI</div>
                <div className="feature-card-desc">GPT-4 powered CV extraction combined with rule-based scoring and semantic similarity matching. Explains every score in plain English.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
              <Link href="/guide" className="feature-card">
                <div className="feature-card-icon">📡</div>
                <div className="feature-card-title">3-Channel Applications</div>
                <div className="feature-card-desc">Web form, shareable link, or email CV — all three produce identical application records. Candidates apply the way that feels natural to them.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
              <Link href="/guide" className="feature-card">
                <div className="feature-card-icon">🏊</div>
                <div className="feature-card-title">Talent Pool</div>
                <div className="feature-card-desc">Every applicant is stored and re-matched automatically against future roles. New job posted? You may already have 5 strong candidates.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
              <Link href="/guide" className="feature-card">
                <div className="feature-card-icon">📅</div>
                <div className="feature-card-title">Interview Scheduling</div>
                <div className="feature-card-desc">Send beautifully formatted, personalised interview invitations in one click. Online or in-person. No Gmail required.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
              <Link href="/guide" className="feature-card">
                <div className="feature-card-icon">🔒</div>
                <div className="feature-card-title">DPA 2019 Compliant</div>
                <div className="feature-card-desc">Built in compliance with Kenya's Data Protection Act 2019. TLS encryption in transit, at-rest encryption, role-based access, and full audit trail.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
              <Link href="/api-docs" className="feature-card">
                <div className="feature-card-icon">🔌</div>
                <div className="feature-card-title">REST API & Webhooks</div>
                <div className="feature-card-desc">Connect OptioHire to your existing HRIS or ATS. Sync employee data seamlessly without manual entry.</div>
                <div className="feature-card-link">Learn more →</div>
              </Link>
            </div>
          </div>
        </section>

        {/* TESTIMONIAL */}
        <section className="testimonial-section">
          <div className="testimonial-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">We used to dread recruitment periods. 400 emails for a single role. OptioHire has completely changed our workflow. The scoring is spot on.</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#3B82F6' }}>MW</div>
                <div>
                  <div className="testimonial-name">Mercy W.</div>
                  <div className="testimonial-role">HR Director, Tech Startup</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">The ability to have applicants just email their CVs and see them pop up as structured profiles is magic. It saves us days of work.</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#10B981' }}>JO</div>
                <div>
                  <div className="testimonial-name">James O.</div>
                  <div className="testimonial-role">Talent Acquisition Lead</div>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">"</div>
              <div className="testimonial-text">As a hiring manager, I love that I get a curated shortlist and can see exactly why someone was scored highly. It makes my decisions much easier.</div>
              <div className="testimonial-author">
                <div className="testimonial-avatar" style={{ background: '#8B5CF6' }}>AK</div>
                <div>
                  <div className="testimonial-name">Alice K.</div>
                  <div className="testimonial-role">Head of Engineering</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA SECTION */}
        <section className="cta-section">
          <div className="cta-bg"></div>
          <div className="cta-content">
            <h2 className="cta-title">Ready to hire smarter?</h2>
            <p className="cta-sub">Join the forward-thinking HR teams across Africa using OptioHire to find the best talent faster.</p>
            <div className="cta-actions">
              <Link href="https://optiohire.com/auth/signup" className="btn btn-primary btn-xl">Create Free Account</Link>
              <Link href="https://optiohire.com/auth/demo" className="btn btn-ghost btn-xl" style={{ borderColor: 'rgba(255,255,255,0.2)', color: '#fff' }}>Book a Demo</Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
