import {setJokerInventory} from '../../storage/marketStorage';
import {
  ActiveJokerType,
  Cell,
  CellPosition,
  JokerInventory,
  JokerType,
} from '../../types/game';

export const consumeJoker = async (
  inventory: JokerInventory,
  jokerType: JokerType,
): Promise<JokerInventory> => {
  const updatedInventory: JokerInventory = {
    ...inventory,
    [jokerType]: Math.max(inventory[jokerType] - 1, 0),
  };

  await setJokerInventory(updatedInventory);
  return updatedInventory;
};

export const getFishRemovalCount = (gridSize: number): number => {
  const totalCellCount = gridSize * gridSize;

  if (totalCellCount <= 36) {
    return 3;
  }

  if (totalCellCount <= 64) {
    return 4;
  }

  return 5;
};

export const getRandomCellsForFish = (
  currentGrid: Cell[][],
  count: number,
): CellPosition[] => {
  const allCells: CellPosition[] = [];

  currentGrid.forEach(row => {
    row.forEach(cell => {
      if (cell) {
        allCells.push({row: cell.row, col: cell.col});
      }
    });
  });

  const shuffled = [...allCells].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
};

export const getActiveJokerLabel = (
  activeJoker: ActiveJokerType,
): string => {
  switch (activeJoker) {
    case 'lollipop':
      return 'Lolipop Kırıcı';
    case 'fish':
      return 'Balık';
    default:
      return 'Yok';
  }
};