
import { Ball, GameState, Paddle, Position } from "@/models/GameTypes";
import { INITIAL_BALL_SPEED } from "../constants";

/**
 * Sets up a new level
 */
export const setupNewLevel = (
  paddleWidth: number, 
  containerWidth: number, 
  containerHeight: number
): { paddlePos: Position, ballPos: Position } => {
  const paddleY = containerHeight - 50;
  const paddleX = (containerWidth - paddleWidth) / 2;

  return {
    paddlePos: { x: paddleX, y: paddleY },
    ballPos: { 
      x: paddleX + paddleWidth / 2, 
      y: paddleY - 10 - 2 // ball radius - 2
    }
  };
};

/**
 * Handles ball going out of bounds
 */
export const handleBallOutOfBounds = (
  gameState: GameState,
  paddle: Paddle,
  containerHeight: number
): { 
  updatedGameState: GameState, 
  newBallPosition: Position, 
  newBallVelocity: { dx: number, dy: number } 
} => {
  const updatedGameState = {
    ...gameState,
    lives: gameState.lives - 1,
    playing: gameState.lives > 1 ? false : gameState.playing,
    gameOver: gameState.lives <= 1
  };
  
  const paddleY = containerHeight - 50;
  const paddleCenter = paddle.position.x + paddle.size.width / 2;
  
  return {
    updatedGameState,
    newBallPosition: { 
      x: paddleCenter, 
      y: paddleY - 10 - 2 // ball radius - 2
    },
    newBallVelocity: { dx: 0, dy: 0 }
  };
};

/**
 * Launches the ball with initial velocity
 */
export const launchBall = (): { dx: number, dy: number } => {
  return {
    dx: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
    dy: -INITIAL_BALL_SPEED,
  };
};
