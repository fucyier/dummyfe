import { useEffect, useMemo, useRef, useState} from 'react';
import { fetchAudioList, fetchAuthorList, fetchRandomVerseTranslations, fetchSurahList, fetchVerseList } from './api';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Autocomplete from '@mui/material/Autocomplete';
import CloseIcon from '@mui/icons-material/Close';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import TranslateIcon from '@mui/icons-material/Translate';
import ViewCarouselIcon from '@mui/icons-material/ViewCarousel';
import { toast } from 'react-toastify';
import VerseComponent from './VerseComponent';
import AyetKartlariComponent from './AyetKartlariComponent';
import { applySurahSeo } from './seo';

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

const DEFAULT_AUDIO_IDENTIFIER = 'quranfoundation:7';
const DEFAULT_AUTHOR_ID = 77;

const viewTabButtonSx = (active) => ({
  minHeight: { xs: 30, sm: 34 },
  px: { xs: 0.9, sm: 1.25 },
  py: 0.35,
  borderRadius: 999,
  color: active ? '#fff8d9' : '#62675a',
  backgroundColor: active ? '#2f312d' : 'transparent',
  boxShadow: active ? '0 2px 8px rgba(47, 49, 45, 0.18)' : 'none',
  fontWeight: 800,
  fontSize: { xs: '0.72rem', sm: '0.88rem' },
  textTransform: 'none',
  whiteSpace: 'nowrap',
  '&:hover': {
    backgroundColor: active ? '#2f312d' : 'rgba(255, 255, 255, 0.62)',
  },
  '&.Mui-disabled': {
    color: 'rgba(79, 74, 51, 0.36)',
  },
  '& .MuiButton-startIcon': {
    mr: 0.45,
  },
});

const ViewTabs = ({
  disabled,
  workspaceMode,
  memorizationView,
  onMemorizationViewChange,
  readingView,
  onReadingViewChange,
  ayahCardsOpen,
  onAyahCardsOpen,
}) => {
  const visibleTabs = workspaceMode === 'reading'
    ? [
        { value: 'arabic', label: 'Arapça', icon: <MenuBookIcon fontSize="small" />, onClick: () => onReadingViewChange('arabic') },
        { value: 'meal', label: 'Meal', icon: <TranslateIcon fontSize="small" />, onClick: () => onReadingViewChange('meal') },
      ]
    : [
        { value: 'arabic', label: 'Arapça', icon: <MenuBookIcon fontSize="small" />, onClick: () => onMemorizationViewChange('arabic') },
        { value: 'latin', label: 'Latince', icon: <TranslateIcon fontSize="small" />, onClick: () => onMemorizationViewChange('latin') },
        { value: 'ayah-cards', label: 'Ayet Kartları', icon: <ViewCarouselIcon fontSize="small" />, onClick: onAyahCardsOpen },
      ];
  const activeValue = disabled
    ? ''
    : workspaceMode === 'memorization'
      ? (ayahCardsOpen ? 'ayah-cards' : memorizationView)
      : readingView;

  return (
    <Box sx={{ display: 'grid', justifyItems: 'center' }}>
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.25,
          p: 0.25,
          borderRadius: 999,
          backgroundColor: 'rgba(238, 238, 238, 0.9)',
          boxShadow: 'inset 0 0 0 1px rgba(79, 74, 51, 0.08)',
        }}
      >
        {visibleTabs.map((item) => (
          item.type === 'divider' ? (
            <Divider
              key={item.value}
              orientation="vertical"
              flexItem
              sx={{
                mx: 0.3,
                my: 0.45,
                borderColor: 'rgba(79, 74, 51, 0.22)',
              }}
            />
          ) : (
            <Button
              key={item.value}
              size="small"
              startIcon={item.icon}
              disabled={disabled}
              onClick={item.onClick}
              sx={viewTabButtonSx(activeValue === item.value)}
            >
              {item.label}
            </Button>
          )
        ))}
      </Box>
    </Box>
  );
};

const LoadingState = () => (
  <Box
    sx={{
      minHeight: '45vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 1.5,
      color: '#6f5a22',
      fontWeight: 800,
    }}
  >
    <CircularProgress sx={{ color: '#6f7745' }} />
    <Typography sx={{ fontWeight: 800 }}>
      Lütfen Bekleyiniz...
    </Typography>
  </Box>
);

