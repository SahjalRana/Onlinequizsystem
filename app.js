/* ══════════════════════════════════════════
   QuizMaster Pro — app.js
   Full offline SPA with localStorage persistence
══════════════════════════════════════════ */

'use strict';

// ─────────────────── SEED DATA ───────────────────
const SEED_QUESTIONS = [
  // General Knowledge
  {id:'q001',cat:'General Knowledge',type:'mcq',difficulty:'Easy',text:'What is the capital of France?',options:['London','Berlin','Paris','Rome'],correct:2,explanation:'Paris has been the capital of France since the 10th century.',image:null},
  {id:'q002',cat:'General Knowledge',type:'mcq',difficulty:'Easy',text:'How many continents are there on Earth?',options:['5','6','7','8'],correct:2,explanation:'The 7 continents are: Africa, Antarctica, Asia, Australia, Europe, North America, South America.',image:null},
  {id:'q003',cat:'General Knowledge',type:'truefalse',difficulty:'Easy',text:'The Great Wall of China is visible from space with the naked eye.',options:['True','False'],correct:1,explanation:'This is a common myth. The Great Wall is too narrow to be seen from space without optical aids.',image:null},
  {id:'q004',cat:'General Knowledge',type:'fill',difficulty:'Medium',text:'The chemical symbol for gold is ___.',options:[],correct:'Au',explanation:'Au comes from the Latin word "Aurum" meaning gold.',image:null},
  {id:'q005',cat:'General Knowledge',type:'mcq',difficulty:'Medium',text:'Which ocean is the largest on Earth?',options:['Atlantic','Indian','Arctic','Pacific'],correct:3,explanation:'The Pacific Ocean covers about 46% of Earth\'s water surface.',image:null},
  {id:'q006',cat:'General Knowledge',type:'mcq',difficulty:'Hard',text:'In which year did World War II end?',options:['1943','1944','1945','1946'],correct:2,explanation:'World War II ended in 1945 — in Europe on May 8 (V-E Day) and in the Pacific on September 2 (V-J Day).',image:null},
  // Science
  {id:'q007',cat:'Science',type:'mcq',difficulty:'Easy',text:'What is the speed of light in a vacuum?',options:['300,000 km/s','150,000 km/s','500,000 km/s','250,000 km/s'],correct:0,explanation:'The speed of light is approximately 299,792 km/s, often rounded to 300,000 km/s.',image:null},
  {id:'q008',cat:'Science',type:'truefalse',difficulty:'Easy',text:'DNA stands for Deoxyribonucleic Acid.',options:['True','False'],correct:0,explanation:'DNA (Deoxyribonucleic Acid) carries genetic information in all living organisms.',image:null},
  {id:'q009',cat:'Science',type:'mcq',difficulty:'Medium',text:'Which planet is known as the Red Planet?',options:['Venus','Jupiter','Mars','Saturn'],correct:2,explanation:'Mars appears red due to iron oxide (rust) on its surface.',image:null},
  {id:'q010',cat:'Science',type:'fill',difficulty:'Medium',text:'The powerhouse of the cell is the _____.',options:[],correct:'mitochondria',explanation:'Mitochondria produce ATP through cellular respiration, supplying energy to the cell.',image:null},
  {id:'q011',cat:'Science',type:'mcq',difficulty:'Hard',text:'What is the atomic number of carbon?',options:['4','6','8','12'],correct:1,explanation:'Carbon has 6 protons in its nucleus, giving it an atomic number of 6.',image:null},
  {id:'q012',cat:'Science',type:'mcq',difficulty:'Hard',text:'Which gas makes up the majority of Earth\'s atmosphere?',options:['Oxygen','Carbon Dioxide','Argon','Nitrogen'],correct:3,explanation:'Nitrogen makes up about 78% of Earth\'s atmosphere.',image:null},
  // History
  {id:'q013',cat:'History',type:'mcq',difficulty:'Easy',text:'Who was the first President of the United States?',options:['Abraham Lincoln','Thomas Jefferson','George Washington','John Adams'],correct:2,explanation:'George Washington served as the first President from 1789 to 1797.',image:null},
  {id:'q014',cat:'History',type:'truefalse',difficulty:'Easy',text:'The Titanic sank in 1912.',options:['True','False'],correct:0,explanation:'RMS Titanic sank on April 15, 1912 after hitting an iceberg.',image:null},
  {id:'q015',cat:'History',type:'mcq',difficulty:'Medium',text:'Which empire was the largest in history by land area?',options:['Roman Empire','British Empire','Ottoman Empire','Mongol Empire'],correct:1,explanation:'The British Empire was the largest, covering about 26% of the world\'s land area at its peak.',image:null},
  {id:'q016',cat:'History',type:'mcq',difficulty:'Hard',text:'In which year did the Berlin Wall fall?',options:['1987','1988','1989','1991'],correct:2,explanation:'The Berlin Wall fell on November 9, 1989, marking the end of the Cold War era.',image:null},
  // Current Affairs
  {id:'q017',cat:'Current Affairs',type:'mcq',difficulty:'Medium',text:'Which organization developed the COVID-19 vaccine "Covishield"?',options:['Pfizer','Oxford-AstraZeneca','Moderna','Johnson & Johnson'],correct:1,explanation:'Covishield was developed by Oxford University and manufactured by AstraZeneca / Serum Institute.',image:null},
  {id:'q018',cat:'Current Affairs',type:'truefalse',difficulty:'Easy',text:'Artificial Intelligence is being widely used in healthcare diagnosis.',options:['True','False'],correct:0,explanation:'AI tools are increasingly used to assist in medical imaging, diagnosis, and drug discovery.',image:null},
  {id:'q019',cat:'Current Affairs',type:'mcq',difficulty:'Medium',text:'Which country launched the world\'s first 6G experimental satellite?',options:['USA','South Korea','Japan','China'],correct:3,explanation:'China launched what it called a 6G experimental satellite in 2020.',image:null},
  {id:'q020',cat:'Current Affairs',type:'mcq',difficulty:'Hard',text:'What is the name of NASA\'s Mars rover launched in 2020?',options:['Curiosity','Opportunity','Perseverance','Spirit'],correct:2,explanation:'Perseverance was launched in July 2020 and landed on Mars in February 2021.',image:null},
  // Mathematics
  {id:'q021',cat:'Mathematics',type:'mcq',difficulty:'Easy',text:'What is 15% of 200?',options:['25','30','35','40'],correct:1,explanation:'15% of 200 = 0.15 × 200 = 30.',image:null},
  {id:'q022',cat:'Mathematics',type:'truefalse',difficulty:'Easy',text:'The value of π (pi) is exactly 3.14.',options:['True','False'],correct:1,explanation:'Pi is an irrational number: 3.14159265... It cannot be expressed exactly as a finite decimal.',image:null},
  {id:'q023',cat:'Mathematics',type:'fill',difficulty:'Medium',text:'The square root of 144 is ___.',options:[],correct:'12',explanation:'12 × 12 = 144, so √144 = 12.',image:null},
  {id:'q024',cat:'Mathematics',type:'mcq',difficulty:'Medium',text:'What is the sum of angles in a triangle?',options:['90°','180°','270°','360°'],correct:1,explanation:'The interior angles of any triangle always add up to 180 degrees.',image:null},
  {id:'q025',cat:'Mathematics',type:'mcq',difficulty:'Hard',text:'What is the derivative of sin(x)?',options:['cos(x)','-cos(x)','tan(x)','-sin(x)'],correct:0,explanation:'The derivative of sin(x) with respect to x is cos(x).',image:null},
];

