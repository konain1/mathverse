import type { LocalizedText } from './types';

/**
 * Official NCERT chapter names (English edition) → display name per language.
 * meta.ts files store the English name; add new chapters here when you add topics
 * (a test fails if a chapter used by a topic is missing).
 */
export const NCERT_CHAPTERS: Record<string, LocalizedText> = {
  'The Triangle and its Properties': { hinglish: 'The Triangle and its Properties', en: 'The Triangle and its Properties', hi: 'त्रिभुज और उसके गुण' },
  'Congruence of Triangles': { hinglish: 'Congruence of Triangles', en: 'Congruence of Triangles', hi: 'त्रिभुजों की सर्वांगसमता' },
  'Perimeter and Area': { hinglish: 'Perimeter and Area', en: 'Perimeter and Area', hi: 'परिमाप और क्षेत्रफल' },
  'Visualising Solid Shapes': { hinglish: 'Visualising Solid Shapes', en: 'Visualising Solid Shapes', hi: 'ठोस आकारों का चित्रण' },
  'Understanding Quadrilaterals': { hinglish: 'Understanding Quadrilaterals', en: 'Understanding Quadrilaterals', hi: 'चतुर्भुजों को समझना' },
  'Squares and Square Roots': { hinglish: 'Squares and Square Roots', en: 'Squares and Square Roots', hi: 'वर्ग और वर्गमूल' },
  'Cubes and Cube Roots': { hinglish: 'Cubes and Cube Roots', en: 'Cubes and Cube Roots', hi: 'घन और घनमूल' },
  Mensuration: { hinglish: 'Mensuration', en: 'Mensuration', hi: 'क्षेत्रमिति' },
  'Lines and Angles': { hinglish: 'Lines and Angles', en: 'Lines and Angles', hi: 'रेखाएँ और कोण' },
  Triangles: { hinglish: 'Triangles', en: 'Triangles', hi: 'त्रिभुज' },
  Quadrilaterals: { hinglish: 'Quadrilaterals', en: 'Quadrilaterals', hi: 'चतुर्भुज' },
  "Heron's Formula": { hinglish: "Heron's Formula", en: "Heron's Formula", hi: 'हीरोन का सूत्र' },
  'Surface Areas and Volumes': { hinglish: 'Surface Areas and Volumes', en: 'Surface Areas and Volumes', hi: 'पृष्ठीय क्षेत्रफल और आयतन' },
  'Number Systems': { hinglish: 'Number Systems', en: 'Number Systems', hi: 'संख्या पद्धति' },
};

export function chapterText(name: string): LocalizedText {
  return NCERT_CHAPTERS[name] ?? { hinglish: name, en: name, hi: name };
}
