import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { join } from "node:path";
import { Readable } from "node:stream";
import type { ReadableStream as NodeReadableStream } from "node:stream/web";
import { pipeline } from "node:stream/promises";
import { extract } from "tar-fs";
import bz2 from "unbzip2-stream";
import { corpusDir, ROOT, SPEAKERS } from "./paths.ts";

const BASE_URL = "http://festvox.org/cmu_arctic/packed";
const MAX_ATTEMPTS = 3;

type Speaker = (typeof SPEAKERS)[number];

function isReady(speaker: Speaker): boolean {
  const root = corpusDir(speaker);
  try {
    return (
      existsSync(join(root, "etc", "txt.done.data")) &&
      readdirSync(join(root, "wav")).some((file) => file.endsWith(".wav"))
    );
  } catch {
    return false;
  }
}

async function download(url: string, destination: string): Promise<void> {
  for (let attempt = 1; ; attempt++) {
    try {
      const response = await fetch(url);
      if (!response.ok || !response.body) throw new Error(`HTTP ${response.status}`);
      await pipeline(
        Readable.fromWeb(response.body as unknown as NodeReadableStream<Uint8Array>),
        createWriteStream(destination),
      );
      if (statSync(destination).size === 0) throw new Error("empty archive");
      return;
    } catch (error) {
      rmSync(destination, { force: true });
      if (attempt === MAX_ATTEMPTS) throw new Error(`${url}: ${String(error)}`);
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

async function ensureCorpus(speaker: Speaker): Promise<void> {
  if (isReady(speaker)) {
    console.log(`${speaker}: corpus already available`);
    return;
  }

  mkdirSync(join(ROOT, "dataset"), { recursive: true });
  const archive = join(ROOT, "dataset", `cmu_us_${speaker}_arctic.tar.bz2`);
  const url = `${BASE_URL}/cmu_us_${speaker}_arctic.tar.bz2`;

  console.log(`${speaker}: downloading ${url}`);
  await download(url, archive);

  console.log(`${speaker}: extracting`);
  rmSync(corpusDir(speaker), { recursive: true, force: true });
  await pipeline(createReadStream(archive), bz2(), extract(join(ROOT, "dataset")));

  if (!isReady(speaker)) throw new Error(`${speaker}: extraction did not produce a usable corpus`);
  rmSync(archive, { force: true });
  console.log(`${speaker}: ready`);
}

await Promise.all(SPEAKERS.map((speaker) => ensureCorpus(speaker)));
