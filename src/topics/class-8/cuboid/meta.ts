import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cuboid",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Cube vs cuboid",
    en: "Cube vs cuboid",
    hi: "घन और घनाभ",
  },
  summary: {
    hinglish: "Cuboid ki teen alag dimensions hoti hain: l, b, h. Uska LSA, TSA aur volume nikalo aur cube se compare karo.",
    en: "A cuboid has three dimensions l, b and h. Find its LSA, TSA and volume, and compare it with a cube.",
    hi: "घनाभ की तीन विमाएँ होती हैं: l, b, h। उसका पार्श्व और कुल पृष्ठीय क्षेत्रफल तथा आयतन निकालो और घन से तुलना करो।",
  },
  ncert: { 8: "Mensuration", 9: "Surface Areas and Volumes" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["cube-surface-area", "cube-volume", "rectangle-perimeter-area"],
  tags: ["cuboid", "LSA", "TSA", "volume"],
  order: 50,
});