const SEED_QUIZZES = [
  {id:'qz001',title:'GK Basics',category:'General Knowledge',difficulty:'Easy',timePerQ:20,questionIds:['q001','q002','q003','q005'],description:'Test your basic general knowledge!'},
  {id:'qz002',title:'Science Explorer',category:'Science',difficulty:'Medium',timePerQ:25,questionIds:['q007','q008','q009','q011','q012'],description:'Explore the world of science.'},
  {id:'qz003',title:'History Deep Dive',category:'History',difficulty:'Hard',timePerQ:30,questionIds:['q013','q014','q015','q016'],description:'How well do you know world history?'},
  {id:'qz004',title:'Maths Challenge',category:'Mathematics',difficulty:'Medium',timePerQ:30,questionIds:['q021','q022','q023','q024','q025'],description:'Put your maths skills to the test.'},
  {id:'qz005',title:'Current Affairs Quiz',category:'Current Affairs',difficulty:'Medium',timePerQ:25,questionIds:['q017','q018','q019','q020'],description:'Stay up to date with current events.'},
  {id:'qz006',title:'Mixed Mega Quiz',category:'General Knowledge',difficulty:'Hard',timePerQ:20,questionIds:['q001','q007','q013','q021','q018','q003'],description:'A mix of everything — are you ready?'},
];

const CATEGORIES = [
  {name:'General Knowledge', icon:'🌍', color:'#4f8ef7', desc:'Facts about the world'},
  {name:'Science',           icon:'🔬', color:'#3ecfb2', desc:'Explore science & nature'},
  {name:'History',           icon:'🏛️', color:'#e05c8a', desc:'Journey through time'},
  {name:'Current Affairs',   icon:'📰', color:'#f5a623', desc:'What\'s happening now'},
  {name:'Mathematics',       icon:'📐', color:'#48c78e', desc:'Numbers and logic'},
];

const ACHIEVEMENTS = [
  {id:'first',name:'First Quiz',icon:'🎯',desc:'Complete your first quiz'},
  {id:'perfect',name:'Perfect Score',icon:'💯',desc:'Score 100% on a quiz'},
  {id:'streak3',name:'On a Roll',icon:'🔥',desc:'Complete 3 quizzes'},
  {id:'speedster',name:'Speedster',icon:'⚡',desc:'Finish a quiz under 1 min'},
  {id:'scholar',name:'Scholar',icon:'📚',desc:'Complete 5 quizzes'},
  {id:'master',name:'Quiz Master',icon:'👑',desc:'Score 90%+ five times'},
];

// ─────────────────── STATE ───────────────────
let DB = { users: [], questions: [], quizzes: [], scores: [] };
let currentUser = null;
let quizSession = null;
let perfChart = null, catChart = null, adminAttemptsChart = null, adminScoresChart = null;

// ─────────────────── STORAGE ───────────────────
function saveDB() { localStorage.setItem('qmpro_db', JSON.stringify(DB)); }
function loadDB() {
  const raw = localStorage.getItem('qmpro_db');
  if (raw) {
    DB = JSON.parse(raw);
  } else {
    DB.questions = JSON.parse(JSON.stringify(SEED_QUESTIONS));
    DB.quizzes   = JSON.parse(JSON.stringify(SEED_QUIZZES));
    DB.users = [
      {id:'u_admin',name:'Admin',email:'admin@quiz.com',password:'admin123',role:'admin',joined:Date.now(),achievements:[]},
      {id:'u_demo', name:'Demo User',email:'user@quiz.com',password:'user123',role:'user',joined:Date.now(),achievements:[]},
    ];
    DB.scores = [];
    saveDB();
  }
  // Ensure admin account always exists
  if (!DB.users.find(u=>u.email==='admin@quiz.com')) {
    DB.users.unshift({id:'u_admin',name:'Admin',email:'admin@quiz.com',password:'admin123',role:'admin',joined:Date.now(),achievements:[]});
    saveDB();
  }
  // Ensure demo user always exists
  if (!DB.users.find(u=>u.email==='user@quiz.com')) {
    DB.users.push({id:'u_demo',name:'Demo User',email:'user@quiz.com',password:'user123',role:'user',joined:Date.now(),achievements:[]});
    saveDB();
  }
  const saved = localStorage.getItem('qmpro_session');
  if (saved) {
    currentUser = JSON.parse(saved);
    // Re-fetch from DB to get latest
    currentUser = DB.users.find(u => u.id === currentUser.id) || null;
    if (currentUser) showApp();
  }
}

// ─────────────────── AUTH ───────────────────
function switchAuth(mode) {
  document.querySelectorAll('.auth-tab').forEach((t,i) => t.classList.toggle('active', (mode==='login'?i===0:i===1)));
  document.getElementById('login-form').classList.toggle('active', mode==='login');
  document.getElementById('register-form').classList.toggle('active', mode==='register');
}

function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById('login-email').value.trim().toLowerCase();
  const pass  = document.getElementById('login-pass').value;
  const user  = DB.users.find(u => u.email === email && u.password === pass);
  if (!user) { document.getElementById('login-error').textContent = 'Invalid email or password.'; return; }
  document.getElementById('login-error').textContent = '';
  currentUser = user;
  localStorage.setItem('qmpro_session', JSON.stringify({id:user.id}));
  showApp();
}

function handleRegister(e) {
  e.preventDefault();
  const name  = document.getElementById('reg-name').value.trim();
  const email = document.getElementById('reg-email').value.trim().toLowerCase();
  const pass  = document.getElementById('reg-pass').value;
  if (pass.length < 6) { document.getElementById('reg-error').textContent = 'Password must be at least 6 characters.'; return; }
  if (DB.users.find(u => u.email === email)) { document.getElementById('reg-error').textContent = 'Email already registered.'; return; }
  const user = {id:'u_'+Date.now(),name,email,password:pass,role:'user',joined:Date.now(),achievements:[]};
  DB.users.push(user);
  saveDB();
  document.getElementById('reg-error').textContent = '';
  currentUser = user;
  localStorage.setItem('qmpro_session', JSON.stringify({id:user.id}));
  showApp();
}

function togglePass(id, btn) {
  const inp = document.getElementById(id);
  inp.type = inp.type === 'password' ? 'text' : 'password';
  btn.querySelector('i').className = inp.type === 'password' ? 'fa fa-eye' : 'fa fa-eye-slash';
}

function logout() {
  currentUser = null;
  localStorage.removeItem('qmpro_session');
  document.getElementById('auth-screen').classList.add('active');
  document.getElementById('app-screen').classList.remove('active');
  switchAuth('login');
}

// ─────────────────── APP SHELL ───────────────────
function showApp() {
  document.getElementById('auth-screen').classList.remove('active');
  document.getElementById('app-screen').classList.add('active');
  // sidebar user
  document.getElementById('sidebar-user').textContent = '👤 '+currentUser.name;
  document.getElementById('topbar-user').textContent = currentUser.name;
  // admin nav — always visible, role checked inside panel
  const adminItem = document.querySelector('.nav-item.admin-only');
  if (adminItem) adminItem.classList.remove('hidden');
  // bind nav
  document.querySelectorAll('.nav-item[data-page]').forEach(el => {
    el.addEventListener('click', e => { e.preventDefault(); showPage(el.dataset.page); });
  });
  showPage('dashboard');
}

