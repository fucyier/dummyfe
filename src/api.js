import axios from 'axios';
import {
  createQuranFoundationVerseMap,
  normalizeQuranFoundationChapters,
  normalizeQuranFoundationTranslationResources,
} from './quranFoundationAdapters';
import {
  getTurkishTransliteration,
  loadTurkishTransliteration,
} from './turkishTransliteration';

const API_AUDIO_LIST_URL = 'https://api.alquran.cloud/v1/edition/format/audio'; 
const API_MP3_QURAN_RECITERS_URL = 'https://www.mp3quran.net/api/v3/reciters?language=eng';
const API_SURAH_AUDIO_URL = 'https://cdn.islamic.network/quran/audio-surah/128/{audio}/{surah}.mp3'; 
const API_CLOUD_SURAH_LIST_URL = 'https://api.alquran.cloud/v1/surah/'; 
const API_CLOUD_SURAH_OKUYANLARIN_LISTESI_URL = 'https://cdn.islamic.network/quran/info/by-surah/info.json'; 
const QURAN_FOUNDATION_CONTENT_PROXY_URL = '/api/quran/content/api/v4';
const QURAN_COM_API_V4_URL = 'https://api.quran.com/api/v4';
const QURAN_FOUNDATION_VERSES_AUDIO_BASE_URL = 'https://verses.quran.foundation';
const API_TAFSIR_FALLBACK_BASE_URL = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';
const HADEETH_ENC_API_BASE_URL = 'https://hadeethenc.com/api/v1';
const QURAN_FOUNDATION_DEFAULT_TURKISH_TRANSLATION_ID = 77;
const QURAN_FOUNDATION_TRANSLITERATION_ID = 57;

const AVAILABLE_AUDIO_IDENTIFIERS = new Set([
  'ar.shaatree',
  'ar.ahmedajamy',
  'ar.alafasy',
  'ar.husary',
  'ar.husarymujawwad',
  'ar.hudhaify',
  'ar.mahermuaiqly',
  'ar.minshawi',
  'ar.muhammadayyoub',
  'ar.muhammadjibreel',
  'ar.alafasy-2',
  'ar.husary-2',
  'ar.mahermuaiqly-2',
  'ar.hudhaify-2',
  'ar.husarymujawwad-2',
  'ar.minshawi-2',
  'ar.muhammadayyoub-2',
  'ar.muhammadjibreel-2',
  'tr.vakfi-audio',
]);

const MP3_QURAN_RECITER_IDS = new Set([
  4, // Abu Bakr Al Shatri
  5, // Ahmad Al-Ajmy
  12, // Idrees Abkr
  20, // Khalid Al-Jileel
  21, // Khaled Al-Qahtani
  31, // Saud Al-Shuraim
  43, // Salah Albudair
  46, // Salah Bukhatir
  51, // Abdulbasit Abdulsamad
  54, // Abdulrahman Alsudaes
  60, // Abdullah Basfer
  62, // Abdullah Al-Johany
  67, // Abdulmohsen Al-Qasim
  76, // Ali Jaber
  81, // Fares Abbad
  86, // Nasser Alqatami
  89, // Hani Arrifai
  92, // Yasser Al-Dosari
  96, // Yahya Hawwa
  102, // Maher Al Meaqli
  107, // Mohammed Al-Lohaidan
  111, // Mohammed Jibreel
  123, // Mishary Alafasi
  217, // Bandar Balilah
  221, // Raad Al Kurdi
  231, // Hazza Al-Balushi
  253, // Islam Sobhi
  259, // Ahmad Al Nufais
  267, // Abdullah Kamel
]);

const MP3_QURAN_KAABA_IMAM_RECITER_IDS = new Set([
  31, // Saud Al-Shuraim
  54, // Abdulrahman Alsudaes
  62, // Abdullah Al-Johany
  76, // Ali Jaber
  92, // Yasser Al-Dosari
  102, // Maher Al Meaqli
  217, // Bandar Balilah
]);

