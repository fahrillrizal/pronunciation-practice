import { DTW_BAND_RATIO } from "./constants.ts";
import type { FeatureMatrix, FrameIndex } from "./types.ts";

export interface DtwResult {
  path: Array<[FrameIndex, FrameIndex]>;
  pathCosts: number[];
  totalCost: number;
  normalizedCost: number;
}

const EMPTY_RESULT: DtwResult = { path: [], pathCosts: [], totalCost: Infinity, normalizedCost: Infinity };

function euclidean(a: Float64Array, b: Float64Array): number {
  let sum = 0;
  for (let d = 0; d < a.length; d++) sum += (a[d] - b[d]) ** 2;
  return Math.sqrt(sum);
}

// Sakoe-Chiba band around the scaled diagonal. The radius is at least the
// diagonal slope so consecutive rows always overlap, even for very unequal lengths.
function bandRadius(n: number, m: number): number {
  const slope = n > 1 ? (m - 1) / (n - 1) : m;
  return Math.max(1, Math.ceil(DTW_BAND_RATIO * Math.max(n, m)), Math.ceil(slope));
}

function bandLimits(i: number, n: number, m: number, radius: number): [number, number] {
  const center = n === 1 ? 0 : (i * (m - 1)) / (n - 1);
  return [Math.max(0, Math.floor(center - radius)), Math.min(m - 1, Math.ceil(center + radius))];
}

function accumulate(reference: FeatureMatrix, user: FeatureMatrix) {
  const n = reference.length;
  const m = user.length;
  const radius = bandRadius(n, m);
  const acc = new Float64Array(n * m).fill(Infinity);
  const local = new Float64Array(n * m).fill(Infinity);

  for (let i = 0; i < n; i++) {
    const [lo, hi] = bandLimits(i, n, m, radius);
    for (let j = lo; j <= hi; j++) {
      const cost = euclidean(reference[i], user[j]);
      local[i * m + j] = cost;
      const best =
        i === 0 && j === 0
          ? 0
          : Math.min(
              i > 0 ? acc[(i - 1) * m + j] : Infinity,
              j > 0 ? acc[i * m + j - 1] : Infinity,
              i > 0 && j > 0 ? acc[(i - 1) * m + j - 1] : Infinity,
            );
      acc[i * m + j] = cost + best;
    }
  }
  return { acc, local };
}

function backtrack(acc: Float64Array, n: number, m: number): Array<[FrameIndex, FrameIndex]> {
  const at = (i: number, j: number) => (i >= 0 && j >= 0 ? acc[i * m + j] : Infinity);
  const path: Array<[FrameIndex, FrameIndex]> = [[n - 1, m - 1]];
  let i = n - 1;
  let j = m - 1;
  while (i > 0 || j > 0) {
    const diag = at(i - 1, j - 1);
    const up = at(i - 1, j);
    const left = at(i, j - 1);
    if (diag <= up && diag <= left) {
      i--;
      j--;
    } else if (up <= left) {
      i--;
    } else {
      j--;
    }
    path.push([i, j]);
  }
  return path.reverse();
}

export function dtw(reference: FeatureMatrix, user: FeatureMatrix): DtwResult {
  const n = reference.length;
  const m = user.length;
  if (n === 0 || m === 0) return EMPTY_RESULT;

  const { acc, local } = accumulate(reference, user);
  const path = backtrack(acc, n, m);
  const totalCost = acc[n * m - 1];
  return {
    path,
    pathCosts: path.map(([i, j]) => local[i * m + j]),
    totalCost,
    normalizedCost: totalCost / path.length,
  };
}
