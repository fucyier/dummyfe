import Box from '@mui/material/Box';
import CardActionArea from '@mui/material/CardActionArea';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Zoom from '@mui/material/Zoom';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';

const PRAYERS = [
  {
    id: 'subhaneke',
    title: 'Sübhâneke',
    subtitle: 'Namazın başlangıcında okunur',
    arabic: 'سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ، وَتَبَارَكَ اسْمُكَ، وَتَعَالٰى جَدُّكَ، وَلَا إِلٰهَ غَيْرُكَ',
    latin: 'Sübhâneke allâhümme ve bi hamdik. Ve tebârekesmük. Ve teâlâ ceddük. Ve lâ ilâhe gayrük.',
    meaning: 'Allah’ım! Seni hamdinle tesbih ederim. Senin adın mübarektir. Şanın yücedir. Senden başka ilah yoktur.',
  },
  {
    id: 'tahiyyat',
    title: 'Ettehiyyâtü',
    subtitle: 'Namazda oturuşlarda okunur',
    arabic: 'اَلتَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ. اَلسَّلَامُ عَلَيْكَ اَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ. اَلسَّلَامُ عَلَيْنَا وَعَلٰى عِبَادِ اللّٰهِ الصَّالِحِينَ. اَشْهَدُ اَنْ لَا اِلٰهَ اِلَّا اللّٰهُ وَاَشْهَدُ اَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    latin: 'Ettehiyyâtü lillâhi vessalavâtü vettayyibât. Esselâmü aleyke eyyühennebiyyü ve rahmetullâhi ve berakâtüh. Esselâmü aleynâ ve alâ ibâdillâhis-sâlihîn. Eşhedü en lâ ilâhe illallâh ve eşhedü enne Muhammeden abdühû ve rasûlüh.',
    meaning: 'Bütün hürmetler, dualar ve güzel sözler Allah içindir. Ey Peygamber! Allah’ın selamı, rahmeti ve bereketi senin üzerine olsun. Selam bizim ve Allah’ın salih kullarının üzerine olsun. Şahitlik ederim ki Allah’tan başka ilah yoktur; yine şahitlik ederim ki Muhammed O’nun kulu ve resulüdür.',
  },
  {
    id: 'salli',
    title: 'Allahümme Salli',
    subtitle: 'Son oturuşta salavat olarak okunur',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلٰى اِبْرَاهِيمَ وَعَلٰى اٰلِ اِبْرَاهِيمَ اِنَّكَ حَمِيدٌ مَجِيدٌ',
    latin: 'Allâhümme salli alâ Muhammedin ve alâ âli Muhammed. Kemâ salleyte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
    meaning: 'Allah’ım! İbrahim’e ve ailesine rahmet ettiğin gibi Muhammed’e ve Muhammed’in ailesine de rahmet eyle. Şüphesiz sen övülmeye layık ve yücesin.',
  },
  {
    id: 'barik',
    title: 'Allahümme Bârik',
    subtitle: 'Son oturuşta salavat olarak okunur',
    arabic: 'اَللّٰهُمَّ بَارِكْ عَلٰى مُحَمَّدٍ وَعَلٰى اٰلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلٰى اِبْرَاهِيمَ وَعَلٰى اٰلِ اِبْرَاهِيمَ اِنَّكَ حَمِيدٌ مَجِيدٌ',
    latin: 'Allâhümme bârik alâ Muhammedin ve alâ âli Muhammed. Kemâ bârekte alâ İbrâhîme ve alâ âli İbrâhîm. İnneke hamîdün mecîd.',
    meaning: 'Allah’ım! İbrahim’e ve ailesine bereket verdiğin gibi Muhammed’e ve Muhammed’in ailesine de bereket ver. Şüphesiz sen övülmeye layık ve yücesin.',
  },
  {
    id: 'rabbena-atina',
    title: 'Rabbenâ Âtinâ',
    subtitle: 'Namaz sonunda okunan dua',
    arabic: 'رَبَّنَا اٰتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْاٰخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
    latin: 'Rabbenâ âtinâ fid-dünyâ haseneten ve fil-âhireti haseneten ve kınâ azâben-nâr.',
    meaning: 'Rabbimiz! Bize dünyada iyilik, ahirette de iyilik ver ve bizi ateş azabından koru.',
  },
  {
    id: 'rabbenağfirli',
    title: 'Rabbenâğfirli',
    subtitle: 'Namaz sonunda okunan dua',
    arabic: 'رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
    latin: 'Rabbenağfirlî ve li-vâlideyye ve lil-mü’minîne yevme yekûmül hisâb.',
    meaning: 'Rabbimiz! Hesabın görüleceği gün beni, anne babamı ve bütün müminleri bağışla.',
  },
  {
    id: 'kunut-1',
    title: 'Kunut Duası 1',
    subtitle: 'Vitir namazında okunur',
    arabic: 'اَللّٰهُمَّ اِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنَسْتَهْدِيكَ وَنُؤْمِنُ بِكَ وَنَتُوبُ اِلَيْكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ كُلَّهُ نَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ',
    latin: 'Allâhümme innâ nesteînüke ve nestağfirüke ve nestehdîk. Ve nü’minü bike ve netûbü ileyk. Ve netevekkelü aleyke ve nüsnî aleykel hayra külleh. Neşküruke ve lâ nekfüruk. Ve nahleu ve netrükü men yefcüruk.',
    meaning: 'Allah’ım! Senden yardım ister, bağışlanma diler ve hidayet isteriz. Sana iman eder, sana tövbe eder ve sana güveniriz. Bütün hayırlarla seni överiz. Sana şükreder, nankörlük etmeyiz. Sana karşı gelenlerden uzak dururuz.',
  },
  {
    id: 'kunut-2',
    title: 'Kunut Duası 2',
    subtitle: 'Vitir namazında okunur',
    arabic: 'اَللّٰهُمَّ اِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَاِلَيْكَ نَسْعٰى وَنَحْفِدُ نَرْجُو رَحْمَتَكَ وَنَخْشٰى عَذَابَكَ اِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ',
    latin: 'Allâhümme iyyâke na’büdü ve leke nüsallî ve nescüd. Ve ileyke nes’â ve nahfid. Nercû rahmeteke ve nahşâ azâbek. İnne azâbeke bil-küffâri mülhık.',
    meaning: 'Allah’ım! Yalnız sana kulluk ederiz; senin için namaz kılar ve secde ederiz. Sana koşar, sana yöneliriz. Rahmetini umar, azabından korkarız. Şüphesiz azabın inkârcılara ulaşacaktır.',
  },
];

