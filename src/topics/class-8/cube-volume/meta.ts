import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "cube-volume",
  family: "cube",
  classLevel: 8,
  title: {
    hinglish: "Cube ka volume",
    en: "Volume of a cube",
    hi: "घन का आयतन",
  },
  summary: {
    hinglish: "Cube ko unit cubes se layer by layer bharo aur gino: volume = a³.",
    en: "Fill the cube with unit cubes, layer by layer, and count: volume = a³.",
    hi: "घन को इकाई घनों से परत-दर-परत भरो और गिनो: आयतन = a³।",
  },
  ncert: { 8: "Mensuration", 9: "Surface Areas and Volumes" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["square-perimeter-area"],
  tags: ["volume", "unit cubes", "layers"],
  order: 40,
  signature: true,
});
