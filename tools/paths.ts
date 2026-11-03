import { readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
export const SPEAKERS = ["slt", "bdl"] as const;

export function corpusDir(speaker: string): string {
  return join(ROOT, "dataset", `cmu_us_${speaker}_arctic`);
}

export function readArrayBuffer(path: string): ArrayBuffer {
  const buffer = readFileSync(path);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}