const AUDIO_SOURCE_ORDER = {
  'Ayet Bazlı': 0,
  'Sure Bazlı': 1,
};

const sortAudioOptions = (items) => (
  [...items].sort((a, b) => {
    const sourceCompare = (AUDIO_SOURCE_ORDER[a.sourceLabel] ?? 99) - (AUDIO_SOURCE_ORDER[b.sourceLabel] ?? 99);
    if (sourceCompare !== 0) return sourceCompare;

    return (a?.englishName || '').localeCompare(b?.englishName || '', 'tr', { sensitivity: 'base' });
  })
);

const topControlFieldSx = {
  minWidth: { xs: 0, sm: 190 },
  flex: { xs: '1 1 calc(50% - 8px)', sm: '0 1 210px' },
};

const topControlWideFieldSx = {
  ...topControlFieldSx,
  minWidth: { xs: 0, sm: 210 },
  flex: { xs: '1 1 calc(50% - 8px)', sm: '0 1 230px' },
};

const topControlSurahFieldSx = {
  ...topControlFieldSx,
  flex: { xs: '1 1 100%', sm: '0 1 210px' },
};

const isQuranFoundationAyahAudio = (item) => (
  item?.audioType === 'ayah' && item?.source === 'quranfoundation'
);

const isAyahAudio = (item) => item?.audioType === 'ayah';

const topControlTextFieldSx = {
  '& .MuiInputBase-root': {
    minHeight: { xs: 36, sm: 40 },
  },
  '& .MuiInputBase-input': {
    fontSize: { xs: '0.78rem', sm: '0.88rem' },
    fontWeight: 700,
    py: { xs: 0.55, sm: 0.8 },
  },
  '& .MuiInputLabel-root': {
    fontSize: { xs: '0.78rem', sm: '0.9rem' },
  },
};

const compactAutocompleteSlotProps = {
  paper: {
    sx: {
      mt: 0.5,
      '& .MuiAutocomplete-groupLabel': {
        minHeight: { xs: 28, sm: 36 },
        lineHeight: { xs: '28px', sm: '36px' },
        fontSize: { xs: '0.72rem', sm: '0.82rem' },
        fontWeight: 800,
      },
      '& .MuiAutocomplete-option': {
        minHeight: { xs: 32, sm: 40 },
        py: { xs: 0.35, sm: 0.75 },
        px: { xs: 1, sm: 2 },
        fontSize: { xs: '0.78rem', sm: '0.9rem' },
      },
    },
  },
  listbox: {
    sx: {
      maxHeight: { xs: '42vh', sm: 320 },
    },
  },
};

