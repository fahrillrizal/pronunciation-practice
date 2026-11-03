import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { findSpeechBounds } from "../../src/core/energy.ts";
import { decodeWav, encodeWav, resample } from "../../src/core/wav.ts";
import { sine } from "../helpers.ts";

describe("wav", () => {
  it("round-trips samples through 16-bit PCM", () => {
    const samples = sine(440, 50);
    const decoded = decodeWav(encodeWav({ sampleRate: 16000, samples }));
    assert.equal(decoded.sampleRate, 16000);
    samples.forEach((s, i) => assert.ok(Math.abs(s - decoded.samples[i]) < 1e-4));
  });

  it("rejects non-WAV data", () => {
    assert.throws(() => decodeWav(new ArrayBuffer(44)));
  });

  it("resamples 48 kHz to 16 kHz preserving duration and pitch", () => {
    const out = resample({ sampleRate: 48000, samples: sine(500, 100, 48000) }, 16000);
    assert.equal(out.samples.length, 1600);
    const zeroCrossings = out.samples.slice(1).filter((s, i) => Math.sign(s) !== Math.sign(out.samples[i])).length;
    assert.ok(Math.abs(zeroCrossings - 100) <= 2, `${zeroCrossings} zero crossings`);
  });
});

describe("findSpeechBounds", () => {
  it("trims silence on both ends", () => {
    const sampleRate = 16000;
    const signal = Float32Array.from({ length: sampleRate }, () => (Math.random() - 0.5) * 1e-4);
    signal.set(sine(300, 300), 0.4 * sampleRate);
    const [start, end] = findSpeechBounds(signal, sampleRate);
    assert.ok(Math.abs(start - 0.4 * sampleRate) <= 160, `start ${start}`);
    assert.ok(Math.abs(end - 0.7 * sampleRate) <= 160, `end ${end}`);
  });
});