function showPage(page) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const el = document.getElementById('page-'+page);
  if (el) el.classList.add('active');
  const nav = document.querySelector(`.nav-item[data-page="${page}"]`);
  if (nav) nav.classList.add('active');
  document.getElementById('topbar-title').textContent = {
    dashboard:'Dashboard', categories:'Categories', quizzes:'Quizzes',
    quiz:'Quiz', results:'Results', leaderboard:'Leaderboard',
    history:'History', profile:'Profile', admin:'Admin Panel'
  }[page] || 'QuizMaster';
  // Render pages
  if (page === 'dashboard')   renderDashboard();
  if (page === 'categories')  renderCategories();
  if (page === 'leaderboard') renderLeaderboard();
  if (page === 'history')     renderHistory();
  if (page === 'profile')     renderProfile();
  if (page === 'admin')       renderAdmin();
  // Close sidebar on mobile
  document.getElementById('sidebar').classList.remove('open');
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// ─────────────────── DASHBOARD ───────────────────
function renderDashboard() {
  const hour = new Date().getHours();
  const greet = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';
  document.getElementById('dash-greeting').textContent = `${greet}, ${currentUser.name.split(' ')[0]}!`;
  const myScores = DB.scores.filter(s => s.userId === currentUser.id);
  const avg = myScores.length ? Math.round(myScores.reduce((a,s)=>a+s.score,0)/myScores.length) : 0;
  const best = myScores.length ? Math.max(...myScores.map(s=>s.score)) : 0;
  document.getElementById('dash-stats').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:rgba(79,142,247,0.15)">🎯</div>
      <div><div class="stat-val">${myScores.length}</div><div class="stat-lbl">Quizzes Taken</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(245,166,35,0.15)">⭐</div>
      <div><div class="stat-val">${avg}%</div><div class="stat-lbl">Avg Score</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(72,199,142,0.15)">🏆</div>
      <div><div class="stat-val">${best}%</div><div class="stat-lbl">Best Score</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(224,92,138,0.15)">🎖️</div>
      <div><div class="stat-val">${(currentUser.achievements||[]).length}</div><div class="stat-lbl">Achievements</div></div></div>`;
  // Categories strip
  document.getElementById('dash-categories').innerHTML = CATEGORIES.map(c => {
    const count = DB.quizzes.filter(q=>q.category===c.name).length;
    return `<div class="cat-card" style="--cat-color:${c.color}" onclick="openCategory('${c.name}')">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${count} quiz${count!==1?'es':''}</div></div>`;
  }).join('');
  // Recent
  const recent = [...DB.scores].filter(s=>s.userId===currentUser.id).sort((a,b)=>b.date-a.date).slice(0,5);
  document.getElementById('dash-recent').innerHTML = recent.length
    ? recent.map(s => {
        const qz = DB.quizzes.find(q=>q.id===s.quizId)||{title:'?',category:'?'};
        return `<div class="history-item">
          <div><div class="history-title">${qz.title}</div>
          <div class="history-meta"><span>${qz.category}</span><span>${formatDate(s.date)}</span></div></div>
          <div><div class="history-score" style="color:${scoreColor(s.score)}">${s.score}%</div>
          <div class="history-grade">${gradeLabel(s.score)}</div></div></div>`;
      }).join('')
    : '<div class="card" style="text-align:center;padding:2rem;color:var(--text2)">No quizzes taken yet. <a href="#" onclick="showPage(\'categories\')" style="color:var(--accent)">Start one!</a></div>';
}

// ─────────────────── CATEGORIES ───────────────────
function renderCategories() {
  document.getElementById('cat-grid').innerHTML = CATEGORIES.map(c => {
    const quizzes = DB.quizzes.filter(q=>q.category===c.name);
    return `<div class="cat-card" style="--cat-color:${c.color}" onclick="openCategory('${c.name}')">
      <div class="cat-icon">${c.icon}</div>
      <div class="cat-name">${c.name}</div>
      <div class="cat-count">${c.desc}</div>
      <div style="margin-top:8px;font-size:0.78rem;color:var(--text3)">${quizzes.length} quiz${quizzes.length!==1?'es':''}</div></div>`;
  }).join('');
}

function openCategory(name) {
  const cat = CATEGORIES.find(c=>c.name===name);
  document.getElementById('quiz-browser-title').textContent = (cat?cat.icon+' ':'')+name;
  document.getElementById('quiz-browser-sub').textContent = 'Select a quiz to start';
  const quizzes = DB.quizzes.filter(q=>q.category===name);
  document.getElementById('quiz-list-grid').innerHTML = quizzes.length
    ? quizzes.map(quizCard).join('')
    : '<p style="color:var(--text2)">No quizzes in this category yet.</p>';
  showPage('quizzes');
}

function quizCard(q) {
  const myBest = DB.scores.filter(s=>s.userId===currentUser.id&&s.quizId===q.id);
  const best = myBest.length ? Math.max(...myBest.map(s=>s.score)) : null;
  return `<div class="quiz-card" onclick="startQuiz('${q.id}')">
    <div class="quiz-card-top">
      <div><div class="quiz-card-title">${q.title}</div>
      <div style="font-size:0.8rem;color:var(--text2)">${q.description||''}</div></div>
      <span class="diff-badge diff-${q.difficulty}">${q.difficulty}</span>
    </div>
    <div class="quiz-card-meta">
      <span><i class="fa fa-question-circle"></i> ${q.questionIds.length} Qs</span>
      <span><i class="fa fa-clock"></i> ${q.timePerQ}s each</span>
      ${best!==null?`<span style="color:${scoreColor(best)}"><i class="fa fa-star"></i> Best: ${best}%</span>`:''}
    </div></div>`;
}

// ─────────────────── QUIZ ENGINE ───────────────────
function startQuiz(id) {
  const quiz = DB.quizzes.find(q=>q.id===id);
  if (!quiz) return;
  // Get questions, shuffle
  let qs = quiz.questionIds.map(qid=>DB.questions.find(q=>q.id===qid)).filter(Boolean);
  qs = shuffle([...qs]);
  quizSession = {
    quizId: id, quiz, questions: qs,
    index: 0, answers: [], startTime: Date.now(), totalTime: 0,
    timerInterval: null, timeLeft: 0
  };
  showPage('quiz');
  renderQuestion();
}

function renderQuestion() {
  const s = quizSession;
  const q = s.questions[s.index];
  const total = s.questions.length;
  document.getElementById('qp-name').textContent = s.quiz.title;
  document.getElementById('qp-progress').textContent = `Question ${s.index+1} of ${total}`;
  document.getElementById('qp-bar').style.width = ((s.index/total)*100)+'%';
  document.getElementById('q-meta').innerHTML =
    `<span>${s.quiz.category}</span><span class="type-badge">${q.type.toUpperCase()}</span>
     <span class="diff-badge diff-${q.difficulty}">${q.difficulty}</span>`;
  document.getElementById('q-text').textContent = q.text;
  document.getElementById('q-feedback').style.display = 'none';
  document.getElementById('next-btn').style.display = 'none';
  // Image
  if (q.image) {
    document.getElementById('q-image').src = q.image;
    document.getElementById('q-image-wrap').style.display = 'block';
  } else { document.getElementById('q-image-wrap').style.display = 'none'; }
  // Options
  document.getElementById('q-options').innerHTML = '';
  document.getElementById('q-fill-wrap').style.display = 'none';
  if (q.type === 'fill') {
    document.getElementById('q-fill-wrap').style.display = 'block';
    document.getElementById('q-fill-input').value = '';
    document.getElementById('q-fill-input').focus();
    document.getElementById('q-fill-input').onkeydown = e => { if(e.key==='Enter') submitFill(); };
  } else {
    const opts = q.type==='truefalse' ? ['True','False'] : q.options;
    document.getElementById('q-options').innerHTML = opts.map((o,i)=>
      `<button class="opt-btn" id="opt-${i}" onclick="selectAnswer(${i})">
        <span class="opt-letter">${String.fromCharCode(65+i)}</span>${o}</button>`
    ).join('');
  }
  startTimer(s.quiz.timePerQ, q.type);
}

function startTimer(sec, qtype) {
  clearInterval(quizSession.timerInterval);
  quizSession.timeLeft = sec;
  quizSession.qStartTime = Date.now();
  const circumference = 125.7;
  updateTimerDisplay(sec, sec, circumference);
  quizSession.timerInterval = setInterval(() => {
    quizSession.timeLeft--;
    updateTimerDisplay(quizSession.timeLeft, sec, circumference);
    if (quizSession.timeLeft <= 0) {
      clearInterval(quizSession.timerInterval);
      timeUp(qtype);
    }
  }, 1000);
}

function updateTimerDisplay(left, total, circ) {
  const pct = left / total;
  document.getElementById('timer-text').textContent = left+'s';
  document.getElementById('ring-fg').style.strokeDashoffset = circ * (1-pct);
  document.getElementById('ring-fg').style.stroke =
    left <= 5 ? 'var(--red)' : left <= 10 ? 'var(--accent)' : 'var(--teal)';
}

function selectAnswer(i) {
  clearInterval(quizSession.timerInterval);
  const elapsed = Math.round((Date.now()-quizSession.qStartTime)/1000);
  quizSession.totalTime += elapsed;
  const q = quizSession.questions[quizSession.index];
  const correct = (q.type==='truefalse') ? i===q.correct : i===q.correct;
  quizSession.answers.push({selected:i, correct:q.correct, isCorrect:correct, time:elapsed});
  disableOptions();
  markOption(i, q.correct, q.type);
  showFeedback(correct, q.explanation, q.type, false);
}

function submitFill() {
  clearInterval(quizSession.timerInterval);
  const elapsed = Math.round((Date.now()-quizSession.qStartTime)/1000);
  quizSession.totalTime += elapsed;
  const q = quizSession.questions[quizSession.index];
  const val = document.getElementById('q-fill-input').value.trim().toLowerCase();
  const correct = val === String(q.correct).toLowerCase();
  quizSession.answers.push({selected:val, correct:q.correct, isCorrect:correct, time:elapsed});
  document.getElementById('q-fill-input').disabled = true;
  document.querySelector('#q-fill-wrap .btn-primary').disabled = true;
  showFeedback(correct, q.explanation, q.type, false, q.correct);
}

function timeUp(qtype) {
  quizSession.totalTime += quizSession.quiz.timePerQ;
  quizSession.answers.push({selected:null, correct:quizSession.questions[quizSession.index].correct, isCorrect:false, time:quizSession.quiz.timePerQ});
  disableOptions();
  if (qtype !== 'fill') {
    const q = quizSession.questions[quizSession.index];
    markOption(-1, q.type==='truefalse'?q.correct:q.correct, q.type);
  }
  showFeedback(false, quizSession.questions[quizSession.index].explanation, qtype, true);
}

function disableOptions() {
  document.querySelectorAll('.opt-btn').forEach(b => b.disabled = true);
}

function markOption(selected, correct, type) {
  const opts = document.querySelectorAll('.opt-btn');
  opts.forEach((b, i) => {
    if (i === correct) b.classList.add('correct');
    else if (i === selected && selected !== correct) b.classList.add('wrong');
  });
}

function showFeedback(correct, explanation, type, timeout, fillCorrect) {
  const fb = document.getElementById('q-feedback');
  fb.style.display = 'block';
  if (timeout) {
    fb.className = 'q-feedback timeout';
    fb.innerHTML = `⏱ Time's up! ${explanation?'<br><span style="opacity:0.8">'+explanation+'</span>':''}`;
  } else if (correct) {
    fb.className = 'q-feedback correct';
    fb.innerHTML = `✓ Correct! ${explanation?'<br><span style="opacity:0.8">'+explanation+'</span>':''}`;
  } else {
    fb.className = 'q-feedback wrong';
    const correctAns = type==='fill' ? `Correct answer: <strong>${fillCorrect}</strong>` : '';
    fb.innerHTML = `✗ Wrong. ${correctAns} ${explanation?'<br><span style="opacity:0.8">'+explanation+'</span>':''}`;
  }
  document.getElementById('next-btn').style.display = 'inline-flex';
}

