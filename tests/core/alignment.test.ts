import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { applyCmvn } from "../../src/core/cmvn.ts";
import { dtw } from "../../src/core/dtw.ts";
import { buildCallouts, median, scorePhonemes } from "../../src/core/scoring.ts";
import { segmentByPath } from "../../src/core/segmentation.ts";
import type { PhonemeMeasurement } from "../../src/core/types.ts";
import { matrix } from "../helpers.ts";

describe("applyCmvn", () => {
  it("normalizes each coefficient to zero mean and unit variance", () => {
    const out = applyCmvn(matrix([[1, 10], [3, 20], [5, 30]]));
    for (let d = 0; d < 2; d++) {
      const column = out.map((r) => r[d]);
      const mean = column.reduce((a, b) => a + b) / column.length;
      const variance = column.reduce((a, b) => a + (b - mean) ** 2, 0) / column.length;
      assert.ok(Math.abs(mean) < 1e-9);
      assert.ok(Math.abs(variance - 1) < 1e-9);
    }
  });

  it("handles constant coefficients and empty input", () => {
    assert.ok(applyCmvn(matrix([[2], [2]])).every((r) => r[0] === 0));
    assert.deepEqual(applyCmvn([]), []);
  });
});

describe("dtw", () => {
  const sequence = matrix([[0], [1], [2], [3], [2], [1]]);

  it("identity: a sequence against itself costs 0 along the diagonal", () => {
    const result = dtw(sequence, sequence);
    assert.equal(result.totalCost, 0);
    assert.deepEqual(result.path, sequence.map((_, i) => [i, i]));
  });

  it("time-stretch: a sequence stretched 2x still costs 0", () => {
    const stretched = matrix(sequence.flatMap((r) => [[r[0]], [r[0]]]));
    const result = dtw(sequence, stretched);
    assert.equal(result.totalCost, 0);
    assert.deepEqual(result.path.at(-1), [sequence.length - 1, stretched.length - 1]);
  });

  it("produces a monotonic, continuous path", () => {
    const { path } = dtw(sequence, matrix([[0], [0], [1], [3], [3], [1]]));
    path.slice(1).forEach(([i, j], k) => {
      const [pi, pj] = path[k];
      assert.ok(i - pi >= 0 && j - pj >= 0 && i - pi <= 1 && j - pj <= 1 && i + j > pi + pj);
    });
  });

  it("handles empty, single-frame, and very unequal sequences", () => {
    assert.equal(dtw([], sequence).totalCost, Infinity);
    assert.equal(dtw(matrix([[1]]), matrix([[1]])).totalCost, 0);
    const long = matrix(Array.from({ length: 60 }, (_, i) => [i % 4]));
    const result = dtw(matrix([[0], [3]]), long);
    assert.ok(Number.isFinite(result.totalCost));
    assert.deepEqual(result.path.at(-1), [1, 59]);
  });
});

describe("segmentByPath", () => {
  it("projects phoneme durations through the path and preserves the user frame count", () => {
    const phonemes = [
      { phoneme: "A", startMs: 0, endMs: 36 },
      { phoneme: "B", startMs: 36, endMs: 80 },
    ];
    const reference = matrix([[0], [0], [5], [5]]);
    const user = matrix([[0], [0], [0], [0], [5], [5]]);
    const { measurements, userSpans } = segmentByPath(phonemes, reference.length, user.length, dtw(reference, user));

    assert.deepEqual(measurements.map((m) => m.mappedFrames), [4, 2]);
    assert.equal(measurements[0].userDurationMs, 40);
    assert.deepEqual(userSpans, [{ startMs: 0, endMs: 40 }, { startMs: 40, endMs: 60 }]);
  });
});

describe("scorePhonemes", () => {
  const measurement = (distance: number, mappedFrames = 10): PhonemeMeasurement => ({
    index: 0,
    phoneme: "X",
    referenceDurationMs: 100,
    userDurationMs: 100,
    mappedFrames,
    distance,
  });

  it("computes the median", () => {
    assert.equal(median([3, 1, 2]), 2);
    assert.equal(median([4, 1, 2, 3]), 2.5);
    assert.equal(median([]), 0);
  });

  it("flags a phoneme far above the word median", () => {
    const verdicts = scorePhonemes([1, 1.1, 0.9, 3].map((d) => measurement(d))).map((s) => s.verdict);
    assert.deepEqual(verdicts, ["ok", "ok", "ok", "mismatch"]);
  });

  it("marks phonemes with fewer than 2 frames as low confidence", () => {
    const scores = scorePhonemes([measurement(1), measurement(1), measurement(1), measurement(9, 1)]);
    assert.equal(scores[3].verdict, "low-confidence");
  });

  it("uses the cross-speaker calibration instead of the word median", () => {
    const high = [measurement(6), measurement(6), measurement(6), measurement(6)];
    const calibration = [3, 3, 3, 3];
    assert.equal(scorePhonemes(high).every((s) => s.verdict === "ok"), true);
    assert.equal(scorePhonemes(high, calibration).every((s) => s.verdict === "mismatch"), true);
  });

  it("flags a vowel held far longer than the reference", () => {
    const scores = scorePhonemes([{ ...measurement(1), phoneme: "AH", userDurationMs: 300 }]);
    assert.equal(scores[0].verdict, "mismatch");
  });

  it("does not flag a long consonant release", () => {
    const scores = scorePhonemes([{ ...measurement(1), phoneme: "T", userDurationMs: 300 }]);
    assert.equal(scores[0].verdict, "ok");
  });

  it("deduplicates callouts", () => {
    const scores = scorePhonemes([
      { ...measurement(1), phoneme: "T", userDurationMs: 200 },
      { ...measurement(1), phoneme: "T", userDurationMs: 200 },
    ]);
    assert.deepEqual(buildCallouts(scores), ["Kamu menahan bunyi /t/ terlalu lama."]);
  });

  it("is invariant to a uniform distance offset between speakers", () => {
    const base = [1, 1.1, 0.9, 3].map((d) => measurement(d));
    const scaled = base.map((m) => ({ ...m, distance: m.distance * 2 }));
    assert.deepEqual(
      scorePhonemes(base).map((s) => s.verdict),
      scorePhonemes(scaled).map((s) => s.verdict),
    );
  });
});
