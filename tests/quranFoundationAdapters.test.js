import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createQuranFoundationVerseMap,
  mergeQuranFoundationVerse,
  normalizeQuranFoundationChapters,
  normalizeQuranFoundationTranslationResources,
} from '../src/quranFoundationAdapters.js';

const chapters = Array.from({ length: 114 }, (_, index) => ({
  id: index + 1,
  translated_name: { name: `Sure ${index + 1}` },
  name_arabic: `Arabic ${index + 1}`,
  verses_count: index === 1 ? 286 : 3,
  revelation_place: 'makkah',
  revelation_order: index + 1,
  bismillah_pre: index !== 0,
  pages: [1, 1],
}));

test('chapter adapter preserves the component contract and legacy slugs', () => {
  const normalized = normalizeQuranFoundationChapters(chapters);

  assert.equal(normalized.length, 114);
  assert.deepEqual(normalized[0], {
    id: 1,
    name: 'Sure 1',
    name_original: 'Arabic 1',
    verse_count: 3,
    slug: 'fatiha',
    revelation_place: 'makkah',
    revelation_order: 1,
    bismillah_pre: false,
    pages: [1, 1],
  });
  assert.equal(normalized[2].slug, 'ali-imran');
  assert.equal(normalized[113].slug, 'nas');
});

test('chapter adapter rejects incomplete catalogs', () => {
  assert.throws(
    () => normalizeQuranFoundationChapters(chapters.slice(0, 113)),
    /114 sure/,
  );
});

test('verse adapter validates a complete chapter before merging', () => {
  const pages = [{
    verses: [
      { verse_number: 1, verse_key: '1:1', text_uthmani: 'Arapca 1', page_number: 1 },
      { verse_number: 2, verse_key: '1:2', text_uthmani: 'Arapca 2', page_number: 1 },
      { verse_number: 3, verse_key: '1:3', text_uthmani: 'Arapca 3', page_number: 1 },
    ],
  }];

  const verseMap = createQuranFoundationVerseMap(pages, 1, 3);
  const legacyVerse = {
    id: 11,
    verse_number: 2,
    verse: 'Eski Arapca',
    transcription: 'Latin okuma',
    translation: { text: 'Secili meal' },
  };
  const merged = mergeQuranFoundationVerse(legacyVerse, verseMap.get(2), [{ id: 22 }]);

  assert.equal(merged.verse, 'Arapca 2');
  assert.equal(merged.transcription, 'Latin okuma');
  assert.deepEqual(merged.translation, { text: 'Secili meal' });
  assert.deepEqual(merged.quranFoundationWords, [{ id: 22 }]);
});

test('verse adapter rejects cross-chapter verses', () => {
  assert.throws(
    () => createQuranFoundationVerseMap([{ verses: [
      { verse_number: 1, verse_key: '2:1', text_uthmani: 'Arapca' },
    ] }], 1, 1),
    /eslesmiyor/,
  );
});

test('translation adapter exposes only Quran Foundation Turkish meals', () => {
  const resources = normalizeQuranFoundationTranslationResources([
    { id: 77, name: 'Turkish Translation (Diyanet)', author_name: 'Diyanet Isleri', language_name: 'Turkish' },
    { id: 52, name: 'Elmalili Hamdi Yazir', author_name: 'Elmalili Hamdi Yazir', language_name: 'Turkish' },
    { id: 112, name: 'Shaban Britch', author_name: 'Shaban Britch', language_name: 'Turkish' },
    { id: 20, name: 'English Translation', author_name: 'Sahih International', language_name: 'English' },
  ]);

  assert.deepEqual(resources.map(item => item.id), [77, 52, 112]);
  assert.equal(resources[0].name, 'Diyanet \u0130\u015fleri Ba\u015fkanl\u0131\u011f\u0131');
  assert.equal(resources[2].name, '\u015eaban Piri\u015f');
  assert.equal(resources[2].description, '\u015eaban Piri\u015f');
  assert.ok(resources.every(item => item.source === 'quranfoundation' && item.language === 'tr'));
});
