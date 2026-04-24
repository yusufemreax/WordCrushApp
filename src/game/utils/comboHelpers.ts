import { WORD_DICTIONARY } from "../../data/wordDictionary";
import { calculateWordScore } from "./scoreHelpers";

export type ComboResult = {
    words: string[];
    totalScore: number;
};

const isSubsequence = (mainWord: string, candidateWord: string): boolean => {
    let candidateIndex = 0;

    for (let i = 0; i < mainWord.length; i++) {
        if (mainWord[i] === candidateWord[candidateIndex]) {
            candidateIndex++;
        }

        if(candidateIndex === candidateWord.length) {
            return true;
        }
    }

    return false;
};

export const getComboWords = (mainWord: string): string[] => {
    const normalizedMainWord = mainWord.trim().toUpperCase();

    const uniqueWords = new Set<string>();

    WORD_DICTIONARY.forEach(word => {
        const normalizedCandidate = word.trim().toUpperCase();

        if (normalizedCandidate.length < 3) {
            return;
        }

        if(normalizedCandidate.length > normalizedMainWord.length) {
            return;
        }

        if(isSubsequence(normalizedMainWord, normalizedCandidate)) {
            uniqueWords.add(normalizedCandidate);
        }
    });

    return [...uniqueWords].sort((a, b) => {
        if (b.length === a.length) {
            return a.localeCompare(b, 'tr');
        }

        return b.length - a.length;
    });
};

export const calculateComboResult = (mainWord: string): ComboResult => {
    const comboWords = getComboWords(mainWord);
    const totalScore = comboWords.reduce((total, word) => total + calculateWordScore(word), 0);

    return {
        words: comboWords,
        totalScore
    };
};