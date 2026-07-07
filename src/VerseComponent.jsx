import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { AudioPlayer } from 'react-audio-play';
import { AppBar, Autocomplete, Button, CircularProgress, Dialog, DialogContent, DialogTitle, Fab, FormControl, FormControlLabel, IconButton, InputLabel, MenuItem, Popper, Select, Slider, Switch, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Fragment, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { fetchQuranFoundationAyahAudioUrl, fetchVerseTafsirs, fetchVerseTranslationsByAuthors, normalizeQuranFoundationAudioUrl } from './api';

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

const QURAN_ANNOTATION_MARKS_REGEX = /[\u0610-\u061a\u06d6-\u06ed\u25cc]/g;

const formatArabicVerse = (text) => (
  text
    ?.replaceAll('\u06ea', '\u0650')
    .replaceAll('\u0656', '\u0650')
    .replace(/\u06d4[\u064b-\u0652]?/g, '')
    .replace(QURAN_ANNOTATION_MARKS_REGEX, '') || ''
);

const toArabicNumber = (value) => (
  String(value ?? '').replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[digit])
);

const playbackSpeedOptions = [0.75, 1, 1.25, 1.5, 2];
const configPlaybackSpeedPresets = [0.25, 1, 1.25, 1.5, 2];
const DEFAULT_PLAYBACK_SPEED = 1;
const DEFAULT_REPEAT_EACH_VERSE = 1;
const DEFAULT_LOOP_LESSON = false;
const DEFAULT_START_VERSE = 1;
const DEFAULT_END_VERSE = 0;
const MIN_REPEAT_EACH_VERSE = 1;
const MAX_REPEAT_EACH_VERSE = 99;

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

