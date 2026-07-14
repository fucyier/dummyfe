import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { toast } from 'react-toastify';
import { fetchQuranFoundationAyahAudioUrl, fetchVerseList } from './api';

const DEFAULT_AUTHOR_ID = 30;
const QURAN_ANNOTATION_MARKS_REGEX = /[\u0610-\u061a\u06d4\u06d6-\u06ed\u25cc]/g;
const SURAH_REVELATION_ORDER = [
  96, 68, 73, 74, 1, 111, 81, 87, 92, 89, 93, 94, 103, 100, 108, 102, 107, 109, 105, 113,
  114, 112, 53, 80, 97, 91, 85, 95, 106, 101, 75, 104, 77, 50, 90, 86, 54, 38, 7, 72,
  36, 25, 35, 19, 20, 56, 26, 27, 28, 17, 10, 11, 12, 15, 6, 37, 31, 34, 39, 40,
  41, 42, 43, 44, 45, 46, 51, 88, 18, 16, 71, 14, 21, 23, 32, 52, 67, 69, 70, 78,
  79, 82, 84, 30, 29, 83, 2, 8, 3, 33, 60, 4, 99, 57, 47, 13, 55, 76, 65, 98,
  59, 24, 22, 63, 58, 49, 66, 64, 61, 62, 48, 5, 9, 110,
];
const REVELATION_ORDER_BY_SURAH_ID = new Map(
  SURAH_REVELATION_ORDER.map((surahId, index) => [surahId, index + 1]),
);

const formatArabicVerse = (text) => (
  String(text || '').normalize('NFC').replace(QURAN_ANNOTATION_MARKS_REGEX, '')
);

const toArabicNumber = (value) => (
  String(value ?? '').replace(/\d/g, digit => '٠١٢٣٤٥٦٧٨٩'[digit])
);

const VerseEndMark = ({ children }) => (
  <Box
    component="span"
    sx={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.1em',
      height: '1.1em',
      mx: 0.45,
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
    }}
  >
    {children}
  </Box>
);

const getAyahAudioUrl = async ({ audio, surahId, verse }) => {
  if (!audio) {
    throw new Error('Seslendiren seçiniz.');
  }

  if (audio.source === 'quranfoundation' && audio.recitationId) {
    return fetchQuranFoundationAyahAudioUrl(audio.recitationId, surahId, verse.verse_number);
  }

  if (audio.source === 'alquran' && audio.identifier) {
    return `https://cdn.islamic.network/quran/audio/128/${audio.identifier}/${verse.id}.mp3`;
  }

  throw new Error('Seçili seslendiren ayet bazlı seslendirme desteklemiyor.');
};

