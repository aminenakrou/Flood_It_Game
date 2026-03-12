/* ═══════════════════════════════════
   FLOOD IT — ENHANCED GAME ENGINE
   ═══════════════════════════════════ */

// ═══ STATE ═══
let grid = [];
let gridSize = 12;
let colorCount = 5;
let moves = 0;
let gameOver = true;
let selectedColor = null;
let challengeMode = false;
let challengeLimit = Infinity;
let history = [];
let timerInterval = null;
let secondsElapsed = 0;
let totalCells = 0;

// ═══ COLOR PALETTE ═══
const COLORS = [
  '#7c5cfc', // purple
  '#f87171', // red
  '#34d399', // green
  '#fbbf24', // amber
  '#3b82f6', // blue
  '#f472b6', // pink
  '#22d3ee', // cyan
  '#fb923c', // orange
];

// ═══ LOADER ═══
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('loader').classList.add('done');
  }, 1800);
});

// ═══ DOM REFS ═══
const gridSizeSlider = document.getElementById('gridSize');
const colorCountSlider = document.getElementById('colorCount');
const gridSizeVal = document.getElementById('gridSizeVal');
const colorCountVal = document.getElementById('colorCountVal');
const challengeCheck = document.getElementById('challengeMode');
const startBtn = document.getElementById('startGame');
const gameBoard = document.getElementById('gameBoard');
const boardEmpty = document.getElementById('boardEmpty');
const palette = document.getElementById('colorPalette');
const moveCountEl = document.getElementById('moveCount');
const moveLimitEl = document.getElementById('moveLimit');
const timerEl = document.getElementById('timer');
const conqueredEl = document.getElementById('conquered');
const statsBox = document.getElementById('statsBox');
const limitRow = document.getElementById('limitRow');
const actionBtns = document.getElementById('actionBtns');
const undoBtn = document.getElementById('undoBtn');
const restartBtn = document.getElementById('restartBtn');
const progressWrap = document.getElementById('progressWrap');
const progressFill = document.getElementById('progressFill');
const bestBox = document.getElementById('bestBox');
const bestLabel = document.getElementById('bestLabel');
const bestValue = document.getElementById('bestValue');
const messageEl = document.getElementById('message');
const helpBtn = document.getElementById('helpBtn');
const helpModal = document.getElementById('helpModal');
const helpClose = document.getElementById('helpClose');
const helpOk = document.getElementById('helpOk');
const themeBtn = document.getElementById('themeBtn');
const victoryOverlay = document.getElementById('victoryOverlay');
const victoryTitle = document.getElementById('victoryTitle');
const victoryText = document.getElementById('victoryText');
const victoryReplay = document.getElementById('victoryReplay');

// ═══ SLIDER SYNC ═══
gridSizeSlider.addEventListener('input', () => {
  gridSizeVal.textContent = gridSizeSlider.value;
});

colorCountSlider.addEventListener('input', () => {
  colorCountVal.textContent = colorCountSlider.value;
});

// ═══ THEME TOGGLE ═══
themeBtn.addEventListener('click', () => {
  document.body.classList.toggle('light');
});

// ═══ HELP MODAL ═══
helpBtn.addEventListener('click', () => helpModal.classList.add('show'));
helpClose.addEventListener('click', () => helpModal.classList.remove('show'));
helpOk.addEventListener('click', () => helpModal.classList.remove('show'));
helpModal.addEventListener('click', (e) => {
  if (e.target === helpModal) helpModal.classList.remove('show');
});

// ═══ VICTORY ═══
victoryReplay.addEventListener('click', () => {
  victoryOverlay.classList.remove('show');
  startGame();
});

// ═══ GAME START ═══
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', startGame);

function startGame() {
  gridSize = parseInt(gridSizeSlider.value);
  colorCount = parseInt(colorCountSlider.value);
  challengeMode = challengeCheck.checked;
  challengeLimit = challengeMode ? 2 * gridSize : Infinity;
  moves = 0;
  gameOver = false;
  selectedColor = null;
  history = [];
  secondsElapsed = 0;
  totalCells = gridSize * gridSize;

  // Generate grid
  grid = generateGrid(gridSize, colorCount);

  // UI
  boardEmpty.style.display = 'none';
  gameBoard.classList.add('active');
  statsBox.style.display = 'block';
  actionBtns.style.display = 'flex';
  messageEl.textContent = '';
  messageEl.className = 'message';
  victoryOverlay.classList.remove('show');

  if (challengeMode) {
    limitRow.style.display = 'flex';
    progressWrap.style.display = 'block';
    moveLimitEl.textContent = challengeLimit;
  } else {
    limitRow.style.display = 'none';
    progressWrap.style.display = 'none';
  }

  // Load best score
  loadBestScore();

  // Render
  renderPalette();
  renderGrid();
  updateStats();
  startTimer();

  // Select first color by default
  setMessage('Choisissez une couleur puis cliquez sur une zone', 'info');
}

