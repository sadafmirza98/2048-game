import React, { useState } from "react";
import Game2048 from "./games/2048/Game2048";
import TileMatch from "./games/TileMatch/TileMatch";
import "./App.css";

// Assuming the Pikachu image is placed in the public folder or a local directory like src/images
import pikachuRunning from "./pikachu.gif"; // Modify with the correct path to your image/GIF

const App = () => {
  const [selectedGame, setSelectedGame] = useState("Peek-a-chu");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const games = {
    "Peek-a-chu": <TileMatch />,
    "2048 Puzzle": <Game2048 />,
  };

  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);
  const handleGameSelection = (game) => {
    setSelectedGame(game);
    setIsDropdownOpen(false);
  };

  return (
    <div className="app-container">
      <header className="game-header">
        <h1 className="app-title">
          Tile Treks
          <img src={pikachuRunning} alt="Pikachu Running" className="pikachu" />
        </h1>
        <div className="game-selector">
          <div
            className={`custom-dropdown ${isDropdownOpen ? "open" : ""}`}
            onClick={toggleDropdown}
          >
            <div className="dropdown-selected">{selectedGame}</div>
            <ul className="dropdown-options">
              {Object.keys(games).map((game) => (
                <li
                  key={game}
                  className="dropdown-option"
                  onClick={() => handleGameSelection(game)}
                >
                  {game}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </header>
      <main className="game-display">{games[selectedGame]}</main>
    </div>
  );
};

export default App;
