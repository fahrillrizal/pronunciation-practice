import { strict as assert } from "node:assert";
import { describe, it } from "node:test";
import { parseArcticPrompts, pickRandomWord, practiceVocabulary } from "../../src/core/corpus.ts";

describe("parseArcticPrompts", () => {
  it("parses FestVox prompt lines and skips malformed ones", () => {
    const raw = ['( arctic_a0001 "Author of the danger trail." )', "garbage", '( arctic_a0005 "Will we ever forget it." )'].join("\n");
    assert.deepEqual(parseArcticPrompts(raw), [
      { utteranceId: "arctic_a0001", text: "Author of the danger trail." },
      { utteranceId: "arctic_a0005", text: "Will we ever forget it." },
    ]);
    assert.deepEqual(parseArcticPrompts(""), []);
  });
});

describe("practiceVocabulary", () => {
  const vocabulary = practiceVocabulary(
    parseArcticPrompts(
      [
        '( u1 "Think of the thick fog, Philip." )',
        '( u2 "I\'m sure Philip will think again." )',
      ].join("\n"),
    ),
  );

  it("keeps content words and drops function words, short words, proper nouns and contractions", () => {
    assert.deepEqual([...vocabulary].sort(), ["again", "fog", "sure", "thick", "think"]);
  });
});

describe("pickRandomWord", () => {
  const words = [{ word: "bath" }, { word: "think" }, { word: "three" }];

  it("never repeats the current word", () => {
    for (const r of [0, 0.4, 0.99]) assert.notEqual(pickRandomWord(words, "think", () => r)?.word, "think");
  });

  it("is safe when random() returns 1", () => {
    assert.equal(pickRandomWord(words, null, () => 1)?.word, "three");
  });

  it("repeats the only word and returns null for an empty list", () => {
    assert.equal(pickRandomWord([{ word: "think" }], "think", () => 0)?.word, "think");
    assert.equal(pickRandomWord([], null, () => 0), null);
  });
});
