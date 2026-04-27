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

export const getWheelAffectedCells = (
  gridSize: number,
  origin: CellPosition,
): CellPosition[] => {
  const affectedCells: CellPosition[] = [];

  for (let col = 0; col < gridSize; col++) {
    affectedCells.push({row: origin.row, col});
  }

  for (let row = 0; row < gridSize; row++) {
    affectedCells.push({row, col: origin.col});
  }

  const uniqueMap = new Map<string, CellPosition>();

  affectedCells.forEach(cell => {
    uniqueMap.set(`${cell.row}-${cell.col}`, cell);
  });

  return [...uniqueMap.values()];
};

export const getAllGridCellPositions = (gridSize: number): CellPosition[] => {
  const positions: CellPosition[] = [];

  for (let row = 0; row < gridSize; row++) {
    for (let col = 0; col < gridSize; col++) {
      positions.push({row, col});
    }
  }

  return positions;
};

const shuffleArray = <T>(array: T[]): T[] => {
  const copied = [...array];

  for (let i = copied.length - 1; i > 0; i--) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copied[i], copied[randomIndex]] = [copied[randomIndex], copied[i]];
  }

  return copied;
};

export const shuffleGridCells = (grid: Cell[][]): Cell[][] => {
  const cellContents = grid.flat().map(cell => ({
    letter: cell.letter,
    specialTile: cell.specialTile ?? null,
  }));

  const shuffledContents = shuffleArray(cellContents);
  let contentIndex = 0;

  return grid.map((row, rowIndex) =>
    row.map((_cell, colIndex) => {
      const content = shuffledContents[contentIndex];
      contentIndex++;

      return {
        row: rowIndex,
        col: colIndex,
        letter: content.letter,
        specialTile: content.specialTile,
      };
    }),
  );
};

export const swapGridCells = (
  grid: Cell[][],
  first: CellPosition,
  second: CellPosition,
): Cell[][] => {
  const copiedGrid = grid.map(row => row.map(cell => ({...cell})));

  const firstCell = copiedGrid[first.row][first.col];
  const secondCell = copiedGrid[second.row][second.col];

  copiedGrid[first.row][first.col] = {
    ...secondCell,
    row: first.row,
    col: first.col,
  };

  copiedGrid[second.row][second.col] = {
    ...firstCell,
    row: second.row,
    col: second.col,
  };

  return copiedGrid;
};

export const getActiveJokerLabel = (
  activeJoker: ActiveJokerType,
): string => {
  switch (activeJoker) {
    case 'lollipop':
      return 'Lolipop Kırıcı';
    case 'fish':
      return 'Balık';
    case 'wheel':
      return 'Tekerlek';
    case 'shuffle':
      return 'Harf Karıştırma';
    case 'party':
      return 'Parti Güçlendiricisi';
    case 'swap':
      return 'Serbest Değiştirme';
    default:
      return 'Yok';
  }
};