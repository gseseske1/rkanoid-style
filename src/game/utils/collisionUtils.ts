import { Ball, Block, Paddle, Position } from "@/models/GameTypes";

/**
 * Checks for collision between the ball and walls
 */
export const checkWallCollision = (
  ball: Ball, 
  containerWidth: number, 
  containerHeight: number
): { collision: boolean; newVelocity?: { dx: number; dy: number }, newPosition?: Position } => {
  // Left/right wall collision
  if (
    ball.position.x - ball.radius <= 0 ||
    ball.position.x + ball.radius >= containerWidth
  ) {
    return {
      collision: true,
      newVelocity: { 
        dx: -ball.velocity.dx, 
        dy: ball.velocity.dy 
      },
      newPosition: {
        x: ball.velocity.dx > 0 
          ? containerWidth - ball.radius 
          : ball.radius,
        y: ball.position.y,
      }
    };
  }
  
  // Ceiling collision
  if (ball.position.y - ball.radius <= 0) {
    return {
      collision: true,
      newVelocity: { 
        dx: ball.velocity.dx, 
        dy: -ball.velocity.dy 
      },
      newPosition: { 
        x: ball.position.x, 
        y: ball.radius 
      }
    };
  }
  
  // Bottom wall collision - ball out of bounds
  if (ball.position.y + ball.radius >= containerHeight) {
    return {
      collision: true,
      // No velocity change, this indicates ball went out of bounds
    };
  }
  
  return { collision: false };
};

/**
 * Checks for collision between the ball and paddle
 */
export const checkPaddleCollision = (
  ball: Ball, 
  paddle: Paddle, 
  newPosition: Position
): { collision: boolean; newVelocity?: { dx: number; dy: number }, newPosition?: Position } => {
  if (
    newPosition.y + ball.radius >= paddle.position.y &&
    newPosition.y - ball.radius <= paddle.position.y + paddle.size.height &&
    newPosition.x + ball.radius >= paddle.position.x &&
    newPosition.x - ball.radius <= paddle.position.x + paddle.size.width
  ) {
    // Calculate where on the paddle the ball hit (normalized from -1 to 1)
    const hitPoint = (newPosition.x - (paddle.position.x + paddle.size.width / 2)) / (paddle.size.width / 2);
    
    // Angle the ball based on where it hit the paddle
    const angle = hitPoint * (Math.PI / 4); // Max 45 degree angle
    const speed = Math.sqrt(ball.velocity.dx ** 2 + ball.velocity.dy ** 2);
    
    return {
      collision: true,
      newVelocity: {
        dx: Math.sin(angle) * speed,
        dy: -Math.abs(Math.cos(angle) * speed), // Always go up
      },
      newPosition: {
        x: newPosition.x,
        y: paddle.position.y - ball.radius, // Place just above paddle
      }
    };
  }
  
  return { collision: false };
};

/**
 * Checks for collision between the ball and a block
 */
export const checkBlockCollision = (
  ball: Ball,
  block: Block,
  newPosition: Position
): { collision: boolean; newVelocity?: { dx: number; dy: number } } => {
  if (
    !block.destroyed &&
    newPosition.x + ball.radius >= block.position.x &&
    newPosition.x - ball.radius <= block.position.x + block.size.width &&
    newPosition.y + ball.radius >= block.position.y &&
    newPosition.y - ball.radius <= block.position.y + block.size.height
  ) {
    // Find collision side and bounce accordingly
    const ballCenterX = newPosition.x;
    const ballCenterY = newPosition.y;
    const blockCenterX = block.position.x + block.size.width / 2;
    const blockCenterY = block.position.y + block.size.height / 2;
    
    const deltaX = ballCenterX - blockCenterX;
    const deltaY = ballCenterY - blockCenterY;
    
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    // Simplification: if the ball is more to the sides, bounce horizontally
    // otherwise bounce vertically
    const horizontalCollision = absX * block.size.height > absY * block.size.width;
    
    return {
      collision: true,
      newVelocity: {
        dx: horizontalCollision ? -ball.velocity.dx : ball.velocity.dx,
        dy: horizontalCollision ? ball.velocity.dy : -ball.velocity.dy,
      }
    };
  }
  
  return { collision: false };
};
