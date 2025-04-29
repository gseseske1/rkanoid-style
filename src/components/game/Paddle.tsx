
import React from "react";
import { Paddle as PaddleType } from "@/models/GameTypes";

interface PaddleProps {
  paddle: PaddleType;
}

const Paddle: React.FC<PaddleProps> = ({ paddle }) => {
  return (
    <div
      className="absolute rounded-lg overflow-hidden"
      style={{
        width: `${paddle.size.width}px`,
        height: `${paddle.size.height}px`,
        left: `${paddle.position.x}px`,
        top: `${paddle.position.y}px`,
      }}
    >
      <img 
        src="/lovable-uploads/176cb1dc-daa1-4ac3-a4e0-096a365e1f09.png" 
        alt="Whale paddle"
        className="w-full h-full object-cover"
        style={{
          objectPosition: "center 20%", // Focus on the top part of the whale
        }}
      />
    </div>
  );
};

export default Paddle;
