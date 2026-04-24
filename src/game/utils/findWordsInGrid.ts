import { WORD_DICTIONARY } from "../../data/wordDictionary";
import { Cell, GridCell } from "../../types/game";

const DIRECTIONS = [
  [-1, -1],
  [-1, 0],
  [-1, 1],
  [0, -1],
  [0, 1],
  [1, -1],
  [1, 0],
  [1, 1],
];

const isInsideGrid = (row: number, col: number, size: number): boolean => {
    return row >= 0 && row < size && col >= 0 && col < size;
};

const canBuildWordFromCell = (
    grid: GridCell[][],
    word: string,
    row: number,
    col: number,
    index: number,
    visited: boolean[][],
): boolean => {
    const size = grid.length;

    if(!isInsideGrid(row,col,size)) {
        return false;
    }

    if(visited[row][col]) {
        return false;
    }

    if(!grid[row][col] || grid[row][col]?.letter !== word[index]) {
        return false;
    }

    if(index === word.length - 1) {
        return true;
    }

    visited[row][col] = true;

    for (const [dRow, dCol] of DIRECTIONS) {
        const nextRow = row + dRow;
        const nextCol = col + dCol;

        if( canBuildWordFromCell(grid,word,nextRow,nextCol, index + 1, visited)) {
            visited[row][col] = false;
            return true;
        }
    }

    visited[row][col] = false;
    return false;
};

const canBuildWord = (grid: GridCell[][], word: string): boolean => {
    const size = grid.length;

    for (let row = 0; row < size; row++) {
        for (let col = 0; col < size; col++) {
            const visited = Array.from({length: size}, () => Array(size).fill(false));

            if(canBuildWordFromCell(grid,word,row,col,0,visited)) {
                return true;
            }
        }
    }

    return false;
};

export const findWordsInGrid = (grid: GridCell[][]): string[] => {
    const foundWords: string[] = [];

    for(const word of WORD_DICTIONARY) {
        if(word.length < 3) {
            continue;
        }

        if(canBuildWord(grid,word)) {
            foundWords.push(word);
        }
    }

    return foundWords;
};