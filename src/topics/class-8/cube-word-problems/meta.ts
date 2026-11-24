import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cube-word-problems",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Cube aur cuboid ke word problems",
    en: "Cube and cuboid word problems",
    hi: "घन और घनाभ पर आधारित प्रश्न",
  },
  summary: {
    hinglish: "Cube ko paint karna, boxes pack karna, bade box mein kitne chhote cubes aayenge: sab build karke.",
    en: "Painting a cube, packing boxes, how many small cubes fit in a big box: all solved by building.",
    hi: "घन को रंगना, डिब्बे पैक करना, बड़े डिब्बे में कितने छोटे घन आएँगे: सब बनाकर हल करो।",
  },
  ncert: { 8: "Mensuration" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["cube-surface-area", "cube-volume", "cuboid"],
  tags: ["painting", "packing", "word problems"],
  order: 70,
});
