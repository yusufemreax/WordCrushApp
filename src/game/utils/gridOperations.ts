import { Cell, CellPosition, GridCell } from "../../types/game";
import { findWordsInGrid } from "./findWordsInGrid";
import { getRandomWeightedLetter } from "./generateGrid";

const sortPositionsForRemoval = (positions: CellPosition[]): CellPosition[] => {
    return [...positions].sort((a, b) => {
        if(a.col === b.col) {
            return b.row - a.row;
        }

        return a.col - b.col;
    });
};

export const removeSelectedCells = (grid: Cell[][], selectedCells: CellPosition[]): GridCell[][] => {
    const newGrid: GridCell[][] = grid.map(row => row.map(cell => ({...cell})),);

    const sortedPositions = sortPositionsForRemoval(selectedCells);

    sortedPositions.forEach(position => {
        newGrid[position.row][position.col] = null;
    });

    return newGrid;
};

export const applyGravity = (grid: GridCell[][]): Cell[][] => {
    const size = grid.length;

    const result: Cell[][] = Array.from({length: size}, 
        (_, row) => Array.from({length: size},(_,col) => ({
            row,
            col,
            letter: '',
            specialTile: null,
        })),
    );

    for (let col = 0; col < size; col++) {
        const occupiedCells: Array<{letter: string; specialTile?: Cell['specialTile'];}> = [];

        const lettersInColumn: string[] = [];

        for (let row = size - 1; row >= 0; row--) {
            const cell = grid[row][col];
            
            if (!cell) {
                continue;
            }

            const isOccupied = Boolean(cell.letter) || Boolean(cell.specialTile);

            if (isOccupied) {
                occupiedCells.push({
                    letter: cell.letter,
                    specialTile: cell.specialTile ?? null,
                });
            }
        }

        let targetRow = size - 1;

        for (const cellData of occupiedCells) {
            result[targetRow][col] = {
                row: targetRow,
                col,
                letter: cellData.letter,
                specialTile: cellData.specialTile ?? null,
            };
            targetRow--;
        }

        while (targetRow >= 0) {
            result[targetRow][col] = {
                row: targetRow,
                col,
                letter: getRandomWeightedLetter(),
                specialTile: null,
            };
            targetRow--;
        }
    }

    return result;
};

export const processValidWordMove = (grid: Cell[][], selectedCells: CellPosition[]) => {
    const removedGrid = removeSelectedCells(grid,selectedCells);
    const updatedGrid = applyGravity(removedGrid);
    const availableWords = findWordsInGrid(updatedGrid);

    return {
        updatedGrid,
        availableWords,
    };
};