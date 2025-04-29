
import React from "react";
import { GameState } from "@/models/GameTypes";

interface GameInfoProps {
  gameState: GameState;
  onStart: () => void;
  onReset: () => void;
}

const GameInfo: React.FC<GameInfoProps> = ({ gameState, onStart, onReset }) => {
  return (
    <div className="absolute top-0 left-0 right-0 flex justify-between p-4 text-white z-10">
      <div className="flex gap-6">
        <div className="text-lg font-bold">Score: {gameState.score}</div>
        <div className="text-lg font-bold">Lives: {gameState.lives}</div>
        <div className="text-lg font-bold">Level: {gameState.level}</div>
      </div>
      <div className="flex gap-2">
        {!gameState.playing && !gameState.gameOver && (
          <button 
            onClick={onStart} 
            className="px-4 py-2 bg-neon-green rounded-lg shadow-[0_0_10px_rgba(0,255,0,0.5)] hover:shadow-[0_0_15px_rgba(0,255,0,0.8)] transition-shadow"
          >
            Start Game
          </button>
        )}
        {gameState.gameOver && (
          <button 
            onClick={onReset} 
            className="px-4 py-2 bg-neon-pink rounded-lg shadow-[0_0_10px_rgba(255,0,255,0.5)] hover:shadow-[0_0_15px_rgba(255,0,255,0.8)] transition-shadow"
          >
            New Game
          </button>
        )}
      </div>
    </div>
  );
};

export default GameInfo;
