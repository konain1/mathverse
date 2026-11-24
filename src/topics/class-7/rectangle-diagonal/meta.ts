import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "rectangle-diagonal",
  family: "rectangle",
  classLevel: 7,
  title: {
    hinglish: "Rectangle ka diagonal",
    en: "Diagonal of a rectangle",
    hi: "आयत का विकर्ण",
  },
  summary: {
    hinglish: "Diagonal rectangle ko do congruent triangles mein baant deta hai. Pythagoras se uski length nikalo.",
    en: "The diagonal splits a rectangle into two congruent triangles. Use Pythagoras to find its length.",
    hi: "विकर्ण आयत को दो सर्वांगसम त्रिभुजों में बाँटता है। पाइथागोरस से उसकी लंबाई निकालो।",
  },
  ncert: { 7: "The Triangle and its Properties", 9: "Quadrilaterals" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["rectangle-properties", "triangle-pythagoras"],
  tags: ["diagonal", "pythagoras", "congruent triangles"],
  order: 30,
  signature: true,
});
