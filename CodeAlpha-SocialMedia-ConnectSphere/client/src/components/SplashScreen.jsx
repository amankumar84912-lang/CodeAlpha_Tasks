import { useState, useEffect } from 'react';
import logoImg from '../assets/logo.png';

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExiting(true), 2000);
    const doneTimer = setTimeout(() => onDone(), 2500);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  return (
    <div
      className="splash-screen"
      style={exiting ? {
        animation: 'fadeOut 0.5s ease forwards'
      } : {}}
    >
      <img src={logoImg} alt="ConnectSphere Logo" className="splash-logo splash-logo-img" />
      <h1 className="splash-title">ConnectSphere</h1>
      <p className="splash-tagline">Connect. Share. Belong.</p>
      <div className="splash-dots">
        <div className="splash-dot" />
        <div className="splash-dot" />
        <div className="splash-dot" />
      </div>
    </div>
  );
}
