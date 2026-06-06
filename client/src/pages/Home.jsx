import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '../components/AuthModal';

const Home = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  const navigate = useNavigate();

  const openAuth = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    document.querySelectorAll('.reveal-on-scroll, .reveal-slide-left, .reveal-slide-right').forEach((el) => {
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Navbar */}
      <nav className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100, borderBottom: '1px solid rgba(255,255,255,0.2)' }}>
        <div style={{ fontSize: '24px', fontWeight: '900', letterSpacing: '-0.8px' }} className="gradient-text">
          TravelAI
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="btn-outline"
            style={{ borderRadius: '30px', padding: '10px 32px', border: '2px solid #1e3c72', color: '#1e3c72', fontWeight: '600', width: 'auto', background: 'transparent', cursor: 'pointer' }}
            onClick={() => openAuth('login')}
          >
            Log In
          </button>
        </div>
      </nav>

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '140px 40px', textAlign: 'center', minHeight: '80vh' }}>
          <div className="animate-slide-up" style={{ maxWidth: '1200px', width: '100%' }}>
            <div style={{ display: 'inline-block', padding: '8px 20px', background: 'rgba(30, 60, 114, 0.05)', color: '#1e3c72', borderRadius: '30px', fontWeight: '800', fontSize: '14px', letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '32px' }}>
              The Future of Travel Planning
            </div>
            <h1 style={{ fontSize: 'clamp(48px, 6vw, 84px)', fontWeight: '900', lineHeight: '1.05', marginBottom: '32px', color: '#111', letterSpacing: '-2px' }}>
              Turn Chaos into a <br />
              <span className="gradient-text">Master Itinerary</span>
            </h1>
            <p style={{ fontSize: 'clamp(18px, 2vw, 24px)', color: '#555', marginBottom: '48px', lineHeight: '1.6', maxWidth: '800px', margin: '0 auto 48px auto' }}>
              Upload your raw flight tickets, hotel bookings, and train passes. Our AI instantly extracts the details and crafts a perfectly organized, sharable travel plan.
            </p>
            <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
              <button
                className="btn"
                style={{ fontSize: '18px', padding: '18px 48px', borderRadius: '40px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', boxShadow: '0 8px 24px rgba(30, 60, 114, 0.3)', width: 'auto', fontWeight: '700' }}
                onClick={() => openAuth('register')}
              >
                Start Planning for Free
              </button>
            </div>
          </div>
        </section>

        {/* Infinite Marquee Section */}
        <section style={{ padding: '32px 0', background: 'rgba(255, 255, 255, 0.4)', color: '#1e3c72', borderTop: '1px solid rgba(255,255,255,0.8)', borderBottom: '1px solid rgba(255,255,255,0.8)', overflow: 'hidden', display: 'flex', WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)', maskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}>
          <div className="marquee-content" style={{ display: 'flex', gap: '80px', paddingLeft: '80px', fontWeight: '900', fontSize: '15px', letterSpacing: '3px', textTransform: 'uppercase', opacity: 0.9 }}>
            <span>✦ FLIGHT TICKETS</span>
            <span>✦ HOTEL RESERVATIONS</span>
            <span>✦ TRAIN PASSES</span>
            <span>✦ EVENT TICKETS</span>
            <span>✦ AUTOMATED EXTRACTION</span>
            <span>✦ SECURE DATA</span>
            <span>✦ INSTANT SHARING</span>
            {/* Duplicated for seamless loop */}
            <span>✦ FLIGHT TICKETS</span>
            <span>✦ HOTEL RESERVATIONS</span>
            <span>✦ TRAIN PASSES</span>
            <span>✦ EVENT TICKETS</span>
            <span>✦ AUTOMATED EXTRACTION</span>
            <span>✦ SECURE DATA</span>
            <span>✦ INSTANT SHARING</span>
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '120px 40px', background: 'rgba(255,255,255,0.4)', borderTop: '1px solid rgba(0,0,0,0.05)', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div className="reveal-on-scroll" style={{ textAlign: 'center', marginBottom: '80px' }}>
              <h2 style={{ fontSize: '40px', fontWeight: '900', color: '#111', letterSpacing: '-1px' }}>Intelligent by Design</h2>
              <p style={{ fontSize: '18px', color: '#666', marginTop: '16px' }}>Everything you need to automate your travel organization.</p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '32px' }}>
              <div className="glass-panel reveal-on-scroll reveal-delay-1" style={{ padding: '40px', borderRadius: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%)', marginBottom: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}></div>
                <h3 style={{ fontSize: '22px', marginBottom: '16px', fontWeight: '800', color: '#111' }}>Smart OCR Extraction</h3>
                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '16px' }}>Simply upload your PDFs or screenshots. Our vision models read documents just like a human would.</p>
              </div>
              <div className="glass-panel reveal-on-scroll reveal-delay-2" style={{ padding: '40px', borderRadius: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)', marginBottom: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}></div>
                <h3 style={{ fontSize: '22px', marginBottom: '16px', fontWeight: '800', color: '#111' }}>AI-Powered Generation</h3>
                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '16px' }}>Google's Gemini AI perfectly organizes your schedule, cross-references dates, and formats it beautifully.</p>
              </div>
              <div className="glass-panel reveal-on-scroll reveal-delay-3" style={{ padding: '40px', borderRadius: '24px', textAlign: 'left', border: '1px solid rgba(255,255,255,0.8)' }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #e8f8f5 0%, #d4efdf 100%)', marginBottom: '24px', boxShadow: '0 8px 16px rgba(0,0,0,0.05)' }}></div>
                <h3 style={{ fontSize: '22px', marginBottom: '16px', fontWeight: '800', color: '#111' }}>Multi-Document Merging</h3>
                <p style={{ color: '#555', lineHeight: '1.6', fontSize: '16px' }}>Upload up to 5 documents simultaneously. We merge them into one unified, conflict-free master itinerary.</p>
              </div>
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section style={{ padding: '160px 40px', maxWidth: '1400px', margin: '0 auto' }}>
          <h2 className="reveal-on-scroll" style={{ fontSize: '48px', fontWeight: '900', color: '#111', letterSpacing: '-1px', textAlign: 'center', marginBottom: '120px' }}>How It Works</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '140px' }}>
            
            {/* Step 1 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div className="reveal-slide-left" style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: '#f0f4ff', color: '#1e3c72', borderRadius: '8px', fontWeight: '800', fontSize: '12px', marginBottom: '16px' }}>STEP 1</div>
                <h3 style={{ fontSize: '40px', fontWeight: '900', color: '#111', marginBottom: '24px', lineHeight: '1.2', letterSpacing: '-1px' }}>Upload your documents</h3>
                <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.7' }}>Drag and drop your flight tickets, hotel reservations, or event passes directly into the secure dropzone. We support PDF, JPEG, and PNG formats.</p>
              </div>
              <div className="reveal-slide-right" style={{ flex: '1 1 500px', height: '400px', borderRadius: '32px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid #dee2e6', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                {/* Minimal CSS representation of upload */}
                <div style={{ width: '160px', height: '220px', background: '#fff', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '24px', position: 'relative', zIndex: 2, transform: 'rotate(-5deg)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#e0eafc', marginBottom: '20px' }}></div>
                  <div style={{ width: '100%', height: '8px', background: '#f1f3f5', borderRadius: '4px', marginBottom: '12px' }}></div>
                  <div style={{ width: '80%', height: '8px', background: '#f1f3f5', borderRadius: '4px', marginBottom: '12px' }}></div>
                  <div style={{ width: '90%', height: '8px', background: '#f1f3f5', borderRadius: '4px' }}></div>
                </div>
                <div style={{ width: '160px', height: '220px', background: 'rgba(255,255,255,0.8)', borderRadius: '12px', padding: '24px', position: 'absolute', zIndex: 1, transform: 'rotate(8deg) translateX(40px)', backdropFilter: 'blur(4px)', border: '1px solid rgba(255,255,255,0.5)' }}></div>
              </div>
            </div>

            {/* Step 2 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap-reverse', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div className="reveal-slide-left" style={{ flex: '1 1 500px', height: '400px', borderRadius: '32px', background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', boxShadow: '0 20px 40px rgba(30,60,114,0.15)', overflow: 'hidden' }}>
                {/* Minimal CSS representation of AI processing */}
                <div style={{ position: 'absolute', width: '100%', height: '100%', opacity: 0.1, background: 'radial-gradient(circle at center, #fff 10%, transparent 10.5%)', backgroundSize: '20px 20px' }}></div>
                <div style={{ width: '240px', height: '140px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.2)', padding: '32px', color: '#fff', zIndex: 2 }}>
                  <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px', marginBottom: '24px' }}></div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
                    <div style={{ flex: 1, height: '6px', background: '#64ffda', borderRadius: '3px' }}></div>
                    <div style={{ width: '40px', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px' }}></div>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                    <div style={{ width: '50px', height: '6px', background: 'rgba(255,255,255,0.3)', borderRadius: '3px' }}></div>
                    <div style={{ flex: 1, height: '6px', background: '#64ffda', borderRadius: '3px' }}></div>
                  </div>
                </div>
              </div>
              <div className="reveal-slide-right" style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: '#f0f4ff', color: '#1e3c72', borderRadius: '8px', fontWeight: '800', fontSize: '12px', marginBottom: '16px' }}>STEP 2</div>
                <h3 style={{ fontSize: '40px', fontWeight: '900', color: '#111', marginBottom: '24px', lineHeight: '1.2', letterSpacing: '-1px' }}>AI processes the data</h3>
                <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.7' }}>Our vision models instantly extract PNR numbers, flight times, and hotel addresses from the raw pixels, dynamically connecting the dots.</p>
              </div>
            </div>

            {/* Step 3 */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '80px', flexWrap: 'wrap', justifyContent: 'space-between', overflow: 'hidden' }}>
              <div className="reveal-slide-left" style={{ flex: '1 1 400px', maxWidth: '500px' }}>
                <div style={{ display: 'inline-block', padding: '6px 12px', background: '#f0f4ff', color: '#1e3c72', borderRadius: '8px', fontWeight: '800', fontSize: '12px', marginBottom: '16px' }}>STEP 3</div>
                <h3 style={{ fontSize: '40px', fontWeight: '900', color: '#111', marginBottom: '24px', lineHeight: '1.2', letterSpacing: '-1px' }}>Share your itinerary</h3>
                <p style={{ fontSize: '20px', color: '#666', lineHeight: '1.7' }}>Get a beautiful, mobile-friendly link that you can text to your family, friends, or coworkers instantly, keeping everyone in sync.</p>
              </div>
              <div className="reveal-slide-right" style={{ flex: '1 1 500px', height: '400px', borderRadius: '32px', background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: '1px solid #dee2e6', boxShadow: '0 20px 40px rgba(0,0,0,0.04)' }}>
                {/* Minimal CSS representation of mobile UI */}
                <div style={{ width: '140px', height: '280px', background: '#fff', borderRadius: '24px', boxShadow: '0 10px 30px rgba(0,0,0,0.08)', padding: '16px', position: 'relative', border: '4px solid #333' }}>
                  <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 24px auto' }}></div>
                  <div style={{ width: '100%', height: '40px', background: '#f0f4ff', borderRadius: '8px', marginBottom: '12px' }}></div>
                  <div style={{ width: '100%', height: '60px', background: '#f8f9fa', borderRadius: '8px', marginBottom: '12px' }}></div>
                  <div style={{ width: '100%', height: '60px', background: '#f8f9fa', borderRadius: '8px' }}></div>
                  <div style={{ position: 'absolute', bottom: '16px', right: '16px', width: '32px', height: '32px', background: '#1e3c72', borderRadius: '50%', boxShadow: '0 4px 10px rgba(30,60,114,0.3)' }}></div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* CTA Section */}
        <section className="reveal-on-scroll" style={{ padding: '160px 40px', background: '#111', color: '#fff', textAlign: 'center' }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <h2 style={{ fontSize: 'clamp(40px, 5vw, 64px)', fontWeight: '900', marginBottom: '32px', letterSpacing: '-1.5px' }}>Ready to organize your next trip?</h2>
            <p style={{ fontSize: '24px', color: '#aaa', marginBottom: '48px', maxWidth: '800px', margin: '0 auto 48px auto' }}>Join thousands of travelers who have automated their itinerary planning.</p>
            <button
              className="btn"
              style={{ fontSize: '18px', padding: '18px 48px', borderRadius: '40px', background: '#fff', color: '#111', width: 'auto', fontWeight: '800', transition: 'transform 0.2s', cursor: 'pointer' }}
              onClick={() => openAuth('register')}
              onMouseOver={(e) => e.target.style.transform = 'scale(1.05)'}
              onMouseOut={(e) => e.target.style.transform = 'scale(1)'}
            >
              Create Free Account
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer style={{ background: '#0a0a0a', color: '#666', padding: '40px 20px', textAlign: 'center' }}>
        <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px', marginBottom: '16px' }}>TravelAI</div>
        <p style={{ fontSize: '14px' }}>&copy; 2026 TravelAI Assistant. All rights reserved.</p>
      </footer>

      {/* Auth Modal Portal */}
      {showAuthModal && (
        <AuthModal
          initialMode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};

export default Home;
