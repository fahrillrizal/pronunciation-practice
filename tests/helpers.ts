import { readFileSync } from "node:fs";
import type { FeatureMatrix } from "../src/core/types.ts";

const FIXTURES = new URL("./fixtures/arctic/", import.meta.url);

export function fixtureText(name: string): string {
  return readFileSync(new URL(name, FIXTURES), "utf8");
}

export function fixtureBuffer(name: string): ArrayBuffer {
  const buffer = readFileSync(new URL(name, FIXTURES));
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

export function matrix(rows: number[][]): FeatureMatrix {
  return rows.map((row) => Float64Array.from(row));
}

export function sine(hz: number, ms: number, sampleRate = 16000, amplitude = 0.5): Float32Array {
  const length = Math.round((ms / 1000) * sampleRate);
  return Float32Array.from({ length }, (_, i) => amplitude * Math.sin((2 * Math.PI * hz * i) / sampleRate));
}

export function pearson(a: readonly number[], b: readonly number[]): number {
  const mean = (v: readonly number[]) => v.reduce((s, x) => s + x, 0) / v.length;
  const ma = mean(a);
  const mb = mean(b);
  let cov = 0;
  let va = 0;
  let vb = 0;
  a.forEach((x, i) => {
    cov += (x - ma) * (b[i] - mb);
    va += (x - ma) ** 2;
    vb += (b[i] - mb) ** 2;
  });
  return cov / Math.sqrt(va * vb);
}
