import { addGameHistoryItem } from "../../storage/gameHistoryStorage";
import { GameHistoryItem } from "../../types/game";
export const buildGameHistoryItem = ({
    gridSize,
    score,
    foundWords,
    startedAt,
}: {
    gridSize: number;
    score: number;
    foundWords: string[];
    startedAt: number;
}): GameHistoryItem => {
    const now = Date.now();
    const durationInSeconds = Math.max(1, Math.floor((now - startedAt) / 1000));

    const longestWord = foundWords.length > 0 ? [...foundWords].sort((a, b) => b.length - a.length)[0] : '-';

    return {
        id: `${Date.now()}_${Math.random().toString(36).slice(2,9)}`,
        playedAt: new Date().toISOString(),
        gridSize,
        score,
        foundWordCount: foundWords.length,
        longestWord,
        durationInSeconds,
    };
};

export const saveGameHistoryItem = async (item: GameHistoryItem): Promise<void> => {
    await addGameHistoryItem(item);
};