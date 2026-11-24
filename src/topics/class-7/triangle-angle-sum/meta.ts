import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-angle-sum",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Angle sum property",
    en: "Angle sum property",
    hi: "कोण योग गुणधर्म",
  },
  summary: {
    hinglish: "Teeno corners ko kaat kar ek seedhi line par rakho, aur dekho ki angles ka sum hamesha 180° kyun hota hai.",
    en: "Tear off the three corners, line them up on a straight line, and see why the angles always add up to 180°.",
    hi: "तीनों कोनों को काटकर एक सीधी रेखा पर रखो और देखो कि कोणों का योग हमेशा 180° क्यों होता है।",
  },
  ncert: { 7: "The Triangle and its Properties", 9: "Lines and Angles" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-types"],
  tags: ["angles", "180 degrees", "proof"],
  order: 20,
  signature: true,
});
