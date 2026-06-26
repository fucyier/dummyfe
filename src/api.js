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
const API_TAFSIR_BASE_URL = 'https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir';

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
  31, // Saud Al-Shuraim
  54, // Abdulrahman Alsudaes
  62, // Abdullah Al-Johany
  92, // Yasser Al-Dosari
  102, // Maher Al Meaqli
  217, // Bandar Balilah
]);

const AL_QURAN_CLOUD_KAABA_IMAM_IDENTIFIERS = new Set([
  'ar.hudhaify',
  'ar.hudhaify-2',
  'ar.mahermuaiqly',
  'ar.mahermuaiqly-2',
  'ar.muhammadayyoub',
  'ar.muhammadayyoub-2',
]);

const TURKISH_TAFSIR_EDITIONS = [
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
    isKaabaImam: true,
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

    const mp3QuranAudio = mp3QuranResponse.data.reciters
      .filter(item => MP3_QURAN_RECITER_IDS.has(item.id))
      .map(toMp3QuranOption)
      .filter(Boolean);

    return [...alQuranAudio, ...mp3QuranAudio];
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
    return response.data.data;
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

  const results = await Promise.allSettled(
    TURKISH_TAFSIR_EDITIONS.map(async (edition) => {
      const response = await axios.get(`${API_TAFSIR_BASE_URL}/${edition.slug}/${surahId}/${verseNumber}.json`);

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