function nextQuestion() {
  quizSession.index++;
  if (quizSession.index >= quizSession.questions.length) { endQuiz(); return; }
  renderQuestion();
}

function endQuiz() {
  clearInterval(quizSession.timerInterval);
  const s = quizSession;
  const correct = s.answers.filter(a=>a.isCorrect).length;
  const total = s.questions.length;
  const score = Math.round((correct/total)*100);
  const entry = {
    id: 'sc_'+Date.now(), userId: currentUser.id, quizId: s.quizId,
    score, correct, wrong: total-correct, total, time: s.totalTime,
    date: Date.now(), answers: s.answers
  };
  DB.scores.push(entry);
  checkAchievements(entry);
  saveDB();
  showResults(entry, s.quiz, s.questions);
}

function showResults(entry, quiz, questions) {
  showPage('results');
  const pct = entry.score;
  document.getElementById('res-pct').textContent = pct+'%';
  document.getElementById('res-grade').textContent = gradeLabel(pct);
  document.getElementById('res-title').textContent = quiz.title;
  document.getElementById('res-sub').textContent = gradeMessage(pct);
  document.getElementById('res-stats').innerHTML = `
    <div class="res-stat"><div class="res-stat-val" style="color:var(--green)">${entry.correct}</div><div class="res-stat-lbl">Correct</div></div>
    <div class="res-stat"><div class="res-stat-val" style="color:var(--red)">${entry.wrong}</div><div class="res-stat-lbl">Wrong</div></div>
    <div class="res-stat"><div class="res-stat-val">${entry.time}s</div><div class="res-stat-lbl">Time</div></div>
    <div class="res-stat"><div class="res-stat-val">${rankInQuiz(entry)}</div><div class="res-stat-lbl">Rank</div></div>`;
  // Ring animation
  setTimeout(() => {
    const circumference = 326.7;
    const offset = circumference * (1 - pct/100);
    const ring = document.getElementById('score-ring-fill');
    ring.style.strokeDashoffset = offset;
    ring.style.stroke = scoreColor(pct);
  }, 100);
  // Review
  document.getElementById('answer-review-list').innerHTML = questions.map((q,i) => {
    const a = entry.answers[i] || {};
    const correct = a.isCorrect;
    let userAns = '', correctAns = '';
    if (q.type === 'fill') {
      userAns = a.selected || '(no answer)';
      correctAns = q.correct;
    } else {
      const opts = q.type==='truefalse'?['True','False']:q.options;
      userAns = a.selected !== null && a.selected !== undefined ? opts[a.selected]||'?' : 'No answer';
      correctAns = opts[q.correct];
    }
    return `<div class="review-item">
      <div class="review-item-header">
        <div class="review-q">Q${i+1}. ${q.text}</div>
        <span class="badge ${correct?'badge-new':''}` +
      (correct ? '' : '" style="background:rgba(241,70,104,0.15);color:var(--red)') + `">${correct?'✓ Correct':'✗ Wrong'}</span>
      </div>
      <div class="review-answer">Your answer: <strong style="color:${correct?'var(--green)':'var(--red)'}">${userAns}</strong>
        ${!correct?` &nbsp;|&nbsp; Correct: <strong style="color:var(--green)">${correctAns}</strong>`:''}</div>
      ${q.explanation?`<div class="review-explanation">💡 ${q.explanation}</div>`:''}
    </div>`;
  }).join('');
  if (pct === 100) launchConfetti();
}

function rankInQuiz(entry) {
  const all = DB.scores.filter(s=>s.quizId===entry.quizId).sort((a,b)=>b.score-a.score||a.time-b.time);
  const rank = all.findIndex(s=>s.id===entry.id)+1;
  return rank ? '#'+rank : '—';
}

function confirmQuit() {
  confirm2('Are you sure you want to quit this quiz? Your progress will be lost.', () => {
    clearInterval(quizSession?.timerInterval);
    quizSession = null;
    showPage('categories');
  });
}

