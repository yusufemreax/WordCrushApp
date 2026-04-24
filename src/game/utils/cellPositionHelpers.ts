import {CellPosition} from '../../types/game';

export const uniqueCellPositions = (
  positions: CellPosition[],
): CellPosition[] => {
  const map = new Map<string, CellPosition>();

  positions.forEach(position => {
    map.set(`${position.row}-${position.col}`, position);
  });

  return [...map.values()];
};