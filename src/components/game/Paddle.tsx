
import React from "react";
import { Paddle as PaddleType } from "@/models/GameTypes";

interface PaddleProps {
  paddle: PaddleType;
}

const Paddle: React.FC<PaddleProps> = ({ paddle }) => {
  return (
    <div
      className="absolute rounded-lg bg-neon-blue shadow-[0_0_15px_2px_rgba(0,255,255,0.7)]"
      style={{
        width: `${paddle.size.width}px`,
        height: `${paddle.size.height}px`,
        left: `${paddle.position.x}px`,
        top: `${paddle.position.y}px`,
      }}
    />
  );
};

export default Paddle;
