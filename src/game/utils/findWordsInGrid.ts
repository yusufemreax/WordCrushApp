import {Cell} from '../../types/game';
import {findWordPathsInGrid} from './findWordPathsInGrid';

export const findWordsInGrid = (grid: Cell[][]): string[] => {
  return findWordPathsInGrid(grid).map(item => item.word);
};