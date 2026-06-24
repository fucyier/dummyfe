import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { AudioPlayer } from 'react-audio-play';
import { AppBar, Autocomplete, Button, CircularProgress, Fab, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Select, Slider, Switch, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Fragment, useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const ArabicVerse = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff8d9',
  padding: theme.spacing(1.5, 3),
  textAlign: 'right',
  direction: 'rtl',
  unicodeBidi: 'plaintext',
  fontFamily: [
    'var(--font-mushaf)',
    'KFGQPC HAFS',
    'KFGQPC Uthman Taha Naskh',
    'Traditional Arabic',
    'serif',
  ].join(', '),
  fontSize: 'clamp(1.85rem, 3.7vw, 3.35rem)',
  fontWeight: 400,
  lineHeight: 1.85,
  letterSpacing: 0,
  color: '#211b14',
  wordBreak: 'normal',
  overflowWrap: 'anywhere',
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
    color: '#fff7ea',
  }),
}));

const VerseEndMark = styled('span')({
  position: 'relative',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: '1.15em',
  height: '1.15em',
  marginInlineStart: '0.28em',
  verticalAlign: 'middle',
  border: '0.055em solid #6f5a22',
  borderRadius: '50%',
  color: '#6f5a22',
  fontFamily: 'Traditional Arabic, serif',
  fontSize: '0.48em',
  lineHeight: 1,
  '&::before': {
    content: '""',
    position: 'absolute',
    inset: '-0.16em',
    border: '0.035em dotted #6f5a22',
    borderRadius: '50%',
  },
});

const formatArabicVerse = (text) => (
  text
    ?.replaceAll('\u06ea', '\u0650')
    .replaceAll('\u0656', '\u0650')
    .replace(/\u06d4[\u064b-\u0652]?/g, '')
    .replace(/[\u06d6-\u06ed]/g, '') || ''
);

const toArabicNumber = (value) => (
  String(value ?? '').replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[digit])
);

const playbackSpeedOptions = [0.75, 1, 1.25, 1.5, 2];
const DEFAULT_PLAYBACK_SPEED = 1;
const DEFAULT_REPEAT_EACH_VERSE = 1;
const DEFAULT_LOOP_LESSON = false;
const DEFAULT_START_VERSE = 1;
const DEFAULT_END_VERSE = 0;
const MIN_REPEAT_EACH_VERSE = 1;
const MAX_REPEAT_EACH_VERSE = 99;

const clampRepeatEachVerse = (value) => Math.min(
  MAX_REPEAT_EACH_VERSE,
  Math.max(MIN_REPEAT_EACH_VERSE, Number(value) || MIN_REPEAT_EACH_VERSE),
);

const getAudioVerseId = (verseId) => String(verseId ?? '').split('.')[0];

const getScrollTop = () => (
  window.scrollY
  || document.documentElement.scrollTop
  || document.body.scrollTop
  || 0
);

const getControlsOffset = () => {
  const controlsElement = document.getElementById('top-controls');

  if (controlsElement) {
    return controlsElement.getBoundingClientRect().bottom + 16;
  }

  const controlsHeight = parseFloat(
    getComputedStyle(document.documentElement).getPropertyValue('--controls-height'),
  );

  return (Number.isFinite(controlsHeight) ? controlsHeight : 0) + 16;
};

const scrollVerseToTop = (verseId) => {
  const verseElement = document.getElementById(`verse-${verseId}`);
  if (!verseElement) return;

  const top = Math.max(0, verseElement.getBoundingClientRect().top + getScrollTop() - getControlsOffset());
  const options = { top, behavior: 'smooth' };

  document.scrollingElement?.scrollTo(options);
  document.documentElement.scrollTo(options);
  document.body.scrollTo(options);
  window.scrollTo(options);
};

const scheduleVerseScrollToTop = (verseId) => {
  [120, 360, 700].forEach((delay) => {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => scrollVerseToTop(verseId));
    }, delay);
  });
};

