import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "rectangle-word-problems",
  family: "rectangle",
  classLevel: 7,
  title: {
    hinglish: "Rectangle ke word problems",
    en: "Rectangle word problems",
    hi: "आयत पर आधारित प्रश्न",
  },
  summary: {
    hinglish: "Garden ke chaaron taraf path, farsh par tiles, fence ki length: asli zindagi ke sawaal, figure bana ke.",
    en: "A path around a garden, tiles on a floor, fencing a field: real-life problems, solved by building the figure.",
    hi: "बगीचे के चारों ओर रास्ता, फ़र्श पर टाइलें, बाड़ की लंबाई: असली ज़िंदगी के सवाल, आकृति बनाकर।",
  },
  ncert: { 7: "Perimeter and Area" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["rectangle-perimeter-area"],
  tags: ["path", "tiles", "fencing", "word problems"],
  order: 40,
});
