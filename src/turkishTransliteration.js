const TRANSLITERATION_DATA_URL = '/data/quran-transliteration-tr.json';
const EXPECTED_VERSE_COUNT = 6236;

const TURKISH_FRIENDLY_CHARACTERS = Object.freeze({
  'ŝ': 's',
  'ż': 'z',
  'ḍ': 'd',
  'ḥ': 'h',
  'ḫ': 'h',
  'ḳ': 'k',
  'ṣ': 's',
  'ṭ': 't',
  'ẕ': 'z',
  '`': '’',
});

const TURKISH_FRIENDLY_PATTERN = /[ŝżḍḥḫḳṣṭẕ`]/gu;
let transliterationDataRequest = null;

export const normalizeTurkishTransliteration = (text = '') => {
  const normalized = String(text).replace(
    TURKISH_FRIENDLY_PATTERN,
    character => TURKISH_FRIENDLY_CHARACTERS[character],
  );

  return normalized
    ? `${normalized[0].toLocaleUpperCase('tr-TR')}${normalized.slice(1)}`
    : '';
};

export const loadTurkishTransliteration = async () => {
  if (!transliterationDataRequest) {
    transliterationDataRequest = fetch(TRANSLITERATION_DATA_URL)
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        if (data?.metadata?.verseCount !== EXPECTED_VERSE_COUNT || !data?.chapters) {
          throw new Error('Tanzil ceviriyazi veri dosyasi eksik veya gecersiz.');
        }
        return data;
      })
      .catch((error) => {
        transliterationDataRequest = null;
        throw error;
      });
  }

  return transliterationDataRequest;
};

export const getTurkishTransliteration = (data, chapterNumber, verseNumber) => {
  const sourceText = data?.chapters?.[String(chapterNumber)]?.[Number(verseNumber) - 1];
  return sourceText ? normalizeTurkishTransliteration(sourceText) : '';
};
