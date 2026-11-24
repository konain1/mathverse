import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-herons-formula",
  family: "triangle",
  classLevel: 9,
  title: {
    hinglish: "Heron's formula",
    en: "Heron's formula",
    hi: "हीरोन का सूत्र",
  },
  summary: {
    hinglish: "Jab height pata na ho, sirf teen sides se area nikalo, semi-perimeter s = (a + b + c) / 2 ki madad se.",
    en: "Find the area from just the three sides when the height is unknown, using the semi-perimeter s = (a + b + c) / 2.",
    hi: "जब ऊँचाई पता न हो, तब अर्धपरिमाप s = (a + b + c) / 2 की मदद से केवल तीन भुजाओं से क्षेत्रफल निकालो।",
  },
  ncert: { 9: "Heron's Formula" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-perimeter-area"],
  tags: ["area", "semi-perimeter", "heron"],
  order: 90,
});
