import {JokerType} from '../types/game';

export type JokerDefinition = {
  key: JokerType;
  name: string;
  price: number;
  description: string;
};

export const JOKER_DEFINITIONS: JokerDefinition[] = [
  {
    key: 'fish',
    name: 'Balık',
    price: 100,
    description: 'Gridde rastgele harfleri yok eder.',
  },
  {
    key: 'wheel',
    name: 'Tekerlek',
    price: 200,
    description: 'Seçilen harfin satır ve sütununu temizler.',
  },
  {
    key: 'lollipop',
    name: 'Lolipop Kırıcı',
    price: 75,
    description: 'Seçilen tek bir harfi yok eder.',
  },
  {
    key: 'swap',
    name: 'Serbest Değiştirme',
    price: 125,
    description: 'Birbirine temas eden iki harfin yerini değiştirir.',
  },
  {
    key: 'shuffle',
    name: 'Harf Karıştırma',
    price: 300,
    description: 'Griddeki tüm harfleri karıştırır.',
  },
  {
    key: 'party',
    name: 'Parti Güçlendiricisi',
    price: 400,
    description: 'Tüm harfleri siler ve yeniden üretir.',
  },
];