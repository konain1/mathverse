import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cube-euler",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Faces, edges, vertices aur Euler's formula",
    en: "Faces, edges, vertices and Euler's formula",
    hi: "फलक, किनारे, शीर्ष और ऑयलर का सूत्र",
  },
  summary: {
    hinglish: "Cube aur cuboid par har face, edge aur vertex gino: V − E + F = 2.",
    en: "Count every face, edge and vertex on a cube and a cuboid: V − E + F = 2.",
    hi: "घन और घनाभ के हर फलक, किनारे और शीर्ष को गिनो: V − E + F = 2।",
  },
  ncert: { 8: "Visualising Solid Shapes" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["cube-nets"],
  tags: ["faces", "edges", "vertices", "euler"],
  order: 20,
  signature: true,
});