const SureComponent = ({
  dataSurah = [],
  dataAuthor = [],
  surah: currentSurahId = 0,
  author = 0,
  audio = null,
  onSurahChange,
}) => {
  const [selectedSurah, setSelectedSurah] = useState(null);
  const [surahDetail, setSurahDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activeVerseId, setActiveVerseId] = useState(null);
  const [loadingVerseId, setLoadingVerseId] = useState(null);
  const [activeAudioUrl, setActiveAudioUrl] = useState('');
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [sortMode, setSortMode] = useState('mushaf');
  const audioRef = useRef(null);
  const detailAreaRef = useRef(null);

  const effectiveAuthorId = author || DEFAULT_AUTHOR_ID;
  const selectedAuthor = useMemo(
    () => dataAuthor.find(item => item.id === effectiveAuthorId) || null,
    [dataAuthor, effectiveAuthorId],
  );

  const sortedSurahs = useMemo(
    () => [...dataSurah].sort((a, b) => {
      if (sortMode === 'revelation') {
        return (REVELATION_ORDER_BY_SURAH_ID.get(a.id) || 999) - (REVELATION_ORDER_BY_SURAH_ID.get(b.id) || 999);
      }

      return (a.id || 0) - (b.id || 0);
    }),
    [dataSurah, sortMode],
  );

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveVerseId(null);
    setLoadingVerseId(null);
    setActiveAudioUrl('');
    setAudioDrawerOpen(false);
  };

  const loadSurahDetail = (surahItem, { syncBar = true } = {}) => {
    stopAudio();
    setSelectedSurah(surahItem);
    setSurahDetail(null);
    setDetailLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (syncBar) {
      onSurahChange?.(surahItem);
    }

    fetchVerseList(surahItem.id, effectiveAuthorId)
      .then((data) => {
        setSurahDetail(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Sure ayetleri yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setDetailLoading(false);
      });
  };

  useEffect(() => {
    if (!selectedSurah) return;
    loadSurahDetail(selectedSurah, { syncBar: false });
  }, [effectiveAuthorId]);

  useEffect(() => {
    if (!currentSurahId || selectedSurah?.id === currentSurahId) return;
    const nextSurah = dataSurah.find(item => item.id === currentSurahId);
    if (nextSurah) {
      loadSurahDetail(nextSurah, { syncBar: false });
    }
  }, [currentSurahId, dataSurah]);

  useEffect(() => () => stopAudio(), []);

  useEffect(() => {
    if (!activeVerseId) return undefined;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (target instanceof Element && target.closest('button, a, input, textarea, select, [role="button"], [role="combobox"], .MuiDrawer-root, .MuiPopover-root, .MuiPopper-root')) {
        return;
      }

      stopAudio();
    };

    document.addEventListener('pointerdown', handlePointerDown, true);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown, true);
    };
  }, [activeVerseId]);

  const handleBackToList = () => {
    stopAudio();
    setSelectedSurah(null);
    setSurahDetail(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePlayVerse = async (verse) => {
    const verseKey = String(verse.id);

    if (activeVerseId === verseKey && audioRef.current) {
      stopAudio();
      return;
    }

    stopAudio();
    setLoadingVerseId(verseKey);

    try {
      const audioUrl = await getAyahAudioUrl({
        audio,
        surahId: selectedSurah.id,
        verse,
      });

      setActiveAudioUrl(audioUrl);
      setActiveVerseId(verseKey);
      setLoadingVerseId(null);
      setAudioDrawerOpen(true);
    } catch (error) {
      console.error(error);
      stopAudio();
      toast.error(error?.message || 'Ayet sesi yüklenirken bir hata oluştu.');
    }
  };

  if (selectedSurah) {
    return (
      <Box ref={detailAreaRef} sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 0.75, sm: 2 }, pb: 9 }}>
        <Breadcrumbs
          separator="›"
          sx={{
            mb: 2,
            color: '#6f5a22',
            '& .MuiBreadcrumbs-separator': { fontWeight: 900 },
          }}
        >
          <Button
            onClick={handleBackToList}
            sx={{
              color: '#6f5a22',
              fontWeight: 900,
              textTransform: 'none',
              backgroundColor: 'rgba(255, 253, 244, 0.82)',
              border: '1px solid rgba(142, 118, 63, 0.24)',
              '&:hover': { backgroundColor: 'rgba(215, 183, 101, 0.18)' },
            }}
          >
            Sureler
          </Button>
          <FormControl size="small" sx={{ minWidth: { xs: 150, sm: 220 } }}>
            <Select
              value={selectedSurah.id}
              onChange={(event) => {
                const nextSurah = dataSurah.find(item => item.id === Number(event.target.value));
                if (nextSurah) {
                  loadSurahDetail(nextSurah);
                }
              }}
              sx={{
                height: 34,
                color: '#6f5a22',
                fontWeight: 900,
                backgroundColor: 'rgba(255, 253, 244, 0.82)',
                '& .MuiOutlinedInput-notchedOutline': {
                  borderColor: 'rgba(142, 118, 63, 0.28)',
                },
              }}
            >
              {sortedSurahs.map(item => (
                <MenuItem key={item.id} value={item.id}>
                  {item.id}. {item.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Breadcrumbs>

        <Paper
          elevation={0}
          sx={{
            mb: 2,
            p: { xs: 1.5, sm: 2 },
            textAlign: 'center',
            borderRadius: 1,
            backgroundColor: 'rgba(255, 253, 244, 0.92)',
            border: '1px solid rgba(142, 118, 63, 0.18)',
            boxShadow: '0 6px 22px rgba(47, 56, 35, 0.1)',
          }}
        >
          <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: { xs: '1.35rem', sm: '2rem' } }}>
            {selectedSurah.id}. {selectedSurah.name} Suresi
          </Typography>
          <Typography sx={{ mt: 0.5, color: '#4f4a33', fontWeight: 800 }}>
            {selectedSurah.verse_count} Ayet · {selectedSurah.name_original}
          </Typography>
        </Paper>

        {detailLoading && (
          <Box sx={{ display: 'grid', placeItems: 'center', minHeight: 260 }}>
            <CircularProgress sx={{ color: '#6f7745' }} />
          </Box>
        )}

        {!detailLoading && (
          <Box sx={{ display: 'grid', gap: 2 }}>
            {(surahDetail?.verses || []).map((verse, index) => {
              const verseKey = String(verse.id);
              const isActive = activeVerseId === verseKey;
              const isLoading = loadingVerseId === verseKey;

              return (
                <Paper
                  key={verse.id}
                  data-sure-verse-card="true"
                  elevation={0}
                  sx={{
                    position: 'relative',
                    p: { xs: 1.5, sm: 2.25 },
                    pt: { xs: 4.75, sm: 4.25 },
                    borderRadius: 1,
                    backgroundColor: isActive ? 'rgba(255, 234, 163, 0.58)' : 'rgba(255, 253, 244, 0.92)',
                    border: '1px solid rgba(142, 118, 63, 0.2)',
                    boxShadow: isActive ? '0 0 0 4px rgba(215, 183, 101, 0.18), 0 10px 26px rgba(47, 56, 35, 0.14)' : '0 8px 24px rgba(47, 56, 35, 0.12)',
                    transition: 'background-color 160ms ease, box-shadow 160ms ease',
                  }}
                >
                  <IconButton
                    aria-label={`${verse.verse_number}. ayeti oynat`}
                    onClick={() => handlePlayVerse(verse)}
                    disabled={isLoading}
                    sx={{
                      position: 'absolute',
                      left: 8,
                      top: 8,
                      color: '#6f7745',
                      backgroundColor: 'rgba(255, 253, 244, 0.78)',
                      '&:hover': { backgroundColor: 'rgba(215, 183, 101, 0.22)' },
                    }}
                  >
                    {isLoading ? (
                      <CircularProgress size={22} thickness={5} sx={{ color: '#6f7745' }} />
                    ) : isActive ? (
                      <PauseIcon />
                    ) : (
                      <PlayArrowIcon />
                    )}
                  </IconButton>
                  <Typography
                    dir="rtl"
                    sx={{
                      color: '#211b14',
                      fontFamily: 'KFGQPC Uthman Taha Naskh, var(--font-mushaf), Traditional Arabic, serif',
                      fontSize: { xs: '2rem', sm: '2.65rem' },
                      fontWeight: 400,
                      lineHeight: 1.9,
                      textAlign: 'right',
                    }}
                  >
                    {formatArabicVerse(verse.verse)}
                    <VerseEndMark>{toArabicNumber(verse.verse_number)}</VerseEndMark>
                  </Typography>
                  {verse.translation?.text && (
                    <>
                      <Divider sx={{ my: 1.35, borderColor: 'rgba(142, 118, 63, 0.18)' }} />
                      <Typography sx={{ color: '#211b14', fontWeight: 500, lineHeight: 1.7, textAlign: 'left' }}>
                        <Box component="span" sx={{ mr: 0.75, color: '#6f5a22', fontWeight: 900 }}>
                          {index + 1}.
                        </Box>
                        {verse.translation.text}
                      </Typography>
                    </>
                  )}
                </Paper>
              );
            })}
          </Box>
        )}
        <Drawer
          anchor="bottom"
          open={audioDrawerOpen}
          onClose={stopAudio}
          hideBackdrop
          sx={{
            pointerEvents: 'none',
            '& .MuiDrawer-paper': {
              pointerEvents: 'auto',
            },
          }}
          ModalProps={{
            keepMounted: true,
            disableScrollLock: true,
            disableAutoFocus: true,
            disableEnforceFocus: true,
            disableRestoreFocus: true,
          }}
          PaperProps={{
            sx: {
              backgroundColor: '#54613d',
              color: '#fff8d9',
              borderTop: '1px solid rgba(142, 118, 63, 0.35)',
              boxShadow: '0 -2px 10px rgba(47, 56, 35, 0.22)',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 1, py: 0.75 }}>
            <Typography
              sx={{
                display: { xs: 'none', sm: 'block' },
                color: '#fff8d9',
                fontWeight: 900,
                whiteSpace: 'nowrap',
              }}
            >
              Ayet Sesi
            </Typography>
            <Box
              component="audio"
              ref={audioRef}
              src={activeAudioUrl || undefined}
              controls
              autoPlay
              onCanPlay={(event) => {
                if (!activeVerseId) return;
                event.currentTarget.play().catch(() => {});
              }}
              onEnded={stopAudio}
              onError={() => {
                stopAudio();
                toast.error('Ayet sesi yüklenirken bir hata oluştu.');
              }}
              sx={{ flex: '1 1 auto', minWidth: 0, height: 38 }}
            />
          </Box>
        </Drawer>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 0.75, sm: 2 }, pb: 8 }}>
      <Typography
        variant="h4"
        sx={{
          mb: 1.25,
          color: '#6f5a22',
          fontWeight: 900,
          textAlign: 'center',
          fontSize: { xs: '1.65rem', sm: '2.35rem' },
        }}
      >
        Sureler
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
        <Box
          sx={{
            display: 'inline-flex',
            gap: 0.25,
            p: 0.25,
            borderRadius: 999,
            backgroundColor: 'rgba(238, 238, 238, 0.9)',
            boxShadow: 'inset 0 0 0 1px rgba(79, 74, 51, 0.08)',
          }}
        >
          {[
            { value: 'mushaf', label: 'Mushaf Sırası' },
            { value: 'revelation', label: 'İniş Sırası' },
          ].map((item) => {
            const active = sortMode === item.value;

            return (
              <Button
                key={item.value}
                size="small"
                onClick={() => setSortMode(item.value)}
                sx={{
                  minHeight: 32,
                  px: { xs: 1.1, sm: 1.5 },
                  py: 0.35,
                  borderRadius: 999,
                  color: active ? '#fff8d9' : '#62675a',
                  backgroundColor: active ? '#2f312d' : 'transparent',
                  fontWeight: 900,
                  fontSize: { xs: '0.78rem', sm: '0.9rem' },
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: active ? '#2f312d' : 'rgba(255, 255, 255, 0.62)',
                  },
                }}
              >
                {item.label}
              </Button>
            );
          })}
        </Box>
      </Box>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(4, minmax(0, 1fr))' },
          gap: 1.5,
        }}
      >
        {sortedSurahs.map((surah) => (
          <Paper
            key={surah.id}
            component="button"
            type="button"
            onClick={() => loadSurahDetail(surah)}
            elevation={0}
            sx={{
              width: '100%',
              minHeight: 148,
              p: 1.5,
              textAlign: 'left',
              borderRadius: 1,
              border: '1px solid rgba(142, 118, 63, 0.22)',
              backgroundColor: 'rgba(255, 253, 244, 0.88)',
              boxShadow: '0 4px 16px rgba(47, 56, 35, 0.08)',
              cursor: 'pointer',
              color: '#211b14',
              '&:hover': {
                borderColor: '#8e763f',
                backgroundColor: 'rgba(255, 248, 217, 0.96)',
                boxShadow: '0 8px 20px rgba(47, 56, 35, 0.14)',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
              <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: '1.05rem' }}>
                {surah.id}. {surah.name}
              </Typography>
              <Typography sx={{ color: '#6f7745', fontWeight: 900, fontSize: '0.82rem', whiteSpace: 'nowrap' }}>
                {surah.verse_count} Ayet
              </Typography>
            </Box>
            <Typography
              dir="rtl"
              sx={{
                mt: 2,
                color: '#211b14',
                fontFamily: 'KFGQPC Uthman Taha Naskh, var(--font-mushaf), Traditional Arabic, serif',
                fontSize: '1.7rem',
                fontWeight: 400,
                lineHeight: 1.5,
                textAlign: 'right',
              }}
            >
              {surah.name_original}
            </Typography>
            <Typography sx={{ mt: 1, color: '#4f4a33', fontWeight: 700, fontSize: '0.82rem' }}>
              Mushaf sırası: {surah.id}
              {sortMode === 'revelation' && ` · İniş sırası: ${REVELATION_ORDER_BY_SURAH_ID.get(surah.id) || '-'}`}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default SureComponent;
