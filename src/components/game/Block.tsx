
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

  // Special handling for Chicago Bears logo
  const isChicagoBears = block.team?.id === "chi";

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
    >
      {block.team && (
        <div className="w-full h-full flex items-center justify-center p-1 overflow-hidden">
          {isChicagoBears ? (
            <div className="w-full h-full flex items-center justify-center text-white font-bold text-sm">
              CHI
            </div>
          ) : (
            <img 
              src={block.team.logoUrl} 
              alt={block.team.name}
              className="max-w-full max-h-full object-contain"
              loading="eager"
              onError={(e) => {
                // Fallback if image fails to load
                const target = e.target as HTMLImageElement;
                target.onerror = null;
                target.style.display = 'none';
                target.parentElement!.innerHTML = block.team?.name.substring(0, 3) || '';
              }}
            />
          )}
        </div>
      )}
    </div>
  );
};

export default Block;
