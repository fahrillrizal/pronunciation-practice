import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { analyzeWord, type ReferenceFeatures } from "../../src/core/analysis.ts";
import { parseUtteranceWords } from "../../src/core/annotation.ts";
import { extractMfcc } from "../../src/core/mfcc.ts";
import { selectBestOccurrence, shiftToStart } from "../../src/core/reference.ts";
import { msToSamples } from "../../src/core/time.ts";
import { decodeWav } from "../../src/core/wav.ts";
import { fixtureBuffer, fixtureText } from "../helpers.ts";

function thinkClip(speaker: string) {
  const clip = decodeWav(fixtureBuffer(`${speaker}_arctic_a0259.wav`));
  const occurrence = selectBestOccurrence(
    parseUtteranceWords(fixtureText(`${speaker}_arctic_a0259.utt`))
      .filter((w) => w.word === "think")
      .map((w) => ({ ...w, utteranceId: "arctic_a0259" })),
  );
  assert.ok(occurrence);
  const samples = clip.samples.slice(msToSamples(occurrence.startMs, 16000), msToSamples(occurrence.endMs, 16000));
  const reference: ReferenceFeatures = {
    speaker,
    word: "think",
    phonemes: shiftToStart(occurrence.phonemes, occurrence.startMs),
    mfcc: extractMfcc(samples),
    durationMs: occurrence.endMs - occurrence.startMs,
  };
  return { samples, reference };
}

describe("analyzeWord", () => {
  const slt = thinkClip("slt");
  const bdl = thinkClip("bdl");

  it("matches a recording to its own speaker and keeps every phoneme", () => {
    const padded = new Float32Array(slt.samples.length + 8000);
    padded.forEach((_, i) => (padded[i] = (Math.random() - 0.5) * 2e-4));
    padded.set(slt.samples, 4000);
    const result = analyzeWord(padded, 16000, [bdl.reference, slt.reference]);

    assert.equal(result.speaker, "slt");
    assert.deepEqual(result.phonemes.map((p) => p.phoneme), ["TH", "IH", "NG", "K"]);
    assert.ok(result.phonemes.every((p) => p.verdict !== "mismatch"));
  });

  it("works with a single reference when the other speaker is unavailable", () => {
    const result = analyzeWord(slt.samples, 16000, [bdl.reference]);

    assert.equal(result.speaker, "bdl");
    assert.deepEqual(result.phonemes.map((p) => p.phoneme), ["TH", "IH", "NG", "K"]);
  });

  it("rejects an empty reference list", () => {
    assert.throws(() => analyzeWord(slt.samples, 16000, []));
  });
});
