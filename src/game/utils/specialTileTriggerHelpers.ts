import {Cell, CellPosition} from '../../types/game';
import {collectSpecialTileAffectedCells} from './specialTileHelpers';
import {uniqueCellPositions} from './cellPositionHelpers';

export const getTriggeredSpecialCellsFromSelection = (
  grid: Cell[][],
  selectedCells: CellPosition[],
): CellPosition[] => {
  let affectedCells: CellPosition[] = [...selectedCells];

  selectedCells
    .map(position => grid[position.row]?.[position.col])
    .filter(cell => cell?.specialTile)
    .forEach(cell => {
      if (!cell?.specialTile) {
        return;
      }

      const collected = collectSpecialTileAffectedCells(
        grid,
        {row: cell.row, col: cell.col},
        cell.specialTile,
      );

      affectedCells = [...affectedCells, ...collected];
    });

  return uniqueCellPositions(affectedCells);
};

export const getTriggeredSpecialTileCountFromSelection = (
  grid: Cell[][],
  selectedCells: CellPosition[],
): number => {
  return selectedCells
    .map(position => grid[position.row]?.[position.col])
    .filter(cell => cell?.specialTile).length;
};