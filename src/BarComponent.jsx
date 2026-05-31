import { useEffect, useState} from 'react';
import { fetchAudioList, fetchAuthorList, fetchSurahList, fetchVerseList } from './api';
import FormControl from '@mui/material/FormControl';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import VerseComponent from './VerseComponent';

const BarComponent = () => {
  const [loading, setLoading] = useState(true);
  const [dataSurah, setDataSurah] = useState([])
  const [dataAuthor, setDataAuthor] = useState([])
   const [dataAudio, setDataAudio] = useState([])
  const [dataVerse, setDataVerse] = useState([])
  const [surah, setSurah] = useState(0);
  const [author, setAuthor] = useState(0);
   const [audio, setAudio] = useState('');
  const gorunum = false;

useEffect(() => {
    fetchSurahList()
      .then(data => {
        setDataSurah(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });


     fetchAuthorList()
      .then(data => {
        setDataAuthor(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });

      fetchAudioList()
      .then(data => {
        setDataAudio(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });

     
  }, []);

const getVerseList =function (surahId,authorId){
   fetchVerseList(surahId,authorId)
      .then(data => {
        setDataVerse(data);
        setLoading(false);
      })
      .catch(err => {
        alert(err);
      //  setLoading(true);
      });
}

  // const handleChangeSurah = (newValue) => {
  //   setSurah(newValue?.id||0);
  //    setSurahName(newValue?.name);
  //      getVerseList(newValue.id,author);
  // };

    const handleChangeSurah = (newValue) => {
    const selectedSurah = newValue?.id || 0;
    setSurah(selectedSurah);
       getVerseList(selectedSurah,author);
  };

   const handleChangeAuthor = (newValue) => {
    const selectedAuthor = newValue?.id || 0;
    setAuthor(selectedAuthor);
       getVerseList(surah,selectedAuthor);
  };

     const handleChangeAudio = (newValue) => {
      if(surah===0) alert("Sure Seçiniz...");
       setAudio(newValue?.identifier || '');
      // getVerseList(surah,event.target.value);
  };

 return (
        <>  

        {loading && <div>Lütfen Bekleyiniz...</div>}
        {!loading && (
       
            <div>
              {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 100}}>
                <Autocomplete
                  value={surahName}
                  id="free-solo-2-demo"
                  autoHighlight
                  options={dataSurah}
                  getOptionKey={(option) => option.id}
                  getOptionLabel={(option) => option.name || ""}
                  onChange={(event, newValue) => {
                    handleChangeSurah(newValue);
                  } }
                  sx={{ width: 200 }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Sure Seçiniz"
                      variant="standard"
                      value={surahName}
                      slotProps={{
                        htmlInput: {
                          ...params.inputProps
                        },
                      }} />
                  )} />
              </FormControl> */}

                <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <Autocomplete
                  id="select1"
                  autoHighlight
                  openOnFocus
                  options={dataSurah}
                  value={dataSurah.find(item => item.id === surah) || null}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => handleChangeSurah(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderInput={(params) => (
                    <TextField {...params} label="Sure" variant="standard" />
                  )}
                />
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <Autocomplete
                  id="select2"
                  autoHighlight
                  openOnFocus
                  options={dataAuthor}
                  value={dataAuthor.find(item => item.id === author) || null}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => handleChangeAuthor(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderInput={(params) => (
                    <TextField {...params} label="Meal" variant="standard" />
                  )}
                />
              </FormControl>
               <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <Autocomplete
                  id="select3"
                  autoHighlight
                  openOnFocus
                  options={dataAudio}
                  value={dataAudio.find(item => item.identifier === audio) || null}
                  getOptionLabel={(option) => option.englishName || ""}
                  isOptionEqualToValue={(option, value) => option.identifier === value.identifier}
                  onChange={(event, newValue) => handleChangeAudio(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderInput={(params) => (
                    <TextField {...params} label="Seslendiren" variant="standard" />
                  )}
                />
              </FormControl>
              {/* <FormControl>
                <FormControlLabel
                  control={<Switch checked={gorunum} onChange={handleChangeGorunum} name="gorunum" />}
                  label="Görünüm" />
              </FormControl> */}
            </div>
        )}

        <VerseComponent surah={surah} author={author} audio={audio} gorunum={gorunum} dataVerse={dataVerse} />
        </>
  );
}

export default BarComponent;
