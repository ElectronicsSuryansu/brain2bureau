import React, { useState, useEffect, useRef } from "react";
import "../styles/Profile.css";

export default function Profile({ onNavigate, toggleDarkMode }) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [profile, setProfile] = useState(() => { try { return JSON.parse(localStorage.getItem('profile') || '{}'); } catch(e) { return {}; } });
  const profileRef = useRef(null);

  // Load dark mode preference on mount and listen for profile changes
  useEffect(() => {
    const savedMode = localStorage.getItem("darkMode");
    if (savedMode !== null) {
      setIsDarkMode(JSON.parse(savedMode));
    }
    const handler = (e) => {
      if (!e) return;
      if (e.key === 'profile') {
        try { setProfile(JSON.parse(localStorage.getItem('profile') || '{}')); } catch(e) {}
      }
    };
    const profileHandler = () => { try { setProfile(JSON.parse(localStorage.getItem('profile') || '{}')); } catch(e) {} };
    window.addEventListener('storage', handler);
    window.addEventListener('profileChanged', profileHandler);
    return () => { window.removeEventListener('storage', handler); window.removeEventListener('profileChanged', profileHandler); };
  }, []);

  const toggleProfileMenu = () => {
    setShowProfileMenu(!showProfileMenu);
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
    };

    if (showProfileMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showProfileMenu]);

  const handleMenuClick = (action) => {
    setShowProfileMenu(false);
    
    switch(action) {
      case 'my-account':
        onNavigate('my-account');
        break;
      case 'my-progress':
        onNavigate('track-progress');
        break;
      case 'settings':
        onNavigate('settings');
        break;
      case 'sign-out':
        if (!confirm('Sign out securely?')) return;
        // clear active profile & mark last logout
        try {
          const p = JSON.parse(localStorage.getItem('profile') || '{}');
          if (p) {
            const arr = JSON.parse(localStorage.getItem('devices') || '[]');
            arr.unshift({ id: Date.now(), ua: navigator.userAgent || 'unknown', lastSeen: new Date().toISOString(), action: 'logout' });
            localStorage.setItem('devices', JSON.stringify(arr));
          }
        } catch(e){}
        localStorage.removeItem('profile');
        try{ window.dispatchEvent(new Event('profileChanged')); } catch(e){}
        onNavigate('home');
        break;
      case 'switch-account':
        try {
          const accounts = JSON.parse(localStorage.getItem('accounts') || '[]');
          const list = accounts.map(a => a.username).join(', ');
          const ans = prompt(`Enter username to switch to (available: ${list}) or type NEW to create a new account`,'');
          if (!ans) return;
          if (ans.toLowerCase() === 'new') {
            const fullName = prompt('Full name'); if (fullName === null) return;
            const username = prompt('Username'); if (username === null) return;
            const p = { fullName, username, lastLogin: new Date().toISOString() };
            accounts.unshift(p); localStorage.setItem('accounts', JSON.stringify(accounts)); localStorage.setItem('profile', JSON.stringify(p)); try{ window.dispatchEvent(new Event('profileChanged')); } catch(e){}
            onNavigate('home');
            return;
          }
          const found = accounts.find(a => a.username === ans);
          if (!found) return alert('Account not found');
          localStorage.setItem('profile', JSON.stringify(found));
          try{ window.dispatchEvent(new Event('profileChanged')); } catch(e){}
          onNavigate('home');
        } catch(e) { alert('Switch failed'); }
        break;
      case 'appearance':
        // toggle and persist
        const nm = !isDarkMode;
        setIsDarkMode(nm);
        localStorage.setItem('darkMode', JSON.stringify(nm));
        if (toggleDarkMode) toggleDarkMode();
        break;
      case 'language':
        const lang = prompt('Select language code (en / ne)', profile.language || 'en');
        if (!lang) return;
        try { const p = {...profile, language: lang}; setProfile(p); localStorage.setItem('profile', JSON.stringify(p)); window.dispatchEvent(new Event('profileChanged')); } catch(e) {}
        break;
      default:
        break;
    }
  };

  const toggleAppearance = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', JSON.stringify(newMode));
    if (toggleDarkMode) toggleDarkMode();
  };

  // Update isDarkMode when localStorage changes (from App)
  useEffect(() => {
    const handleStorageChange = () => {
      const savedMode = localStorage.getItem("darkMode");
      if (savedMode !== null) {
        setIsDarkMode(JSON.parse(savedMode));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, []);

  const appearanceText = isDarkMode ? "Appearance: Dark" : "Appearance: Light";

  return (
    <div className="profile-section" ref={profileRef}>
      <button className="profile-btn" onClick={toggleProfileMenu} aria-label="User menu">
        <div className="profile-avatar" style={{ backgroundImage: profile.avatar ? `url(${profile.avatar})` : undefined }}>{!profile.avatar && (profile.fullName ? profile.fullName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U')}</div>
      </button>
      
      {showProfileMenu && (
        <div className="profile-dropdown">
          <div className="profile-header">
            <div className="profile-avatar-large" style={{ backgroundImage: profile.avatar ? `url(${profile.avatar})` : undefined }}>{!profile.avatar && (profile.fullName ? profile.fullName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U')}</div>
            <div className="profile-info">
              <h3>{profile.fullName || 'Your Name'}</h3>
              <p>@{profile.username || 'username'}</p>
            </div>
          </div>
          
          <div className="profile-menu-section">
            <button className="profile-menu-item" onClick={() => handleMenuClick('my-account')}>
              <span className="menu-icon">👤</span>
              <span>My Account</span>
            </button>
            <button className="profile-menu-item" onClick={() => handleMenuClick('switch-account')}>
              <span className="menu-icon">🔄</span>
              <span>Switch Account</span>
            </button>
            <button className="profile-menu-item" onClick={() => handleMenuClick('sign-out')}>
              <span className="menu-icon">🚪</span>
              <span>Sign Out</span>
            </button>
          </div>
          
          <div className="profile-menu-divider"></div>
          
          <div className="profile-menu-section">
            <button className="profile-menu-item" onClick={() => handleMenuClick('my-progress')}>
              <span className="menu-icon">📊</span>
              <span>My Progress</span>
            </button>
            <button className="profile-menu-item" onClick={() => handleMenuClick('settings')}>
              <span className="menu-icon">⚙️</span>
              <span>Settings</span>
            </button>
          </div>
          
          <div className="profile-menu-divider"></div>
          
          <div className="profile-menu-section">
            <button className="profile-menu-item" onClick={() => handleMenuClick('appearance')}>
              <span className="menu-icon">{isDarkMode ? "☀️" : "🌙"}</span>
              <span>{appearanceText}</span>
            </button>
            <button className="profile-menu-item" onClick={() => handleMenuClick('language')}>
              <span className="menu-icon">🌐</span>
              <span>Language: English</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}