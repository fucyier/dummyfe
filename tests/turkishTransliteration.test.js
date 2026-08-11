import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getTurkishTransliteration,
  normalizeTurkishTransliteration,
} from '../src/turkishTransliteration.js';

test('academic transcription marks become Turkish-friendly characters', () => {
  assert.equal(
    normalizeTurkishTransliteration('ṣirâṭa-lleẕîne en`amte `aleyhim gayri-lmagḍûbi'),
    'Sirâta-llezîne en’amte ’aleyhim gayri-lmagdûbi',
  );
  assert.equal(
    normalizeTurkishTransliteration('ḳul e`ûẕü birabbi-nnâs'),
    'Kul e’ûzü birabbi-nnâs',
  );
});

test('verse lookup uses chapter and one-based verse numbers', () => {
  const data = { chapters: { 1: ['bismi-llâhi-rraḥmâni-rraḥîm.'] } };
  assert.equal(
    getTurkishTransliteration(data, 1, 1),
    'Bismi-llâhi-rrahmâni-rrahîm.',
  );
  assert.equal(getTurkishTransliteration(data, 1, 2), '');
});
