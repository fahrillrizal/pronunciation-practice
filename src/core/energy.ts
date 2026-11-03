import { TRIM_NOISE_PERCENTILE, TRIM_THRESHOLD_DB, VAD_FRAME_MS } from "./constants.ts";
import { msToSamples } from "./time.ts";

export function rmsDb(samples: Float32Array, start = 0, end = samples.length): number {
  let sum = 0;
  for (let i = start; i < end; i++) sum += samples[i] * samples[i];
  const rms = Math.sqrt(sum / Math.max(1, end - start));
  return 20 * Math.log10(Math.max(rms, 1e-9));
}

function frameEnergiesDb(samples: Float32Array, frameSize: number): number[] {
  const energies: number[] = [];
  for (let start = 0; start + frameSize <= samples.length; start += frameSize) {
    energies.push(rmsDb(samples, start, start + frameSize));
  }
  return energies;
}

function percentile(values: readonly number[], q: number): number {
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))];
}

export function findSpeechBounds(samples: Float32Array, sampleRate: number): [number, number] {
  const frameSize = msToSamples(VAD_FRAME_MS, sampleRate);
  const energies = frameEnergiesDb(samples, frameSize);
  if (energies.length === 0) return [0, samples.length];

  const threshold = percentile(energies, TRIM_NOISE_PERCENTILE) + TRIM_THRESHOLD_DB;
  const first = energies.findIndex((e) => e > threshold);
  if (first === -1) return [0, samples.length];
  const last = energies.findLastIndex((e) => e > threshold);
  return [first * frameSize, Math.min(samples.length, (last + 1) * frameSize)];
}

export function envelope(samples: Float32Array, points: number): number[] {
  if (samples.length === 0 || points <= 0) return [];
  const block = samples.length / points;
  const peaks = Array.from({ length: points }, (_, p) => {
    const start = Math.floor(p * block);
    const end = Math.max(start + 1, Math.floor((p + 1) * block));
    let peak = 0;
    for (let i = start; i < end && i < samples.length; i++) peak = Math.max(peak, Math.abs(samples[i]));
    return peak;
  });
  const max = Math.max(...peaks);
  return max > 0 ? peaks.map((v) => v / max) : peaks;
}
