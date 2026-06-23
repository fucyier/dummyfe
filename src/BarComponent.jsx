import { useEffect, useRef, useState} from 'react';
import { fetchAudioList, fetchAuthorList, fetchRandomVerseTranslations, fetchSurahList, fetchVerseList } from './api';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { toast } from 'react-toastify';
import VerseComponent from './VerseComponent';

const sortByText = (items, field) => (
  [...items].sort((a, b) => (a?.[field] || '').localeCompare(b?.[field] || '', 'tr', { sensitivity: 'base' }))
);

const uniqueByText = (items, field) => {
  const seen = new Set();
  return items.filter((item) => {
    const key = (item?.[field] || '').trim().toLocaleLowerCase('tr');
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const DEFAULT_AUDIO_IDENTIFIER = 'ar.alafasy';

const BarComponent = () => {
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [dataSurah, setDataSurah] = useState([])
  const [dataAuthor, setDataAuthor] = useState([])
   const [dataAudio, setDataAudio] = useState([])
  const [dataVerse, setDataVerse] = useState([])
  const [randomVerses, setRandomVerses] = useState([])
  const [randomLoading, setRandomLoading] = useState(true)
  const [surah, setSurah] = useState(0);
  const [author, setAuthor] = useState(0);
  const [audio, setAudio] = useState(DEFAULT_AUDIO_IDENTIFIER);
  const [gorunum, setGorunum] = useState(false);
  const [controlsHeight, setControlsHeight] = useState(0);

useEffect(() => {
    if (!controlsRef.current) return undefined;

    const updateControlsHeight = () => {
      const nextControlsHeight = controlsRef.current?.offsetHeight || 0;
      setControlsHeight(nextControlsHeight);
      document.documentElement.style.setProperty('--controls-height', `${nextControlsHeight}px`);
    };
    const resizeObserver = new ResizeObserver(updateControlsHeight);

    updateControlsHeight();
    resizeObserver.observe(controlsRef.current);
    window.addEventListener('resize', updateControlsHeight);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', updateControlsHeight);
    };
  }, [loading]);

useEffect(() => {
    fetchSurahList()
      .then(data => {
        setDataSurah(data);
        return fetchRandomVerseTranslations(data);
      })
      .then(data => {
        setRandomVerses(data);
        setRandomLoading(false);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setRandomLoading(false);
        setLoading(true);
      });


     fetchAuthorList()
      .then(data => {
        setDataAuthor(sortByText(data, 'name'));
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(true);
      });

      fetchAudioList()
      .then(data => {
        setDataAudio(sortByText(uniqueByText(data, 'englishName'), 'englishName'));
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
        toast.error(err?.message || 'Ayetler yüklenirken bir hata oluştu.');
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
    if (selectedSurah === 0) {
      setAuthor(0);
      setAudio(DEFAULT_AUDIO_IDENTIFIER);
      setDataVerse([]);
      return;
    }
       getVerseList(selectedSurah,author);
  };

   const handleChangeAuthor = (newValue) => {
    const selectedAuthor = newValue?.id || 0;
    setAuthor(selectedAuthor);
       getVerseList(surah,selectedAuthor);
  };

     const handleChangeAudio = (newValue) => {
      if(surah===0) toast.error("Sure seçiniz.");
       setAudio(newValue?.identifier || '');
      // getVerseList(surah,event.target.value);
  };

  const handleChangeGorunum = (event) => {
    setGorunum(event.target.checked);
  };

 return (
        <>  

        {loading && <div>Lütfen Bekleyiniz...</div>}
        {!loading && (
       
            <Box
              id="top-controls"
              ref={controlsRef}
              sx={{
                position: 'fixed',
                top: { xs: 0, sm: 48 },
                left: 0,
                right: 0,
                zIndex: 1090,
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                gap: 1,
                px: 1,
                py: 1,
                backgroundColor: '#f8f5e8',
                backgroundImage: `
                  linear-gradient(rgba(248, 245, 232, 0.42), rgba(248, 245, 232, 0.42)),
                  url('/images/islamic-pattern.png')
                `,
                backgroundSize: 'auto, 620px auto',
                backgroundAttachment: 'fixed',
                borderBottom: '1px solid rgba(142, 118, 63, 0.28)',
                boxShadow: '0 3px 12px rgba(47, 56, 35, 0.12)',
                backdropFilter: 'blur(4px)',
              }}
            >
              {/* <FormControl variant="standard" sx={{ m: 1, minWidth: 100}}>
                <Autocomplete
                  value={surahName}
                  id="free-solo-2-demo"
                  autoHighlight
                  options={dataSurah}
                  getOptionKey={(option) => option.id}
                  getOptionLabel={(option) => (option?.id ? `${option.id}. ${option.name}` : "")}
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

                <FormControl variant="standard" sx={{ minWidth: { xs: 140, sm: 170 }, flex: '0 1 190px' }}>
                <Autocomplete
                  id="select1"
                  autoHighlight
                  openOnFocus
                  options={dataSurah}
                  value={dataSurah.find(item => item.id === surah) || null}
                  getOptionLabel={(option) => (option?.id ? `${option.id}. ${option.name}` : "")}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => handleChangeSurah(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      {option.id}. {option.name}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField {...params} label="Sure" variant="standard" />
                  )}
                />
              </FormControl>
              <FormControl variant="standard" sx={{ minWidth: { xs: 140, sm: 170 }, flex: '0 1 190px' }}>
                <Autocomplete
                  id="select2"
                  autoHighlight
                  openOnFocus
                  disabled={surah === 0}
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
               <FormControl variant="standard" sx={{ minWidth: { xs: 140, sm: 170 }, flex: '0 1 190px' }}>
                <Autocomplete
                  id="select3"
                  autoHighlight
                  openOnFocus
                  disabled={surah === 0}
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
              <FormControl
                sx={{
                  flex: '0 0 auto',
                  minHeight: 48,
                  justifyContent: 'flex-end',
                  ml: { xs: 0, sm: 1 },
                }}
              >
                <FormControlLabel
                  control={(
                    <Switch
                      checked={gorunum}
                      onChange={handleChangeGorunum}
                      name="gorunum"
                      disabled={surah === 0}
                      sx={{
                        '& .MuiSwitch-switchBase.Mui-checked': {
                          color: '#6f7745',
                        },
                        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                          backgroundColor: '#6f7745',
                        },
                      }}
                    />
                  )}
                  label="Latince"
                  sx={{
                    m: 0,
                    color: '#4f4a33',
                    '& .MuiFormControlLabel-label': {
                      fontWeight: 700,
                      whiteSpace: 'nowrap',
                    },
                  }}
                />
              </FormControl>
            </Box>
        )}

        {!loading && <Box sx={{ height: controlsHeight + 2 }} />}
        {!loading && surah === 0 && (
          <>
          <Paper
            elevation={2}
              sx={{
                position: 'relative',
                zIndex: 1,
                mx: 'auto',
                mt: 1,
                mb: 4,
              maxWidth: 900,
              p: { xs: 2, sm: 3 },
              textAlign: 'left',
              backgroundColor: '#eef9fb',
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.78), rgba(255, 248, 217, 0.88)),
                url('/images/random-verses-bg.png')
              `,
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center bottom',
              backgroundSize: 'cover',
              border: '6px double rgba(142, 118, 63, 0.72)',
              borderRadius: 1,
              outline: '1px solid rgba(255, 248, 217, 0.95)',
              outlineOffset: '-12px',
              boxShadow: `
                0 8px 28px rgba(47, 56, 35, 0.14),
                inset 0 0 0 1px rgba(84, 97, 61, 0.22),
                inset 0 0 24px rgba(142, 118, 63, 0.16)
              `,
            }}
          >
            {randomLoading && (
              <Typography>Yükleniyor...</Typography>
            )}
            {!randomLoading && randomVerses.map((item, index) => (
              <Box key={item.id} sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#6f7745', mb: 0.5 }}>
                  {item.surahName} Suresi, {item.verseNumber}. ayet
                </Typography>
                <Typography variant="body1">{item.translation}</Typography>
                {index < randomVerses.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </Paper>
            <Typography
              variant="caption"
              sx={{
                display: 'block',
                position: 'fixed',
                left: 0,
                right: 0,
                bottom: 14,
                zIndex: 0,
                pointerEvents: 'none',
                textAlign: 'center',
                color: '#6f5a22',
                fontWeight: 700,
                textShadow: '0 1px 0 rgba(255, 248, 217, 0.8)',
              }}
            >
              © 2026 Caner DEMİR
            </Typography>
          </>
        )}
        {surah !== 0 && (
          <VerseComponent
            key={surah}
            surah={surah}
            author={author}
            audio={audio}
            gorunum={gorunum}
            dataVerse={dataVerse}
            dataSurah={dataSurah}
            dataAuthor={dataAuthor}
            onAuthorChange={handleChangeAuthor}
            onSurahNavigate={handleChangeSurah}
          />
        )}
        </>
  );
}

export default BarComponent;