function retryQuiz() {
  if (quizSession?.quizId) startQuiz(quizSession.quizId);
  else showPage('categories');
}

// ─────────────────── LEADERBOARD ───────────────────
function renderLeaderboard() {
  // Populate filters
  const catSel = document.getElementById('lb-cat-filter');
  catSel.innerHTML = '<option value="all">All Categories</option>' +
    CATEGORIES.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
  updateLbQuizFilter();
  renderLbTable();
}

function updateLbQuizFilter() {
  const cat = document.getElementById('lb-cat-filter').value;
  const quizzes = cat==='all' ? DB.quizzes : DB.quizzes.filter(q=>q.category===cat);
  document.getElementById('lb-quiz-filter').innerHTML =
    '<option value="all">All Quizzes</option>' +
    quizzes.map(q=>`<option value="${q.id}">${q.title}</option>`).join('');
  renderLbTable();
}

function renderLbTable() {
  const cat = document.getElementById('lb-cat-filter')?.value || 'all';
  const qzId = document.getElementById('lb-quiz-filter')?.value || 'all';
  let scores = [...DB.scores];
  if (qzId !== 'all') scores = scores.filter(s=>s.quizId===qzId);
  else if (cat !== 'all') {
    const qids = DB.quizzes.filter(q=>q.category===cat).map(q=>q.id);
    scores = scores.filter(s=>qids.includes(s.quizId));
  }
  // Best per user per quiz
  const best = {};
  scores.forEach(s => {
    const key = s.userId+'_'+s.quizId;
    if (!best[key] || s.score > best[key].score) best[key] = s;
  });
  let rows = Object.values(best).sort((a,b)=>b.score-a.score||a.time-b.time).slice(0,20);
  // Podium
  const podium = rows.slice(0,3);
  const podiumOrder = [1,0,2]; // 2nd, 1st, 3rd visual order
  document.getElementById('lb-podium').innerHTML = podiumOrder
    .filter(i=>podium[i])
    .map(i => {
      const s = podium[i]; const user = DB.users.find(u=>u.id===s.userId)||{name:'?'};
      const qz = DB.quizzes.find(q=>q.id===s.quizId)||{title:'?'};
      return `<div class="podium-block p${i+1}">
        <div class="podium-avatar">${user.name[0].toUpperCase()}</div>
        <div class="podium-name">${user.name}</div>
        <div class="podium-score">${s.score}% · ${qz.title}</div>
        <div class="podium-stand">${['🥇','🥈','🥉'][i]}</div></div>`;
    }).join('');
  document.getElementById('lb-table').innerHTML = rows.slice(3).map((s,idx) => {
    const user = DB.users.find(u=>u.id===s.userId)||{name:'?'};
    const qz = DB.quizzes.find(q=>q.id===s.quizId)||{title:'?'};
    return `<div class="lb-row">
      <div class="lb-rank">${idx+4}</div>
      <div class="lb-player">${user.name}<div style="font-size:0.72rem;color:var(--text3)">${qz.title}</div></div>
      <div class="lb-score">${s.score}%</div>
      <div class="lb-correct">${s.correct}/${s.total}</div>
      <div class="lb-time">${s.time}s</div></div>`;
  }).join('') || (rows.length <= 3 ? '' : '<div style="text-align:center;color:var(--text2);padding:1rem">No more entries</div>');
}

// ─────────────────── HISTORY ───────────────────
function renderHistory() {
  const scores = DB.scores.filter(s=>s.userId===currentUser.id).sort((a,b)=>b.date-a.date);
  document.getElementById('history-list').innerHTML = scores.length
    ? scores.map(s => {
        const qz = DB.quizzes.find(q=>q.id===s.quizId)||{title:'Deleted Quiz',category:'?'};
        return `<div class="history-item">
          <div><div class="history-title">${qz.title}</div>
          <div class="history-meta">
            <span><i class="fa fa-th-large"></i> ${qz.category}</span>
            <span><i class="fa fa-check"></i> ${s.correct}/${s.total} correct</span>
            <span><i class="fa fa-clock"></i> ${s.time}s</span>
            <span><i class="fa fa-calendar"></i> ${formatDate(s.date)}</span>
          </div></div>
          <div><div class="history-score" style="color:${scoreColor(s.score)}">${s.score}%</div>
          <div class="history-grade">${gradeLabel(s.score)}</div></div></div>`;
      }).join('')
    : '<div class="card" style="text-align:center;padding:2rem;color:var(--text2)">No quiz history yet.</div>';
}

// ─────────────────── PROFILE ───────────────────
function renderProfile() {
  const myScores = DB.scores.filter(s=>s.userId===currentUser.id).sort((a,b)=>a.date-b.date);
  const avg = myScores.length ? Math.round(myScores.reduce((a,s)=>a+s.score,0)/myScores.length) : 0;
  document.getElementById('profile-hero').innerHTML = `
    <div class="profile-avatar">${currentUser.name[0].toUpperCase()}</div>
    <div>
      <div class="profile-name">${currentUser.name}</div>
      <div class="profile-email">${currentUser.email}</div>
      <div class="profile-badges">
        <span class="profile-badge">${currentUser.role==='admin'?'⚡ Admin':'🎓 Learner'}</span>
        <span class="profile-badge">📊 Avg: ${avg}%</span>
        <span class="profile-badge">🎯 ${myScores.length} quizzes</span>
      </div>
    </div>`;
  document.getElementById('edit-name').value = currentUser.name;
  document.getElementById('edit-pass').value = '';
  // Charts
  renderPerfChart(myScores);
  renderCatChart(myScores);
  // Achievements
  const unlocked = currentUser.achievements || [];
  document.getElementById('achievements-grid').innerHTML = ACHIEVEMENTS.map(a =>
    `<div class="achievement ${unlocked.includes(a.id)?'unlocked':''}">
      <div class="achievement-icon">${a.icon}</div>
      <div class="achievement-name">${a.name}</div>
      <div style="font-size:0.68rem;color:var(--text3);margin-top:3px">${a.desc}</div></div>`
  ).join('');
}

function renderPerfChart(scores) {
  const ctx = document.getElementById('perf-chart').getContext('2d');
  if (perfChart) perfChart.destroy();
  const last10 = scores.slice(-10);
  perfChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: last10.map((_,i)=>'Quiz '+(i+1)),
      datasets: [{
        label: 'Score %', data: last10.map(s=>s.score),
        borderColor: '#f5a623', backgroundColor: 'rgba(245,166,35,0.12)',
        fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#f5a623'
      }]
    },
    options: chartOpts('Performance Over Time', 0, 100)
  });
}

function renderCatChart(scores) {
  const ctx = document.getElementById('cat-chart').getContext('2d');
  if (catChart) catChart.destroy();
  const bycat = {};
  scores.forEach(s => {
    const qz = DB.quizzes.find(q=>q.id===s.quizId);
    if (!qz) return;
    if (!bycat[qz.category]) bycat[qz.category] = [];
    bycat[qz.category].push(s.score);
  });
  const cats = Object.keys(bycat);
  const avgs = cats.map(c=>Math.round(bycat[c].reduce((a,v)=>a+v,0)/bycat[c].length));
  const colors = ['#4f8ef7','#3ecfb2','#e05c8a','#f5a623','#48c78e'];
  catChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: cats,
      datasets: [{ label: 'Avg Score %', data: avgs, backgroundColor: colors.slice(0,cats.length), borderRadius: 6 }]
    },
    options: chartOpts('Score by Category', 0, 100)
  });
}

