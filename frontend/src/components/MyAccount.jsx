import React, { useEffect, useState } from 'react';
import '../styles/MyAccount.css';
import Toast from './Toast';

export default function MyAccount({ onNavigate }) {
  const [profile, setProfile] = useState(() => {
    try { return JSON.parse(localStorage.getItem('profile') || '{}'); } catch(e) { return {}; }
  });
  const [formProfile, setFormProfile] = useState(profile);
  const [toast, setToast] = useState({ open: false, message: '' });

  useEffect(() => {
    const profileHandler = () => {
      try {
        const p = JSON.parse(localStorage.getItem('profile') || '{}');
        setProfile(p);
      } catch(e){}
    };
    window.addEventListener('profileChanged', profileHandler);
    return () => window.removeEventListener('profileChanged', profileHandler);
  }, []);

  const uploadAvatar = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedProfile = { ...profile, avatar: e.target.result };
      setProfile(updatedProfile);
      localStorage.setItem('profile', JSON.stringify(updatedProfile));
      window.dispatchEvent(new Event('profileChanged'));
    };
    reader.readAsDataURL(file);
  };

  const saveProfile = () => {
    const updatedProfile = { ...profile, ...formProfile };
    setProfile(updatedProfile);
    localStorage.setItem('profile', JSON.stringify(updatedProfile));
    window.dispatchEvent(new Event('profileChanged'));
    setToast({ open: true, message: 'Profile saved' });
    setTimeout(() => setToast({ open: false, message: '' }), 2200);
  };

  const cancelEdits = () => {
    setFormProfile(profile);
    setToast({ open: true, message: 'Edits canceled' });
    setTimeout(() => setToast({ open: false, message: '' }), 1200);
  };

  return (
    <div className="myaccount-container">
      <div className="myaccount-card">
        <button className="back-button" onClick={() => onNavigate('home')}>← Back</button>

        <div className="myaccount-header">
          <div className="myaccount-avatar">
            <div className="avatar-preview" style={{ backgroundImage: profile.avatar ? `url(${profile.avatar})` : undefined }}>
              {!profile.avatar && (profile.fullName ? profile.fullName.split(' ').map(n=>n[0]).slice(0,2).join('') : 'U')}
            </div>
            <div>
              <label className="small-button" htmlFor="avatarInp">Change</label>
              <input id="avatarInp" type="file" accept="image/*" onChange={(e)=>uploadAvatar(e.target.files[0])} style={{ display: 'none' }} />
            </div>
          </div>

          <div className="myaccount-info">
            <input className="field-input" placeholder="Full name" value={formProfile.fullName||''} onChange={(e)=>setFormProfile({...formProfile, fullName: e.target.value})} />
            <input className="field-input" placeholder="Username" value={formProfile.username||''} onChange={(e)=>setFormProfile({...formProfile, username: e.target.value})} />
            <input className="field-input" placeholder="Target exam" value={formProfile.targetExam||''} onChange={(e)=>setFormProfile({...formProfile, targetExam: e.target.value})} />

            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <button className="small-button" onClick={saveProfile}>Save</button>
              <button className="small-button" onClick={cancelEdits}>Cancel</button>
            </div>
          </div>
        </div>
      </div>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: '' })} />
    </div>
  );
}
