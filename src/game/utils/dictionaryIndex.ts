import { WORD_DICTIONARY } from "../../data/wordDictionary";

export type TrieNode = {
    children: Map<string, TrieNode>;
    word?: string;
};

export const MIN_WORD_LENGTH = 3;
export const MAX_WORD_LENGTH = 8;

const normalizeWord = (word: string): string => {
    return word.trim().toLocaleUpperCase('tr-TR');
};

export const WORD_SET = new Set(WORD_DICTIONARY.map(normalizeWord).filter(word => word.length >= MIN_WORD_LENGTH && word.length <= MAX_WORD_LENGTH));

export const buildTrie = (words: string[]): TrieNode => {
    const root: TrieNode = { children: new Map()};

    words.forEach(rawWord => {
        const word = normalizeWord(rawWord);

        if (word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) {
            return;
        }

        let currentNode = root;

        for (const letter of word) {
            if (!currentNode.children.has(letter)) {
                currentNode.children.set(letter, {children: new Map()});
            }

            currentNode = currentNode.children.get(letter)!;
        }

        currentNode.word = word;
    });

    return root;
};

export const WORD_TRIE = buildTrie([...WORD_SET]);

export const isDictionaryWord = (word: string): boolean => {
    const normalizedWord = normalizeWord(word);

    if (normalizedWord.length < MIN_WORD_LENGTH) {
        return false;
    }

    return WORD_SET.has(normalizedWord);
};