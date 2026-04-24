import AsyncStorage from "@react-native-async-storage/async-storage";
import { JokerInventory, JokerType } from "../types/game";

const GOLD_KEY = 'gold_amount';
const INVENTORY_KEY = 'joker_inventory';
const DEFAULT_GOLD = 9999;

const DEFAULT_INVENTORY: JokerInventory = {
    fish: 0,
    wheel: 0,
    lollipop: 0,
    swap: 0,
    shuffle: 0,
    party: 0,
};

export const getGoldAmount = async (): Promise<number> => {
    const rawValue = await AsyncStorage.getItem(GOLD_KEY);

    if(!rawValue) {
        await AsyncStorage.setItem(GOLD_KEY, DEFAULT_GOLD.toString());
        return DEFAULT_GOLD;
    }

    const parsed = Number(rawValue);
    return Number.isNaN(parsed) ? DEFAULT_GOLD : parsed;
};

export const setGoldAmount = async (amount: number): Promise<void> => {
    await AsyncStorage.setItem(GOLD_KEY,amount.toString());
};

export const getJokerInventory = async (): Promise<JokerInventory> => {
    const rawValue = await AsyncStorage.getItem(INVENTORY_KEY);

    if(!rawValue) {
        await AsyncStorage.setItem(INVENTORY_KEY, JSON.stringify(DEFAULT_INVENTORY));
        return DEFAULT_INVENTORY;
    }

    try {
        return {
            ...DEFAULT_INVENTORY,
            ...(JSON.parse(rawValue) as JokerInventory),
        };
    } catch {
        return DEFAULT_INVENTORY;
    }
};

export const setJokerInventory = async (inventory: JokerInventory): Promise<void> => {
    await AsyncStorage.setItem(INVENTORY_KEY,JSON.stringify(inventory));
};

export const purchaseJoker = async ( jokerType: JokerType, price: number): Promise<{success: boolean; message: string}> => {
    const currentGold = await getGoldAmount();

    if(currentGold < price) {
        return {
            success: false,
            message: 'Yeterli altının yok.'
        };
    }

    const currentInventory = await getJokerInventory();

    const updatedGold = currentGold - price;
    const updatedInventory: JokerInventory = {
        ...currentInventory,
        [jokerType]: currentInventory[jokerType] + 1,
    };

    await setGoldAmount(updatedGold);
    await setJokerInventory(updatedInventory);

    return {
        success: true,
        message: 'Joker satın alındı.',
    };
};