import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "rectangle-perimeter-area",
  family: "rectangle",
  classLevel: 7,
  title: {
    hinglish: "Rectangle ka perimeter aur area",
    en: "Perimeter and area of a rectangle",
    hi: "आयत का परिमाप और क्षेत्रफल",
  },
  summary: {
    hinglish: "Unit squares se row by row tile karo: area = length × breadth, perimeter = 2(l + b).",
    en: "Tile it row by row with unit squares: area = length × breadth, perimeter = 2(l + b).",
    hi: "इकाई वर्गों से पंक्ति-दर-पंक्ति भरो: क्षेत्रफल = लंबाई × चौड़ाई, परिमाप = 2(l + b)।",
  },
  ncert: { 7: "Perimeter and Area" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["perimeter", "area", "unit squares"],
  order: 20,
  signature: true,
});
