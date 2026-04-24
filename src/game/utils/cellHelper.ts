import { CellPosition } from "../../types/game";

export const isSameCell = (first: CellPosition, second: CellPosition): boolean => {
    return first.row === second.row && first.col === second.col;
};

export const isAdjacentCell = (first: CellPosition, second: CellPosition): boolean => {
    const rowDiff = Math.abs(first.row - second.row);
    const colDiff = Math.abs(first.col - second.col);

    if(rowDiff === 0 && colDiff === 0) {
        return false;
    }

    return rowDiff <= 1 && colDiff <= 1;
};

export const isCellSelected = ( selectedCells: CellPosition[], target: CellPosition): boolean => {
    return selectedCells.some(cell => isSameCell(cell, target));
};