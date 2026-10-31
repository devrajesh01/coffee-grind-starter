'use client';

import { useState } from 'react';
import { X, Check, Coffee, Sparkles, Sliders, Thermometer, Droplets, ArrowRight } from 'lucide-react';
import { coffeeProfiles } from '@/content/coffee';

interface ModalsProps {
  activeProfileIndex: number;
  onSelectProfile: (index: number) => void;
  isChatOpen: boolean;
  setIsChatOpen: (open: boolean) => void;
  isSignUpOpen: boolean;
  setIsSignUpOpen: (open: boolean) => void;
}

export default function Modals({
  activeProfileIndex,
  onSelectProfile,
  isChatOpen,
  setIsChatOpen,
  isSignUpOpen,
  setIsSignUpOpen
}: ModalsProps) {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const currentProfile = coffeeProfiles[activeProfileIndex];

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setIsSignUpOpen(false);
        setEmail('');
      }, 2000);
    }
  };

  return (
    <>
      {/* 1. BARISTA ASSISTANT DRAWER */}
      {isChatOpen && (
        <div className="modal-backdrop" onClick={() => setIsChatOpen(false)}>
          <aside
            className="barista-drawer"
            onClick={(e) => e.stopPropagation()}
            aria-label="Barista Tasting Assistant"
          >
            <div className="drawer-header">
              <div className="drawer-title-group">
                <div className="drawer-badge">
                  <Coffee size={16} />
                </div>
                <div>
                  <h3 className="drawer-title">BARISTA TASTING GUIDE</h3>
                  <p className="drawer-subtitle">Pour / Play Specialty Rituals</p>
                </div>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setIsChatOpen(false)}
                aria-label="Close assistant"
              >
                <X size={18} />
              </button>
            </div>

            <div className="drawer-body">
              <div className="drawer-section">
                <span className="drawer-label">ACTIVE SELECTION</span>
                <div className="drawer-profile-card">
                  <h4>{currentProfile.name}</h4>
                  <p>{currentProfile.tagline}</p>
                  <div className="profile-badge-row">
                    <span className="pill-badge">{currentProfile.roast.level}</span>
                    <span className="pill-badge">{currentProfile.origin.region}</span>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-label">BREW PARAMETERS</span>
                <div className="brew-grid">
                  <div className="brew-item">
                    <Sliders size={18} className="brew-icon" />
                    <span className="brew-prop">GRIND SIZE</span>
                    <strong>Medium-Fine (24 Clicks)</strong>
                    <small>Burr gap ~650 microns</small>
                  </div>
                  <div className="brew-item">
                    <Thermometer size={18} className="brew-icon" />
                    <span className="brew-prop">WATER TEMP</span>
                    <strong>{currentProfile.roast.temp}</strong>
                    <small>Pre-heated gooseneck</small>
                  </div>
                  <div className="brew-item">
                    <Droplets size={18} className="brew-icon" />
                    <span className="brew-prop">BREW RATIO</span>
                    <strong>1:16 (18g to 288g)</strong>
                    <small>45s Bloom + 2 Pours</small>
                  </div>
                  <div className="brew-item">
                    <Sparkles size={18} className="brew-icon" />
                    <span className="brew-prop">PRIMARY NOTES</span>
                    <strong>{currentProfile.flavor.primary}</strong>
                    <small>{currentProfile.flavor.notes.slice(0, 3).join(' · ')}</small>
                  </div>
                </div>
              </div>

              <div className="drawer-section">
                <span className="drawer-label">SWITCH COFFEE BEANS</span>
                <div className="coffee-switch-list">
                  {coffeeProfiles.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => onSelectProfile(idx)}
                      className={`coffee-switch-btn ${idx === activeProfileIndex ? 'active' : ''}`}
                    >
                      <div className="dot" style={{ backgroundColor: `#${p.cupColor.toString(16).padStart(6, '0')}` }} />
                      <div className="info">
                        <strong>{p.name}</strong>
                        <span>{p.origin.region} · {p.roast.level}</span>
                      </div>
                      {idx === activeProfileIndex && <Check size={16} className="check-icon" />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="drawer-footer">
              <button
                className="drawer-action-btn"
                onClick={() => {
                  setIsChatOpen(false);
                  setIsSignUpOpen(true);
                }}
              >
                <span>ORDER TASTER ROAST BOX</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 2. SIGN UP / MEMBERSHIP MODAL */}
      {isSignUpOpen && (
        <div className="modal-backdrop" onClick={() => setIsSignUpOpen(false)}>
          <div
            className="signup-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            <button
              className="modal-close-btn signup-close"
              onClick={() => setIsSignUpOpen(false)}
              aria-label="Close modal"
            >
              <X size={18} />
            </button>

            <div className="signup-content">
              <span className="signup-eyebrow">POUR / PLAY MEMBERSHIP</span>
              <h3 className="signup-title">ENTER THE RITUAL</h3>
              <p className="signup-desc">
                Receive quarterly curated micro-lots, exclusive single-origin harvest drops, and calibrated grind guides.
              </p>

              {submitted ? (
                <div className="signup-success">
                  <div className="success-circle">
                    <Check size={28} />
                  </div>
                  <h4>WELCOME TO THE CIRCLE</h4>
                  <p>Check your inbox for your inaugural roasting passport.</p>
                </div>
              ) : (
                <form onSubmit={handleSignUp} className="signup-form">
                  <input
                    type="email"
                    required
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="signup-input"
                  />
                  <button type="submit" className="signup-submit-btn">
                    JOIN THE ROASTERS CIRCLE
                  </button>
                  <span className="signup-note">Zero spam. Pure artisanal coffee craft.</span>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

