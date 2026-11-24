import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "square-diagonal",
  family: "square",
  classLevel: 8,
  title: {
    hinglish: "Square ka diagonal",
    en: "Diagonal of a square",
    hi: "वर्ग का विकर्ण",
  },
  summary: {
    hinglish: "Diagonal kheencho, right triangle pehchano aur nikalo diagonal = a√2. Ulta bhi: area = d² / 2.",
    en: "Draw the diagonal, spot the right triangle and derive diagonal = a√2. Then reverse it: area = d² / 2.",
    hi: "विकर्ण खींचो, समकोण त्रिभुज पहचानो और निकालो विकर्ण = a√2। उल्टा भी: क्षेत्रफल = d² / 2।",
  },
  ncert: { 8: "Mensuration", 9: "Number Systems" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["square-properties", "triangle-pythagoras"],
  tags: ["diagonal", "root 2", "area from diagonal"],
  order: 30,
  signature: true,
});
