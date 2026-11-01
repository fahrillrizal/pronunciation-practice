import type { Milliseconds, PhonemeVerdict, WordKind } from "./phoneme";

/** A single phoneme segment with timing boundaries */
export interface PhonemeSegment {
  phoneme: string;
  startMs: Milliseconds;
  endMs: Milliseconds;
}

/** Evaluated result for a single phoneme in the user's recording */
export interface PhonemeResult {
  index: number;
  phoneme: string;
  verdict: PhonemeVerdict;
  referenceDurationMs: Milliseconds;
  userDurationMs: Milliseconds;
}

/** Analysis data for a single word in the sentence */
export interface WordAnalysis {
  index: number;
  text: string;
  kind: WordKind;
  hasProblem: boolean;
  reference: PhonemeSegment[];
  phonemes: PhonemeResult[];
  referenceWaveform: number[];
  userWaveform: number[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  callouts: string[];
}

/** A complete sentence attempt with analyzed words */
export interface SentenceAttempt {
  text: string;
  words: WordAnalysis[];
}
