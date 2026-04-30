import { WORD_DICTIONARY } from "../../data/wordDictionary";
import { WORD_SET } from "./dictionaryIndex";
import { calculateWordScore } from "./scoreHelpers";

export type ComboResult = {
    words: string[];
    totalScore: number;
};

const generateSubsequences = (word: string): string[] => {
    const normalizedWord = word.trim().toLocaleUpperCase('tr-TR');
    const results = new Set<string>();

    const dfs = (index: number, current: string) => {
        if (index === normalizedWord.length) {
            if (current.length >= 3) {
                results.add(current);
            }

            return;
        }

        dfs(index + 1, current + normalizedWord[index]);
        dfs(index + 1, current);
    };

    dfs(0, '');

    return[...results];
};

export const getComboWords = (mainWord: string): string[] => {
    return generateSubsequences(mainWord)
        .filter(word => WORD_SET.has(word))
        .sort((a, b) => {
            if (b.length === a.length) {
                return a.localeCompare(b, 'tr');
            }

            return b.length - a.length;
        });
};

export const calculateComboResult = (mainWord: string): ComboResult => {
    const comboWords = getComboWords(mainWord);

    const totalScore = comboWords.reduce((total, word) => total + calculateWordScore(word), 0);

    return {words: comboWords, totalScore};
};