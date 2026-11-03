import type { DtwResult } from "./dtw.ts";
import { FRAME_MS, frameCenterMs, framesToMs } from "./time.ts";
import type { PhonemeMeasurement, PhonemeSegment, TimeSpan } from "./types.ts";

function referenceFrameOwners(phonemes: readonly PhonemeSegment[], frameCount: number): number[] {
  const owners: number[] = [];
  let p = 0;
  for (let f = 0; f < frameCount; f++) {
    while (p < phonemes.length - 1 && frameCenterMs(f) >= phonemes[p].endMs) p++;
    owners.push(p);
  }
  return owners;
}

// Each user frame belongs to the phoneme of the first reference frame it is
// paired with, so user phoneme durations always sum to the clip length.
function userFrameOwners(owners: readonly number[], userFrameCount: number, alignment: DtwResult): Int32Array {
  const userOwners = new Int32Array(userFrameCount).fill(-1);
  for (const [refFrame, userFrame] of alignment.path) {
    if (userOwners[userFrame] === -1) userOwners[userFrame] = owners[refFrame];
  }
  return userOwners;
}

function meanCostPerPhoneme(owners: readonly number[], phonemeCount: number, alignment: DtwResult): number[] {
  const sum = new Float64Array(phonemeCount);
  const count = new Uint32Array(phonemeCount);
  alignment.path.forEach(([refFrame], k) => {
    sum[owners[refFrame]] += alignment.pathCosts[k];
    count[owners[refFrame]] += 1;
  });
  return Array.from(sum, (s, p) => (count[p] > 0 ? s / count[p] : 0));
}

function userSpans(userOwners: Int32Array, phonemeCount: number): TimeSpan[] {
  const spans: TimeSpan[] = [];
  let cursorMs = 0;
  for (let p = 0; p < phonemeCount; p++) {
    const frames = userOwners.reduce<number[]>((acc, owner, f) => (owner === p ? [...acc, f] : acc), []);
    if (frames.length === 0) {
      spans.push({ startMs: cursorMs, endMs: cursorMs });
      continue;
    }
    const span = { startMs: frames[0] * FRAME_MS, endMs: (frames[frames.length - 1] + 1) * FRAME_MS };
    spans.push(span);
    cursorMs = span.endMs;
  }
  return spans;
}

export function segmentByPath(
  phonemes: readonly PhonemeSegment[],
  referenceFrameCount: number,
  userFrameCount: number,
  alignment: DtwResult,
): { measurements: PhonemeMeasurement[]; userSpans: TimeSpan[] } {
  const owners = referenceFrameOwners(phonemes, referenceFrameCount);
  const userOwners = userFrameOwners(owners, userFrameCount, alignment);
  const distances = meanCostPerPhoneme(owners, phonemes.length, alignment);

  const measurements = phonemes.map((ph, index): PhonemeMeasurement => {
    const mappedFrames = userOwners.filter((owner) => owner === index).length;
    return {
      index,
      phoneme: ph.phoneme,
      referenceDurationMs: ph.endMs - ph.startMs,
      userDurationMs: framesToMs(mappedFrames),
      mappedFrames,
      distance: distances[index],
    };
  });

  return { measurements, userSpans: userSpans(userOwners, phonemes.length) };
}
