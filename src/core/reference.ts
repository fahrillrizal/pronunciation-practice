import { REFERENCE_MIN_PHONEME_MS, REFERENCE_MIN_WORD_MS } from "./constants.ts";
import type { FeatureMatrix, Milliseconds, PhonemeSegment, SpokenWord } from "./types.ts";

export interface WordOccurrence extends SpokenWord {
  utteranceId: string;
}

export interface ReferenceAnnotation {
  word: string;
  speaker: string;
  utteranceId: string;
  sourceStartMs: Milliseconds;
  sourceEndMs: Milliseconds;
  durationMs: Milliseconds;
  phonemes: PhonemeSegment[];
  mfccFrames: number;
  mfccDims: number;
}

export interface ReferenceWordEntry {
  word: string;
  phonemes: string[];
}

function shortestPhonemeMs(word: SpokenWord): number {
  return Math.min(...word.phonemes.map((p) => p.endMs - p.startMs));
}

// Tokens bounded by pauses are closest to the isolated citation form the
// learner produces, reducing coarticulation bias (PRD §4.2).
function pauseScore(word: SpokenWord): number {
  return (word.followedByPause ? 2 : 0) + (word.precededByPause ? 1 : 0);
}

function isUsable(word: SpokenWord): boolean {
  return (
    word.phonemes.length > 0 &&
    word.endMs - word.startMs >= REFERENCE_MIN_WORD_MS &&
    shortestPhonemeMs(word) >= REFERENCE_MIN_PHONEME_MS
  );
}

function compareOccurrences(a: WordOccurrence, b: WordOccurrence): number {
  return (
    pauseScore(b) - pauseScore(a) ||
    shortestPhonemeMs(b) - shortestPhonemeMs(a) ||
    a.utteranceId.localeCompare(b.utteranceId)
  );
}

export function selectBestOccurrence(occurrences: readonly WordOccurrence[]): WordOccurrence | null {
  const usable = occurrences.filter(isUsable).sort(compareOccurrences);
  return usable[0] ?? null;
}

export function phonemeSequence(phonemes: readonly PhonemeSegment[]): string {
  return phonemes.map((p) => p.phoneme).join(" ");
}

export function shiftToStart(phonemes: readonly PhonemeSegment[], offsetMs: Milliseconds): PhonemeSegment[] {
  return phonemes.map((p) => ({ ...p, startMs: p.startMs - offsetMs, endMs: p.endMs - offsetMs }));
}

export function encodeFeatures(features: FeatureMatrix): ArrayBuffer {
  const dims = features[0]?.length ?? 0;
  const data = new Float32Array(features.length * dims);
  features.forEach((row, f) => data.set(row, f * dims));
  return data.buffer;
}

export function decodeFeatures(buffer: ArrayBuffer, frames: number, dims: number): FeatureMatrix {
  const data = new Float32Array(buffer);
  if (data.length !== frames * dims) throw new Error(`mfcc.bin has ${data.length} values, expected ${frames}x${dims}`);
  return Array.from({ length: frames }, (_, f) => Float64Array.from(data.subarray(f * dims, (f + 1) * dims)));
}
