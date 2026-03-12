/* ═══════════════════════════════════════════════════════
   FLOOD IT — WORLD-CLASS GAME ENGINE
   Canvas rendering, Web Audio, Combos, Undo, Records
   ═══════════════════════════════════════════════════════ */

// ═══ PALETTE ═══
const COLORS = [
  '#8b5cf6','#ef4444','#22c55e','#f59e0b','#3b82f6',
  '#ec4899','#06b6d4','#f97316',
];
const COLOR_NAMES = ['Violet','Rouge','Vert','Ambre','Bleu','Rose','Cyan','Orange'];

// ═══ STATE ═══
let S = {
  grid: [], gridSize: 14, colorCount: 6,
  moves: 0, gameOver: true, selectedColor: null,
  challenge: false, limit: Infinity,
  history: [], timer: null, seconds: 0, total: 0,
  lastFilled: 0, combo: 0, soundOn: true,
};

// ═══ AUDIO (Web Audio API) ═══
let audioCtx;
function initAudio() { if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)(); }
function playTone(freq, dur, type='sine', vol=0.08) {
  if (!S.soundOn || !audioCtx) return;
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(vol, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + dur);
  osc.connect(gain); gain.connect(audioCtx.destination);
  osc.start(); osc.stop(audioCtx.currentTime + dur);
}
function sfxClick() { playTone(600 + Math.random()*200, 0.08, 'sine', 0.06); }
function sfxFlood() { playTone(300, 0.15, 'triangle', 0.05); setTimeout(()=>playTone(450, 0.12, 'sine', 0.04), 60); }
function sfxCombo(n) { for(let i=0;i<n;i++) setTimeout(()=>playTone(500+i*100, 0.1, 'sine', 0.05), i*60); }
function sfxWin() { [0,100,200,300,400].forEach((d,i)=>setTimeout(()=>playTone(400+i*100, 0.2, 'triangle', 0.06), d)); }
function sfxFail() { playTone(200, 0.3, 'sawtooth', 0.04); }

// ═══ DOM ═══
const $ = id => document.getElementById(id);
const intro = $('intro');
const app = $('app');
const canvas = $('gameCanvas');
const ctx = canvas.getContext('2d');
const placeholder = $('placeholder');
const palette = $('palette');
const paletteHint = $('paletteHint');
const topbarStats = $('topbarStats');
const msg = $('msg');
const comboPopup = $('comboPopup');

// ═══ INTRO ═══
$('introPlay').addEventListener('click', () => {
  initAudio(); sfxClick();
  intro.classList.add('exit');
  setTimeout(() => { app.classList.remove('hidden'); }, 600);
});

// Intro canvas background
(function(){
  const c = $('introCanvas'); const x = c.getContext('2d');
  let W, H;
  function resize() { W = c.width = window.innerWidth; H = c.height = window.innerHeight; }
  resize(); window.addEventListener('resize', resize);
  const dots = Array.from({length:40}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: 2+Math.random()*4, vx: (Math.random()-0.5)*0.5, vy: (Math.random()-0.5)*0.5,
    color: COLORS[Math.floor(Math.random()*6)]
  }));
  function draw() {
    x.clearRect(0,0,W,H);
    dots.forEach(d => {
      d.x += d.vx; d.y += d.vy;
      if(d.x<0||d.x>W) d.vx*=-1;
      if(d.y<0||d.y>H) d.vy*=-1;
      x.beginPath(); x.arc(d.x,d.y,d.r,0,Math.PI*2);
      x.fillStyle = d.color; x.globalAlpha = 0.15; x.fill(); x.globalAlpha = 1;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ═══ THEME ═══
$('themeBtn').addEventListener('click', () => {
  document.body.classList.toggle('light');
  sfxClick();
});

// ═══ SOUND ═══
$('soundBtn').addEventListener('click', () => {
  S.soundOn = !S.soundOn;
  $('soundBtn').classList.toggle('muted', !S.soundOn);
  $('soundBtn').textContent = S.soundOn ? '🔊' : '🔇';
});

// ═══ HELP ═══
$('helpBtn').addEventListener('click', () => { $('helpOverlay').classList.add('show'); sfxClick(); });
$('helpX').addEventListener('click', () => $('helpOverlay').classList.remove('show'));
$('helpOk').addEventListener('click', () => { $('helpOverlay').classList.remove('show'); sfxClick(); });
$('helpOverlay').addEventListener('click', e => { if(e.target===$('helpOverlay')) $('helpOverlay').classList.remove('show'); });

// ═══ CONFIG ═══
document.querySelectorAll('.cfg-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    sfxClick();
    const target = btn.dataset.target;
    const dir = parseInt(btn.dataset.dir);
    if (target === 'gridSize') {
      S.gridSize = Math.max(5, Math.min(30, S.gridSize + dir));
      $('gridSizeVal').textContent = S.gridSize;
    } else {
      S.colorCount = Math.max(3, Math.min(8, S.colorCount + dir));
      $('colorCountVal').textContent = S.colorCount;
    }
  });
});

