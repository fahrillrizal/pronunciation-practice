import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { extractMfcc, frameCount } from "../../src/core/mfcc.ts";
import { decodeWav } from "../../src/core/wav.ts";
import { fixtureBuffer, fixtureText, pearson } from "../helpers.ts";

// Meyda differs from librosa by design (ln(1+x) vs dB, symmetric 512-point Hann,
// no fmin, unnormalised DCT), so values are not equal. What must hold is that
// each coefficient tracks librosa over time. Floors are set just below the
// correlations measured on these fixtures and guard against regressions.
const MIN_CORRELATION = [0.99, 0.99, 0.95, 0.85, 0.9, 0.85, 0.85, 0.75, 0.85, 0.75, 0.8, 0.7, 0.7];

for (const speaker of ["slt", "bdl"]) {
  describe(`mfcc vs librosa (${speaker})`, () => {
    const clip = decodeWav(fixtureBuffer(`${speaker}_arctic_a0259.wav`));
    const ours = extractMfcc(clip.samples);
    const { mfcc: reference } = JSON.parse(fixtureText(`${speaker}_arctic_a0259.librosa-mfcc.json`)) as {
      mfcc: number[][];
    };

    it("produces the same frame count as librosa with center=False", () => {
      assert.equal(ours.length, reference.length);
      assert.equal(ours.length, frameCount(clip.samples.length));
    });

    it("correlates with librosa per coefficient", () => {
      MIN_CORRELATION.forEach((floor, k) => {
        const r = pearson(
          ours.map((f) => f[k]),
          reference.map((f) => f[k]),
        );
        assert.ok(r >= floor, `c${k}: r=${r.toFixed(3)} < ${floor}`);
      });
    });
  });
}

describe("extractMfcc", () => {
  it("returns one frame for clips shorter than a frame", () => {
    assert.equal(extractMfcc(new Float32Array(100)).length, 1);
  });
});
