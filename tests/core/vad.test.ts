import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { createVadState, VAD_FRAMES, vadStep, type VadState } from "../../src/core/vad.ts";

const NOISE = -60;
const SPEECH = -25;

const run = (frames: readonly number[]): VadState =>
  frames.reduce((state, db) => (state.phase === "done" ? state : vadStep(state, db)), createVadState());

const repeat = (db: number, ms: number) => Array<number>(ms / 10).fill(db);

describe("vad", () => {
  it("stops after the hangover window once the word ends", () => {
    const state = run([...repeat(NOISE, 500), ...repeat(SPEECH, 400), ...repeat(NOISE, 2000)]);
    assert.equal(state.reason, "speech-ended");
    assert.equal(state.speechStartFrame, 50);
    assert.equal(state.lastVoicedFrame, 89);
    assert.equal(state.frame - 1 - state.lastVoicedFrame, VAD_FRAMES.hangover);
  });

  it("does not stop on a short stop closure inside the word", () => {
    const state = run([
      ...repeat(NOISE, 400),
      ...repeat(SPEECH, 200),
      ...repeat(NOISE, 150),
      ...repeat(SPEECH, 100),
      ...repeat(NOISE, 1000),
    ]);
    assert.equal(state.reason, "speech-ended");
    assert.equal(state.lastVoicedFrame, 84);
  });

  it("ignores a click shorter than the minimum speech duration", () => {
    const state = run([
      ...repeat(NOISE, 400),
      ...repeat(SPEECH, 100),
      ...repeat(NOISE, 800),
      ...repeat(SPEECH, 300),
      ...repeat(NOISE, 800),
    ]);
    assert.equal(state.reason, "speech-ended");
    assert.equal(state.speechStartFrame, 130);
  });

  it("ignores spikes shorter than the onset window", () => {
    const spikes = Array.from({ length: 20 }, () => [SPEECH, NOISE, NOISE]).flat();
    assert.equal(run([...repeat(NOISE, 400), ...spikes, ...repeat(NOISE, 500)]).phase, "listening");
  });

  it("gives up when nothing is said", () => {
    assert.equal(run(repeat(NOISE, 8000)).reason, "no-speech");
  });

  it("stops when speech exceeds the maximum length", () => {
    assert.equal(run([...repeat(NOISE, 300), ...repeat(SPEECH, 6000)]).reason, "max-length");
  });

  it("adapts the threshold to room noise", () => {
    const noisy = -35;
    const state = run([...repeat(noisy, 300), ...repeat(noisy + 3, 500), ...repeat(noisy + 20, 400), ...repeat(noisy, 1000)]);
    assert.equal(state.reason, "speech-ended");
    assert.equal(state.speechStartFrame, 80);
  });
});
