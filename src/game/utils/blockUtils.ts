
import { Block, NFLTeam } from "@/models/GameTypes";
import { BLOCK_WIDTH, BLOCK_HEIGHT, BLOCK_GAP, BLOCK_COLUMNS, BLOCK_ROWS } from "../constants";
import { NFL_TEAMS } from "@/data/nflTeams";

/**
 * Creates blocks for the game level
 */
export const createBlocks = (containerWidth: number): Block[] => {
  const availableWidth = containerWidth - (BLOCK_GAP * 2);
  const blockWithGap = BLOCK_WIDTH + BLOCK_GAP;
  
  // Fixed layout for exactly 32 blocks (8 columns x 4 rows)
  const blocksPerRow = BLOCK_COLUMNS;
  const marginX = (containerWidth - blocksPerRow * blockWithGap + BLOCK_GAP) / 2;
  
  const newBlocks: Block[] = [];
  let teamIndex = 0;
  
  // Create blocks in rows and columns - exactly 32 blocks (8x4)
  for (let row = 0; row < BLOCK_ROWS; row++) {
    for (let col = 0; col < blocksPerRow; col++) {
      const team = NFL_TEAMS[teamIndex];
      
      const block: Block = {
        position: {
          x: marginX + col * blockWithGap,
          y: 80 + row * (BLOCK_HEIGHT + BLOCK_GAP),
        },
        size: { width: BLOCK_WIDTH, height: BLOCK_HEIGHT },
        color: team.color,
        value: (BLOCK_ROWS - row) * 10, // Higher rows are worth more
        destroyed: false,
        team: team,
      };
      
      newBlocks.push(block);
      teamIndex++;
      
      // Should have exactly 32 blocks for 32 NFL teams
      if (teamIndex >= NFL_TEAMS.length) break;
    }
    
    // Break if we've added all 32 team blocks
    if (teamIndex >= NFL_TEAMS.length) break;
  }
  
  return newBlocks;
};
