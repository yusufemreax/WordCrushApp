import AsyncStorage from "@react-native-async-storage/async-storage";
import { GameHistoryItem } from "../types/game";

const GAME_HISTORY_KEY = 'game_history';

export const getGameHistory = async (): Promise<GameHistoryItem[]> => {
    const rawValue = await AsyncStorage.getItem(GAME_HISTORY_KEY);

    if(!rawValue) {
        return [];
    }

    try {
        return JSON.parse(rawValue) as GameHistoryItem[];
    } catch {
        return [];
    }
};

export const saveGameHistory = async (history: GameHistoryItem[]): Promise<void> => {
    await AsyncStorage.setItem(GAME_HISTORY_KEY, JSON.stringify(history));
};

export const addGameHistoryItem = async (item: GameHistoryItem): Promise<void> => {
    const currentHistory = await getGameHistory();
    const updatedHistory = [item, ...currentHistory];
    await saveGameHistory(updatedHistory);
};