import { applyCmvn } from "./cmvn.ts";
import { dtw, type DtwResult } from "./dtw.ts";
import { findSpeechBounds } from "./energy.ts";
import { extractMfcc } from "./mfcc.ts";
import { buildCallouts, scorePhonemes } from "./scoring.ts";
import { segmentByPath } from "./segmentation.ts";
import { samplesToMs } from "./time.ts";
import type { FeatureMatrix, Milliseconds, PhonemeScore, PhonemeSegment, TimeSpan } from "./types.ts";

export interface ReferenceFeatures {
  speaker: string;
  word: string;
  phonemes: PhonemeSegment[];
  mfcc: FeatureMatrix;
  durationMs: Milliseconds;
}

interface SpeakerDistance {
  speaker: string;
  normalizedCost: number;
}

interface WordAnalysisResult {
  word: string;
  speaker: string;
  distances: SpeakerDistance[];
  phonemes: PhonemeScore[];
  userSpans: TimeSpan[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  callouts: string[];
  userBounds: [number, number];
}

interface Candidate {
  reference: ReferenceFeatures;
  referenceMfcc: FeatureMatrix;
  alignment: DtwResult;
}

function calibrationFor(best: Candidate, others: readonly Candidate[]): number[] | null {
  const other = others[0];
  if (!other) return null;
  const alignment = dtw(best.referenceMfcc, other.referenceMfcc);
  return segmentByPath(
    best.reference.phonemes,
    best.referenceMfcc.length,
    other.referenceMfcc.length,
    alignment,
  ).measurements.map((m) => m.distance);
}

function alignToEach(userMfcc: FeatureMatrix, references: readonly ReferenceFeatures[]): Candidate[] {
  return references
    .map((reference) => {
      const referenceMfcc = applyCmvn(reference.mfcc);
      return { reference, referenceMfcc, alignment: dtw(referenceMfcc, userMfcc) };
    })
    .sort((a, b) => a.alignment.normalizedCost - b.alignment.normalizedCost);
}

export function analyzeWord(
  userSamples: Float32Array,
  sampleRate: number,
  references: readonly ReferenceFeatures[],
): WordAnalysisResult {
  if (references.length === 0) throw new Error("No reference available");

  const [start, end] = findSpeechBounds(userSamples, sampleRate);
  const speech = userSamples.subarray(start, end);
  const userMfcc = applyCmvn(extractMfcc(speech));

  const candidates = alignToEach(userMfcc, references);
  const best = candidates[0];
  const { measurements, userSpans } = segmentByPath(
    best.reference.phonemes,
    best.referenceMfcc.length,
    userMfcc.length,
    best.alignment,
  );
  const phonemes = scorePhonemes(measurements, calibrationFor(best, candidates.slice(1)));

  return {
    word: best.reference.word,
    speaker: best.reference.speaker,
    distances: candidates.map((c) => ({ speaker: c.reference.speaker, normalizedCost: c.alignment.normalizedCost })),
    phonemes,
    userSpans,
    referenceTotalMs: best.reference.durationMs,
    userTotalMs: samplesToMs(speech.length, sampleRate),
    callouts: buildCallouts(phonemes),
    userBounds: [start, end],
  };
}
