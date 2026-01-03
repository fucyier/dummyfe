import axios from 'axios';

const API_SURAH_LIST_URL = 'https://api.acikkuran.com/surahs'; 

const API_AUTHOR_LIST_URL = 'https://api.acikkuran.com/authors'; 
const API_AUDIO_LIST_URL = 'https://api.alquran.cloud/v1/edition/format/audio'; 
const API_SURAH_AUDIO_URL = 'https://cdn.islamic.network/quran/audio-surah/128/{audio}/{surah}.mp3'; 
const API_SURAH_VERSE_URL = 'https://api.acikkuran.com/surah/'; 
const API_CLOUD_SURAH_LIST_URL = 'https://api.alquran.cloud/v1/surah/'; 
const API_SURAH_AUTHOR_VERSE_URL = 'https://api.acikkuran.com/surah/{surahId}?author={authorId}'; 
const API_CLOUD_SURAH_OKUYANLARIN_LISTESI_URL = 'https://cdn.islamic.network/quran/info/by-surah/info.json'; 

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
    return response.data.data;
  } catch (error) {
    console.error('Error fetching data: ', error);
    // Handle errors here or throw them to be handled where the function is called
    throw error;
  }
};

export const fetchOkuyanlarinListesi = async () => {
  try {
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