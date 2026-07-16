import { useEffect, useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import CardActionArea from '@mui/material/CardActionArea';
import Drawer from '@mui/material/Drawer';
import Fade from '@mui/material/Fade';
import FormControl from '@mui/material/FormControl';
import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { toast } from 'react-toastify';
import { fetchQuranFoundationAyahAudio, fetchQuranFoundationJuzVerses, fetchVerseList } from './api';

const QURAN_ANNOTATION_MARKS_REGEX = /[\u0610-\u061a\u06d4\u06d6-\u06ed\u25cc]/g;
const ARABIC_DIACRITICS_REGEX = /[\u0640\u064b-\u065f\u0670]/g;
const MIN_TRACKING_LEAD_SECONDS = 0.45;
const MAX_TRACKING_LEAD_SECONDS = 1.35;
const TRACKING_LEAD_RATIO = 0.075;
const SEGMENT_TRACKING_LEAD_MS = 90;
const DEFAULT_MUKABELE_AUTHOR_ID = 11;
const JUZ_START_PAGES = [
  1, 22, 42, 62, 82, 102, 122, 142, 162, 182,
  202, 222, 242, 262, 282, 302, 322, 342, 362, 382,
  402, 422, 442, 462, 482, 502, 522, 542, 562, 582,
];

const formatArabicText = (text) => (
  String(text || '').normalize('NFC').replace(QURAN_ANNOTATION_MARKS_REGEX, '')
);

const getWordTrackingWeight = (word) => {
  const bareText = formatArabicText(word?.uthmaniText || word?.text)
    .replace(ARABIC_DIACRITICS_REGEX, '')
    .trim();

  return Math.max(1, bareText.length);
};

const getTrackingLeadSeconds = (duration) => (
  Math.min(MAX_TRACKING_LEAD_SECONDS, Math.max(MIN_TRACKING_LEAD_SECONDS, duration * TRACKING_LEAD_RATIO))
);

const getWeightedWordPosition = (words, currentTime, duration) => {
  if (!words.length || !Number.isFinite(duration) || duration <= 0) {
    return { wordIndex: 0, wordProgress: 0 };
  }

  const weights = words.map(getWordTrackingWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const effectiveTime = Math.min(duration - 0.02, currentTime + getTrackingLeadSeconds(duration));
  const targetWeight = Math.min(totalWeight - 0.001, Math.max(0, (effectiveTime / duration) * totalWeight));
  let accumulatedWeight = 0;

  for (let index = 0; index < weights.length; index += 1) {
    const nextWeight = accumulatedWeight + weights[index];
    if (targetWeight < nextWeight) {
      return {
        wordIndex: index,
        wordProgress: Math.min(0.98, Math.max(0.02, (targetWeight - accumulatedWeight) / weights[index])),
      };
    }
    accumulatedWeight = nextWeight;
  }

  return { wordIndex: words.length - 1, wordProgress: 0.98 };
};

const getWeightedWordStartTime = (words, wordIndex, duration) => {
  if (!words.length || !Number.isFinite(duration) || duration <= 0) return 0;

  const weights = words.map(getWordTrackingWeight);
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  const startWeight = weights.slice(0, Math.max(0, wordIndex)).reduce((sum, weight) => sum + weight, 0);

  return Math.max(0, ((startWeight / totalWeight) * duration) - getTrackingLeadSeconds(duration));
};

const normalizeAudioSegments = (segments = []) => (
  segments
    .map((segment) => {
      const wordPosition = segment.length >= 4 ? Number(segment[1]) : Number(segment[0]);
      const startMs = segment.length >= 4 ? Number(segment[2]) : Number(segment[1]);
      const endMs = segment.length >= 4 ? Number(segment[3]) : Number(segment[2]);

      if (!wordPosition || !Number.isFinite(startMs) || !Number.isFinite(endMs)) return null;

      return {
        wordIndex: Math.max(0, wordPosition - 1),
        startMs,
        endMs,
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.startMs - b.startMs)
);

const getSegmentWordPosition = (segments = [], currentTimeMs = 0) => {
  if (!segments.length) return null;

  const adjustedTimeMs = currentTimeMs + SEGMENT_TRACKING_LEAD_MS;
  const firstSegment = segments[0];

  if (adjustedTimeMs <= firstSegment.startMs) {
    return { wordIndex: firstSegment.wordIndex, wordProgress: 0.02 };
  }

  for (let index = 0; index < segments.length; index += 1) {
    const segment = segments[index];
    const nextSegment = segments[index + 1];

    if (adjustedTimeMs >= segment.startMs && adjustedTimeMs <= segment.endMs) {
      const segmentDuration = Math.max(1, segment.endMs - segment.startMs);

      return {
        wordIndex: segment.wordIndex,
        wordProgress: Math.min(0.98, Math.max(0.02, (adjustedTimeMs - segment.startMs) / segmentDuration)),
      };
    }

    if (nextSegment && adjustedTimeMs > segment.endMs && adjustedTimeMs < nextSegment.startMs) {
      return { wordIndex: nextSegment.wordIndex, wordProgress: 0.02 };
    }
  }

  const lastSegment = segments[segments.length - 1];
  return { wordIndex: lastSegment.wordIndex, wordProgress: 0.98 };
};

const getSegmentWordStartTime = (segments = [], wordIndex = 0) => {
  const segment = segments.find(item => item.wordIndex === wordIndex);
  if (!segment) return null;

  return Math.max(0, (segment.startMs - SEGMENT_TRACKING_LEAD_MS) / 1000);
};

const toArabicNumber = (value) => (
  String(value ?? '').replace(/\d/g, digit => String.fromCharCode(0x0660 + Number(digit)))
);

const getJuzPageRange = (juzNumber) => {
  const start = JUZ_START_PAGES[juzNumber - 1] || 1;
  const end = JUZ_START_PAGES[juzNumber] ? JUZ_START_PAGES[juzNumber] - 1 : 604;

  return { start, end };
};

const getPageSummary = (pageData, surahById) => {
  const verses = pageData?.verses || [];
  const firstVerse = verses[0];
  const lastVerse = verses[verses.length - 1];

  if (!firstVerse || !lastVerse) return null;

  const pageSurahNames = verses
    .map(item => surahById.get(item.surahId)?.name)
    .filter((name, index, items) => name && items.indexOf(name) === index);
  const surahLabel = pageSurahNames.length === 1
    ? `${pageSurahNames[0]} Suresi`
    : `${pageSurahNames.join(' / ')} Sureleri`;
  const rangeLabel = firstVerse.surahId === lastVerse.surahId
    ? `${firstVerse.verse_number}-${lastVerse.verse_number}`
    : `${firstVerse.surahId}:${firstVerse.verse_number}-${lastVerse.surahId}:${lastVerse.verse_number}`;

  return {
    pageLabel: `Sayfa ${pageData.pageNumber}`,
    surahLabel,
    rangeLabel,
  };
};

const getAyahAudioData = async ({ audio, verse }) => {
  if (!audio) {
    throw new Error('Seslendiren seçiniz.');
  }

  if (audio.source === 'quranfoundation' && audio.recitationId) {
    const audioFile = await fetchQuranFoundationAyahAudio(audio.recitationId, verse.surahId, verse.verse_number);

    return {
      audioUrl: audioFile.audioUrl,
      segments: normalizeAudioSegments(audioFile.segments),
    };
  }

  if (audio.source === 'alquran' && audio.identifier) {
    return {
      audioUrl: `https://cdn.islamic.network/quran/audio/128/${audio.identifier}/${verse.id}.mp3`,
      segments: [],
    };
  }

  throw new Error('Seçili seslendiren ayet bazlı seslendirme desteklemiyor.');
};

const VerseEndMark = ({ children }) => {
  const digitCount = String(children ?? '').length;
  const markerFontSize = digitCount >= 3 ? '0.34em' : digitCount === 2 ? '0.39em' : '0.42em';

  return (
  <Box
    component="span"
    sx={{
      position: 'relative',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '1.08em',
      height: '1.08em',
      mx: 0.35,
      verticalAlign: 'middle',
      border: '0.05em solid #6f5a22',
      borderRadius: '50%',
      color: '#6f5a22',
      fontFamily: 'Traditional Arabic, serif',
      fontSize: markerFontSize,
      lineHeight: 1,
      '&::before': {
        content: '""',
        position: 'absolute',
        inset: '-0.15em',
        border: '0.032em dotted #6f5a22',
        borderRadius: '50%',
      },
    }}
  >
    {children}
  </Box>
  );
};

const MukabeleComponent = ({
  dataSurah = [],
  author = 0,
  selectedAuthor = null,
  audio = null,
}) => {
  const [selectedJuz, setSelectedJuz] = useState(null);
  const [juzVerses, setJuzVerses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedPage, setSelectedPage] = useState(null);
  const [activeVerseIndex, setActiveVerseIndex] = useState(null);
  const [activeWordIndex, setActiveWordIndex] = useState(null);
  const [activeWordProgress, setActiveWordProgress] = useState(0);
  const [completedVerseIndex, setCompletedVerseIndex] = useState(-1);
  const [audioUrl, setAudioUrl] = useState('');
  const [activeSegments, setActiveSegments] = useState([]);
  const [audioDrawerOpen, setAudioDrawerOpen] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mealTranslations, setMealTranslations] = useState(new Map());
  const [mealLoading, setMealLoading] = useState(false);
  const audioRef = useRef(null);
  const activeWordRef = useRef(null);
  const pendingStartWordIndexRef = useRef(0);

  const surahById = useMemo(
    () => new Map(dataSurah.map(item => [item.id, item])),
    [dataSurah],
  );
  const effectiveMealAuthorId = author || DEFAULT_MUKABELE_AUTHOR_ID;
  const activeVerse = activeVerseIndex === null ? null : juzVerses[activeVerseIndex];
  const activeVerseKey = activeVerse ? `${activeVerse.surahId}:${activeVerse.verse_number}` : '';
  const activeVerseMeal = activeVerseKey ? mealTranslations.get(activeVerseKey) : '';
  const activeMealAuthorName = selectedAuthor?.name || 'Diyanet İşleri';

  const pages = useMemo(() => {
    const pageMap = new Map();

    juzVerses.forEach((verse, verseIndex) => {
      const pageNumber = verse.page_number || verse.quranFoundationWords?.[0]?.pageNumber || 0;
      if (!pageNumber) return;

      const page = pageMap.get(pageNumber) || [];
      page.push({ ...verse, verseIndex });
      pageMap.set(pageNumber, page);
    });

    return [...pageMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([pageNumber, verses]) => ({ pageNumber, verses }));
  }, [juzVerses]);

  const selectedPageData = useMemo(
    () => pages.find(item => item.pageNumber === selectedPage) || pages[0] || null,
    [pages, selectedPage],
  );

  const selectedPageIndex = useMemo(
    () => pages.findIndex(item => item.pageNumber === selectedPageData?.pageNumber),
    [pages, selectedPageData],
  );
  const selectedPageSummary = useMemo(
    () => getPageSummary(selectedPageData, surahById),
    [selectedPageData, surahById],
  );

  useEffect(() => {
    if (!juzVerses.length || !effectiveMealAuthorId) {
      setMealTranslations(new Map());
      return undefined;
    }

    let ignore = false;
    const surahIds = [...new Set(juzVerses.map(item => item.surahId).filter(Boolean))];
    setMealLoading(true);

    Promise.allSettled(surahIds.map(surahId => fetchVerseList(surahId, effectiveMealAuthorId)))
      .then((results) => {
        if (ignore) return;
        const nextTranslations = new Map();

        results.forEach((result) => {
          if (result.status !== 'fulfilled') return;
          (result.value?.verses || []).forEach((verse) => {
            const surahId = result.value?.id || verse.surah_id || verse.surahId;
            const key = `${surahId}:${verse.verse_number}`;
            nextTranslations.set(key, verse.translation?.text || '');
          });
        });

        setMealTranslations(nextTranslations);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        if (!ignore) setMealLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [juzVerses, effectiveMealAuthorId]);

  const groupedLines = useMemo(() => {
    if (!selectedPageData) return [];
    const lineMap = new Map();

    selectedPageData.verses.forEach((verse) => {
      const words = verse.quranFoundationWords || [];
      words.forEach((word, wordIndex) => {
        const lineNumber = word.lineNumber || verse.verse_number;
        const line = lineMap.get(lineNumber) || [];
        line.push({
          type: 'word',
          id: `${verse.id}-${word.position || wordIndex}`,
          verseIndex: verse.verseIndex,
          wordIndex,
          text: formatArabicText(word.uthmaniText || word.text),
        });

        if (wordIndex === words.length - 1) {
          line.push({
            type: 'verseEnd',
            id: `${verse.id}-end`,
            verseIndex: verse.verseIndex,
            verseNumber: verse.verse_number,
          });
        }
        lineMap.set(lineNumber, line);
      });
    });

    return [...lineMap.entries()]
      .sort(([a], [b]) => a - b)
      .map(([lineNumber, tokens]) => ({ lineNumber, tokens }));
  }, [selectedPageData]);

  const stopPlayback = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setActiveVerseIndex(null);
    setActiveWordIndex(null);
    setActiveWordProgress(0);
    setCompletedVerseIndex(-1);
    setAudioUrl('');
    setActiveSegments([]);
    setAudioDrawerOpen(false);
    setIsPaused(false);
    pendingStartWordIndexRef.current = 0;
  };

  const loadJuz = (juzNumber) => {
    stopPlayback();
    setSelectedJuz(juzNumber);
    setJuzVerses([]);
    setSelectedPage(null);
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    fetchQuranFoundationJuzVerses(juzNumber)
      .then((verses) => {
        setJuzVerses(verses);
        const firstPage = verses.find(item => item.page_number)?.page_number
          || verses[0]?.quranFoundationWords?.[0]?.pageNumber
          || getJuzPageRange(juzNumber).start;
        setSelectedPage(firstPage);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Cüz sayfası yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const playVerseAt = async (verseIndex, startWordIndex = 0) => {
    const verse = juzVerses[verseIndex];
    if (!verse) {
      stopPlayback();
      return;
    }

    try {
      pendingStartWordIndexRef.current = startWordIndex;
      const audioData = await getAyahAudioData({ audio, verse });
      const pageNumber = verse.page_number || verse.quranFoundationWords?.[0]?.pageNumber;

      if (pageNumber) {
        setSelectedPage(pageNumber);
      }
      setActiveVerseIndex(verseIndex);
      setCompletedVerseIndex(verseIndex - 1);
      setActiveWordIndex(startWordIndex);
      setActiveWordProgress(0);
      setAudioUrl(audioData.audioUrl);
      setActiveSegments(audioData.segments || []);
      setAudioDrawerOpen(true);
      setIsPaused(false);
    } catch (error) {
      console.error(error);
      stopPlayback();
      toast.error(error?.message || 'Ayet sesi yüklenirken bir hata oluştu.');
    }
  };

  const handleTogglePlayback = () => {
    if (activeVerseIndex === null) {
      const firstVerseIndex = selectedPageData?.verses?.[0]?.verseIndex ?? 0;
      playVerseAt(firstVerseIndex, 0);
      return;
    }

    if (!audioRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
      setIsPaused(false);
      return;
    }

    audioRef.current.pause();
    setIsPaused(true);
  };

  const seekCurrentVerseToWord = (verseIndex, wordIndex) => {
    const audioElement = audioRef.current;
    const verse = juzVerses[verseIndex];
    const words = verse?.quranFoundationWords || [];
    const duration = audioElement?.duration;

    if (!audioElement || activeVerseIndex !== verseIndex || !words.length || !Number.isFinite(duration) || duration <= 0) {
      return false;
    }

    const segmentStartTime = getSegmentWordStartTime(activeSegments, wordIndex);
    audioElement.currentTime = Math.min(
      duration - 0.15,
      segmentStartTime ?? getWeightedWordStartTime(words, wordIndex, duration),
    );
    setActiveWordIndex(wordIndex);
    setActiveWordProgress(0.02);
    setCompletedVerseIndex(verseIndex - 1);
    setAudioDrawerOpen(true);
    audioElement.play().catch(() => {});
    setIsPaused(false);

    return true;
  };

  const handleWordClick = (verseIndex, wordIndex, event) => {
    event?.preventDefault();
    event?.stopPropagation();
    if (seekCurrentVerseToWord(verseIndex, wordIndex)) return;

    playVerseAt(verseIndex, wordIndex);
  };

  const handleTimeUpdate = (event) => {
    if (activeVerseIndex === null) return;
    const verse = juzVerses[activeVerseIndex];
    const words = verse?.quranFoundationWords || [];
    const duration = event.currentTarget.duration;

    if (!words.length || !Number.isFinite(duration) || duration <= 0) return;

    const segmentPosition = getSegmentWordPosition(activeSegments, event.currentTarget.currentTime * 1000);
    const nextPosition = segmentPosition || getWeightedWordPosition(words, event.currentTarget.currentTime, duration);
    setActiveWordIndex(nextPosition.wordIndex);
    setActiveWordProgress(nextPosition.wordProgress);
  };

  const handleLoadedMetadata = (event) => {
    const verse = activeVerseIndex === null ? null : juzVerses[activeVerseIndex];
    const words = verse?.quranFoundationWords || [];
    const duration = event.currentTarget.duration;
    const startWordIndex = pendingStartWordIndexRef.current || 0;

    if (words.length && Number.isFinite(duration) && duration > 0 && startWordIndex > 0) {
      const segmentStartTime = getSegmentWordStartTime(activeSegments, startWordIndex);
      event.currentTarget.currentTime = Math.min(
        duration - 0.15,
        segmentStartTime ?? getWeightedWordStartTime(words, startWordIndex, duration),
      );
      setActiveWordIndex(startWordIndex);
      setActiveWordProgress(0.02);
    }

    event.currentTarget.play().catch(() => {});
  };

  const handleAudioEnded = () => {
    if (activeVerseIndex === null) return;
    const nextVerseIndex = activeVerseIndex + 1;
    setCompletedVerseIndex(activeVerseIndex);

    if (nextVerseIndex >= juzVerses.length) {
      stopPlayback();
      return;
    }

    playVerseAt(nextVerseIndex, 0);
  };

  useEffect(() => () => stopPlayback(), []);

  useEffect(() => {
    if (!activeWordRef.current) return;

    activeWordRef.current.scrollIntoView({
      block: 'center',
      inline: 'center',
      behavior: 'smooth',
    });
  }, [activeVerseIndex, activeWordIndex, selectedPage]);

  if (!selectedJuz) {
    return (
      <Box sx={{ maxWidth: 1120, mx: 'auto', px: { xs: 0.75, sm: 2 }, pb: 8 }}>
        <Fade in timeout={380}>
          <Paper
            elevation={0}
            sx={{
              mb: 2.5,
              p: { xs: 2, sm: 2.75 },
              borderRadius: 2,
              background: 'linear-gradient(135deg, rgba(255,253,244,0.96), rgba(241,232,198,0.9))',
              border: '1px solid rgba(142, 118, 63, 0.2)',
              boxShadow: '0 10px 28px rgba(47, 56, 35, 0.12)',
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                mx: 'auto',
                mb: 1.25,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                color: '#fff8d9',
                backgroundColor: '#6f7745',
                boxShadow: '0 8px 18px rgba(111, 119, 69, 0.28)',
              }}
            >
              <AutoStoriesIcon />
            </Box>
            <Typography
              variant="h4"
              sx={{
                color: '#6f5a22',
                fontWeight: 900,
                fontSize: { xs: '1.65rem', sm: '2.35rem' },
              }}
            >
              Mukabele
            </Typography>
            <Typography sx={{ mt: 0.75, color: '#4f4a33', fontWeight: 700 }}>
              Cüz seçin; mushaf sayfasında ayet ayet okuma ve kelime takibi başlasın.
            </Typography>
          </Paper>
        </Fade>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))', md: 'repeat(3, minmax(0, 1fr))' },
            gap: { xs: 1.25, sm: 1.5 },
          }}
        >
          {Array.from({ length: 30 }, (_, index) => {
            const juzNumber = index + 1;
            const range = getJuzPageRange(juzNumber);
            const progressPercent = (juzNumber / 30) * 100;

            return (
              <Zoom key={juzNumber} in timeout={260 + (index % 6) * 55}>
                <Paper
                  elevation={0}
                  sx={{
                    overflow: 'hidden',
                    borderRadius: 2,
                    border: '1px solid rgba(142, 118, 63, 0.18)',
                    backgroundColor: 'rgba(255, 253, 244, 0.92)',
                    boxShadow: '0 6px 18px rgba(47, 56, 35, 0.09)',
                    transition: 'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      borderColor: 'rgba(142, 118, 63, 0.48)',
                      boxShadow: '0 14px 30px rgba(47, 56, 35, 0.16)',
                    },
                  }}
                >
                  <CardActionArea
                    onClick={() => loadJuz(juzNumber)}
                    sx={{
                      height: '100%',
                      p: 1.6,
                      color: '#211b14',
                      '& .MuiCardActionArea-focusHighlight': {
                        backgroundColor: 'rgba(111, 119, 69, 0.2)',
                      },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                      <Box
                        sx={{
                          flex: '0 0 auto',
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          color: '#fff8d9',
                          fontWeight: 900,
                          backgroundColor: '#6f7745',
                          boxShadow: '0 7px 16px rgba(111, 119, 69, 0.25)',
                        }}
                      >
                        {juzNumber}
                      </Box>
                      <Box sx={{ minWidth: 0, flex: 1 }}>
                        <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: '1.12rem' }}>
                          {juzNumber}. Cüz
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.65 }}>
                          <Chip
                            label={'Sayfa ' + range.start + '-' + range.end}
                            size="small"
                            sx={{
                              height: 24,
                              color: '#6f5a22',
                              backgroundColor: 'rgba(241, 232, 198, 0.85)',
                              fontWeight: 800,
                            }}
                          />
                          <Chip
                            label="Takipli oku"
                            size="small"
                            variant="outlined"
                            sx={{
                              height: 24,
                              color: '#6f7745',
                              borderColor: 'rgba(111, 119, 69, 0.28)',
                              fontWeight: 800,
                            }}
                          />
                        </Box>
                      </Box>
                      <KeyboardArrowRightIcon sx={{ color: '#8e763f' }} />
                    </Box>
                    <Box
                      sx={{
                        mt: 1.35,
                        height: 5,
                        borderRadius: 999,
                        backgroundColor: 'rgba(142, 118, 63, 0.14)',
                        overflow: 'hidden',
                      }}
                    >
                      <Box
                        sx={{
                          width: progressPercent + '%',
                          height: '100%',
                          borderRadius: 999,
                          background: 'linear-gradient(90deg, #6f7745, #b79a4b)',
                        }}
                      />
                    </Box>
                  </CardActionArea>
                </Paper>
              </Zoom>
            );
          })}
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: { xs: 1120, lg: 1460 }, mx: 'auto', px: { xs: 0.5, sm: 2 }, pr: { lg: audioDrawerOpen && activeVerse ? '145px' : 2, xl: audioDrawerOpen && activeVerse ? '170px' : 2 }, pb: 10 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          mb: 1.5,
        }}
      >
        <Button
          onClick={() => {
            stopPlayback();
            setSelectedJuz(null);
            setJuzVerses([]);
            setSelectedPage(null);
          }}
          sx={{
            color: '#6f5a22',
            fontWeight: 900,
            textTransform: 'none',
            backgroundColor: 'rgba(255, 253, 244, 0.82)',
            border: '1px solid rgba(142, 118, 63, 0.24)',
            '&:hover': { backgroundColor: 'rgba(215, 183, 101, 0.18)' },
          }}
        >
          Cüzler
        </Button>
        <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: { xs: '1.1rem', sm: '1.45rem' } }}>
          {selectedJuz}. Cüz
        </Typography>
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <Select
            value={selectedPageData?.pageNumber || ''}
            onChange={(event) => setSelectedPage(Number(event.target.value))}
            sx={{
              height: 36,
              color: '#6f5a22',
              fontWeight: 900,
              backgroundColor: 'rgba(255, 253, 244, 0.82)',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(142, 118, 63, 0.28)',
              },
            }}
          >
            {pages.map((page, index) => (
              <MenuItem key={page.pageNumber} value={page.pageNumber}>
                {index + 1}. Sayfa ({page.pageNumber})
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading && (
        <Box sx={{ minHeight: 300, display: 'grid', placeItems: 'center' }}>
          <CircularProgress sx={{ color: '#6f7745' }} />
        </Box>
      )}

      {!loading && selectedPageData && (
        <>
          <Paper
            elevation={0}
            sx={{
              mb: 1,
              px: { xs: 1, sm: 1.5 },
              py: 0.75,
              borderRadius: 999,
              backgroundColor: 'rgba(255, 253, 244, 0.92)',
              border: '1px solid rgba(142, 118, 63, 0.18)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <IconButton
              aria-label={activeVerseIndex === null || isPaused ? 'Mukabeleyi başlat' : 'Mukabeleyi duraklat'}
              onClick={handleTogglePlayback}
              sx={{ color: '#6f7745' }}
            >
              {activeVerseIndex !== null && !isPaused ? <PauseIcon /> : <PlayArrowIcon />}
            </IconButton>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                justifyContent: 'center',
                alignItems: 'center',
                gap: 0.6,
                flex: '1 1 280px',
                minWidth: 0,
              }}
            >
              {[
                { key: 'page', label: selectedPageSummary?.pageLabel || `Sayfa ${selectedPageData.pageNumber}`, variant: 'filled' },
                { key: 'surah', label: selectedPageSummary?.surahLabel || '', variant: 'outlined' },
                { key: 'range', label: selectedPageSummary?.rangeLabel ? `Ayet ${selectedPageSummary.rangeLabel}` : '', variant: 'outlined' },
              ].filter(item => item.label).map((item) => (
                <Chip
                  key={item.key}
                  label={item.label}
                  variant={item.variant}
                  size="small"
                  sx={{
                    maxWidth: { xs: '100%', sm: 280 },
                    color: item.key === 'page' ? '#fff8d9' : '#6f5a22',
                    backgroundColor: item.key === 'page' ? '#6f7745' : 'rgba(255, 253, 244, 0.74)',
                    borderColor: 'rgba(142, 118, 63, 0.28)',
                    fontWeight: 900,
                    fontSize: { xs: '0.78rem', sm: '0.88rem' },
                    '& .MuiChip-label': {
                      px: { xs: 1, sm: 1.25 },
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    },
                  }}
                />
              ))}
            </Box>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              <Button
                size="small"
                disabled={selectedPageIndex <= 0}
                onClick={() => {
                  stopPlayback();
                  setSelectedPage(pages[selectedPageIndex - 1]?.pageNumber || selectedPageData.pageNumber);
                }}
                sx={{ color: '#6f5a22', fontWeight: 900, textTransform: 'none' }}
              >
                Önceki
              </Button>
              <Button
                size="small"
                disabled={selectedPageIndex < 0 || selectedPageIndex >= pages.length - 1}
                onClick={() => {
                  stopPlayback();
                  setSelectedPage(pages[selectedPageIndex + 1]?.pageNumber || selectedPageData.pageNumber);
                }}
                sx={{ color: '#6f5a22', fontWeight: 900, textTransform: 'none' }}
              >
                Sonraki
              </Button>
            </Box>
          </Paper>

          {audioDrawerOpen && activeVerse && (
            <Fade in timeout={220}>
              <Paper
                elevation={0}
                sx={{
                  display: { xs: 'none', lg: 'block' },
                  position: 'fixed',
                  top: 'calc(72px + var(--controls-height, 0px))',
                  right: { lg: 14, xl: 22 },
                  zIndex: 1080,
                  width: { lg: 300, xl: 330 },
                  minHeight: 230,
                  maxHeight: '58vh',
                  p: 1.75,
                  borderRadius: 2,
                  backgroundColor: 'rgba(255, 253, 244, 0.96)',
                  border: '1px solid rgba(142, 118, 63, 0.24)',
                  boxShadow: '0 12px 32px rgba(47, 56, 35, 0.18)',
                }}
              >
                <Chip
                  size="small"
                  label={`${surahById.get(activeVerse.surahId)?.name || activeVerse.surahId} ${activeVerse.verse_number}`}
                  sx={{
                    mb: 1,
                    color: '#fff8d9',
                    backgroundColor: '#6f7745',
                    fontWeight: 900,
                  }}
                />
                <Typography sx={{ color: '#6f5a22', fontWeight: 900, fontSize: '0.86rem', mb: 0.75 }}>
                  {activeMealAuthorName} meali
                </Typography>
                <Typography sx={{ color: '#211b14', lineHeight: 1.7, fontWeight: 600, fontSize: '0.95rem', maxHeight: '44vh', overflowY: 'auto', pr: 0.5 }}>
                  {mealLoading ? 'Meal yükleniyor...' : (activeVerseMeal || 'Bu ayet için meal bulunamadı.')}
                </Typography>
              </Paper>
            </Fade>
          )}

          <Paper
            elevation={0}
            sx={{
              minHeight: { xs: '64vh', sm: '72vh' },
              p: { xs: 1.35, sm: 3 },
              borderRadius: 1,
              backgroundColor: 'rgba(255, 253, 244, 0.96)',
              border: '1px solid rgba(142, 118, 63, 0.18)',
              boxShadow: '0 8px 26px rgba(47, 56, 35, 0.12)',
            }}
          >
            <Box dir="rtl" sx={{ display: 'grid', gap: { xs: 0.05, sm: 0.18 } }}>
              {groupedLines.map((line) => (
                <Box
                  key={line.lineNumber}
                  sx={{
                    textAlign: 'justify',
                    textAlignLast: 'justify',
                    direction: 'rtl',
                    fontFamily: 'KFGQPC Uthman Taha Naskh, var(--font-mushaf), Traditional Arabic, serif',
                    fontSize: { xs: '2rem', sm: '2.85rem' },
                    lineHeight: { xs: 1.18, sm: 1.28 },
                    color: '#211b14',
                    '&::after': {
                      content: '""',
                      display: 'inline-block',
                      width: '100%',
                    },
                  }}
                >
                  {line.tokens.map((token) => {
                    if (token.type === 'verseEnd') {
                      return (
                        <Box
                          key={token.id}
                          component="span"
                          role="button"
                          tabIndex={0}
                          onClick={(event) => handleWordClick(token.verseIndex, 0, event)}
                          onKeyDown={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                              handleWordClick(token.verseIndex, 0, event);
                            }
                          }}
                          sx={{ cursor: 'pointer' }}
                        >
                          <VerseEndMark>{toArabicNumber(token.verseNumber)}</VerseEndMark>
                        </Box>
                      );
                    }

                    const isRead = token.verseIndex <= completedVerseIndex
                      || (token.verseIndex === activeVerseIndex && activeWordIndex !== null && token.wordIndex <= activeWordIndex);
                    const isActive = token.verseIndex === activeVerseIndex && token.wordIndex === activeWordIndex;
                    const activeArrowLeft = `${100 - (activeWordProgress * 100)}%`;

                    return (
                      <Box
                        key={token.id}
                        ref={isActive ? activeWordRef : null}
                        component="span"
                        role="button"
                        tabIndex={0}
                        onClick={(event) => handleWordClick(token.verseIndex, token.wordIndex, event)}
                        onKeyDown={(event) => {
                          if (event.key === 'Enter' || event.key === ' ') {
                            handleWordClick(token.verseIndex, token.wordIndex, event);
                          }
                        }}
                        sx={{
                          position: 'relative',
                          display: 'inline-block',
                          px: 0.1,
                          mx: 0.12,
                          color: isRead ? '#c62828' : '#211b14',
                          cursor: 'pointer',
                          transition: 'color 120ms ease',
                          '&::before': isActive ? {
                            content: '""',
                            position: 'absolute',
                            left: activeArrowLeft,
                            bottom: '-0.18em',
                            transform: 'translateX(-50%)',
                            width: 0,
                            height: 0,
                            borderLeft: '0.16em solid transparent',
                            borderRight: '0.16em solid transparent',
                            borderBottom: '0.24em solid #c62828',
                          } : {},
                          '&:hover': {
                            color: '#c62828',
                          },
                        }}
                      >
                        {token.text}
                      </Box>
                    );
                  })}
                </Box>
              ))}
            </Box>
          </Paper>
        </>
      )}

      <Drawer
        anchor="bottom"
        open={audioDrawerOpen}
        onClose={stopPlayback}
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
            Mukabele
          </Typography>
          <Box
            component="audio"
            ref={audioRef}
            src={audioUrl || undefined}
            controls
            autoPlay
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
            onPlay={() => setIsPaused(false)}
            onPause={() => setIsPaused(true)}
            onEnded={handleAudioEnded}
            onError={() => {
              stopPlayback();
              toast.error('Ayet sesi yüklenirken bir hata oluştu.');
            }}
            sx={{ flex: '1 1 auto', minWidth: 0, height: 38 }}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default MukabeleComponent;
