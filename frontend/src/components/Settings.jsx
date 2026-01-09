import React, { useEffect, useState, useRef } from 'react';
import '../styles/Settings.css';

export default function Settings({ onNavigate, toggleDarkMode }) {
  const [profile, setProfile] = useState(() => { try { return JSON.parse(localStorage.getItem('profile')||'{}'); } catch(e) { return {}; } });
  const [devices, setDevices] = useState(() => { try { return JSON.parse(localStorage.getItem('devices')||'[]'); } catch(e){ return []; } });
  const fileRef = useRef(null);

  useEffect(() => {
    const handler = () => { try { setProfile(JSON.parse(localStorage.getItem('profile')||'{}')); setDevices(JSON.parse(localStorage.getItem('devices')||'[]')); } catch(e){} };
    window.addEventListener('profileChanged', handler);
    window.addEventListener('storage', (e) => { if (['profile','devices'].includes(e.key)) handler(); });
    return () => { window.removeEventListener('profileChanged', handler); };
  }, []);

  const saveProfileField = (k, v) => {
    const p = {...profile, [k]: v}; setProfile(p); localStorage.setItem('profile', JSON.stringify(p)); try{ window.dispatchEvent(new Event('profileChanged')); } catch(e){};
  };

  const changePassword = () => {
    const cur = prompt('Current password');
    if (cur === null) return;
    // simple check: compare base64 hashes - this is a local-only demo
    const hash = (s) => btoa(s);
    if ((profile.passwordHash||'') && (profile.passwordHash !== hash(cur))) { alert('Current password incorrect'); return; }
    const nw = prompt('New password');
    if (!nw) return;
    saveProfileField('passwordHash', hash(nw));
    alert('Password changed');
  };

  const toggleNotifications = (v) => { saveProfileField('notificationsEnabled', !!v); };

  const resetProgress = () => {
    if (!confirm('Reset all progress and history? This cannot be undone.')) return;
    localStorage.removeItem('resourceStates');
    localStorage.removeItem('examHistory');
    localStorage.removeItem('activityLog');
    try { window.dispatchEvent(new Event('resourceStatesChanged')); } catch(e){}
    try { window.dispatchEvent(new Event('examHistoryChanged')); } catch(e){}
    try { window.dispatchEvent(new Event('activityLogChanged')); } catch(e){}
    alert('Progress reset.');
  };

  const exportData = () => {
    const data = {
      profile: JSON.parse(localStorage.getItem('profile')||'{}'),
      resourceStates: JSON.parse(localStorage.getItem('resourceStates')||'{}'),
      examHistory: JSON.parse(localStorage.getItem('examHistory')||'[]'),
      activityLog: JSON.parse(localStorage.getItem('activityLog')||'[]')
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `brain2bureau-backup-${new Date().toISOString().slice(0,10)}.json`; document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
  };

  const importData = (file) => {
    if (!file) return;
    const r = new FileReader();
    r.onload = (ev) => {
      try {
        const obj = JSON.parse(ev.target.result);
        if (obj.resourceStates) localStorage.setItem('resourceStates', JSON.stringify(obj.resourceStates));
        if (obj.examHistory) localStorage.setItem('examHistory', JSON.stringify(obj.examHistory));
        if (obj.activityLog) localStorage.setItem('activityLog', JSON.stringify(obj.activityLog));
        if (obj.profile) localStorage.setItem('profile', JSON.stringify(obj.profile));
        try { window.dispatchEvent(new Event('resourceStatesChanged')); } catch(e){}
        try { window.dispatchEvent(new Event('examHistoryChanged')); } catch(e){}
        try { window.dispatchEvent(new Event('activityLogChanged')); } catch(e){}
        try { window.dispatchEvent(new Event('profileChanged')); } catch(e){}
        alert('Data imported.');
      } catch (err) { alert('Invalid file'); }
    };
    r.readAsText(file);
  };

  const removeDevice = (index) => {
    const d = devices.slice(); d.splice(index,1); setDevices(d); localStorage.setItem('devices', JSON.stringify(d));
  };

  const addCurrentDevice = () => {
    try {
      const ua = navigator.userAgent || 'unknown';
      const d = { id: Date.now(), ua, lastSeen: new Date().toISOString(), current: true };
      const arr = JSON.parse(localStorage.getItem('devices')||'[]');
      arr.unshift(d); localStorage.setItem('devices', JSON.stringify(arr)); setDevices(arr);
    } catch(e){}
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12}}>
          <button className="back-button" onClick={() => onNavigate('home')}>← Back</button>
        </div>
        <h2>Settings</h2>
        <div className="settings-grid">
          <div className="settings-section">
            <h3>Account</h3>
            <div className="row">Email / Username: <strong>{profile.email || profile.username || '—'}</strong></div>
            <div className="row">Last Login: <strong>{profile.lastLogin ? new Date(profile.lastLogin).toLocaleString() : '—'}</strong></div>
            <div className="row"><button className="small-button" onClick={() => changePassword()}>Change Password</button></div>
            <div className="row"><button className="small-button" onClick={() => { saveProfileField('lastLogin', new Date().toISOString()); alert('Last login updated'); }}>Update Last Login</button></div>
          </div>

          <div className="settings-section">
            <h3>Appearance & Language</h3>
            <div className="row">Dark Mode: <label className="switch"><input type="checkbox" checked={!!(profile.darkMode)} onChange={(e)=>{ saveProfileField('darkMode', e.target.checked); localStorage.setItem('darkMode', JSON.stringify(e.target.checked)); if (toggleDarkMode) toggleDarkMode(); }} /><span className="slider" /></label></div>
            <div className="row">Language: <select value={profile.language||'en'} onChange={(e)=> saveProfileField('language', e.target.value)}><option value="en">English</option><option value="ne">नेपाली</option></select></div>
            <div className="row">Notifications: <label className="switch"><input type="checkbox" checked={!!profile.notificationsEnabled} onChange={(e)=> toggleNotifications(e.target.checked)} /><span className="slider" /></label></div>
          </div>

          <div className="settings-section">
            <h3>Security & Privacy</h3>
            <div className="row"><button className="danger" onClick={() => { if (!confirm('Sign out securely?')) return; localStorage.removeItem('profile'); try{ window.dispatchEvent(new Event('profileChanged')); } catch(e){} alert('Signed out'); onNavigate('home'); }}>Sign Out Securely</button></div>
            <div className="row"><button className="small-button" onClick={() => { resetProgress(); }}>Reset Progress</button></div>
            <div className="row"><button className="small-button" onClick={() => alert('Data & Terms: This app stores data locally. No cloud sync yet.')}>Data & Terms</button></div>
            <div className="row">Devices:</div>
            <div className="devices-list">
              {devices.map((d, i) => (
                <div key={d.id} className="device-row">
                  <div className="muted">{d.ua}</div>
                  <div>{new Date(d.lastSeen).toLocaleString()}</div>
                  <div><button className="small-button" onClick={() => removeDevice(i)}>Remove</button></div>
                </div>
              ))}
              <div className="row"><button className="small-button" onClick={() => addCurrentDevice()}>Add this device</button></div>
            </div>
          </div>

          <div className="settings-section">
            <h3>Auto-logout & Backup</h3>
            <div className="row">Auto-logout (minutes): <input type="number" min={0} value={profile.autoLogoutMinutes || 0} onChange={(e)=> saveProfileField('autoLogoutMinutes', parseInt(e.target.value||'0',10))} style={{width:80}} /></div>
            <div className="row">Backup: <button className="small-button" onClick={exportData}>Export Data</button> <input ref={fileRef} type="file" accept="application/json" style={{display:'none'}} onChange={(e)=> importData(e.target.files && e.target.files[0])} /></div>
            <div className="row"><button className="small-button" onClick={() => fileRef.current && fileRef.current.click()}>Import Data</button></div>
            <div className="row small-muted">Backup & restore will overwrite local data.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
