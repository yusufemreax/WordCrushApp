import AsyncStorage from "@react-native-async-storage/async-storage";

const USERNAME_KEY = 'username';

export const saveUsername = async (username: string): Promise<void> => {
    await AsyncStorage.setItem(USERNAME_KEY,username);
};

export const getUsername = async (): Promise<string | null> => {
    return await AsyncStorage.getItem(USERNAME_KEY);
};

export const clearUsername = async (): Promise<void> => {
    await AsyncStorage.removeItem(USERNAME_KEY);
};