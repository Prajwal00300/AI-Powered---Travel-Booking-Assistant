import React, { useState } from 'react';
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

  return (
    <div className="gradient-bg" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Premium Navbar */}
      <nav className="glass-panel" style={{ padding: '20px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '-0.5px' }} className="gradient-text">
          TravelAI Assistant
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            className="btn-outline"
            style={{ borderRadius: '30px', padding: '10px 32px', border: '2px solid #1e3c72', color: '#1e3c72', fontWeight: '600', width: 'auto' }}
            onClick={() => openAuth('login')}
          >
            Log In
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
        <div className="animate-slide-up" style={{ maxWidth: '800px' }}>
          <h1 style={{ fontSize: '56px', fontWeight: '900', lineHeight: '1.1', marginBottom: '24px', color: '#111' }}>
            Turn Any Document into a <br />
            <span className="gradient-text">Master Itinerary</span>
          </h1>
          <p style={{ fontSize: '20px', color: '#555', marginBottom: '40px', lineHeight: '1.6' }}>
            Upload PDFs or images of your bookings. Our AI extracts the details and crafts a perfectly organized, sharable travel plan in seconds.
          </p>
          <div style={{ display: 'flex', gap: '20px', justifyContent: 'center' }}>
            <button
              className="btn"
              style={{ fontSize: '18px', padding: '16px 40px', borderRadius: '30px', background: '#111', width: 'auto' }}
              onClick={() => openAuth('register')}
            >
              Start Planning for Free
            </button>
          </div>
        </div>

        {/* Feature Highlights */}
        <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', marginTop: '80px', maxWidth: '1000px', width: '100%', animationDelay: '0.3s' }}>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>📄</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Smart OCR Extraction</h3>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Simply upload your flight tickets and hotel confirmations. We handle the rest.</p>
          </div>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>✨</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>AI-Powered Generation</h3>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Gemini AI perfectly organizes your schedule and formats it in clean markdown.</p>
          </div>
          <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px', textAlign: 'left' }}>
            <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔗</div>
            <h3 style={{ fontSize: '20px', marginBottom: '12px' }}>Instant Sharing</h3>
            <p style={{ color: '#666', lineHeight: '1.5' }}>Generate dynamic public links to share your itineraries with friends instantly.</p>
          </div>
        </div>

        {/* Destination Carousel */}
        <div className="animate-slide-up" style={{ marginTop: '100px', width: '100%', maxWidth: '1200px', animationDelay: '0.5s' }}>
          <h2 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '40px', color: '#111' }}>Explore Destinations</h2>
          <div style={{ display: 'flex', gap: '20px', overflowX: 'auto', paddingBottom: '20px', scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}>
            {[
              "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9?auto=format&fit=crop&w=400&q=80",
              "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80"
            ].map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="Destination"
                style={{ width: '300px', height: '220px', objectFit: 'cover', borderRadius: '16px', flexShrink: 0, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer style={{ background: '#111', color: '#fff', padding: '40px 20px', textAlign: 'center', marginTop: 'auto' }}>
        <p style={{ opacity: 0.8, fontSize: '15px' }}>&copy; 2026 TravelAI Assistant. All rights reserved.</p>
        <p style={{ opacity: 0.5, fontSize: '13px', marginTop: '8px' }}>Crafted with  Modern Web Tech</p>
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
