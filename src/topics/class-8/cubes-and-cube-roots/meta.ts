import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cubes-and-cube-roots",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Cubes aur cube roots",
    en: "Cubes and cube roots",
    hi: "घन और घनमूल",
  },
  summary: {
    hinglish: "3 × 3 × 3 = 27 unit cubes. Ulta socho: ∛27 = 3. Kaunse numbers perfect cubes hain?",
    en: "3 × 3 × 3 = 27 unit cubes. Run it backwards: ∛27 = 3. Which numbers are perfect cubes?",
    hi: "3 × 3 × 3 = 27 इकाई घन। उल्टा सोचो: ∛27 = 3। कौन-सी संख्याएँ पूर्ण घन हैं?",
  },
  ncert: { 8: "Cubes and Cube Roots" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["cube-volume"],
  tags: ["perfect cubes", "cube root"],
  order: 60,
});
