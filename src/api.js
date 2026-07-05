import axios from 'axios';

const API_SURAH_LIST_URL = 'https://api.acikkuran.com/surahs'; 

const API_AUTHOR_LIST_URL = 'https://api.acikkuran.com/authors'; 
const API_AUDIO_LIST_URL = 'https://api.alquran.cloud/v1/edition/format/audio'; 
const API_MP3_QURAN_RECITERS_URL = 'https://www.mp3quran.net/api/v3/reciters?language=eng';
const API_SURAH_AUDIO_URL = 'https://cdn.islamic.network/quran/audio-surah/128/{audio}/{surah}.mp3'; 
const API_SURAH_VERSE_URL = 'https://api.acikkuran.com/surah/'; 
const API_CLOUD_SURAH_LIST_URL = 'https://api.alquran.cloud/v1/surah/'; 
const API_SURAH_AUTHOR_VERSE_URL = 'https://api.acikkuran.com/surah/{surahId}?author={authorId}'; 
const API_CLOUD_SURAH_OKUYANLARIN_LISTESI_URL = 'https://cdn.islamic.network/quran/info/by-surah/info.json'; 
const QURAN_FOUNDATION_CONTENT_PROXY_URL = '/api/quran/content/api/v4';
const QURAN_COM_API_V4_URL = 'https://api.quran.com/api/v4';
const QURAN_FOUNDATION_VERSES_AUDIO_BASE_URL = 'https://verses.quran.foundation';
const API_TAFSIR_FALLBACK_BASE_URL = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

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

  const response = await axios.get(`${QURAN_FOUNDATION_CONTENT_PROXY_URL}/resources/tafsirs`, {
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

const getQuranFoundationChapterWordsPage = async (surahId, page) => {
  const endpointPath = `/verses/by_chapter/${surahId}`;
  const requestConfig = {
    params: {
      language: 'tr',
      words: 'true',
      word_fields: 'text_uthmani,text_imlaei,audio_url,translation,transliteration,char_type_name',
      fields: 'verse_key',
      per_page: 50,
      page,
    },
  };

  try {
    const response = await axios.get(`${QURAN_FOUNDATION_CONTENT_PROXY_URL}${endpointPath}`, requestConfig);
    if (!Array.isArray(response.data?.verses)) {
      throw new Error('Quran Foundation proxy returned no words.');
    }

    return response.data;
  } catch (error) {
    console.debug(`Quran Foundation word lookup failed, using Quran.com public fallback: ${error?.message || 'unknown error'}`);
    const response = await axios.get(`${QURAN_COM_API_V4_URL}${endpointPath}`, requestConfig);
    return response.data;
  }
};

const padQuranAudioPart = (value) => String(value).padStart(3, '0');

const getWordByWordAudioUrl = (surahId, verseNumber, wordIndex) => (
  normalizeQuranFoundationAudioUrl(
    `wbw/${padQuranAudioPart(surahId)}_${padQuranAudioPart(verseNumber)}_${padQuranAudioPart(wordIndex + 1)}.mp3`,
  )
);

const normalizeQuranFoundationWord = (word, surahId, verseNumber, wordIndex) => ({
  id: word.id,
  position: word.position,
  text: word.text_imlaei || word.text_uthmani || '',
  audioUrl: getWordByWordAudioUrl(surahId, verseNumber, wordIndex),
  translation: word.translation?.text || '',
  transliteration: word.transliteration?.text || '',
});

const fetchQuranFoundationChapterWords = async (surahId) => {
  if (!surahId) return new Map();

  const firstPage = await getQuranFoundationChapterWordsPage(surahId, 1);
  const totalPages = firstPage.pagination?.total_pages || 1;
  const pages = [firstPage];

  for (let page = 2; page <= totalPages; page += 1) {
    pages.push(await getQuranFoundationChapterWordsPage(surahId, page));
  }

  const verseWordsByNumber = new Map();

  pages.flatMap(page => page.verses || []).forEach((verse) => {
    const words = (verse.words || [])
      .filter(word => (!word.char_type_name || word.char_type_name === 'word') && (word.text_uthmani || word.text_imlaei))
      .map((word, index) => normalizeQuranFoundationWord(word, surahId, verse.verse_number, index));

    if (words.length > 0) {
      verseWordsByNumber.set(verse.verse_number, words);
    }
  });

  return verseWordsByNumber;
};

const getQuranFoundationAudioUrlFromResponse = (response) => (
  normalizeQuranFoundationAudioUrl(response.data?.audio_files?.[0]?.url)
);

export const fetchQuranFoundationAyahAudioUrl = async (recitationId, surahId, verseNumber) => {
  if (!recitationId || !surahId || !verseNumber) return '';

  const endpointPath = `/recitations/${recitationId}/by_ayah/${surahId}:${verseNumber}`;
  const requestConfig = {
    params: {
      fields: 'url,verse_key',
      per_page: 1,
    },
  };

  try {
    const response = await axios.get(`${QURAN_FOUNDATION_CONTENT_PROXY_URL}${endpointPath}`, requestConfig);
    const audioUrl = getQuranFoundationAudioUrlFromResponse(response);

    if (!audioUrl) {
      throw new Error('Quran Foundation proxy returned no audio URL.');
    }

    return audioUrl;
  } catch (error) {
    console.debug(`Quran Foundation ayah audio lookup failed, using Quran.com public fallback: ${error?.message || 'unknown error'}`);
    const response = await axios.get(`${QURAN_COM_API_V4_URL}${endpointPath}`, requestConfig);
    const audioUrl = getQuranFoundationAudioUrlFromResponse(response);

    if (!audioUrl) {
      throw new Error('Quran.com fallback returned no audio URL.');
    }

    return audioUrl;
  }
};

export const fetchSurahList = async () => {
  try { 
    const response = await axios.get(API_SURAH_LIST_URL);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const fetchAuthorList = async () => {
  try {
    const response = await axios.get(API_AUTHOR_LIST_URL);
    return response.data.data.filter(item => item.language === 'tr');
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const fetchAudioList = async () => {
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

export const fetchRandomVerseTranslations = async (surahList, authorId = 11, count = 5) => {
  try {
    const selectedVerses = Array.from({ length: count }, () => {
      const surah = surahList[Math.floor(Math.random() * surahList.length)];
      const verseNumber = Math.floor(Math.random() * surah.verse_count) + 1;

      return { surah, verseNumber };
    });

    const results = await Promise.all(
      selectedVerses.map(async ({ surah, verseNumber }) => {
        const response = await axios.get(API_SURAH_VERSE_URL + surah.id, {
          params: {
            author: authorId,
          },
        });
        const verse = response.data.data.verses.find(item => item.verse_number === verseNumber);

        return {
          id: `${surah.id}-${verseNumber}`,
          surahId: surah.id,
          surahName: surah.name,
          verseNumber,
          translation: verse?.translation?.text || '',
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


export const fetchVerseList = async (surahId, authorId) => {
  try {
    let response=[];
    if(surahId!==0 && authorId === 0){
     response = await axios.get(API_SURAH_VERSE_URL+surahId);
    }else if(surahId !==0 && authorId !== 0){
       response = await axios.get(API_SURAH_VERSE_URL+surahId, 
        {
          params: {
          author: authorId
        }
        });
    }
    else{
        throw new Error('Sure ve meal Seçiniz...');
    }
    const verseData = response.data.data;

    try {
      const wordsByVerseNumber = await fetchQuranFoundationChapterWords(surahId);

      return {
        ...verseData,
        verses: (verseData.verses || []).map((verse) => ({
          ...verse,
          quranFoundationWords: wordsByVerseNumber.get(verse.verse_number) || [],
        })),
      };
    } catch (wordError) {
      console.warn(`Kelime bazlı anlamlar yüklenemedi: ${wordError?.message || 'unknown error'}`);
      return verseData;
    }
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const fetchVerseTranslationsByAuthors = async (surahId, verseNumber, authors = []) => {
  if (!surahId || !verseNumber || authors.length === 0) return [];

  const results = await Promise.allSettled(
    authors.map(async (author) => {
      const response = await axios.get(API_SURAH_VERSE_URL + surahId, {
        params: {
          author: author.id,
        },
      });
      const verse = response.data.data.verses.find(item => item.verse_number === verseNumber);

      return {
        authorId: author.id,
        authorName: author.name,
        text: verse?.translation?.text || '',
      };
    }),
  );

  return results
    .filter(result => result.status === 'fulfilled' && result.value.text)
    .map(result => result.value);
};

export const fetchVerseTafsirs = async (surahId, verseNumber) => {
  if (!surahId || !verseNumber) return [];

  try {
    const tafsirResources = await fetchTurkishTafsirResources();
    const tafsirIds = tafsirResources.map(item => item.id).filter(Boolean);

    if (tafsirIds.length === 0) {
      return fetchFallbackTurkishVerseTafsirs(surahId, verseNumber);
    }

    const response = await axios.get(`${QURAN_FOUNDATION_CONTENT_PROXY_URL}/verses/by_key/${surahId}:${verseNumber}`, {
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