// Challenge toggle
$('challengeToggle').addEventListener('click', () => {
  S.challenge = !S.challenge;
  $('challengeToggle').classList.toggle('on', S.challenge);
  sfxClick();
});

// ═══ NEW GAME ═══
$('newGameBtn').addEventListener('click', startGame);
$('restartBtn').addEventListener('click', startGame);
$('victoryReplay').addEventListener('click', () => { $('victoryOverlay').classList.remove('show'); startGame(); });

function startGame() {
  initAudio(); sfxClick();
  S.moves = 0; S.gameOver = false; S.selectedColor = null;
  S.history = []; S.seconds = 0; S.combo = 0; S.lastFilled = 0;
  S.limit = S.challenge ? 2 * S.gridSize : Infinity;
  S.total = S.gridSize * S.gridSize;
  S.grid = genGrid(S.gridSize, S.colorCount);

  // UI
  placeholder.style.display = 'none';
  canvas.classList.add('active');
  $('liveStats').style.display = 'block';
  $('actionsPanel').style.display = 'block';
  $('victoryOverlay').classList.remove('show');
  msg.textContent = ''; msg.className = 'msg';

  if (S.challenge) {
    $('statLimit').textContent = S.limit;
    $('progressBar').style.display = 'block';
  } else {
    $('statLimit').textContent = '∞';
    $('progressBar').style.display = 'none';
  }

  loadBest();
  renderPalette();
  renderBoard();
  updateStats();
  startTimer();
  setMsg('Sélectionnez une couleur puis cliquez sur la grille', 'info');
}

function genGrid(size, colors) {
  return Array.from({length: size}, () =>
    Array.from({length: size}, () => Math.floor(Math.random() * colors))
  );
}

// ═══ RENDER BOARD (Canvas) ═══
let cellSize = 30;
let hoverCell = null;
let animCells = new Map(); // key -> {progress, color}

