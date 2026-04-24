import { LETTER_SCORES } from "../../constants/letterScores"

export const calculateWordScore = (word: string): number => {
    return word
        .toUpperCase()
        .split('')
        .reduce((total, letter) => {
            return total + (LETTER_SCORES[letter] ?? 0);
        }, 0);
};