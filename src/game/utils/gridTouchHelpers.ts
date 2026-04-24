import {CellPosition} from '../../types/game';

export const getCellFromTouch = ({
  x,
  y,
  cellSize,
  cellGap,
  gridSize,
}: {
  x: number;
  y: number;
  cellSize: number;
  cellGap: number;
  gridSize: number;
}): CellPosition | null => {
  const fullCellSize = cellSize + cellGap;
  const boardSize = gridSize * fullCellSize - cellGap;

  if (x < 0 || y < 0 || x > boardSize || y > boardSize) {
    return null;
  }

  const col = Math.floor(x / fullCellSize);
  const row = Math.floor(y / fullCellSize);

  if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
    return null;
  }

  const offsetX = x - col * fullCellSize;
  const offsetY = y - row * fullCellSize;

  const tolerance = gridSize === 6 ? cellGap * 0.35 : cellGap;

  if (offsetX > cellSize + tolerance || offsetY > cellSize + tolerance) {
    return null;
  }

  return {row, col};
};