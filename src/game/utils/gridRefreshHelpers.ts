import { Cell } from "../../types/game";
import { findWordsInGrid } from "./findWordsInGrid";
import { generateGrid } from "./generateGrid";

const getSpecialTileCells = (grid: Cell[][]): Cell[] => {
    return grid.flat().filter(cell => !!cell.specialTile);
};

export const regenerateGridPreservingSpecialTiles = (currentGrid: Cell[][], gridSize: number): Cell[][] => {
    const specialTileCells = getSpecialTileCells(currentGrid);
    const regeneratedGrid = generateGrid(gridSize);

    specialTileCells.forEach(specialCell => {
        regeneratedGrid[specialCell.row][specialCell.col] = {
            ...specialCell,
            row: specialCell.row,
            col: specialCell.col
        };
    });

    return regeneratedGrid;
};

export const regeneratePlayableGridPreservingSpecialTiles = (currentGrid: Cell[][], gridSize: number): { regeneratedGrid: Cell[][]; regeneratedWords: string[]; } => {
  let regeneratedGrid = regenerateGridPreservingSpecialTiles(
    currentGrid,
    gridSize,
  );
  let regeneratedWords = findWordsInGrid(regeneratedGrid);
  let retryCount = 0;

  while (regeneratedWords.length === 0 && retryCount < 5) {
    regeneratedGrid = regenerateGridPreservingSpecialTiles(
      currentGrid,
      gridSize,
    );
    regeneratedWords = findWordsInGrid(regeneratedGrid);
    retryCount++;
  }

  return {
    regeneratedGrid,
    regeneratedWords,
  };
};