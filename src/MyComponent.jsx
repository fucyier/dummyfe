import React, { useEffect, useState} from 'react';
import { fetchAuthorList, fetchSurahList, verseList } from './api';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';

const MyComponent = () => {
  const [loading, setLoading] = useState(true);
  const [dataSurah, setDataSurah] = useState([])
  const [dataAuthor, setDataAuthor] = useState([])
  const [dataVerse, setDataVerse] = useState([])
  const [surah, setSurah] = useState(0);
    const [surahName, setSurahName] = useState('');
  const [author, setAuthor] = useState(0);
   const [verseSimplified, setVerseSimplified] = useState(false);

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
   verseList(surahId,authorId)
      .then(data => {
        setDataVerse(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err);
        setLoading(true);
      });
}

 const handleChangeSurah = (newValue) => {
    setSurah(newValue.id);
     setSurahName(newValue.name);
    getVerseList(newValue.id,author);
  };


   const handleChangeAuthor = (event) => {
    setAuthor(event.target.value);
       getVerseList(surah,event.target.value);
  };
     const handleChangeVerseSimpl = (event) => {
    setVerseSimplified(event.target.checked);
  };

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff7f7ea',
  ...theme.typography.h3,
  padding: theme.spacing(4),
  textAlign: 'right',
  color: (theme.vars ?? theme).palette.text.primary,
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
  }),
}));

  return (
    <div>
    {loading && <div>Loading</div>}
    {!loading && (
         <>
         <div>
            <FormControl variant="standard" sx={{ m: 1, minWidth: 130 }}>
             {/*  <InputLabel id="select-label">Sureler</InputLabel>
              <Select
                labelId="dselect-label"
                id="select"
                value={surah}
                label="Sure"
                onChange={handleChangeSurah}
              >
                {dataSurah.map(item => (<MenuItem key={item.id} value={item.id}>{item.id +'. ' + item.name}</MenuItem>))}
              </Select> */}
                <Autocomplete
                 value={surahName}
                  id="free-solo-2-demo" 
                  autoHighlight
                  options={dataSurah}
                  // options={dataSurah.map((item) => item.id +'. ' + item.name)}
                  getOptionKey={(option) => option.id}
                  getOptionLabel={(option) => option.name || ""}
                   
                  onChange={(event, newValue) => {
                   
                      handleChangeSurah(newValue)
                    }}
                  sx={{ width: 300 }}
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
                  }}
                />
              )}
            />
                  
                
            </FormControl>
              <FormControl variant="standard" sx={{ m: 1, minWidth: 250 }}>
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
                control={
                  <Switch checked={verseSimplified} onChange={handleChangeVerseSimpl} name="verseSimplifiedStr" />
                }
          label="Görünüm"
        />
               </FormControl>
          </div>
          <div>
            <Typography sx={{ mt: 4, mb: 2 }} variant="h4" component="div">
            {dataVerse.name}
          </Typography>
         <Stack
            direction="column"
             
            spacing={2}
            sx={{
              justifyContent: "flex-start",
              alignItems: "stretch",
            }}
              >
           {dataVerse?.verses?.map(item => 
           <>
             <Divider>
              <Chip label={item.verse_number} size="small" />
            </Divider>
           <Item key={item.id} value={item.id}>{verseSimplified? item.verse_simplified:item.verse} 
           </Item>
            <div id={'tr'+item.id} style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'left'}}>{item.transcription}</div> 
           
            <div id={'tra'+item.id} style={{display: 'flex', justifyContent: 'flex-end', textAlign: 'left'}}>{author!==0? item.translation.text:''}</div> 
            
           
           </>
           )}
  </Stack>
          </div>
          </>
    )}
    </div>
  )
}

export default MyComponent;