const slugifySurahName = (name) => (
  String(name || '')
    .trim()
    .toLocaleLowerCase('tr')
    .replaceAll('ı', 'i')
    .replaceAll('ğ', 'g')
    .replaceAll('ü', 'u')
    .replaceAll('ş', 's')
    .replaceAll('ö', 'o')
    .replaceAll('ç', 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
);

const getSurahPath = (surahItem) => {
  const slug = surahItem?.slug || slugifySurahName(surahItem?.name);
  return slug ? `/sure/${slug}/` : '/';
};

const getLegacySurahPath = (surahItem) => {
  const slug = surahItem?.slug || slugifySurahName(surahItem?.name);
  return slug ? `/${slug}_suresi` : '/';
};

const getSurahFromPath = (surahList) => {
  const currentPath = decodeURIComponent(window.location.pathname || '').replace(/^\/+|\/+$/g, '');
  if (!currentPath) return null;

  return surahList.find((item) => (
    currentPath === getSurahPath(item).slice(1)
    || currentPath === getLegacySurahPath(item).slice(1)
  )) || null;
};

const updateSurahPath = (surahItem) => {
  const nextPath = surahItem ? getSurahPath(surahItem) : '/';
  if (window.location.pathname !== nextPath) {
    window.history.pushState(null, '', nextPath);
  }
};

const scrollPageToTop = () => {
  const options = { top: 0, behavior: 'auto' };
  document.scrollingElement?.scrollTo(options);
  document.documentElement.scrollTo(options);
  document.body.scrollTo(options);
  window.scrollTo(options);
};

const BarComponent = ({
  contentOverride = null,
  contentAudioFilter = null,
  hideSurahControl = false,
  workspaceMode = 'memorization',
}) => {
  const controlsRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [verseLoading, setVerseLoading] = useState(false);
  const [dataSurah, setDataSurah] = useState([])
  const [dataAuthor, setDataAuthor] = useState([])
   const [dataAudio, setDataAudio] = useState([])
  const [dataVerse, setDataVerse] = useState([])
  const [randomVerses, setRandomVerses] = useState([])
  const [randomLoading, setRandomLoading] = useState(true)
  const [randomSurahMealOpen, setRandomSurahMealOpen] = useState(false);
  const [randomSurahMealLoading, setRandomSurahMealLoading] = useState(false);
  const [randomSurahMeal, setRandomSurahMeal] = useState(null);
  const [surah, setSurah] = useState(0);
  const [author, setAuthor] = useState(0);
  const [audio, setAudio] = useState(DEFAULT_AUDIO_IDENTIFIER);
  const [memorizationView, setMemorizationView] = useState('arabic');
  const [readingView, setReadingView] = useState('arabic');
  const [controlsHeight, setControlsHeight] = useState(0);
  const [mealDrawerOpenSignal, setMealDrawerOpenSignal] = useState(0);
  const [authorSelectOpen, setAuthorSelectOpen] = useState(false);
  const [pendingReadingMeal, setPendingReadingMeal] = useState(false);
  const [ayahCardsOpen, setAyahCardsOpen] = useState(false);

  const closeAuthorSelect = () => {
    setAuthorSelectOpen(false);
    window.setTimeout(() => {
      if (document.activeElement instanceof HTMLElement) {
        document.activeElement.blur();
      }
    }, 0);
  };

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
        setLoading(false);
        const initialSurah = workspaceMode === 'memorization' ? getSurahFromPath(data) : null;
        if (initialSurah) {
          setSurah(initialSurah.id);
          getVerseList(initialSurah.id, 0);
        }

        const loadRandomVerses = () => {
          fetchRandomVerseTranslations(data)
            .then(setRandomVerses)
            .catch(console.error)
            .finally(() => setRandomLoading(false));
        };

        if ('requestIdleCallback' in window) {
          window.requestIdleCallback(loadRandomVerses, { timeout: 1500 });
        } else {
          window.setTimeout(loadRandomVerses, 0);
        }
      })
      .catch(err => {
        console.error(err);
        setRandomLoading(false);
        setLoading(false);
      });


     fetchAuthorList()
      .then(data => {
        setDataAuthor(sortByText(data, 'name'));
      })
      .catch(err => {
        console.error(err);
      });

      fetchAudioList()
      .then(data => {
        setDataAudio(sortAudioOptions(uniqueByText(data, 'id')));
      })
      .catch(err => {
        console.error(err);
      });

     
  }, []);

