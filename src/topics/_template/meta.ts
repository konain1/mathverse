/**
 * TEMPLATE: copy this whole folder to src/topics/class-<n>/<your-topic-id>/ and
 * follow docs/ADDING_A_TOPIC.md. The registry ignores "_template" (it only scans
 * class-* folders), but these files are still type-checked, so they stay correct.
 */
import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: 'my-topic-id', // must equal the folder name
  family: 'cube', // 'triangle' | 'square' | 'rectangle' | 'cube'
  classLevel: 8, // must match the class-<n> folder
  title: {
    hinglish: 'Cube ki edges ki total length',
    en: 'Total edge length of a cube',
    hi: 'घन के किनारों की कुल लंबाई',
  },
  summary: {
    hinglish: 'Student kya banayega aur kya dekhega, ek-do line mein.',
    en: 'What the student builds and sees, in one or two lines.',
    hi: 'विद्यार्थी क्या बनाएगा और क्या देखेगा, एक-दो पंक्तियों में।',
  },
  ncert: { 8: 'Mensuration' }, // NCERT chapter per class (must exist in src/topics/ncertChapters.ts)
  levels: ['basic'],
  prerequisites: [], // other topic ids
  tags: ['edges'],
  order: 100,
});
