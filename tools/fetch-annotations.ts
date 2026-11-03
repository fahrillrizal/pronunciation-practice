import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { corpusDir, SPEAKERS } from "./paths.ts";

const BASE_URL = "http://festvox.org/cmu_arctic/cmu_arctic";
const CONCURRENCY = 8;
const MAX_ATTEMPTS = 3;
const MAX_MISSING_RATIO = 0.01;

async function download(url: string): Promise<string | null> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url);
      if (response.status === 404) return null;
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      if (attempt === MAX_ATTEMPTS) throw new Error(`${url}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 500 * attempt));
    }
  }
}

async function inParallel<T>(items: readonly T[], task: (item: T) => Promise<void>): Promise<void> {
  let next = 0;
  const worker = async () => {
    while (next < items.length) await task(items[next++]);
  };
  await Promise.all(Array.from({ length: CONCURRENCY }, worker));
}

type SpeakerResult = { expected: number; present: number; missing: string[]; failures: string[] };

async function fetchSpeaker(speaker: string): Promise<SpeakerResult> {
  const root = corpusDir(speaker);
  const outDir = join(root, "utts");
  mkdirSync(outDir, { recursive: true });

  const ids = readdirSync(join(root, "wav")).map((f) => f.replace(/\.wav$/, ""));
  const missing = ids.filter((id) => {
    const path = join(outDir, `${id}.utt`);
    return !existsSync(path) || statSync(path).size === 0;
  });

  const missingOnServer: string[] = [];
  const failures: string[] = [];
  await inParallel(missing, async (id) => {
    const url = `${BASE_URL}/cmu_us_${speaker}_arctic/festival/utts/${id}.utt`;
    try {
      const text = await download(url);
      if (text === null) {
        missingOnServer.push(id);
        return;
      }
      writeFileSync(join(outDir, `${id}.utt`), text);
    } catch (error) {
      failures.push(String(error));
    }
  });

  const present = readdirSync(outDir).filter((f) => f.endsWith(".utt")).length;
  console.log(`${speaker}: ${present}/${ids.length} utterance files (${missingOnServer.length} missing on server)`);
  return { expected: ids.length, present, missing: missingOnServer, failures };
}

const results = await Promise.all(SPEAKERS.map(fetchSpeaker));
const failures = results.flatMap((result) => result.failures);
const missing = results.flatMap((result) => result.missing);
const expected = results.reduce((total, result) => total + result.expected, 0);

if (missing.length > 0) {
  const sample = missing.slice(0, 10).join(", ");
  console.warn(`${missing.length} annotations missing on server${missing.length > 10 ? `, including ${sample}` : `: ${sample}`}`);
}

if (failures.length > 0) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else if (missing.length / expected > MAX_MISSING_RATIO) {
  console.error(`${missing.length}/${expected} annotations missing; more than ${MAX_MISSING_RATIO * 100}%`);
  process.exitCode = 1;
}
