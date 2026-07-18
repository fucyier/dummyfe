import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import LinearProgress from '@mui/material/LinearProgress';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { toast } from 'react-toastify';
import { fetchQuranFoundationAyahAudioUrl } from './api';

const removeQuranAnnotations = (text) => (
  Array.from(text).filter((character) => {
    const codePoint = character.codePointAt(0);
    return !(
      (codePoint >= 0x0610 && codePoint <= 0x061a)
      || codePoint === 0x06d4
      || (codePoint >= 0x06d6 && codePoint <= 0x06ed)
      || codePoint === 0x25cc
    );
  }).join('')
);

const formatArabicVerse = (text) => (
  removeQuranAnnotations(String(text || '')
    .replaceAll('\u06ea', '\u0650')
    .replaceAll('\u0656', '\u0650')
    .replace(/\u06d4[\u064b-\u0652]?/g, ''))
    .trim()
);

const getAyahAudioUrl = async (audio, surahId, verse) => {
  if (!audio || audio.audioType !== 'ayah') return '';

  if (audio.source === 'quranfoundation') {
    return fetchQuranFoundationAyahAudioUrl(audio.recitationId, surahId, verse.verse_number);
  }

  if (audio.identifier && verse.id) {
    return `https://cdn.islamic.network/quran/audio/128/${audio.identifier}/${verse.id}.mp3`;
  }

  return '';
};

