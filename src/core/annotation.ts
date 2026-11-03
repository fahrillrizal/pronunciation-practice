import { leafItems, parseEst, topLevelItems } from "./est.ts";
import type { PhonemeSegment, SpokenWord } from "./types.ts";

const PAUSE = "pau";

// FestVox "radio" phones match CMUdict ARPAbet except the schwa.
const FESTVOX_TO_ARPABET: Readonly<Record<string, string>> = { ax: "AH" };

interface TimedSegment {
  label: string;
  startMs: number;
  endMs: number;
}

function toArpabet(label: string): string {
  return (FESTVOX_TO_ARPABET[label] ?? label).toUpperCase();
}

function timedSegments(
  segmentItems: readonly number[],
  nameOf: (item: number) => string,
  endOf: (item: number) => number,
): Map<number, TimedSegment & { order: number }> {
  const timed = new Map<number, TimedSegment & { order: number }>();
  let previousEnd = 0;
  segmentItems.forEach((item, order) => {
    const endMs = endOf(item) * 1000;
    timed.set(item, { label: nameOf(item), startMs: previousEnd, endMs, order });
    previousEnd = endMs;
  });
  return timed;
}

export function parseUtteranceWords(raw: string): SpokenWord[] {
  const { items, relations } = parseEst(raw);
  const words = relations.get("Word");
  const segments = relations.get("Segment");
  const structure = relations.get("SylStructure");
  if (!words || !segments || !structure) return [];

  const feature = (item: number, key: string) => items.get(item)?.get(key) ?? "";
  const segmentOrder = topLevelItems(segments);
  const timed = timedSegments(segmentOrder, (i) => feature(i, "name"), (i) => Number(feature(i, "end")));
  const isPauseAt = (order: number) => {
    const item = segmentOrder[order];
    return item === undefined || timed.get(item)?.label === PAUSE;
  };

  return topLevelItems(words).flatMap((wordItem): SpokenWord[] => {
    const wordSegments = leafItems(structure, wordItem)
      .map((item) => timed.get(item))
      .filter((s): s is TimedSegment & { order: number } => s !== undefined);
    if (wordSegments.length === 0) return [];

    const phonemes: PhonemeSegment[] = wordSegments.map((s) => ({
      phoneme: toArpabet(s.label),
      startMs: s.startMs,
      endMs: s.endMs,
    }));
    const first = wordSegments[0];
    const last = wordSegments[wordSegments.length - 1];

    return [
      {
        word: feature(wordItem, "name").toLowerCase(),
        phonemes,
        startMs: first.startMs,
        endMs: last.endMs,
        precededByPause: isPauseAt(first.order - 1),
        followedByPause: isPauseAt(last.order + 1),
      },
    ];
  });
}
