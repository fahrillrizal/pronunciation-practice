import { readFileSync } from "node:fs";
import { join } from "node:path";
import { applyCmvn } from "../src/core/cmvn.ts";
import { dtw } from "../src/core/dtw.ts";
import { decodeFeatures, type ReferenceAnnotation } from "../src/core/reference.ts";
import { segmentByPath } from "../src/core/segmentation.ts";
import type { FeatureMatrix, PhonemeSegment } from "../src/core/types.ts";
import { readArrayBuffer, ROOT, SPEAKERS } from "./paths.ts";

type Speaker = (typeof SPEAKERS)[number];

interface IndexEntry {
  word: string;
  phonemes: string[];
}

interface ReferenceData {
  phonemes: PhonemeSegment[];
  normalized: FeatureMatrix;
}

interface Summary {
  count: number;
  mean: number;
  median: number;
  p05: number;
  p95: number;
  max: number;
}

const REF_DIR = join(ROOT, "public", "ref");
const INDEX_FILE = join(ROOT, "src", "data", "reference-words.json");
const SAMPLE_SIZE = 300;
const WRONG_PER_WORD = 8;

const cache = new Map<string, ReferenceData>();

function reference(speaker: Speaker, word: string): ReferenceData {
  const key = `${speaker}/${word}`;
  const cached = cache.get(key);
  if (cached) return cached;

  const dir = join(REF_DIR, speaker, word);
  const annotation = JSON.parse(readFileSync(join(dir, "annotation.json"), "utf8")) as ReferenceAnnotation;
  const mfcc = decodeFeatures(readArrayBuffer(join(dir, "mfcc.bin")), annotation.mfccFrames, annotation.mfccDims);
  const data = { phonemes: annotation.phonemes, normalized: applyCmvn(mfcc) };
  cache.set(key, data);
  return data;
}

function percentile(sorted: readonly number[], quantile: number): number {
  if (sorted.length === 0) return Number.NaN;
  const position = (sorted.length - 1) * quantile;
  const lower = Math.floor(position);
  const upper = Math.ceil(position);
  return sorted[lower] + (sorted[upper] - sorted[lower]) * (position - lower);
}

function summarize(values: readonly number[]): Summary {
  const sorted = [...values].sort((a, b) => a - b);
  if (sorted.length === 0) {
    return { count: 0, mean: Number.NaN, median: Number.NaN, p05: Number.NaN, p95: Number.NaN, max: Number.NaN };
  }
  return {
    count: sorted.length,
    mean: sorted.reduce((sum, value) => sum + value, 0) / sorted.length,
    median: percentile(sorted, 0.5),
    p05: percentile(sorted, 0.05),
    p95: percentile(sorted, 0.95),
    max: sorted[sorted.length - 1],
  };
}

function printSummary(label: string, values: readonly number[], unit = ""): void {
  const summary = summarize(values);
  console.log(
    `${label}: n=${summary.count}, mean ${summary.mean.toFixed(2)}${unit}, ` +
      `median ${summary.median.toFixed(2)}${unit}, p95 ${summary.p95.toFixed(2)}${unit}, ` +
      `max ${summary.max.toFixed(2)}${unit}`,
  );
}

function boundaryErrors(from: ReferenceData, to: ReferenceData): { errors: number[]; cost: number } {
  const alignment = dtw(from.normalized, to.normalized);
  const { userSpans } = segmentByPath(from.phonemes, from.normalized.length, to.normalized.length, alignment);
  const errors: number[] = [];
  for (let index = 1; index < to.phonemes.length; index++) {
    const span = userSpans[index];
    if (span) errors.push(Math.abs(span.startMs - to.phonemes[index].startMs));
  }
  return { errors, cost: alignment.normalizedCost };
}

function sampleWords(words: readonly IndexEntry[]): IndexEntry[] {
  if (words.length <= SAMPLE_SIZE) return [...words];
  const step = words.length / SAMPLE_SIZE;
  return Array.from({ length: SAMPLE_SIZE }, (_, index) => words[Math.floor(index * step)]);
}

function sameSequence(a: IndexEntry, b: IndexEntry): boolean {
  return a.phonemes.join(" ") === b.phonemes.join(" ");
}

function pickDistractor(
  bucket: readonly IndexEntry[],
  target: IndexEntry,
  seed: number,
): IndexEntry | null {
  for (let attempt = 0; attempt < bucket.length; attempt++) {
    const candidate = bucket[(seed + attempt) % bucket.length];
    if (candidate.word !== target.word && !sameSequence(candidate, target)) return candidate;
  }
  return null;
}