const AyetKartlariComponent = ({
  open,
  onClose,
  surah,
  surahName,
  dataVerse,
  audioOptions,
  audio,
  onAudioChange,
  authorName,
}) => {
  const verses = dataVerse?.verses || [];
  const [verseIndex, setVerseIndex] = useState(0);
  const [loadingAudio, setLoadingAudio] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedAudio, setSelectedAudio] = useState(audio);
  const audioRef = useRef(null);
  const contentScrollRef = useRef(null);
  const audioRequestIdRef = useRef(0);
  const sequenceActiveRef = useRef(false);
  const pendingAutoPlayRef = useRef(false);
  const activeVerse = verses[verseIndex] || null;
  const activeVerseRef = useRef(activeVerse);
  const selectedAudioRef = useRef(selectedAudio);
  const openRef = useRef(open);
  activeVerseRef.current = activeVerse;
  selectedAudioRef.current = selectedAudio;
  openRef.current = open;

  const arabicText = useMemo(
    () => formatArabicVerse(activeVerse?.verse),
    [activeVerse],
  );

  const updateSequenceActive = useCallback((active) => {
    sequenceActiveRef.current = active;
  }, []);

  const stopAudio = useCallback((resetSequence = true) => {
    audioRequestIdRef.current += 1;
    const player = audioRef.current;
    if (player) {
      player.pause();
      player.currentTime = 0;
      player.removeAttribute('src');
      player.load();
    }
    setPlaying(false);
    setLoadingAudio(false);
    setProgress(0);
    if (resetSequence) updateSequenceActive(false);
  }, [updateSequenceActive]);

  useEffect(() => {
    if (open) setVerseIndex(0);
    return () => stopAudio();
  }, [open, surah, stopAudio]);

  const handleClose = () => {
    stopAudio();
    if (selectedAudio?.id !== audio?.id) onAudioChange(selectedAudio);
    onClose();
  };

  const handleVerseChange = (nextIndex) => {
    pendingAutoPlayRef.current = sequenceActiveRef.current;
    setVerseIndex(Math.min(Math.max(nextIndex, 0), Math.max(verses.length - 1, 0)));
  };

  const playVerse = useCallback(async (verse, selectedAudio) => {
    if (!verse || !selectedAudio) {
      toast.error('Lütfen ayet bazlı bir seslendiren seçiniz.');
      updateSequenceActive(false);
      return false;
    }

    const player = audioRef.current;
    const requestId = audioRequestIdRef.current + 1;
    audioRequestIdRef.current = requestId;
    setLoadingAudio(true);
    try {
      const audioUrl = await getAyahAudioUrl(selectedAudio, surah, verse);
      if (requestId !== audioRequestIdRef.current) return false;
      if (!audioUrl || !player) throw new Error('Ayet sesi bulunamadı.');
      player.src = audioUrl;
      player.playbackRate = 1;
      await player.play();
      setPlaying(true);
      return true;
    } catch (error) {
      if (requestId !== audioRequestIdRef.current) return false;
      console.error(error);
      toast.error('Ayet sesi başlatılamadı.');
      setPlaying(false);
      updateSequenceActive(false);
      return false;
    } finally {
      if (requestId === audioRequestIdRef.current) setLoadingAudio(false);
    }
  }, [surah, updateSequenceActive]);

  useEffect(() => {
    if (contentScrollRef.current) contentScrollRef.current.scrollTop = 0;
    stopAudio(false);
    if (!pendingAutoPlayRef.current || !activeVerseRef.current || !openRef.current) return undefined;

    pendingAutoPlayRef.current = false;
    const timer = window.setTimeout(() => {
      playVerse(activeVerseRef.current, selectedAudioRef.current);
    }, 0);

    return () => window.clearTimeout(timer);
  }, [verseIndex, playVerse, stopAudio]);

  const handlePlay = async () => {
    const player = audioRef.current;
    if (playing && player) {
      player.pause();
      updateSequenceActive(false);
      setPlaying(false);
      return;
    }

    if (!activeVerse || !selectedAudio) {
      toast.error('Lütfen ayet bazlı bir seslendiren seçiniz.');
      return;
    }

    updateSequenceActive(true);
    if (player?.getAttribute('src')) {
      try {
        await player.play();
        setPlaying(true);
      } catch (error) {
        console.error(error);
        updateSequenceActive(false);
        toast.error('Ayet sesi başlatılamadı.');
      }
      return;
    }

    await playVerse(activeVerse, selectedAudio);
  };

  const handleAudioChange = (value) => {
    if (!playing) stopAudio();
    selectedAudioRef.current = value;
    setSelectedAudio(value);
  };

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      PaperProps={{
        sx: {
          backgroundColor: '#f7f0d6',
          backgroundImage: `
            linear-gradient(rgba(255, 250, 231, 0.94), rgba(255, 250, 231, 0.94)),
            url('/images/islamic-pattern.png')
          `,
          backgroundSize: 'auto, 620px auto',
        },
      }}
    >
      <Box
        component="header"
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'auto 1fr auto', md: '1fr auto 1fr' },
          alignItems: 'center',
          gap: 1,
          px: { xs: 1, sm: 2.5 },
          py: 1,
          backgroundColor: 'rgba(255, 253, 244, 0.94)',
          borderBottom: '1px solid rgba(111, 90, 34, 0.22)',
          boxShadow: '0 3px 14px rgba(47, 49, 45, 0.08)',
        }}
      >
        <IconButton aria-label="Ayet kartlarını kapat" onClick={handleClose} sx={{ justifySelf: 'start', color: '#6f5a22' }}>
          <CloseIcon />
        </IconButton>
        <Box sx={{ textAlign: 'center', minWidth: 0 }}>
          <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: { xs: '1rem', sm: '1.2rem' } }}>
            {surahName || 'Sure'} Suresi
          </Typography>
          <Typography variant="caption" sx={{ color: '#73775c', fontWeight: 700 }}>
            Ayet Kartları
          </Typography>
        </Box>
        <Autocomplete
          size="small"
          disableClearable
          options={audioOptions}
          value={selectedAudio || null}
          onChange={(event, value) => handleAudioChange(value)}
          getOptionLabel={(option) => option?.englishName || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{
            display: { xs: 'none', md: 'block' },
            width: 290,
            justifySelf: 'end',
            '& .MuiOutlinedInput-root': { backgroundColor: '#fffdf4', borderRadius: 999 },
          }}
          renderInput={(params) => <TextField {...params} label="Ayet Seslendireni" />}
        />
      </Box>

      <Box sx={{ display: { xs: 'block', md: 'none' }, px: 1.25, pt: 1.25 }}>
        <Autocomplete
          size="small"
          disableClearable
          options={audioOptions}
          value={selectedAudio || null}
          onChange={(event, value) => handleAudioChange(value)}
          getOptionLabel={(option) => option?.englishName || ''}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          sx={{ '& .MuiOutlinedInput-root': { backgroundColor: '#fffdf4', borderRadius: 999 } }}
          renderInput={(params) => <TextField {...params} label="Ayet Seslendireni" />}
        />
      </Box>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'grid',
          gridTemplateRows: 'auto minmax(0, 1fr) auto',
          px: { xs: 1.25, sm: 3, md: 5 },
          py: { xs: 1.25, sm: 2 },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 1, color: '#342e24' }}>
          <Autocomplete
            size="small"
            disableClearable
            autoHighlight
            options={verses}
            value={activeVerse}
            onChange={(event, value) => {
              const nextIndex = verses.findIndex((verse) => verse.id === value?.id);
              if (nextIndex >= 0) handleVerseChange(nextIndex);
            }}
            getOptionLabel={(option) => `${option?.verse_number || ''}. Ayet`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            slotProps={{
              listbox: { sx: { maxHeight: 300 } },
              paper: { sx: { mt: 0.5 } },
            }}
            sx={{
              width: { xs: 132, sm: 160 },
              '& .MuiOutlinedInput-root': {
                backgroundColor: '#fffdf4',
                borderRadius: 999,
              },
              '& .MuiInputBase-input': {
                fontWeight: 800,
              },
            }}
            renderInput={(params) => <TextField {...params} label="Ayet Seçiniz" />}
          />
          <Typography variant="body2" sx={{ color: '#6f7745', fontWeight: 800 }}>
            {verseIndex + 1} / {verses.length}
          </Typography>
        </Box>

        <Paper
          ref={contentScrollRef}
          elevation={4}
          sx={{
            alignSelf: 'stretch',
            minHeight: 0,
            my: 1.25,
            px: { xs: 2, sm: 5, md: 8 },
            py: { xs: 2.5, sm: 4 },
            display: 'block',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            borderRadius: 1,
            backgroundColor: '#fff8dc',
            border: '1px solid rgba(142, 118, 63, 0.3)',
            boxShadow: '0 12px 36px rgba(47, 49, 45, 0.14)',
          }}
        >
          <Box
            sx={{
              minHeight: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'stretch',
              justifyContent: 'center',
            }}
          >
          <Typography
            component="div"
            lang="ar"
            dir="rtl"
            sx={{
              textAlign: 'center',
              fontFamily: 'KFGQPC Uthman Taha Naskh, KFGQPC HAFS, Traditional Arabic, serif',
              fontSize: 'clamp(2.35rem, 5vw, 5rem)',
              lineHeight: 1.9,
              color: '#17130f',
            }}
          >
            {arabicText}
            <Box
              component="span"
              aria-label={`${activeVerse?.verse_number || ''}. ayet`}
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '1.25em',
                height: '1.25em',
                mr: 0.3,
                verticalAlign: 'middle',
                border: '0.055em double #8e763f',
                borderRadius: '50%',
                color: '#6f5a22',
                fontFamily: 'Traditional Arabic, serif',
                fontSize: '0.42em',
                lineHeight: 1,
              }}
            >
              {activeVerse?.verse_number}
            </Box>
          </Typography>

          <Divider sx={{ width: 'min(760px, 90%)', mx: 'auto', my: { xs: 2, sm: 3 }, borderColor: 'rgba(142, 118, 63, 0.25)' }} />

          <Typography
            sx={{
              maxWidth: 1100,
              mx: 'auto',
              textAlign: 'center',
              color: '#25231f',
              fontSize: 'clamp(0.95rem, 1.65vw, 1.55rem)',
              lineHeight: 1.55,
              fontWeight: 400,
            }}
          >
            {activeVerse?.translation?.text || 'Bu ayet için meal seçilmedi.'}
          </Typography>
          {authorName && (
            <Typography variant="caption" sx={{ mt: 1.25, textAlign: 'center', color: '#7b704f', fontWeight: 700 }}>
              {authorName} meali
            </Typography>
          )}
          </Box>
        </Paper>

        <Box>
          {(loadingAudio || progress > 0) && (
            <LinearProgress
              variant={loadingAudio ? 'indeterminate' : 'determinate'}
              value={progress}
              sx={{ mb: 1, height: 3, backgroundColor: 'rgba(111,119,69,0.15)', '& .MuiLinearProgress-bar': { backgroundColor: '#6f7745' } }}
            />
          )}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'auto 1fr auto',
              alignItems: 'center',
              gap: 1,
              px: { xs: 0.5, sm: 1.5 },
              minHeight: { xs: 72, sm: 88 },
              py: { xs: 1.25, sm: 1.7 },
              color: '#fff',
              background: 'linear-gradient(180deg, #373733, #20211f)',
              borderRadius: 1,
            }}
          >
            <Button
              startIcon={<NavigateBeforeIcon />}
              disabled={verseIndex === 0}
              onClick={() => handleVerseChange(verseIndex - 1)}
              sx={{ minWidth: 0, color: '#fff', textTransform: 'none' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Önceki</Box>
            </Button>
            <Box
              sx={{
                minWidth: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
                textAlign: 'center',
                maxHeight: { xs: '30vh', sm: '26vh' },
                py: 0.25,
                overflowY: 'auto',
                overscrollBehavior: 'contain',
              }}
            >
              <IconButton
                aria-label={playing ? 'Ayet sesini duraklat' : 'Ayeti dinle'}
                onClick={handlePlay}
                disabled={loadingAudio}
                sx={{
                  width: { xs: 46, sm: 54 },
                  height: { xs: 46, sm: 54 },
                  color: '#fff8d9',
                  border: '1px solid rgba(255,248,217,0.4)',
                  flex: '0 0 auto',
                }}
              >
                {loadingAudio ? <CircularProgress size={24} sx={{ color: '#fff8d9' }} /> : playing ? <PauseIcon /> : <PlayArrowIcon />}
              </IconButton>
              <Typography
                component="span"
                sx={{
                  display: 'block',
                  minWidth: 0,
                  overflowWrap: 'anywhere',
                  fontSize: { xs: '0.9rem', sm: '1.15rem' },
                  lineHeight: 1.45,
                  whiteSpace: 'normal',
                }}
              >
                {activeVerse?.transcription || `${activeVerse?.verse_number || ''}. ayet`}
              </Typography>
            </Box>
            <Button
              endIcon={<NavigateNextIcon />}
              disabled={verseIndex >= verses.length - 1}
              onClick={() => handleVerseChange(verseIndex + 1)}
              sx={{ minWidth: 0, color: '#fff', textTransform: 'none' }}
            >
              <Box component="span" sx={{ display: { xs: 'none', sm: 'inline' } }}>Sonraki</Box>
            </Button>
          </Box>
        </Box>
      </Box>

      <audio
        ref={audioRef}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => {
          setPlaying(false);
          setProgress(0);
          if (sequenceActiveRef.current && verseIndex < verses.length - 1) {
            pendingAutoPlayRef.current = true;
            setVerseIndex((currentIndex) => currentIndex + 1);
            return;
          }
          updateSequenceActive(false);
        }}
        onTimeUpdate={(event) => {
          const player = event.currentTarget;
          setProgress(player.duration ? (player.currentTime / player.duration) * 100 : 0);
        }}
      />
    </Dialog>
  );
};

export default AyetKartlariComponent;
