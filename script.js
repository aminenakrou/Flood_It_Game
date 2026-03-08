// Démarre le jeu lors du clic sur le bouton
document.getElementById('startGame').addEventListener('click', startGame);

function startGame() {
  // Récupère les paramètres du jeu
  gridSize = parseInt(document.getElementById('gridSize').value);
  colorCount = parseInt(document.getElementById('colorCount').value);
  moves = 0;
  challengeMode = document.getElementById('challengeMode').checked;
  challengeLimit = challengeMode ? 2 * gridSize : Infinity;
  gameOver = false;
  selectedColor = undefined;

  // Génère la grille et l'affiche
  grid = generateGrid(gridSize, colorCount);
  renderGrid();
  renderColorPalette();
  document.getElementById('info').innerText = `Coups joués: ${moves}`;
}

// Génère une grille avec des couleurs aléatoires
function generateGrid(size, colors) {
  const grid = [];
  for (let i = 0; i < size; i++) {
    grid[i] = [];
    for (let j = 0; j < size; j++) {
      grid[i][j] = Math.floor(Math.random() * colors);
    }
  }
  return grid;
}

// Affiche la grille de jeu
function renderGrid() {
  const gameArea = document.getElementById('gameArea');
  gameArea.style.gridTemplateColumns = `repeat(${gridSize}, 30px)`;
  gameArea.innerHTML = '';

  grid.forEach((row, i) => {
    row.forEach((color, j) => {
      const cell = document.createElement('div');
      cell.className = 'cell';
      cell.style.backgroundColor = getColor(color);

      // Gère le clic sur une cellule
      cell.addEventListener('click', () => handleCellClick(i, j));
      gameArea.appendChild(cell);
    });
  });
}

// Affiche la palette de couleurs
function renderColorPalette() {
  const colorPalette = document.getElementById('colorPalette');
  colorPalette.innerHTML = '';

  for (let i = 0; i < colorCount; i++) {
    const colorBox = document.createElement('div');
    colorBox.className = 'color-box';
    colorBox.style.backgroundColor = getColor(i);

    // Sélectionne la couleur pour le prochain coup
    colorBox.addEventListener('click', (event) => {
      selectColor(i);
      document.querySelectorAll('.color-box').forEach(box => box.classList.remove('selected'));
      event.currentTarget.classList.add('selected');
    });

    colorPalette.appendChild(colorBox);
  }
}

// Définit la couleur sélectionnée
function selectColor(color) {
  selectedColor = color;
}

// Gère le clic sur une cellule de la grille
function handleCellClick(i, j) {
  if (gameOver || selectedColor === undefined) return;

  const originalColor = grid[i][j];
  if (originalColor !== selectedColor) {
    floodFill(i, j, originalColor, selectedColor);
    moves++;
    document.getElementById('info').innerText = `Coups joués: ${moves}`;

    // Vérifie si le mode défi est activé et la limite de coups
    if (!checkVictory() && challengeMode && moves > challengeLimit) {
      document.getElementById('info').innerText = `Défi échoué ! Vous avez dépassé ${challengeLimit} coups.`;
      gameOver = true;
      return;
    }
    checkVictory();
    renderGrid();
  }
}

// Algorithme de Flood Fill récursif
function floodFill(x, y, originalColor, newColor) {
  if (x < 0 || x >= gridSize || y < 0 || y >= gridSize || grid[x][y] !== originalColor) {
    return;
  }

  grid[x][y] = newColor;
  floodFill(x + 1, y, originalColor, newColor);
  floodFill(x - 1, y, originalColor, newColor);
  floodFill(x, y + 1, originalColor, newColor);
  floodFill(x, y - 1, originalColor, newColor);
}

// Vérifie la victoire
function checkVictory() {
  const firstColor = grid[0][0];
  const allSameColor = grid.every(row => row.every(color => color === firstColor));

  if (allSameColor) {
    if (challengeMode) {
      if (moves <= challengeLimit) {
        document.getElementById('info').innerText = `Félicitations ! Défi réussi en ${moves} coups.`;
      } else {
        document.getElementById('info').innerText = `Grille remplie en ${moves} coups, mais le défi (max ${challengeLimit} coups) n'est pas respecté.`;
      }
    } else {
      document.getElementById('info').innerText = `Victoire ! Vous avez rempli la grille en ${moves} coups.`;
    }
    gameOver = true;
    return true;
  }
  return false;
}

// Renvoie une couleur de la palette en fonction de l'indice
function getColor(index) {
  const colors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080', '#008000', '#000080'];
  return colors[index % colors.length];
}
