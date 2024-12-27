import React, { useState, useEffect } from "react";
import "./TileMatch.css";

// Import your images
import tile1 from "./tiles/1.png";
import tile2 from "./tiles/2.png";
import tile3 from "./tiles/3.png";
import tile4 from "./tiles/4.png";
import tile5 from "./tiles/5.png";
import tile6 from "./tiles/6.png";
import tile7 from "./tiles/7.png";
import tile8 from "./tiles/8.png";

const TileMatch = () => {
  // Array of image paths instead of emojis

  const [tiles, setTiles] = useState([]);
  const [flippedTiles, setFlippedTiles] = useState([]);
  const [matchedTiles, setMatchedTiles] = useState([]);
  const [isGameWon, setIsGameWon] = useState(false);

  useEffect(() => {
    // Shuffle images and duplicate them for pairs
    // Array of image paths instead of emojis
    const images = [tile1, tile2, tile3, tile4, tile5, tile6, tile7, tile8];

    // Shuffle images and duplicate them for pairs
    const shuffledTiles = [...images, ...images]
      .sort(() => Math.random() - 0.5)
      .map((image, index) => ({ id: index, image, isFlipped: false }));
    setTiles(shuffledTiles);
  }, []);
  useEffect(() => {
    if (matchedTiles.length === tiles.length && tiles.length > 0) {
      setIsGameWon(true); // Check if all tiles are matched
    }
  }, [matchedTiles, tiles]);

  const handleTileClick = (tile) => {
    if (flippedTiles.length === 2 || matchedTiles.includes(tile.id)) return;

    const updatedTiles = tiles.map((t) =>
      t.id === tile.id ? { ...t, isFlipped: true } : t
    );
    setTiles(updatedTiles);
    setFlippedTiles([...flippedTiles, tile]);

    if (flippedTiles.length === 1) {
      const [firstTile] = flippedTiles;

      if (firstTile.image === tile.image) {
        // Match found
        setMatchedTiles([...matchedTiles, firstTile.id, tile.id]);
        setFlippedTiles([]);
      } else {
        // No match - hide tiles after delay
        setTimeout(() => {
          setTiles((prevTiles) =>
            prevTiles.map((t) =>
              t.id === firstTile.id || t.id === tile.id
                ? { ...t, isFlipped: false }
                : t
            )
          );
          setFlippedTiles([]);
        }, 1000);
      }
    }
  };

  return (
    <div className="tile-match-container">
      <h2>Peek-a-chu</h2>
      {isGameWon ? (
        <div className="win-message">🎉 You Win! 🎉</div>
      ) : (
        <div className="tiles-grid">
          {tiles.map((tile) => (
            <div
              key={tile.id}
              className={`tile ${
                tile.isFlipped || matchedTiles.includes(tile.id)
                  ? "flipped"
                  : ""
              }`}
              onClick={() => handleTileClick(tile)}
            >
              <div className="tile-front">
                <img src={tile.image} alt="tile" />
              </div>
              <div className="tile-back">❓</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TileMatch;
