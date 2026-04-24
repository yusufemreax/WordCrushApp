export type GridSize= 6 | 8 | 10;
export type MoveCount = 15 | 20 | 25;

export type RootStackParamList = {
    Onboarding: undefined;
    Home: undefined;
    NewGame: undefined;
    Scoreboard: undefined;
    Market: undefined;
    Game: {
        gridSize: GridSize;
        moveCount: MoveCount;
    };
};