const compactTextFieldSx = {
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

const clampRepeatEachVerse = (value) => Math.min(
  MAX_REPEAT_EACH_VERSE,
  Math.max(MIN_REPEAT_EACH_VERSE, Number(value) || MIN_REPEAT_EACH_VERSE),
);

const getAudioVerseId = (verseId) => String(verseId ?? '').split('.')[0];

const clampPlaybackSpeed = (value) => Math.min(2, Math.max(0.25, Number(value) || DEFAULT_PLAYBACK_SPEED));

const formatConfigPlaybackSpeedLabel = (speed) => (
  Number.isInteger(speed) ? `${speed}.0` : String(speed)
);

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

const scrollVerseToTop = (verseId, options = {}) => {
  const verseElement = document.getElementById(
    options.includeActions ? `verse-actions-${verseId}` : `verse-${verseId}`,
  ) || document.getElementById(`verse-${verseId}`);

  if (!verseElement) return;

  const top = Math.max(0, verseElement.getBoundingClientRect().top + getScrollTop() - getControlsOffset());
  const scrollOptions = { top, behavior: 'smooth' };

  document.scrollingElement?.scrollTo(scrollOptions);
  document.documentElement.scrollTo(scrollOptions);
  document.body.scrollTo(scrollOptions);
  window.scrollTo(scrollOptions);
};

const scheduleVerseScrollToTop = (verseId, options = {}) => {
  [120, 360, 700].forEach((delay) => {
    window.setTimeout(() => {
      window.requestAnimationFrame(() => scrollVerseToTop(verseId, options));
    }, delay);
  });
};

const normalizeAudioOption = (audio) => {
  if (!audio) return null;
  if (typeof audio === 'string') {
    return {
      source: 'alquran',
      audioType: 'ayah',
      identifier: audio,
    };
  }

  return audio;
};

const getMp3QuranSurahAudioUrl = (audioOption, surahId) => {
  if (!audioOption?.server || !surahId) return '';

  const baseUrl = audioOption.server.endsWith('/') ? audioOption.server : `${audioOption.server}/`;
  return `${baseUrl}${String(surahId).padStart(3, '0')}.mp3`;
};

const getAudioPlayerSrc = (audioOption, surahId, verseAudioId) => {
  if (!audioOption) return '';

  if (audioOption.source === 'mp3quran') {
    return getMp3QuranSurahAudioUrl(audioOption, surahId);
  }

  if (audioOption.source === 'quranfoundation') {
    return verseAudioId || '';
  }

  if (!audioOption.identifier || !verseAudioId) return '';
  return `https://cdn.islamic.network/quran/audio/128/${audioOption.identifier}/${verseAudioId}.mp3`;
};

const VerseComponent = ({
  surah,
  author,
  audio,
  gorunum,
  readingMode = false,
  readingView = 'arabic',
  dataVerse,
  dataSurah = [],
  dataAuthor = [],
  mealDrawerOpenSignal = 0,
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
  const [verseMealDialogOpen, setVerseMealDialogOpen] = useState(false);
  const [verseMealDialogVerse, setVerseMealDialogVerse] = useState(null);
  const [verseMealDialogLoading, setVerseMealDialogLoading] = useState(false);
  const [verseMealTranslations, setVerseMealTranslations] = useState([]);
  const [verseTafsirDialogOpen, setVerseTafsirDialogOpen] = useState(false);
  const [verseTafsirDialogVerse, setVerseTafsirDialogVerse] = useState(null);
  const [verseTafsirDialogLoading, setVerseTafsirDialogLoading] = useState(false);
  const [verseTafsirs, setVerseTafsirs] = useState([]);
  const [arabicVerseLoopIds, setArabicVerseLoopIds] = useState({});
  const [arabicPanelPlaybackVerseId, setArabicPanelPlaybackVerseId] = useState(null);
  const [arabicPanelLoadingVerseId, setArabicPanelLoadingVerseId] = useState(null);
  const [selectedWordPopover, setSelectedWordPopover] = useState({
    anchorEl: null,
    word: null,
  });
  const lastMealDrawerOpenSignalRef = useRef(mealDrawerOpenSignal);
  const wordAudioRef = useRef(null);
  const wordAudioPlayTokenRef = useRef(0);
  const verseCount = dataVerse?.verse_count || dataVerse?.verses?.length || 0;
  const selectedAudio = normalizeAudioOption(audio);
  const isMp3QuranAudio = selectedAudio?.source === 'mp3quran';
  const isQuranFoundationAudio = selectedAudio?.source === 'quranfoundation';
  const audioPlayerSrc = getAudioPlayerSrc(selectedAudio, surah, secilenSound);
  const mp3QuranSurahAvailable = !isMp3QuranAudio || selectedAudio?.surahList?.includes(surah);

  useEffect(() => {
    document.querySelectorAll('audio').forEach((audioElement) => {
      audioElement.playbackRate = playbackSpeed;
    });
  }, [playbackSpeed, audioDrawerOpen, mealOpen, secilenSound, dataVerse?.audio?.mp3, audioPlayerSrc]);

  useEffect(() => {
    if (mealDrawerOpenSignal > lastMealDrawerOpenSignalRef.current) {
      setMealOpen(true);
    }
    lastMealDrawerOpenSignalRef.current = mealDrawerOpenSignal;
  }, [mealDrawerOpenSignal]);

  useEffect(() => {
    if (!selectedWordPopover.anchorEl) return undefined;

    const handleDocumentPointerDown = (event) => {
      const target = event.target;
      if (target instanceof Node && selectedWordPopover.anchorEl?.contains(target)) {
        return;
      }

      handleWordPopoverClose();
    };

    document.addEventListener('pointerdown', handleDocumentPointerDown);

    return () => {
      document.removeEventListener('pointerdown', handleDocumentPointerDown);
    };
  }, [selectedWordPopover.anchorEl]);

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

  const handleStartLesson = async () => {
    if (!selectedAudio) {
      toast.error('Lütfen Seslendiren Seçiniz');
      return;
    }

    if (isMp3QuranAudio) {
      if (!mp3QuranSurahAvailable) {
        toast.error('Seçilen seslendiren bu sure için uygun değil.');
        return;
      }

      setConfigDrawerOpen(false);
      setAudioDrawerOpen(true);
      setLessonMode(false);
      setConfigPlaybackActive(false);
      setSecilenSound(`surah-${surah}`);
      setActiveVerseId(null);
      setCurrentVerseRepeat(1);
      setAudioReplayKey((prevKey) => prevKey + 1);
      toast.info('MP3Quran kaynağı sure bazlıdır; seçili surenin tamamı oynatılıyor.');
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
    try {
      const firstSound = await loadSelectedAyahAudio(firstVerseId);
      setConfigDrawerOpen(false);
      setAudioDrawerOpen(true);
      setLessonMode(true);
      setConfigPlaybackActive(true);
      setSecilenSound(firstSound);
      setActiveVerseId(firstVerseId);
      setCurrentVerseRepeat(1);
      setAudioReplayKey((prevKey) => prevKey + 1);
      scheduleVerseScrollToTop(firstVerseId);
    } catch (error) {
      console.error(error);
      setArabicPanelLoadingVerseId(null);
      setArabicPanelPlaybackVerseId(null);
      toast.error('Ayet sesi yüklenirken bir hata oluştu.');
    }
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
                disabled={isMp3QuranAudio}
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
                disabled={isMp3QuranAudio}
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
              disabled={isMp3QuranAudio}
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
                    disabled={isMp3QuranAudio || repeatEachVerse <= MIN_REPEAT_EACH_VERSE}
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
                      disabled={isMp3QuranAudio || repeatEachVerse <= MIN_REPEAT_EACH_VERSE}
                      sx={{ color: '#6f7745' }}
                    >
                      <RemoveIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      aria-label="Tekrar sayısını artır"
                      size="small"
                      onClick={() => setRepeatEachVerse((value) => clampRepeatEachVerse(value + 1))}
                      disabled={isMp3QuranAudio || repeatEachVerse >= MAX_REPEAT_EACH_VERSE}
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
              variant="body2"
              sx={{ mb: 0.75, color: '#4f4a33', fontWeight: 800 }}
            >
              Oynatma hızı: {playbackSpeed}x
            </Typography>
            <Box
              sx={{
                px: 1,
                py: 1.2,
                backgroundColor: '#fff',
                border: '1px solid rgba(142, 118, 63, 0.28)',
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: '40px minmax(0, 1fr) 40px',
                  alignItems: 'center',
                  gap: 1.25,
                }}
              >
                <IconButton
                  aria-label="Oynatma hızını azalt"
                  onClick={() => setPlaybackSpeed((value) => clampPlaybackSpeed(value - 0.25))}
                  disabled={playbackSpeed <= 0.25}
                  sx={{
                    width: 40,
                    height: 40,
                    color: '#4f4a33',
                    backgroundColor: 'rgba(111, 119, 69, 0.14)',
                    '&:hover': { backgroundColor: 'rgba(111, 119, 69, 0.22)' },
                    '&.Mui-disabled': {
                      color: 'rgba(79, 74, 51, 0.32)',
                      backgroundColor: 'rgba(111, 119, 69, 0.08)',
                    },
                  }}
                >
                  <RemoveIcon />
                </IconButton>
                <Slider
                  aria-label="Oynatma hızı"
                  value={playbackSpeed}
                  min={0.25}
                  max={2}
                  step={0.25}
                  onChange={(event, value) => setPlaybackSpeed(clampPlaybackSpeed(value))}
                  sx={{
                    color: '#6f7745',
                    height: 3,
                    p: 0,
                    '& .MuiSlider-rail': {
                      opacity: 1,
                      backgroundColor: 'rgba(79, 74, 51, 0.28)',
                    },
                    '& .MuiSlider-track': {
                      border: 0,
                      backgroundColor: '#6f7745',
                    },
                    '& .MuiSlider-thumb': {
                      width: 16,
                      height: 16,
                      backgroundColor: '#6f7745',
                      boxShadow: 'none',
                      '&:hover, &.Mui-focusVisible': {
                        boxShadow: '0 0 0 6px rgba(111, 119, 69, 0.16)',
                      },
                    },
                  }}
                />
                <IconButton
                  aria-label="Oynatma hızını artır"
                  onClick={() => setPlaybackSpeed((value) => clampPlaybackSpeed(value + 0.25))}
                  disabled={playbackSpeed >= 2}
                  sx={{
                    width: 40,
                    height: 40,
                    color: '#4f4a33',
                    backgroundColor: 'rgba(111, 119, 69, 0.14)',
                    '&:hover': { backgroundColor: 'rgba(111, 119, 69, 0.22)' },
                    '&.Mui-disabled': {
                      color: 'rgba(79, 74, 51, 0.32)',
                      backgroundColor: 'rgba(111, 119, 69, 0.08)',
                    },
                  }}
                >
                  <AddIcon />
                </IconButton>
              </Box>
              <Box
                role="radiogroup"
                aria-label="Oynatma hızı"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(5, minmax(0, 1fr))',
                  gap: 1,
                  mt: 1,
                }}
              >
                {configPlaybackSpeedPresets.map((speed) => {
                  const selected = playbackSpeed === speed;

                  return (
                    <Button
                      key={speed}
                      role="radio"
                      aria-checked={selected}
                      onClick={() => setPlaybackSpeed(speed)}
                      disableElevation
                      variant="contained"
                      sx={{
                        position: 'relative',
                        minWidth: 0,
                        minHeight: 34,
                        px: 0.5,
                        py: 0.5,
                        color: selected ? '#fff8d9' : '#4f4a33',
                        backgroundColor: selected ? '#6f7745' : 'rgba(111, 119, 69, 0.14)',
                        borderRadius: 999,
                        fontSize: '0.78rem',
                        fontWeight: 700,
                        textTransform: 'none',
                        '&:hover': {
                          backgroundColor: selected ? '#5b6438' : 'rgba(111, 119, 69, 0.22)',
                        },
                        '@media (max-width: 420px)': {
                          fontSize: '0.7rem',
                          px: 0.35,
                        },
                      }}
                    >
                      {formatConfigPlaybackSpeedLabel(speed)}
                    </Button>
                  );
                })}
              </Box>
            </Box>
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
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', px: { xs: 1.25, sm: 2 }, pb: 3 }}>
      <Box
        sx={{
          position: 'sticky',
          top: 0,
          zIndex: 2,
          pt: 1,
          pb: 1,
          backgroundColor: '#fffdf4',
          borderBottom: '1px solid rgba(142, 118, 63, 0.18)',
        }}
      >
        <Button
          fullWidth
          startIcon={<KeyboardArrowDownIcon />}
          onClick={() => setMealOpen(false)}
          sx={{
            justifyContent: 'center',
            minHeight: 34,
            mb: 1,
            color: '#fff8d9',
            backgroundColor: '#54613d',
            fontWeight: 800,
            textTransform: 'none',
            '&:hover': {
              backgroundColor: '#465332',
            },
          }}
        >
          Meali Kapat
        </Button>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1,
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 800, lineHeight: 1.15 }}>
            {selectedSurah ? `${selectedSurah.name} Suresi` : 'Türkçe Meal'}
          </Typography>
          <FormControl variant="outlined" sx={{ minWidth: { xs: '100%', sm: 220 } }}>
            <Autocomplete
              size="small"
              autoHighlight
              openOnFocus
              slotProps={compactAutocompleteSlotProps}
              options={dataAuthor}
              value={dataAuthor.find(item => item.id === author) || null}
              getOptionLabel={(option) => option.name || ''}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              onChange={(event, newValue) => onAuthorChange?.(newValue)}
              noOptionsText="Sonuc bulunamadi"
              renderInput={(params) => (
                <TextField {...params} label="Meal" variant="outlined" size="small" sx={compactTextFieldSx} />
              )}
            />
          </FormControl>
        </Box>
      </Box>
      {dataVerse?.audio?.mp3 && (
        <Box sx={{ mb: 1, maxWidth: '100%', overflow: 'hidden' }}>
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
        <Box key={item.id || index} sx={{ mb: 1, textAlign: 'left' }}>
          <Typography variant="body2" sx={{ lineHeight: 1.45 }}>
            <Box component="span" sx={{ fontWeight: 700, mr: 0.75 }}>
              {index === 0 ? 'Besmele' : `${item.verse_number}.`}
            </Box>
            {item.translation.text}
          </Typography>
          {index < mealItems.length - 1 && <Divider sx={{ mt: 1 }} />}
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
          src={audioPlayerSrc}
          width="100%"
          color="#cfcfcf"
          sliderColor="#d7b765"
          backgroundColor="#54613d"
          onEnd={async () => {
            if (isMp3QuranAudio && loopLesson) {
              setAudioDrawerOpen(true);
              setSecilenSound(`surah-${surah}`);
              setActiveVerseId(null);
              setCurrentVerseRepeat(1);
              setAudioReplayKey((prevKey) => prevKey + 1);
              return;
            }

            if (arabicPanelPlaybackVerseId && arabicVerseLoopIds[arabicPanelPlaybackVerseId]) {
              try {
                const replaySound = await loadSelectedAyahAudio(arabicPanelPlaybackVerseId);
                setAudioDrawerOpen(true);
                setSecilenSound(replaySound);
                setActiveVerseId(arabicPanelPlaybackVerseId);
                setAudioReplayKey((prevKey) => prevKey + 1);
              } catch (error) {
                console.error(error);
                toast.error('Ayet sesi yüklenirken bir hata oluştu.');
                setAudioDrawerOpen(false);
                setSecilenSound(null);
                setActiveVerseId(null);
                setArabicPanelPlaybackVerseId(null);
                setArabicPanelLoadingVerseId(null);
                resetLessonSettings();
              }
              return;
            }

            if (!lessonMode) {
              setAudioDrawerOpen(false);
              setSecilenSound(null);
              setActiveVerseId(null);
              setArabicPanelPlaybackVerseId(null);
              setArabicPanelLoadingVerseId(null);
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
              try {
                const nextSound = await loadSelectedAyahAudio(nextVerseId);
                setAudioDrawerOpen(true);
                setSecilenSound(nextSound);
                setActiveVerseId(nextVerseId);
                setCurrentVerseRepeat(1);
                setAudioReplayKey((prevKey) => prevKey + 1);
                scheduleVerseScrollToTop(nextVerseId);
              } catch (error) {
                console.error(error);
                toast.error('Ayet sesi yüklenirken bir hata oluştu.');
                setAudioDrawerOpen(false);
                setSecilenSound(null);
                setActiveVerseId(null);
                resetLessonSettings();
              }
              return;
            }

            if (loopLesson) {
              const firstVerse = verses.find(
                item => item.verse_number >= selectedStartVerse && item.verse_number <= selectedEndVerse,
              );
              if (firstVerse) {
                const firstVerseId = String(firstVerse.id);
                try {
                  const firstSound = await loadSelectedAyahAudio(firstVerseId);
                  setAudioDrawerOpen(true);
                  setSecilenSound(firstSound);
                  setActiveVerseId(firstVerseId);
                  setCurrentVerseRepeat(1);
                  setAudioReplayKey((prevKey) => prevKey + 1);
                  scheduleVerseScrollToTop(firstVerseId);
                } catch (error) {
                  console.error(error);
                  toast.error('Ayet sesi yüklenirken bir hata oluştu.');
                  setAudioDrawerOpen(false);
                  setSecilenSound(null);
                  setActiveVerseId(null);
                  resetLessonSettings();
                }
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

  const loadSelectedAyahAudio = async (verseId) => {
    if (!isQuranFoundationAudio) {
      return getAudioVerseId(verseId);
    }

    const verseNumber = dataVerse?.verses?.find(item => String(item.id) === String(verseId))?.verse_number
      || String(verseId).split('.')[1]
      || verseId;
    const audioUrl = await fetchQuranFoundationAyahAudioUrl(selectedAudio.recitationId, surah, verseNumber);

    if (!audioUrl) {
      throw new Error('Ayet ses dosyası bulunamadı.');
    }

    return audioUrl;
  };

  const startSelectedAyahAudio = async (verseId) => {
    const nextSound = await loadSelectedAyahAudio(verseId);

    setAudioDrawerOpen(true);
    setLessonMode(true);
    setArabicPanelPlaybackVerseId(null);
    setSecilenSound(nextSound);
    setActiveVerseId(String(verseId));
    setCurrentVerseRepeat(1);
    setAudioReplayKey((prevKey) => prevKey + 1);
    scheduleVerseScrollToTop(verseId);
  };

  const handleArabicVerseLoopChange = (verseId, checked) => {
    const verseKey = String(verseId);

    setArabicVerseLoopIds((value) => ({
      ...value,
      [verseKey]: checked,
    }));
  };

  const handleArabicVersePanelPlay = async (verseId) => {
    if (!selectedAudio) {
      toast.error('Lütfen Seslendiren Seçiniz');
      return;
    }

    if (isMp3QuranAudio) {
      handleVerseAudioClick(verseId);
      return;
    }

    const verseKey = String(verseId);
    resetLessonSettings();
    setSecilenSound(null);
    setActiveVerseId(null);
    setArabicPanelPlaybackVerseId(null);
    setArabicPanelLoadingVerseId(verseKey);
    try {
      const nextSound = await loadSelectedAyahAudio(verseId);

      setAudioDrawerOpen(true);
      setLessonMode(false);
      setArabicPanelPlaybackVerseId(verseKey);
      setArabicPanelLoadingVerseId(null);
      setSecilenSound(nextSound);
      setActiveVerseId(verseKey);
      setCurrentVerseRepeat(1);
      setAudioReplayKey((prevKey) => prevKey + 1);
      scheduleVerseScrollToTop(verseId, { includeActions: true });
    } catch (error) {
      console.error(error);
      setArabicPanelLoadingVerseId(null);
      setArabicPanelPlaybackVerseId(null);
      toast.error('Ayet sesi yüklenirken bir hata oluştu.');
    }
  };

  const handleVerseAudioClick = async (verseId) => {
    if (!selectedAudio) {
      toast.error('Lütfen Seslendiren Seçiniz');
      return;
    }

    if (isMp3QuranAudio) {
      if (!mp3QuranSurahAvailable) {
        toast.error('Seçilen seslendiren bu sure için uygun değil.');
        return;
      }

      resetLessonSettings();
      setAudioDrawerOpen(true);
      setLessonMode(false);
      setSecilenSound(`surah-${surah}`);
      setActiveVerseId(null);
      setCurrentVerseRepeat(1);
      setAudioReplayKey((prevKey) => prevKey + 1);
      toast.info('MP3Quran kaynağı sure bazlıdır; seçili surenin tamamı oynatılıyor.');
      return;
    }

    resetLessonSettings();
    try {
      await startSelectedAyahAudio(verseId);
    } catch (error) {
      console.error(error);
      toast.error('Ayet sesi yüklenirken bir hata oluştu.');
    }
  };

  const handleAudioDrawerClose = () => {
    setAudioDrawerOpen(false);
    setSecilenSound(null);
    setActiveVerseId(null);
    setArabicPanelPlaybackVerseId(null);
    setArabicPanelLoadingVerseId(null);
    resetLessonSettings();
  };

  const stopActiveWordAudio = () => {
    if (wordAudioRef.current) {
      wordAudioRef.current.pause();
      wordAudioRef.current.currentTime = 0;
      wordAudioRef.current = null;
    }
    window.speechSynthesis?.cancel();
  };

  const playWordSpeechFallback = (word, token) => {
    if (!window.speechSynthesis) {
      toast.error('Kelime sesi bulunamadı.');
      return;
    }

    const text = formatArabicVerse(word.text).trim();
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    utterance.lang = 'ar-SA';
    utterance.rate = 0.8;
    utterance.voice = voices.find(voice => /^ar\b/i.test(voice.lang)) || null;

    if (wordAudioPlayTokenRef.current === token) {
      window.speechSynthesis.speak(utterance);
    }
  };

  const handleWordClick = (event, word) => {
    event.stopPropagation();
    if (event.currentTarget instanceof HTMLElement) {
      event.currentTarget.blur();
    }
    const nextToken = wordAudioPlayTokenRef.current + 1;
    wordAudioPlayTokenRef.current = nextToken;
    stopActiveWordAudio();

    setSelectedWordPopover({
      anchorEl: event.currentTarget,
      word,
    });

    const audioUrl = normalizeQuranFoundationAudioUrl(word.audioUrl);
    if (!audioUrl) {
      playWordSpeechFallback(word, nextToken);
      return;
    }

    const wordAudio = new Audio(audioUrl);
    wordAudioRef.current = wordAudio;
    wordAudio.addEventListener('ended', () => {
      if (wordAudioPlayTokenRef.current === nextToken) {
        wordAudioRef.current = null;
      }
    }, { once: true });
    wordAudio.addEventListener('error', () => {
      if (wordAudioPlayTokenRef.current !== nextToken) return;
      wordAudioRef.current = null;
      playWordSpeechFallback(word, nextToken);
    }, { once: true });
    wordAudio.play().catch((error) => {
      if (wordAudioPlayTokenRef.current !== nextToken) return;
      console.debug(`Kelime ses dosyası çalınamadı, TTS fallback kullanılıyor: ${error?.message || 'unknown error'}`);
      playWordSpeechFallback(word, nextToken);
    });
  };

  const handleWordPopoverClose = () => {
    setSelectedWordPopover({
      anchorEl: null,
      word: null,
    });
  };

  const renderArabicVerseWords = (verseItem) => {
    const words = verseItem.quranFoundationWords || [];

    if (words.length === 0) {
      return formatArabicVerse(verseItem.verse);
    }

    return words.map((word) => (
          <Box
            key={`${verseItem.id}-${word.position}`}
            component="span"
            role="button"
            tabIndex={0}
            onClick={(event) => handleWordClick(event, word)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleWordClick(event, word);
              }
            }}
            sx={{
              display: 'inline-flex',
              m: 0,
              p: 0,
              border: 0,
              background: 'transparent',
              color: 'inherit',
              font: 'inherit',
              lineHeight: 'inherit',
              direction: 'rtl',
              unicodeBidi: 'isolate',
              alignItems: 'baseline',
              cursor: 'pointer',
              '&:hover': {
                color: '#b3261e',
              },
              '&:focus-visible': {
                outline: 'none',
                backgroundColor: 'rgba(215, 183, 101, 0.18)',
                borderRadius: 0.5,
              },
            }}
          >
            {formatArabicVerse(word.text)}
          </Box>
    ));
  };

  const handleMealShortcutClick = (verseItem) => {
    setVerseMealDialogOpen(true);
    setVerseMealDialogVerse(verseItem);
    setVerseMealTranslations([]);
    setVerseMealDialogLoading(true);

    fetchVerseTranslationsByAuthors(surah, verseItem.verse_number, dataAuthor)
      .then((translations) => {
        setVerseMealTranslations(translations);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Ayet mealleri yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setVerseMealDialogLoading(false);
      });
  };

  const handleVerseMealDialogClose = () => {
    setVerseMealDialogOpen(false);
  };

  const handleTafsirShortcutClick = (verseItem) => {
    setVerseTafsirDialogOpen(true);
    setVerseTafsirDialogVerse(verseItem);
    setVerseTafsirs([]);
    setVerseTafsirDialogLoading(true);

    fetchVerseTafsirs(surah, verseItem.verse_number)
      .then((tafsirs) => {
        setVerseTafsirs(tafsirs);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Ayet tefsirleri yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setVerseTafsirDialogLoading(false);
      });
  };

  const handleVerseTafsirDialogClose = () => {
    setVerseTafsirDialogOpen(false);
  };

  const getReadingPages = () => {
    const pageMap = new Map();

    (dataVerse?.verses || []).forEach((verseItem) => {
      const words = verseItem.quranFoundationWords || [];

      if (words.length === 0) {
        const pageNumber = verseItem.page_number || 0;
        const lineNumber = verseItem.verse_number;
        if (!pageMap.has(pageNumber)) pageMap.set(pageNumber, new Map());
        const lineMap = pageMap.get(pageNumber);
        if (!lineMap.has(lineNumber)) lineMap.set(lineNumber, []);
        lineMap.get(lineNumber).push({
          type: 'fallbackVerse',
          id: `${verseItem.id}-fallback`,
          text: formatArabicVerse(verseItem.verse),
          verseNumber: verseItem.verse_number,
        });
        return;
      }

      words.forEach((word, index) => {
        const pageNumber = word.pageNumber || verseItem.page_number || 0;
        const lineNumber = word.lineNumber || verseItem.verse_number;
        if (!pageMap.has(pageNumber)) pageMap.set(pageNumber, new Map());
        const lineMap = pageMap.get(pageNumber);
        if (!lineMap.has(lineNumber)) lineMap.set(lineNumber, []);
        lineMap.get(lineNumber).push({
          type: 'word',
          id: `${verseItem.id}-${word.position || index}`,
          text: formatArabicVerse(word.uthmaniText || word.text),
          verseNumber: verseItem.verse_number,
          isVerseEnd: index === words.length - 1,
        });
      });
    });

    return [...pageMap.entries()]
      .sort(([pageA], [pageB]) => pageA - pageB)
      .map(([pageNumber, lineMap]) => ({
        pageNumber,
        lines: [...lineMap.entries()]
          .sort(([lineA], [lineB]) => lineA - lineB)
          .map(([lineNumber, tokens]) => ({ lineNumber, tokens })),
      }));
  };

  const renderReadingArabicPages = () => {
    const pages = getReadingPages();

    return (
      <Box sx={{ display: 'grid', gap: 2.5, pb: dataVerse.audio !== undefined ? 7 : 0 }}>
        {zeroVerseText && (
          <Box sx={{ textAlign: 'center', color: '#211b14' }}>
            <Typography
              sx={{
                fontFamily: 'var(--font-mushaf), Traditional Arabic, serif',
                fontSize: { xs: '2rem', sm: '2.8rem' },
                lineHeight: 1.5,
              }}
            >
              {zeroVerseText}
            </Typography>
            {dataVerse.zero?.transcription && (
              <Typography sx={{ color: '#4f4a33', fontWeight: 600 }}>
                {dataVerse.zero.transcription}
              </Typography>
            )}
          </Box>
        )}

        {pages.map((page) => (
          <Paper
            key={page.pageNumber}
            elevation={0}
            sx={{
              maxWidth: 1120,
              mx: 'auto',
              width: '100%',
              p: { xs: 2, sm: 3 },
              borderRadius: 1,
              backgroundColor: 'rgba(255, 253, 244, 0.92)',
              border: '1px solid rgba(142, 118, 63, 0.18)',
              boxShadow: '0 8px 24px rgba(47, 56, 35, 0.08)',
            }}
          >
            {page.pageNumber > 0 && (
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                  mb: 1.25,
                  textAlign: 'center',
                  color: '#8e763f',
                  fontWeight: 800,
                }}
              >
                Sayfa {page.pageNumber}
              </Typography>
            )}
            <Box
              sx={{
                display: 'grid',
                gap: { xs: 0.4, sm: 0.65 },
                direction: 'rtl',
                unicodeBidi: 'isolate',
                fontFamily: 'var(--font-mushaf), Traditional Arabic, serif',
                color: '#111',
                fontSize: { xs: '2rem', sm: '2.75rem', md: '3.05rem' },
                lineHeight: 1.85,
              }}
            >
              {page.lines.map((line) => (
                <Box
                  key={`${page.pageNumber}-${line.lineNumber}`}
                  sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    justifyContent: 'center',
                    alignItems: 'baseline',
                    columnGap: '0.22em',
                    rowGap: '0.06em',
                    direction: 'rtl',
                    unicodeBidi: 'isolate',
                  }}
                >
                  {line.tokens.map((token) => (
                    <Fragment key={token.id}>
                      <Box component="span" sx={{ display: 'inline-flex', direction: 'rtl', unicodeBidi: 'isolate' }}>
                        {token.text}
                      </Box>
                      {token.isVerseEnd && <VerseEndMark>{toArabicNumber(token.verseNumber)}</VerseEndMark>}
                      {token.type === 'fallbackVerse' && <VerseEndMark>{toArabicNumber(token.verseNumber)}</VerseEndMark>}
                    </Fragment>
                  ))}
                </Box>
              ))}
            </Box>
          </Paper>
        ))}
      </Box>
    );
  };

  const renderReadingMeal = () => (
    <Paper
      elevation={0}
      sx={{
        maxWidth: 1120,
        mx: 'auto',
        width: '100%',
        p: { xs: 1.5, sm: 2.5 },
        borderRadius: 1,
        backgroundColor: 'rgba(255, 253, 244, 0.92)',
        border: '1px solid rgba(142, 118, 63, 0.18)',
        boxShadow: '0 8px 24px rgba(47, 56, 35, 0.08)',
        pb: dataVerse.audio !== undefined ? 7 : 2.5,
        textAlign: 'left',
      }}
    >
      {(dataVerse?.verses || []).map((item, index) => (
        <Typography
          key={item.id}
          id={`verse-${item.id}`}
          component="span"
          sx={{
            display: 'inline',
            color: '#211b14',
            fontWeight: 500,
            fontSize: { xs: '1.15rem', sm: '1.42rem' },
            lineHeight: 1.85,
          }}
        >
          <Box component="span" sx={{ fontWeight: 900 }}>
            {item.verse_number}.
          </Box>
          {` ${item.translation?.text || ''}${index < (dataVerse?.verses?.length || 0) - 1 ? ' ' : ''}`}
        </Typography>
      ))}
    </Paper>
  );

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
        {readingMode ? (
          readingView === 'meal' ? renderReadingMeal() : renderReadingArabicPages()
        ) : (
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

          {dataVerse?.verses?.map(item => {
            const itemVerseKey = String(item.id);
            const isSurahAudioButton = isMp3QuranAudio && item.verse_number === 1;
            const isDisabledSurahAudioButton = isMp3QuranAudio && item.verse_number !== 1;
            const isArabicPanelButtonBusy = (
              arabicPanelLoadingVerseId === itemVerseKey
              || arabicPanelPlaybackVerseId === itemVerseKey
            );

            return (
            <Fragment key={item.id}>
              {gorunum && <Divider sx={{ my: 0.5 }} />}
              {!gorunum && (
                <Divider>
                <Button
                  variant="contained"
                  endIcon={<SendIcon />}
                  value={item.id}
                  disabled={isDisabledSurahAudioButton}
                  sx={{
                    backgroundColor: '#6f7745',
                    color: '#fff8d9',
                    boxShadow: '0 2px 6px rgba(47, 56, 35, 0.24)',
                    '&:hover': {
                      backgroundColor: '#5b6438',
                    },
                    '&.Mui-disabled': {
                      backgroundColor: 'rgba(111, 119, 69, 0.28)',
                      color: 'rgba(79, 74, 51, 0.5)',
                      boxShadow: 'none',
                    },
                  }}
                  onClick={(e) => {
                    if (!selectedAudio) {
                      toast.error('Lütfen Seslendiren Seçiniz');
                      return;
                    }
                    handleVerseAudioClick(e.currentTarget.value);
                  }}
                >
                  {isSurahAudioButton ? 'Surenin Tamamı' : `${item.verse_number}. ayet`}
                </Button>
                </Divider>
              )}
              {!gorunum && (
                <Box
                  id={`verse-actions-${item.id}`}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    gap: 0.25,
                    mt: -1.8,
                    mb: -0.2,
                    pl: 0,
                  }}
                >
                  <IconButton
                    aria-label={`${item.verse_number}. ayeti oynat`}
                    size="small"
                    onClick={() => handleArabicVersePanelPlay(item.id)}
                    disabled={isDisabledSurahAudioButton || isArabicPanelButtonBusy}
                    sx={{
                      color: '#8b8f8a',
                      p: 0.15,
                      '&:hover': {
                        color: '#6f7745',
                        backgroundColor: 'rgba(111, 119, 69, 0.08)',
                      },
                      '&.Mui-disabled': {
                        color: 'rgba(139, 143, 138, 0.42)',
                      },
                    }}
                  >
                    {isArabicPanelButtonBusy ? (
                      <CircularProgress size={20} thickness={5} sx={{ color: '#6f7745' }} />
                    ) : (
                      <PlayArrowIcon sx={{ fontSize: { xs: 26, sm: 28 } }} />
                    )}
                  </IconButton>
                  <FormControlLabel
                    label="Tekrar"
                    labelPlacement="end"
                    control={(
                      <Switch
                        size="small"
                        checked={Boolean(arabicVerseLoopIds[itemVerseKey])}
                        onChange={(event) => handleArabicVerseLoopChange(item.id, event.target.checked)}
                        disabled={isDisabledSurahAudioButton}
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
                    sx={{
                      m: 0,
                      color: '#8b8f8a',
                      '& .MuiFormControlLabel-label': {
                        fontSize: { xs: '0.78rem', sm: '0.9rem' },
                        fontWeight: 800,
                        lineHeight: 1,
                        whiteSpace: 'nowrap',
                      },
                    }}
                  />
                  <Divider orientation="vertical" flexItem sx={{ my: 0.15, borderColor: 'rgba(139, 143, 138, 0.24)' }} />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<MenuBookIcon sx={{ fontSize: { xs: 26, sm: 28 } }} />}
                    onClick={() => handleMealShortcutClick(item)}
                    sx={{
                      minHeight: 22,
                      px: 0.15,
                      py: 0,
                      color: '#8b8f8a',
                      fontWeight: 700,
                      fontSize: { xs: '0.82rem', sm: '0.95rem' },
                      lineHeight: 1,
                      textTransform: 'none',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        color: '#6f7745',
                        backgroundColor: 'rgba(111, 119, 69, 0.08)',
                      },
                      '& .MuiButton-startIcon': {
                        mr: 0.35,
                      },
                    }}
                  >
                    Meal
                  </Button>
                  <Divider orientation="vertical" flexItem sx={{ my: 0.15, borderColor: 'rgba(139, 143, 138, 0.24)' }} />
                  <Button
                    variant="text"
                    size="small"
                    startIcon={<AutoStoriesIcon sx={{ fontSize: { xs: 26, sm: 28 } }} />}
                    onClick={() => handleTafsirShortcutClick(item)}
                    sx={{
                      minHeight: 22,
                      px: 0.15,
                      py: 0,
                      color: '#8b8f8a',
                      fontWeight: 700,
                      fontSize: { xs: '0.82rem', sm: '0.95rem' },
                      lineHeight: 1,
                      textTransform: 'none',
                      backgroundColor: 'transparent',
                      '&:hover': {
                        color: '#6f7745',
                        backgroundColor: 'rgba(111, 119, 69, 0.08)',
                      },
                      '& .MuiButton-startIcon': {
                        mr: 0.35,
                      },
                    }}
                  >
                    Tefsir
                  </Button>
                </Box>
              )}
              {!gorunum && (
                <ArabicVerse
                  id={`verse-${item.id}`}
                  value={item.id}
                  sx={{
                    position: 'relative',
                    transition: 'background-color 180ms ease, box-shadow 180ms ease, outline-color 180ms ease',
                    ...(isActiveVerse(item.id) && {
                      backgroundColor: '#ffeaa3',
                      outline: '4px solid #d7b765',
                      boxShadow: '0 0 0 8px rgba(215, 183, 101, 0.26), 0 10px 28px rgba(47, 56, 35, 0.24)',
                    }),
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      direction: 'rtl',
                      unicodeBidi: 'isolate',
                      justifyContent: 'flex-start',
                      alignItems: 'baseline',
                      columnGap: '0.22em',
                      rowGap: '0.08em',
                    }}
                  >
                    {renderArabicVerseWords(item)}
                    <VerseEndMark>{toArabicNumber(item.verse_number)}</VerseEndMark>
                  </Box>
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
                    disabled={isDisabledSurahAudioButton}
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
                      '&.Mui-disabled': {
                        backgroundColor: 'rgba(111, 119, 69, 0.28)',
                        color: 'rgba(79, 74, 51, 0.5)',
                        boxShadow: 'none',
                      },
                    }}
                    onClick={(e) => handleVerseAudioClick(e.currentTarget.value)}
                  >
                    {isSurahAudioButton ? 'Surenin Tamamı' : `${item.verse_number}.`}
                  </Button>
                )}
                {item.transcription}
              </div>
            </Fragment>
            );
          })}

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
        )}
      </div>

      <Popper
        open={Boolean(selectedWordPopover.anchorEl)}
        anchorEl={selectedWordPopover.anchorEl}
        placement="top"
        modifiers={[
          {
            name: 'offset',
            options: {
              offset: [0, 8],
            },
          },
        ]}
        sx={{
          zIndex: 1800,
          pointerEvents: 'none',
        }}
      >
        <Box
          sx={{
            maxWidth: 260,
            p: 1.5,
            borderRadius: 1,
            backgroundColor: '#fffdf4',
            color: '#211b14',
            boxShadow: '0 8px 22px rgba(47, 56, 35, 0.22)',
          }}
        >
        <Box sx={{ display: 'grid', gap: 0.6, textAlign: 'left' }}>
          <Typography
            sx={{
              direction: 'rtl',
              textAlign: 'right',
              color: '#6f5a22',
              fontFamily: 'var(--font-mushaf), Traditional Arabic, serif',
              fontSize: '1.7rem',
              lineHeight: 1.4,
            }}
          >
            {formatArabicVerse(selectedWordPopover.word?.text).trim()}
          </Typography>
          {selectedWordPopover.word?.translation && (
            <Typography sx={{ fontWeight: 800, color: '#6f7745' }}>
              {selectedWordPopover.word.translation}
            </Typography>
          )}
          {selectedWordPopover.word?.transliteration && (
            <Typography variant="body2" sx={{ color: '#6f5a22' }}>
              {selectedWordPopover.word.transliteration}
            </Typography>
          )}
        </Box>
        </Box>
      </Popper>

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

      <Dialog
        open={verseMealDialogOpen}
        onClose={handleVerseMealDialogClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        disableScrollLock
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
          {selectedSurah && verseMealDialogVerse
            ? `${selectedSurah.name} Suresi ${verseMealDialogVerse.verse_number}. Ayet Mealleri`
            : 'Ayet Mealleri'}
          <IconButton
            aria-label="Mealleri kapat"
            onClick={handleVerseMealDialogClose}
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
          {verseMealDialogLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#6f7745' }} />
            </Box>
          )}
          {!verseMealDialogLoading && verseMealTranslations.length === 0 && (
            <Typography>Meal bulunamadı.</Typography>
          )}
          {!verseMealDialogLoading && verseMealTranslations.map((item, index) => (
            <Box key={item.authorId} sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: '#6f7745', fontWeight: 900, mb: 0.5 }}>
                {item.authorName}
              </Typography>
              <Typography variant="body1">
                {item.text}
              </Typography>
              {index < verseMealTranslations.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      <Dialog
        open={verseTafsirDialogOpen}
        onClose={handleVerseTafsirDialogClose}
        fullWidth
        maxWidth="md"
        scroll="paper"
        disableScrollLock
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
          {selectedSurah && verseTafsirDialogVerse
            ? `${selectedSurah.name} Suresi ${verseTafsirDialogVerse.verse_number}. Ayet Tefsirleri`
            : 'Ayet Tefsirleri'}
          <IconButton
            aria-label="Tefsirleri kapat"
            onClick={handleVerseTafsirDialogClose}
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
          {verseTafsirDialogLoading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#6f7745' }} />
            </Box>
          )}
          {!verseTafsirDialogLoading && verseTafsirs.length === 0 && (
            <Typography>Tefsir bulunamadı.</Typography>
          )}
          {!verseTafsirDialogLoading && verseTafsirs.map((item, index) => (
            <Box key={item.slug} sx={{ mb: 2, textAlign: 'left' }}>
              <Typography variant="subtitle2" sx={{ color: '#6f7745', fontWeight: 900, mb: 0.5 }}>
                {item.name}
              </Typography>
              <Typography variant="body1">
                {item.text}
              </Typography>
              {index < verseTafsirs.length - 1 && <Divider sx={{ mt: 2 }} />}
            </Box>
          ))}
        </DialogContent>
      </Dialog>

      <Drawer anchor="bottom" open={mealOpen} onClose={() => setMealOpen(false)}>
        {mealDrawerContent}
      </Drawer>
    </>
  );
};

export default VerseComponent;
