import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MenuBookIcon from '@mui/icons-material/MenuBook';

const PROPHET_PRAYER_GROUPS = [
  {
    prophet: 'Hz. Âdem',
    description: 'Tevbe ve bağışlanma duası.',
    prayers: [
      {
        reference: 'A‘râf 7:23',
        arabic: 'رَبَّنَا ظَلَمْنَا اَنْفُسَنَا وَاِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
        meaning: 'Rabbimiz! Biz kendimize zulmettik. Eğer bizi bağışlamaz ve bize merhamet etmezsen mutlaka ziyana uğrayanlardan oluruz.',
      },
    ],
  },
  {
    prophet: 'Hz. Nûh',
    description: 'Bağışlanma, yardım, kurtuluş ve zalimlerden korunma duaları.',
    prayers: [
      {
        reference: 'Hûd 11:47',
        arabic: 'رَبِّ اِنِّي اَعُوذُ بِكَ اَنْ اَسْـَٔلَكَ مَا لَيْسَ لِي بِهٖ عِلْمٌ وَاِلَّا تَغْفِرْ لِي وَتَرْحَمْنِي اَكُنْ مِنَ الْخَاسِرِينَ',
        meaning: 'Rabbim! Hakkında bilgim olmayan şeyi senden istemekten sana sığınırım. Eğer beni bağışlamaz ve bana merhamet etmezsen ziyana uğrayanlardan olurum.',
      },
      {
        reference: 'Mü’minûn 23:26',
        arabic: 'رَبِّ انْصُرْنِي بِمَا كَذَّبُونِ',
        meaning: 'Rabbim! Beni yalanlamalarına karşı bana yardım et.',
      },
      {
        reference: 'Mü’minûn 23:29',
        arabic: 'رَبِّ اَنْزِلْنِي مُنْزَلًا مُبَارَكًا وَاَنْتَ خَيْرُ الْمُنْزِلِينَ',
        meaning: 'Rabbim! Beni bereketli bir yere indir. Sen indirenlerin en hayırlısısın.',
      },
      {
        reference: 'Şuarâ 26:117-118',
        arabic: 'رَبِّ اِنَّ قَوْمِي كَذَّبُونِ فَافْتَحْ بَيْنِي وَبَيْنَهُمْ فَتْحًا وَنَجِّنِي وَمَنْ مَعِيَ مِنَ الْمُؤْمِنِينَ',
        meaning: 'Rabbim! Kavmim beni yalanladı. Benimle onlar arasında kesin hükmünü ver; beni ve benimle birlikte olan müminleri kurtar.',
      },
      {
        reference: 'Nûh 71:26-28',
        arabic: 'رَبِّ لَا تَذَرْ عَلَى الْاَرْضِ مِنَ الْكَافِرِينَ دَيَّارًا اِنَّكَ اِنْ تَذَرْهُمْ يُضِلُّوا عِبَادَكَ وَلَا يَلِدُوا اِلَّا فَاجِرًا كَفَّارًا رَبِّ اغْفِرْ لِي وَلِوَالِدَيَّ وَلِمَنْ دَخَلَ بَيْتِيَ مُؤْمِنًا وَلِلْمُؤْمِنِينَ وَالْمُؤْمِنَاتِ',
        meaning: 'Rabbim! Yeryüzünde inkârcılardan hiç kimseyi bırakma; çünkü bırakırsan kullarını saptırırlar. Rabbim! Beni, anne babamı, evime mümin olarak girenleri, mümin erkekleri ve mümin kadınları bağışla.',
      },
    ],
  },
  {
    prophet: 'Hz. İbrâhim',
    description: 'Teslimiyet, nesil, şehir güvenliği, namaz ve bağışlanma duaları.',
    prayers: [
      {
        reference: 'Bakara 2:126',
        arabic: 'رَبِّ اجْعَلْ هٰذَا بَلَدًا اٰمِنًا وَارْزُقْ اَهْلَهُ مِنَ الثَّمَرَاتِ',
        meaning: 'Rabbim! Burayı güvenli bir şehir kıl ve halkını ürünlerle rızıklandır.',
      },
      {
        reference: 'Bakara 2:127-128',
        arabic: 'رَبَّنَا تَقَبَّلْ مِنَّا اِنَّكَ اَنْتَ السَّمِيعُ الْعَلِيمُ رَبَّنَا وَاجْعَلْنَا مُسْلِمَيْنِ لَكَ وَمِنْ ذُرِّيَّتِنَا اُمَّةً مُسْلِمَةً لَكَ',
        meaning: 'Rabbimiz! Bizden kabul buyur. Şüphesiz sen işiten ve bilensin. Rabbimiz! Bizi sana teslim olanlardan eyle; soyumuzdan da sana teslim olan bir ümmet çıkar.',
      },
      {
        reference: 'Bakara 2:129',
        arabic: 'رَبَّنَا وَابْعَثْ فِيهِمْ رَسُولًا مِنْهُمْ يَتْلُوا عَلَيْهِمْ اٰيَاتِكَ وَيُعَلِّمُهُمُ الْكِتَابَ وَالْحِكْمَةَ وَيُزَكِّيهِمْ',
        meaning: 'Rabbimiz! İçlerinden onlara ayetlerini okuyacak, kitabı ve hikmeti öğretecek, onları arındıracak bir peygamber gönder.',
      },
      {
        reference: 'İbrâhîm 14:35',
        arabic: 'رَبِّ اجْعَلْ هٰذَا الْبَلَدَ اٰمِنًا وَاجْنُبْنِي وَبَنِيَّ اَنْ نَعْبُدَ الْاَصْنَامَ',
        meaning: 'Rabbim! Bu beldeyi güvenli kıl; beni ve çocuklarımı putlara tapmaktan uzak tut.',
      },
      {
        reference: 'İbrâhîm 14:37',
        arabic: 'رَبَّنَا اِنِّي اَسْكَنْتُ مِنْ ذُرِّيَّتِي بِوَادٍ غَيْرِ ذِي زَرْعٍ عِنْدَ بَيْتِكَ الْمُحَرَّمِ رَبَّنَا لِيُقِيمُوا الصَّلٰوةَ',
        meaning: 'Rabbimiz! Soyumdan bir kısmını ekinsiz bir vadide, senin kutsal evinin yanında yerleştirdim. Rabbimiz! Namazı dosdoğru kılsınlar diye.',
      },
      {
        reference: 'İbrâhîm 14:40-41',
        arabic: 'رَبِّ اجْعَلْنِي مُقِيمَ الصَّلٰوةِ وَمِنْ ذُرِّيَّتِي رَبَّنَا وَتَقَبَّلْ دُعَاءِ رَبَّنَا اغْفِرْ لِي وَلِوَالِدَيَّ وَلِلْمُؤْمِنِينَ يَوْمَ يَقُومُ الْحِسَابُ',
        meaning: 'Rabbim! Beni ve soyumdan gelenleri namazı dosdoğru kılanlardan eyle. Rabbimiz! Duamı kabul buyur. Rabbimiz! Hesap günü beni, anne babamı ve müminleri bağışla.',
      },
      {
        reference: 'Şuarâ 26:83-89',
        arabic: 'رَبِّ هَبْ لِي حُكْمًا وَاَلْحِقْنِي بِالصَّالِحِينَ وَاجْعَلْ لِي لِسَانَ صِدْقٍ فِي الْاٰخِرِينَ وَاجْعَلْنِي مِنْ وَرَثَةِ جَنَّةِ النَّعِيمِ',
        meaning: 'Rabbim! Bana hikmet ver, beni salihlerin arasına kat. Sonraki nesiller içinde bana güzel bir anılış nasip et. Beni nimet cennetinin varislerinden eyle.',
      },
      {
        reference: 'Sâffât 37:100',
        arabic: 'رَبِّ هَبْ لِي مِنَ الصَّالِحِينَ',
        meaning: 'Rabbim! Bana salihlerden olacak bir çocuk bağışla.',
      },
    ],
  },
  {
    prophet: 'Hz. Lût',
    description: 'Bozguncu topluluktan kurtuluş duaları.',
    prayers: [
      {
        reference: 'Şuarâ 26:169',
        arabic: 'رَبِّ نَجِّنِي وَاَهْلِي مِمَّا يَعْمَلُونَ',
        meaning: 'Rabbim! Beni ve ailemi onların yaptıklarından kurtar.',
      },
      {
        reference: 'Ankebût 29:30',
        arabic: 'رَبِّ انْصُرْنِي عَلَى الْقَوْمِ الْمُفْسِدِينَ',
        meaning: 'Rabbim! Bozguncu kavme karşı bana yardım et.',
      },
    ],
  },
  {
    prophet: 'Hz. Yûsuf',
    description: 'İffet, korunma ve Müslüman olarak vefat etme duaları.',
    prayers: [
      {
        reference: 'Yûsuf 12:33',
        arabic: 'رَبِّ السِّجْنُ اَحَبُّ اِلَيَّ مِمَّا يَدْعُونَنِي اِلَيْهِ وَاِلَّا تَصْرِفْ عَنِّي كَيْدَهُنَّ اَصْبُ اِلَيْهِنَّ وَاَكُنْ مِنَ الْجَاهِلِينَ',
        meaning: 'Rabbim! Zindan bana onların beni çağırdığı şeyden daha sevimlidir. Eğer tuzaklarını benden uzaklaştırmazsan onlara meyleder ve cahillerden olurum.',
      },
      {
        reference: 'Yûsuf 12:101',
        arabic: 'فَاطِرَ السَّمٰوَاتِ وَالْاَرْضِ اَنْتَ وَلِيّٖ فِي الدُّنْيَا وَالْاٰخِرَةِ تَوَفَّنِي مُسْلِمًا وَاَلْحِقْنِي بِالصَّالِحِينَ',
        meaning: 'Ey gökleri ve yeri yaratan! Dünya ve ahirette benim velim sensin. Beni Müslüman olarak vefat ettir ve beni salihlerin arasına kat.',
      },
    ],
  },
  {
    prophet: 'Hz. Mûsâ',
    description: 'Bağışlanma, cesaret, kolaylık, yardım ve kurtuluş duaları.',
    prayers: [
      {
        reference: 'A‘râf 7:151',
        arabic: 'رَبِّ اغْفِرْ لِي وَلِاَخِي وَاَدْخِلْنَا فِي رَحْمَتِكَ وَاَنْتَ اَرْحَمُ الرَّاحِمِينَ',
        meaning: 'Rabbim! Beni ve kardeşimi bağışla. Bizi rahmetine dâhil et. Sen merhametlilerin en merhametlisisin.',
      },
      {
        reference: 'Yûnus 10:85-86',
        arabic: 'رَبَّنَا لَا تَجْعَلْنَا فِتْنَةً لِلْقَوْمِ الظَّالِمِينَ وَنَجِّنَا بِرَحْمَتِكَ مِنَ الْقَوْمِ الْكَافِرِينَ',
        meaning: 'Rabbimiz! Bizi zalim kavmin sınama aracı kılma. Rahmetinle bizi inkârcı kavimden kurtar.',
      },
      {
        reference: 'Tâhâ 20:25-28',
        arabic: 'رَبِّ اشْرَحْ لِي صَدْرِي وَيَسِّرْ لِي اَمْرِي وَاحْلُلْ عُقْدَةً مِنْ لِسَانِي يَفْقَهُوا قَوْلِي',
        meaning: 'Rabbim! Gönlüme ferahlık ver. İşimi bana kolaylaştır. Dilimdeki tutukluğu çöz ki sözümü iyi anlasınlar.',
      },
      {
        reference: 'Kasas 28:16',
        arabic: 'رَبِّ اِنِّي ظَلَمْتُ نَفْسِي فَاغْفِرْ لِي',
        meaning: 'Rabbim! Ben kendime zulmettim, beni bağışla.',
      },
      {
        reference: 'Kasas 28:21',
        arabic: 'رَبِّ نَجِّنِي مِنَ الْقَوْمِ الظَّالِمِينَ',
        meaning: 'Rabbim! Beni zalim kavimden kurtar.',
      },
      {
        reference: 'Kasas 28:24',
        arabic: 'رَبِّ اِنِّي لِمَا اَنْزَلْتَ اِلَيَّ مِنْ خَيْرٍ فَقِيرٌ',
        meaning: 'Rabbim! Bana indireceğin her hayra muhtacım.',
      },
    ],
  },
  {
    prophet: 'Hz. Eyyûb',
    description: 'Hastalık ve sıkıntı halinde merhamet duası.',
    prayers: [
      {
        reference: 'Enbiyâ 21:83',
        arabic: 'اَنِّي مَسَّنِيَ الضُّرُّ وَاَنْتَ اَرْحَمُ الرَّاحِمِينَ',
        meaning: 'Başıma bu dert geldi. Sen merhametlilerin en merhametlisisin.',
      },
    ],
  },
  {
    prophet: 'Hz. Yûnus',
    description: 'Tevhid, tesbih ve tevbe duası.',
    prayers: [
      {
        reference: 'Enbiyâ 21:87',
        arabic: 'لَا اِلٰهَ اِلَّا اَنْتَ سُبْحَانَكَ اِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
        meaning: 'Senden başka hiçbir ilah yoktur. Seni eksikliklerden uzak tutarım. Şüphesiz ben zalimlerden oldum.',
      },
    ],
  },
  {
    prophet: 'Hz. Süleyman',
    description: 'Şükür, salih amel ve mülk duası.',
    prayers: [
      {
        reference: 'Neml 27:19',
        arabic: 'رَبِّ اَوْزِعْنِي اَنْ اَشْكُرَ نِعْمَتَكَ الَّتِي اَنْعَمْتَ عَلَيَّ وَعَلٰى وَالِدَيَّ وَاَنْ اَعْمَلَ صَالِحًا تَرْضٰيهُ',
        meaning: 'Rabbim! Bana ve anne babama verdiğin nimete şükretmemi ve razı olacağın salih işler yapmamı bana ilham et.',
      },
      {
        reference: 'Sâd 38:35',
        arabic: 'رَبِّ اغْفِرْ لِي وَهَبْ لِي مُلْكًا لَا يَنْبَغِي لِاَحَدٍ مِنْ بَعْدِي اِنَّكَ اَنْتَ الْوَهَّابُ',
        meaning: 'Rabbim! Beni bağışla ve benden sonra kimseye nasip olmayacak bir hükümranlık ver. Şüphesiz sen çok bağışta bulunansın.',
      },
    ],
  },
  {
    prophet: 'Hz. Zekeriyyâ',
    description: 'Temiz nesil ve yalnız kalmama duası.',
    prayers: [
      {
        reference: 'Âl-i İmrân 3:38',
        arabic: 'رَبِّ هَبْ لِي مِنْ لَدُنْكَ ذُرِّيَّةً طَيِّبَةً اِنَّكَ سَمِيعُ الدُّعَاءِ',
        meaning: 'Rabbim! Bana katından temiz bir nesil bağışla. Şüphesiz sen duayı hakkıyla işitensin.',
      },
      {
        reference: 'Meryem 19:4-6',
        arabic: 'رَبِّ اِنِّي وَهَنَ الْعَظْمُ مِنِّي وَاشْتَعَلَ الرَّأْسُ شَيْبًا وَلَمْ اَكُنْ بِدُعَائِكَ رَبِّ شَقِيًّا وَاِنِّي خِفْتُ الْمَوَالِيَ مِنْ وَرَائِي وَكَانَتِ امْرَاَتِي عَاقِرًا فَهَبْ لِي مِنْ لَدُنْكَ وَلِيًّا يَرِثُنِي وَيَرِثُ مِنْ اٰلِ يَعْقُوبَ وَاجْعَلْهُ رَبِّ رَضِيًّا',
        meaning: 'Rabbim! Kemiklerim zayıfladı, saçım ağardı; sana duamda hiç mahrum kalmadım. Benden sonra yakınlarım adına endişeliyim; eşim de kısırdır. Bana katından bir veli bağışla; onu razı olduğun bir kul eyle.',
      },
      {
        reference: 'Enbiyâ 21:89',
        arabic: 'رَبِّ لَا تَذَرْنِي فَرْدًا وَاَنْتَ خَيْرُ الْوَارِثِينَ',
        meaning: 'Rabbim! Beni tek başıma bırakma. Sen varislerin en hayırlısısın.',
      },
    ],
  },
  {
    prophet: 'Hz. Îsâ',
    description: 'Rızık ve ilâhî hükme teslimiyet duaları.',
    prayers: [
      {
        reference: 'Mâide 5:114',
        arabic: 'اللّٰهُمَّ رَبَّنَا اَنْزِلْ عَلَيْنَا مَائِدَةً مِنَ السَّمَاءِ تَكُونُ لَنَا عِيدًا لِاَوَّلِنَا وَاٰخِرِنَا وَاٰيَةً مِنْكَ وَارْزُقْنَا وَاَنْتَ خَيْرُ الرَّازِقِينَ',
        meaning: 'Allah’ım, Rabbimiz! Bize gökten bir sofra indir; öncekilerimiz ve sonrakilerimiz için bayram ve senden bir delil olsun. Bizi rızıklandır; sen rızık verenlerin en hayırlısısın.',
      },
      {
        reference: 'Mâide 5:118',
        arabic: 'اِنْ تُعَذِّبْهُمْ فَاِنَّهُمْ عِبَادُكَ وَاِنْ تَغْفِرْ لَهُمْ فَاِنَّكَ اَنْتَ الْعَزِيزُ الْحَكِيمُ',
        meaning: 'Onlara azap edersen onlar senin kullarındır. Onları bağışlarsan şüphesiz sen mutlak güç ve hikmet sahibisin.',
      },
    ],
  },
  {
    prophet: 'Hz. Muhammed ve Resule öğretilen dualar',
    description: 'İlim, hak hüküm, korunma ve bağışlanma duaları.',
    prayers: [
      {
        reference: 'Tâhâ 20:114',
        arabic: 'رَبِّ زِدْنِي عِلْمًا',
        meaning: 'Rabbim! İlmimi artır.',
      },
      {
        reference: 'Enbiyâ 21:112',
        arabic: 'رَبِّ احْكُمْ بِالْحَقِّ وَرَبُّنَا الرَّحْمٰنُ الْمُسْتَعَانُ عَلٰى مَا تَصِفُونَ',
        meaning: 'Rabbim! Hak ile hükmet. Rabbimiz Rahmân’dır; sizin nitelemelerinize karşı yardımı istenecek olan O’dur.',
      },
      {
        reference: 'Mü’minûn 23:97-98',
        arabic: 'رَبِّ اَعُوذُ بِكَ مِنْ هَمَزَاتِ الشَّيَاطِينِ وَاَعُوذُ بِكَ رَبِّ اَنْ يَحْضُرُونِ',
        meaning: 'Rabbim! Şeytanların kışkırtmalarından sana sığınırım. Rabbim! Yanımda bulunmalarından da sana sığınırım.',
      },
      {
        reference: 'Mü’minûn 23:118',
        arabic: 'رَبِّ اغْفِرْ وَارْحَمْ وَاَنْتَ خَيْرُ الرَّاحِمِينَ',
        meaning: 'Rabbim! Bağışla ve merhamet et. Sen merhametlilerin en hayırlısısın.',
      },
      {
        reference: 'İsrâ 17:80',
        arabic: 'رَبِّ اَدْخِلْنِي مُدْخَلَ صِدْقٍ وَاَخْرِجْنِي مُخْرَجَ صِدْقٍ وَاجْعَلْ لِي مِنْ لَدُنْكَ سُلْطَانًا نَصِيرًا',
        meaning: 'Rabbim! Beni doğrulukla girdir, doğrulukla çıkar ve katından bana yardımcı bir güç ver.',
      },
    ],
  },
];

