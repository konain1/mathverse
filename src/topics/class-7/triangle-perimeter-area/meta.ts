import { defineTopic } from '@/topics/types';

export const meta = defineTopic({
  id: "triangle-perimeter-area",
  family: "triangle",
  classLevel: 7,
  title: {
    hinglish: "Triangle ka perimeter aur area",
    en: "Perimeter and area of a triangle",
    hi: "त्रिभुज का परिमाप और क्षेत्रफल",
  },
  summary: {
    hinglish: "Triangle ki copy ko ghuma kar parallelogram banao, aur dekho ki area = ½ × base × height kyun hai.",
    en: "Copy and rotate the triangle into a parallelogram to see why area = ½ × base × height.",
    hi: "त्रिभुज की प्रति को घुमाकर समांतर चतुर्भुज बनाओ और देखो कि क्षेत्रफल = ½ × आधार × ऊँचाई क्यों है।",
  },
  ncert: { 7: "Perimeter and Area" },
  levels: ['basic', 'medium', 'hard', 'challenge'],
  prerequisites: ["rectangle-perimeter-area", "triangle-median-altitude"],
  tags: ["perimeter", "area", "base", "height"],
  order: 80,
  signature: true,
});
