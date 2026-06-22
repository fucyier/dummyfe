import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { AudioPlayer } from 'react-audio-play';
import { AppBar, Button, Fab, FormControl, InputLabel, MenuItem, Select } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
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
  fontSize: 'clamp(2rem, 4vw, 3.6rem)',
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

const getAudioVerseId = (verseId) => String(verseId ?? '').split('.')[0];

const VerseComponent = ({ surah, author, audio, gorunum, dataVerse, dataSurah = [], onSurahNavigate }) => {
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [secilenSound, setSecilenSound] = useState(null);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeVerseId, setActiveVerseId] = useState(null);

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

  const mealItems = [
    dataVerse.zero,
    ...(dataVerse?.verses || []),
  ].filter(item => item?.translation?.text);
  const verseCount = dataVerse?.verse_count || dataVerse?.verses?.length || 0;
  const zeroVerseText = formatArabicVerse(dataVerse.zero?.verse).trim();
  const hasZeroVerse = Boolean(zeroVerseText || dataVerse.zero?.transcription);
  const currentSurahIndex = dataSurah.findIndex(item => item.id === surah);
  const previousSurah = currentSurahIndex > 0 ? dataSurah[currentSurahIndex - 1] : null;
  const nextSurah = currentSurahIndex >= 0 && currentSurahIndex < dataSurah.length - 1
    ? dataSurah[currentSurahIndex + 1]
    : null;

  const mealDrawerContent = (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 2, pb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Türkçe Meal
      </Typography>
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
          <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 0.5 }}>
            {index === 0 ? 'Besmele' : `${item.verse_number}. ayet`}
          </Typography>
          <Typography variant="body1">{item.translation.text}</Typography>
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
          className="quran-audio-player"
          autoPlay
          src={`https://cdn.islamic.network/quran/audio/128/${audio}/${secilenSound}.mp3`}
          width="100%"
          color="#cfcfcf"
          sliderColor="#d7b765"
          backgroundColor="#54613d"
          onEnd={() => {
            const verses = dataVerse?.verses || [];
            const currentIndex = verses.findIndex(item => String(item.id) === activeVerseId);
            const nextVerse = verses[currentIndex + 1];

            if (nextVerse) {
              const nextVerseId = String(nextVerse.id);
              setAudioDrawerOpen(true);
              setSecilenSound(getAudioVerseId(nextVerseId));
              setActiveVerseId(nextVerseId);
              setTimeout(() => {
                const verseElement = document.getElementById(`verse-${nextVerseId}`);
                if (!verseElement) return;
                const headerOffset = 116;
                const top = verseElement.getBoundingClientRect().top + window.scrollY - headerOffset;
                window.scrollTo({ top, behavior: 'smooth' });
              }, 50);
              return;
            }

            setAudioDrawerOpen(false);
            setSecilenSound(null);
            setActiveVerseId(null);
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
    setAudioDrawerOpen(true);
    setSecilenSound(getAudioVerseId(verseId));
    setActiveVerseId(String(verseId));
    setTimeout(() => {
      const verseElement = document.getElementById(`verse-${verseId}`);
      if (!verseElement) return;
      const headerOffset = 116;
      const top = verseElement.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });
    }, 50);
  };

  const handleAudioDrawerClose = () => {
    setAudioDrawerOpen(false);
    setSecilenSound(null);
    setActiveVerseId(null);
  };

  const isActiveVerse = (verseId) => audioDrawerOpen && activeVerseId === String(verseId);

  return (
    <>
      <div>
        {dataVerse.length != 0 && (
          <Box
            sx={{
              mx: 'auto',
              mt: 2,
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
                variant="text"
                startIcon={<ChevronLeftIcon />}
                onClick={() => onSurahNavigate?.(previousSurah)}
                sx={{
                  maxWidth: '100%',
                  minWidth: 0,
                  px: { xs: 0.75, sm: 1.25 },
                  py: 0.5,
                  color: '#6f5a22',
                  fontWeight: 800,
                  fontSize: { xs: '0.72rem', sm: '0.88rem' },
                  lineHeight: 1.15,
                  textTransform: 'none',
                  whiteSpace: 'normal',
                  textAlign: 'left',
                  backgroundColor: 'rgba(255, 248, 217, 0.58)',
                  '&:hover': {
                    backgroundColor: 'rgba(215, 183, 101, 0.22)',
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
                variant="text"
                endIcon={<ChevronRightIcon />}
                onClick={() => onSurahNavigate?.(nextSurah)}
                sx={{
                  maxWidth: '100%',
                  minWidth: 0,
                  px: { xs: 0.75, sm: 1.25 },
                  py: 0.5,
                  color: '#6f5a22',
                  fontWeight: 800,
                  fontSize: { xs: '0.72rem', sm: '0.88rem' },
                  lineHeight: 1.15,
                  textTransform: 'none',
                  whiteSpace: 'normal',
                  textAlign: 'right',
                  backgroundColor: 'rgba(255, 248, 217, 0.58)',
                  '&:hover': {
                    backgroundColor: 'rgba(215, 183, 101, 0.22)',
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
