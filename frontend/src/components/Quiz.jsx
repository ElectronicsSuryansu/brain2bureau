import React, { useState, useEffect, useRef, useCallback } from "react";
import "../styles/Quiz.css";
import { questions } from "../data/questions";

const SECONDS_PER_QUESTION = 60;

function shuffleArray(arr) {
  return arr.slice().sort(() => Math.random() - 0.5);
}

function launchConfetti(containerSelector = '.quiz-container') {
  try {
    const root = document.querySelector(containerSelector) || document.body;
    const colors = ['#FF595E','#FFCA3A','#8ACB88','#1982C4','#6A4C93'];
    const confetti = document.createElement('div');
    confetti.className = 'confetti-container';
    for (let i = 0; i < 40; i++) {
      const el = document.createElement('span');
      el.className = 'confetti-piece';
      const left = Math.random() * 100;
      el.style.left = `${left}%`;
      el.style.background = colors[Math.floor(Math.random() * colors.length)];
      const delay = Math.random() * 0.8;
      const dur = 2.4 + Math.random() * 1.6;
      el.style.animationDelay = `${delay}s`;
      el.style.animationDuration = `${dur}s`;
      el.style.opacity = String(0.9 + Math.random() * 0.1);
      el.style.transform = `translateY(-10px) rotate(${Math.floor(Math.random()*360)}deg)`;
      confetti.appendChild(el);
    }
    root.appendChild(confetti);
    setTimeout(() => confetti.remove(), 4500);
  } catch (e) { /* ignore on unsupported env */ }
}

