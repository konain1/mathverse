import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cube-surface-area",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Cube ka surface area",
    en: "Surface area of a cube",
    hi: "घन का पृष्ठीय क्षेत्रफल",
  },
  summary: {
    hinglish: "6 faces ek-ek karke chamkao, area jodte jao, phir cube ko khol ke net dekho: TSA = 6a², LSA = 4a².",
    en: "Light up the 6 faces one by one, add their areas, then unfold the cube into its net: TSA = 6a², LSA = 4a².",
    hi: "6 फलकों को एक-एक करके चमकाओ, क्षेत्रफल जोड़ते जाओ, फिर घन को खोलकर जाल देखो: कुल पृष्ठीय क्षेत्रफल = 6a², पार्श्व पृष्ठीय क्षेत्रफल = 4a²।",
  },
  ncert: { 8: "Mensuration", 9: "Surface Areas and Volumes" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["square-perimeter-area", "cube-nets"],
  tags: ["surface area", "LSA", "TSA", "net"],
  order: 30,
  signature: true,
});
