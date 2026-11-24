import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-pythagoras",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Pythagoras theorem",
    en: "Pythagoras theorem",
    hi: "पाइथागोरस प्रमेय",
  },
  summary: {
    hinglish: "Right triangle ki teeno sides par squares banao aur rearrangement se dekho: a² + b² = c².",
    en: "Build squares on the three sides of a right triangle and watch a rearrangement prove a² + b² = c².",
    hi: "समकोण त्रिभुज की तीनों भुजाओं पर वर्ग बनाओ और पुनर्व्यवस्था से देखो: a² + b² = c²।",
  },
  ncert: { 7: "The Triangle and its Properties", 8: "Squares and Square Roots" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-types", "square-perimeter-area"],
  tags: ["right triangle", "hypotenuse", "pythagorean triplets"],
  order: 50,
  signature: true,
});