const Quiz = ({ questions: propQuestions, onClose, secondsPerQuestion }) => {
  const secsPerQ = secondsPerQuestion ?? SECONDS_PER_QUESTION;

  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [quizItems, setQuizItems] = useState([]);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [isOptionDisabled, setIsOptionDisabled] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const timerRef = useRef(null);
  const [timeTaken, setTimeTaken] = useState(0);
  const answersRef = useRef([]);

  useEffect(() => {
    const pool = propQuestions ?? questions;
    const items = shuffleArray(pool);
    setQuizItems(items);
    setSecondsLeft(items.length * secsPerQ);
    setAnswers([]);
    answersRef.current = [];
    setScore(0);
    setCurrent(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsOptionDisabled(false);
    setTimeTaken(0);
  }, [propQuestions, secsPerQ]);

  useEffect(() => {
    if (!quizItems.length) return;
    setShuffledOptions(shuffleArray(quizItems[current].options || []));
  }, [current, quizItems]);

  const totalTime = quizItems.length * secsPerQ;

  const finishQuiz = useCallback(() => {
    // use ref to ensure we have latest answers (avoid stale state when finish is called immediately after answer)
    const currentAnswers = answersRef.current || [];
    const remaining = quizItems.filter(q => !currentAnswers.some(a => a.id === q.id)).map((q) => ({
      id: q.id,
      question: q.question,
      selected: null,
      correct: false,
      correctAnswer: q.answer,
    }));

    const merged = [...currentAnswers, ...remaining];
    setAnswers(merged);
    answersRef.current = merged;

    const correctCount = merged.filter(a => a.correct).length;
    setScore(correctCount);

    const duration = totalTime - secondsLeft;
    setTimeTaken(duration);
    setShowResult(true);

    // Build per-category breakdown for future analytics
    const breakdown = {};
    merged.forEach(a => {
      const q = quizItems.find(x => x.id === a.id) || {};
      const cat = q.category || 'mixed';
      if (!breakdown[cat]) breakdown[cat] = { correct: 0, total: 0 };
      breakdown[cat].total += 1;
      if (a.correct) breakdown[cat].correct += 1;
    });

    // record exam history (score, total, percentage, time, duration, breakdown)
    try {
      const total = quizItems.length;
      const percentage = total ? Math.round((correctCount / total) * 100) : 0;
      const raw = localStorage.getItem('examHistory') || '[]';
      const arr = JSON.parse(raw);
      arr.unshift({ score: correctCount, total, percentage, time: new Date().toISOString(), title: quizItems[0]?.category ? quizItems[0].category : 'Mock Test', duration, breakdown });
      localStorage.setItem('examHistory', JSON.stringify(arr.slice(0, 50)));
      // dispatch change for same-tab listeners
      try { window.dispatchEvent(new Event('examHistoryChanged')); } catch(e) {}

      // Also record an activity item
      const logRaw = localStorage.getItem('activityLog') || '[]';
      const logArr = JSON.parse(logRaw);
      logArr.unshift({ type: 'exam', title: `Score: ${percentage}%`, time: new Date().toISOString(), duration });
      localStorage.setItem('activityLog', JSON.stringify(logArr.slice(0, 50)));
      try { window.dispatchEvent(new Event('activityLogChanged')); } catch(e) {}

      // celebrate high scores
      if (percentage >= 80) {
        try { launchConfetti(); } catch(e) { /* ignore */ }
      }
    } catch (e) {
      // ignore
    }

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [quizItems, secondsLeft, totalTime]);

  useEffect(() => {
    if (!quizItems.length || showResult) return;
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          finishQuiz();
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [quizItems, finishQuiz, showResult]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswer = (option) => {
    if (isOptionDisabled) return;
    setSelectedOption(option);
    setIsOptionDisabled(true);
    const q = quizItems[current];
    const correct = option === q.answer;
    setAnswers((prev) => {
      const next = [...prev, { id: q.id, question: q.question, selected: option, correct, correctAnswer: q.answer }];
      answersRef.current = next;
      return next;
    });
    if (correct) setScore((s) => s + 1);

    setTimeout(() => {
      if (current + 1 < quizItems.length) {
        setCurrent((c) => c + 1);
        setSelectedOption(null);
        setIsOptionDisabled(false);
      } else {
        finishQuiz();
      }
    }, 900);
  };

  const handleNext = () => {
    if (current + 1 < quizItems.length) {
      setCurrent((c) => c + 1);
      setSelectedOption(null);
      setIsOptionDisabled(false);
    } else {
      finishQuiz();
    }
  };

  const restart = () => {
    const items = shuffleArray(propQuestions ?? questions);
    setQuizItems(items);
    setSecondsLeft(items.length * secsPerQ);
    setAnswers([]);
    setScore(0);
    setCurrent(0);
    setShowResult(false);
    setSelectedOption(null);
    setIsOptionDisabled(false);
    setTimeTaken(0);
  };

  const formatTime = (s) => {
    const mm = Math.floor(s / 60).toString().padStart(2, "0");
    const ss = (s % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  return (
    <div className="quiz-container">
      {showResult ? (
        <div className="result">
          <h2>Quiz Completed!</h2>
          <p>
            Your score: {score} / {quizItems.length} ({Math.round((score / quizItems.length) * 100) || 0}%)
          </p>
          <p>Time taken: {formatTime(timeTaken)}</p>
          <div className="result-list">
            {answers.map((a, idx) => (
              <div key={idx} className={`result-item ${a.correct ? "correct" : "wrong"}`}>
                <div className="q-text">
                  {idx + 1}. {a.question}
                </div>
                <div className="a-selected">
                  Selected: <strong>{a.selected ?? "—"}</strong>
                  <span className={`badge ${a.correct ? "badge-correct" : "badge-wrong"}`}>{a.correct ? "Correct" : "Wrong"}</span>
                </div>
                <div className="a-correct">Answer: <strong>{a.correctAnswer}</strong></div>
              </div>
            ))}
          </div>
          <div className="result-actions">
            <button className="try-again-button" onClick={restart}>Try Again</button>
            {onClose && <button className="close-button" onClick={onClose}>Close</button>}
          </div>
        </div>
      ) : (
        quizItems.length > 0 && (
          <div className="quiz-box">
            {onClose && (
              <button className="close-quiz" onClick={onClose}>Close Quiz</button>
            )}

            <div className="quiz-top">
              <div className="timer">
                <div className="time-left">{formatTime(secondsLeft)}</div>
                <div className="timer-bar">
                  <div className="timer-progress" style={{ width: `${totalTime ? (secondsLeft / totalTime) * 100 : 0}%` }} />
                </div>
              </div>
              <div className="score-pill">Score: {score}</div>
            </div>

            <h2>Question {current + 1} / {quizItems.length}</h2>
            <p className="question">{quizItems[current].question}</p>

            <div className="options">
              {shuffledOptions.map((opt) => {
                let cls = 'option-button';
                if (selectedOption) {
                  if (opt === quizItems[current].answer) cls += ' correct';
                  else if (opt === selectedOption) cls += ' incorrect';
                }
                return (
                  <button
                    key={opt}
                    className={cls}
                    disabled={isOptionDisabled}
                    onClick={() => handleAnswer(opt)}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div className="quiz-controls">
              {selectedOption && (
                <button className="next-btn" onClick={handleNext}>Next</button>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default Quiz;
