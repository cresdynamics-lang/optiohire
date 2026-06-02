import Link from "next/link";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <div className="footer-brand-name">
            <div className="logo-pill">OH</div>
            OptioHire
          </div>
          <p className="footer-brand-desc">
            The smarter way to hire in Africa. Zero manual CV screening, 
            AI-ranked shortlists, and built for modern HR teams.
          </p>
        </div>
        
        <div>
          <div className="footer-col-title">Platform</div>
          <Link href="https://optiohire.com/auth/signup" className="footer-link">Post a Job</Link>
          <Link href="/guide" className="footer-link">How it Works</Link>
          <Link href="/api-docs" className="footer-link">API & Webhooks</Link>
          <Link href="/tips" className="footer-link">Hiring Tips</Link>
        </div>
        
        <div>
          <div className="footer-col-title">Company</div>
          <Link href="/blog" className="footer-link">Blog</Link>
          <Link href="#" className="footer-link">About Us</Link>
          <Link href="#" className="footer-link">Contact Sales</Link>
        </div>
        
        <div>
          <div className="footer-col-title">Legal</div>
          <Link href="#" className="footer-link">Privacy Policy</Link>
          <Link href="#" className="footer-link">Terms of Service</Link>
          <Link href="#" className="footer-link">DPA 2019 Compliance</Link>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="footer-copyright">
          © {new Date().getFullYear()} OptioHire, a Cres Dynamics Product. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
