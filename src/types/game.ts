export type SpecialTileType =
    | 'row_clear'
    | 'bomb'
    | 'column_clear'
    | 'mega_bomb';

export type JokerType = 
    | 'fish'
    | 'wheel'
    | 'lollipop'
    | 'swap'
    | 'shuffle'
    | 'party';

export type ActiveJokerType = null | 'lollipop' | 'fish';

export type Cell = {
    row: number;
    col: number;
    letter: string;
    specialTile?: SpecialTileType | null;
};

export type CellPosition = {
    row: number;
    col: number;
};

export type GridCell = Cell | null;

export type JokerInventory = Record<JokerType, number>;

export type GameHistoryItem = {
    id: string;
    playedAt: string;
    gridSize: number;
    score: number;
    foundWordCount: number;
    longestWord: string;
    durationInSeconds: number;
};