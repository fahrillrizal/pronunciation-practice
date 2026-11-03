import {
  DURATION_MISMATCH_MAX_RATIO,
  DURATION_MISMATCH_MIN_RATIO,
  DURATION_TOO_LONG_RATIO,
  DURATION_TOO_SHORT_RATIO,
  LOW_CONFIDENCE_MIN_FRAMES,
  MIN_SCORED_PHONEMES,
  MISMATCH_MIN_MEDIAN,
  MISMATCH_RELATIVE_RATIO,
} from "./constants.ts";
import type { PhonemeMeasurement, PhonemeScore, PhonemeVerdict } from "./types.ts";

const VOWELS = new Set(["AA", "AE", "AH", "AO", "AW", "AY", "EH", "ER", "EY", "IH", "IY", "OW", "OY", "UH", "UW"]);

export function median(values: readonly number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
}

// Each phoneme is compared against how far the two reference speakers are from
// each other on that same phoneme. That baseline is independent of the user's
// errors, unlike the word's own median, so a globally wrong utterance can still
// be flagged. Without two references the word median is the fallback.
export function scorePhonemes(
  measurements: readonly PhonemeMeasurement[],
  calibration?: readonly number[] | null,
): PhonemeScore[] {
  const confident = measurements.filter((m) => m.mappedFrames >= LOW_CONFIDENCE_MIN_FRAMES);
  const fallback = Math.max(MISMATCH_MIN_MEDIAN, median(confident.map((m) => m.distance)));
  const canCompare = confident.length >= MIN_SCORED_PHONEMES;

  return measurements.map((m): PhonemeScore => {
    const baseline = Math.max(MISMATCH_MIN_MEDIAN, calibration?.[m.index] ?? fallback);
    const relativeDistance = m.distance / baseline;
    const durationRatio = m.referenceDurationMs > 0 ? m.userDurationMs / m.referenceDurationMs : 1;
    const vowelTooLong = VOWELS.has(m.phoneme) && durationRatio > DURATION_MISMATCH_MAX_RATIO;
    const vowelTooShort = VOWELS.has(m.phoneme) && durationRatio < DURATION_MISMATCH_MIN_RATIO;
    let verdict: PhonemeVerdict = "ok";
    if (m.mappedFrames < LOW_CONFIDENCE_MIN_FRAMES) verdict = "low-confidence";
    else if (canCompare && relativeDistance > MISMATCH_RELATIVE_RATIO) verdict = "mismatch";
    else if (vowelTooLong || vowelTooShort) verdict = "mismatch";
    return { ...m, relativeDistance, verdict };
  });
}

function calloutFor(score: PhonemeScore): string | null {
  const label = `/${score.phoneme.toLowerCase()}/`;
  if (score.verdict === "low-confidence") return `Bunyi ${label} hampir tidak terdengar dalam ucapanmu.`;

  const ratio = score.referenceDurationMs > 0 ? score.userDurationMs / score.referenceDurationMs : 1;
  if (ratio >= DURATION_TOO_LONG_RATIO) return `Kamu menahan bunyi ${label} terlalu lama.`;
  if (ratio <= DURATION_TOO_SHORT_RATIO) return `Bunyi ${label} kamu ucapkan terlalu singkat.`;
  if (score.verdict === "mismatch") return `Bunyi ${label} paling jauh berbeda dari referensi.`;
  return null;
}

export function buildCallouts(scores: readonly PhonemeScore[]): string[] {
  return [...new Set(scores.map(calloutFor).filter((c): c is string => c !== null))];
}
