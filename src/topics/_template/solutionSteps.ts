import { cubeEdgeTotal } from '@/lib/geometry/formulas';
import { tx, type Params, type SolutionScript } from '@/topics/contract';

/** One entry per step: narration (3 languages) + KaTeX + an animation cue the Scene understands. */
export function solution(_questionId: string, p: Params): SolutionScript {
  const a = p.a!;
  return {
    steps: [
      {
        id: 'count',
        cue: 'edges',
        duration: 4,
        narration: tx('Cube ki 12 edges hain.', 'A cube has 12 edges.', 'घन के 12 किनारे हैं।'),
        formula: 'E = 12',
        why: tx('4 neeche, 4 upar, 4 khadi.', '4 at the bottom, 4 at the top, 4 standing up.', '4 नीचे, 4 ऊपर, 4 खड़े।'),
      },
      {
        id: 'total',
        cue: 'edges',
        duration: 4,
        narration: tx(`12 × ${a} = ${cubeEdgeTotal(a)} cm.`, `12 × ${a} = ${cubeEdgeTotal(a)} cm.`, `12 × ${a} = ${cubeEdgeTotal(a)} cm।`),
        formula: `12a = 12 \\times ${a} = ${cubeEdgeTotal(a)}\\,\\text{cm}`,
      },
    ],
    remember: tx('Cube: 12 edges, sab barabar.', 'Cube: 12 edges, all equal.', 'घन: 12 किनारे, सब बराबर।'),
    mistake: tx('Sirf 4 edges ginna.', 'Counting only 4 edges.', 'सिर्फ़ 4 किनारे गिनना।'),
  };
}