const TASBIHAT = [
  {
    id: 'selam-duasi',
    order: 1,
    title: 'Selam Duası',
    subtitle: 'Farz namazında selamdan sonra okunur',
    arabic: 'اَللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
    latin: 'Allahümme entes-selâm ve minkes-selâm. Tebârekte yâ zel-celâli vel-ikrâm.',
    meaning: 'Allah’ım! Selam sensin, selamet sendendir. Ey celal ve ikram sahibi, sen ne yücesin.',
  },
  {
    id: 'salavat',
    order: 2,
    title: 'Salavat',
    subtitle: 'Selam Duası sonrasında okunur',
    arabic: 'اَللّٰهُمَّ صَلِّ عَلٰى سَيِّدِنَا مُحَمَّدٍ وَعَلٰى آلِ سَيِّدِنَا مُحَمَّدٍ',
    latin: 'Allahümme salli alâ seyyidinâ Muhammedin ve alâ âli seyyidinâ Muhammed.',
    meaning: 'Allah’ım! Efendimiz Muhammed’e ve onun ailesine rahmet eyle.',
  },
  {
    id: 'toplu-zikir',
    order: 3,
    title: 'Namaz Sonrası Zikri',
    subtitle: 'Salavattan sonra okunur',
    arabic: 'سُبْحَانَ اللّٰهِ وَالْحَمْدُ لِلّٰهِ وَلَا إِلٰهَ إِلَّا اللّٰهُ وَاللّٰهُ أَكْبَرُ وَلَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللّٰهِ الْعَلِيِّ الْعَظِيمِ',
    latin: 'Subhânallâhi ve’l-hâmdü lillâhi ve lâ ilâhe illallâhü vallâhu ekber ve lâ hâvle ve lâ kuvvete illâ billâhi’l-aliyyi’l-azîm.',
    meaning: 'Allah her türlü eksiklikten uzaktır; hamd Allah’adır; Allah’tan başka ilah yoktur; Allah en büyüktür. Güç ve kuvvet ancak yüce ve büyük Allah’ın yardımıyladır.',
  },
  {
    id: 'ayetel-kursi',
    order: 4,
    title: 'Ayetel Kürsi',
    subtitle: 'Namaz sonrası tavsiye edilen okumalardandır',
    arabic: 'اللّٰهُ لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌۚ لَهُ مَا فِي السَّمٰوَاتِ وَمَا فِي الْأَرْضِۗ مَنْ ذَا الَّذِي يَشْفَعُ عِنْدَهُ إِلَّا بِإِذْنِهِۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْۖ وَلَا يُحِيطُونَ بِشَيْءٍ مِنْ عِلْمِهِ إِلَّا بِمَا شَاءَۚ وَسِعَ كُرْسِيُّهُ السَّمٰوَاتِ وَالْأَرْضَۖ وَلَا يَؤُودُهُ حِفْظُهُمَاۚ وَهُوَ الْعَلِيُّ الْعَظِيمُ',
    latin: 'Allâhu lâ ilâhe illâ hüvel hayyül kayyûm. Lâ te’huzühû sinetün velâ nevm. Lehû mâ fis-semâvâti ve mâ fil-ard. Men zellezî yeşfeu indehû illâ bi-iznih. Ya’lemu mâ beyne eydîhim ve mâ halfehüm. Ve lâ yuhîtûne bi-şey’in min ilmihî illâ bimâ şâe. Vesie kürsiyyühüs-semâvâti vel-ard. Ve lâ yeûdühû hıfzuhümâ. Ve hüvel aliyyül azîm.',
    meaning: 'Allah, O’ndan başka ilah yoktur; diridir ve her şeyi ayakta tutandır. O’nu ne uyuklama ne de uyku tutar. Göklerde ve yerde ne varsa hepsi O’nundur. İzni olmadan O’nun katında şefaat edecek kimdir? O, kullarının önlerindekini ve arkalarındakini bilir. Onlar O’nun ilminden, O’nun dilediği kadarından başka hiçbir şeyi kavrayamazlar. O’nun kürsüsü gökleri ve yeri kuşatmıştır. Onları koruyup gözetmek O’na zor gelmez. O, yücedir, büyüktür.',
  },
  {
    id: 'otuz-uc-tesbih',
    order: 5,
    title: 'Otuz Üç Tesbih',
    subtitle: 'Ayetel Kürsi sonrasında 33’er defa okunur',
    arabic: 'سُبْحَانَ اللّٰهِ • اَلْحَمْدُ لِلّٰهِ • اَللّٰهُ أَكْبَرُ',
    latin: 'Sübhânallah (33 defa), Elhamdülillah (33 defa), Allahü ekber (33 defa).',
    meaning: 'Allah her türlü eksiklikten uzaktır; hamd Allah’adır; Allah en büyüktür. Bu zikirler namaz sonrası tesbihatın temelini oluşturur.',
  },
  {
    id: 'tevhid-zikri',
    order: 6,
    title: 'Tevhid Zikri',
    subtitle: 'Tesbihatı tamamlamak için okunur',
    arabic: 'لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُۚ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلٰى كُلِّ شَيْءٍ قَدِيرٌ',
    latin: 'Lâ ilâhe illallâhu vahdehû lâ şerîke leh. Lehül mülkü ve lehül hamdü ve hüve alâ külli şey’in kadîr.',
    meaning: 'Allah’tan başka ilah yoktur; O tektir, ortağı yoktur. Mülk O’nundur, hamd O’nadır ve O her şeye gücü yetendir.',
  },
];

