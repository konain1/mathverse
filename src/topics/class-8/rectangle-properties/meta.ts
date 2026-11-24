import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "rectangle-properties",
  family: "rectangle",
  classLevel: 8,
  title: {
    hinglish: "Rectangle ki properties",
    en: "Properties of a rectangle",
    hi: "आयत के गुण",
  },
  summary: {
    hinglish: "Aamne-saamne ki sides barabar aur parallel, chaaron angles 90°, aur dono diagonals barabar.",
    en: "Opposite sides are equal and parallel, all four angles are 90°, and both diagonals are equal.",
    hi: "आमने-सामने की भुजाएँ बराबर और समांतर, चारों कोण 90°, और दोनों विकर्ण बराबर।",
  },
  ncert: { 8: "Understanding Quadrilaterals", 9: "Quadrilaterals" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["sides", "angles", "diagonals"],
  order: 10,
});
