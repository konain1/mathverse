import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "square-properties",
  family: "square",
  classLevel: 8,
  title: {
    hinglish: "Square ki properties",
    en: "Properties of a square",
    hi: "वर्ग के गुण",
  },
  summary: {
    hinglish: "Chaaron sides barabar, chaaron angles 90°, aur diagonals barabar jo ek doosre ko 90° par aadha karte hain.",
    en: "Four equal sides, four right angles, and equal diagonals that bisect each other at 90°.",
    hi: "चारों भुजाएँ बराबर, चारों कोण 90°, और विकर्ण बराबर जो एक-दूसरे को 90° पर समद्विभाजित करते हैं।",
  },
  ncert: { 8: "Understanding Quadrilaterals", 9: "Quadrilaterals" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["sides", "angles", "diagonals"],
  order: 10,
});
