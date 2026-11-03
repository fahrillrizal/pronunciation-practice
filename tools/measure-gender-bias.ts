import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyCmvn } from "../src/core/cmvn.ts";
import { dtw } from "../src/core/dtw.ts";
import { decodeFeatures } from "../src/core/reference.ts";
import type { FeatureMatrix, PhonemeSegment } from "../src/core/types.ts";
import { decodeWav } from "../src/core/wav.ts";
import { ROOT, readArrayBuffer, SPEAKERS } from "./paths.ts";

const REF_DIR = join(ROOT, "public", "ref");
const INDEX_FILE = join(ROOT, "src", "data", "reference-words.json");

interface Reference {
  phonemes: PhonemeSegment[];
  mfcc: FeatureMatrix;
  audio: Float32Array;
  sampleRate: number;
}

function loadReference(speaker: string, word: string): Reference {
  const dir = join(REF_DIR, speaker, word);
  const annotation = JSON.parse(readFileSync(join(dir, "annotation.json"), "utf8"));
  const mfcc = decodeFeatures(readArrayBuffer(join(dir, "mfcc.bin")), annotation.mfccFrames, annotation.mfccDims);
  const { samples, sampleRate } = decodeWav(readArrayBuffer(join(dir, "audio.wav")));
  return { phonemes: annotation.phonemes, mfcc, audio: samples, sampleRate };
}

// Same-gender alignment must be near zero; cross-gender costs show how strongly
// the two references are separated. A persistent gap between the two
// directions would mean the features favour one voice type.
const stats = (values: readonly number[]) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const sorted = [...values].sort((a, b) => a - b);
  return { mean, median: sorted[Math.floor(sorted.length / 2)], p95: sorted[Math.floor(sorted.length * 0.95)] };
};

function main(): void {
  const index: { word: string; phonemes: string[] }[] = JSON.parse(readFileSync(INDEX_FILE, "utf8")).words;
  const words = index.map((e) => e.word);

  const selfCosts: Record<string, number[]> = { slt: [], bdl: [] };
  const crossSltToBdl: number[] = [];
  const crossBdlToSlt: number[] = [];
  let selfWins = 0;

  for (const word of words) {
    const refs = Object.fromEntries(SPEAKERS.map((s) => [s, loadReference(s, word)]));
    const normalized = Object.fromEntries(SPEAKERS.map((s) => [s, applyCmvn(refs[s].mfcc)]));

    for (const from of SPEAKERS) {
      const to = from === "slt" ? "bdl" : "slt";
      const self = dtw(applyCmvn(refs[from].mfcc), normalized[from]).normalizedCost;
      const cross = dtw(normalized[to], normalized[from]).normalizedCost;
      selfCosts[from].push(self);
      (from === "slt" ? crossSltToBdl : crossBdlToSlt).push(cross);
      if (self < cross) selfWins++;
    }
  }

  const tests = words.length * SPEAKERS.length;
  console.log(`words: ${words.length}, same/cross comparisons: ${tests}`);
  for (const speaker of SPEAKERS) {
    const s = stats(selfCosts[speaker]);
    console.log(
      `${speaker} against own reference: mean ${s.mean.toFixed(4)}, median ${s.median.toFixed(4)}, p95 ${s.p95.toFixed(4)}`,
    );
  }
  for (const [label, values] of [
    ["slt audio vs bdl reference", crossSltToBdl],
    ["bdl audio vs slt reference", crossBdlToSlt],
  ] as const) {
    const s = stats(values);
    console.log(`${label}: mean ${s.mean.toFixed(3)}, median ${s.median.toFixed(3)}, p95 ${s.p95.toFixed(3)}`);
  }
  const gap = stats(crossSltToBdl).mean - stats(crossBdlToSlt).mean;
  console.log(`cross-gender mean gap: ${gap.toFixed(3)} (${((gap / stats(crossSltToBdl).mean) * 100).toFixed(1)}%)`);
  console.log(`own speaker chosen first: ${selfWins}/${tests} (${((selfWins / tests) * 100).toFixed(1)}%)`);
}

main();
