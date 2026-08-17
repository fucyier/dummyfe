const SITE_ORIGIN = 'https://www.kuran-i-kerim.com';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/static/images/icons-Allah.png`;
const DEFAULT_TITLE = 'Kuran-ı Kerim Oku, Dinle, Ezberle ve Ayet Kartları';
const DEFAULT_DESCRIPTION = "Kur'an-ı Kerim'i Arapça metin, Türkçe meal ve Latin okunuşuyla inceleyin; ayet kartlarıyla ayet seçin, sıralı dinleyin ve ezber çalışın.";
const DEFAULT_KEYWORDS = "Kur'an-ı Kerim, Kuran oku, Kuran dinle, Kuran ezberle, ayet kartları, ayet dinle, Türkçe meal, Latin okunuş, sure, cüz, mukabele, tefsir";

const ROUTE_SEO = {
  quran: {
    path: '/',
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
  },
  kuranOku: {
    path: '/kuran-oku/',
    title: 'Kur’an Oku - Arapça Metin, Türkçe Meal ve Seslendirme',
    description: "Kur'an-ı Kerim'i sure sure Arapça mushaf görünümünde okuyun, seçtiğiniz Türkçe meali inceleyin ve farklı seslendirenlerden dinleyin.",
  },
  kuranTesti: {
    path: '/kuran-testi/',
    title: "Kur'an Testi - 300 Ayet, Sure, Peygamber ve Siyer Sorusu",
    description: "114 surenin tamamı, ayet anlamları, iman esasları, peygamber kıssaları ve Hz. Muhammed'in hayatı üzerine 300 açıklamalı ve referanslı soruyu çözün.",
  },
  sureler: {
    path: '/sureler/',
    title: 'Sureler Listesi - Kuran-ı Kerim Oku ve Dinle',
    description: "Kur'an-ı Kerim surelerini mushaf sırası veya iniş sırasına göre keşfedin; ayet sayısı, Mekki-Medeni bilgisi ve meal seçenekleriyle okuyun.",
  },
  mukabele: {
    path: '/mukabele/',
    title: 'Mukabele Takibi - Cüz Cüz Kuran Dinle',
    description: "Mukabele sayfasında cüz seçerek Kur'an-ı Kerim'i kelime takibiyle dinleyin, aktif ayet mealini görün ve kaldığınız yerden devam edin.",
  },
  hadis: {
    path: '/hadis/',
    title: 'Türkçe Hadisler - Hadis Kategorileri ve Açıklamaları',
    description: 'Türkçe hadis kategorilerini inceleyin; hadis metni, açıklaması, şerhi, kaynak bilgisi ve hadisten çıkarılan hükümlerle detaylı okuyun.',
  },
  dualar: {
    path: '/dualar/',
    title: 'Namaz Duaları - Arapça, Latin Okunuş ve Anlamları',
    description: 'Sübhâneke, Ettehiyyâtü, Rabbenâ duaları, Kunut duaları ve namazda okunan temel duaları Arapça, Latin okunuş ve Türkçe anlamlarıyla inceleyin.',
  },
  kuranDualari: {
    path: '/kuran-dualari/',
    title: 'Kur’an Duaları - Peygamber Duaları ve Anlamları',
    description: 'Kur’an’da peygamberlere nispet edilen duaları peygamber adına göre gruplu olarak; sure, ayet, Arapça metin ve Türkçe anlamlarıyla inceleyin.',
  },
};

const stripHtml = (value) => (
  String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
);

const createAbsoluteUrl = (path = '/') => {
  const normalizedPath = path === '/'
    ? '/'
    : `${(path.startsWith('/') ? path : `/${path}`).replace(/\/+$/, '')}/`;
  return `${SITE_ORIGIN}${normalizedPath}`;
};

const slugify = (value) => (
  String(value || '')
    .trim()
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/ü/g, 'u')
    .replace(/ş/g, 's')
    .replace(/ö/g, 'o')
    .replace(/ç/g, 'c')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
);

const setOrCreateMeta = (selector, attributes) => {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement('meta');
    document.head.appendChild(element);
  }

  Object.entries(attributes).forEach(([name, value]) => {
    element.setAttribute(name, value);
  });
};

const setCanonical = (url) => {
  let element = document.head.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }

  element.setAttribute('href', url);
};

const setJsonLd = (id, payload) => {
  const existing = document.getElementById(id);
  if (existing) existing.remove();
  if (!payload) return;

  const element = document.createElement('script');
  element.id = id;
  element.type = 'application/ld+json';
  element.textContent = JSON.stringify(payload);
  document.head.appendChild(element);
};

const pageSchema = ({ title, description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: title,
  description,
  url,
  inLanguage: 'tr-TR',
  isPartOf: {
    '@type': 'WebSite',
    name: 'Kuran-ı Kerim Sitesi',
    url: SITE_ORIGIN,
  },
});

const breadcrumbSchema = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: createAbsoluteUrl(item.path),
  })),
});

const ayahCardsSchema = ({ name = 'Kur’an Ayet Kartları', description, url }) => ({
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name,
  description,
  url,
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Any',
  inLanguage: 'tr-TR',
  isAccessibleForFree: true,
  featureList: [
    'Arapça ayet metni',
    'Türkçe meal',
    'Latin harfli okunuş',
    'Ayet seçimi',
    'Ayet bazlı seslendiren seçimi',
    'Sıralı ayet dinleme',
  ],
});

export const getSurahPath = (surah) => {
  const slug = surah?.slug || slugify(surah?.name);
  return slug ? `/sure/${slug}/` : '/';
};

export const getLegacySurahPath = (surah) => {
  const slug = surah?.slug || slugify(surah?.name);
  return slug ? `/${slug}_suresi` : '/';
};

export const applySeoMetadata = ({ title, description, path = '/', image = DEFAULT_IMAGE, schema = null }) => {
  if (typeof document === 'undefined') return;

  const cleanTitle = stripHtml(title) || DEFAULT_TITLE;
  const cleanDescription = stripHtml(description) || DEFAULT_DESCRIPTION;
  const url = createAbsoluteUrl(path);

  document.documentElement.lang = 'tr';
  document.title = cleanTitle;
  setCanonical(url);
  setOrCreateMeta('meta[name="description"]', { name: 'description', content: cleanDescription });
  setOrCreateMeta('meta[name="keywords"]', { name: 'keywords', content: DEFAULT_KEYWORDS });
  setOrCreateMeta('meta[name="robots"]', { name: 'robots', content: 'index, follow' });
  setOrCreateMeta('meta[property="og:type"]', { property: 'og:type', content: 'website' });
  setOrCreateMeta('meta[property="og:locale"]', { property: 'og:locale', content: 'tr_TR' });
  setOrCreateMeta('meta[property="og:url"]', { property: 'og:url', content: url });
  setOrCreateMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: 'Kuran-ı Kerim Sitesi' });
  setOrCreateMeta('meta[property="og:title"]', { property: 'og:title', content: cleanTitle });
  setOrCreateMeta('meta[property="og:description"]', { property: 'og:description', content: cleanDescription });
  setOrCreateMeta('meta[property="og:image"]', { property: 'og:image', content: image });
  setOrCreateMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary' });
  setOrCreateMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: cleanTitle });
  setOrCreateMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: cleanDescription });

  setJsonLd('page-schema', schema || pageSchema({ title: cleanTitle, description: cleanDescription, url }));
};

export const applyStaticSeo = (pageKey) => {
  const seo = ROUTE_SEO[pageKey] || ROUTE_SEO.quran;
  applySeoMetadata({
    ...seo,
    schema: [
      pageSchema({ title: seo.title, description: seo.description, url: createAbsoluteUrl(seo.path) }),
      breadcrumbSchema([
        { name: 'Ana Sayfa', path: '/' },
        ...(pageKey === 'quran' ? [] : [{ name: seo.title.split(' - ')[0], path: seo.path }]),
      ]),
      ...(pageKey === 'quran' ? [ayahCardsSchema({
        description: seo.description,
        url: createAbsoluteUrl(seo.path),
      })] : []),
    ],
  });
};

export const applySurahSeo = (surah) => {
  if (!surah?.id) return;

  const path = getSurahPath(surah);
  const title = `${surah.name} Suresi Oku, Dinle, Meal ve Ayet Kartları`;
  const description = `${surah.name} Suresi'ni Arapça metin, Türkçe meal ve Latin okunuşuyla inceleyin; ayet kartlarıyla ayet seçin ve seçili seslendirenden sırayla dinleyin. ${surah.verse_count || ''} ayet.`;

  applySeoMetadata({
    title,
    description,
    path,
    schema: [
      pageSchema({ title, description, url: createAbsoluteUrl(path) }),
      breadcrumbSchema([
        { name: 'Ana Sayfa', path: '/' },
        { name: 'Sureler', path: '/sureler/' },
        { name: `${surah.name} Suresi`, path },
      ]),
      ayahCardsSchema({
        name: `${surah.name} Suresi Ayet Kartları`,
        description,
        url: createAbsoluteUrl(path),
      }),
    ],
  });
};

export const SITE_URL = SITE_ORIGIN;
