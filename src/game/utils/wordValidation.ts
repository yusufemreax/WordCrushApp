import { WORD_DICTIONARY } from "../../data/wordDictionary";

export const isValidWord = (word: string): boolean => {
    const normalizedWord = word.trim().toUpperCase();
    return WORD_DICTIONARY.includes(normalizedWord);
};