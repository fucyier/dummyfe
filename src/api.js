import axios from 'axios';

const API_SURAH_LIST_URL = 'https://api.acikkuran.com/surahs'; 

const API_AUTHOR_LIST_URL = 'https://api.acikkuran.com/authors'; 
const API_AUDIO_LIST_URL = 'https://api.alquran.cloud/v1/edition/format/audio'; 
const API_SURAH_AUDIO_URL = 'https://cdn.islamic.network/quran/audio-surah/128/{audio}/{surah}.mp3'; 
const API_SURAH_VERSE_URL = 'https://api.acikkuran.com/surah/'; 
const API_CLOUD_SURAH_LIST_URL = 'https://api.alquran.cloud/v1/surah/'; 
const API_SURAH_AUTHOR_VERSE_URL = 'https://api.acikkuran.com/surah/{surahId}?author={authorId}'; 
const API_CLOUD_SURAH_OKUYANLARIN_LISTESI_URL = 'https://cdn.islamic.network/quran/info/by-surah/info.json'; 

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
  'zh.chinese',
  'fr.leclerc',
  'ru.kuliev-audio',
  'kk.khalifahaltai-audio',
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
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const fetchAudioList = async () => {
  try {
    const response = await axios.get(API_AUDIO_LIST_URL);
    return response.data.data.filter(item => AVAILABLE_AUDIO_IDENTIFIERS.has(item.identifier));
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
