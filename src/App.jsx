import { useState, useEffect, useRef, useCallback } from "react";

/* ─── Persistent storage via localStorage ─── */
const STORAGE_KEY = "flashdrill_quizzes";

function loadQuizzes() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveQuizzes(quizzes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

/* ─── Helpers ─── */
const uid = () => Math.random().toString(36).slice(2, 10);

/* ─── Inline global styles ─── */
const GLOBAL_STYLE = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0a0a0f;
    --surface: #111118;
    --surface2: #1a1a26;
    --border: rgba(255,255,255,0.07);
    --accent: #e8ff47;
    --accent2: #ff6b6b;
    --accent3: #4dffd2;
    --text: #f0f0f8;
    --muted: #6b6b8a;
    --font-head: 'Outfit', sans-serif;
    --font-mono: 'Outfit', sans-serif;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: var(--font-mono);
    min-height: 100vh;
  }

  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--bg); }
  ::-webkit-scrollbar-thumb { background: var(--surface2); border-radius: 2px; }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(12px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-16px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 0 0 rgba(232,255,71,0); }
    50% { box-shadow: 0 0 20px 4px rgba(232,255,71,0.15); }
  }

  @keyframes flip {
    0% { transform: rotateY(0deg); }
    100% { transform: rotateY(180deg); }
  }

  @keyframes reveal {
    from { clip-path: inset(0 100% 0 0); }
    to { clip-path: inset(0 0% 0 0); }
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }

  .app-root {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
  }

  /* Header */
  .header {
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(10,10,15,0.92);
    backdrop-filter: blur(12px);
  }

  .logo {
    font-family: var(--font-head);
    font-size: 22px;
    font-weight: 800;
    color: var(--accent);
    letter-spacing: -0.5px;
    cursor: pointer;
    user-select: none;
  }

  .logo span {
    color: var(--muted);
    font-weight: 400;
  }

  .header-right {
    margin-left: auto;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  /* Buttons */
  .btn {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    font-family: var(--font-mono);
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    cursor: pointer;
    border: none;
    transition: all 0.18s ease;
    outline: none;
    text-decoration: none;
  }

  .btn:disabled { opacity: 0.3; cursor: not-allowed; pointer-events: none; }

  .btn-primary {
    background: var(--accent);
    color: #0a0a0f;
    font-weight: 700;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }
  .btn-primary:hover { background: #f5ff6e; transform: translateY(-1px); }

  .btn-ghost {
    background: transparent;
    color: var(--muted);
    border: 1px solid var(--border);
  }
  .btn-ghost:hover { color: var(--text); border-color: rgba(255,255,255,0.2); }

  .btn-danger {
    background: transparent;
    color: var(--accent2);
    border: 1px solid rgba(255,107,107,0.2);
  }
  .btn-danger:hover { background: rgba(255,107,107,0.1); }

  .btn-accent3 {
    background: var(--accent3);
    color: #0a0a0f;
    font-weight: 700;
    clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%);
  }
  .btn-accent3:hover { background: #7fffea; }

  /* Input */
  .field {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .field-label {
    font-size: 10px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted);
  }

  .field-input, .field-textarea {
    background: var(--surface);
    border: 1px solid var(--border);
    color: var(--text);
    font-family: var(--font-mono);
    font-size: 14px;
    padding: 12px 14px;
    outline: none;
    transition: border-color 0.18s;
    width: 100%;
    resize: none;
  }

  .field-input:focus, .field-textarea:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 20px rgba(232,255,71,0.08);
  }

  .field-input::placeholder, .field-textarea::placeholder {
    color: var(--muted);
    opacity: 0.5;
  }

  /* ── HOME ── */
  .home {
    flex: 1;
    padding: 40px 32px;
    max-width: 960px;
    margin: 0 auto;
    width: 100%;
    animation: fadeIn 0.4s ease;
  }

  .home-hero {
    margin-bottom: 40px;
  }

  .home-hero h2 {
    font-family: var(--font-head);
    font-size: clamp(32px, 5vw, 52px);
    font-weight: 800;
    line-height: 1.05;
    letter-spacing: -1px;
    color: var(--text);
  }

  .home-hero h2 em {
    font-style: normal;
    color: var(--accent);
  }

  .home-hero p {
    color: var(--muted);
    margin-top: 10px;
    font-size: 13px;
  }

  .quizzes-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
    gap: 14px;
  }

  .quiz-card {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 22px;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    animation: fadeIn 0.35s ease both;
    overflow: hidden;
  }

  .quiz-card::before {
    content: '';
    position: absolute;
    top: 0; left: 0;
    width: 3px; height: 100%;
    background: var(--accent);
    transform: scaleY(0);
    transition: transform 0.2s;
    transform-origin: bottom;
  }

  .quiz-card:hover { border-color: rgba(232,255,71,0.25); transform: translateY(-2px); }
  .quiz-card:hover::before { transform: scaleY(1); }

  .quiz-card-title {
    font-family: var(--font-head);
    font-size: 17px;
    font-weight: 700;
    margin-bottom: 6px;
    color: var(--text);
  }

  .quiz-card-meta {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  .quiz-card-tag {
    display: inline-block;
    background: rgba(232,255,71,0.08);
    color: var(--accent);
    font-size: 10px;
    padding: 2px 8px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-top: 10px;
  }

  .quiz-card-actions {
    position: absolute;
    top: 12px; right: 12px;
    display: flex;
    gap: 4px;
    opacity: 0;
    transition: opacity 0.2s;
  }

  .quiz-card:hover .quiz-card-actions { opacity: 1; }

  .icon-btn {
    width: 28px; height: 28px;
    display: flex; align-items: center; justify-content: center;
    background: var(--surface2);
    border: 1px solid var(--border);
    color: var(--muted);
    cursor: pointer;
    font-size: 12px;
    transition: all 0.15s;
    font-family: var(--font-mono);
  }

  .icon-btn:hover.delete { color: var(--accent2); border-color: rgba(255,107,107,0.3); }
  .icon-btn:hover.edit { color: var(--accent); border-color: rgba(232,255,71,0.3); }

  .empty-state {
    grid-column: 1/-1;
    text-align: center;
    padding: 60px 20px;
    color: var(--muted);
  }

  .empty-icon { font-size: 40px; margin-bottom: 12px; opacity: 0.4; }

  /* ── EDITOR ── */
  .editor {
    flex: 1;
    padding: 32px;
    max-width: 800px;
    margin: 0 auto;
    width: 100%;
    animation: fadeIn 0.35s ease;
  }

  .editor-topbar {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 28px;
  }

  .editor-title-area {
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin-bottom: 28px;
    padding: 24px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-left: 3px solid var(--accent);
  }

  .cards-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 20px;
  }

  .card-row {
    display: grid;
    grid-template-columns: 1fr 1fr auto;
    gap: 10px;
    align-items: start;
    padding: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    animation: slideIn 0.25s ease both;
    transition: border-color 0.2s;
  }

  .card-row:hover { border-color: rgba(255,255,255,0.12); }

  .card-row-num {
    font-size: 10px;
    color: var(--muted);
    letter-spacing: 0.08em;
    padding-top: 4px;
    min-width: 20px;
  }

  .card-delete-btn {
    align-self: center;
    width: 32px; height: 32px;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    border: 1px solid transparent;
    color: var(--muted);
    cursor: pointer;
    font-size: 16px;
    transition: all 0.15s;
    flex-shrink: 0;
    margin-top: 24px;
  }

  .card-delete-btn:hover { color: var(--accent2); border-color: rgba(255,107,107,0.2); }

  .add-card-btn {
    width: 100%;
    padding: 16px;
    background: transparent;
    border: 1px dashed rgba(255,255,255,0.1);
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    cursor: pointer;
    transition: all 0.18s;
  }

  .add-card-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
    background: rgba(232,255,71,0.03);
  }

  /* ── QUIZ VIEW ── */
  .quiz-view {
    flex: 1;
    display: flex;
    flex-direction: column;
    animation: fadeIn 0.35s ease;
  }

  .quiz-view-header {
    padding: 20px 32px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 16px;
  }

  .quiz-view-title {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
  }

  .progress-bar-wrap {
    flex: 1;
    height: 3px;
    background: var(--surface2);
    margin: 0 16px;
    position: relative;
    overflow: hidden;
  }

  .progress-bar-fill {
    height: 100%;
    background: var(--accent);
    transition: width 0.4s ease;
  }

  .quiz-counter {
    font-size: 12px;
    color: var(--muted);
    white-space: nowrap;
  }

  .quiz-stage {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  /* Flashcard */
  .flashcard-wrapper {
    width: 100%;
    max-width: 600px;
    display: flex;
    flex-direction: column;
    gap: 20px;
  }

  .flashcard {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 40px;
    position: relative;
    min-height: 200px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .flashcard::after {
    content: '';
    position: absolute;
    bottom: 0; right: 0;
    width: 40px; height: 40px;
    background: linear-gradient(135deg, transparent 50%, rgba(232,255,71,0.06) 50%);
    pointer-events: none;
  }

  .flashcard-label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .flashcard-label::before {
    content: '';
    width: 20px;
    height: 1px;
    background: var(--muted);
  }

  .flashcard-question {
    font-family: var(--font-head);
    font-size: clamp(18px, 3vw, 26px);
    font-weight: 700;
    line-height: 1.3;
    color: var(--text);
  }

  .flashcard-answer-area {
    background: var(--surface);
    border: 1px solid var(--border);
    padding: 28px 40px;
    min-height: 100px;
    position: relative;
  }

  .answer-reveal-btn {
    width: 100%;
    height: 100%;
    min-height: 80px;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    color: var(--muted);
    font-family: var(--font-mono);
    font-size: 12px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    cursor: pointer;
    transition: color 0.2s;
  }

  .answer-reveal-btn:hover { color: var(--accent); }

  .answer-dots { display: flex; gap: 5px; }
  .answer-dot {
    width: 8px; height: 8px;
    background: var(--surface2);
    border-radius: 50%;
    border: 1px solid rgba(255,255,255,0.1);
  }

  .answer-text {
    font-family: var(--font-head);
    font-size: clamp(16px, 2.5vw, 22px);
    font-weight: 600;
    color: var(--accent3);
    animation: reveal 0.5s ease;
  }

  .answer-label {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 12px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .answer-label::before {
    content: '';
    width: 20px;
    height: 1px;
    background: var(--muted);
  }

  .quiz-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
  }

  .quiz-hint {
    font-size: 11px;
    color: var(--muted);
    letter-spacing: 0.05em;
  }

  /* ── TYPED ANSWER ── */
  .answer-input-wrap {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .answer-input {
    background: var(--surface2);
    border: 2px solid var(--border);
    color: var(--text);
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 600;
    padding: 16px 20px;
    outline: none;
    transition: border-color 0.2s, box-shadow 0.2s;
    width: 100%;
    letter-spacing: 0.01em;
  }

  .answer-input:focus {
    border-color: var(--accent);
    box-shadow: 0 0 0 1px var(--accent), 0 0 24px rgba(232,255,71,0.1);
  }

  .answer-input.correct {
    border-color: var(--accent3);
    box-shadow: 0 0 0 1px var(--accent3), 0 0 24px rgba(77,255,210,0.15);
    color: var(--accent3);
  }

  .answer-input.wrong {
    border-color: var(--accent2);
    box-shadow: 0 0 0 1px var(--accent2), 0 0 24px rgba(255,107,107,0.15);
    color: var(--accent2);
  }

  .answer-input::placeholder { color: var(--muted); opacity: 0.4; font-weight: 400; font-size: 14px; font-family: var(--font-mono); }

  .answer-feedback {
    padding: 14px 20px;
    display: flex;
    align-items: flex-start;
    gap: 12px;
    animation: fadeIn 0.3s ease;
  }

  .answer-feedback.correct { background: rgba(77,255,210,0.06); border: 1px solid rgba(77,255,210,0.2); }
  .answer-feedback.wrong   { background: rgba(255,107,107,0.06); border: 1px solid rgba(255,107,107,0.15); }

  .feedback-icon { font-size: 18px; line-height: 1; flex-shrink: 0; margin-top: 2px; }

  .feedback-body { flex: 1; }

  .feedback-status {
    font-size: 11px;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 4px;
  }

  .feedback-status.correct { color: var(--accent3); }
  .feedback-status.wrong   { color: var(--accent2); }

  .feedback-correct-answer {
    font-family: var(--font-head);
    font-size: 16px;
    font-weight: 600;
    color: var(--text);
  }

  .feedback-your-answer {
    font-size: 12px;
    color: var(--muted);
    margin-top: 2px;
  }

  /* Result screen */
  .result-screen {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 32px;
  }

  .result-card {
    max-width: 480px;
    width: 100%;
    text-align: center;
    animation: fadeIn 0.5s ease;
  }

  .result-big {
    font-family: var(--font-head);
    font-size: 80px;
    font-weight: 800;
    color: var(--accent);
    line-height: 1;
    animation: pulse-glow 2s ease infinite;
  }

  .result-label {
    font-size: 12px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    margin-bottom: 24px;
  }

  .result-subtitle {
    font-family: var(--font-head);
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .result-desc { color: var(--muted); font-size: 13px; margin-bottom: 32px; }

  .result-actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  /* Sections divider */
  .section-head {
    display: flex;
    align-items: center;
    gap: 12px;
    margin: 28px 0 16px;
  }

  .section-head-title {
    font-size: 10px;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    color: var(--muted);
    white-space: nowrap;
  }

  .section-head-line {
    flex: 1;
    height: 1px;
    background: var(--border);
  }

  /* Notification */
  .notif {
    position: fixed;
    bottom: 24px; right: 24px;
    background: var(--surface2);
    border: 1px solid var(--accent);
    color: var(--accent);
    font-size: 12px;
    padding: 12px 20px;
    letter-spacing: 0.08em;
    animation: slideIn 0.3s ease;
    z-index: 999;
    box-shadow: 0 0 30px rgba(232,255,71,0.1);
  }

  /* Modal overlay for confirm */
  .modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(10,10,15,0.85);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 200;
    animation: fadeIn 0.2s ease;
  }

  .modal-box {
    background: var(--surface);
    border: 1px solid var(--border);
    border-top: 2px solid var(--accent2);
    padding: 32px;
    max-width: 380px;
    width: 90%;
  }

  .modal-title {
    font-family: var(--font-head);
    font-size: 18px;
    font-weight: 700;
    margin-bottom: 8px;
  }

  .modal-desc { color: var(--muted); font-size: 13px; margin-bottom: 24px; }

  .modal-actions { display: flex; gap: 10px; }
`;

/* ── Component ─────────────────────────────────────────── */
export default function QuizMaker() {
  const [quizzes, setQuizzes] = useState(() => loadQuizzes());
  const [screen, setScreen] = useState("home"); // home | editor | quiz
  const [editQuiz, setEditQuiz] = useState(null); // quiz being edited
  const [activeQuiz, setActiveQuiz] = useState(null); // quiz being played
  const [notif, setNotif] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // id to delete
  const notifTimer = useRef(null);

  /* Persist */
  useEffect(() => { saveQuizzes(quizzes); }, [quizzes]);

  const showNotif = (msg) => {
    setNotif(msg);
    clearTimeout(notifTimer.current);
    notifTimer.current = setTimeout(() => setNotif(null), 2200);
  };

  /* ── HOME ── */
  const goHome = () => { setScreen("home"); setEditQuiz(null); setActiveQuiz(null); };

  const createNew = () => {
    const q = { id: uid(), title: "", description: "", cards: [{ id: uid(), q: "", a: "" }] };
    setEditQuiz(q);
    setScreen("editor");
  };

  const openEdit = (quiz) => { setEditQuiz(JSON.parse(JSON.stringify(quiz))); setScreen("editor"); };

  const openQuiz = (quiz) => {
    const shuffled = [...quiz.cards].sort(() => Math.random() - 0.5);
    setTypedAnswer("");
    setAnswerState(null);
    setActiveQuiz({ ...quiz, cards: shuffled, index: 0, done: false, correct: 0 });
    setScreen("quiz");
  };

  const requestDelete = (id) => setConfirmDelete(id);

  const confirmDeleteQuiz = () => {
    setQuizzes(prev => prev.filter(q => q.id !== confirmDelete));
    setConfirmDelete(null);
    showNotif("Quiz usunięty");
  };

  /* ── EDITOR ── */
  const updateTitle = (v) => setEditQuiz(prev => ({ ...prev, title: v }));
  const updateDesc = (v) => setEditQuiz(prev => ({ ...prev, description: v }));

  const updateCard = (id, field, val) =>
    setEditQuiz(prev => ({ ...prev, cards: prev.cards.map(c => c.id === id ? { ...c, [field]: val } : c) }));

  const addCard = () =>
    setEditQuiz(prev => ({ ...prev, cards: [...prev.cards, { id: uid(), q: "", a: "" }] }));

  const removeCard = (id) =>
    setEditQuiz(prev => ({ ...prev, cards: prev.cards.filter(c => c.id !== id) }));

  const saveQuiz = () => {
    if (!editQuiz.title.trim()) { showNotif("Podaj tytuł quizu!"); return; }
    if (editQuiz.cards.some(c => !c.q.trim() || !c.a.trim())) { showNotif("Uzupełnij wszystkie karty!"); return; }
    setQuizzes(prev => {
      const exists = prev.find(q => q.id === editQuiz.id);
      if (exists) return prev.map(q => q.id === editQuiz.id ? editQuiz : q);
      return [...prev, editQuiz];
    });
    showNotif("✓ Zapisano!");
    goHome();
  };

  /* ── QUIZ PLAY ── */
  const [typedAnswer, setTypedAnswer] = useState("");
  const [answerState, setAnswerState] = useState(null); // null | 'correct' | 'wrong'
  const inputRef = useRef(null);

  // focus input when card changes
  useEffect(() => {
    if (screen === "quiz" && !activeQuiz?.done) {
      setTypedAnswer("");
      setAnswerState(null);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [activeQuiz?.index, screen]);

  const normalize = (s) => s.trim().toLowerCase().replace(/\s+/g, " ");

  const submitAnswer = useCallback(() => {
    if (!typedAnswer.trim() || answerState) return;
    const correct = normalize(typedAnswer) === normalize(activeQuiz.cards[activeQuiz.index].a);
    setAnswerState(correct ? "correct" : "wrong");
    setActiveQuiz(prev => ({ ...prev, correct: prev.correct + (correct ? 1 : 0) }));
  }, [typedAnswer, answerState, activeQuiz]);

  const next = useCallback(() => {
    if (!answerState) return;
    setActiveQuiz(prev => {
      const nextIndex = prev.index + 1;
      if (nextIndex >= prev.cards.length) return { ...prev, done: true };
      return { ...prev, index: nextIndex };
    });
  }, [answerState]);

  const restartQuiz = () => {
    const shuffled = [...activeQuiz.cards].sort(() => Math.random() - 0.5);
    setTypedAnswer("");
    setAnswerState(null);
    setActiveQuiz(prev => ({ ...prev, cards: shuffled, index: 0, done: false, correct: 0 }));
  };

  /* ── RENDER ── */
  return (
    <>
      <style>{GLOBAL_STYLE}</style>
      <div className="app-root">

        {/* HEADER */}
        <header className="header">
          <div className="logo" onClick={goHome}>Flash<span>Drill</span></div>
          {screen === "home" && (
            <div className="header-right">
              <button className="btn btn-primary" onClick={createNew}>+ Nowy Quiz</button>
            </div>
          )}
          {screen === "editor" && (
            <div className="header-right">
              <button className="btn btn-ghost" onClick={goHome}>↩ Powrót</button>
              <button className="btn btn-primary" onClick={saveQuiz}>Zapisz Quiz</button>
            </div>
          )}
          {screen === "quiz" && !activeQuiz?.done && (
            <div className="header-right">
              <button className="btn btn-ghost" onClick={goHome}>✕ Zakończ</button>
            </div>
          )}
        </header>

        {/* ── HOME ── */}
        {screen === "home" && (
          <main className="home">
            <div className="home-hero">
              <h2>Twój osobisty<br /><em>Quiz Maker</em></h2>
              <p>Twórz zestawy fiszek i ucz się efektywnie</p>
            </div>

            <div className="section-head">
              <span className="section-head-title">Twoje quizy ({quizzes.length})</span>
              <div className="section-head-line" />
            </div>

            <div className="quizzes-grid">
              {quizzes.length === 0 && (
                <div className="empty-state">
                  <div className="empty-icon">🃏</div>
                  <p>Brak quizów. Stwórz pierwszy!</p>
                </div>
              )}
              {quizzes.map((quiz, i) => (
                <div
                  key={quiz.id}
                  className="quiz-card"
                  style={{ animationDelay: `${i * 0.05}s` }}
                  onClick={() => openQuiz(quiz)}
                >
                  <div className="quiz-card-actions" onClick={e => e.stopPropagation()}>
                    <button className="icon-btn edit" title="Edytuj" onClick={() => openEdit(quiz)}>✎</button>
                    <button className="icon-btn delete" title="Usuń" onClick={() => requestDelete(quiz.id)}>✕</button>
                  </div>
                  <div className="quiz-card-title">{quiz.title || "Bez tytułu"}</div>
                  {quiz.description && (
                    <div className="quiz-card-meta" style={{ marginBottom: 6 }}>{quiz.description}</div>
                  )}
                  <div className="quiz-card-meta">{quiz.cards.length} fiszek</div>
                  <div className="quiz-card-tag">▶ Start</div>
                </div>
              ))}
            </div>
          </main>
        )}

        {/* ── EDITOR ── */}
        {screen === "editor" && editQuiz && (
          <main className="editor">
            <div className="editor-topbar">
              <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: 20 }}>
                {editQuiz.id && quizzes.find(q => q.id === editQuiz.id) ? "Edytuj quiz" : "Nowy quiz"}
              </h2>
            </div>

            <div className="editor-title-area">
              <div className="field">
                <label className="field-label">Tytuł quizu *</label>
                <input
                  className="field-input"
                  placeholder="np. Angielski — Czasy nieregularne"
                  value={editQuiz.title}
                  onChange={e => updateTitle(e.target.value)}
                />
              </div>
              <div className="field">
                <label className="field-label">Opis (opcjonalny)</label>
                <input
                  className="field-input"
                  placeholder="np. Formy nieregularne czasowników angielskich"
                  value={editQuiz.description}
                  onChange={e => updateDesc(e.target.value)}
                />
              </div>
            </div>

            <div className="section-head">
              <span className="section-head-title">Fiszki ({editQuiz.cards.length})</span>
              <div className="section-head-line" />
            </div>

            <div className="cards-section">
              {editQuiz.cards.map((card, i) => (
                <div key={card.id} className="card-row">
                  <div className="field">
                    <label className="field-label">#{i + 1} Pytanie</label>
                    <input
                      className="field-input"
                      placeholder="np. Być (inf / past / pp)"
                      value={card.q}
                      onChange={e => updateCard(card.id, "q", e.target.value)}
                      onKeyDown={e => e.key === "Tab" && e.preventDefault()}
                    />
                  </div>
                  <div className="field">
                    <label className="field-label">Odpowiedź</label>
                    <input
                      className="field-input"
                      placeholder="np. be / was, were / been"
                      value={card.a}
                      onChange={e => updateCard(card.id, "a", e.target.value)}
                    />
                  </div>
                  <button
                    className="card-delete-btn"
                    onClick={() => removeCard(card.id)}
                    title="Usuń kartę"
                    disabled={editQuiz.cards.length <= 1}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            <button className="add-card-btn" onClick={addCard}>
              + Dodaj fiszkę
            </button>

            <div style={{ marginTop: 24, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button className="btn btn-ghost" onClick={goHome}>Anuluj</button>
              <button className="btn btn-primary" onClick={saveQuiz}>Zapisz Quiz</button>
            </div>
          </main>
        )}

        {/* ── QUIZ PLAY ── */}
        {screen === "quiz" && activeQuiz && !activeQuiz.done && (
          <div className="quiz-view">
            <div className="quiz-view-header">
              <div className="quiz-view-title">{activeQuiz.title}</div>
              <div className="progress-bar-wrap">
                <div className="progress-bar-fill"
                  style={{ width: `${(activeQuiz.index / activeQuiz.cards.length) * 100}%` }} />
              </div>
              <div className="quiz-counter">{activeQuiz.index + 1} / {activeQuiz.cards.length}</div>
            </div>

            <div className="quiz-stage">
              <div className="flashcard-wrapper">
                {/* Question */}
                <div className="flashcard">
                  <div className="flashcard-label">Pytanie</div>
                  <div className="flashcard-question">{activeQuiz.cards[activeQuiz.index].q}</div>
                </div>

                {/* Answer input area */}
                <div className="flashcard-answer-area" style={{ padding: "24px 28px" }}>
                  <div className="answer-label">Twoja odpowiedź</div>
                  <div className="answer-input-wrap">
                    <input
                      ref={inputRef}
                      className={`answer-input${answerState ? ` ${answerState}` : ""}`}
                      placeholder="Wpisz odpowiedź i naciśnij Enter…"
                      value={typedAnswer}
                      disabled={!!answerState}
                      onChange={e => setTypedAnswer(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === "Enter") {
                          if (!answerState) submitAnswer();
                          else next();
                        }
                      }}
                    />

                    {/* Feedback */}
                    {answerState && (
                      <div className={`answer-feedback ${answerState}`}>
                        <div className="feedback-icon">{answerState === "correct" ? "✓" : "✗"}</div>
                        <div className="feedback-body">
                          <div className={`feedback-status ${answerState}`}>
                            {answerState === "correct" ? "Poprawnie!" : "Niepoprawnie"}
                          </div>
                          {answerState === "wrong" && (
                            <>
                              <div className="feedback-correct-answer">
                                {activeQuiz.cards[activeQuiz.index].a}
                              </div>
                              <div className="feedback-your-answer">
                                Twoja odpowiedź: {typedAnswer}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="quiz-controls">
                  <span className="quiz-hint">
                    {!answerState ? "Naciśnij Enter aby sprawdzić" : "Enter → następne pytanie"}
                  </span>
                  {!answerState ? (
                    <button
                      className="btn btn-primary"
                      disabled={!typedAnswer.trim()}
                      onClick={submitAnswer}
                    >
                      Sprawdź →
                    </button>
                  ) : (
                    <button className="btn btn-primary" onClick={next}>
                      {activeQuiz.index + 1 >= activeQuiz.cards.length ? "Wyniki →" : "Następne →"}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── RESULT ── */}
        {screen === "quiz" && activeQuiz?.done && (
          <div className="result-screen">
            <div className="result-card">
              <div className="result-big">{Math.round((activeQuiz.correct / activeQuiz.cards.length) * 100)}%</div>
              <div className="result-label">wynik</div>
              <div className="result-subtitle">
                {activeQuiz.correct === activeQuiz.cards.length ? "Perfekcyjnie! 🎉" :
                  activeQuiz.correct >= activeQuiz.cards.length * 0.7 ? "Świetna robota! 💪" :
                  activeQuiz.correct >= activeQuiz.cards.length * 0.4 ? "Niezły postęp! 📖" :
                  "Ćwicz dalej! 🔥"}
              </div>
              <div className="result-desc">
                {activeQuiz.correct} z {activeQuiz.cards.length} odpowiedzi poprawnych
              </div>
              <div className="result-actions">
                <button className="btn btn-ghost" onClick={goHome}>↩ Menu</button>
                <button className="btn btn-primary" onClick={restartQuiz}>↻ Powtórz</button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIFICATION */}
        {notif && <div className="notif">{notif}</div>}

        {/* CONFIRM DELETE MODAL */}
        {confirmDelete && (
          <div className="modal-overlay" onClick={() => setConfirmDelete(null)}>
            <div className="modal-box" onClick={e => e.stopPropagation()}>
              <div className="modal-title">Usuń quiz?</div>
              <div className="modal-desc">Ta operacja jest nieodwracalna. Quiz zostanie trwale usunięty.</div>
              <div className="modal-actions">
                <button className="btn btn-ghost" onClick={() => setConfirmDelete(null)}>Anuluj</button>
                <button className="btn btn-danger" onClick={confirmDeleteQuiz}>Usuń</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}