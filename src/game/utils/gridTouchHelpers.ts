import { CellPosition } from "../../types/game";

export const getCellFromTouch = ({
    x,
    y,
    cellSize,
    cellGap,
    gridSize
}: {
    x: number;
    y: number;
    cellSize: number;
    cellGap: number;
    gridSize: number;
}) : CellPosition | null => {
    const fullCellSize = cellSize + cellGap;

    const col = Math.floor(x / fullCellSize);
    const row = Math.floor(y / fullCellSize);

    if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
        return null;
    }

    const offsetX = x - col * fullCellSize;
    const offsetY = y - row * fullCellSize;

    if (offsetX > cellSize || offsetY > cellSize) {
        return null;
    }

    return {row, col};
};