const QURAN_FOUNDATION_RECITATIONS = [
  { id: 1, reciterName: 'AbdulBaset AbdulSamad', style: 'Mujawwad' },
  { id: 2, reciterName: 'AbdulBaset AbdulSamad', style: 'Murattal' },
  { id: 3, reciterName: 'Abdur-Rahman as-Sudais' },
  { id: 4, reciterName: 'Abu Bakr al-Shatri' },
  { id: 5, reciterName: 'Hani ar-Rifai' },
  { id: 6, reciterName: 'Mahmoud Khalil Al-Husary' },
  { id: 7, reciterName: 'Mishari Rashid al-Afasy' },
  { id: 8, reciterName: 'Mohamed Siddiq al-Minshawi', style: 'Mujawwad' },
  { id: 9, reciterName: 'Mohamed Siddiq al-Minshawi', style: 'Murattal' },
  { id: 10, reciterName: 'Saud ash-Shuraym' },
  { id: 11, reciterName: 'Mohamed al-Tablawi' },
  { id: 12, reciterName: 'Mahmoud Khalil Al-Husary', style: 'Muallim' },
];

const QURAN_FOUNDATION_KAABA_IMAM_RECITATION_IDS = new Set([
  3, // Abdur-Rahman as-Sudais
  10, // Saud ash-Shuraym
]);

const AL_QURAN_CLOUD_KAABA_IMAM_IDENTIFIERS = new Set([
  'ar.mahermuaiqly',
  'ar.mahermuaiqly-2',
]);

let turkishTafsirResourcesCache = null;
let quranFoundationChaptersCache = null;
let quranFoundationTranslationResourcesCache = null;
let audioListRequestCache = null;
const randomVerseTranslationsCache = new Map();
const quranFoundationBismillahCache = new Map();
const quranFoundationChapterContentCache = new Map();

const FALLBACK_TURKISH_TAFSIR_EDITIONS = [
  {
    slug: 'tr-tafsir-ibne-kathir',
    name: 'Tefsir İbn Kesir',
  },
  {
    slug: 'turkish-mokhtasar',
    name: 'Muhtasar Tefsir',
  },
  {
    slug: 'turkish-tafsir-as-saadi-turkish',
    name: 'Tefsir As-Saadi',
  },
];

const toAudioOption = (item) => ({
  ...item,
  id: `alquran:${item.identifier}`,
  source: 'alquran',
  sourceLabel: 'Ayet Bazlı',
  audioType: 'ayah',
  isKaabaImam: AL_QURAN_CLOUD_KAABA_IMAM_IDENTIFIERS.has(item.identifier),
});

const toQuranFoundationRecitationOption = (recitation) => ({
  id: `quranfoundation:${recitation.id}`,
  identifier: `quranfoundation:${recitation.id}`,
  recitationId: recitation.id,
  source: 'quranfoundation',
  sourceLabel: 'Ayet Bazlı',
  audioType: 'ayah',
  englishName: [recitation.reciterName, recitation.style].filter(Boolean).join(' - '),
  isKaabaImam: QURAN_FOUNDATION_KAABA_IMAM_RECITATION_IDS.has(recitation.id),
});

const toMp3QuranOption = (reciter) => {
  const fullMoshafs = reciter.moshaf?.filter(item => item.surah_total === 114) || [];
  const moshaf = fullMoshafs.find(item => /hafs|murattal/i.test(item.name))
    || fullMoshafs[0]
    || reciter.moshaf?.[0];
  if (!moshaf?.server) return null;

  return {
    id: `mp3quran:${reciter.id}:${moshaf.id}`,
    identifier: `mp3quran:${reciter.id}:${moshaf.id}`,
    source: 'mp3quran',
    sourceLabel: 'Sure Bazlı',
    audioType: 'surah',
    englishName: reciter.name,
    isKaabaImam: MP3_QURAN_KAABA_IMAM_RECITER_IDS.has(reciter.id),
    server: moshaf.server,
    surahList: String(moshaf.surah_list || '')
      .split(',')
      .map(value => Number(value))
      .filter(Boolean),
  };
};

