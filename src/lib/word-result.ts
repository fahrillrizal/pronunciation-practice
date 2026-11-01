import type { PhonemeResult } from "@/types";

export type WordResult = "correct" | null;

/**
 * Determines overall word pronunciation result.
 *
 * @returns "correct" if every phoneme verdict is "ok", otherwise null
 */
export function getWordResult(phonemes: PhonemeResult[]): WordResult {
  if (phonemes.length === 0) return null;
  return phonemes.every((p) => p.verdict === "ok") ? "correct" : null;
}
