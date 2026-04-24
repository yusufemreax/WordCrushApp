import { Cell, CellPosition } from "../../types/game";

export const hasAnySpecialTile = (grid: Cell[][]): boolean => {
    return grid.some(row => row.some(cell => !!cell?.specialTile));
};

export const getAllSpecialTilePositions = (grid: Cell[][]): CellPosition[] => {
    const positions: CellPosition[] = [];

    grid.forEach(row => {
        row.forEach(cell => {
            if (cell?.specialTile) {
                positions.push({row: cell.row, col: cell.col});
            }
        });
    });

    return positions;
};