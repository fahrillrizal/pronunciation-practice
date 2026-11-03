import Meyda from "meyda";
import { FRAME_SIZE, HOP_LENGTH, N_MELS, N_MFCC, SAMPLE_RATE } from "./constants.ts";
import type { FeatureMatrix } from "./types.ts";

// Meyda takes ln(1 + energy). On [-1, 1] samples the energy is tiny and the
// log degenerates to a linear map, so samples are scaled to 16-bit range first.
const PCM16_SCALE = 32768;

export function frameCount(sampleCount: number): number {
  if (sampleCount <= FRAME_SIZE) return 1;
  return 1 + Math.floor((sampleCount - FRAME_SIZE) / HOP_LENGTH);
}

function configureMeyda(): void {
  Meyda.bufferSize = FRAME_SIZE;
  Meyda.sampleRate = SAMPLE_RATE;
  Meyda.melBands = N_MELS;
  Meyda.numberOfMFCCCoefficients = N_MFCC;
  Meyda.windowingFunction = "hanning";
}

export function extractMfcc(samples: Float32Array): FeatureMatrix {
  configureMeyda();
  const frame = new Float32Array(FRAME_SIZE);

  return Array.from({ length: frameCount(samples.length) }, (_, index) => {
    const start = index * HOP_LENGTH;
    frame.fill(0);
    samples.subarray(start, start + FRAME_SIZE).forEach((s, i) => (frame[i] = s * PCM16_SCALE));
    return Float64Array.from(Meyda.extract("mfcc", frame) as number[]);
  });
}
