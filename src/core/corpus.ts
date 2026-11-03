import { MIN_WORD_LENGTH } from "./constants.ts";

interface ArcticPrompt {
  utteranceId: string;
  text: string;
}

// Function words are almost always reduced in running speech (e.g. "of" → /əv/),
// so a cut-out token is a poor reference for an isolated word.
const STOP_WORDS: ReadonlySet<string> = new Set(
  (
    "the and for but not you your his her him she they them their its was were are has had have been " +
    "that this these those with from into onto upon what which who whom when where there then than " +
    "will would could should shall can did does our out all any some one about over only"
  ).split(" "),
);

const PROMPT_LINE = /^\(\s*(\S+)\s+"(.*)"\s*\)\s*$/;
const LETTERS_ONLY = /^[a-z]+$/;

export function parseArcticPrompts(raw: string): ArcticPrompt[] {
  return raw.split(/\r?\n/).flatMap((line) => {
    const match = PROMPT_LINE.exec(line.trim());
    return match ? [{ utteranceId: match[1], text: match[2] }] : [];
  });
}

function normalizeWord(surface: string): string {
  return surface.toLowerCase().replace(/^[^a-z']+|[^a-z']+$/g, "");
}

// A word never written in lower case anywhere in the corpus is a proper noun.
export function practiceVocabulary(prompts: readonly ArcticPrompt[]): Set<string> {
  const vocabulary = new Set<string>();
  for (const { text } of prompts) {
    for (const surface of text.split(/\s+/)) {
      const word = normalizeWord(surface);
      const isLowercase = /^[^A-Za-z]*[a-z]/.test(surface);
      if (isLowercase && isPracticeWord(word)) vocabulary.add(word);
    }
  }
  return vocabulary;
}

function isPracticeWord(word: string): boolean {
  return LETTERS_ONLY.test(word) && word.length >= MIN_WORD_LENGTH && !STOP_WORDS.has(word);
}

export function pickRandomWord<T extends { word: string }>(
  words: readonly T[],
  currentWord: string | null,
  random: () => number,
): T | null {
  if (words.length === 0) return null;
  const others = words.filter((w) => w.word !== currentWord);
  const pool = others.length > 0 ? others : words;
  return pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
}
