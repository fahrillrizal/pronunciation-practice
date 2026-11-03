import { CMVN_MIN_STD } from "./constants.ts";
import type { FeatureMatrix } from "./types.ts";

// Per-utterance cepstral mean/variance normalization (PRD decision #7): a
// constant channel response is additive in the cepstral domain, so subtracting
// the mean removes most microphone and room differences.
export function applyCmvn(features: FeatureMatrix): FeatureMatrix {
  if (features.length === 0) return [];
  const dims = features[0].length;
  const mean = new Float64Array(dims);
  const variance = new Float64Array(dims);

  for (const frame of features) for (let d = 0; d < dims; d++) mean[d] += frame[d] / features.length;
  for (const frame of features) {
    for (let d = 0; d < dims; d++) variance[d] += (frame[d] - mean[d]) ** 2 / features.length;
  }
  const std = variance.map((v) => Math.max(CMVN_MIN_STD, Math.sqrt(v)));

  return features.map((frame) => frame.map((value, d) => (value - mean[d]) / std[d]));
}
