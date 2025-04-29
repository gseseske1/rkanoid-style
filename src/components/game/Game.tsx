
import React, { useRef } from "react";
import { useArkanoidGame } from "@/hooks/useArkanoidGame";
import Ball from "./Ball";
import Paddle from "./Paddle";
import Block from "./Block";
import GameInfo from "./GameInfo";

const Game: React.FC = () => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  
  const { ball, paddle, blocks, gameState, startGame, resetGame } = useArkanoidGame(
    gameContainerRef
  );

  return (
    <div className="w-full h-full flex flex-col items-center justify-center">
      <div className="w-full max-w-3xl mx-auto">
        <div 
          ref={gameContainerRef} 
          className="relative w-full aspect-[4/3] border border-white/20 rounded-md overflow-hidden bg-black/90 game-container"
          style={{ 
            boxShadow: "0 0 30px rgba(150, 150, 255, 0.3), inset 0 0 30px rgba(0, 0, 0, 0.5)" 
          }}
        >
          <div className="absolute inset-0" 
               style={{ 
                 backgroundImage: "radial-gradient(circle, rgba(25, 25, 35, 0.8) 0%, rgba(10, 10, 20, 0.95) 100%)",
               }} 
          />
          
          <GameInfo 
            gameState={gameState}
            onStart={startGame}
            onReset={resetGame}
          />
          
          {gameState.gameOver && (
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-black/80 p-8 rounded-lg text-center">
                <h2 className="text-neon-pink text-4xl font-bold mb-4 shadow-text-lg">
                  Game Over
                </h2>
                <p className="text-white text-xl mb-6">
                  Final Score: {gameState.score}
                </p>
              </div>
            </div>
          )}
          
          <Ball ball={ball} />
          <Paddle paddle={paddle} />
          
          {blocks.map((block, index) => (
            <Block key={index} block={block} />
          ))}
          
          {!gameState.playing && !gameState.gameOver && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-4 rounded-lg text-center">
                <h2 className="text-white text-2xl mb-2">
                  {gameState.level === 1 
                    ? "Welcome to Arkanoid!" 
                    : `Level ${gameState.level}`}
                </h2>
                <p className="text-gray-300">
                  Click Start or press Space to begin
                </p>
              </div>
            </div>
          )}
        </div>
        
        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Controls: Move paddle with mouse/touch or arrow keys (←→)</p>
        </div>
      </div>
    </div>
  );
};

export default Game;
