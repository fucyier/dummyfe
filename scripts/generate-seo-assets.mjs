import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SITE_URL = 'https://www.kuran-i-kerim.com';
const ROOT = process.cwd();
const targetDir = process.argv[2] || 'public';
const targetRoot = path.resolve(ROOT, targetDir);
const today = new Date().toISOString().slice(0, 10);

const staticRoutes = [
  {
    path: '/',
    priority: '1.0',
    changefreq: 'daily',
    title: 'Kuran-ı Kerim Oku, Dinle, Ezberle ve Ayet Kartları',
    description: "Kur'an-ı Kerim'i Arapça metin, Türkçe meal ve Latin okunuşuyla inceleyin; ayet kartlarıyla ayet seçin, sıralı dinleyin ve ezber çalışın.",
  },
  {
    path: '/sureler',
    priority: '0.9',
    changefreq: 'weekly',
    title: 'Sureler Listesi - Kuran-ı Kerim Oku ve Dinle',
    description: "Kur'an-ı Kerim surelerini mushaf sırası veya iniş sırasına göre keşfedin; ayet sayısı, Mekki-Medeni bilgisi ve meal seçenekleriyle okuyun.",
  },
  {
    path: '/mukabele',
    priority: '0.8',
    changefreq: 'weekly',
    title: 'Mukabele Takibi - Cüz Cüz Kuran Dinle',
    description: "Mukabele sayfasında cüz seçerek Kur'an-ı Kerim'i kelime takibiyle dinleyin, aktif ayet mealini görün ve kaldığınız yerden devam edin.",
  },
  {
    path: '/dualar',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Namaz Duaları - Arapça, Latin Okunuş ve Anlamları',
    description: 'Sübhâneke, Ettehiyyâtü, Rabbenâ duaları, Kunut duaları ve namazda okunan temel duaları Arapça, Latin okunuş ve Türkçe anlamlarıyla inceleyin.',
  },
  {
    path: '/kuran-dualari',
    priority: '0.8',
    changefreq: 'monthly',
    title: 'Kur’an Duaları - Peygamber Duaları ve Anlamları',
    description: 'Kur’an’da peygamberlere nispet edilen duaları peygamber adına göre gruplu olarak; sure, ayet, Arapça metin ve Türkçe anlamlarıyla inceleyin.',
  },
  {
    path: '/hadis',
    priority: '0.7',
    changefreq: 'weekly',
    title: 'Türkçe Hadisler - Hadis Kategorileri ve Açıklamaları',
    description: 'Türkçe hadis kategorilerini inceleyin; hadis metni, açıklaması, şerhi, kaynak bilgisi ve hadisten çıkarılan hükümlerle detaylı okuyun.',
  },
];

const escapeXml = (value) => (
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
);

const escapeHtmlAttribute = (value) => (
  String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
);

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

const fetchSurahs = async () => {
  try {
    const response = await fetch('https://api.acikkuran.com/surahs');
    if (!response.ok) throw new Error(`Surah API ${response.status}`);
    const payload = await response.json();
    return Array.isArray(payload) ? payload : payload?.data || [];
  } catch (error) {
    console.warn(`[seo] Sure listesi alınamadı, sadece temel route'lar yazılacak: ${error.message}`);
    return [];
  }
};

const getSurahRoutes = (surahs) => (
  surahs
    .filter(item => item?.id && item?.name)
    .map((surah) => {
      const slug = surah.slug || slugify(surah.name);
      return {
        path: `/sure/${slug}`,
        priority: surah.id <= 2 ? '0.9' : '0.8',
        changefreq: 'monthly',
        title: `${surah.name} Suresi Oku, Dinle, Meal ve Ayet Kartları`,
        description: `${surah.name} Suresi'ni Arapça metin, Türkçe meal ve Latin okunuşuyla inceleyin; ayet kartlarıyla ayet seçin ve seçili seslendirenden sırayla dinleyin. ${surah.verse_count || ''} ayet.`,
      };
    })
);

const writeSitemap = async (routes) => {
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    routes.map(route => (
      `  <url>\n` +
      `    <loc>${escapeXml(`${SITE_URL}${route.path === '/' ? '/' : route.path}`)}</loc>\n` +
      `    <lastmod>${today}</lastmod>\n` +
      `    <changefreq>${route.changefreq}</changefreq>\n` +
      `    <priority>${route.priority}</priority>\n` +
      `  </url>`
    )).join('\n') +
    `\n</urlset>\n`;

  await mkdir(targetRoot, { recursive: true });
  await writeFile(path.join(targetRoot, 'sitemap.xml'), sitemap, 'utf8');
};

const replaceOrInsert = (html, pattern, replacement, insertBefore = '</head>') => {
  if (pattern.test(html)) return html.replace(pattern, replacement);
  return html.replace(insertBefore, `    ${replacement}\n  ${insertBefore}`);
};

const applyRouteMeta = (html, route) => {
  const canonical = `${SITE_URL}${route.path === '/' ? '/' : route.path}`;
  const title = escapeHtmlAttribute(route.title);
  const description = escapeHtmlAttribute(route.description);
  const isQuranRoute = route.path === '/' || route.path.startsWith('/sure/');
  const schema = JSON.stringify([
    {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      name: route.title,
      description: route.description,
      url: canonical,
      inLanguage: 'tr-TR',
      isPartOf: {
        '@type': 'WebSite',
        name: 'Kuran-ı Kerim Sitesi',
        url: SITE_URL,
      },
    },
    ...(isQuranRoute ? [{
      '@context': 'https://schema.org',
      '@type': 'WebApplication',
      name: route.path === '/' ? 'Kur’an Ayet Kartları' : `${route.title.split(' Suresi')[0]} Suresi Ayet Kartları`,
      description: route.description,
      url: canonical,
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
    }] : []),
  ]).replace(/</g, '\\u003c');

  let nextHtml = html.replace(/<title>.*?<\/title>/i, `<title>${title}</title>`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i, `<meta name="description" content="${description}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i, `<link rel="canonical" href="${canonical}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:url" content="${canonical}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:title" content="${title}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i, `<meta property="og:description" content="${description}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:title" content="${title}" />`);
  nextHtml = replaceOrInsert(nextHtml, /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i, `<meta name="twitter:description" content="${description}" />`);
  nextHtml = replaceOrInsert(
    nextHtml,
    /<script\s+id="page-schema"\s+type="application\/ld\+json">[\s\S]*?<\/script>/i,
    `<script id="page-schema" type="application/ld+json">${schema}</script>`,
  );

  return nextHtml;
};

const writeStaticHtmlRoutes = async (routes) => {
  const indexPath = path.join(targetRoot, 'index.html');
  let baseHtml;

  try {
    baseHtml = await readFile(indexPath, 'utf8');
  } catch {
    return;
  }

  await Promise.all(routes
    .filter(route => route.path !== '/')
    .map(async (route) => {
      const routeDir = path.join(targetRoot, ...route.path.split('/').filter(Boolean));
      await mkdir(routeDir, { recursive: true });
      await writeFile(path.join(routeDir, 'index.html'), applyRouteMeta(baseHtml, route), 'utf8');
    }));

  await writeFile(indexPath, applyRouteMeta(baseHtml, routes[0]), 'utf8');
};

const surahs = await fetchSurahs();
const routes = [...staticRoutes, ...getSurahRoutes(surahs)];

await writeSitemap(routes);
await writeStaticHtmlRoutes(routes);

console.log(`[seo] ${routes.length} URL için sitemap${targetDir === 'dist' ? ' ve statik HTML' : ''} üretildi.`);
