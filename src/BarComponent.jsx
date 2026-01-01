import { useEffect, useState} from 'react';
import { fetchAuthorList, fetchSurahList, fetchVerseList } from './api';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import VerseComponent from './VerseComponent';

const BarComponent = () => {
  const [loading, setLoading] = useState(true);
  const [dataSurah, setDataSurah] = useState([])
  const [dataAuthor, setDataAuthor] = useState([])
  const [dataVerse, setDataVerse] = useState([])
  const [surah, setSurah] = useState(0);
  const [surahName, setSurahName] = useState('');
  const [author, setAuthor] = useState(0);
  const [gorunum, setGorunum] = useState(false);
  const [error, setError] = useState('');

useEffect(() => {
    fetchSurahList()
      .then(data => {
        setDataSurah(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(true);
      });


     fetchAuthorList()
      .then(data => {
        setDataAuthor(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
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
        setError(err);
      //  setLoading(true);
      });
}

  const handleChangeSurah = (newValue) => {
    setSurah(newValue?.id||0);
     setSurahName(newValue?.name);
       getVerseList(newValue.id,author);
  };

   const handleChangeAuthor = (event) => {
    setAuthor(event.target.value);
       getVerseList(surah,event.target.value);
  };

     const handleChangeGorunum = (event) => {
    setGorunum(event.target.checked);
  };

 return (
        <>  

        {loading && <div>Loading</div>}
        {!loading && (
       
            <div>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 100}}>
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
              </FormControl>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 200 }}>
                <InputLabel id="select-label2">Meal</InputLabel>
                <Select
                  labelId="label2"
                  id="select2"
                  value={author}
                  label="Seslendiren"
                  onChange={handleChangeAuthor}
                >
                  {dataAuthor.map(item => (<MenuItem key={item.id} value={item.id}>{item.name}</MenuItem>))}
                </Select>
              </FormControl>
              <FormControl>
                <FormControlLabel
                  control={<Switch checked={gorunum} onChange={handleChangeGorunum} name="gorunum" />}
                  label="Görünüm" />
              </FormControl>
            </div>
        )}

        <VerseComponent surah={surah} author={author} gorunum={gorunum} dataVerse={dataVerse} />
        </>
  );
}

export default BarComponent;