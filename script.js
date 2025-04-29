let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X'; // Starting player
let gameOver = false;

const gameBoard = document.getElementById('gameBoard');
const gameStatus = document.getElementById('gameStatus');
const playAgainButton = document.getElementById('playAgainButton'); //  
// Load sounds
const clickSound = new Audio('click.mp3');
const winSound = new Audio('win.mp3');

// Generate the game grid dynamically
for (let i = 0; i < 9; i++) {
  const cell = document.createElement('div');
  cell.classList.add('cell');
  cell.setAttribute('data-index', i);
  cell.addEventListener('click', handleCellClick);
  gameBoard.appendChild(cell);
}

// Handle the cell click
function handleCellClick(event) {
  const index = event.target.getAttribute('data-index');
  if (board[index] === '' && !gameOver && currentPlayer === 'X') {
    placeMark(event.target, index, 'X');
    clickSound.currentTime = 0;
    clickSound.play().catch(error => {
      console.log("Sound play blocked:", error);
    });

    if (checkWinner('X')) {
      endGame(false, 'X');
    } else if (board.every(cell => cell !== '')) {
      endGame(true);
    } else {
      currentPlayer = 'O';
      setTimeout(aiMove, 500); // AI plays after short delay
    }
  }
}

// Place mark and play click sound
function placeMark(cell, index, player) {
  board[index] = player;
  cell.textContent = player;
  clickSound.play();
}

// Handle game end
function endGame(draw, winner = null) {
  gameOver = true;
  if (draw) {
    gameStatus.textContent = "It's a Draw! 😐";
    playAgainButton.textContent = "Play Again";
  } else {
    gameStatus.textContent = `${winner} Wins! 🎉`;
    winSound.play();
    celebrate(); // 🎉 call confetti here
    highlightWinningCells(winner);
    playAgainButton.textContent = "Play Again";
  }
  

  playAgainButton.style.display = 'inline-block';
  // Make the button visible 
}
// Play Again button logic
playAgainButton.addEventListener('click', () => {
    resetGame();  // Function to reset the game state
    gameStatus.textContent = ""; // Clear the game status text
    playAgainButton.style.display = 'none'; // Hide Play Again button again
    gameOver = false; // Reset game state
});

// AI Move (basic random with minimax)
function aiMove() {
    if (gameOver) return;
  
    gameStatus.textContent = "AI's Turn..."; // Update status before AI move
  
    const availableMoves = getAvailableMoves(board);
    if (availableMoves.length > 0) {
      const bestMove = minimax(board, 'O').index; // AI uses minimax
      const cell = gameBoard.querySelector(`[data-index="${bestMove}"]`);
      placeMark(cell, bestMove, 'O');
      clickSound.currentTime = 0; // Restart sound from beginning
      clickSound.play().catch(error => {
        console.log("Sound play blocked:", error);
      });
  
      if (checkWinner('O')) {
        endGame(false, 'O');
      } else if (board.every(cell => cell !== '')) {
        endGame(true);
      } else {
        currentPlayer = 'X';
        gameStatus.textContent = "Your Turn!"; // Update status after AI move
      }
    }
  }
  

// Minimax Algorithm
function minimax(newBoard, player) {
  const availableMoves = getAvailableMoves(newBoard);

  if (checkWin(newBoard, 'O')) return { score: 1 };
  if (checkWin(newBoard, 'X')) return { score: -1 };
  if (availableMoves.length === 0) return { score: 0 };

  const moves = [];

  for (let i = 0; i < availableMoves.length; i++) {
    const move = {};
    move.index = availableMoves[i];
    newBoard[move.index] = player;

    if (player === 'O') {
      const result = minimax(newBoard, 'X');
      move.score = result.score;
    } else {
      const result = minimax(newBoard, 'O');
      move.score = result.score;
    }

    newBoard[move.index] = '';
    moves.push(move);
  }

  let bestMove;
  if (player === 'O') {
    let bestScore = -Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = moves[i];
      }
    }
  }

  return bestMove;
}

// Get Available Moves
function getAvailableMoves(board) {
  return board.map((cell, index) => (cell === '' ? index : null)).filter(index => index !== null);
}

// Highlight the winning cells
function highlightWinningCells(player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  const cells = document.querySelectorAll('.cell');
  winPatterns.forEach(pattern => {
    if (pattern.every(index => board[index] === player)) {
      pattern.forEach(index => {
        cells[index].classList.add('winning-cell');
      });
    }
  });
}

// Check Winner for Minimax separately
function checkWin(board, player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  return winPatterns.some(pattern => {
    return pattern.every(index => board[index] === player);
  });
}

// Check Winner for actual gameplay
function checkWinner(player) {
  const winPatterns = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], 
    [0, 3, 6], [1, 4, 7], [2, 5, 8], 
    [0, 4, 8], [2, 4, 6]
  ];

  return winPatterns.some(pattern => {
    if (pattern.every(index => board[index] === player)) {
      // Highlight winning cells
      pattern.forEach(index => {
        const cell = gameBoard.querySelectorAll('div')[index];
        cell.classList.add('win');
      });
      return true;
    }
    return false;
  });
}
playAgainButton.addEventListener('click', resetGame);
// Reset the game
function resetGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X';
    gameOver = false;
    gameStatus.textContent = '';
    playAgainButton.style.display = 'none'; // Hide Play Again button initially
    const cells = gameBoard.querySelectorAll('div');
    playAgainButton.style.display = 'none';

    cells.forEach(cell => {
      cell.textContent = '';
      cell.classList.remove('win'); // Remove winning animation
      cell.classList.remove('winning-cell');
    });
    
  }
  

// Confetti Celebration
function celebrate() {
  confetti({
    particleCount: 200,
    spread: 70,
    origin: { y: 0.6 }
  });
}
