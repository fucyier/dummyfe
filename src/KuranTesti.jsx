import { useMemo, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Collapse from '@mui/material/Collapse';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import LinearProgress from '@mui/material/LinearProgress';
import Link from '@mui/material/Link';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import NavigateBeforeIcon from '@mui/icons-material/NavigateBefore';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import QuizOutlinedIcon from '@mui/icons-material/QuizOutlined';
import ReplayIcon from '@mui/icons-material/Replay';
import { KURAN_TESTI_SORULARI } from './kuranTestiSorulari';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

const KuranTesti = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealedQuestions, setRevealedQuestions] = useState({});
  const questionAreaRef = useRef(null);

  const currentQuestion = KURAN_TESTI_SORULARI[currentIndex];
  const selectedIndex = answers[currentQuestion.id];
  const isRevealed = Boolean(revealedQuestions[currentQuestion.id]);
  const answeredCount = Object.keys(answers).length;
  const revealedCount = Object.keys(revealedQuestions).length;
  const correctCount = useMemo(
    () => KURAN_TESTI_SORULARI.reduce((total, question) => (
      revealedQuestions[question.id] && answers[question.id] === question.correctIndex
        ? total + 1
        : total
    ), 0),
    [answers, revealedQuestions],
  );

  const goToQuestion = (nextIndex) => {
    const boundedIndex = Math.max(0, Math.min(KURAN_TESTI_SORULARI.length - 1, nextIndex));
    setCurrentIndex(boundedIndex);
    window.requestAnimationFrame(() => {
      questionAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const handleSelectOption = (optionIndex) => {
    if (isRevealed) return;
    setAnswers(current => ({ ...current, [currentQuestion.id]: optionIndex }));
  };

  const handleReveal = () => {
    setRevealedQuestions(current => ({ ...current, [currentQuestion.id]: true }));
  };

  const handleReset = () => {
    setAnswers({});
    setRevealedQuestions({});
    setCurrentIndex(0);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getOptionStyles = (optionIndex) => {
    const isSelected = selectedIndex === optionIndex;
    const isCorrect = currentQuestion.correctIndex === optionIndex;

    if (isRevealed && isCorrect) {
      return {
        borderColor: '#5f713f',
        backgroundColor: 'rgba(95, 113, 63, 0.14)',
        color: '#334020',
        '&:hover': { borderColor: '#5f713f', backgroundColor: 'rgba(95, 113, 63, 0.14)' },
      };
    }

    if (isRevealed && isSelected) {
      return {
        borderColor: '#b34b42',
        backgroundColor: 'rgba(179, 75, 66, 0.1)',
        color: '#7d2d27',
        '&:hover': { borderColor: '#b34b42', backgroundColor: 'rgba(179, 75, 66, 0.1)' },
      };
    }

    if (isSelected) {
      return {
        borderColor: '#8e763f',
        backgroundColor: '#fff8d9',
        color: '#4d421f',
        '&:hover': { borderColor: '#8e763f', backgroundColor: '#fff4c1' },
      };
    }

    return {
      borderColor: 'rgba(111, 119, 69, 0.3)',
      backgroundColor: '#fffef9',
      color: '#2f312d',
      '&:hover': { borderColor: '#8e763f', backgroundColor: 'rgba(255, 248, 217, 0.45)' },
    };
  };

  return (
    <Box
      component="main"
      sx={{
        minHeight: 'calc(100vh - 48px)',
        px: { xs: 1.25, sm: 2.5 },
        py: { xs: 2, sm: 3 },
        backgroundImage: 'url(/images/islamic-pattern.png)',
        backgroundRepeat: 'repeat',
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 980, mx: 'auto' }}>
        <Paper
          elevation={1}
          sx={{
            p: { xs: 2, sm: 3 },
            mb: 2,
            textAlign: 'center',
            border: '1px solid rgba(142, 118, 63, 0.22)',
            backgroundColor: 'rgba(255, 253, 244, 0.96)',
          }}
        >
          <QuizOutlinedIcon sx={{ fontSize: 38, color: '#6f7745', mb: 0.5 }} />
          <Typography component="h1" variant="h4" sx={{ fontWeight: 900, color: '#6f5a22' }}>
            Kur'an Testi
          </Typography>
          <Typography sx={{ mt: 0.75, color: '#56594f', fontWeight: 600 }}>
            Sureler, ayetler, iman esasları, peygamberler tarihi ve siyer üzerine 200 soruluk bilgi testi
          </Typography>
        </Paper>

        <Paper
          elevation={2}
          ref={questionAreaRef}
          sx={{
            scrollMarginTop: 64,
            overflow: 'hidden',
            border: '1px solid rgba(142, 118, 63, 0.24)',
            backgroundColor: 'rgba(255, 253, 244, 0.98)',
          }}
        >
          <Box sx={{ p: { xs: 1.5, sm: 2.25 }, pb: 1.25 }}>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1.25}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
            >
              <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                <Chip
                  label={`Soru ${currentIndex + 1} / ${KURAN_TESTI_SORULARI.length}`}
                  sx={{ backgroundColor: '#6f7745', color: '#fffdf4', fontWeight: 900 }}
                />
                <Chip
                  label={currentQuestion.category}
                  variant="outlined"
                  sx={{ borderColor: '#a38a4d', color: '#6f5a22', fontWeight: 800 }}
                />
              </Stack>

              <FormControl size="small" sx={{ minWidth: { xs: '100%', sm: 130 } }}>
                <Select
                  value={currentIndex}
                  onChange={event => goToQuestion(Number(event.target.value))}
                  aria-label="Soru seç"
                  sx={{ backgroundColor: '#fffef9', fontWeight: 800 }}
                >
                  {KURAN_TESTI_SORULARI.map((question, index) => (
                    <MenuItem key={question.id} value={index}>
                      Soru {index + 1}{revealedQuestions[question.id] ? ' ✓' : ''}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={((currentIndex + 1) / KURAN_TESTI_SORULARI.length) * 100}
              sx={{
                mt: 1.5,
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(111, 119, 69, 0.14)',
                '& .MuiLinearProgress-bar': { backgroundColor: '#8e763f' },
              }}
            />
          </Box>

          <Divider />

          <Box sx={{ p: { xs: 1.5, sm: 2.5 } }}>
            <Typography
              component="h2"
              sx={{
                mb: 2.25,
                textAlign: 'left',
                color: '#25271f',
                fontSize: { xs: '1.12rem', sm: '1.32rem' },
                lineHeight: 1.55,
                fontWeight: 900,
              }}
            >
              {currentQuestion.question}
            </Typography>

            <Stack spacing={1.1}>
              {currentQuestion.options.map((option, optionIndex) => (
                <Button
                  key={option}
                  variant="outlined"
                  disabled={isRevealed}
                  onClick={() => handleSelectOption(optionIndex)}
                  sx={{
                    justifyContent: 'flex-start',
                    gap: 1.25,
                    minHeight: 52,
                    px: 1.5,
                    py: 1,
                    borderRadius: 1.5,
                    textAlign: 'left',
                    textTransform: 'none',
                    fontSize: { xs: '0.94rem', sm: '1rem' },
                    lineHeight: 1.45,
                    fontWeight: selectedIndex === optionIndex ? 900 : 700,
                    opacity: '1 !important',
                    '&.Mui-disabled': {
                      opacity: 1,
                      color: currentQuestion.correctIndex === optionIndex
                        ? '#334020'
                        : selectedIndex === optionIndex
                          ? '#7d2d27'
                          : '#66695f',
                      borderColor: currentQuestion.correctIndex === optionIndex
                        ? '#5f713f'
                        : selectedIndex === optionIndex
                          ? '#b34b42'
                          : 'rgba(111, 119, 69, 0.22)',
                      backgroundColor: currentQuestion.correctIndex === optionIndex
                        ? 'rgba(95, 113, 63, 0.14)'
                        : selectedIndex === optionIndex
                          ? 'rgba(179, 75, 66, 0.1)'
                          : '#fffef9',
                    },
                    ...getOptionStyles(optionIndex),
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      flex: '0 0 auto',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 30,
                      height: 30,
                      borderRadius: '50%',
                      backgroundColor: isRevealed && currentQuestion.correctIndex === optionIndex
                        ? '#5f713f'
                        : selectedIndex === optionIndex
                          ? '#8e763f'
                          : 'rgba(111, 119, 69, 0.1)',
                      color: selectedIndex === optionIndex || (isRevealed && currentQuestion.correctIndex === optionIndex)
                        ? '#fff'
                        : '#5b6241',
                      fontWeight: 900,
                    }}
                  >
                    {OPTION_LABELS[optionIndex]}
                  </Box>
                  <Box component="span" sx={{ flex: 1 }}>
                    {option}
                  </Box>
                  {isRevealed && currentQuestion.correctIndex === optionIndex && (
                    <CheckCircleOutlineIcon sx={{ flex: '0 0 auto', color: '#5f713f' }} />
                  )}
                </Button>
              ))}
            </Stack>

            <Button
              variant="contained"
              onClick={handleReveal}
              sx={{
                mt: 2,
                minWidth: { xs: '100%', sm: 180 },
                backgroundColor: '#6f7745',
                color: '#fffdf4',
                fontWeight: 900,
                textTransform: 'none',
                '&:hover': { backgroundColor: '#5d6639' },
              }}
            >
              {isRevealed ? 'Cevap Gösterildi' : 'Cevabı Gör'}
            </Button>

            <Collapse in={isRevealed} unmountOnExit>
              <Paper
                elevation={0}
                role="status"
                sx={{
                  mt: 2,
                  p: { xs: 1.5, sm: 2 },
                  textAlign: 'left',
                  borderLeft: '5px solid #6f7745',
                  backgroundColor: '#f4f5ea',
                }}
              >
                <Typography sx={{ color: '#45522e', fontWeight: 900, mb: 0.75 }}>
                  Doğru cevap: {OPTION_LABELS[currentQuestion.correctIndex]}) {currentQuestion.options[currentQuestion.correctIndex]}
                </Typography>
                <Typography sx={{ color: '#31342d', lineHeight: 1.75, fontWeight: 600 }}>
                  {currentQuestion.explanation}
                </Typography>
                <Chip
                  size="small"
                  label={`Referans: ${currentQuestion.reference}`}
                  sx={{ mt: 1.25, backgroundColor: '#fffdf4', color: '#6f5a22', fontWeight: 800 }}
                />
              </Paper>
            </Collapse>
          </Box>

          <Divider />

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            alignItems="center"
            justifyContent="space-between"
            sx={{ p: { xs: 1.5, sm: 2 } }}
          >
            <Button
              startIcon={<NavigateBeforeIcon />}
              disabled={currentIndex === 0}
              onClick={() => goToQuestion(currentIndex - 1)}
              sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, color: '#59643d', fontWeight: 900, textTransform: 'none' }}
            >
              Önceki Soru
            </Button>

            <Typography sx={{ color: '#626654', fontSize: '0.9rem', fontWeight: 800 }}>
              {answeredCount} cevaplandı · {revealedCount} açıklandı · {correctCount} doğru
            </Typography>

            {currentIndex < KURAN_TESTI_SORULARI.length - 1 ? (
              <Button
                endIcon={<NavigateNextIcon />}
                onClick={() => goToQuestion(currentIndex + 1)}
                sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, color: '#59643d', fontWeight: 900, textTransform: 'none' }}
              >
                Sonraki Soru
              </Button>
            ) : (
              <Button
                startIcon={<ReplayIcon />}
                onClick={handleReset}
                sx={{ alignSelf: { xs: 'stretch', sm: 'auto' }, color: '#59643d', fontWeight: 900, textTransform: 'none' }}
              >
                Testi Baştan Başlat
              </Button>
            )}
          </Stack>
        </Paper>

        <Typography
          component="p"
          sx={{ mt: 1.5, px: 1, textAlign: 'center', color: '#6b6c61', fontSize: '0.78rem' }}
        >
          İçerik kontrolünde Kur'an ayetleri,{' '}
          <Link
            href="https://kuran.diyanet.gov.tr/Tefsir/"
            target="_blank"
            rel="noreferrer"
            sx={{ color: '#59643d', fontWeight: 800 }}
          >
            Diyanet İşleri Başkanlığı Kur'an Yolu tefsiri
          </Link>{' '}
          ile Diyanet'in resmî iman esasları ve siyer yayınları esas alınmıştır.
        </Typography>
      </Box>
    </Box>
  );
};

export default KuranTesti;
