import type { PhonemeScore } from "@/core/types";

export type WordResult = "correct" | null;

export function getWordResult(phonemes: readonly PhonemeScore[]): WordResult {
  if (phonemes.length === 0) return null;
  return phonemes.every((p) => p.verdict === "ok") ? "correct" : null;
}
