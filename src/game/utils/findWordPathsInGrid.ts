import {WORD_DICTIONARY} from '../../data/wordDictionary';
import {Cell, CellPosition, FoundWordPath} from '../../types/game';

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

const findPathForWordFromCell = (
  grid: Cell[][],
  word: string,
  row: number,
  col: number,
  index: number,
  visited: boolean[][],
  path: CellPosition[],
): CellPosition[] | null => {
  const size = grid.length;

  if (!isInsideGrid(row, col, size)) {
    return null;
  }

  if (visited[row][col]) {
    return null;
  }

  const cell = grid[row][col];

  if (!cell || cell.letter !== word[index]) {
    return null;
  }

  const nextPath = [...path, {row, col}];

  if (index === word.length - 1) {
    return nextPath;
  }

  visited[row][col] = true;

  for (const [dRow, dCol] of DIRECTIONS) {
    const nextRow = row + dRow;
    const nextCol = col + dCol;

    const result = findPathForWordFromCell(
      grid,
      word,
      nextRow,
      nextCol,
      index + 1,
      visited,
      nextPath,
    );

    if (result) {
      visited[row][col] = false;
      return result;
    }
  }

  visited[row][col] = false;
  return null;
};

const findPathForWord = (grid: Cell[][], word: string): CellPosition[] | null => {
  const size = grid.length;

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const visited = Array.from({length: size}, () =>
        Array(size).fill(false),
      );

      const result = findPathForWordFromCell(
        grid,
        word,
        row,
        col,
        0,
        visited,
        [],
      );

      if (result) {
        return result;
      }
    }
  }

  return null;
};

export const findWordPathsInGrid = (grid: Cell[][]): FoundWordPath[] => {
  const foundWords: FoundWordPath[] = [];

  WORD_DICTIONARY.forEach(word => {
    const normalizedWord = word.trim().toUpperCase();

    if (normalizedWord.length < 3) {
      return;
    }

    const path = findPathForWord(grid, normalizedWord);

    if (path) {
      foundWords.push({
        word: normalizedWord,
        path,
      });
    }
  });

  return foundWords;
};