// ═══ GRID GENERATION ═══
function generateGrid(size, colors) {
  const g = [];
  for (let i = 0; i < size; i++) {
    g[i] = [];
    for (let j = 0; j < size; j++) {
      g[i][j] = Math.floor(Math.random() * colors);
    }
  }
  return g;
}

// ═══ RENDER GRID ═══
function renderGrid(animateCells = null) {
  const cellSize = Math.min(Math.floor(500 / gridSize), 40);
  gameBoard.style.setProperty('--cell-size', cellSize + 'px');
  gameBoard.style.gridTemplateColumns = `repeat(${gridSize}, var(--cell-size))`;
  gameBoard.innerHTML = '';

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.backgroundColor = COLORS[grid[i][j]];

      if (animateCells && animateCells.has(`${i},${j}`)) {
        cell.classList.add('just-filled');
      }

      cell.addEventListener('click', () => handleCellClick(i, j));
      gameBoard.appendChild(cell);
    }
  }
}

// ═══ RENDER PALETTE ═══
function renderPalette() {
  palette.innerHTML = '';
  for (let i = 0; i < colorCount; i++) {
    const box = document.createElement('div');
    box.className = 'pal-color';
    box.style.backgroundColor = COLORS[i];
    box.addEventListener('click', () => selectColor(i, box));
    palette.appendChild(box);
  }
}

// ═══ SELECT COLOR ═══
function selectColor(color, element) {
  if (gameOver) return;
  selectedColor = color;
  document.querySelectorAll('.pal-color').forEach(b => b.classList.remove('selected'));
  element.classList.add('selected');
}

// ═══ HANDLE CLICK ═══
function handleCellClick(i, j) {
  if (gameOver || selectedColor === null) {
    if (selectedColor === null && !gameOver) {
      setMessage('⚠ Sélectionnez d\'abord une couleur dans la palette !', 'fail');
    }
    return;
  }

  const originalColor = grid[i][j];
  if (originalColor === selectedColor) return;

  // Save state for undo
  history.push(grid.map(row => [...row]));
  if (history.length > 50) history.shift(); // limit memory

  // Iterative flood fill
  const filled = floodFill(i, j, originalColor, selectedColor);
  moves++;

  // Animate filled cells
  renderGrid(filled);
  updateStats();

  // Check challenge limit
  if (challengeMode && moves >= challengeLimit && !checkVictory()) {
    setMessage(`💀 Défi échoué ! Vous avez atteint la limite de ${challengeLimit} coups.`, 'fail');
    gameOver = true;
    stopTimer();
    return;
  }

  // Check victory
  if (checkVictory()) {
    handleVictory();
    return;
  }

  setMessage(`Coup ${moves} — ${getConqueredPercent()}% conquis`, 'info');
}

// ═══ ITERATIVE FLOOD FILL (no stack overflow!) ═══
function floodFill(startX, startY, originalColor, newColor) {
  if (originalColor === newColor) return new Set();

  const filled = new Set();
  const stack = [[startX, startY]];

  while (stack.length > 0) {
    const [x, y] = stack.pop();

    if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
    if (grid[x][y] !== originalColor) continue;

    grid[x][y] = newColor;
    filled.add(`${x},${y}`);

    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }

  return filled;
}

// ═══ CHECK VICTORY ═══
function checkVictory() {
  const first = grid[0][0];
  return grid.every(row => row.every(c => c === first));
}

// ═══ HANDLE VICTORY ═══
function handleVictory() {
  gameOver = true;
  stopTimer();

  const timeStr = formatTime(secondsElapsed);

  if (challengeMode && moves <= challengeLimit) {
    victoryTitle.textContent = '🏆 Défi réussi !';
    victoryText.innerHTML = `Grille remplie en <strong>${moves} coups</strong> (limite: ${challengeLimit})<br>Temps: ${timeStr}`;
  } else if (challengeMode) {
    victoryTitle.textContent = '✅ Grille remplie';
    victoryText.innerHTML = `${moves} coups — mais le défi demandait max ${challengeLimit}.<br>Temps: ${timeStr}`;
  } else {
    victoryTitle.textContent = '🎉 Victoire !';
    victoryText.innerHTML = `Grille remplie en <strong>${moves} coups</strong><br>Temps: ${timeStr}`;
  }

  // Save best score
  saveBestScore();

  // Confetti!
  spawnConfetti();

  setTimeout(() => {
    victoryOverlay.classList.add('show');
  }, 400);
}