function renderBoard(animated = null) {
  cellSize = Math.min(Math.floor(Math.min(window.innerWidth - 340, 600) / S.gridSize), 38);
  cellSize = Math.max(cellSize, 14);
  const size = cellSize * S.gridSize;
  const dpr = window.devicePixelRatio || 1;
  canvas.width = size * dpr; canvas.height = size * dpr;
  canvas.style.width = size + 'px'; canvas.style.height = size + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  // Draw cells
  for (let r = 0; r < S.gridSize; r++) {
    for (let c = 0; c < S.gridSize; c++) {
      const x = c * cellSize, y = r * cellSize;
      ctx.fillStyle = COLORS[S.grid[r][c]];
      ctx.fillRect(x, y, cellSize, cellSize);

      // Subtle grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.08)';
      ctx.lineWidth = 0.5;
      ctx.strokeRect(x, y, cellSize, cellSize);
    }
  }

  // Animated flood wave
  if (animated && animated.size > 0) {
    animated.forEach(key => {
      const [r, c] = key.split(',').map(Number);
      const x = c * cellSize, y = r * cellSize;
      ctx.fillStyle = 'rgba(255,255,255,0.25)';
      ctx.fillRect(x, y, cellSize, cellSize);
    });
    // Clear flash after short delay
    setTimeout(() => renderBoard(), 150);
  }

  // Hover highlight
  if (hoverCell) {
    const [r, c] = hoverCell;
    const x = c * cellSize, y = r * cellSize;
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    ctx.fillRect(x, y, cellSize, cellSize);
    ctx.strokeStyle = 'rgba(255,255,255,0.15)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x + 0.5, y + 0.5, cellSize - 1, cellSize - 1);
  }
}

// Canvas mouse events
canvas.addEventListener('mousemove', e => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize), r = Math.floor(y / cellSize);
  if (r >= 0 && r < S.gridSize && c >= 0 && c < S.gridSize) {
    hoverCell = [r, c];
  } else {
    hoverCell = null;
  }
  renderBoard();
});
canvas.addEventListener('mouseleave', () => { hoverCell = null; renderBoard(); });

canvas.addEventListener('click', e => {
  if (S.gameOver) return;
  if (S.selectedColor === null) { setMsg('⚠ Sélectionnez d\'abord une couleur !', 'fail'); sfxClick(); return; }
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left, y = e.clientY - rect.top;
  const c = Math.floor(x / cellSize), r = Math.floor(y / cellSize);
  if (r < 0 || r >= S.gridSize || c < 0 || c >= S.gridSize) return;
  handleClick(r, c);
});

// ═══ PALETTE ═══
function renderPalette() {
  palette.innerHTML = '';
  for (let i = 0; i < S.colorCount; i++) {
    const el = document.createElement('div');
    el.className = 'pal-c';
    el.style.backgroundColor = COLORS[i];
    const key = document.createElement('span');
    key.className = 'pal-key'; key.textContent = i + 1;
    el.appendChild(key);
    el.addEventListener('click', () => selectColor(i));
    palette.appendChild(el);
  }
}

function selectColor(i) {
  if (S.gameOver) return;
  S.selectedColor = i; sfxClick();
  document.querySelectorAll('.pal-c').forEach((el, idx) => el.classList.toggle('sel', idx === i));
  paletteHint.textContent = COLOR_NAMES[i] + ' sélectionné';
}

// ═══ GAME LOGIC ═══
function handleClick(r, c) {
  const orig = S.grid[r][c];
  if (orig === S.selectedColor) return;

  // Save history
  S.history.push(S.grid.map(row => [...row]));
  if (S.history.length > 100) S.history.shift();

  // Flood fill
  const filled = floodFill(r, c, orig, S.selectedColor);
  S.moves++;
  sfxFlood();

  // Combo system
  if (filled.size >= S.total * 0.08) {
    S.combo++;
    if (S.combo >= 2) {
      showCombo(S.combo, filled.size);
      sfxCombo(S.combo);
    }
  } else {
    S.combo = 0;
  }
  S.lastFilled = filled.size;

  renderBoard(filled);
  updateStats();

  // Check challenge fail
  if (S.challenge && S.moves >= S.limit && !checkWin()) {
    setMsg(`💀 Défi échoué — limite de ${S.limit} coups atteinte`, 'fail');
    S.gameOver = true; stopTimer(); sfxFail();
    return;
  }

  // Check win
  if (checkWin()) {
    handleWin(); return;
  }

  setMsg(`Coup ${S.moves} — ${getConqPct()}% conquis${S.lastFilled > 10 ? ' · ' + S.lastFilled + ' cases remplies' : ''}`, 'info');
}

