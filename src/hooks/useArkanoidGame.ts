
import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Ball, 
  Block, 
  GameState, 
  Paddle, 
  Position
} from "@/models/GameTypes";
import { 
  PADDLE_WIDTH, 
  PADDLE_HEIGHT, 
  BALL_RADIUS, 
  INITIAL_LIVES 
} from "@/game/constants";
import { createBlocks } from "@/game/utils/blockUtils";
import { 
  checkWallCollision, 
  checkPaddleCollision, 
  checkBlockCollision 
} from "@/game/utils/collisionUtils";
import { 
  setupNewLevel, 
  handleBallOutOfBounds, 
  launchBall 
} from "@/game/utils/gameStateUtils";

export const useArkanoidGame = (
  gameContainerRef: React.RefObject<HTMLDivElement>
) => {
  const [gameState, setGameState] = useState<GameState>({
    playing: false,
    gameOver: false,
    score: 0,
    lives: INITIAL_LIVES,
    level: 1,
  });

  const [ball, setBall] = useState<Ball>({
    position: { x: 0, y: 0 },
    velocity: { dx: 0, dy: 0 },
    radius: BALL_RADIUS,
    size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
  });

  const [paddle, setPaddle] = useState<Paddle>({
    position: { x: 0, y: 0 },
    size: { width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
    speed: 15,
  });

  const [blocks, setBlocks] = useState<Block[]>([]);

  const requestRef = useRef<number>();
  const previousTimeRef = useRef<number>();
  const containerSizeRef = useRef({ width: 0, height: 0 });
  const keysPressed = useRef<Set<string>>(new Set());

  // Initialize the game
  const initGame = useCallback(() => {
    if (!gameContainerRef.current) return;

    const rect = gameContainerRef.current.getBoundingClientRect();
    containerSizeRef.current = {
      width: rect.width,
      height: rect.height,
    };

    const { paddlePos, ballPos } = setupNewLevel(
      PADDLE_WIDTH,
      containerSizeRef.current.width,
      containerSizeRef.current.height
    );

    setPaddle({
      position: paddlePos,
      size: { width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
      speed: 15,
    });

    setBall({
      position: ballPos,
      velocity: { dx: 0, dy: 0 },
      radius: BALL_RADIUS,
      size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
    });

    const newBlocks = createBlocks(containerSizeRef.current.width);
    setBlocks(newBlocks);
  }, [gameContainerRef]);

  // Start the game
  const startGame = useCallback(() => {
    if (gameState.gameOver) {
      // Reset game if it was game over
      setGameState({
        playing: true,
        gameOver: false,
        score: 0,
        lives: INITIAL_LIVES,
        level: 1,
      });
      initGame();
    } else {
      setGameState((prev) => ({ ...prev, playing: true }));
      // Launch the ball
      setBall((prevBall) => ({
        ...prevBall,
        velocity: launchBall(),
      }));
    }
  }, [gameState.gameOver, initGame]);

  // Reset the game
  const resetGame = useCallback(() => {
    setGameState({
      playing: false,
      gameOver: false,
      score: 0,
      lives: INITIAL_LIVES,
      level: 1,
    });
    initGame();
  }, [initGame]);

  // Handle next level
  const nextLevel = useCallback(() => {
    setGameState((prev) => ({
      ...prev,
      playing: false,
      level: prev.level + 1,
    }));
    
    const { paddlePos, ballPos } = setupNewLevel(
      PADDLE_WIDTH,
      containerSizeRef.current.width,
      containerSizeRef.current.height
    );
    
    setPaddle((prev) => ({
      ...prev,
      position: paddlePos,
    }));
    
    setBall({
      position: ballPos,
      velocity: { dx: 0, dy: 0 },
      radius: BALL_RADIUS,
      size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
    });
    
    const newBlocks = createBlocks(containerSizeRef.current.width);
    setBlocks(newBlocks);
  }, []);

  // Handle ball movement and collisions
  const updateGame = useCallback((time: number) => {
    if (!gameState.playing) return;
    
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time;
    }
    
    const deltaTime = time - previousTimeRef.current;
    previousTimeRef.current = time;
    
    // Handle paddle movement
    let newPaddleX = paddle.position.x;
    
    if (keysPressed.current.has("ArrowLeft") || keysPressed.current.has("a")) {
      newPaddleX = Math.max(0, paddle.position.x - paddle.speed);
    }
    
    if (keysPressed.current.has("ArrowRight") || keysPressed.current.has("d")) {
      newPaddleX = Math.min(
        containerSizeRef.current.width - paddle.size.width,
        paddle.position.x + paddle.speed
      );
    }
    
    if (newPaddleX !== paddle.position.x) {
      setPaddle((prev) => ({
        ...prev,
        position: { ...prev.position, x: newPaddleX },
      }));
    }
    
    // Calculate new ball position
    const newBallPosition: Position = {
      x: ball.position.x + ball.velocity.dx,
      y: ball.position.y + ball.velocity.dy,
    };
    
    // Check wall collisions
    const wallCollision = checkWallCollision(
      ball, 
      containerSizeRef.current.width, 
      containerSizeRef.current.height
    );
    
    if (wallCollision.collision) {
      if (wallCollision.newVelocity) {
        // Normal wall collision (left, right, top)
        setBall((prev) => ({
          ...prev,
          velocity: wallCollision.newVelocity!,
          position: wallCollision.newPosition!,
        }));
      } else {
        // Ball went out of bounds (bottom)
        const { updatedGameState, newBallPosition, newBallVelocity } = handleBallOutOfBounds(
          gameState,
          paddle,
          containerSizeRef.current.height
        );
        
        setGameState(updatedGameState);
        
        setBall({
          ...ball,
          position: newBallPosition,
          velocity: newBallVelocity,
        });
      }
      return;
    }
    
    // Check paddle collision
    const paddleCollision = checkPaddleCollision(ball, paddle, newBallPosition);
    
    if (paddleCollision.collision) {
      setBall((prev) => ({
        ...prev,
        velocity: paddleCollision.newVelocity!,
        position: paddleCollision.newPosition!,
      }));
      return;
    }
    
    // Check block collisions
    let hasCollision = false;
    let allBlocksDestroyed = true;
    
    const updatedBlocks = blocks.map((block) => {
      if (block.destroyed) return block;
      
      allBlocksDestroyed = false;
      
      // Check for collision with this block
      const blockCollision = checkBlockCollision(ball, block, newBallPosition);
      
      if (blockCollision.collision) {
        hasCollision = true;
        
        setBall((prev) => ({
          ...prev,
          velocity: blockCollision.newVelocity!,
        }));
        
        // Update score
        setGameState((prev) => ({
          ...prev,
          score: prev.score + block.value,
        }));
        
        // Mark block as destroyed
        return { ...block, destroyed: true };
      }
      
      return block;
    });
    
    if (hasCollision) {
      setBlocks(updatedBlocks);
    }
    
    // Check if all blocks are destroyed to level up
    if (allBlocksDestroyed && blocks.length > 0) {
      nextLevel();
      return;
    }
    
    // Update ball position if no collisions occurred
    if (!hasCollision) {
      setBall((prev) => ({
        ...prev,
        position: newBallPosition,
      }));
    }
    
  }, [ball, blocks, gameState, nextLevel, paddle]);

  // Game loop using requestAnimationFrame
  useEffect(() => {
    const animate = (time: number) => {
      updateGame(time);
      requestRef.current = requestAnimationFrame(animate);
    };
    
    if (gameState.playing && !gameState.gameOver) {
      requestRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [gameState.playing, gameState.gameOver, updateGame]);

  // Event listeners for keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.key);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.key);
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  // Mouse/touch movement for paddle control
  useEffect(() => {
    if (!gameContainerRef.current) return;

    const handleMouseMove = (e: MouseEvent) => {
      const containerRect = gameContainerRef.current!.getBoundingClientRect();
      const relativeX = e.clientX - containerRect.left;
      const newX = Math.max(
        0,
        Math.min(
          containerRect.width - paddle.size.width,
          relativeX - paddle.size.width / 2
        )
      );

      setPaddle((prev) => ({
        ...prev,
        position: { ...prev.position, x: newX },
      }));
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const touch = e.touches[0];
      const containerRect = gameContainerRef.current!.getBoundingClientRect();
      const relativeX = touch.clientX - containerRect.left;
      const newX = Math.max(
        0,
        Math.min(
          containerRect.width - paddle.size.width,
          relativeX - paddle.size.width / 2
        )
      );

      setPaddle((prev) => ({
        ...prev,
        position: { ...prev.position, x: newX },
      }));
    };

    const container = gameContainerRef.current;
    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("touchmove", handleTouchMove, { passive: false });

    return () => {
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("touchmove", handleTouchMove);
    };
  }, [gameContainerRef, paddle.size.width]);

  // Initialize the game when component mounts
  useEffect(() => {
    initGame();
    // Add window resize handler
    const handleResize = () => {
      initGame();
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [initGame]);

  return {
    ball,
    paddle,
    blocks,
    gameState,
    startGame,
    resetGame,
    containerSize: containerSizeRef.current,
  };
};
