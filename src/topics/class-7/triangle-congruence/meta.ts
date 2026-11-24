import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-congruence",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Congruence: SSS, SAS, ASA, RHS",
    en: "Congruence: SSS, SAS, ASA, RHS",
    hi: "सर्वांगसमता: SSS, SAS, ASA, RHS",
  },
  summary: {
    hinglish: "Ek triangle ko slide, rotate ya flip karke doosre par rakho, aur samjho ki kaunsi teen cheezein match honi chahiye.",
    en: "Slide, rotate or flip one triangle onto another and learn which three measurements must match.",
    hi: "एक त्रिभुज को खिसकाकर, घुमाकर या पलटकर दूसरे पर रखो और समझो कि कौन-सी तीन माप मिलनी चाहिए।",
  },
  ncert: { 7: "Congruence of Triangles", 9: "Triangles" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["triangle-types", "triangle-angle-sum"],
  tags: ["congruence", "SSS", "SAS", "ASA", "RHS"],
  order: 70,
  signature: true,
});
