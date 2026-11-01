import type { SentenceAttempt, WordAnalysis } from "@/types";
import { MOCK_SENTENCE_ATTEMPTS } from "@/data/mock-attempts";

/**
 * Creates a fallback sentence attempt for text that has no mock data.
 *
 * Individual words are checked against the mock dictionary. If a word
 * is found, its annotated data is reused; otherwise a synthetic
 * placeholder is generated.
 */
function buildFallbackAttempt(text: string): SentenceAttempt {
  const trimmedText = text.trim();

  if (trimmedText.length === 0) {
    return { text, words: [] };
  }

  const words = trimmedText.split(/\s+/).map((wordStr, idx): WordAnalysis => {
    const cleanWord = wordStr.replace(/[^a-zA-Z]/g, "").toLowerCase();
    const wordMatch = MOCK_SENTENCE_ATTEMPTS[cleanWord]?.words[0];

    if (wordMatch?.kind === "annotated") {
      return { ...wordMatch, index: idx, text: wordStr };
    }

    return {
      index: idx,
      text: wordStr,
      kind: "synthetic",
      hasProblem: false,
      reference: [],
      phonemes: [],
      referenceWaveform: [],
      userWaveform: [],
      referenceTotalMs: 0,
      userTotalMs: 0,
      callouts: [],
    };
  });

  return { text, words };
}

/**
 * Resolves a sentence attempt from mock data or builds a fallback.
 *
 * @param text - The input text to look up
 * @param isImproved - Whether to apply the "corrected" version
 */
export function resolveSentenceAttempt(
  text: string,
  isImproved: boolean,
): SentenceAttempt {
  const normalizedText = text.trim().toLowerCase();
  const baseAttempt = MOCK_SENTENCE_ATTEMPTS[normalizedText];

  if (!baseAttempt) {
    return buildFallbackAttempt(text);
  }

  if (!isImproved) {
    return baseAttempt;
  }

  return getCorrectedAttempt(baseAttempt);
}

/**
 * Returns a copy of the attempt where every phoneme is marked as correct.
 * Simulates a perfect re-recording.
 */
function getCorrectedAttempt(attempt: SentenceAttempt): SentenceAttempt {
  return {
    ...attempt,
    words: attempt.words.map((w) =>
      w.kind !== "annotated"
        ? w
        : {
            ...w,
            hasProblem: false,
            userTotalMs: w.referenceTotalMs,
            phonemes: w.phonemes.map((p) => ({
              ...p,
              verdict: "ok" as const,
              userDurationMs: p.referenceDurationMs,
            })),
            userWaveform: w.referenceWaveform,
            callouts: [],
          },
    ),
  };
}
