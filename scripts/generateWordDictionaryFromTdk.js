const fs = require('fs/promises');
const path = require('path');

const TDK_AUTOCOMPLETE_URL = 'https://sozluk.gov.tr/autocomplete.json';

const OUTPUT_FILE_PATH = path.join(
  __dirname,
  '..',
  'src',
  'data',
  'wordDictionary.ts',
);

const MIN_WORD_LENGTH = 3;
const MAX_WORD_LENGTH = 8;

// 0 olursa tüm uygun kelimeleri yazar.
// Performans sorunu olursa örnek: MAX_WORD_COUNT=5000 yapabiliriz.
const MAX_WORD_COUNT = Number(process.env.MAX_WORD_COUNT || 0);

const TURKISH_WORD_REGEX = /^[A-ZÇĞİÖŞÜ]+$/u;

const normalizeWord = rawWord => {
  if (!rawWord) {
    return null;
  }

  let word = String(rawWord)
    .trim()
    .replace(/\u00A0/g, ' ')
    .replace(/[âÂ]/g, 'a')
    .replace(/[îÎ]/g, 'i')
    .replace(/[ûÛ]/g, 'u')
    .replace(/\s+/g, ' ');

  // Çok kelimeli ifadeleri, birleşik yazılmayan sözleri, özel biçimleri alma.
  if (
    word.includes(' ') ||
    word.includes('-') ||
    word.includes("'") ||
    word.includes('’') ||
    word.includes('.') ||
    word.includes(',') ||
    word.includes('(') ||
    word.includes(')')
  ) {
    return null;
  }

  word = word.toLocaleUpperCase('tr-TR');

  if (word.length < MIN_WORD_LENGTH || word.length > MAX_WORD_LENGTH) {
    return null;
  }

  if (!TURKISH_WORD_REGEX.test(word)) {
    return null;
  }

  return word;
};

const extractWord = item => {
  if (typeof item === 'string') {
    return item;
  }

  if (!item || typeof item !== 'object') {
    return null;
  }

  return item.madde || item.madde_duz || item.kelime || item.word || null;
};

const isProperName = item => {
  if (!item || typeof item !== 'object') {
    return false;
  }

  return item.ozel_mi === '1' || item.ozel_mi === 1 || item.ozel_mi === true;
};

const escapeWord = word => {
  return word.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
};

const buildDictionaryFileContent = words => {
  const generatedAt = new Date().toISOString();

  return `// Bu dosya otomatik üretilmiştir.
// Kaynak: ${TDK_AUTOCOMPLETE_URL}
// Üretim tarihi: ${generatedAt}
// Kelime sayısı: ${words.length}
// Kural: ${MIN_WORD_LENGTH}-${MAX_WORD_LENGTH} harf, tek kelime, Türkçe karakter uyumlu.

export const WORD_DICTIONARY: string[] = [
${words.map(word => `  '${escapeWord(word)}',`).join('\n')}
];
`;
};

const main = async () => {
  console.log('TDK kelime listesi indiriliyor...');

  const response = await fetch(TDK_AUTOCOMPLETE_URL, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'WordCrushApp-DictionaryGenerator/1.0',
    },
  });

  if (!response.ok) {
    throw new Error(`TDK isteği başarısız oldu. HTTP ${response.status}`);
  }

  const data = await response.json();

  if (!Array.isArray(data)) {
    throw new Error('Beklenmeyen TDK cevap formatı. Array bekleniyordu.');
  }

  const wordSet = new Set();

  data.forEach(item => {
    if (isProperName(item)) {
      return;
    }

    const rawWord = extractWord(item);
    const normalizedWord = normalizeWord(rawWord);

    if (!normalizedWord) {
      return;
    }

    wordSet.add(normalizedWord);
  });

  let words = [...wordSet].sort((a, b) => {
    if (a.length === b.length) {
      return a.localeCompare(b, 'tr');
    }

    return a.length - b.length;
  });

  if (MAX_WORD_COUNT > 0) {
    words = words.slice(0, MAX_WORD_COUNT);
  }

  const fileContent = buildDictionaryFileContent(words);

  await fs.writeFile(OUTPUT_FILE_PATH, fileContent, 'utf8');

  console.log(`Tamamlandı. ${words.length} kelime yazıldı.`);
  console.log(`Dosya: ${OUTPUT_FILE_PATH}`);
};

main().catch(error => {
  console.error('Sözlük oluşturulamadı.');
  console.error(error);
  process.exit(1);
});