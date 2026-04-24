import {WORD_DICTIONARY} from '../../data/wordDictionary';
import {Cell, GridCell} from '../../types/game';

const WEIGHTED_LETTERS: string[] = [
  ...Array(12).fill('A'),
  ...Array(12).fill('E'),
  ...Array(10).fill('İ'),
  ...Array(8).fill('L'),
  ...Array(8).fill('R'),
  ...Array(8).fill('N'),

  ...Array(6).fill('K'),
  ...Array(6).fill('M'),
  ...Array(6).fill('T'),
  ...Array(6).fill('S'),
  ...Array(5).fill('Y'),
  ...Array(5).fill('D'),

  ...Array(2).fill('O'),
  ...Array(2).fill('U'),
  ...Array(2).fill('B'),
  ...Array(2).fill('C'),
  ...Array(2).fill('Ç'),
  ...Array(2).fill('P'),
  ...Array(2).fill('G'),
  ...Array(2).fill('H'),
  ...Array(2).fill('Ş'),
  ...Array(2).fill('Ü'),
  ...Array(2).fill('Z'),

  'J',
  'Ğ',
  'F',
  'V',
  'Ö',
];

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

export const getRandomWeightedLetter = (): string => {
  const index = Math.floor(Math.random() * WEIGHTED_LETTERS.length);
  return WEIGHTED_LETTERS[index];
};

const shuffleArray = <T>(array: T[]): T[] => {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[j]] = [copied[j], copied[i]];
  }

  return copied;
};

const isInsideGrid = (row: number, col: number, size: number): boolean => {
  return row >= 0 && row < size && col >= 0 && col < size;
};

const getCandidateWords = (size: number): string[] => {
  return WORD_DICTIONARY.filter(word => word.length >= 3 && word.length <= size);
};

const findPathForWord = (
  size: number,
  wordLength: number,
): Array<{row: number; col: number}> | null => {
  const visited = Array.from({length: size}, () => Array(size).fill(false));

  const dfs = (
    row: number,
    col: number,
    depth: number,
    path: Array<{row: number; col: number}>,
  ): Array<{row: number; col: number}> | null => {
    if (depth === wordLength) {
      return path;
    }

    const shuffledDirections = shuffleArray(DIRECTIONS);

    for (const [dRow, dCol] of shuffledDirections) {
      const nextRow = row + dRow;
      const nextCol = col + dCol;

      if (!isInsideGrid(nextRow, nextCol, size)) {
        continue;
      }

      if (visited[nextRow][nextCol]) {
        continue;
      }

      visited[nextRow][nextCol] = true;

      const result = dfs(nextRow, nextCol, depth + 1, [
        ...path,
        {row: nextRow, col: nextCol},
      ]);

      if (result) {
        return result;
      }

      visited[nextRow][nextCol] = false;
    }

    return null;
  };

  const allStartPoints: Array<{row: number; col: number}> = [];

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      allStartPoints.push({row, col});
    }
  }

  const shuffledStartPoints = shuffleArray(allStartPoints);

  for (const start of shuffledStartPoints) {
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        visited[r][c] = false;
      }
    }

    visited[start.row][start.col] = true;

    const result = dfs(start.row, start.col, 1, [start]);

    if (result) {
      return result;
    }
  }

  return null;
};

const createEmptyGrid = (size: number): GridCell[][] => {
  return Array.from({length: size}, (_, row) =>
    Array.from({length: size}, (_, col) => ({
      row,
      col,
      letter: '',
      specialTile: null,
    })),
  );
};

const fillRemainingCells = (grid: GridCell[][]): Cell[][] => {
  return grid.map((row, rowIndex) => 
    row.map((cell, colIndex) => ({
      row: rowIndex,
      col: colIndex,
      letter: cell?.letter || getRandomWeightedLetter(),
      specialTile: cell?.specialTile ?? null,
    })),
  );
};

export const generateGrid = (size: number): Cell[][] => {
  const candidateWords = getCandidateWords(size);

  if (candidateWords.length === 0) {
    return fillRemainingCells(createEmptyGrid(size));
  }

  const selectedWord =
    candidateWords[Math.floor(Math.random() * candidateWords.length)];

  const path = findPathForWord(size, selectedWord.length);
  const grid = createEmptyGrid(size);

  if (!path) {
    return fillRemainingCells(grid);
  }

  path.forEach((position, index) => {
    grid[position.row][position.col] = {
      row: position.row,
      col: position.col,
      letter: selectedWord[index],
      specialTile: null,
    };
  });

  return fillRemainingCells(grid);
};