import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SCAN_DIRS = ["src", "tools", "tests"];
const NEXT_ENTRY = /src\/app\/.*\/?(page|layout)\.tsx$/;
const BARREL = /\/index\.ts$/;
const DECLARATION = /^export\s+(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/gm;
const RE_EXPORT = /^export\s+(?:type\s+)?\{([^}]+)\}\s+from/gm;

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return walk(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

function exportedNames(text: string): string[] {
  const declared = [...text.matchAll(DECLARATION)].map((m) => m[1]);
  const reExported = [...text.matchAll(RE_EXPORT)].flatMap((m) =>
    m[1].split(",").map((s) => s.trim().split(/\s+/).pop() ?? "").filter(Boolean),
  );
  return [...declared, ...reExported];
}

const files = new Map(SCAN_DIRS.flatMap((d) => walk(join(ROOT, d))).map((f) => [f, readFileSync(f, "utf8")]));
const consumers = [...files].filter(([f]) => !BARREL.test(f));

const unused = [...files]
  .filter(([file]) => !NEXT_ENTRY.test(file))
  .flatMap(([file, text]) =>
    exportedNames(text)
      .filter((name) => !consumers.some(([f, t]) => f !== file && new RegExp(`\\b${name}\\b`).test(t)))
      .map((name) => `${relative(ROOT, file)}: ${name}`),
  );

if (unused.length > 0) {
  console.error(`Ekspor tanpa pemakai (${unused.length}):\n  ${unused.join("\n  ")}`);
  process.exit(1);
}
console.log("Semua ekspor dipakai.");