// ═══ ITERATIVE FLOOD FILL ═══
function floodFill(sr, sc, orig, newC) {
  if (orig === newC) return new Set();
  const filled = new Set();
  const stack = [[sr, sc]];
  while (stack.length) {
    const [x, y] = stack.pop();
    if (x < 0 || x >= S.gridSize || y < 0 || y >= S.gridSize) continue;
    if (S.grid[x][y] !== orig) continue;
    S.grid[x][y] = newC;
    filled.add(`${x},${y}`);
    stack.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
  }
  return filled;
}

function checkWin() {
  const f = S.grid[0][0];
  return S.grid.every(row => row.every(c => c === f));
}

function handleWin() {
  S.gameOver = true; stopTimer(); sfxWin();
  saveBest();
  spawnConfetti();

  const timeStr = fmtTime(S.seconds);
  const icon = S.challenge && S.moves <= S.limit ? '🏆' : '🎉';
  const title = S.challenge && S.moves <= S.limit ? 'Défi réussi !' : 'Victoire !';

  $('victoryIcon').textContent = icon;
  $('victoryTitle').textContent = title;
  $('victoryText').innerHTML = S.challenge
    ? `Grille remplie en <strong>${S.moves}</strong> coups (limite: ${S.limit})`
    : `Grille remplie en <strong>${S.moves}</strong> coups`;
  $('victoryStats').innerHTML = `
    <div class="vs-item"><div class="vs-val">${S.moves}</div><div class="vs-lbl">Coups</div></div>
    <div class="vs-item"><div class="vs-val">${timeStr}</div><div class="vs-lbl">Temps</div></div>
    <div class="vs-item"><div class="vs-val">${S.gridSize}×${S.gridSize}</div><div class="vs-lbl">Grille</div></div>
  `;

  setTimeout(() => $('victoryOverlay').classList.add('show'), 500);
}

// ═══ UNDO ═══
$('undoBtn').addEventListener('click', () => {
  if (!S.history.length || S.gameOver) return;
  S.grid = S.history.pop();
  S.moves = Math.max(0, S.moves - 1);
  renderBoard(); updateStats(); sfxClick();
  setMsg('↩ Coup annulé', 'info');
});

// ═══ STATS ═══
function updateStats() {
  const pct = getConqPct();
  $('statMoves').textContent = S.moves;
  $('statTime').textContent = fmtTime(S.seconds);
  $('statPct').textContent = pct + '%';
  $('undoBtn').disabled = !S.history.length;

  // Topbar
  topbarStats.innerHTML = S.gameOver && S.moves === 0 ? '' : `
    <div class="tc-item">Coups <span class="tc-val">${S.moves}</span></div>
    <div class="tc-item">Conquis <span class="tc-val">${pct}%</span></div>
    <div class="tc-item">Temps <span class="tc-val">${fmtTime(S.seconds)}</span></div>
  `;

  // Progress bar
  if (S.challenge) {
    const p = Math.min(S.moves / S.limit * 100, 100);
    $('progressFill').style.width = p + '%';
    $('progressFill').className = 'progress-fill' + (p > 75 ? ' danger' : '');
    $('progressLabel').textContent = `${S.moves}/${S.limit}`;
  }
}

function getConqPct() {
  if (!S.grid.length) return 0;
  const vis = Array.from({length:S.gridSize}, ()=>Array(S.gridSize).fill(false));
  let maxSz = 0;
  for (let i=0; i<S.gridSize; i++) for (let j=0; j<S.gridSize; j++) {
    if (vis[i][j]) continue;
    const col = S.grid[i][j]; let sz = 0;
    const st = [[i,j]];
    while (st.length) {
      const [x,y] = st.pop();
      if (x<0||x>=S.gridSize||y<0||y>=S.gridSize||vis[x][y]||S.grid[x][y]!==col) continue;
      vis[x][y]=true; sz++;
      st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1]);
    }
    maxSz = Math.max(maxSz, sz);
  }
  return Math.round(maxSz / S.total * 100);
}