const SOURCE_LINKS = [
  {
    label: 'Diyanet PDF - Namaz Duaları',
    href: 'https://webdosyasp.diyanet.gov.tr/muftuluk/UserFiles/adana/Ilceler/pozanti/UserFiles/Files/En%20Son%20NAMAZ%20SURELER%C4%B01_a08ceceb-1d6f-47a9-b045-4e4ade6f9ecb.pdf',
  },
  {
    label: 'Diyanet TV - Namaz Duaları',
    href: 'https://www.diyanet.tv/kuran-ogreniyorum-2021/video/namaz-dualari--kuran-ogreniyorum-28-bolum',
  },
  {
    label: 'Diyanet Haber - Namaz içinde okunacak dualar',
    href: 'https://www.diyanethaber.com.tr/namaz-icinde-okunacak-dualar',
  },
  {
    label: 'Sıralama Kaynağı - Diyanet Temel Dinî Bilgiler',
    href: 'https://dijital.diyanet.gov.tr/File/Download?id=4218&path=4218_1.pdf',
  },
];

const DuaComponent = () => (
  <Box
    sx={{
      minHeight: 'calc(100vh - 48px)',
      px: { xs: 1.5, sm: 3 },
      py: { xs: 2.5, sm: 4 },
      backgroundColor: '#f8f5e8',
      backgroundImage: `
        linear-gradient(rgba(248, 245, 232, 0.42), rgba(248, 245, 232, 0.42)),
        url('/images/islamic-pattern.png')
      `,
      backgroundSize: 'auto, 620px auto',
      color: '#2f312d',
    }}
  >
    <Box sx={{ maxWidth: 1180, mx: 'auto' }}>
      <Paper
        elevation={0}
        sx={{
          mb: 3,
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(255, 253, 244, 0.98), rgba(245, 239, 214, 0.92))',
          border: '1px solid rgba(142, 118, 63, 0.22)',
          boxShadow: '0 12px 32px rgba(47, 56, 35, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', textAlign: 'center' }}>
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: '#fff8d9',
              backgroundColor: '#6f7745',
              boxShadow: '0 8px 18px rgba(111, 119, 69, 0.22)',
            }}
          >
            <AutoStoriesIcon />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#6f5a22', fontWeight: 900, lineHeight: 1.15 }}>
              Namaz Duaları
            </Typography>
            <Typography sx={{ color: '#4f4a33', fontWeight: 700, mt: 0.5 }}>
              Namazda okunan temel duaları Arapça metin, Latin okunuş ve Türkçe anlamıyla inceleyin.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        {PRAYERS.map((dua, index) => (
          <Zoom key={dua.id} in timeout={220 + (index % 6) * 45}>
            <Paper
              elevation={1}
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                backgroundColor: 'rgba(255, 253, 244, 0.97)',
                border: '1px solid rgba(142, 118, 63, 0.22)',
                boxShadow: '0 10px 26px rgba(47, 56, 35, 0.08)',
                transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 34px rgba(47, 56, 35, 0.12)',
                  borderColor: 'rgba(111, 119, 69, 0.34)',
                },
              }}
            >
              <CardActionArea component="article" sx={{ p: { xs: 1.75, sm: 2.25 }, cursor: 'default' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#6f5a22', fontWeight: 900 }}>
                      {dua.title}
                    </Typography>
                    <Typography sx={{ color: '#6f7745', fontWeight: 800, fontSize: '0.92rem' }}>
                      {dua.subtitle}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<KeyboardArrowRightIcon />}
                    label="Dua"
                    size="small"
                    sx={{ color: '#fff8d9', backgroundColor: '#6f7745', fontWeight: 900, '& .MuiChip-icon': { color: '#fff8d9' } }}
                  />
                </Box>

                <Typography
                  sx={{
                    direction: 'rtl',
                    textAlign: 'right',
                    fontFamily: 'KFGQPC Uthman Taha Naskh, Traditional Arabic, serif',
                    fontSize: { xs: '1.65rem', sm: '2rem' },
                    lineHeight: 1.9,
                    color: '#211b14',
                    mb: 1.5,
                  }}
                >
                  {dua.arabic}
                </Typography>

                <Divider sx={{ my: 1.35, borderColor: 'rgba(142, 118, 63, 0.18)' }} />

                <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.5 }}>
                  Latin Okunuşu
                </Typography>
                <Typography sx={{ color: '#2f312d', lineHeight: 1.7, fontWeight: 700, mb: 1.35 }}>
                  {dua.latin}
                </Typography>

                <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.5 }}>
                  Anlamı
                </Typography>
                <Typography sx={{ color: '#2f312d', lineHeight: 1.75, textAlign: 'justify', textAlignLast: 'left' }}>
                  {dua.meaning}
                </Typography>
              </CardActionArea>
            </Paper>
          </Zoom>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          mt: 3.5,
          mb: 2,
          p: { xs: 2, sm: 2.5 },
          borderRadius: 2,
          background: 'linear-gradient(135deg, rgba(255, 253, 244, 0.98), rgba(245, 239, 214, 0.92))',
          border: '1px solid rgba(142, 118, 63, 0.22)',
          boxShadow: '0 12px 32px rgba(47, 56, 35, 0.08)',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, flexWrap: 'wrap', textAlign: 'center' }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              color: '#fff8d9',
              backgroundColor: '#6f7745',
              boxShadow: '0 8px 18px rgba(111, 119, 69, 0.22)',
            }}
          >
            <AutoStoriesIcon />
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" sx={{ color: '#6f5a22', fontWeight: 900, lineHeight: 1.15 }}>
              Namaz Tesbihatı
            </Typography>
            <Typography sx={{ color: '#4f4a33', fontWeight: 700, mt: 0.5 }}>
              Sıra: Selam Duası, salavat, namaz sonrası zikri, Ayetel Kürsi, 33’er tesbih ve Tevhid zikri.
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 2 }}>
        {[...TASBIHAT].sort((first, second) => first.order - second.order).map((dua, index) => (
          <Zoom key={dua.id} in timeout={220 + (index % 4) * 45}>
            <Paper
              elevation={1}
              sx={{
                overflow: 'hidden',
                borderRadius: 2,
                backgroundColor: 'rgba(255, 253, 244, 0.97)',
                border: '1px solid rgba(142, 118, 63, 0.22)',
                boxShadow: '0 10px 26px rgba(47, 56, 35, 0.08)',
                transition: 'transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease',
                '&:hover': {
                  transform: 'translateY(-3px)',
                  boxShadow: '0 16px 34px rgba(47, 56, 35, 0.12)',
                  borderColor: 'rgba(111, 119, 69, 0.34)',
                },
              }}
            >
              <CardActionArea component="article" sx={{ p: { xs: 1.75, sm: 2.25 }, cursor: 'default' }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1.5, mb: 1.5 }}>
                  <Box>
                    <Typography variant="h5" sx={{ color: '#6f5a22', fontWeight: 900 }}>
                      {dua.title}
                    </Typography>
                    <Typography sx={{ color: '#6f7745', fontWeight: 800, fontSize: '0.92rem' }}>
                      {dua.subtitle}
                    </Typography>
                  </Box>
                  <Chip
                    icon={<KeyboardArrowRightIcon />}
                    label={`${dua.order}. Adım`}
                    size="small"
                    sx={{ color: '#fff8d9', backgroundColor: '#6f7745', fontWeight: 900, '& .MuiChip-icon': { color: '#fff8d9' } }}
                  />
                </Box>

                <Typography
                  sx={{
                    direction: 'rtl',
                    textAlign: 'right',
                    fontFamily: 'KFGQPC Uthman Taha Naskh, Traditional Arabic, serif',
                    fontSize: { xs: '1.65rem', sm: '2rem' },
                    lineHeight: 1.9,
                    color: '#211b14',
                    mb: 1.5,
                  }}
                >
                  {dua.arabic}
                </Typography>

                <Divider sx={{ my: 1.35, borderColor: 'rgba(142, 118, 63, 0.18)' }} />

                <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.5 }}>
                  Latin Okunuşu
                </Typography>
                <Typography sx={{ color: '#2f312d', lineHeight: 1.7, fontWeight: 700, mb: 1.35 }}>
                  {dua.latin}
                </Typography>

                <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.5 }}>
                  Anlamı
                </Typography>
                <Typography sx={{ color: '#2f312d', lineHeight: 1.75, textAlign: 'justify', textAlignLast: 'left' }}>
                  {dua.meaning}
                </Typography>
              </CardActionArea>
            </Paper>
          </Zoom>
        ))}
      </Box>

      <Paper
        elevation={0}
        sx={{
          mt: 1.75,
          p: { xs: 1, sm: 1.25 },
          borderRadius: 1.5,
          backgroundColor: 'rgba(255, 253, 244, 0.72)',
          border: '1px solid rgba(142, 118, 63, 0.12)',
        }}
      >
        <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.35, fontSize: '0.82rem' }}>
          Kaynak ve Kontrol Notu
        </Typography>
        <Typography sx={{ color: '#4f4a33', lineHeight: 1.45, mb: 0.75, fontSize: '0.78rem' }}>
          Namaz tesbihatı sırası, Diyanet’in Temel Dinî Bilgiler yayınının “Namaz Kılındıktan Sonra Neler Okunur?” bölümüne göre düzenlenmiştir. Metinlerin Arapçası, okunuşu ve anlamı aşağıdaki güvenilir kaynaklarla düzenli kontrol edilmelidir.
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.6 }}>
          {SOURCE_LINKS.map((source) => (
            <Link
              key={source.href}
              href={source.href}
              target="_blank"
              rel="noopener noreferrer"
              sx={{
                px: 0.8,
                py: 0.25,
                borderRadius: 999,
                color: '#6f7745',
                backgroundColor: 'rgba(111, 119, 69, 0.08)',
                fontWeight: 900,
                fontSize: '0.74rem',
                textDecoration: 'none',
                '&:hover': {
                  color: '#111',
                  backgroundColor: 'rgba(111, 119, 69, 0.14)',
                },
              }}
            >
              {source.label}
            </Link>
          ))}
        </Box>
      </Paper>
    </Box>
  </Box>
);

export default DuaComponent;
