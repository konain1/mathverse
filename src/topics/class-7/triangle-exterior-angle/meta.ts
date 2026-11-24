import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-exterior-angle",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Exterior angle property",
    en: "Exterior angle property",
    hi: "बहिष्कोण गुणधर्म",
  },
  summary: {
    hinglish: "Ek side ko aage badhao: bahar wala angle, saamne ke do andar wale angles ke sum ke barabar hota hai.",
    en: "Extend one side: the exterior angle equals the sum of the two opposite interior angles.",
    hi: "एक भुजा को आगे बढ़ाओ: बहिष्कोण, दोनों अंतराभिमुख कोणों के योग के बराबर होता है।",
  },
  ncert: { 7: "The Triangle and its Properties", 9: "Lines and Angles" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-angle-sum"],
  tags: ["angles", "exterior angle"],
  order: 30,
  signature: true,
});