const VerseComponent = ({
  surah,
  author,
  audio,
  gorunum,
  dataVerse,
  dataSurah = [],
  dataAuthor = [],
  onAuthorChange,
  onSurahNavigate,
}) => {
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [secilenSound, setSecilenSound] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(DEFAULT_PLAYBACK_SPEED);
  const [activeVerseId, setActiveVerseId] = useState(null);
  const [configDrawerOpen, setConfigDrawerOpen] = useState(false);
  const [startVerse, setStartVerse] = useState(DEFAULT_START_VERSE);
  const [endVerse, setEndVerse] = useState(DEFAULT_END_VERSE);
  const [repeatEachVerse, setRepeatEachVerse] = useState(DEFAULT_REPEAT_EACH_VERSE);
  const [loopLesson, setLoopLesson] = useState(DEFAULT_LOOP_LESSON);
  const [lessonMode, setLessonMode] = useState(false);
  const [configPlaybackActive, setConfigPlaybackActive] = useState(false);
  const [currentVerseRepeat, setCurrentVerseRepeat] = useState(1);
  const [audioReplayKey, setAudioReplayKey] = useState(0);
  const verseCount = dataVerse?.verse_count || dataVerse?.verses?.length || 0;

  useEffect(() => {
    document.querySelectorAll('audio').forEach((audioElement) => {
      audioElement.playbackRate = playbackSpeed;
    });
  }, [playbackSpeed, audioDrawerOpen, mealOpen, secilenSound, dataVerse?.audio?.mp3]);

  const renderPlaybackSpeedControl = (labelId) => (
    <FormControl size="small" sx={{ flex: '0 0 96px', minWidth: 96 }}>
      <InputLabel id={labelId} sx={{ color: '#fff8d9' }}>Hız</InputLabel>
      <Select
        labelId={labelId}
        value={playbackSpeed}
        label="Hız"
        onChange={(event) => setPlaybackSpeed(Number(event.target.value))}
        sx={{
          color: '#fff8d9',
          height: 36,
          '& .MuiSelect-select': {
            pr: '28px !important',
            overflow: 'visible',
            textOverflow: 'clip',
            whiteSpace: 'nowrap',
          },
          '.MuiOutlinedInput-notchedOutline': {
            borderColor: 'rgba(255, 248, 217, 0.55)',
          },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: '#fff8d9',
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: '#d7b765',
          },
          '.MuiSvgIcon-root': {
            color: '#fff8d9',
          },
        }}
      >
        {playbackSpeedOptions.map((speed) => (
          <MenuItem key={speed} value={speed}>
            {speed}x
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );

  const resetLessonSettings = () => {
    setPlaybackSpeed(DEFAULT_PLAYBACK_SPEED);
    setStartVerse(DEFAULT_START_VERSE);
    setEndVerse(DEFAULT_END_VERSE);
    setRepeatEachVerse(DEFAULT_REPEAT_EACH_VERSE);
    setLoopLesson(DEFAULT_LOOP_LESSON);
    setLessonMode(false);
    setConfigPlaybackActive(false);
    setCurrentVerseRepeat(1);
  };

  const handleConfigDrawerClose = () => {
    setConfigDrawerOpen(false);
    resetLessonSettings();
  };

  const mealItems = [
    dataVerse.zero,
    ...(dataVerse?.verses || []),
  ].filter(item => item?.translation?.text);
  const zeroVerseText = formatArabicVerse(dataVerse.zero?.verse).trim();
  const hasZeroVerse = Boolean(zeroVerseText || dataVerse.zero?.transcription);
  const currentSurahIndex = dataSurah.findIndex(item => item.id === surah);
  const selectedSurah = dataSurah.find(item => item.id === surah);
  const previousSurah = currentSurahIndex > 0 ? dataSurah[currentSurahIndex - 1] : null;
  const nextSurah = currentSurahIndex >= 0 && currentSurahIndex < dataSurah.length - 1
    ? dataSurah[currentSurahIndex + 1]
    : null;
  const verseOptions = Array.from({ length: verseCount }, (_, index) => index + 1);
  const selectedStartVerse = Math.min(Math.max(startVerse, 1), verseCount || 1);
  const selectedEndVerse = endVerse === 0
    ? verseCount || 1
    : Math.min(Math.max(endVerse, selectedStartVerse), verseCount || selectedStartVerse);
  const isConfigPlaybackActive = configPlaybackActive && audioDrawerOpen;

  const handleStartVerseChange = (event) => {
    const nextStartVerse = Number(event.target.value);
    setStartVerse(nextStartVerse);
    if (nextStartVerse > selectedEndVerse) {
      setEndVerse(nextStartVerse);
    }
  };

  const handleEndVerseChange = (event) => {
    const nextEndVerse = Number(event.target.value);
    setEndVerse(nextEndVerse);
    if (nextEndVerse < startVerse) {
      setStartVerse(nextEndVerse);
    }
  };

  const handleStartLesson = () => {
    if (!audio) {
      toast.error('Lütfen Seslendiren Seçiniz');
      return;
    }

    const firstVerse = dataVerse?.verses?.find(
      item => item.verse_number >= selectedStartVerse && item.verse_number <= selectedEndVerse,
    );

    if (!firstVerse) {
      toast.error('Seçilen aralıkta ayet bulunamadı.');
      return;
    }

    const firstVerseId = String(firstVerse.id);
    setConfigDrawerOpen(false);
    setAudioDrawerOpen(true);
    setLessonMode(true);
    setConfigPlaybackActive(true);
    setSecilenSound(getAudioVerseId(firstVerseId));
    setActiveVerseId(firstVerseId);
    setCurrentVerseRepeat(1);
    setAudioReplayKey((prevKey) => prevKey + 1);
    scheduleVerseScrollToTop(firstVerseId);
  };

  const configDrawerContent = (
    <Box
      sx={{
        width: { xs: '86vw', sm: 360 },
        maxWidth: 380,
        height: '100%',
        boxSizing: 'border-box',
        p: 2.5,
        backgroundColor: '#fffdf4',
        color: '#211b14',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 800 }}>
          Ayarlar
        </Typography>
        <IconButton aria-label="Ayarları kapat" onClick={handleConfigDrawerClose}>
          <CloseIcon />
        </IconButton>
      </Box>

      <Box sx={{ display: 'grid', gap: 3 }}>
        <Box
          sx={{
            p: 2,
            border: '1px solid rgba(84, 97, 61, 0.18)',
            borderRadius: 1,
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
            Aralık
          </Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25 }}>
            <FormControl fullWidth size="small">
              <InputLabel id="start-verse-label">Başlangıç</InputLabel>
              <Select
                labelId="start-verse-label"
                value={selectedStartVerse}
                label="Başlangıç"
                onChange={handleStartVerseChange}
              >
                {verseOptions.map((verseNumber) => (
                  <MenuItem key={verseNumber} value={verseNumber}>
                    {verseNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControl fullWidth size="small">
              <InputLabel id="end-verse-label">Bitiş</InputLabel>
              <Select
                labelId="end-verse-label"
                value={selectedEndVerse}
                label="Bitiş"
                onChange={handleEndVerseChange}
              >
                {verseOptions.map((verseNumber) => (
                  <MenuItem key={verseNumber} value={verseNumber}>
                    {verseNumber}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>

        <Box
          sx={{
            p: 2,
            border: '1px solid rgba(84, 97, 61, 0.18)',
            borderRadius: 1,
            backgroundColor: '#ffffff',
          }}
        >
          <Typography variant="subtitle1" sx={{ mb: 1.5, fontWeight: 800 }}>
            Oynatma
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'minmax(120px, 1fr) auto',
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            <TextField
              fullWidth
              size="small"
              type="text"
              label="Tekrar"
              value={repeatEachVerse}
              onChange={(event) => setRepeatEachVerse(clampRepeatEachVerse(event.target.value))}
              slotProps={{
                htmlInput: {
                  min: MIN_REPEAT_EACH_VERSE,
                  max: MAX_REPEAT_EACH_VERSE,
                  step: 1,
                  inputMode: 'numeric',
                  readOnly: true,
                  style: {
                    textAlign: 'center',
                    fontWeight: 800,
                  },
                },
              }}
              InputProps={{
                startAdornment: (
                  <IconButton
                    aria-label="Tekrar sayısını azalt"
                    size="small"
                    onClick={() => setRepeatEachVerse((value) => clampRepeatEachVerse(value - 1))}
                    disabled={repeatEachVerse <= MIN_REPEAT_EACH_VERSE}
                    sx={{ color: '#6f7745', ml: -0.75 }}
                  >
                    <RemoveIcon fontSize="small" />
                  </IconButton>
                ),
                endAdornment: (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.25, ml: 0.5, '& > button:first-of-type': { display: 'none' } }}>
                    <IconButton
                      aria-label="Tekrar sayısını azalt"
                      size="small"
                      onClick={() => setRepeatEachVerse((value) => clampRepeatEachVerse(value - 1))}
                      disabled={repeatEachVerse <= MIN_REPEAT_EACH_VERSE}
                      sx={{ color: '#6f7745' }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Tekrar sayısını artır"
                      size="small"
                      onClick={() => setRepeatEachVerse((value) => clampRepeatEachVerse(value + 1))}
                      disabled={repeatEachVerse >= MAX_REPEAT_EACH_VERSE}
                      sx={{ color: '#6f7745' }}
                    >
                      <AddIcon fontSize="small" />
                    </IconButton>
                  </Box>
                ),
              }}
            />
            <FormControlLabel
              control={(
                <Switch
                  checked={loopLesson}
                  onChange={(event) => setLoopLesson(event.target.checked)}
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
              label="Döngüye al"
              sx={{
                m: 0,
                color: '#4f4a33',
                '& .MuiFormControlLabel-label': {
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                },
              }}
            />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography
              id="config-playback-speed-slider"
              variant="body2"
              sx={{ mb: 0.75, color: '#4f4a33', fontWeight: 800 }}
            >
              Oynatma hızı: {playbackSpeed}x
            </Typography>
            <Slider
              aria-labelledby="config-playback-speed-slider"
              value={playbackSpeed}
              min={0.75}
              max={2}
              step={0.25}
              marks={playbackSpeedOptions.map((speed) => ({
                value: speed,
                label: `${speed}x`,
              }))}
              onChange={(event, value) => setPlaybackSpeed(Number(value))}
              sx={{
                color: '#6f7745',
                '& .MuiSlider-markLabel': {
                  color: '#4f4a33',
                  fontSize: '0.75rem',
                },
              }}
            />
          </Box>
        </Box>
        <Button
          fullWidth
          variant="contained"
          startIcon={<PlayArrowIcon />}
          onClick={handleStartLesson}
          sx={{
            py: 1.1,
            backgroundColor: '#6f7745',
            color: '#fff8d9',
            fontWeight: 800,
            boxShadow: '0 3px 10px rgba(47, 56, 35, 0.22)',
            '&:hover': {
              backgroundColor: '#5b6438',
            },
          }}
        >
          Başlat
        </Button>
      </Box>
    </Box>
  );

  const mealDrawerContent = (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 2, pb: 4 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          {selectedSurah ? `${selectedSurah.name} Suresi` : 'Türkçe Meal'}
        </Typography>
        <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', sm: 240 } }}>
          <Autocomplete
            autoHighlight
            openOnFocus
            options={dataAuthor}
            value={dataAuthor.find(item => item.id === author) || null}
            getOptionLabel={(option) => option.name || ''}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            onChange={(event, newValue) => onAuthorChange?.(newValue)}
            noOptionsText="Sonuc bulunamadi"
            renderInput={(params) => (
              <TextField {...params} label="Meal" variant="outlined" />
            )}
          />
        </FormControl>
      </Box>
      {dataVerse?.audio?.mp3 && (
        <Box sx={{ mb: 2, maxWidth: '100%', overflow: 'hidden' }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              px: 1,
              py: 0.25,
              backgroundColor: '#54613d',
              maxWidth: '100%',
              overflow: 'hidden',
            }}
          >
            <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
              <AudioPlayer
                className="quran-audio-player"
                src={dataVerse.audio.mp3}
                width="100%"
                color="#fff8d9"
                sliderColor="#d7b765"
                backgroundColor="#54613d"
              />
            </Box>
            {renderPlaybackSpeedControl('meal-playback-speed-label')}
          </Box>
        </Box>
      )}
      {author === 0 && (
        <Typography sx={{ textAlign: 'left' }}>Meal seçiniz.</Typography>
      )}
      {author !== 0 && mealItems.map((item, index) => (
        <Box key={item.id || index} sx={{ mb: 2, textAlign: 'left' }}>
          <Typography variant="body1">
            <Box component="span" sx={{ fontWeight: 700, mr: 0.75 }}>
              {index === 0 ? 'Besmele' : `${item.verse_number}.`}
            </Box>
            {item.translation.text}
          </Typography>
          {index < mealItems.length - 1 && <Divider sx={{ mt: 2 }} />}
        </Box>
      ))}
    </Box>
  );

  const audioDrawerContent = (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.5,
        width: '100%',
        maxWidth: '100vw',
        boxSizing: 'border-box',
        overflow: 'hidden',
        px: 0.5,
        py: 0.25,
        backgroundColor: '#54613d',
      }}
      role="presentation"
    >
      <Box sx={{ flex: '1 1 auto', minWidth: 0 }}>
        <AudioPlayer
          key={audioReplayKey}
          className="quran-audio-player"
          autoPlay
          src={`https://cdn.islamic.network/quran/audio/128/${audio}/${secilenSound}.mp3`}
          width="100%"
          color="#cfcfcf"
          sliderColor="#d7b765"
          backgroundColor="#54613d"
          onEnd={() => {
            if (!lessonMode) {
              setAudioDrawerOpen(false);
              setSecilenSound(null);
              setActiveVerseId(null);
              resetLessonSettings();
              return;
            }

            const verses = dataVerse?.verses || [];
            const currentIndex = verses.findIndex(item => String(item.id) === activeVerseId);
            const currentVerse = verses[currentIndex];
            const nextVerse = verses
              .slice(currentIndex + 1)
              .find(item => item.verse_number >= selectedStartVerse && item.verse_number <= selectedEndVerse);

            if (currentVerse && currentVerseRepeat < repeatEachVerse) {
              setCurrentVerseRepeat(currentVerseRepeat + 1);
              setAudioReplayKey((prevKey) => prevKey + 1);
              return;
            }

            if (nextVerse) {
              const nextVerseId = String(nextVerse.id);
              setAudioDrawerOpen(true);
              setSecilenSound(getAudioVerseId(nextVerseId));
              setActiveVerseId(nextVerseId);
              setCurrentVerseRepeat(1);
              setAudioReplayKey((prevKey) => prevKey + 1);
              scheduleVerseScrollToTop(nextVerseId);
              return;
            }

            if (loopLesson) {
              const firstVerse = verses.find(
                item => item.verse_number >= selectedStartVerse && item.verse_number <= selectedEndVerse,
              );
              if (firstVerse) {
                const firstVerseId = String(firstVerse.id);
                setAudioDrawerOpen(true);
                setSecilenSound(getAudioVerseId(firstVerseId));
                setActiveVerseId(firstVerseId);
                setCurrentVerseRepeat(1);
                setAudioReplayKey((prevKey) => prevKey + 1);
                scheduleVerseScrollToTop(firstVerseId);
                return;
              }
            }

            setAudioDrawerOpen(false);
            setSecilenSound(null);
            setActiveVerseId(null);
            resetLessonSettings();
          }}
        />
      </Box>
      {renderPlaybackSpeedControl('verse-playback-speed-label')}
    </Box>
  );

  const handleScrollTop = () => {
    document.documentElement.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    document.body.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleVerseAudioClick = (verseId) => {
    if (!audio) {
      toast.error('Lütfen Seslendiren Seçiniz');
      return;
    }
    resetLessonSettings();
    setAudioDrawerOpen(true);
    setLessonMode(true);
    setSecilenSound(getAudioVerseId(verseId));
    setActiveVerseId(String(verseId));
    setCurrentVerseRepeat(1);
    setAudioReplayKey((prevKey) => prevKey + 1);
    scheduleVerseScrollToTop(verseId);
  };

  const handleAudioDrawerClose = () => {
    setAudioDrawerOpen(false);
    setSecilenSound(null);
    setActiveVerseId(null);
    resetLessonSettings();
  };

  const isActiveVerse = (verseId) => audioDrawerOpen && activeVerseId === String(verseId);

  return (
    <>
      <div>
        {dataVerse.length != 0 && (
          <Box
            sx={{
              mx: 'auto',
              mt: 1,
              mb: 2,
              width: '100%',
              maxWidth: 1120,
              minHeight: { xs: 108, sm: 132 },
              display: 'grid',
              gridTemplateColumns: { xs: 'minmax(86px, 1fr) minmax(120px, 1.25fr) minmax(86px, 1fr)', sm: '1fr 1.35fr 1fr' },
              alignItems: 'center',
              columnGap: { xs: 0.5, sm: 2 },
              backgroundColor: '#f8f5e8',
              backgroundImage: `
                url('/images/surah-title-lines-transparent.png'),
                linear-gradient(rgba(248, 245, 232, 0.42), rgba(248, 245, 232, 0.42)),
                url('/images/islamic-pattern.png')
              `,
              backgroundRepeat: 'no-repeat, repeat, repeat',
              backgroundPosition: 'center, center, center',
              backgroundSize: '100% 100%, auto, 620px auto',
              backgroundAttachment: 'scroll, fixed, fixed',
              px: { xs: 3, sm: 6 },
              py: { xs: 1.5, sm: 2 },
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start', minWidth: 0, pl: { xs: 3, sm: 5 } }}>
            {previousSurah && (
              <Button
                variant="outlined"
                startIcon={<ChevronLeftIcon />}
                onClick={() => onSurahNavigate?.(previousSurah)}
                sx={{
                  maxWidth: '100%',
                  minWidth: 0,
                  minHeight: { xs: 42, sm: 46 },
                  px: { xs: 0.9, sm: 1.4 },
                  py: 0.7,
                  borderColor: '#8e763f',
                  borderWidth: 1.5,
                  borderRadius: 1,
                  color: '#6f5a22',
                  fontWeight: 800,
                  fontSize: { xs: '0.72rem', sm: '0.88rem' },
                  lineHeight: 1.15,
                  textTransform: 'none',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  backgroundColor: 'rgba(255, 248, 217, 0.8)',
                  boxShadow: '0 2px 7px rgba(47, 56, 35, 0.14)',
                  '&:hover': {
                    borderColor: '#6f5a22',
                    backgroundColor: 'rgba(215, 183, 101, 0.22)',
                    boxShadow: '0 3px 10px rgba(47, 56, 35, 0.2)',
                  },
                  '& .MuiButton-startIcon': {
                    mr: { xs: 0.25, sm: 0.5 },
                  },
                }}
              >
                {previousSurah.id}. {previousSurah.name}
              </Button>
            )}
            </Box>
            <Box sx={{ minWidth: 0, textAlign: 'center' }}>
            <Typography
              variant="h4"
              component="div"
              sx={{
                color: '#6f5a22',
                fontWeight: 700,
                textAlign: 'center',
                fontSize: { xs: '1.55rem', sm: '2.35rem' },
                lineHeight: 1.1,
                overflowWrap: 'anywhere',
              }}
            >
              {dataVerse.name + ' Suresi'}
            </Typography>
            {verseCount > 0 && (
              <Typography
                variant="subtitle1"
                component="div"
                sx={{
                  mt: 0.5,
                  color: '#6f5a22',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: { xs: '0.88rem', sm: '1.05rem' },
                  lineHeight: 1.2,
                }}
              >
                {verseCount} Ayet
              </Typography>
            )}
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', minWidth: 0, pr: { xs: 3, sm: 5 } }}>
            {nextSurah && (
              <Button
                variant="outlined"
                endIcon={<ChevronRightIcon />}
                onClick={() => onSurahNavigate?.(nextSurah)}
                sx={{
                  maxWidth: '100%',
                  minWidth: 0,
                  minHeight: { xs: 42, sm: 46 },
                  px: { xs: 0.9, sm: 1.4 },
                  py: 0.7,
                  borderColor: '#8e763f',
                  borderWidth: 1.5,
                  borderRadius: 1,
                  color: '#6f5a22',
                  fontWeight: 800,
                  fontSize: { xs: '0.72rem', sm: '0.88rem' },
                  lineHeight: 1.15,
                  textTransform: 'none',
                  whiteSpace: 'normal',
                  textAlign: 'right',
                  backgroundColor: 'rgba(255, 248, 217, 0.8)',
                  boxShadow: '0 2px 7px rgba(47, 56, 35, 0.14)',
                  '&:hover': {
                    borderColor: '#6f5a22',
                    backgroundColor: 'rgba(215, 183, 101, 0.22)',
                    boxShadow: '0 3px 10px rgba(47, 56, 35, 0.2)',
                  },
                  '& .MuiButton-endIcon': {
                    ml: { xs: 0.25, sm: 0.5 },
                  },
                }}
              >
                {nextSurah.id}. {nextSurah.name}
              </Button>
            )}
            </Box>
          </Box>
        )}
        <br />
        <Stack
          direction="column"
          spacing={gorunum ? 0.75 : 2}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            pb: dataVerse.audio !== undefined ? 7 : 0,
          }}
        >
          {!gorunum && zeroVerseText && (
            <ArabicVerse key={dataVerse.zero?.id} value={dataVerse.zero?.id}>
              {zeroVerseText}
            </ArabicVerse>
          )}
          {hasZeroVerse && (
            <div
              id={'tr0' + dataVerse.zero?.id}
              style={{
                display: 'flex',
                justifyContent: gorunum ? 'flex-start' : 'flex-end',
                textAlign: 'left',
              }}
            >
              {dataVerse.zero?.transcription}
            </div>
          )}

          {dataVerse?.verses?.map(item => (
            <Fragment key={item.id}>
              {gorunum && <Divider sx={{ my: 0.5 }} />}
              {!gorunum && (
                <Divider>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  value={item.id}
                  sx={{
                    backgroundColor: '#6f7745',
                    color: '#fff8d9',
                    boxShadow: '0 2px 6px rgba(47, 56, 35, 0.24)',
                    '&:hover': {
                      backgroundColor: '#5b6438',
                    },
                  }}
                  onClick={(e) => {
                    if (!audio) {
                      toast.error('Lütfen Seslendiren Seçiniz');
                      return;
                    }
                    handleVerseAudioClick(e.currentTarget.value);
                  }}
                >
                  {item.verse_number + '. ayet'}
                </Button>
                </Divider>
              )}
              {!gorunum && (
                <ArabicVerse
                  id={`verse-${item.id}`}
                  value={item.id}
                  sx={{
                    transition: 'background-color 180ms ease, box-shadow 180ms ease, outline-color 180ms ease',
                    ...(isActiveVerse(item.id) && {
                      backgroundColor: '#ffeaa3',
                      outline: '4px solid #d7b765',
                      boxShadow: '0 0 0 8px rgba(215, 183, 101, 0.26), 0 10px 28px rgba(47, 56, 35, 0.24)',
                    }),
                  }}
                >
                  {formatArabicVerse(item.verse)}
                  <VerseEndMark>{toArabicNumber(item.verse_number)}</VerseEndMark>
                </ArabicVerse>
              )}
              <div
                id={gorunum ? `verse-${item.id}` : `tr${item.id}`}
                style={{
                  display: 'flex',
                  justifyContent: gorunum ? 'flex-start' : 'flex-end',
                  alignItems: 'center',
                  gap: gorunum ? '10px' : 0,
                  textAlign: 'left',
                  padding: gorunum ? '6px 10px' : 0,
                  borderRadius: gorunum ? 6 : 0,
                  transition: 'background-color 180ms ease, box-shadow 180ms ease, outline-color 180ms ease',
                  ...(gorunum && isActiveVerse(item.id) ? {
                    backgroundColor: '#ffeaa3',
                    outline: '3px solid #d7b765',
                    boxShadow: '0 0 0 6px rgba(215, 183, 101, 0.22)',
                    fontWeight: 700,
                  } : {}),
                }}
              >
                {gorunum && (
                  <Button
                    variant="contained"
                    startIcon={<PlayArrowIcon fontSize="small" />}
                    value={item.id}
                    sx={{
                      minWidth: 64,
                      px: 1.25,
                      py: 0.35,
                      '& .MuiButton-startIcon': {
                        mr: 0.5,
                      },
                      backgroundColor: '#6f7745',
                      color: '#fff8d9',
                      boxShadow: '0 2px 6px rgba(47, 56, 35, 0.18)',
                      '&:hover': {
                        backgroundColor: '#5b6438',
                      },
                    }}
                    onClick={(e) => handleVerseAudioClick(e.currentTarget.value)}
                  >
                    {item.verse_number + '.'}
                  </Button>
                )}
                {item.transcription}
              </div>
            </Fragment>
          ))}

          <Drawer
            anchor="bottom"
            open={audioDrawerOpen}
            onClose={handleAudioDrawerClose}
            ModalProps={{ disableScrollLock: true }}
            slotProps={{
              backdrop: {
                sx: { backgroundColor: 'transparent' },
              },
            }}
          >
            {audioDrawerContent}
          </Drawer>
        </Stack>
      </div>

      {verseCount > 0 && (
        <>
          <Fab
            color="primary"
            size="medium"
            aria-label={isConfigPlaybackActive ? 'Ayarlar oynatılıyor' : 'Ayarlar'}
            onClick={isConfigPlaybackActive ? undefined : () => setConfigDrawerOpen(true)}
            sx={{
              position: 'fixed',
              right: { xs: 12, sm: 18 },
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1200,
              backgroundColor: '#6f7745',
              color: '#fff8d9',
              '&:hover': {
                backgroundColor: '#5b6438',
              },
            }}
          >
            {isConfigPlaybackActive ? (
              <CircularProgress size={28} thickness={5} sx={{ color: '#fff8d9' }} />
            ) : (
              <SettingsIcon />
            )}
          </Fab>
          <Drawer
            anchor="right"
            open={configDrawerOpen}
            onClose={handleConfigDrawerClose}
          >
            {configDrawerContent}
          </Drawer>
        </>
      )}

      {dataVerse.audio !== undefined && (
        <Fab
          color="primary"
          size="medium"
          aria-label="Yukarı çık"
          onClick={handleScrollTop}
          sx={{
            position: 'fixed',
            right: { xs: 16, sm: 24 },
            bottom: { xs: 72, sm: 80 },
            zIndex: 1200,
            backgroundColor: '#6f7745',
            color: '#fff8d9',
            '&:hover': {
              backgroundColor: '#5b6438',
            },
          }}
        >
          <KeyboardArrowUpIcon />
        </Fab>
      )}

      {dataVerse.audio !== undefined && (
        <AppBar
          position="fixed"
          style={{ top: 'auto', bottom: 0 }}
          sx={{
            backgroundColor: '#54613d',
            color: '#fff8d9',
            borderTop: '1px solid rgba(142, 118, 63, 0.35)',
            boxShadow: '0 -2px 10px rgba(47, 56, 35, 0.22)',
          }}
        >
          <Button
            color="inherit"
            endIcon={<KeyboardArrowUpIcon />}
            onClick={() => setMealOpen(true)}
            sx={{ py: 1, fontWeight: 700 }}
          >
            Türkçe Meal
          </Button>
        </AppBar>
      )}

      <Drawer anchor="bottom" open={mealOpen} onClose={() => setMealOpen(false)}>
        {mealDrawerContent}
      </Drawer>
    </>
  );
};

export default VerseComponent;