const getVerseList =function (surahId,authorId, options = {}){
   setVerseLoading(true);
   return fetchVerseList(surahId,authorId)
      .then(data => {
        setDataVerse(data);
        setLoading(false);
        setVerseLoading(false);
        if (options.openMealDrawer) {
          setMealDrawerOpenSignal((value) => value + 1);
        }
        return data;
      })
      .catch(err => {
        toast.error(err?.message || 'Ayetler yüklenirken bir hata oluştu.');
      //  setLoading(true);
        setVerseLoading(false);
      });
}

  // const handleChangeSurah = (newValue) => {
  //   setSurah(newValue?.id||0);
  //    setSurahName(newValue?.name);
  //      getVerseList(newValue.id,author);
  // };

    const handleChangeSurah = (newValue) => {
    const selectedSurah = newValue?.id || 0;
    scrollPageToTop();
    setSurah(selectedSurah);
    if (selectedSurah === 0) {
      if (contentOverride || workspaceMode === 'memorization') {
        updateSurahPath(null);
      }
      setAuthor(0);
      setAudio(DEFAULT_AUDIO_IDENTIFIER);
      setDataVerse([]);
      setVerseLoading(false);
      setPendingReadingMeal(false);
      return;
    }
       if (contentOverride || workspaceMode === 'memorization') {
         updateSurahPath(newValue);
       }
       if (contentOverride && author === 0) {
         setAuthor(DEFAULT_AUTHOR_ID);
         getVerseList(selectedSurah, DEFAULT_AUTHOR_ID);
         return;
       }
       getVerseList(selectedSurah,author);
  };

   const handleSurePageSelectSurah = (newValue) => {
    const selectedSurah = newValue?.id || 0;
    const selectedAuthor = author || DEFAULT_AUTHOR_ID;
    scrollPageToTop();
    setSurah(selectedSurah);
    if (selectedSurah === 0) {
      setDataVerse([]);
      setVerseLoading(false);
      return;
    }

    if (author === 0) {
      setAuthor(DEFAULT_AUTHOR_ID);
    }

    getVerseList(selectedSurah, selectedAuthor);
  };

   const handleChangeAuthor = (newValue) => {
    const selectedAuthor = newValue?.id || 0;
    closeAuthorSelect();
    setAuthor(selectedAuthor);
    if (surah === 0 || selectedAuthor === 0) {
      setPendingReadingMeal(false);
      return;
    }

       getVerseList(surah,selectedAuthor, { openMealDrawer: !pendingReadingMeal })
        .then(() => {
          if (pendingReadingMeal) {
            setReadingView('meal');
            setPendingReadingMeal(false);
          }
        })
        .catch(() => {});
  };

     const handleChangeAudio = (newValue) => {
      if(surah===0 && !contentOverride) toast.error("Sure seçiniz.");
       setAudio(newValue?.id || '');
      // getVerseList(surah,event.target.value);
  };

  const gorunum = workspaceMode === 'memorization' && memorizationView === 'latin';
  const readingArabicMode = !contentOverride && workspaceMode === 'reading' && readingView === 'arabic';
  const activeAudioFilter = useMemo(() => {
    if (contentOverride) return contentAudioFilter || isAyahAudio;
    if (readingArabicMode) return isQuranFoundationAyahAudio;
    if (ayahCardsOpen) return isAyahAudio;
    return null;
  }, [contentOverride, contentAudioFilter, readingArabicMode, ayahCardsOpen]);
  const availableAudioOptions = activeAudioFilter
    ? dataAudio.filter(activeAudioFilter)
    : dataAudio;
  const selectedAudioOption = availableAudioOptions.find(item => item.id === audio) || null;
  const selectedSurahOption = dataSurah.find(item => item.id === surah) || null;

  useEffect(() => {
    if (!contentOverride && workspaceMode === 'memorization' && selectedSurahOption) {
      applySurahSeo(selectedSurahOption);
    }
  }, [contentOverride, workspaceMode, selectedSurahOption]);

  useEffect(() => {
    if (!activeAudioFilter || dataAudio.length === 0) return;
    const currentAudio = dataAudio.find(item => item.id === audio);
    if (currentAudio && activeAudioFilter(currentAudio)) return;

    const defaultAyahAudio = dataAudio.find(item => item.id === DEFAULT_AUDIO_IDENTIFIER && activeAudioFilter(item))
      || dataAudio.find(activeAudioFilter);
    setAudio(defaultAyahAudio?.id || '');
  }, [activeAudioFilter, dataAudio, audio]);

  const handleReadingViewChange = (nextReadingView) => {
    if (nextReadingView === 'meal' && author === 0) {
      setPendingReadingMeal(false);
      setAuthor(DEFAULT_AUTHOR_ID);
      setReadingView('meal');
      if (surah !== 0) {
        getVerseList(surah, DEFAULT_AUTHOR_ID);
      }
      return;
    }

    setPendingReadingMeal(false);
    setReadingView(nextReadingView);
  };

  const handleAyahCardsOpen = () => {
    if (surah === 0) return;

    const ayahAudioOptions = dataAudio.filter(item => item.audioType === 'ayah');
    const currentAudio = dataAudio.find(item => item.id === audio);
    if (!currentAudio || currentAudio.audioType !== 'ayah') {
      const defaultAyahAudio = ayahAudioOptions.find(item => item.id === DEFAULT_AUDIO_IDENTIFIER)
        || ayahAudioOptions[0];
      setAudio(defaultAyahAudio?.id || '');
    }

    if (author === 0) {
      setAuthor(DEFAULT_AUTHOR_ID);
      getVerseList(surah, DEFAULT_AUTHOR_ID);
    }
    setAyahCardsOpen(true);
  };

  const handleRandomSurahMealOpen = (item) => {
    setRandomSurahMealOpen(true);
    setRandomSurahMealLoading(true);
    setRandomSurahMeal({
      surahId: item.surahId,
      surahName: item.surahName,
      verses: [],
    });

    fetchVerseList(item.surahId, DEFAULT_AUTHOR_ID)
      .then(data => {
        setRandomSurahMeal({
          surahId: item.surahId,
          surahName: item.surahName,
          verses: data?.verses || [],
        });
      })
      .catch(err => {
        toast.error(err?.message || 'Meal yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setRandomSurahMealLoading(false);
      });
  };

  const handleRandomSurahMealClose = () => {
    setRandomSurahMealOpen(false);
  };

 return (
        <>  

        {loading && <LoadingState />}
        {!loading && (
       
            <Box
              id="top-controls"
              ref={controlsRef}
              sx={{
                position: 'fixed',
                top: 48,
                left: 0,
                right: 0,
                zIndex: 1090,
                display: 'block',
                px: { xs: 0.6, sm: 1 },
                py: { xs: 0.6, sm: 1 },
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
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: { xs: 0.6, sm: 1 },
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

                {!hideSurahControl && <FormControl variant="outlined" sx={topControlSurahFieldSx}>
                <Autocomplete
                  id="select1"
                  size="small"
                  autoHighlight
                  openOnFocus
                  slotProps={compactAutocompleteSlotProps}
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
                    <TextField
                      {...params}
                      label="Sure Seçiniz"
                      placeholder="Sure Seçiniz"
                      variant="outlined"
                      size="small"
                      sx={topControlTextFieldSx}
                    />
                  )}
                />
              </FormControl>}
              <FormControl variant="outlined" sx={topControlFieldSx}>
                <Autocomplete
                  id="select2"
                  size="small"
                  autoHighlight
                  openOnFocus
                  blurOnSelect
                  open={authorSelectOpen}
                  onOpen={() => setAuthorSelectOpen(true)}
                  onClose={closeAuthorSelect}
                  slotProps={compactAutocompleteSlotProps}
                  disabled={surah === 0 && !contentOverride}
                  options={dataAuthor}
                  value={dataAuthor.find(item => item.id === author) || null}
                  getOptionLabel={(option) => option.name || ""}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => handleChangeAuthor(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Meal Seçiniz"
                      placeholder="Meal Seçiniz"
                      variant="outlined"
                      size="small"
                      sx={topControlTextFieldSx}
                    />
                  )}
                />
              </FormControl>
               <FormControl variant="outlined" sx={topControlWideFieldSx}>
                <Autocomplete
                  id="select3"
                  size="small"
                  autoHighlight
                  openOnFocus
                  slotProps={compactAutocompleteSlotProps}
                  disabled={surah === 0 && !contentOverride}
                  options={availableAudioOptions}
                  value={selectedAudioOption}
                  groupBy={(option) => option.sourceLabel || 'Diger'}
                  getOptionLabel={(option) => `${option.isKaabaImam ? '🕋 ' : ''}${option.englishName || ""}`}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(event, newValue) => handleChangeAudio(newValue)}
                  noOptionsText="Sonuc bulunamadi"
                  renderOption={(props, option) => (
                    <Box component="li" {...props}>
                      {option.isKaabaImam && (
                        <Box component="span" aria-hidden="true" sx={{ mr: 0.75 }}>
                          🕋
                        </Box>
                      )}
                      {option.englishName}
                    </Box>
                  )}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Seslendiren Seçiniz"
                      placeholder="Seslendiren Seçiniz"
                      variant="outlined"
                      size="small"
                      sx={topControlTextFieldSx}
                    />
                  )}
                />
              </FormControl>
              </Box>
              {!contentOverride && <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center', mt: { xs: 0.6, sm: 0.8 } }}>
                <ViewTabs
                  disabled={surah === 0}
                  workspaceMode={workspaceMode}
                  memorizationView={memorizationView}
                  onMemorizationViewChange={setMemorizationView}
                  readingView={readingView}
                  onReadingViewChange={handleReadingViewChange}
                  ayahCardsOpen={ayahCardsOpen}
                  onAyahCardsOpen={handleAyahCardsOpen}
                />
              </Box>}
            </Box>
        )}

        {!loading && <Box sx={{ height: controlsHeight + 2 }} />}
        {!loading && contentOverride && (
          typeof contentOverride === 'function'
            ? contentOverride({
              dataSurah,
              dataAuthor,
              dataAudio: availableAudioOptions,
              surah,
              author,
              audio: selectedAudioOption,
              selectedAuthor: dataAuthor.find(item => item.id === author) || null,
              controlsHeight,
              onSurahChange: handleSurePageSelectSurah,
            })
            : contentOverride
        )}
        {!loading && !contentOverride && verseLoading && <LoadingState />}
        {!loading && !contentOverride && !verseLoading && surah === 0 && (
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
                  <Button
                    variant="text"
                    onClick={() => handleRandomSurahMealOpen(item)}
                    sx={{
                      minWidth: 0,
                      p: 0,
                      color: '#6f7745',
                      fontWeight: 800,
                      fontSize: 'inherit',
                      lineHeight: 'inherit',
                      textTransform: 'none',
                      verticalAlign: 'baseline',
                      '&:hover': {
                        backgroundColor: 'transparent',
                        color: '#4f5b2f',
                        textDecoration: 'underline',
                      },
                    }}
                  >
                    {item.surahName} Suresi
                  </Button>
                  {`, ${item.verseNumber}. ayet`}
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
        {!loading && !contentOverride && !verseLoading && surah !== 0 && (
          <VerseComponent
            key={surah}
            surah={surah}
            author={author}
            audio={dataAudio.find(item => item.id === audio) || null}
            gorunum={gorunum}
            readingMode={workspaceMode === 'reading'}
            readingView={readingView}
            dataVerse={dataVerse}
            dataSurah={dataSurah}
            dataAuthor={dataAuthor}
            mealDrawerOpenSignal={mealDrawerOpenSignal}
            onAuthorChange={handleChangeAuthor}
            onSurahNavigate={handleChangeSurah}
          />
        )}
        {!loading && !contentOverride && workspaceMode === 'memorization' && (
          <AyetKartlariComponent
            key={`ayet-kartlari-${surah}-${audio}-${ayahCardsOpen ? 'open' : 'closed'}`}
            open={ayahCardsOpen}
            onClose={() => setAyahCardsOpen(false)}
            surah={surah}
            surahName={selectedSurahOption?.name}
            dataVerse={dataVerse}
            audioOptions={dataAudio.filter(item => item.audioType === 'ayah')}
            audio={selectedAudioOption}
            onAudioChange={handleChangeAudio}
            authorOptions={dataAuthor}
            selectedAuthor={dataAuthor.find(item => item.id === author) || null}
            onAuthorChange={handleChangeAuthor}
          />
        )}
        <Dialog
          open={randomSurahMealOpen}
          onClose={handleRandomSurahMealClose}
          fullWidth
          maxWidth="md"
          scroll="paper"
          PaperProps={{
            sx: {
              borderRadius: 1,
              backgroundColor: '#fffdf4',
            },
          }}
        >
          <DialogTitle
            sx={{
              pr: 7,
              color: '#6f5a22',
              fontWeight: 800,
            }}
          >
            {randomSurahMeal?.surahName ? `${randomSurahMeal.surahName} Suresi` : 'Sure Meali'}
            <IconButton
              aria-label="Meali kapat"
              onClick={handleRandomSurahMealClose}
              sx={{
                position: 'absolute',
                right: 12,
                top: 10,
                color: '#6f5a22',
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent dividers sx={{ backgroundColor: '#fffdf4' }}>
            {randomSurahMealLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress sx={{ color: '#6f7745' }} />
              </Box>
            )}
            {!randomSurahMealLoading && randomSurahMeal?.verses?.map((item, index) => (
              <Box key={item.id || item.verse_number || index} sx={{ mb: 2, textAlign: 'left' }}>
                <Typography variant="body1">
                  <Box component="span" sx={{ fontWeight: 800, mr: 0.75, color: '#6f7745' }}>
                    {item.verse_number}.
                  </Box>
                  {item.translation?.text || ''}
                </Typography>
                {index < randomSurahMeal.verses.length - 1 && <Divider sx={{ mt: 2 }} />}
              </Box>
            ))}
          </DialogContent>
        </Dialog>
        </>
  );
}

export default BarComponent;