function chartOpts(title, ymin, ymax) {
  return {
    responsive: true, maintainAspectRatio: true,
    plugins: { legend: { display: false }, title: { display: false } },
    scales: {
      y: { min:ymin, max:ymax, grid:{color:'rgba(255,255,255,0.05)'}, ticks:{color:'#9098c0',font:{size:11}} },
      x: { grid:{display:false}, ticks:{color:'#9098c0',font:{size:11}} }
    }
  };
}

function saveProfile() {
  const name = document.getElementById('edit-name').value.trim();
  const pass = document.getElementById('edit-pass').value;
  if (!name) { showToast('Name cannot be empty','error'); return; }
  const idx = DB.users.findIndex(u=>u.id===currentUser.id);
  if (idx===-1) return;
  DB.users[idx].name = name;
  if (pass) { if (pass.length<6) { showToast('Password too short','error'); return; } DB.users[idx].password = pass; }
  currentUser = DB.users[idx];
  saveDB();
  localStorage.setItem('qmpro_session', JSON.stringify({id:currentUser.id}));
  document.getElementById('sidebar-user').textContent = '👤 '+currentUser.name;
  document.getElementById('topbar-user').textContent = currentUser.name;
  document.getElementById('profile-msg').textContent = '✓ Profile updated!';
  setTimeout(()=>document.getElementById('profile-msg').textContent='', 2500);
  renderProfile();
  showToast('Profile updated!','success');
}

// ─────────────────── ACHIEVEMENTS ───────────────────
function checkAchievements(entry) {
  const myScores = DB.scores.filter(s=>s.userId===currentUser.id);
  const unlock = id => {
    if (!(currentUser.achievements||[]).includes(id)) {
      currentUser.achievements = [...(currentUser.achievements||[]), id];
      const idx = DB.users.findIndex(u=>u.id===currentUser.id);
      if (idx!==-1) DB.users[idx].achievements = currentUser.achievements;
      const ach = ACHIEVEMENTS.find(a=>a.id===id);
      if (ach) showToast(`🏆 Achievement unlocked: ${ach.name}`, 'info');
    }
  };
  if (myScores.length >= 1) unlock('first');
  if (entry.score === 100) unlock('perfect');
  if (myScores.length >= 3) unlock('streak3');
  if (myScores.length >= 5) unlock('scholar');
  if (entry.time < 60) unlock('speedster');
  const highScores = myScores.filter(s=>s.score>=90);
  if (highScores.length >= 5) unlock('master');
}

// ─────────────────── ADMIN ───────────────────
function renderAdmin() {
  // Show admin badge on panel header
  const adminBadge = document.getElementById('admin-role-badge');
  if (adminBadge) {
    adminBadge.textContent = currentUser.role === 'admin' ? '⚡ Full Access' : '👁 View Only';
    adminBadge.style.background = currentUser.role === 'admin' ? 'rgba(139,92,246,0.2)' : 'rgba(245,158,11,0.15)';
    adminBadge.style.color = currentUser.role === 'admin' ? '#c4b5fd' : '#fbbf24';
  }
  renderAdminQuestions();
  renderAdminQuizzes();
  renderAdminUsers();
  renderAdminStats();
  populateAdminFilters();
}

