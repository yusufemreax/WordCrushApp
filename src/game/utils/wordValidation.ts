import {WORD_DICTIONARY} from '../../data/wordDictionary';
import { isDictionaryWord } from './dictionaryIndex';

export const isValidWord = (word: string): boolean => {
  return isDictionaryWord(word);
};