const LEGACY_SURAH_SLUGS = [
  'fatiha', 'bakara', 'ali-imran', 'nisa', 'maide', 'enam', 'araf', 'enfal', 'tevbe', 'yunus',
  'hud', 'yusuf', 'rad', 'ibrahim', 'hicr', 'nahl', 'isra', 'kehf', 'meryem', 'taha',
  'enbiya', 'hacc', 'muminun', 'nur', 'furkan', 'suara', 'neml', 'kasas', 'ankebut', 'rum',
  'lokman', 'secde', 'ahzab', 'sebe', 'fatir', 'yasin', 'saffat', 'sad', 'zumer', 'mumin',
  'fussilet', 'sura', 'zuhruf', 'duhan', 'casiye', 'ahkaf', 'muhammed', 'fetih', 'hucurat', 'kaf',
  'zariyat', 'tur', 'necm', 'kamer', 'rahman', 'vakia', 'hadid', 'mucadele', 'hasr', 'mumtehine',
  'saff', 'cuma', 'munafikun', 'tegabun', 'talak', 'tahrim', 'mulk', 'kalem', 'hakka', 'mearic',
  'nuh', 'cinn', 'muzzemmil', 'muddessir', 'kiyame', 'insan', 'murselat', 'nebe', 'naziat', 'abese',
  'tekvir', 'infitar', 'mutaffifin', 'insikak', 'buruc', 'tarik', 'ala', 'gasiye', 'fecr', 'beled',
  'sems', 'leyl', 'duha', 'insirah', 'tin', 'alak', 'kadir', 'beyyine', 'zilzal', 'adiyat',
  'karia', 'tekasur', 'asr', 'humeze', 'fil', 'kureys', 'maun', 'kevser', 'kafirun', 'nasr',
  'tebbet', 'ihlas', 'felak', 'nas',
];

const assertIntegerInRange = (value, min, max, label) => {
  if (!Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${label} beklenen aralikta degil.`);
  }
};

export const normalizeQuranFoundationChapters = (chapters) => {
  if (!Array.isArray(chapters) || chapters.length !== 114) {
    throw new Error('Quran Foundation 114 sure dondurmedi.');
  }

  const normalized = chapters.map((chapter) => {
    const id = Number(chapter?.id);
    const verseCount = Number(chapter?.verses_count);
    assertIntegerInRange(id, 1, 114, 'Sure numarasi');

    if (!Number.isInteger(verseCount) || verseCount < 3) {
      throw new Error(`${id}. sure icin ayet sayisi gecersiz.`);
    }

    const name = String(chapter?.translated_name?.name || chapter?.name_simple || '').trim();
    const originalName = String(chapter?.name_arabic || '').trim();
    if (!name || !originalName) {
      throw new Error(`${id}. sure icin ad bilgisi eksik.`);
    }

    return {
      id,
      name,
      name_original: originalName,
      verse_count: verseCount,
      slug: LEGACY_SURAH_SLUGS[id - 1],
      revelation_place: chapter.revelation_place || '',
      revelation_order: chapter.revelation_order || null,
      bismillah_pre: Boolean(chapter.bismillah_pre),
      pages: Array.isArray(chapter.pages) ? chapter.pages : [],
    };
  }).sort((a, b) => a.id - b.id);

  const ids = new Set(normalized.map(item => item.id));
  if (ids.size !== 114 || normalized.some((item, index) => item.id !== index + 1)) {
    throw new Error('Quran Foundation sure listesinde eksik veya tekrar eden kayit var.');
  }

  return normalized;
};

export const normalizeQuranFoundationTranslationResources = (translations) => {
  if (!Array.isArray(translations)) {
    throw new Error('Quran Foundation meal kaynaklari beklenen formatta donmedi.');
  }

  const preferredNames = new Map([
    [77, 'Diyanet \u0130\u015fleri Ba\u015fkanl\u0131\u011f\u0131'],
    [52, 'Elmal\u0131l\u0131 Hamdi Yaz\u0131r'],
    [112, '\u015eaban Piri\u015f'],
  ]);

  const normalized = translations
    .filter(item => String(item?.language_name || '').toLowerCase() === 'turkish')
    .map((item) => {
      const id = Number(item?.id);
      const name = preferredNames.get(id)
        || String(item?.author_name || item?.name || '').trim();

      if (!Number.isInteger(id) || !name) return null;

      return {
        id,
        name,
        description: preferredNames.get(id) || String(item?.name || name).trim(),
        language: 'tr',
        url: null,
        slug: item?.slug || '',
        source: 'quranfoundation',
      };
    })
    .filter(Boolean)
    .sort((a, b) => {
      if (a.id === 77) return -1;
      if (b.id === 77) return 1;
      return a.name.localeCompare(b.name, 'tr', { sensitivity: 'base' });
    });

  if (normalized.length === 0) {
    throw new Error('Quran Foundation Turkce meal kaynagi dondurmedi.');
  }

  return normalized;
};

export const createQuranFoundationVerseMap = (pages, surahId, expectedVerseCount) => {
  const verses = (Array.isArray(pages) ? pages : []).flatMap(page => page?.verses || []);
  const verseMap = new Map();

  verses.forEach((verse) => {
    const verseNumber = Number(verse?.verse_number);
    const [chapterNumber] = String(verse?.verse_key || '').split(':').map(Number);
    assertIntegerInRange(verseNumber, 1, expectedVerseCount, 'Ayet numarasi');

    if (chapterNumber !== Number(surahId) || verseMap.has(verseNumber)) {
      throw new Error('Quran Foundation ayet listesi sureyle eslesmiyor.');
    }

    if (!String(verse?.text_uthmani || verse?.text_imlaei || '').trim()) {
      throw new Error(`${surahId}:${verseNumber} Arapca metni eksik.`);
    }

    verseMap.set(verseNumber, verse);
  });

  if (verseMap.size !== expectedVerseCount) {
    throw new Error(`Quran Foundation ${expectedVerseCount} yerine ${verseMap.size} ayet dondurdu.`);
  }

  return verseMap;
};

export const mergeQuranFoundationVerse = (legacyVerse, foundationVerse, words = []) => ({
  ...legacyVerse,
  verse: String(foundationVerse?.text_uthmani || foundationVerse?.text_imlaei || legacyVerse?.verse || '').trim(),
  page_number: foundationVerse?.page_number || legacyVerse?.page_number,
  verse_key: foundationVerse?.verse_key || legacyVerse?.verse_key,
  juz_number: foundationVerse?.juz_number || legacyVerse?.juz_number,
  hizb_number: foundationVerse?.hizb_number || legacyVerse?.hizb_number,
  rub_el_hizb_number: foundationVerse?.rub_el_hizb_number || legacyVerse?.rub_el_hizb_number,
  ruku_number: foundationVerse?.ruku_number || legacyVerse?.ruku_number,
  manzil_number: foundationVerse?.manzil_number || legacyVerse?.manzil_number,
  quranFoundationWords: words,
});