// ═══ UNDO ═══
undoBtn.addEventListener('click', () => {
  if (history.length === 0 || gameOver) return;
  grid = history.pop();
  moves = Math.max(0, moves - 1);
  renderGrid();
  updateStats();
  setMessage('↩ Coup annulé', 'info');
});

// ═══ STATS ═══
function updateStats() {
  moveCountEl.textContent = moves;
  conqueredEl.textContent = getConqueredPercent() + '%';
  undoBtn.disabled = history.length === 0;

  if (challengeMode) {
    const pct = Math.min((moves / challengeLimit) * 100, 100);
    progressFill.style.width = pct + '%';

    if (pct > 80) {
      progressFill.style.background = 'linear-gradient(90deg, var(--amber), var(--red))';
    } else {
      progressFill.style.background = 'linear-gradient(90deg, var(--accent), var(--green))';
    }
  }
}

function getConqueredPercent() {
  if (!grid.length) return 0;
  // Find largest connected component
  const visited = Array.from({ length: gridSize }, () => Array(gridSize).fill(false));
  let maxSize = 0;

  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      if (!visited[i][j]) {
        const color = grid[i][j];
        let size = 0;
        const stack = [[i, j]];
        while (stack.length) {
          const [x, y] = stack.pop();
          if (x < 0 || x >= gridSize || y < 0 || y >= gridSize) continue;
          if (visited[x][y] || grid[x][y] !== color) continue;
          visited[x][y] = true;
          size++;
          stack.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
        maxSize = Math.max(maxSize, size);
      }
    }
  }

  return Math.round((maxSize / totalCells) * 100);
}

// ═══ TIMER ═══
function startTimer() {
  stopTimer();
  secondsElapsed = 0;
  timerEl.textContent = '0:00';
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerEl.textContent = formatTime(secondsElapsed);
  }, 1000);
}

function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }
}

function formatTime(s) {
  const min = Math.floor(s / 60);
  const sec = s % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

// ═══ BEST SCORE ═══
function getBestKey() {
  return `flood_best_${gridSize}_${colorCount}_${challengeMode ? 'c' : 'n'}`;
}

function loadBestScore() {
  const key = getBestKey();
  const val = localStorage.getItem(key);
  if (val) {
    bestBox.style.display = 'block';
    bestLabel.textContent = `${gridSize}×${gridSize}, ${colorCount} couleurs`;
    bestValue.textContent = val + ' coups';
  } else {
    bestBox.style.display = 'none';
  }
}

function saveBestScore() {
  const key = getBestKey();
  const prev = localStorage.getItem(key);
  if (!prev || moves < parseInt(prev)) {
    localStorage.setItem(key, moves);
    bestBox.style.display = 'block';
    bestLabel.textContent = `${gridSize}×${gridSize}, ${colorCount} couleurs`;
    bestValue.textContent = moves + ' coups 🎉';
  }
}

// ═══ MESSAGE ═══
function setMessage(text, type) {
  messageEl.textContent = text;
  messageEl.className = 'message ' + (type || '');
}

// ═══ CONFETTI ═══
function spawnConfetti() {
  const colors = COLORS.slice(0, colorCount);
  for (let i = 0; i < 60; i++) {
    setTimeout(() => {
      const el = document.createElement('div');
      el.className = 'confetti';
      el.style.left = Math.random() * 100 + 'vw';
      el.style.top = Math.random() * 40 + 'vh';
      el.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      el.style.width = (4 + Math.random() * 8) + 'px';
      el.style.height = (4 + Math.random() * 8) + 'px';
      el.style.animationDuration = (1 + Math.random() * 1.5) + 's';
      document.body.appendChild(el);
      setTimeout(() => el.remove(), 3000);
    }, i * 30);
  }
}

// ═══ KEYBOARD SHORTCUTS ═══
document.addEventListener('keydown', (e) => {
  if (e.key === 'z' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    undoBtn.click();
  }
  if (e.key === 'n' && (e.ctrlKey || e.metaKey)) {
    e.preventDefault();
    startGame();
  }
  // Number keys 1-8 to select color
  const num = parseInt(e.key);
  if (num >= 1 && num <= colorCount && !gameOver) {
    selectedColor = num - 1;
    document.querySelectorAll('.pal-color').forEach((b, i) => {
      b.classList.toggle('selected', i === num - 1);
    });
  }
});
