import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Ball, 
  Block, 
  GameState, 
  Paddle, 
  Position
} from "@/models/GameTypes";

// Game configuration
const PADDLE_WIDTH = 100;
const PADDLE_HEIGHT = 15;
const BALL_RADIUS = 10;
const INITIAL_BALL_SPEED = 5;
const BLOCK_WIDTH = 60;
const BLOCK_HEIGHT = 20;
const BLOCK_ROWS = 5;
const BLOCK_GAP = 6;
const INITIAL_LIVES = 3;

// Colors for the blocks by row
const BLOCK_COLORS = [
  "bg-gameBlock-red",
  "bg-gameBlock-orange",
  "bg-gameBlock-yellow",
  "bg-gameBlock-green",
  "bg-gameBlock-blue",
  "bg-gameBlock-purple",
];

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

    const paddleY = containerSizeRef.current.height - 50;
    const paddleX = (containerSizeRef.current.width - PADDLE_WIDTH) / 2;

    setPaddle({
      position: { x: paddleX, y: paddleY },
      size: { width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
      speed: 15,
    });

    setBall({
      position: { 
        x: paddleX + PADDLE_WIDTH / 2, 
        y: paddleY - BALL_RADIUS - 2 
      },
      velocity: { dx: 0, dy: 0 },
      radius: BALL_RADIUS,
      size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
    });

    createBlocks();
  }, [gameContainerRef]);

  // Create blocks for the level
  const createBlocks = useCallback(() => {
    if (!gameContainerRef.current) return;

    const container = gameContainerRef.current.getBoundingClientRect();
    const blocksPerRow = Math.floor(
      (container.width - BLOCK_GAP) / (BLOCK_WIDTH + BLOCK_GAP)
    );
    const marginX = (container.width - blocksPerRow * (BLOCK_WIDTH + BLOCK_GAP) + BLOCK_GAP) / 2;
    
    const newBlocks: Block[] = [];
    
    // Create blocks in rows and columns
    for (let row = 0; row < BLOCK_ROWS; row++) {
      for (let col = 0; col < blocksPerRow; col++) {
        const block: Block = {
          position: {
            x: marginX + col * (BLOCK_WIDTH + BLOCK_GAP),
            y: 80 + row * (BLOCK_HEIGHT + BLOCK_GAP),
          },
          size: { width: BLOCK_WIDTH, height: BLOCK_HEIGHT },
          color: BLOCK_COLORS[row % BLOCK_COLORS.length],
          value: (BLOCK_ROWS - row) * 10, // Higher rows are worth more
          destroyed: false,
        };
        newBlocks.push(block);
      }
    }
    
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
        velocity: {
          dx: Math.random() > 0.5 ? INITIAL_BALL_SPEED : -INITIAL_BALL_SPEED,
          dy: -INITIAL_BALL_SPEED,
        },
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
    
    // Reset ball and paddle
    const paddleY = containerSizeRef.current.height - 50;
    const paddleX = (containerSizeRef.current.width - PADDLE_WIDTH) / 2;
    
    setPaddle((prev) => ({
      ...prev,
      position: { x: paddleX, y: paddleY },
    }));
    
    setBall({
      position: { 
        x: paddleX + PADDLE_WIDTH / 2, 
        y: paddleY - BALL_RADIUS - 2 
      },
      velocity: { dx: 0, dy: 0 },
      radius: BALL_RADIUS,
      size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
    });
    
    // Create new blocks
    createBlocks();
  }, [createBlocks]);

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
    
    // Move the ball
    const newBallPosition: Position = {
      x: ball.position.x + ball.velocity.dx,
      y: ball.position.y + ball.velocity.dy,
    };
    
    // Wall collisions
    if (
      newBallPosition.x - ball.radius <= 0 ||
      newBallPosition.x + ball.radius >= containerSizeRef.current.width
    ) {
      // Bounce off the left/right walls
      setBall((prev) => ({
        ...prev,
        velocity: { ...prev.velocity, dx: -prev.velocity.dx },
        position: {
          x: prev.velocity.dx > 0 
            ? containerSizeRef.current.width - prev.radius 
            : prev.radius,
          y: newBallPosition.y,
        },
      }));
      return;
    }
    
    if (newBallPosition.y - ball.radius <= 0) {
      // Bounce off the ceiling
      setBall((prev) => ({
        ...prev,
        velocity: { ...prev.velocity, dy: -prev.velocity.dy },
        position: { x: newBallPosition.x, y: prev.radius },
      }));
      return;
    }
    
    if (newBallPosition.y + ball.radius >= containerSizeRef.current.height) {
      // Ball went below the screen
      if (gameState.lives > 1) {
        // Lose a life and reset ball position
        setGameState((prev) => ({
          ...prev,
          lives: prev.lives - 1,
          playing: false,
        }));
        
        // Reset ball on paddle
        const paddleY = containerSizeRef.current.height - 50;
        const paddleCenter = paddle.position.x + paddle.size.width / 2;
        
        setBall({
          position: { 
            x: paddleCenter, 
            y: paddleY - BALL_RADIUS - 2 
          },
          velocity: { dx: 0, dy: 0 },
          radius: BALL_RADIUS,
          size: { width: BALL_RADIUS * 2, height: BALL_RADIUS * 2 },
        });
      } else {
        // Game over
        setGameState((prev) => ({
          ...prev,
          gameOver: true,
          playing: false,
        }));
      }
      return;
    }
    
    // Paddle collision
    if (
      newBallPosition.y + ball.radius >= paddle.position.y &&
      newBallPosition.y - ball.radius <= paddle.position.y + paddle.size.height &&
      newBallPosition.x + ball.radius >= paddle.position.x &&
      newBallPosition.x - ball.radius <= paddle.position.x + paddle.size.width
    ) {
      // Calculate where on the paddle the ball hit (normalized from -1 to 1)
      const hitPoint = (newBallPosition.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2);
      
      // Angle the ball based on where it hit the paddle
      const angle = hitPoint * (Math.PI / 4); // Max 45 degree angle
      const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2);
      
      setBall((prev) => ({
        ...prev,
        velocity: {
          dx: Math.sin(angle) * speed,
          dy: -Math.abs(Math.cos(angle) * speed), // Always go up
        },
        position: {
          x: newBallPosition.x,
          y: paddle.position.y - ball.radius, // Place just above paddle
        },
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
      if (
        newBallPosition.x + ball.radius >= block.position.x &&
        newBallPosition.x - ball.radius <= block.position.x + block.size.width &&
        newBallPosition.y + ball.radius >= block.position.y &&
        newBallPosition.y - ball.radius <= block.position.y + block.size.height
      ) {
        hasCollision = true;
        
        // Find collision side and bounce accordingly
        const ballCenterX = newBallPosition.x;
        const ballCenterY = newBallPosition.y;
        const blockCenterX = block.position.x + block.size.width / 2;
        const blockCenterY = block.position.y + block.size.height / 2;
        
        const deltaX = ballCenterX - blockCenterX;
        const deltaY = ballCenterY - blockCenterY;
        
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Simplification: if the ball is more to the sides, bounce horizontally
        // otherwise bounce vertically
        const horizontalCollision = absX * block.size.height > absY * block.size.width;
        
        setBall((prev) => ({
          ...prev,
          velocity: {
            dx: horizontalCollision ? -prev.velocity.dx : prev.velocity.dx,
            dy: horizontalCollision ? prev.velocity.dy : -prev.velocity.dy,
          },
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
    
  }, [ball, blocks, gameState.lives, gameState.playing, nextLevel, paddle]);

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
