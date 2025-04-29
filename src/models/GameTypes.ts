
// Game-related types

export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  dx: number;
  dy: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface GameObject {
  position: Position;
  size: Size;
}

export interface Ball extends GameObject {
  velocity: Velocity;
  radius: number;
}

export interface Paddle extends GameObject {
  speed: number;
}

export interface Block extends GameObject {
  color: string;
  value: number;
  destroyed: boolean;
}

export interface GameState {
  playing: boolean;
  gameOver: boolean;
  score: number;
  lives: number;
  level: number;
}
