import React, { useState, useEffect, useCallback } from "react";
import "./Game2048.css";

// Helper function to create a new grid
const createGrid = () => {
  const grid = Array(4)
    .fill(null)
    .map(() => Array(4).fill(0));
  addNewTile(grid);
  addNewTile(grid);
  return grid;
};

// Add a new tile to the grid
const addNewTile = (grid) => {
  const emptyCells = [];
  grid.forEach((row, i) =>
    row.forEach((cell, j) => {
      if (cell === 0) emptyCells.push([i, j]);
    })
  );

  if (emptyCells.length) {
    const [x, y] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    grid[x][y] = Math.random() < 0.9 ? 2 : 4;
  }
};

// Check if two grids are identical
const gridsEqual = (grid1, grid2) =>
  grid1.every((row, i) => row.every((cell, j) => cell === grid2[i][j]));

// Helper function to move tiles
const move = (grid, direction) => {
  const clone = grid.map((row) => [...row]);

  const mergeRow = (row) => {
    const filtered = row.filter((num) => num !== 0);
    for (let i = 0; i < filtered.length - 1; i++) {
      if (filtered[i] === filtered[i + 1]) {
        filtered[i] *= 2;
        filtered[i + 1] = 0;
      }
    }
    return [
      ...filtered.filter((num) => num !== 0),
      ...Array(4 - filtered.filter((num) => num !== 0).length).fill(0),
    ];
  };

  if (direction === "up" || direction === "down") {
    for (let col = 0; col < 4; col++) {
      const column = grid.map((row) => row[col]);
      const merged =
        direction === "up"
          ? mergeRow(column)
          : mergeRow(column.reverse()).reverse();
      merged.forEach((val, row) => (clone[row][col] = val));
    }
  } else {
    for (let row = 0; row < 4; row++) {
      clone[row] =
        direction === "left"
          ? mergeRow(clone[row])
          : mergeRow(clone[row].reverse()).reverse();
    }
  }

  return clone;
};

// Check if the game is over
const isGameOver = (grid) => {
  const directions = ["up", "down", "left", "right"];
  return directions.every((dir) => gridsEqual(grid, move(grid, dir)));
};

// Check if the player has won
const isGameWon = (grid) => {
  return grid.some((row) => row.includes(2048));
};

export default function Game2048() {
  const [grid, setGrid] = useState(createGrid());
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false); // Track if the user wins

  const [isDragging, setIsDragging] = useState(false);
  const [startPosition, setStartPosition] = useState({ x: 0, y: 0 });

  // Memoize the handleKeyPress function (without unnecessary dependencies)
  const handleKeyPress = useCallback(
    (e) => {
      const winSound = new Audio("/sounds/win.wav");
      const mergeSound = new Audio("/sounds/merge.wav");
      const gameOverSound = new Audio("/sounds/gameover.wav");
      if (gameOver) return; // Stop game if over
      const directions = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
      };
      const direction = directions[e.key];
      if (direction) {
        setGrid((prevGrid) => {
          const newGrid = move(prevGrid, direction);

          if (!gridsEqual(prevGrid, newGrid)) {
            addNewTile(newGrid);
            mergeSound.play(); // Play move sound
          }

          const newScore = newGrid
            .flat()
            .filter((n) => n)
            .reduce((a, b) => a + b, 0);
          setScore(newScore);

          if (isGameWon(newGrid)) {
            setGameWon(true); // Set game to won state
            winSound.play(); // Play win sound
          }

          if (isGameOver(newGrid)) {
            setGameOver(true);
            gameOverSound.play(); // Play game over sound
          }

          return newGrid;
        });
      }
    },
    [gameOver] // Only need gameOver as a dependency here
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  const restartGame = () => {
    setGrid(createGrid());
    setScore(0);
    setGameOver(false);
    setGameWon(false); // Reset win state on restart
  };

  // Handle drag start
  const handleMouseDown = (e) => {
    if (gameOver) return;

    setIsDragging(true);
    setStartPosition({ x: e.clientX, y: e.clientY });
  };

  // Handle drag move
  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startPosition.x;
    const dy = e.clientY - startPosition.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 50) {
        handleDragEnd("right");
      } else if (dx < -50) {
        handleDragEnd("left");
      }
    } else {
      if (dy > 50) {
        handleDragEnd("down");
      } else if (dy < -50) {
        handleDragEnd("up");
      }
    }
  };

  // Handle drag end
  const handleDragEnd = (direction) => {
    setIsDragging(false);
    const newGrid = move(grid, direction);

    if (!gridsEqual(grid, newGrid)) {
      addNewTile(newGrid);
      const newScore = newGrid
        .flat()
        .filter((n) => n)
        .reduce((a, b) => a + b, 0);
      setScore(newScore);
      setGrid(newGrid);

      if (isGameWon(newGrid)) {
        setGameWon(true);
        const winSound = new Audio("/sounds/win.wav");
        winSound.play(); // Play win sound
      }

      if (isGameOver(newGrid)) {
        setGameOver(true);
        const gameOverSound = new Audio("/sounds/gameover.wav");
        gameOverSound.play(); // Play game over sound
      }
    }
  };

  // Handle mouse up
  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
    }
  };

  // Bind mouse events
  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, startPosition]);

  // Handle touch events for mobile swipe functionality
  const handleTouchStart = (e) => {
    setStartPosition({
      x: e.touches[0].clientX,
      y: e.touches[0].clientY,
    });
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;

    const dx = e.touches[0].clientX - startPosition.x;
    const dy = e.touches[0].clientY - startPosition.y;

    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 50) {
        handleDragEnd("right");
        e.preventDefault(); // Prevent scrolling
      } else if (dx < -50) {
        handleDragEnd("left");
        e.preventDefault(); // Prevent scrolling
      }
    } else {
      if (dy > 50) {
        handleDragEnd("down");
        e.preventDefault(); // Prevent scrolling
      } else if (dy < -50) {
        handleDragEnd("up");
        e.preventDefault(); // Prevent scrolling
      }
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    document.addEventListener("touchstart", handleTouchStart, {
      passive: false, // Allow touchmove to be prevented
    });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);

    return () => {
      document.removeEventListener("touchstart", handleTouchStart);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isDragging, startPosition]);

  return (
    <div className="game-container" onMouseDown={handleMouseDown}>
      <h1 className="game-title">2048 Puzzle</h1>
      <div className="score">Score: {score}</div>
      {gameOver && (
        <div className="game-over">
          <h2>Game Over!</h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
      {gameWon && (
        <div className="game-over">
          <h2>You Win!</h2>
          <button onClick={restartGame}>Restart</button>
        </div>
      )}
      <div className="grid">
        {grid.map((row, i) => (
          <div key={i} className="row">
            {row.map((cell, j) => (
              <div key={j} className={`cell ${cell ? `tile-${cell}` : ""}`}>
                {cell || ""}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