const SOURCE_LINKS = [
  {
    label: 'Diyanet Kur’an Yolu Meali',
    href: 'https://kuran.diyanet.gov.tr',
  },
  {
    label: 'Diyanet Haber - Kur’an-ı Kerim’de Peygamber Duaları',
    href: 'https://www.diyanethaber.com.tr/kuran-i-kerimde-peygamber-dualari',
  },
  {
    label: 'Diyanet PDF - Kur’an’da İsmi Geçen Peygamber Duaları',
    href: 'https://webdosyasp.diyanet.gov.tr/muftuluk/UserFiles/eskisehir/UserFiles/Files/GORMEENGELLILERI%C3%87INDUAAYETLERIVEMEALLERI%28yeni%29%20%282%29_a35a3875-50a6-464d-a17e-f72d3ad6b861.pdf',
  },
];

const KuranDuaComponent = () => {
  const prayerCount = PROPHET_PRAYER_GROUPS.reduce((total, group) => total + group.prayers.length, 0);

  return (
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
            mb: 2.5,
            p: { xs: 2, sm: 3 },
            borderRadius: 2,
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(255, 253, 244, 0.98), rgba(245, 239, 214, 0.92))',
            border: '1px solid rgba(142, 118, 63, 0.22)',
            boxShadow: '0 12px 32px rgba(47, 56, 35, 0.08)',
          }}
        >
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              display: 'grid',
              placeItems: 'center',
              mx: 'auto',
              mb: 1.25,
              color: '#fff8d9',
              backgroundColor: '#6f7745',
              boxShadow: '0 8px 18px rgba(111, 119, 69, 0.22)',
            }}
          >
            <MenuBookIcon />
          </Box>
          <Typography variant="h4" sx={{ color: '#6f5a22', fontWeight: 900, lineHeight: 1.15 }}>
            Kur’an Duaları
          </Typography>
          <Typography sx={{ color: '#4f4a33', fontWeight: 700, mt: 0.75 }}>
            Kur’an’da peygamberlere nispet edilen duaları peygamber adına göre gruplu olarak inceleyin.
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, flexWrap: 'wrap', mt: 1.5 }}>
            <Chip label={`${PROPHET_PRAYER_GROUPS.length} grup`} size="small" sx={{ color: '#fff8d9', backgroundColor: '#6f7745', fontWeight: 900 }} />
            <Chip label={`${prayerCount} dua`} size="small" variant="outlined" sx={{ color: '#6f5a22', borderColor: 'rgba(142, 118, 63, 0.34)', fontWeight: 900 }} />
          </Box>
        </Paper>

        <Box sx={{ display: 'grid', gap: 1.5 }}>
          {PROPHET_PRAYER_GROUPS.map((group, groupIndex) => (
            <Accordion
              key={group.prophet}
              defaultExpanded={groupIndex < 3}
              disableGutters
              sx={{
                borderRadius: '12px !important',
                overflow: 'hidden',
                backgroundColor: 'rgba(255, 253, 244, 0.97)',
                border: '1px solid rgba(142, 118, 63, 0.22)',
                boxShadow: '0 10px 26px rgba(47, 56, 35, 0.08)',
                '&::before': { display: 'none' },
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon sx={{ color: '#6f5a22' }} />}
                sx={{
                  px: { xs: 1.5, sm: 2 },
                  py: 0.75,
                  '& .MuiAccordionSummary-content': {
                    alignItems: 'center',
                    gap: 1,
                    flexWrap: 'wrap',
                  },
                }}
              >
                <Typography variant="h6" sx={{ color: '#6f5a22', fontWeight: 900 }}>
                  {group.prophet}
                </Typography>
                <Chip label={`${group.prayers.length} dua`} size="small" sx={{ color: '#fff8d9', backgroundColor: '#6f7745', fontWeight: 900 }} />
                <Typography sx={{ color: '#4f4a33', fontWeight: 700, fontSize: '0.9rem' }}>
                  {group.description}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: { xs: 1.25, sm: 2 }, pb: 2 }}>
                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' }, gap: 1.5 }}>
                  {group.prayers.map((dua) => (
                    <Paper
                      key={`${group.prophet}-${dua.reference}`}
                      elevation={0}
                      component="article"
                      sx={{
                        p: { xs: 1.5, sm: 1.8 },
                        borderRadius: 2,
                        backgroundColor: 'rgba(255, 255, 248, 0.82)',
                        border: '1px solid rgba(142, 118, 63, 0.16)',
                      }}
                    >
                      <Chip
                        label={dua.reference}
                        size="small"
                        sx={{ mb: 1.2, color: '#fff8d9', backgroundColor: '#6f7745', fontWeight: 900 }}
                      />
                      <Typography
                        sx={{
                          direction: 'rtl',
                          textAlign: 'right',
                          fontFamily: 'KFGQPC Uthman Taha Naskh, Traditional Arabic, serif',
                          fontSize: { xs: '1.55rem', sm: '1.9rem' },
                          lineHeight: 1.9,
                          color: '#211b14',
                          mb: 1.25,
                        }}
                      >
                        {dua.arabic}
                      </Typography>
                      <Divider sx={{ my: 1.1, borderColor: 'rgba(142, 118, 63, 0.16)' }} />
                      <Typography sx={{ color: '#6f5a22', fontWeight: 900, mb: 0.45 }}>
                        Anlamı
                      </Typography>
                      <Typography sx={{ color: '#2f312d', lineHeight: 1.7, textAlign: 'justify', textAlignLast: 'left' }}>
                        {dua.meaning}
                      </Typography>
                    </Paper>
                  ))}
                </Box>
              </AccordionDetails>
            </Accordion>
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
            Bu sayfadaki dualar Kur’an’daki ilgili sure ve ayet referansları esas alınarak hazırlanmıştır. Yayın öncesi Arapça metin ve anlamların aşağıdaki güvenilir kaynaklarla düzenli kontrol edilmesi önerilir.
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
};

export default KuranDuaComponent;
