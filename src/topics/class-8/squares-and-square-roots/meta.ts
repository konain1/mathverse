import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "squares-and-square-roots",
  family: "square",
  classLevel: 8,
  title: {
    hinglish: "Squares aur square roots",
    en: "Squares and square roots",
    hi: "वर्ग और वर्गमूल",
  },
  summary: {
    hinglish: "n × n grid banao: 5 × 5 = 25 unit squares. Ulta socho to √25 = 5.",
    en: "Build an n × n grid: 5 × 5 = 25 unit squares. Run it backwards and √25 = 5.",
    hi: "n × n जाली बनाओ: 5 × 5 = 25 इकाई वर्ग। उल्टा सोचो तो √25 = 5।",
  },
  ncert: { 8: "Squares and Square Roots" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["square-perimeter-area"],
  tags: ["perfect squares", "square root", "grid"],
  order: 40,
});
