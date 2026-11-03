import type { ReferenceWordEntry } from "@/core/reference";
import raw from "./reference-words.json";

export const REFERENCE_WORDS: ReferenceWordEntry[] = raw.words;
export const REFERENCE_SPEAKERS: string[] = raw.speakers;
export const REFERENCE_SOURCE = `${raw.source} (${raw.speakers.join(" + ")})`;

export function referenceAudioUrl(speaker: string, word: string): string {
  return `/ref/${speaker}/${word}/audio.wav`;
}
