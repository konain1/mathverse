import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "square-perimeter-area",
  family: "square",
  classLevel: 7,
  title: {
    hinglish: "Square ka perimeter aur area",
    en: "Perimeter and area of a square",
    hi: "वर्ग का परिमाप और क्षेत्रफल",
  },
  summary: {
    hinglish: "Perimeter = 4 × side, area = side × side. Unit squares se bhar ke khud gino.",
    en: "Perimeter = 4 × side and area = side × side. Fill it with unit squares and count.",
    hi: "परिमाप = 4 × भुजा, क्षेत्रफल = भुजा × भुजा। इकाई वर्गों से भरकर खुद गिनो।",
  },
  ncert: { 7: "Perimeter and Area" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["perimeter", "area", "unit squares"],
  order: 20,
});
