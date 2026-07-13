import { useCallback, useEffect, useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import { toast } from 'react-toastify';
import { fetchHadithCategories, fetchHadithDetail, fetchHadithsByCategory } from './api';

const HADITH_LANGUAGE = 'tr';
const HADITHS_PER_PAGE = 20;

const normalizeText = (value) => String(value || '').trim();
const HADITH_REFERENCE_SOURCE_LABELS = [
  { pattern: /صحيح البخاري/i, label: 'Sahih-i Buhârî' },
  { pattern: /صحيح مسلم/i, label: 'Sahih-i Müslim' },
  { pattern: /سنن أبي داود/i, label: 'Sünen-i Ebû Dâvûd' },
  { pattern: /جامع الترمذي|سنن الترمذي/i, label: 'Sünen-i Tirmizî' },
  { pattern: /سنن النسائي/i, label: 'Sünen-i Nesâî' },
  { pattern: /سنن ابن ماجه/i, label: 'Sünen-i İbn Mâce' },
  { pattern: /مسند أحمد/i, label: 'Müsned-i Ahmed' },
  { pattern: /موطأ مالك/i, label: 'Muvatta' },
];

const getReferenceHadithNumber = (line) => {
  const matches = [...String(line || '').matchAll(/\((\d+)\)/g)];
  return matches.length ? matches[matches.length - 1][1] : '';
};

const formatHadithReferenceSummary = (reference) => {
  const lines = normalizeText(reference)
    .split('\n')
    .map(item => item.trim())
    .filter(Boolean);

  const formatted = lines
    .map((line) => {
      const source = HADITH_REFERENCE_SOURCE_LABELS.find(item => item.pattern.test(line));
      if (!source) return null;

      const number = getReferenceHadithNumber(line);
      return number ? `${source.label} - ${number}` : source.label;
    })
    .filter(Boolean);

  return formatted.length > 0 ? formatted.join(' • ') : normalizeText(lines[0]);
};

const HadisComponent = () => {
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [hadiths, setHadiths] = useState([]);
  const [hadithsMeta, setHadithsMeta] = useState(null);
  const [hadithsLoading, setHadithsLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [selectedHadith, setSelectedHadith] = useState(null);
  const [hadithDetail, setHadithDetail] = useState(null);
  const [hadithDetailLoading, setHadithDetailLoading] = useState(false);
  const loadMoreRef = useRef(null);

  const loadHadiths = useCallback((category, page = 1, append = false) => {
    if (!category?.id) return Promise.resolve();

    if (append) {
      setLoadingMore(true);
    } else {
      setHadithsLoading(true);
    }

    return fetchHadithsByCategory({
      language: HADITH_LANGUAGE,
      categoryId: category.id,
      page,
      perPage: HADITHS_PER_PAGE,
    })
      .then((data) => {
        setHadiths((current) => (append ? [...current, ...data.data] : data.data));
        setHadithsMeta(data.meta);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Hadisler yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setHadithsLoading(false);
        setLoadingMore(false);
      });
  }, []);

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    setSelectedHadith(null);
    setHadithDetail(null);
    setHadiths([]);
    setHadithsMeta(null);
    loadHadiths(category, 1);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleHadithClick = (hadith) => {
    setSelectedHadith(hadith);
    setHadithDetail(null);
    setHadithDetailLoading(true);
    Promise.allSettled([
      fetchHadithDetail({ language: HADITH_LANGUAGE, id: hadith.id }),
      fetchHadithDetail({ language: 'ar', id: hadith.id }),
    ])
      .then(([turkishResult, arabicResult]) => {
        if (turkishResult.status !== 'fulfilled') {
          throw turkishResult.reason;
        }

        const turkishDetail = turkishResult.value;
        const arabicDetail = arabicResult.status === 'fulfilled' ? arabicResult.value : null;

        setHadithDetail({
          ...turkishDetail,
          reference: turkishDetail?.reference || arabicDetail?.reference || '',
          reference_ar: arabicDetail?.reference || turkishDetail?.reference_ar || '',
        });
      })
      .catch((error) => {
        console.error(error);
        toast.error('Hadis detayı yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setHadithDetailLoading(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
  };

  const resetToCategories = () => {
    setSelectedCategory(null);
    setSelectedHadith(null);
    setHadithDetail(null);
    setHadiths([]);
    setHadithsMeta(null);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  useEffect(() => {
    fetchHadithCategories(HADITH_LANGUAGE)
      .then((data) => {
        setCategories(data);
      })
      .catch((error) => {
        console.error(error);
        toast.error('Hadis kategorileri yüklenirken bir hata oluştu.');
      })
      .finally(() => {
        setCategoriesLoading(false);
      });
  }, []);

  useEffect(() => {
    const target = loadMoreRef.current;
    if (!target || !selectedCategory) return undefined;

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      const currentPage = Number(hadithsMeta?.current_page || 1);
      const lastPage = Number(hadithsMeta?.last_page || 1);
      const canLoadMore = currentPage < lastPage && !hadithsLoading && !loadingMore;

      if (entry.isIntersecting && canLoadMore) {
        loadHadiths(selectedCategory, currentPage + 1, true);
      }
    }, { rootMargin: '320px 0px' });

    observer.observe(target);
    return () => observer.disconnect();
  }, [hadithsLoading, hadithsMeta, loadHadiths, loadingMore, selectedCategory]);

  const currentPage = Number(hadithsMeta?.current_page || 1);
  const lastPage = Number(hadithsMeta?.last_page || 1);
  const otherHadiths = selectedHadith
    ? hadiths.filter((hadith) => String(hadith.id) !== String(selectedHadith.id))
    : hadiths;

  const renderBreadcrumbs = () => (
    <Breadcrumbs
      aria-label="Hadis gezinme yolu"
      sx={{ mb: 2, color: '#8e763f', fontWeight: 800 }}
    >
      <Link
        component="button"
        underline="hover"
        onClick={resetToCategories}
        sx={{
          border: 0,
          p: 0,
          background: 'transparent',
          color: '#6f7745',
          cursor: 'pointer',
          fontWeight: 900,
          font: 'inherit',
        }}
      >
        Hadis
      </Link>
      {selectedCategory && (
        <Link
          component="button"
          underline="hover"
          onClick={() => {
            setSelectedHadith(null);
            setHadithDetail(null);
            window.scrollTo({ top: 0, behavior: 'auto' });
          }}
          sx={{
            border: 0,
            p: 0,
            background: 'transparent',
            color: selectedHadith ? '#6f7745' : '#6f5a22',
            cursor: selectedHadith ? 'pointer' : 'default',
            fontWeight: 900,
            font: 'inherit',
          }}
        >
          {selectedCategory.title}
        </Link>
      )}
      {selectedHadith && (
        <Typography sx={{ color: '#6f5a22', fontWeight: 900 }}>
          Hadis #{selectedHadith.id}
        </Typography>
      )}
    </Breadcrumbs>
  );

  const renderHadithDetail = () => (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 1.75, sm: 2.5 },
        mb: 2.5,
        borderRadius: 1,
        backgroundColor: 'rgba(255, 253, 244, 0.96)',
        border: '1px solid rgba(142, 118, 63, 0.24)',
        boxShadow: '0 8px 24px rgba(47, 56, 35, 0.08)',
      }}
    >
      {hadithDetailLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
          <CircularProgress sx={{ color: '#6f7745' }} />
        </Box>
      ) : (
        <>
          <Typography variant="h5" sx={{ color: '#6f5a22', fontWeight: 900, mb: 1.5 }}>
            {hadithDetail?.title || selectedHadith?.title}
          </Typography>
          {normalizeText(hadithDetail?.hadeeth_ar) && (
            <Typography
              sx={{
                direction: 'rtl',
                textAlign: 'right',
                fontFamily: 'KFGQPC Uthman Taha Naskh, Traditional Arabic, serif',
                fontSize: { xs: '1.65rem', sm: '2.1rem' },
                lineHeight: 1.9,
                color: '#211b14',
                mb: 2,
              }}
            >
              {hadithDetail.hadeeth_ar}
            </Typography>
          )}
          <Typography
            sx={{
              color: '#2f312d',
              fontWeight: 700,
              lineHeight: 1.75,
              mb: 2,
              textAlign: 'justify',
              textAlignLast: 'left',
            }}
          >
            {hadithDetail?.hadeeth}
          </Typography>

          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {normalizeText(hadithDetail?.grade) && (
              <Typography sx={{ px: 1, py: 0.35, borderRadius: 999, backgroundColor: 'rgba(111, 119, 69, 0.12)', color: '#4f5b2f', fontWeight: 900 }}>
                {hadithDetail.grade}
              </Typography>
            )}
            {normalizeText(hadithDetail?.attribution) && (
              <Typography sx={{ px: 1, py: 0.35, borderRadius: 999, backgroundColor: 'rgba(142, 118, 63, 0.12)', color: '#6f5a22', fontWeight: 900 }}>
                {hadithDetail.attribution}
              </Typography>
            )}
            {normalizeText(hadithDetail?.reference) && (
              <Typography sx={{ px: 1, py: 0.35, borderRadius: 999, backgroundColor: 'rgba(84, 97, 61, 0.1)', color: '#4f4a33', fontWeight: 900 }}>
                {formatHadithReferenceSummary(hadithDetail.reference)}
              </Typography>
            )}
          </Box>

          {normalizeText(hadithDetail?.explanation) && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="h6" sx={{ color: '#6f5a22', fontWeight: 900, mb: 1 }}>
                Açıklaması / Şerhi
              </Typography>
              <Typography
                sx={{
                  color: '#2f312d',
                  lineHeight: 1.75,
                  textAlign: 'justify',
                  textAlignLast: 'left',
                }}
              >
                {hadithDetail.explanation}
              </Typography>
            </>
          )}

          {Array.isArray(hadithDetail?.hints) && hadithDetail.hints.length > 0 && (
            <>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="h6" sx={{ color: '#6f5a22', fontWeight: 900, mb: 1 }}>
                Hadisten Çıkarılan Hükümler
              </Typography>
              <Box sx={{ display: 'grid', gap: 0.85, pl: { xs: 0.5, sm: 1.5 } }}>
                {hadithDetail.hints.map((hint, index) => (
                  <Box
                    key={`${hint}-${index}`}
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: '28px 1fr',
                      gap: 1,
                      alignItems: 'start',
                      p: 1,
                      borderRadius: 1,
                      backgroundColor: 'rgba(111, 119, 69, 0.07)',
                      border: '1px solid rgba(111, 119, 69, 0.12)',
                    }}
                  >
                    <Box
                      aria-hidden="true"
                      sx={{
                        width: 24,
                        height: 24,
                        borderRadius: '50%',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mt: 0.1,
                        color: '#fff8d9',
                        backgroundColor: '#6f7745',
                        fontWeight: 900,
                        fontSize: '0.82rem',
                      }}
                    >
                      ✓
                    </Box>
                    <Typography
                      sx={{
                        color: '#2f312d',
                        lineHeight: 1.65,
                        textAlign: 'justify',
                        textAlignLast: 'left',
                      }}
                    >
                      {normalizeText(hint)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </>
          )}
        </>
      )}
    </Paper>
  );

  return (
    <Box
      sx={{
        px: { xs: 1.25, sm: 3 },
        py: { xs: 2, sm: 3 },
        maxWidth: 1180,
        mx: 'auto',
      }}
    >
      {!selectedCategory && (
        <Paper
          elevation={2}
          sx={{
            mb: 3,
            p: { xs: 2, sm: 3 },
            borderRadius: 1,
            color: '#4f4a33',
            backgroundColor: 'rgba(255, 253, 244, 0.92)',
            border: '1px solid rgba(142, 118, 63, 0.22)',
            boxShadow: '0 8px 24px rgba(47, 56, 35, 0.08)',
          }}
        >
          <Typography variant="h4" sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.75 }}>
            Hadisler
          </Typography>
          <Typography sx={{ fontWeight: 600, color: '#62675a' }}>
            Türkçe HadeethEnc kategorilerinden hadisleri inceleyin.
          </Typography>
          <Typography variant="caption" sx={{ display: 'block', mt: 1.25, color: '#8e763f', fontWeight: 700 }}>
            Kaynak: HadeethEnc.com. İçerik üzerinde değişiklik yapılmadan gösterilir.
          </Typography>
        </Paper>
      )}

      {selectedCategory && renderBreadcrumbs()}

      {!selectedCategory && (
        <>
          <Typography variant="h6" sx={{ color: '#6f5a22', fontWeight: 900, mb: 1.5 }}>
            Kategoriler
          </Typography>
          {categoriesLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
              <CircularProgress sx={{ color: '#6f7745' }} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(3, minmax(0, 1fr))',
                },
                gap: 1.5,
              }}
            >
              {categories.map((category) => (
                <Paper
                  key={category.id}
                  component="button"
                  type="button"
                  elevation={1}
                  onClick={() => handleCategoryClick(category)}
                  sx={{
                    p: 2,
                    minHeight: 118,
                    textAlign: 'left',
                    cursor: 'pointer',
                    borderRadius: 1,
                    border: '1px solid rgba(142, 118, 63, 0.18)',
                    backgroundColor: 'rgba(255, 253, 244, 0.92)',
                    color: '#4f4a33',
                    transition: 'transform 140ms ease, box-shadow 140ms ease, border-color 140ms ease',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                      borderColor: '#8e763f',
                      boxShadow: '0 8px 18px rgba(47, 56, 35, 0.14)',
                    },
                  }}
                >
                  <Typography sx={{ fontWeight: 900, color: '#4f5b2f', mb: 1 }}>
                    {category.title}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#8e763f', fontWeight: 800 }}>
                    {category.hadeeths_count} hadis
                  </Typography>
                </Paper>
              ))}
            </Box>
          )}
        </>
      )}

      {selectedCategory && (
        <>
          {selectedHadith && renderHadithDetail()}

          <Paper
            elevation={2}
            sx={{
              p: { xs: 1.5, sm: 2 },
              borderRadius: 1,
              backgroundColor: 'rgba(255, 253, 244, 0.94)',
              border: '1px solid rgba(142, 118, 63, 0.2)',
            }}
          >
            <Typography variant="h6" sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.4 }}>
              {selectedHadith ? 'Daha Fazla' : selectedCategory.title}
            </Typography>
            {hadithsMeta && (
              <Typography variant="body2" sx={{ color: '#62675a', fontWeight: 700, mb: 1.25 }}>
                Bu kategoride toplam {hadithsMeta.total_items} hadis
              </Typography>
            )}
            <Divider sx={{ mb: 1.5 }} />

            {hadithsLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 5 }}>
                <CircularProgress sx={{ color: '#6f7745' }} />
              </Box>
            ) : (
              <Box sx={{ display: 'grid', gap: 1 }}>
                {otherHadiths.map((hadith, index) => (
                  <Paper
                    key={hadith.id}
                    component="button"
                    type="button"
                    elevation={0}
                    onClick={() => handleHadithClick(hadith)}
                    sx={{
                      p: 1.5,
                      borderRadius: 1,
                      textAlign: 'left',
                      cursor: 'pointer',
                      border: String(selectedHadith?.id) === String(hadith.id)
                        ? '2px solid #6f7745'
                        : '1px solid rgba(142, 118, 63, 0.14)',
                      backgroundColor: '#fffdf4',
                      '&:hover': {
                        borderColor: '#8e763f',
                        boxShadow: '0 6px 16px rgba(47, 56, 35, 0.12)',
                      },
                    }}
                  >
                    <Typography variant="caption" sx={{ color: '#8e763f', fontWeight: 900 }}>
                      #{hadith.id}
                    </Typography>
                    <Typography sx={{ color: '#2f312d', fontWeight: 700, lineHeight: 1.55 }}>
                      {index + 1}. {hadith.title}
                    </Typography>
                  </Paper>
                ))}
                {otherHadiths.length === 0 && (
                  <Typography sx={{ py: 3, textAlign: 'center', color: '#62675a', fontWeight: 700 }}>
                    Bu kategoride hadis bulunamadı.
                  </Typography>
                )}
              </Box>
            )}

            <Box ref={loadMoreRef} sx={{ minHeight: 24 }} />
            {loadingMore && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={26} sx={{ color: '#6f7745' }} />
              </Box>
            )}
            {!loadingMore && hadithsMeta && currentPage >= lastPage && hadiths.length > 0 && (
              <Typography variant="body2" sx={{ textAlign: 'center', color: '#8e763f', fontWeight: 800, py: 2 }}>
                Bu kategorideki tüm hadisler yüklendi.
              </Typography>
            )}
          </Paper>
        </>
      )}
    </Box>
  );
};

export default HadisComponent;
