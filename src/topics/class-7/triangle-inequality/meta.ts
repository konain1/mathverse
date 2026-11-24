import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-inequality",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Triangle inequality",
    en: "Triangle inequality",
    hi: "त्रिभुज असमिका",
  },
  summary: {
    hinglish: "Kisi bhi do sides ka sum teesri side se bada hona chahiye. Lengths badal ke dekho kab triangle banta hai.",
    en: "Any two sides must add up to more than the third. Change the lengths and see when a triangle can close.",
    hi: "किन्हीं दो भुजाओं का योग तीसरी भुजा से बड़ा होना चाहिए। लंबाइयाँ बदलकर देखो कि त्रिभुज कब बनता है।",
  },
  ncert: { 7: "The Triangle and its Properties", 9: "Triangles" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-types"],
  tags: ["sides", "inequality"],
  order: 60,
});