function adminTab(name, btn) {
  document.querySelectorAll('.admin-tab').forEach(t=>t.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('.admin-panel').forEach(p=>p.classList.remove('active'));
  document.getElementById('admin-'+name).classList.add('active');
}

function populateAdminFilters() {
  const catSel = document.getElementById('aq-cat-filter');
  if (catSel) catSel.innerHTML = '<option value="all">All Categories</option>'+
    CATEGORIES.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
}

function renderAdminQuestions() {
  const catF = document.getElementById('aq-cat-filter')?.value || 'all';
  const typeF = document.getElementById('aq-type-filter')?.value || 'all';
  let qs = DB.questions;
  if (catF !== 'all') qs = qs.filter(q=>q.cat===catF);
  if (typeF !== 'all') qs = qs.filter(q=>q.type===typeF);
  document.getElementById('admin-q-list').innerHTML = qs.map(q =>
    `<div class="admin-q-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${q.text}</div>
        <div class="admin-item-meta">
          <span class="type-badge">${q.type}</span>
          <span class="diff-badge diff-${q.difficulty}">${q.difficulty}</span>
          <span style="margin-left:4px">${q.cat}</span>
        </div>
      </div>
      <div class="admin-item-actions">
        <button class="icon-btn" onclick="openQuestionModal('${q.id}')"><i class="fa fa-edit"></i></button>
        <button class="icon-btn del" onclick="deleteQuestion('${q.id}')"><i class="fa fa-trash"></i></button>
      </div></div>`
  ).join('') || '<div style="color:var(--text2);padding:1rem">No questions found.</div>';
}

function renderAdminQuizzes() {
  document.getElementById('admin-quiz-list').innerHTML = DB.quizzes.map(q =>
    `<div class="admin-quiz-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${q.title}</div>
        <div class="admin-item-meta">${q.category} · ${q.questionIds.length} questions · <span class="diff-badge diff-${q.difficulty}">${q.difficulty}</span></div>
      </div>
      <div class="admin-item-actions">
        <button class="icon-btn" onclick="openQuizModal('${q.id}')"><i class="fa fa-edit"></i></button>
        <button class="icon-btn del" onclick="deleteQuiz('${q.id}')"><i class="fa fa-trash"></i></button>
      </div></div>`
  ).join('') || '<div style="color:var(--text2);padding:1rem">No quizzes yet.</div>';
}

function renderAdminUsers() {
  document.getElementById('admin-user-list').innerHTML = DB.users.map(u =>
    `<div class="admin-user-item">
      <div class="admin-item-info">
        <div class="admin-item-title">${u.name} ${u.role==='admin'?'<span class="badge badge-hot">Admin</span>':''}</div>
        <div class="admin-item-meta">${u.email} · Joined ${formatDate(u.joined)} · ${DB.scores.filter(s=>s.userId===u.id).length} quizzes taken</div>
      </div>
      <div class="admin-item-actions">
        ${currentUser.role==='admin'&&u.role!=='admin'?`<button class="icon-btn" onclick="promoteUser('${u.id}')" title="Make Admin"><i class="fa fa-user-shield"></i></button>`:''}
        ${currentUser.role==='admin'&&u.id!==currentUser.id?`<button class="icon-btn del" onclick="deleteUser('${u.id}')"><i class="fa fa-trash"></i></button>`:''}
      </div>
    </div>`
  ).join('');
}

function renderAdminStats() {
  const totalAttempts = DB.scores.length;
  const avgScore = totalAttempts ? Math.round(DB.scores.reduce((a,s)=>a+s.score,0)/totalAttempts) : 0;
  document.getElementById('admin-stats-grid').innerHTML = `
    <div class="stat-card"><div class="stat-icon" style="background:rgba(79,142,247,0.15)">👥</div>
      <div><div class="stat-val">${DB.users.length}</div><div class="stat-lbl">Total Users</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(72,199,142,0.15)">📝</div>
      <div><div class="stat-val">${DB.quizzes.length}</div><div class="stat-lbl">Quizzes</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(245,166,35,0.15)">🎯</div>
      <div><div class="stat-val">${totalAttempts}</div><div class="stat-lbl">Attempts</div></div></div>
    <div class="stat-card"><div class="stat-icon" style="background:rgba(224,92,138,0.15)">📊</div>
      <div><div class="stat-val">${avgScore}%</div><div class="stat-lbl">Avg Score</div></div></div>`;
  // Admin charts
  setTimeout(() => {
    renderAdminAttemptsChart();
    renderAdminScoresChart();
  }, 100);
}

function renderAdminAttemptsChart() {
  const ctx = document.getElementById('admin-attempts-chart');
  if (!ctx) return;
  if (adminAttemptsChart) adminAttemptsChart.destroy();
  const data = DB.quizzes.map(q=>({name:q.title, count:DB.scores.filter(s=>s.quizId===q.id).length}));
  adminAttemptsChart = new Chart(ctx.getContext('2d'), {
    type:'bar',
    data:{labels:data.map(d=>d.name),datasets:[{label:'Attempts',data:data.map(d=>d.count),backgroundColor:'#4f8ef7',borderRadius:6}]},
    options: chartOpts('',0,null)
  });
}

function renderAdminScoresChart() {
  const ctx = document.getElementById('admin-scores-chart');
  if (!ctx) return;
  if (adminScoresChart) adminScoresChart.destroy();
  const buckets = [0,0,0,0,0]; // 0-20,21-40,41-60,61-80,81-100
  DB.scores.forEach(s => { buckets[Math.min(4,Math.floor(s.score/21))]++; });
  adminScoresChart = new Chart(ctx.getContext('2d'), {
    type:'doughnut',
    data:{
      labels:['0-20%','21-40%','41-60%','61-80%','81-100%'],
      datasets:[{data:buckets, backgroundColor:['#f14668','#f5a623','#4f8ef7','#3ecfb2','#48c78e'], borderWidth:0}]
    },
    options:{responsive:true,maintainAspectRatio:true,
      plugins:{legend:{labels:{color:'#9098c0',font:{size:11}}}}}
  });
}

// ─────────────────── ADMIN MODALS ───────────────────
function openQuestionModal(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required to add/edit questions','error');return;}
  const q = id ? DB.questions.find(x=>x.id===id) : null;
  const isEdit = !!q;
  openModal(isEdit ? 'Edit Question' : 'Add New Question', buildQuestionForm(q));
}

function buildQuestionForm(q) {
  const cats = CATEGORIES.map(c=>`<option value="${c.name}" ${q&&q.cat===c.name?'selected':''}>${c.name}</option>`).join('');
  const types = ['mcq','truefalse','fill','image'].map(t=>`<option value="${t}" ${q&&q.type===t?'selected':''}>${t}</option>`).join('');
  const diffs = ['Easy','Medium','Hard'].map(d=>`<option value="${d}" ${q&&q.difficulty===d?'selected':''}>${d}</option>`).join('');
  return `
    <div class="field-group"><label>Category</label><select id="mq-cat">${cats}</select></div>
    <div class="field-group"><label>Type</label><select id="mq-type" onchange="updateQFormType()">${types}</select></div>
    <div class="field-group"><label>Difficulty</label><select id="mq-diff">${diffs}</select></div>
    <div class="field-group"><label>Question text</label>
      <textarea id="mq-text" placeholder="Enter question...">${q?q.text:''}</textarea></div>
    <div id="mq-options-section">${buildOptionsSection(q)}</div>
    <div class="field-group"><label>Explanation (optional)</label>
      <textarea id="mq-expl" placeholder="Explain the correct answer...">${q?q.explanation||'':''}</textarea></div>
    <input type="hidden" id="mq-id" value="${q?q.id:''}">
    <div style="display:flex;gap:10px;margin-top:1.5rem;justify-content:flex-end">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveQuestion()">Save Question</button>
    </div>`;
}

function buildOptionsSection(q) {
  const type = q ? q.type : 'mcq';
  if (type === 'truefalse') {
    const c = q ? q.correct : 0;
    return `<div class="field-group"><label>Correct answer</label>
      <select id="mq-tf-correct">
        <option value="0" ${c===0?'selected':''}>True</option>
        <option value="1" ${c===1?'selected':''}>False</option>
      </select></div>`;
  }
  if (type === 'fill') {
    return `<div class="field-group"><label>Correct answer</label>
      <div class="input-wrap"><input type="text" id="mq-fill-ans" value="${q?q.correct||'':''}" placeholder="Exact answer (case-insensitive)"></div></div>`;
  }
  // MCQ or image
  const opts = q ? q.options : ['','','',''];
  const corr = q ? q.correct : 0;
  return `<div class="field-group"><label>Options (select correct answer)</label>
    ${opts.map((o,i)=>`<div class="opt-input-row">
      <input type="radio" name="mq-correct" value="${i}" ${corr===i?'checked':''}>
      <span class="correct-label">${String.fromCharCode(65+i)}</span>
      <input type="text" id="mq-opt-${i}" value="${o}" placeholder="Option ${String.fromCharCode(65+i)}">
    </div>`).join('')}`;
}

function updateQFormType() {
  const q = null;
  document.getElementById('mq-options-section').innerHTML = buildOptionsSection({type:document.getElementById('mq-type').value, options:['','','',''], correct:0});
}

function saveQuestion() {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  const id = document.getElementById('mq-id').value;
  const type = document.getElementById('mq-type').value;
  const text = document.getElementById('mq-text').value.trim();
  if (!text) { showToast('Question text required','error'); return; }
  let correct, options = [];
  if (type === 'truefalse') { correct = parseInt(document.getElementById('mq-tf-correct').value); }
  else if (type === 'fill') { correct = document.getElementById('mq-fill-ans').value.trim(); if (!correct) { showToast('Correct answer required','error'); return; } }
  else {
    options = [0,1,2,3].map(i=>document.getElementById('mq-opt-'+i).value.trim());
    const radio = document.querySelector('input[name=mq-correct]:checked');
    correct = radio ? parseInt(radio.value) : 0;
    if (options.filter(o=>o).length < 2) { showToast('At least 2 options required','error'); return; }
  }
  const qData = {
    id: id || 'q'+Date.now(),
    cat: document.getElementById('mq-cat').value,
    type, difficulty: document.getElementById('mq-diff').value,
    text, options, correct, explanation: document.getElementById('mq-expl').value.trim(), image: null
  };
  if (id) { const idx=DB.questions.findIndex(q=>q.id===id); if(idx!==-1) DB.questions[idx]=qData; }
  else DB.questions.push(qData);
  saveDB();
  closeModal();
  renderAdminQuestions();
  showToast(id?'Question updated!':'Question added!','success');
}

function deleteQuestion(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  confirm2('Delete this question?', () => {
    DB.questions = DB.questions.filter(q=>q.id!==id);
    DB.quizzes.forEach(qz=>{ qz.questionIds=qz.questionIds.filter(q=>q!==id); });
    saveDB(); renderAdminQuestions(); showToast('Question deleted','info');
  });
}

function openQuizModal(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required to add/edit quizzes','error');return;}
  const qz = id ? DB.quizzes.find(x=>x.id===id) : null;
  openModal(qz?'Edit Quiz':'Create New Quiz', buildQuizForm(qz));
}

function buildQuizForm(qz) {
  const cats = CATEGORIES.map(c=>`<option value="${c.name}" ${qz&&qz.category===c.name?'selected':''}>${c.name}</option>`).join('');
  const diffs = ['Easy','Medium','Hard'].map(d=>`<option value="${d}" ${qz&&qz.difficulty===d?'selected':''}>${d}</option>`).join('');
  const allQs = DB.questions;
  const checkedIds = qz ? qz.questionIds : [];
  return `
    <div class="field-group"><label>Quiz Title</label>
      <div class="input-wrap"><input type="text" id="mqz-title" value="${qz?qz.title:''}" placeholder="Quiz title"></div></div>
    <div class="field-group"><label>Description</label>
      <textarea id="mqz-desc" placeholder="Short description...">${qz?qz.description||'':''}</textarea></div>
    <div class="field-group"><label>Category</label><select id="mqz-cat">${cats}</select></div>
    <div class="field-group"><label>Difficulty</label><select id="mqz-diff">${diffs}</select></div>
    <div class="field-group"><label>Time per question (seconds)</label>
      <div class="input-wrap"><input type="number" id="mqz-time" value="${qz?qz.timePerQ:20}" min="5" max="120"></div></div>
    <div class="field-group"><label>Select Questions (${allQs.length} available)</label>
      <div style="max-height:220px;overflow-y:auto;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:8px">
        ${allQs.map(q=>`<label style="display:flex;align-items:center;gap:8px;padding:6px 4px;cursor:pointer;font-size:0.85rem">
          <input type="checkbox" value="${q.id}" ${checkedIds.includes(q.id)?'checked':''} style="accent-color:var(--accent)">
          <span>${q.text.slice(0,60)}${q.text.length>60?'...':''}</span>
          <span class="type-badge" style="flex-shrink:0">${q.type}</span>
        </label>`).join('')}
      </div></div>
    <input type="hidden" id="mqz-id" value="${qz?qz.id:''}">
    <div style="display:flex;gap:10px;margin-top:1.5rem;justify-content:flex-end">
      <button class="btn-ghost" onclick="closeModal()">Cancel</button>
      <button class="btn-primary" onclick="saveQuiz()">Save Quiz</button>
    </div>`;
}

function saveQuiz() {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  const id = document.getElementById('mqz-id').value;
  const title = document.getElementById('mqz-title').value.trim();
  if (!title) { showToast('Title required','error'); return; }
  const questionIds = [...document.querySelectorAll('#modal-body input[type=checkbox]:checked')].map(c=>c.value);
  if (!questionIds.length) { showToast('Select at least one question','error'); return; }
  const qzData = {
    id: id||'qz'+Date.now(), title, description: document.getElementById('mqz-desc').value.trim(),
    category: document.getElementById('mqz-cat').value, difficulty: document.getElementById('mqz-diff').value,
    timePerQ: parseInt(document.getElementById('mqz-time').value)||20, questionIds
  };
  if (id) { const idx=DB.quizzes.findIndex(q=>q.id===id); if(idx!==-1) DB.quizzes[idx]=qzData; }
  else DB.quizzes.push(qzData);
  saveDB(); closeModal(); renderAdminQuizzes();
  showToast(id?'Quiz updated!':'Quiz created!','success');
}

function deleteQuiz(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  confirm2('Delete this quiz? All scores will also be removed.', () => {
    DB.quizzes = DB.quizzes.filter(q=>q.id!==id);
    DB.scores = DB.scores.filter(s=>s.quizId!==id);
    saveDB(); renderAdminQuizzes(); renderAdminStats();
    showToast('Quiz deleted','info');
  });
}

function promoteUser(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  const idx = DB.users.findIndex(u=>u.id===id);
  if(idx===-1) return;
  DB.users[idx].role = DB.users[idx].role==='admin' ? 'user' : 'admin';
  saveDB(); renderAdminUsers();
  showToast('User role updated!','success');
}

function deleteUser(id) {
  if(currentUser.role!=='admin'){showToast('Admin access required','error');return;}
  confirm2('Delete this user? All their scores will also be removed.', () => {
    DB.users = DB.users.filter(u=>u.id!==id);
    DB.scores = DB.scores.filter(s=>s.userId!==id);
    saveDB(); renderAdminUsers(); renderAdminStats();
    showToast('User deleted','info');
  });
}

// ─────────────────── ADMIN UTILS ───────────────────
function resetAdminAccount() {
  // Force-reset admin credentials (emergency use)
  const idx = DB.users.findIndex(u=>u.email==='admin@quiz.com');
  if(idx===-1) {
    DB.users.unshift({id:'u_admin',name:'Admin',email:'admin@quiz.com',password:'admin123',role:'admin',joined:Date.now(),achievements:[]});
  } else {
    DB.users[idx].password = 'admin123';
    DB.users[idx].role = 'admin';
  }
  saveDB();
  showToast('Admin account reset! Email: admin@quiz.com | Pass: admin123','info');
}

// ─────────────────── MODAL ───────────────────
function openModal(title, html) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-body').innerHTML = html;
  document.getElementById('modal-overlay').classList.add('open');
}
function closeModal(e) {
  if (e && e.target !== document.getElementById('modal-overlay')) return;
  document.getElementById('modal-overlay').classList.remove('open');
}