const uniqueAudioByName = (items) => {
  const seen = new Set();

  return items.filter((item) => {
    const key = String(item.englishName || item.name || '')
      .trim()
      .toLocaleLowerCase('tr');

    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const isTurkishResource = (item) => (
  String(item?.language_name || '')
    .trim()
    .toLocaleLowerCase('en') === 'turkish'
);

const normalizeWhitespace = (text) => (
  String(text || '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
);

const tafsirHtmlToText = (html) => {
  if (!html) return '';

  if (typeof document === 'undefined') {
    return normalizeWhitespace(String(html).replace(/<[^>]*>/g, ' '));
  }

  const container = document.createElement('div');
  container.innerHTML = String(html)
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|h[1-6]|li)>/gi, '\n');

  return normalizeWhitespace(container.textContent || '');
};

const fetchTurkishTafsirResources = async () => {
  if (turkishTafsirResourcesCache) return turkishTafsirResourcesCache;

  const response = await getQuranFoundationContent('/resources/tafsirs', {
    params: {
      language: 'tr',
    },
  });

  if (!Array.isArray(response.data?.tafsirs)) {
    throw new Error('Quran Foundation tefsir kaynak listesi beklenen formatta donmedi.');
  }

  turkishTafsirResourcesCache = (response.data?.tafsirs || [])
    .filter(isTurkishResource)
    .sort((a, b) => (a?.name || '').localeCompare(b?.name || '', 'tr', { sensitivity: 'base' }));

  return turkishTafsirResourcesCache;
};

const fetchFallbackTurkishVerseTafsirs = async (surahId, verseNumber) => {
  const results = await Promise.allSettled(
    FALLBACK_TURKISH_TAFSIR_EDITIONS.map(async (edition) => {
      const response = await axios.get(`${API_TAFSIR_FALLBACK_BASE_URL}/${edition.slug}/${surahId}/${verseNumber}.json`);

      return {
        slug: edition.slug,
        name: edition.name,
        text: response.data?.text || '',
      };
    }),
  );

  return results
    .filter(result => result.status === 'fulfilled' && result.value.text)
    .map(result => result.value);
};

export const normalizeQuranFoundationAudioUrl = (url) => {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  const normalizedUrl = String(url).replace(/^\/+/, '');
  if (/^[\w.-]+\.[a-z]{2,}\//i.test(normalizedUrl)) return `https://${normalizedUrl}`;

  return `${QURAN_FOUNDATION_VERSES_AUDIO_BASE_URL}/${normalizedUrl}`;
};

const requireJsonResponse = (response, sourceLabel) => {
  const contentType = String(response.headers?.['content-type'] || '').toLowerCase();
  const isJsonResponse = contentType.includes('application/json')
    && response.data
    && typeof response.data === 'object';

  if (!isJsonResponse) {
    throw new Error(`${sourceLabel} JSON yerine gecersiz bir yanit dondurdu.`);
  }

  return response;
};

const getQuranFoundationContent = async (endpointPath, requestConfig = {}) => {
  try {
    const publicResponse = await axios.get(`${QURAN_COM_API_V4_URL}${endpointPath}`, requestConfig);
    return requireJsonResponse(publicResponse, 'Quran.com');
  } catch (publicError) {
    console.debug(`Quran.com public endpoint failed, using authenticated proxy fallback: ${publicError?.message || 'unknown error'}`);
    const proxyResponse = await axios.get(`${QURAN_FOUNDATION_CONTENT_PROXY_URL}${endpointPath}`, requestConfig);
    return requireJsonResponse(proxyResponse, 'Quran Foundation proxy');
  }
};

const getQuranFoundationChapterWordsPage = async (surahId, page, translationIds = []) => {
  const endpointPath = `/verses/by_chapter/${surahId}`;
  const requestConfig = {
    params: {
      language: 'tr',
      words: 'true',
      word_fields: 'text_uthmani,text_imlaei,audio_url,translation,transliteration,char_type_name,line_number,page_number,v1_page,v2_page',
      fields: 'text_uthmani,text_imlaei,verse_key,page_number,juz_number,hizb_number,rub_el_hizb_number,ruku_number,manzil_number',
      translations: translationIds.join(','),
      translation_fields: 'resource_name,language_name',
      per_page: 50,
      page,
    },
  };

  const response = await getQuranFoundationContent(endpointPath, requestConfig);
  if (!Array.isArray(response.data?.verses)) {
    throw new Error('Quran Foundation ayet listesi beklenen formatta donmedi.');
  }

  return response.data;
};

const getQuranFoundationChapters = async () => {
  if (quranFoundationChaptersCache) return quranFoundationChaptersCache;

  const requestConfig = { params: { language: 'tr' } };
  const response = await getQuranFoundationContent('/chapters', requestConfig);
  quranFoundationChaptersCache = normalizeQuranFoundationChapters(response.data?.chapters);
  return quranFoundationChaptersCache;
};

const padQuranAudioPart = (value) => String(value).padStart(3, '0');

const getWordByWordAudioUrl = (surahId, verseNumber, wordIndex) => (
  normalizeQuranFoundationAudioUrl(
    `wbw/${padQuranAudioPart(surahId)}_${padQuranAudioPart(verseNumber)}_${padQuranAudioPart(wordIndex + 1)}.mp3`,
  )
);

const normalizeQuranFoundationWord = (word, surahId, verseNumber, wordIndex, uthmaniText = '') => ({
  id: word.id,
  position: word.position,
  text: uthmaniText || word.text_imlaei || word.text_uthmani || word.text || '',
  uthmaniText: uthmaniText || word.text_uthmani || word.text_imlaei || word.text || '',
  audioUrl: normalizeQuranFoundationAudioUrl(word.audio_url)
    || getWordByWordAudioUrl(surahId, verseNumber, word.position ? Number(word.position) - 1 : wordIndex),
  translation: word.translation?.text || '',
  transliteration: word.transliteration?.text || '',
  lineNumber: word.line_number,
  pageNumber: word.v2_page || word.page_number || word.v1_page,
});

const getArabicWordTokens = (verse) => String(verse?.text_uthmani || verse?.text_imlaei || '')
  .trim()
  .split(/\s+/)
  .filter(token => /[\u0621-\u064A\u066E-\u06D3\u06FA-\u06FC]/u.test(token));

const normalizeQuranFoundationWords = (verse, surahId) => {
  const verseNumber = Number(verse.verse_number);
  const arabicTokens = getArabicWordTokens(verse);

  return (verse.words || [])
    .filter(word => (!word.char_type_name || word.char_type_name === 'word'))
    .map((word, index) => normalizeQuranFoundationWord(
      word,
      surahId,
      verseNumber,
      index,
      arabicTokens[index] || '',
    ));
};

const fetchQuranFoundationChapterContent = async (surahId, expectedVerseCount, translationIds = []) => {
  if (!surahId) return new Map();
  const cacheKey = `${surahId}:${[...translationIds].sort((a, b) => Number(a) - Number(b)).join(',')}`;
  if (quranFoundationChapterContentCache.has(cacheKey)) {
    return quranFoundationChapterContentCache.get(cacheKey);
  }

  const request = (async () => {
    const firstPage = await getQuranFoundationChapterWordsPage(surahId, 1, translationIds);
    const totalPages = firstPage.pagination?.total_pages || 1;
    const remainingPages = await Promise.all(
      Array.from(
        { length: Math.max(0, totalPages - 1) },
        (_, index) => getQuranFoundationChapterWordsPage(surahId, index + 2, translationIds),
      ),
    );
    const pages = [firstPage, ...remainingPages];
    const verseWordsByNumber = new Map();

    pages.flatMap(page => page.verses || []).forEach((verse) => {
      const words = normalizeQuranFoundationWords(verse, surahId);

      if (words.length > 0) {
        verseWordsByNumber.set(verse.verse_number, words);
      }
    });

    return {
      pages,
      verseMap: createQuranFoundationVerseMap(pages, surahId, expectedVerseCount),
      verseWordsByNumber,
    };
  })();

  quranFoundationChapterContentCache.set(cacheKey, request);

  try {
    return await request;
  } catch (error) {
    quranFoundationChapterContentCache.delete(cacheKey);
    throw error;
  }
};

const getQuranFoundationJuzWordsPage = async (juzNumber, page) => {
  const endpointPath = `/verses/by_juz/${juzNumber}`;
  const requestConfig = {
    params: {
      language: 'tr',
      words: 'true',
      word_fields: 'text_uthmani,text_imlaei,audio_url,translation,transliteration,char_type_name,line_number,page_number,v1_page,v2_page',
      fields: 'verse_key,page_number,juz_number',
      per_page: 50,
      page,
    },
  };

  const response = await getQuranFoundationContent(endpointPath, requestConfig);
  if (!Array.isArray(response.data?.verses)) {
    throw new Error('Quran Foundation cüz ayetlerini beklenen formatta dondurmedi.');
  }

  return response.data;
};

export const fetchQuranFoundationJuzVerses = async (juzNumber) => {
  if (!juzNumber) return [];

  const firstPage = await getQuranFoundationJuzWordsPage(juzNumber, 1);
  const totalPages = firstPage.pagination?.total_pages || 1;
  const pages = [firstPage];

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push(await getQuranFoundationJuzWordsPage(juzNumber, page));
  }

  return pages
    .flatMap(page => page.verses || [])
    .map((verse) => {
      const [surahIdText, verseNumberText] = String(verse.verse_key || '').split(':');
      const surahId = Number(surahIdText);
      const verseNumber = Number(verseNumberText || verse.verse_number);
      const words = normalizeQuranFoundationWords(verse, surahId);

      return {
        ...verse,
        surahId,
        verse_number: verseNumber,
        quranFoundationWords: words,
      };
    });
};

const getQuranFoundationAudioFileFromResponse = (response) => {
  const audioFile = response.data?.audio_files?.[0] || response.data?.audio_file || response.data;
  const audioUrl = normalizeQuranFoundationAudioUrl(audioFile?.url || audioFile?.audio_url);

  return {
    audioUrl,
    segments: audioFile?.segments || audioFile?.timestamps || audioFile?.verse_timings || [],
    verseKey: audioFile?.verse_key,
  };
};

export const fetchQuranFoundationChapterAudio = async (recitationId, surahId) => {
  const chapterReciterId = Number(recitationId);
  if (!chapterReciterId || !surahId) return null;

  const requestConfig = {
    params: {
      segments: true,
    },
  };
  const response = await axios.get(`${QURAN_COM_API_V4_URL}/chapter_recitations/${chapterReciterId}/${surahId}`, requestConfig);
  const proxyAudioFile = response.data?.audio_file || response.data?.audio_files?.[0] || response.data;

  if (!proxyAudioFile?.audio_url && !proxyAudioFile?.url) {
    throw new Error('Quran chapter audio URL bulunamadı.');
  }

  const audioFile = response.data?.audio_file || response.data?.audio_files?.[0] || response.data;
  const audioUrl = normalizeQuranFoundationAudioUrl(audioFile?.audio_url || audioFile?.url);

  if (!audioUrl) return null;

  const timestamps = audioFile?.timestamps || audioFile?.segments || audioFile?.verse_timings || [];

  return {
    audioUrl,
    chapterReciterId,
    timestamps,
    segments: timestamps,
  };
};

export const fetchQuranFoundationAyahAudioUrl = async (recitationId, surahId, verseNumber) => {
  const audioFile = await fetchQuranFoundationAyahAudio(recitationId, surahId, verseNumber);

  return audioFile.audioUrl;
};

export const fetchQuranFoundationAyahAudio = async (recitationId, surahId, verseNumber) => {
  if (!recitationId || !surahId || !verseNumber) return '';

  const endpointPath = `/recitations/${recitationId}/by_ayah/${surahId}:${verseNumber}`;
  const requestConfig = {
    params: {
      fields: 'url,verse_key,segments',
      per_page: 1,
    },
  };

  const response = await getQuranFoundationContent(endpointPath, requestConfig);
  const audioFile = getQuranFoundationAudioFileFromResponse(response);

  if (!audioFile.audioUrl) {
    throw new Error('Quran Foundation ayet sesi URL bilgisi dondurmedi.');
  }

  return audioFile;
};

export const fetchSurahList = async () => {
  try {
    return await getQuranFoundationChapters();
  } catch (error) {
    console.error('Quran Foundation sure listesi alınamadı: ', error);
    throw error;
  }
};

const getQuranFoundationTranslationResources = async () => {
  if (quranFoundationTranslationResourcesCache) {
    return quranFoundationTranslationResourcesCache;
  }

  const response = await getQuranFoundationContent('/resources/translations', {
    params: { language: 'tr' },
  });

  quranFoundationTranslationResourcesCache = normalizeQuranFoundationTranslationResources(
    response.data?.translations,
  );
  return quranFoundationTranslationResourcesCache;
};

export const fetchAuthorList = async () => {
  try {
    return await getQuranFoundationTranslationResources();
  } catch (error) {
    console.error('Quran Foundation meal kaynaklari alinamadi: ', error);
    throw error;
  }
};

const fetchAudioListUncached = async () => {
  try {
    const [alQuranResponse, mp3QuranResponse] = await Promise.all([
      axios.get(API_AUDIO_LIST_URL),
      axios.get(API_MP3_QURAN_RECITERS_URL),
    ]);

    const alQuranAudio = uniqueAudioByName(alQuranResponse.data.data
      .filter(item => AVAILABLE_AUDIO_IDENTIFIERS.has(item.identifier))
      .map(toAudioOption));

    const quranFoundationAudio = QURAN_FOUNDATION_RECITATIONS.map(toQuranFoundationRecitationOption);

    const mp3QuranAudio = mp3QuranResponse.data.reciters
      .filter(item => MP3_QURAN_RECITER_IDS.has(item.id))
      .map(toMp3QuranOption)
      .filter(Boolean);

    return [...alQuranAudio, ...quranFoundationAudio, ...mp3QuranAudio];
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

const findTranslation = (verse, resourceId) => (
  (verse?.translations || []).find(item => Number(item.resource_id) === Number(resourceId))
);

const getTranslationAuthor = (authorId, authors) => (
  authors.find(item => Number(item.id) === Number(authorId)) || {
    id: Number(authorId),
    name: 'Turkce meal',
    description: 'Quran Foundation Turkce meal',
    language: 'tr',
    url: null,
    source: 'quranfoundation',
  }
);

const toLegacyTranslation = (verse, authorId, authors) => {
  const translation = findTranslation(verse, authorId);

  return {
    id: translation?.id || `${verse?.verse_key || verse?.id}-${authorId}`,
    author: getTranslationAuthor(authorId, authors),
    text: tafsirHtmlToText(translation?.text || ''),
    footnotes: translation?.foot_notes || translation?.footnotes || null,
  };
};

export const fetchAudioList = () => {
  if (!audioListRequestCache) {
    audioListRequestCache = fetchAudioListUncached().catch((error) => {
      audioListRequestCache = null;
      throw error;
    });
  }

  return audioListRequestCache;
};

const getQuranFoundationVerseByKey = async (verseKey, translationIds = []) => {
  const response = await getQuranFoundationContent(`/verses/by_key/${verseKey}`, {
    params: {
      language: 'tr',
      words: 'true',
      word_fields: 'audio_url,translation,transliteration,char_type_name,line_number,page_number',
      fields: 'text_uthmani,text_imlaei,verse_key,page_number,juz_number',
      translations: translationIds.join(','),
      translation_fields: 'resource_name,language_name',
    },
  });

  return response.data?.verse || null;
};

const fetchRandomVerseTranslationsUncached = async (
  surahList,
  authorId = QURAN_FOUNDATION_DEFAULT_TURKISH_TRANSLATION_ID,
  count = 5,
) => {
  try {
    const selectedVerses = Array.from({ length: count }, () => {
      const surah = surahList[Math.floor(Math.random() * surahList.length)];
      const verseNumber = Math.floor(Math.random() * surah.verse_count) + 1;

      return { surah, verseNumber };
    });

    const results = await Promise.all(
      selectedVerses.map(async ({ surah, verseNumber }) => {
        const verse = await getQuranFoundationVerseByKey(`${surah.id}:${verseNumber}`, [authorId]);
        const translation = findTranslation(verse, authorId);

        return {
          id: `${surah.id}-${verseNumber}`,
          surahId: surah.id,
          surahName: surah.name,
          verseNumber,
          translation: tafsirHtmlToText(translation?.text || ''),
        };
      }),
    );

    return results.filter(item => item.translation);
  } catch (error) {
    console.error('Error fetching random verses: ', error);
    throw error;
  }
};

export const fetchOkuyanlarinListesi = async () => {
  try {
    axios.defaults.headers.get['Content-Type'] ='application/x-www-form-urlencoded';
    axios.defaults.headers.get['Access-Control-Allow-Origin'] = '*';
    const response = await axios.get(API_CLOUD_SURAH_OKUYANLARIN_LISTESI_URL);
    return response.data[0].contents[0].contents;
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};


const fetchQuranFoundationBismillah = async (authorId, authors, transliterationData = null) => {
  if (quranFoundationBismillahCache.has(authorId)) {
    return quranFoundationBismillahCache.get(authorId);
  }

  const verse = await getQuranFoundationVerseByKey(
    '1:1',
    [authorId, QURAN_FOUNDATION_TRANSLITERATION_ID],
  );
  const bismillah = verse ? {
    id: `bismillah-${authorId}`,
    surah_id: 0,
    verse_number: 0,
    verse: String(verse.text_uthmani || verse.text_imlaei || '').trim(),
    transcription: getTurkishTransliteration(transliterationData, 1, 1)
      || tafsirHtmlToText(findTranslation(verse, QURAN_FOUNDATION_TRANSLITERATION_ID)?.text || ''),
    translation: toLegacyTranslation(verse, authorId, authors),
  } : null;

  quranFoundationBismillahCache.set(authorId, bismillah);
  return bismillah;
};

export const fetchRandomVerseTranslations = (
  surahList,
  authorId = QURAN_FOUNDATION_DEFAULT_TURKISH_TRANSLATION_ID,
  count = 5,
) => {
  const cacheKey = `${authorId}:${count}`;
  if (!randomVerseTranslationsCache.has(cacheKey)) {
    const request = fetchRandomVerseTranslationsUncached(surahList, authorId, count)
      .catch((error) => {
        randomVerseTranslationsCache.delete(cacheKey);
        throw error;
      });
    randomVerseTranslationsCache.set(cacheKey, request);
  }

  return randomVerseTranslationsCache.get(cacheKey);
};

export const fetchVerseList = async (surahId, authorId = 0) => {
  const numericSurahId = Number(surahId);
  if (!Number.isInteger(numericSurahId) || numericSurahId < 1 || numericSurahId > 114) {
    throw new Error('Sure ve meal Seciniz...');
  }

  try {
    const [chapters, authors, transliterationData] = await Promise.all([
      getQuranFoundationChapters(),
      getQuranFoundationTranslationResources(),
      loadTurkishTransliteration().catch((error) => {
        console.warn('Yerel Tanzil ceviriyazisi yuklenemedi; Quran Foundation kullaniliyor.', error);
        return null;
      }),
    ]);
    const chapter = chapters.find(item => item.id === numericSurahId);
    if (!chapter) throw new Error('Quran Foundation sure bilgisi bulunamadi.');

    const effectiveAuthorId = Number(authorId) || QURAN_FOUNDATION_DEFAULT_TURKISH_TRANSLATION_ID;
    const { verseMap, verseWordsByNumber } = await fetchQuranFoundationChapterContent(
      numericSurahId,
      chapter.verse_count,
      [effectiveAuthorId, QURAN_FOUNDATION_TRANSLITERATION_ID],
    );

    const verses = Array.from({ length: chapter.verse_count }, (_, index) => {
      const verse = verseMap.get(index + 1);
      const transcription = findTranslation(verse, QURAN_FOUNDATION_TRANSLITERATION_ID);

      return {
        id: verse.id,
        surah_id: numericSurahId,
        verse_number: verse.verse_number,
        verse_key: verse.verse_key,
        verse: String(verse.text_uthmani || verse.text_imlaei || '').trim(),
        verse_simplified: String(verse.text_imlaei || '').trim(),
        page: verse.page_number,
        page_number: verse.page_number,
        juz_number: verse.juz_number,
        hizb_number: verse.hizb_number,
        rub_el_hizb_number: verse.rub_el_hizb_number,
        ruku_number: verse.ruku_number,
        manzil_number: verse.manzil_number,
        transcription: getTurkishTransliteration(
          transliterationData,
          numericSurahId,
          verse.verse_number,
        ) || tafsirHtmlToText(transcription?.text || ''),
        translation: toLegacyTranslation(verse, effectiveAuthorId, authors),
        quranFoundationWords: verseWordsByNumber.get(verse.verse_number) || [],
      };
    });

    const zero = chapter.bismillah_pre
      ? await fetchQuranFoundationBismillah(effectiveAuthorId, authors, transliterationData)
      : null;

    return {
      ...chapter,
      page_number: chapter.pages?.[0] || verses[0]?.page_number || null,
      zero,
      verses,
    };
  } catch (error) {
    console.error('Quran Foundation sure ayetleri alinamadi: ', error);
    throw error;
  }
};

export const fetchVerseTranslationsByAuthors = async (surahId, verseNumber, authors = []) => {
  if (!surahId || !verseNumber || authors.length === 0) return [];

  const authorIds = authors.map(author => Number(author.id)).filter(Boolean);
  const verse = await getQuranFoundationVerseByKey(`${surahId}:${verseNumber}`, authorIds);

  return authors
    .map((author) => ({
      authorId: author.id,
      authorName: author.name,
      text: tafsirHtmlToText(findTranslation(verse, author.id)?.text || ''),
    }))
    .filter(item => item.text);
};

export const fetchVerseTafsirs = async (surahId, verseNumber) => {
  if (!surahId || !verseNumber) return [];

  try {
    const tafsirResources = await fetchTurkishTafsirResources();
    const tafsirIds = tafsirResources.map(item => item.id).filter(Boolean);

    if (tafsirIds.length === 0) {
      return fetchFallbackTurkishVerseTafsirs(surahId, verseNumber);
    }

    const response = await getQuranFoundationContent(`/verses/by_key/${surahId}:${verseNumber}`, {
      params: {
        language: 'tr',
        tafsirs: tafsirIds.join(','),
        tafsir_fields: 'resource_id,text',
      },
    });

    const resourceById = new Map(tafsirResources.map(item => [item.id, item]));

    const quranFoundationTafsirs = (response.data?.verse?.tafsirs || [])
      .map((item) => {
        const resource = resourceById.get(item.resource_id);
        const name = item.name || resource?.translated_name?.name || resource?.name || 'Tefsir';
        const text = tafsirHtmlToText(item.text);

        return {
          slug: resource?.slug || `qf-tafsir-${item.resource_id || item.id}`,
          name,
          text,
        };
      })
      .filter(item => item.text);

    if (quranFoundationTafsirs.length === 0) {
      return fetchFallbackTurkishVerseTafsirs(surahId, verseNumber);
    }

    return quranFoundationTafsirs;
  } catch (error) {
    console.warn(`Quran Foundation Turkish tafsir lookup failed, using Turkish fallback source: ${error?.message || 'unknown error'}`);
    return fetchFallbackTurkishVerseTafsirs(surahId, verseNumber);
  }
};

export const fetchHadithCategories = async (language = 'tr') => {
  const response = await axios.get(`${HADEETH_ENC_API_BASE_URL}/categories/roots/`, {
    params: { language },
  });

  return Array.isArray(response.data) ? response.data : [];
};

export const fetchHadithsByCategory = async ({
  language = 'tr',
  categoryId,
  page = 1,
  perPage = 20,
}) => {
  if (!categoryId) {
    return {
      data: [],
      meta: {
        current_page: '1',
        last_page: 1,
        total_items: 0,
        per_page: String(perPage),
      },
    };
  }

  const response = await axios.get(`${HADEETH_ENC_API_BASE_URL}/hadeeths/list/`, {
    params: {
      language,
      category_id: categoryId,
      page,
      per_page: perPage,
    },
  });

  return {
    data: Array.isArray(response.data?.data) ? response.data.data : [],
    meta: response.data?.meta || {
      current_page: String(page),
      last_page: 1,
      total_items: 0,
      per_page: String(perPage),
    },
  };
};

export const fetchHadithDetail = async ({ language = 'tr', id }) => {
  if (!id) return null;

  const response = await axios.get(`${HADEETH_ENC_API_BASE_URL}/hadeeths/one/`, {
    params: {
      language,
      id,
    },
  });

  return response.data || null;
};