function equalErrorRate(correct: readonly number[], wrong: readonly number[]) {
  const thresholds = [...new Set([...correct, ...wrong])].sort((a, b) => a - b);
  let best = { difference: Number.POSITIVE_INFINITY, threshold: 0, far: 1, frr: 1 };

  for (const threshold of thresholds) {
    let falseAccepts = 0;
    let falseRejects = 0;
    for (const value of wrong) if (value <= threshold) falseAccepts++;
    for (const value of correct) if (value > threshold) falseRejects++;
    const far = falseAccepts / wrong.length;
    const frr = falseRejects / correct.length;
    const difference = Math.abs(far - frr);
    if (difference < best.difference) best = { difference, threshold, far, frr };
  }

  const acceptedCorrect = correct.filter((value) => value <= best.threshold).length;
  const acceptedWrong = wrong.filter((value) => value <= best.threshold).length;
  return {
    ...best,
    eer: (best.far + best.frr) / 2,
    accuracy: (acceptedCorrect + wrong.length - acceptedWrong) / (correct.length + wrong.length),
  };
}

function main(): void {
  const index = JSON.parse(readFileSync(INDEX_FILE, "utf8")) as { words: IndexEntry[] };
  const words = index.words;
  const boundaries: Record<Speaker, number[]> = { slt: [], bdl: [] };
  const correctCosts: number[] = [];

  for (const entry of words) {
    const refs: Record<Speaker, ReferenceData> = {
      slt: reference("slt", entry.word),
      bdl: reference("bdl", entry.word),
    };
    for (const from of SPEAKERS) {
      const to: Speaker = from === "slt" ? "bdl" : "slt";
      const result = boundaryErrors(refs[from], refs[to]);
      boundaries[from].push(...result.errors);
      correctCosts.push(result.cost);
    }
  }

  const byPhonemeCount = new Map<number, IndexEntry[]>();
  for (const entry of words) {
    const bucket = byPhonemeCount.get(entry.phonemes.length) ?? [];
    bucket.push(entry);
    byPhonemeCount.set(entry.phonemes.length, bucket);
  }

  const wrongCosts: number[] = [];
  const sampled = sampleWords(words);
  for (const [sampleIndex, entry] of sampled.entries()) {
    const bucket = byPhonemeCount.get(entry.phonemes.length) ?? words;
    for (const from of SPEAKERS) {
      const to: Speaker = from === "slt" ? "bdl" : "slt";
      const source = reference(from, entry.word);
      for (let attempt = 0; attempt < WRONG_PER_WORD; attempt++) {
        const distractor = pickDistractor(bucket, entry, sampleIndex * WRONG_PER_WORD + attempt * 17);
        if (!distractor) continue;
        const target = reference(to, distractor.word);
        wrongCosts.push(dtw(source.normalized, target.normalized).normalizedCost);
      }
    }
  }

  const allBoundaries = [...boundaries.slt, ...boundaries.bdl];
  console.log(`Kata: ${words.length}; pasangan benar: ${correctCosts.length}; pasangan salah: ${wrongCosts.length}`);
  console.log("");
  console.log("Boundary error internal (ms)");
  printSummary("  semua arah", allBoundaries, " ms");
  printSummary("  slt -> bdl", boundaries.slt, " ms");
  printSummary("  bdl -> slt", boundaries.bdl, " ms");
  const under30 = allBoundaries.filter((value) => value < 30).length;
  console.log(`  di bawah 30 ms: ${under30}/${allBoundaries.length} (${((under30 / allBoundaries.length) * 100).toFixed(1)}%)`);
  console.log("");
  console.log("Diskriminasi DTW (normalizedCost)");
  printSummary("  kata sama, lintas penutur", correctCosts);
  printSummary("  kata berbeda, penutur sama dengan target", wrongCosts);
  const same = summarize(correctCosts);
  const different = summarize(wrongCosts);
  const eer = equalErrorRate(correctCosts, wrongCosts);
  console.log(`  rasio median berbeda/sama: ${(different.median / same.median).toFixed(2)}x`);
  console.log(
    `  EER: ${(eer.eer * 100).toFixed(1)}% pada threshold ${eer.threshold.toFixed(3)} ` +
      `(FAR ${(eer.far * 100).toFixed(1)}%, FRR ${(eer.frr * 100).toFixed(1)}%, akurasi ${(eer.accuracy * 100).toFixed(1)}%)`,
  );
}

main();
