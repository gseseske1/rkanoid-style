
import React from "react";
import { Block as BlockType } from "@/models/GameTypes";
import { cn } from "@/lib/utils";

interface BlockProps {
  block: BlockType;
}

const Block: React.FC<BlockProps> = ({ block }) => {
  if (block.destroyed) {
    return null;
  }

  return (
    <div
      className={cn(
        "absolute rounded-sm border border-white/20",
        block.destroyed && "block-destroy"
      )}
      style={{
        width: `${block.size.width}px`,
        height: `${block.size.height}px`,
        left: `${block.position.x}px`,
        top: `${block.position.y}px`,
        backgroundColor: block.color,
        boxShadow: `0 0 8px 1px ${block.color}80`,
      }}
    />
  );
};

export default Block;
