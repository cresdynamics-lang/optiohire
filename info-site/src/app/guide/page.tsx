"use client";

import { useState } from "react";
import { 
  BookOpen, 
  Zap, 
  BrainCircuit, 
  Activity, 
  Archive, 
  CalendarClock, 
  ShieldCheck 
} from "lucide-react";

export default function GuidePage() {
  const [activeDoc, setActiveDoc] = useState("watcher");

  return (
    <div className="docs-layout">
      {/* SIDEBAR */}
      <aside className="sidebar" id="sidebar">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Getting Started</div>
          <button 
            className={`sidebar-link ${activeDoc === 'intro' ? 'active' : ''}`}
            onClick={() => setActiveDoc('intro')}
          >
            <span className="sidebar-link-icon"><BookOpen size={16} /></span> Introduction
          </button>
          <button 
            className={`sidebar-link ${activeDoc === 'quickstart' ? 'active' : ''}`}
            onClick={() => setActiveDoc('quickstart')}
          >
            <span className="sidebar-link-icon"><Zap size={16} /></span> Quickstart Guide
          </button>
        </div>

        <div className="sidebar-section">
          <div className="sidebar-section-title">Core Features</div>
          <button 
            className={`sidebar-link ${activeDoc === 'watcher' ? 'active' : ''}`}
            onClick={() => setActiveDoc('watcher')}
          >
            <span className="sidebar-link-icon"><BrainCircuit size={16} /></span> Watcher Engine AI
          </button>
          <button 
            className={`sidebar-link ${activeDoc === 'channels' ? 'active' : ''}`}
            onClick={() => setActiveDoc('channels')}
          >
            <span className="sidebar-link-icon"><Activity size={16} /></span> 3-Channel Applications
          </button>
          <button 
            className={`sidebar-link ${activeDoc === 'talent-pool' ? 'active' : ''}`}
            onClick={() => setActiveDoc('talent-pool')}
          >
            <span className="sidebar-link-icon"><Archive size={16} /></span> Talent Pool
          </button>
          <button 
            className={`sidebar-link ${activeDoc === 'interviews' ? 'active' : ''}`}
            onClick={() => setActiveDoc('interviews')}
          >
            <span className="sidebar-link-icon"><CalendarClock size={16} /></span> Interview Scheduling
          </button>
        </div>
        
        <div className="sidebar-section">
          <div className="sidebar-section-title">Compliance</div>
          <button 
            className={`sidebar-link ${activeDoc === 'dpa' ? 'active' : ''}`}
            onClick={() => setActiveDoc('dpa')}
          >
            <span className="sidebar-link-icon"><ShieldCheck size={16} /></span> DPA 2019 Compliance
          </button>
        </div>
      </aside>

      {/* MAIN DOC CONTENT */}
      <main className="docs-main">
        {activeDoc === 'watcher' && (
          <div>
            <div className="page-eyebrow">Core Feature</div>
            <h1 className="page-title">Watcher Engine AI</h1>
            <p className="page-lead">
              The Watcher Engine is the core intelligence layer of OptioHire. It automatically extracts, profiles, and scores every incoming CV within seconds.
            </p>
            
            <h2 className="section-h">How it Works</h2>
            <p className="guide-p">
              When a candidate applies via email, web form, or shared link, their CV is securely uploaded to our processing queue. The Watcher Engine then performs a multi-step analysis:
            </p>
            
            <ul style={{ paddingLeft: '20px', marginBottom: '20px', color: 'var(--text-2)', fontSize: '0.93rem', lineHeight: '1.75' }}>
              <li><strong>Extraction:</strong> Pulls out Work Experience, Education, and Skills using structural parsing.</li>
              <li><strong>Semantic Matching:</strong> Compares the extracted profile against the specific requirements you defined in the Job Posting.</li>
              <li><strong>Scoring:</strong> Assigns a match score from 0-100.</li>
              <li><strong>Reasoning:</strong> Generates a plain-English explanation for the score (e.g., &quot;Strong match for Python skills, but lacks the required 5 years of management experience&quot;).</li>
            </ul>
            
            <div style={{ background: 'var(--primary-light)', padding: '16px', borderRadius: '8px', color: 'var(--primary-dark)', fontSize: '0.9rem', marginTop: '24px' }}>
              <strong>Note:</strong> OptioHire never auto-rejects candidates. The AI provides a ranked shortlist to save you time, but every application remains available for human review.
            </div>
          </div>
        )}
        
        {activeDoc !== 'watcher' && (
          <div>
            <div className="page-eyebrow">Documentation</div>
            <h1 className="page-title">
              {activeDoc.charAt(0).toUpperCase() + activeDoc.slice(1).replace('-', ' ')}
            </h1>
            <p className="page-lead">
              This section of the documentation is currently being written. Please check back later for detailed guides on this feature.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
