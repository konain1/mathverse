/** A short, soft success chime synthesised with WebAudio (no audio files to download). */
let ctx: AudioContext | null = null;

export function playChime() {
  try {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx ??= new AC();
    const now = ctx.currentTime;
    // C major arpeggio: C5 E5 G5 C6
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = ctx!.createOscillator();
      const g = ctx!.createGain();
      o.type = 'sine';
      o.frequency.value = f;
      const t0 = now + i * 0.09;
      g.gain.setValueAtTime(0, t0);
      g.gain.linearRampToValueAtTime(0.12, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t0 + 0.6);
      o.connect(g).connect(ctx!.destination);
      o.start(t0);
      o.stop(t0 + 0.65);
    });
  } catch {
    /* audio is optional */
  }
}
