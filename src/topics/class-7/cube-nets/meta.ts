import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cube-nets",
  family: "cube",
  classLevel: 7,
  title: {
    hinglish: "Cube ke nets",
    en: "Nets of a cube",
    hi: "घन के जाल",
  },
  summary: {
    hinglish: "Cube ko khol ke flat karo. 6 squares ke kaunse patterns wapas cube ban sakte hain?",
    en: "Unfold a cube flat. Which patterns of 6 squares fold back into a cube?",
    hi: "घन को खोलकर सपाट करो। 6 वर्गों के कौन-से पैटर्न मोड़ने पर फिर से घन बनते हैं?",
  },
  ncert: { 7: "Visualising Solid Shapes", 8: "Visualising Solid Shapes" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: [],
  tags: ["nets", "unfolding", "faces"],
  order: 10,
  signature: true,
});
