import { Cell, CellPosition, SpecialTileType } from "../../types/game";

export const getSpecialTileByWordLength = ( wordLength: number ): SpecialTileType | null => {
    if(wordLength === 4) {
        return 'row_clear';
    }

    if(wordLength === 5) {
        return 'bomb';
    }
    
    if (wordLength === 6) {
        return 'column_clear';
    }

    if (wordLength >= 7) {
        return 'mega_bomb';
    }

    return null;
};

export const applySpecialTileToLastCell = ( grid: Cell[][], lastCell: CellPosition, specialTile: SpecialTileType | null): Cell[][] => {
    if (!specialTile) {
        return grid;
    }

    return grid.map(row => 
        row.map(cell => {
            if (cell.row === lastCell.row && cell.col === lastCell.col) {
                return {
                    ...cell,
                    specialTile,
                };
            }

            return cell;
        }),
    );
};

export const getSpecialTileLabel = ( specialTile?: SpecialTileType | null): string => {
    switch (specialTile) {
        case 'row_clear':
            return '⇆';
        case 'bomb':
            return '✹';
        case 'column_clear':
            return '⇅';
        case 'mega_bomb':
            return '✪';
        default:
            return '';
    }
};

export const collectSpecialTileAffectedCells = ( grid: Cell[][], origin: CellPosition, specialTile: SpecialTileType): CellPosition[] => {
    const size = grid.length;
    const affected: CellPosition[] = [];

    if (specialTile === 'row_clear') {
        for (let col = 0; col < size; col++) {
            affected.push({row: origin.row, col});
        }
    }

    if (specialTile === 'column_clear') {
        for (let row = 0; row < size; row++) {
            affected.push({row, col: origin.col});
        }
    }

    if (specialTile === 'bomb') {
        for (let row = origin.row - 1; row <= origin.row + 1; row++) {
            for (let col = origin.col - 1; col <= origin.col + 1; col++) {
                if (row >= 0 && row < size && col >= 0 && col < size) {
                    affected.push({row, col});
                }
            }
        }
    }

    if (specialTile === 'mega_bomb') {
        for (let row = origin.row - 2; row <= origin.row + 2; row++) {
            for (let col = origin.col - 2; col <= origin.col + 2; col++) {
                if (row >= 0 && row < size && col >= 0 && col < size) {
                    affected.push({row, col});
                }
            }
        }
    }

    const uniqueMap = new Map<string, CellPosition>();

    affected.forEach(position => {
        uniqueMap.set(`${position.row}-${position.col}`, position);
    });

    return [...uniqueMap.values()];
};