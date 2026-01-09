// MockExam.jsx
import React, { useState } from 'react';
import "../styles/MockExam.css";
import Profile from "./Profile";
import Quiz from "./Quiz";
import { questions as allQuestions } from "../data/questions";

export default function MockExam({ onNavigate, toggleDarkMode }) {
  const examTypes = [
    { id: 'general-knowledge', title: 'General Knowledge', icon: '📚' },
    { id: 'constitution', title: 'Constitution', icon: '⚖️' },
    { id: 'full-mock', title: 'Full Mock', icon: '📝' }
  ];

  const [activeExam, setActiveExam] = useState(null);
  const [showConfig, setShowConfig] = useState(false);
  const [numQuestions, setNumQuestions] = useState(10);
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [timePerQuestion, setTimePerQuestion] = useState(60);
  const [shuffleQuestions, setShuffleQuestions] = useState(true);

  function shuffle(arr) { return arr.slice().sort(() => Math.random() - 0.5); }

  const getPool = (examId) => {
    if (examId === 'full-mock') return allQuestions;
    return allQuestions.filter(q => q.category === examId);
  };

  const getSample = (pool) => {
    if (!pool || !pool.length) return null;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const getExamStats = (examId) => {
    try {
      const raw = localStorage.getItem('examHistory') || '[]';
      const arr = JSON.parse(raw);
      if (!arr.length) return null;
      // match by category title or fall back
      const filtered = examId === 'full-mock' ? arr : arr.filter(a => a.title === examId || (a.title && a.title.toLowerCase().includes(examId)) );
      const last = filtered[0] || null;
      const best = filtered.reduce((b, x) => (x.percentage > (b?.percentage||0) ? x : b), null);
      return { last, best };
    } catch (e) { return null; }
  };

  const openConfigFor = (examId) => {
    const pool = getPool(examId);
    setActiveExam(examId);
    setShowConfig(true);
    setQuizQuestions(null);
    setNumQuestions(Math.min(10, pool.length || 5));
    setShuffleQuestions(true);
    setTimePerQuestion(60);
  };

  const startTest = () => {
    const pool = getPool(activeExam);
    let selection = shuffleQuestions ? shuffle(pool) : pool.slice();
    selection = selection.slice(0, Math.min(numQuestions, selection.length));
    setQuizQuestions(selection);
    setShowConfig(false);
  };

  return (
    <div className="mock-exam-container">
      {/* Header */}
      <header className="mock-header">
        <div className="header-content">
          <div className="logo-icon"><span>🎓</span></div>
          <div className="header-text">
            <h1>Brain2Bureau - Loksewa Prep</h1>
            <p>Your Complete Preparation Companion</p>
          </div>
          <Profile onNavigate={onNavigate} toggleDarkMode={toggleDarkMode} />
        </div>
      </header>

      {/* Navigation Buttons */}
      <div className="nav-container">
        <button className="nav-btn" onClick={() => onNavigate?.('dashboard')}>Dashboard</button>
        <button className="nav-btn" onClick={() => onNavigate?.('study-resources')}>Study Resources</button>
        <button className="nav-btn nav-btn-active" onClick={() => onNavigate?.('mock-exams')}>Mock Exams</button>
        <button className="nav-btn" onClick={() => onNavigate?.('track-progress')}>Track Progress</button>
      </div>

      <main className="mock-main">
        <section className="exam-section">
          <h2 className="section-title"><span className="icon">📝</span>Mock Examinations</h2>
          <p className="section-description">Choose an exam, configure length & time, and start practicing.</p>

          <div className="exam-grid">
            {examTypes.map((exam) => {
              const pool = getPool(exam.id);
              const sample = getSample(pool);
              const stats = getExamStats(exam.id);
              return (
                <div key={exam.id} className={`exam-card ${activeExam === exam.id ? 'active' : ''}`} onClick={() => openConfigFor(exam.id)}>
                  <div className="exam-card-head">
                    <div className="exam-icon-large">{exam.icon}</div>
                    <div className="exam-info">
                      <div className="exam-title">{exam.title}</div>
                      <div className="exam-meta">{pool.length} question{pool.length !== 1 ? 's' : ''}</div>
                    </div>
                    <div className="exam-stats">
                      {stats?.last && <div className="last-score">Last: {stats.last.percentage}%</div>}
                      {stats?.best && <div className="best-score">Best: {stats.best.percentage}%</div>}
                    </div>
                  </div>

                  {sample && (
                    <div className="exam-sample">{sample.question.slice(0, 120)}{sample.question.length > 120 ? '…' : ''}</div>
                  )}

                  <div className="exam-card-actions">
                    <button className="btn-ghost" onClick={(e) => { e.stopPropagation(); openConfigFor(exam.id); }}>Configure</button>
                    <button className="btn-primary" onClick={(e) => { e.stopPropagation(); openConfigFor(exam.id); }}>Start</button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Config Panel */}
          {activeExam && showConfig && (
            <div className="exam-config-panel">
              <div className="config-left">
                <h3>Configure: {examTypes.find(e => e.id === activeExam)?.title}</h3>

                <label className="config-row">
                  <span>Number of Questions</span>
                  <input type="number" min={1} max={getPool(activeExam).length} value={numQuestions} onChange={(e) => setNumQuestions(Number(e.target.value))} />
                </label>

                <label className="config-row">
                  <span>Time per question</span>
                  <select value={timePerQuestion} onChange={(e) => setTimePerQuestion(Number(e.target.value))}>
                    <option value={30}>30s</option>
                    <option value={45}>45s</option>
                    <option value={60}>60s</option>
                    <option value={90}>90s</option>
                    <option value={120}>120s</option>
                  </select>
                </label>

                <label className="config-row">
                  <span>Shuffle questions</span>
                  <input type="checkbox" checked={shuffleQuestions} onChange={(e) => setShuffleQuestions(e.target.checked)} />
                </label>

                <div className="config-actions">
                  <button className="start-btn" onClick={() => { startTest(); }}>Start Test</button>
                  <button className="cancel-btn" onClick={() => { setActiveExam(null); setShowConfig(false); }}>Cancel</button>
                </div>
              </div>

              <div className="config-right">
                <h4>Preview</h4>
                {getSample(getPool(activeExam)) ? (
                  <div className="preview-card">
                    <div className="preview-q">{getSample(getPool(activeExam)).question}</div>
                    <div className="preview-meta">Available: {getPool(activeExam).length} questions</div>
                  </div>
                ) : (
                  <div className="preview-card empty">No questions available for this exam.</div>
                )}

                <div className="config-note">Tip: You can change time and shuffle behavior for a tougher practice.</div>
              </div>
            </div>
          )}

          {quizQuestions && (
            <div className="quiz-wrapper">
              <Quiz
                questions={quizQuestions}
                secondsPerQuestion={timePerQuestion}
                onClose={() => { setActiveExam(null); setQuizQuestions(null); setShowConfig(false); }}
              />
            </div>
          )}

          <div className="back-btn-container">
            <button className="back-btn" onClick={() => onNavigate?.('home')}>Back to Home</button>
          </div>
        </section>
      </main>
    </div>
  );
}