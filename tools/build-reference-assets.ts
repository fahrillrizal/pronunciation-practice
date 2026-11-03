import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseUtteranceWords } from "../src/core/annotation.ts";
import { SAMPLE_RATE } from "../src/core/constants.ts";
import { parseArcticPrompts, practiceVocabulary } from "../src/core/corpus.ts";
import { extractMfcc } from "../src/core/mfcc.ts";
import {
  encodeFeatures,
  phonemeSequence,
  selectBestOccurrence,
  shiftToStart,
  type ReferenceAnnotation,
  type ReferenceWordEntry,
  type WordOccurrence,
} from "../src/core/reference.ts";
import { msToSamples, samplesToMs } from "../src/core/time.ts";
import type { AudioClip } from "../src/core/types.ts";
import { decodeWav, encodeWav } from "../src/core/wav.ts";
import { corpusDir, readArrayBuffer, ROOT, SPEAKERS } from "./paths.ts";

type Speaker = (typeof SPEAKERS)[number];
type Selection = { word: string; picks: Record<Speaker, WordOccurrence> };

const OUTPUT_DIR = join(ROOT, "public", "ref");
const INDEX_FILE = join(ROOT, "src", "data", "reference-words.json");
const DRY_RUN = process.argv.includes("--dry-run");

function occurrencesByWord(speaker: Speaker, utteranceIds: readonly string[]): Map<string, WordOccurrence[]> {
  const byWord = new Map<string, WordOccurrence[]>();
  for (const utteranceId of utteranceIds) {
    let raw: string;
    try {
      raw = readFileSync(join(corpusDir(speaker), "utts", `${utteranceId}.utt`), "utf8");
    } catch {
      continue;
    }
    for (const word of parseUtteranceWords(raw)) {
      byWord.set(word.word, [...(byWord.get(word.word) ?? []), { ...word, utteranceId }]);
    }
  }
  return byWord;
}

// Both speakers must have a usable token with the same phoneme sequence, so
// automatic reference selection compares like with like.
function selectWords(vocabulary: ReadonlySet<string>, occurrences: Record<Speaker, Map<string, WordOccurrence[]>>) {
  const selected: Selection[] = [];
  const rejected = { noUsableToken: 0, phonemeMismatch: 0 };

  for (const word of [...vocabulary].sort()) {
    const picks = SPEAKERS.map((s) => selectBestOccurrence(occurrences[s].get(word) ?? []));
    if (picks.some((p) => p === null)) {
      rejected.noUsableToken++;
      continue;
    }
    const chosen = picks as WordOccurrence[];
    if (new Set(chosen.map((p) => phonemeSequence(p.phonemes))).size > 1) {
      rejected.phonemeMismatch++;
      continue;
    }
    selected.push({ word, picks: Object.fromEntries(SPEAKERS.map((s, i) => [s, chosen[i]])) as Selection["picks"] });
  }
  return { selected, rejected };
}

function writeAsset(speaker: Speaker, word: string, occurrence: WordOccurrence, clip: AudioClip): number {
  const start = msToSamples(occurrence.startMs, clip.sampleRate);
  const end = Math.min(clip.samples.length, msToSamples(occurrence.endMs, clip.sampleRate));
  const samples = clip.samples.slice(start, end);
  const mfcc = extractMfcc(samples);

  const annotation: ReferenceAnnotation = {
    word,
    speaker,
    utteranceId: occurrence.utteranceId,
    sourceStartMs: occurrence.startMs,
    sourceEndMs: occurrence.endMs,
    durationMs: samplesToMs(samples.length, clip.sampleRate),
    phonemes: shiftToStart(occurrence.phonemes, occurrence.startMs),
    mfccFrames: mfcc.length,
    mfccDims: mfcc[0].length,
  };

  const dir = join(OUTPUT_DIR, speaker, word);
  mkdirSync(dir, { recursive: true });
  const files = {
    "audio.wav": Buffer.from(encodeWav({ sampleRate: clip.sampleRate, samples })),
    "mfcc.bin": Buffer.from(encodeFeatures(mfcc)),
    "annotation.json": Buffer.from(JSON.stringify(annotation)),
  };
  Object.entries(files).forEach(([name, data]) => writeFileSync(join(dir, name), data));
  return Object.values(files).reduce((total, data) => total + data.length, 0);
}

function loadClip(speaker: Speaker, utteranceId: string): AudioClip {
  const clip = decodeWav(readArrayBuffer(join(corpusDir(speaker), "wav", `${utteranceId}.wav`)));
  if (clip.sampleRate !== SAMPLE_RATE) throw new Error(`${speaker}/${utteranceId}: ${clip.sampleRate} Hz`);
  return clip;
}

function writeIndex(selected: readonly Selection[]): void {
  const words: ReferenceWordEntry[] = selected.map(({ word, picks }) => ({
    word,
    phonemes: picks[SPEAKERS[0]].phonemes.map((p) => p.phoneme),
  }));
  const body = words.map((w) => `    ${JSON.stringify(w)}`).join(",\n");
  const header = JSON.stringify({ source: "CMU ARCTIC", speakers: SPEAKERS, words: [] }, null, 2);
  writeFileSync(INDEX_FILE, `${header.replace('"words": []', `"words": [\n${body}\n  ]`)}\n`);
}

function main(): void {
  const prompts = parseArcticPrompts(readFileSync(join(corpusDir("slt"), "etc", "txt.done.data"), "utf8"));
  const ids = prompts.map((p) => p.utteranceId);
  const occurrences = Object.fromEntries(SPEAKERS.map((s) => [s, occurrencesByWord(s, ids)])) as Record<
    Speaker,
    Map<string, WordOccurrence[]>
  >;
  const { selected, rejected } = selectWords(practiceVocabulary(prompts), occurrences);

  const audioMs = selected.reduce(
    (sum, { picks }) => sum + SPEAKERS.reduce((s, sp) => s + picks[sp].endMs - picks[sp].startMs, 0),
    0,
  );
  console.log(`${selected.length} words usable for ${SPEAKERS.join(" + ")}; rejected`, rejected);
  console.log(`estimated audio size: ${(((audioMs / 1000) * SAMPLE_RATE * 2) / 1e6).toFixed(1)} MB`);
  if (DRY_RUN) return;

  rmSync(OUTPUT_DIR, { recursive: true, force: true });
  let bytes = 0;
  for (const speaker of SPEAKERS) {
    const byUtterance = Map.groupBy(selected, (s) => s.picks[speaker].utteranceId);
    for (const [utteranceId, selections] of byUtterance) {
      const clip = loadClip(speaker, utteranceId);
      for (const { word, picks } of selections) bytes += writeAsset(speaker, word, picks[speaker], clip);
    }
  }
  writeIndex(selected);
  console.log(`wrote ${(bytes / 1e6).toFixed(1)} MB to public/ref and ${selected.length} words to the index`);
}

main();
