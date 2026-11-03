import type { WordAnalysis } from "@/types";

export interface AnalyzeRequest {
  word: string;
  samples: Float32Array;
  sampleRate: number;
}

export type AnalyzeResponse = { ok: true; analysis: WordAnalysis } | { ok: false; error: string };
