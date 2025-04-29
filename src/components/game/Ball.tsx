
import React from "react";
import { Ball as BallType } from "@/models/GameTypes";

interface BallProps {
  ball: BallType;
}

const Ball: React.FC<BallProps> = ({ ball }) => {
  return (
    <div
      className="absolute rounded-full bg-white shadow-[0_0_10px_1px_rgba(255,255,255,0.7)]"
      style={{
        width: `${ball.radius * 2}px`,
        height: `${ball.radius * 2}px`,
        left: `${ball.position.x - ball.radius}px`,
        top: `${ball.position.y - ball.radius}px`,
      }}
    />
  );
};

export default Ball;
