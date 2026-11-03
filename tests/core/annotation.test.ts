import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { parseUtteranceWords } from "../../src/core/annotation.ts";
import { fixtureText } from "../helpers.ts";

const close = (actual: number, expected: number) => assert.ok(Math.abs(actual - expected) < 1e-6, `${actual} ≠ ${expected}`);

describe("parseUtteranceWords", () => {
  const words = parseUtteranceWords(fixtureText("slt_arctic_a0259.utt"));

  it("reads every word in utterance order", () => {
    assert.deepEqual(
      words.map((w) => w.word),
      ["think", "of", "investing", "in", "such", "an", "adventure"],
    );
  });

  it("returns phoneme boundaries for 'think' matching the FestVox labels", () => {
    const [think] = words;
    assert.deepEqual(think.phonemes.map((p) => p.phoneme), ["TH", "IH", "NG", "K"]);
    close(think.startMs, 168.25);
    close(think.phonemes[0].endMs, 218.25);
    close(think.endMs, 430.75);
  });

  it("marks pauses around words", () => {
    assert.equal(words[0].precededByPause, true);
    assert.equal(words[0].followedByPause, false);
    assert.equal(words.at(-1)?.followedByPause, true);
  });

  it("maps the FestVox schwa to ARPAbet AH", () => {
    const an = words.find((w) => w.word === "an");
    assert.ok(an?.phonemes.every((p) => p.phoneme !== "AX"));
  });

  it("keeps phonemes contiguous inside each word", () => {
    for (const word of words) {
      word.phonemes.slice(1).forEach((p, i) => close(p.startMs, word.phonemes[i].endMs));
    }
  });

  it("works for the second speaker", () => {
    const [think] = parseUtteranceWords(fixtureText("bdl_arctic_a0259.utt"));
    assert.deepEqual(think.phonemes.map((p) => p.phoneme), ["TH", "IH", "NG", "K"]);
  });

  it("returns no words for malformed input", () => {
    assert.deepEqual(parseUtteranceWords(""), []);
    assert.deepEqual(parseUtteranceWords("EST_File utterance\n"), []);
  });
});
