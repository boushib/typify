/** A soft synthesized key click (no audio files), lower for the space bar */
let ctx: AudioContext | null = null

export const playClick = (space = false) => {
  try {
    ctx ??= new AudioContext()
    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.type = "triangle"
    osc.frequency.setValueAtTime(space ? 180 : 420 + Math.random() * 80, now)
    osc.frequency.exponentialRampToValueAtTime(space ? 90 : 220, now + 0.05)
    gain.gain.setValueAtTime(0.08, now)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.06)
    osc.connect(gain).connect(ctx.destination)
    osc.start(now)
    osc.stop(now + 0.07)
  } catch {
    // Audio isn't available (or not allowed yet); typing works without it
  }
}
