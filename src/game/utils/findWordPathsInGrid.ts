import {WORD_DICTIONARY} from '../../data/wordDictionary';
import {Cell, CellPosition, FoundWordPath} from '../../types/game';
import { MAX_WORD_LENGTH, TrieNode, WORD_TRIE } from './dictionaryIndex';

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

export const findWordPathsInGrid = (grid: Cell[][]): FoundWordPath[] => {
  const size = grid.length;
  const foundWordMap = new Map<string, CellPosition[]>();

  const dfs = ({
    row,
    col,
    node,
    visited,
    path,
  }: {
    row: number;
    col: number;
    node: TrieNode;
    visited: boolean[][];
    path: CellPosition[];
  } ) => {
    if (!isInsideGrid(row, col, size)) {
      return;
    }

    if (visited[row][col]) {
      return;
    }

    if (path.length >= MAX_WORD_LENGTH) {
      return;
    }

    const cell = grid[row][col];

    if (!cell?.letter) {
      return;
    }

    const letter = cell.letter.toLocaleUpperCase('tr-TR');
    const nextNode = node.children.get(letter);

    if (!nextNode) {
      return;
    }

    const nextPath = [...path, {row, col}];

    if (nextNode.word && !foundWordMap.has(nextNode.word)) {
      foundWordMap.set(nextNode.word, nextPath);
    }

    visited[row][col] = true;

    for (const [dRow, dCol] of DIRECTIONS) {
      dfs({
        row: row + dRow,
        col: col + dCol,
        node: nextNode,
        visited,
        path: nextPath,
      });
    }

    visited[row][col] = false;
  };

  for (let row = 0; row < size; row++) {
    for (let col = 0; col < size; col++) {
      const visited = Array.from({length: size}, () => Array(size).fill(false));
      dfs({
        row,
        col,
        node: WORD_TRIE,
        visited,
        path: [],
      });
    }
  }

  return [...foundWordMap.entries()].map(([word, path]) => ({word, path})).sort((a, b) => {
    if (b.word.length === a.word.length) {
      return a.word.localeCompare(b.word, 'tr');
    }

    return b.word.length - a.word.length;
  });
};