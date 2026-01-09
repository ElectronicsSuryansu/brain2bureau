// StudyResources.jsx
import React, { useEffect, useState } from 'react';
import "../styles/StudyResources.css";
import Profile from "./Profile";
import Toast from "./Toast";
import { studyMaterials } from "../data/studyMaterials";

function loadResourceStates() {
  const raw = localStorage.getItem('resourceStates');
  if (raw) {
    try { return JSON.parse(raw); } catch (e) { /* ignore */ }
  }
  const obj = {};
  studyMaterials.forEach(m => obj[m.id] = { progress: 0, notes: '', completed: false });
  return obj;
}

export default function StudyResources({ onNavigate, toggleDarkMode }) {
  const [resourceStates, setResourceStates] = useState(() => loadResourceStates());
  const [progress, setProgress] = useState(0);
  const [toast, setToast] = useState({ open: false, message: '' });
  const [openNotes, setOpenNotes] = useState(null);

  useEffect(() => {
    const calc = Object.values(resourceStates).reduce((s, r) => s + (r.progress || 0), 0);
    setProgress(resourceStates && Object.keys(resourceStates).length ? Math.round(calc / Object.keys(resourceStates).length) : 0);
  }, [resourceStates]);

  useEffect(() => {
    const handler = (e) => {
      if (!e) return;
      if (e.key === 'resourceStates') {
        setResourceStates(loadResourceStates());
      }
    };
    window.addEventListener('storage', handler);
    return () => window.removeEventListener('storage', handler);
  }, []);

  const saveStates = (newStates) => {
    setResourceStates(newStates);
    localStorage.setItem('resourceStates', JSON.stringify(newStates));
    // dispatch a custom event for same-tab listeners
    try { window.dispatchEvent(new Event('resourceStatesChanged')); } catch (e) { /* ignore */ }
  };

  const toggleComplete = (id) => {
    const newStates = { ...resourceStates };
    const ns = newStates[id] || { progress: 0, notes: '', completed: false };
    ns.completed = !ns.completed;
    if (ns.completed && (ns.progress || 0) < 100) ns.progress = 100;
    if (!ns.completed && ns.progress === 100) ns.progress = 0;
    newStates[id] = ns;
    saveStates(newStates);

    const action = ns.completed ? 'completed' : 'uncompleted';
    const activityRaw = localStorage.getItem('activityLog') || '[]';
    const activity = JSON.parse(activityRaw);
    activity.unshift({ type: action, title: studyMaterials.find(m => m.id === id)?.title || id, time: new Date().toISOString() });
    localStorage.setItem('activityLog', JSON.stringify(activity.slice(0, 50)));
    try { window.dispatchEvent(new Event('activityLogChanged')); } catch (e) {}

    setToast({ open: true, message: `${ns.completed ? 'Marked completed' : 'Marked uncompleted'}: ${studyMaterials.find(m => m.id === id)?.title}` });
  };

  const setProgressFor = (id, value) => {
    const newStates = { ...resourceStates };
    const ns = newStates[id] || { progress: 0, notes: '', completed: false };
    ns.progress = Math.max(0, Math.min(100, Number(value)));
    ns.completed = ns.progress >= 100;
    newStates[id] = ns;
    saveStates(newStates);

    const activityRaw = localStorage.getItem('activityLog') || '[]';
    const activity = JSON.parse(activityRaw);
    activity.unshift({ type: 'progress', title: studyMaterials.find(m => m.id === id)?.title || id, detail: `${ns.progress}%`, time: new Date().toISOString() });
    localStorage.setItem('activityLog', JSON.stringify(activity.slice(0, 50)));
    try { window.dispatchEvent(new Event('activityLogChanged')); } catch (e) {}

    setToast({ open: true, message: `Progress saved: ${ns.progress}%` });
  };

  const setNotesFor = (id, notes) => {
    const newStates = { ...resourceStates };
    const ns = newStates[id] || { progress: 0, notes: '', completed: false };
    ns.notes = notes;
    newStates[id] = ns;
    saveStates(newStates);

    const activityRaw = localStorage.getItem('activityLog') || '[]';
    const activity = JSON.parse(activityRaw);
    activity.unshift({ type: 'note', title: studyMaterials.find(m => m.id === id)?.title || id, detail: 'note saved', time: new Date().toISOString() });
    localStorage.setItem('activityLog', JSON.stringify(activity.slice(0, 50)));
    try { window.dispatchEvent(new Event('activityLogChanged')); } catch (e) {}

    setToast({ open: true, message: `Notes saved` });
  };

  const completedCount = Object.values(resourceStates).filter(r => r.completed).length;

  return (
    <div className="study-resources-container">
      {/* Header */}
      <header className="study-header">
        <div className="header-content">
          <div className="logo-icon">
            <span>🎓</span>
          </div>
          <div className="header-text">
            <h1>Brain2Bureau - Loksewa Prep</h1>
            <p>Your Complete Preparation Companion</p>
          </div>
          {/* Profile Component */}
          <Profile onNavigate={onNavigate} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>

      {/* Navigation Buttons */}
      <div className="nav-container">
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className="nav-btn nav-btn-active"
          onClick={() => onNavigate && onNavigate('study-resources')}
        >
          Study Resources
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('mock-exams')}
        >
          Mock Exams
        </button>
        <button 
          className="nav-btn"
          onClick={() => onNavigate && onNavigate('track-progress')}
        >
          Track Progress
        </button>
      </div>

      {/* Main Content */}
      <main className="study-main">
        {/* Study Materials Section */}
        <section className="study-materials-section">
          <h2 className="section-title">
            <span className="icon">📚</span>
            Study Materials
          </h2>

          <div className="materials-overview">
            <div className="materials-progress">
              <div className="progress-pill">{completedCount} / {studyMaterials.length} completed</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
            </div>
          </div>

          <div className="materials-list">
            {studyMaterials.map((material) => {
              const state = resourceStates[material.id] || { progress: 0, notes: '', completed: false };
              return (
                <div key={material.id} className={`material-card ${state.completed ? 'completed' : ''}`}>
                  <div className="material-main">
                    <div>
                      <h3 className="material-title">{material.title}</h3>
                      <p className="material-description">{material.description}</p>

                      <div className="inline-progress">
                        <div className="inline-progress-bar">
                          <div className="inline-progress-fill" style={{ width: `${state.progress}%` }} />
                        </div>
                        <div className="inline-progress-number">{state.progress}%</div>
                      </div>

                      <div className="progress-controls">
                        <input
                          type="range"
                          min={0}
                          max={100}
                          value={state.progress}
                          onChange={(e) => setProgressFor(material.id, e.target.value)}
                        />
                      </div>

                      {openNotes === material.id && (
                        <div className="notes-area">
                          <textarea
                            rows={4}
                            value={state.notes}
                            onChange={(e) => setResourceStates(prev => ({ ...prev, [material.id]: { ...prev[material.id], notes: e.target.value } }))}
                          />
                          <div className="notes-actions">
                            <button className="start-btn" onClick={() => { setNotesFor(material.id, resourceStates[material.id]?.notes || ''); setOpenNotes(null); }}>Save Notes</button>
                            <button className="cancel-btn" onClick={() => setOpenNotes(null)}>Cancel</button>
                          </div>
                        </div>
                      )}

                    </div>

                    <div className="material-actions">
                      <button
                        className={`complete-btn ${state.completed ? 'done' : ''}`}
                        onClick={() => toggleComplete(material.id)}
                      >
                        {state.completed ? 'Completed ✅' : 'Mark Complete'}
                      </button>

                      <button className="complete-btn" onClick={() => setOpenNotes(openNotes === material.id ? null : material.id)}>
                        Notes
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div><button className="back-btn" onClick={() => onNavigate && onNavigate("home")}>
          Back to Home
        </button></div>
        </section>
      </main>

      <Toast open={toast.open} message={toast.message} onClose={() => setToast({ open: false, message: '' })} />
    </div>
  );
}