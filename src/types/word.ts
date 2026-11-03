import type { PhonemeScore, TimeSpan } from "@/core/types";
import type { Milliseconds } from "./phoneme";

export interface WordAnalysis {
  word: string;
  speaker: string;
  phonemes: PhonemeScore[];
  userSpans: TimeSpan[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  callouts: string[];
  userBounds: [number, number];
  referenceWaveform: number[];
  userWaveform: number[];
}
