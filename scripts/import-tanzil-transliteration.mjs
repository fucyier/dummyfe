import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const SOURCE_URL = 'https://tanzil.net/trans/?transID=tr.transliteration&type=txt-2';
const OUTPUT_PATH = path.resolve('public/data/quran-transliteration-tr.json');
const EXPECTED_VERSE_COUNT = 6236;
const EXPECTED_CHAPTER_COUNT = 114;

const response = await fetch(SOURCE_URL);
if (!response.ok) {
  throw new Error(`Tanzil verisi indirilemedi: HTTP ${response.status}`);
}

const sourceText = await response.text();
const chapters = {};
const seenKeys = new Set();

for (const line of sourceText.split(/\r?\n/)) {
  const match = line.match(/^(\d+)\|(\d+)\|(.*)$/u);
  if (!match) continue;

  const chapterNumber = Number(match[1]);
  const verseNumber = Number(match[2]);
  const text = match[3].trim();
  const verseKey = `${chapterNumber}:${verseNumber}`;

  if (seenKeys.has(verseKey)) throw new Error(`Tekrarlanan ayet anahtari: ${verseKey}`);
  if (!text) throw new Error(`Bos ceviriyazi: ${verseKey}`);

  const chapter = chapters[chapterNumber] ?? [];
  if (verseNumber !== chapter.length + 1) {
    throw new Error(`Sirasi bozuk ayet: ${verseKey}; beklenen ${chapter.length + 1}`);
  }

  chapter.push(text);
  chapters[chapterNumber] = chapter;
  seenKeys.add(verseKey);
}

if (seenKeys.size !== EXPECTED_VERSE_COUNT) {
  throw new Error(`Ayet sayisi ${seenKeys.size}; beklenen ${EXPECTED_VERSE_COUNT}`);
}

if (Object.keys(chapters).length !== EXPECTED_CHAPTER_COUNT) {
  throw new Error(`Sure sayisi ${Object.keys(chapters).length}; beklenen ${EXPECTED_CHAPTER_COUNT}`);
}

const payload = {
  metadata: {
    id: 'tr.transliteration',
    name: 'Ceviriyazi',
    author: 'Muhammet Abay',
    language: 'Turkish',
    source: 'Tanzil.net',
    sourceUrl: SOURCE_URL,
    termsUrl: 'https://tanzil.net/trans/',
    sourceLastUpdate: '2010-09-15',
    verseCount: EXPECTED_VERSE_COUNT,
    chapterCount: EXPECTED_CHAPTER_COUNT,
  },
  chapters,
};

await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
await writeFile(OUTPUT_PATH, `${JSON.stringify(payload)}\n`, 'utf8');
console.log(`${OUTPUT_PATH}: ${seenKeys.size} ayet yazildi.`);
