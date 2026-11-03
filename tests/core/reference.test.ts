import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import {
  decodeFeatures,
  encodeFeatures,
  selectBestOccurrence,
  shiftToStart,
  type WordOccurrence,
} from "../../src/core/reference.ts";
import { matrix } from "../helpers.ts";

const occurrence = (overrides: Partial<WordOccurrence>): WordOccurrence => ({
  word: "think",
  utteranceId: "u1",
  startMs: 0,
  endMs: 300,
  precededByPause: false,
  followedByPause: false,
  phonemes: [
    { phoneme: "TH", startMs: 0, endMs: 100 },
    { phoneme: "IH", startMs: 100, endMs: 300 },
  ],
  ...overrides,
});

describe("selectBestOccurrence", () => {
  it("prefers tokens followed and preceded by a pause", () => {
    const best = selectBestOccurrence([
      occurrence({ utteranceId: "a" }),
      occurrence({ utteranceId: "b", followedByPause: true }),
      occurrence({ utteranceId: "c", precededByPause: true }),
    ]);
    assert.equal(best?.utteranceId, "b");
  });

  it("skips tokens too short to measure", () => {
    const tooShort = occurrence({ endMs: 100, phonemes: [{ phoneme: "TH", startMs: 0, endMs: 100 }] });
    const tinyPhoneme = occurrence({
      phonemes: [
        { phoneme: "TH", startMs: 0, endMs: 5 },
        { phoneme: "IH", startMs: 5, endMs: 300 },
      ],
    });
    assert.equal(selectBestOccurrence([tooShort, tinyPhoneme]), null);
  });
});

describe("shiftToStart", () => {
  it("makes phoneme times relative to the clip", () => {
    assert.deepEqual(shiftToStart([{ phoneme: "TH", startMs: 100, endMs: 150 }], 100), [
      { phoneme: "TH", startMs: 0, endMs: 50 },
    ]);
  });
});

describe("feature encoding", () => {
  it("round-trips through Float32 and validates dimensions", () => {
    const features = matrix([[1, 2], [3, 4], [5, 6]]);
    assert.deepEqual(decodeFeatures(encodeFeatures(features), 3, 2), features);
    assert.throws(() => decodeFeatures(encodeFeatures(features), 2, 2));
  });
});
