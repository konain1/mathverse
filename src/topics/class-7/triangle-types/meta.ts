import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-types",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Triangle ke prakaar",
    en: "Types of triangles",
    hi: "त्रिभुजों के प्रकार",
  },
  summary: {
    hinglish: "Sides aur angles ke hisaab se triangles ko pehchano: equilateral, isosceles, scalene, acute, right aur obtuse.",
    en: "Classify triangles by their sides and by their angles: equilateral, isosceles, scalene, acute, right and obtuse.",
    hi: "भुजाओं और कोणों के आधार पर त्रिभुजों को पहचानो: समबाहु, समद्विबाहु, विषमबाहु, न्यूनकोण, समकोण और अधिककोण।",
  },
  ncert: { 7: "The Triangle and its Properties" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["classification", "sides", "angles"],
  order: 10,
});