// ═══ TIMER ═══
function startTimer() {
  stopTimer(); S.seconds = 0;
  S.timer = setInterval(() => { S.seconds++; $('statTime').textContent = fmtTime(S.seconds); updateTopbar(); }, 1000);
}
function stopTimer() { if (S.timer) { clearInterval(S.timer); S.timer = null; } }
function fmtTime(s) { return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`; }
function updateTopbar() {
  const tcTime = topbarStats.querySelector('.tc-item:last-child .tc-val');
  if (tcTime) tcTime.textContent = fmtTime(S.seconds);
}

// ═══ BEST SCORE ═══
function bestKey() { return `flood_${S.gridSize}_${S.colorCount}_${S.challenge?'c':'n'}`; }
function loadBest() {
  const v = localStorage.getItem(bestKey());
  if (v) {
    $('bestPanel').style.display = 'block';
    $('bestConfig').textContent = `${S.gridSize}×${S.gridSize} · ${S.colorCount}c`;
    $('bestScore').textContent = v + ' coups';
  } else {
    $('bestPanel').style.display = 'none';
  }
}
function saveBest() {
  const prev = localStorage.getItem(bestKey());
  if (!prev || S.moves < parseInt(prev)) {
    localStorage.setItem(bestKey(), S.moves);
    $('bestPanel').style.display = 'block';
    $('bestConfig').textContent = `${S.gridSize}×${S.gridSize} · ${S.colorCount}c`;
    $('bestScore').textContent = S.moves + ' 🎉';
  }
}

// ═══ COMBO POPUP ═══
function showCombo(n, size) {
  const texts = ['','','Double !','Triple !','Méga !','Ultra !','INSANE !'];
  comboPopup.textContent = (texts[Math.min(n,6)] || 'x'+n) + ' (' + size + ' cases)';
  comboPopup.classList.add('show');
  setTimeout(() => comboPopup.classList.remove('show'), 1200);
}

// ═══ MESSAGE ═══
function setMsg(text, type) { msg.textContent = text; msg.className = 'msg ' + (type||''); }

// ═══ CONFETTI ═══
function spawnConfetti() {
  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.cssText = `
        left:${Math.random()*100}vw; top:${Math.random()*50}vh;
        width:${4+Math.random()*8}px; height:${4+Math.random()*8}px;
        background:${COLORS[Math.floor(Math.random()*S.colorCount)]};
        border-radius:${Math.random()>0.5?'50%':'2px'};
      `;
      el.animate([
        { transform:'translateY(0) rotate(0deg) scale(1)', opacity:1 },
        { transform:`translateY(${200+Math.random()*300}px) rotate(${360+Math.random()*360}deg) scale(0.2)`, opacity:0 }
      ], { duration: 1200+Math.random()*800, easing: 'cubic-bezier(0.16,1,0.3,1)' }).onfinish = () => el.remove();
      document.body.appendChild(el);
    }, i * 25);
  }
}

// ═══ KEYBOARD SHORTCUTS ═══
document.addEventListener('keydown', e => {
  // Number keys
  const n = parseInt(e.key);
  if (n >= 1 && n <= S.colorCount && !S.gameOver) {
    selectColor(n - 1);
    return;
  }
  // Undo
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault(); $('undoBtn').click();
    return;
  }
  // New game
  if (e.key === 'n' || e.key === 'N') {
    if (!e.ctrlKey && !e.metaKey) { startGame(); return; }
  }
  // Sound toggle
  if (e.key === 's' || e.key === 'S') {
    $('soundBtn').click();
  }
});

// ═══ WINDOW RESIZE ═══
window.addEventListener('resize', () => { if (!S.gameOver || S.grid.length) renderBoard(); });

// ═══ INIT ═══
$('gridSizeVal').textContent = S.gridSize;
$('colorCountVal').textContent = S.colorCount;
