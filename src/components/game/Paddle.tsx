
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
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <img 
        src="/lovable-uploads/e7867c96-018b-492f-9170-3bfa9e01ab0b.png"
        alt="Whale paddle"
        className="h-full object-contain"
        style={{ 
          width: "50%", // Half the width
          height: "200%", // Twice the height
          filter: "drop-shadow(0 0 8px rgba(75,235,226,0.6))",
          transformOrigin: "center bottom"
        }}
      />
    </div>
  );
};

export default Paddle;
