import {FoundWordPath} from '../../types/game';

const getPathKeySet = (path: FoundWordPath): Set<string> => {
  return new Set(path.path.map(cell => `${cell.row}-${cell.col}`));
};

const hasConflict = (
  usedCells: Set<string>,
  candidate: FoundWordPath,
): boolean => {
  return candidate.path.some(cell => usedCells.has(`${cell.row}-${cell.col}`));
};

export const selectNonOverlappingWords = (
  wordPaths: FoundWordPath[],
): FoundWordPath[] => {
  const sortedWords = [...wordPaths].sort((a, b) => {
    if (b.word.length === a.word.length) {
      return a.word.localeCompare(b.word, 'tr');
    }

    return b.word.length - a.word.length;
  });

  const selectedWords: FoundWordPath[] = [];
  const usedCells = new Set<string>();

  sortedWords.forEach(candidate => {
    if (hasConflict(usedCells, candidate)) {
      return;
    }

    selectedWords.push(candidate);

    const candidateCells = getPathKeySet(candidate);
    candidateCells.forEach(cellKey => usedCells.add(cellKey));
  });

  return selectedWords;
};