let confirmCallback = null;
function confirm2(msg, cb) {
  confirmCallback = cb;
  document.getElementById('confirm-body').innerHTML = `<p style="font-size:0.95rem;margin-bottom:1rem">${msg}</p>`;
  document.getElementById('confirm-ok').onclick = () => { closeConfirm(); if(confirmCallback) confirmCallback(); };
  document.getElementById('confirm-overlay').classList.add('open');
}
function closeConfirm(e) {
  if (e && e.target !== document.getElementById('confirm-overlay')) return;
  document.getElementById('confirm-overlay').classList.remove('open');
}

// ─────────────────── TOAST ───────────────────
function showToast(msg, type='info') {
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<span>${msg}</span>`;
  document.getElementById('toast-container').appendChild(t);
  setTimeout(()=>{ t.style.opacity='0'; t.style.transition='opacity .3s'; setTimeout(()=>t.remove(), 300); }, 3000);
}

// ─────────────────── CONFETTI ───────────────────
function launchConfetti() {
  const canvas = document.getElementById('confetti-canvas');
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  const cols = ['#f5a623','#ff6b35','#4f8ef7','#3ecfb2','#e05c8a','#48c78e'];
  const particles = Array.from({length:150},()=>({
    x:Math.random()*canvas.width, y:Math.random()*canvas.height-canvas.height,
    r:Math.random()*7+3, d:Math.random()*4+1,
    color:cols[Math.floor(Math.random()*cols.length)],
    tilt:Math.random()*10-10, tiltAngleInc:Math.random()*0.07+0.05, tiltAngle:0
  }));
  let frame=0;
  const animate=()=>{
    ctx.clearRect(0,0,canvas.width,canvas.height);
    particles.forEach(p=>{
      p.tiltAngle+=p.tiltAngleInc; p.y+=p.d+1; p.tilt=Math.sin(p.tiltAngle)*12;
      ctx.beginPath(); ctx.lineWidth=p.r; ctx.strokeStyle=p.color;
      ctx.moveTo(p.x+p.tilt+p.r/2,p.y); ctx.lineTo(p.x+p.tilt,p.y+p.tilt+p.r/2); ctx.stroke();
      if(p.y>canvas.height){p.x=Math.random()*canvas.width;p.y=-20;}
    });
    if(++frame<220) requestAnimationFrame(animate);
    else ctx.clearRect(0,0,canvas.width,canvas.height);
  };
  animate();
}

// ─────────────────── UTILS ───────────────────
function shuffle(arr) {
  for (let i=arr.length-1;i>0;i--) { const j=Math.floor(Math.random()*(i+1)); [arr[i],arr[j]]=[arr[j],arr[i]]; }
  return arr;
}
function formatDate(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleDateString('en-IN',{day:'2-digit',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'});
}
function scoreColor(s) { return s>=80?'var(--green)':s>=60?'var(--accent)':s>=40?'var(--accent2)':'var(--red)'; }
function gradeLabel(s) { return s>=90?'A+':s>=80?'A':s>=70?'B':s>=60?'C':s>=50?'D':'F'; }
function gradeMessage(s) {
  return s===100?'🎉 Perfect! Outstanding performance!':s>=80?'🌟 Excellent work! Keep it up!':s>=60?'👍 Good effort! Room to improve.':s>=40?'📚 Keep practicing, you\'ll get better.':'💪 Don\'t give up! Review the material.';
}

// ─────────────────── INIT ───────────────────
window.addEventListener('DOMContentLoaded', loadDB);
// Close sidebar when clicking outside on mobile
document.addEventListener('click', e => {
  const sb = document.getElementById('sidebar');
  if (sb && sb.classList.contains('open') && !sb.contains(e.target) && !document.querySelector('.menu-toggle').contains(e.target))
    sb.classList.remove('open');
});