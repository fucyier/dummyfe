import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import Divider from '@mui/material/Divider';
import { AudioPlayer } from 'react-audio-play';
import { AppBar, Button, Fab } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import { Fragment, useState } from 'react';

const ArabicVerse = styled(Paper)(({ theme }) => ({
  backgroundColor: '#fff8d9',
  padding: theme.spacing(3),
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
  lineHeight: 2.25,
  letterSpacing: 0,
  color: '#211b14',
  wordBreak: 'normal',
  overflowWrap: 'anywhere',
  ...theme.applyStyles('dark', {
    backgroundColor: '#1A2027',
    color: '#fff7ea',
  }),
}));

const formatArabicVerse = (text) => (
  text
    ?.replaceAll('\u06ea', '\u0650')
    .replaceAll('\u0656', '\u0650')
    .replace(/[\u06d6-\u06ed]/g, '') || ''
);

const VerseComponent = ({ author, audio, gorunum, dataVerse }) => {
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [mealOpen, setMealOpen] = useState(false);
  const [secilenSound, setSecilenSound] = useState(null);

  const mealItems = [
    dataVerse.zero,
    ...(dataVerse?.verses || []),
  ].filter(item => item?.translation?.text);

  const mealDrawerContent = (
    <Box sx={{ maxHeight: '70vh', overflowY: 'auto', p: 2, pb: 4 }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 700 }}>
        Türkçe Meal
      </Typography>
      {dataVerse?.audio?.mp3 && (
        <Box sx={{ mb: 2, maxWidth: '100%', overflow: 'hidden' }}>
          <AudioPlayer
            src={dataVerse.audio.mp3}
            width="100%"
            color="#fff8d9"
            sliderColor="#d7b765"
            backgroundColor="#54613d"
          />
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
    <Box sx={{ width: '100%', maxWidth: '100vw', overflow: 'hidden' }} role="presentation">
      <AudioPlayer
        autoPlay
        src={`https://cdn.islamic.network/quran/audio/128/${audio}/${secilenSound}.mp3`}
        width="100%"
        color="#cfcfcf"
        sliderColor="#d7b765"
        backgroundColor="#54613d"
      />
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

  return (
    <>
      <div>
        <Typography sx={{ mt: 2, mb: 2 }} variant="h4" component="div">
          {dataVerse.length == 0 ? '' : dataVerse.name + ' Suresi'}
        </Typography>
        <br />
        <Stack
          direction="column"
          spacing={2}
          sx={{
            justifyContent: 'flex-start',
            alignItems: 'stretch',
            pb: dataVerse.audio !== undefined ? 7 : 0,
          }}
        >
          <ArabicVerse key={dataVerse.zero?.id} value={dataVerse.zero?.id}>
            {formatArabicVerse(gorunum ? dataVerse.zero?.verse_simplified : dataVerse.zero?.verse)}
          </ArabicVerse>
          <div id={'tr0' + dataVerse.zero?.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>
            {dataVerse.zero?.transcription}
          </div>

          {dataVerse?.verses?.map(item => (
            <Fragment key={item.id}>
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
                    setAudioDrawerOpen(true);
                    setSecilenSound(e.currentTarget.value?.split('.')[0]);
                  }}
                >
                  {item.verse_number + '. ayet'}
                </Button>
              </Divider>
              <ArabicVerse value={item.id}>
                {formatArabicVerse(gorunum ? item.verse_simplified : item.verse)}
              </ArabicVerse>
              <div id={'tr' + item.id} style={{ display: 'flex', justifyContent: 'flex-end', textAlign: 'left' }}>
                {item.transcription}
              </div>
            </Fragment>
          ))}

          <Drawer anchor="bottom" open={audioDrawerOpen} onClose={() => setAudioDrawerOpen(false)}>
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
