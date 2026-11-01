interface EnvelopeSegment {
  center: number;
  width: number;
  amp: number;
}

/**
 * Generates a deterministic speech-like waveform envelope.
 *
 * Produces an array of normalized amplitude values (0–1) simulating
 * a speech signal envelope using cosine-tapered pulses.
 *
 * @param segments - Pulse definitions controlling the envelope shape
 * @param totalSamples - Number of output samples (default: 160)
 * @returns Array of amplitude values clamped between 0.02 and 0.96
 */
export function generateSpeechEnvelope(
  segments: EnvelopeSegment[],
  totalSamples = 160,
): number[] {
  const NOISE_FLOOR = 0.03;
  const VARIATION_AMPLITUDE = 0.04;
  const VARIATION_FREQUENCY = 0.35;
  const MIN_AMPLITUDE = 0.02;
  const MAX_AMPLITUDE = 0.96;

  const samples: number[] = [];

  for (let i = 0; i < totalSamples; i++) {
    const normalizedPosition = i / totalSamples;

    let envelope = NOISE_FLOOR;
    for (const seg of segments) {
      const distance = Math.abs(normalizedPosition - seg.center);
      if (distance < seg.width) {
        const pulse = 0.5 * (1 + Math.cos((Math.PI * distance) / seg.width));
        envelope += pulse * seg.amp;
      }
    }

    const variation = VARIATION_AMPLITUDE * Math.sin(i * VARIATION_FREQUENCY);
    const clamped = Math.min(
      MAX_AMPLITUDE,
      Math.max(MIN_AMPLITUDE, envelope + variation),
    );

    samples.push(Number(clamped.toFixed(3)));
  }

  return samples;
}
