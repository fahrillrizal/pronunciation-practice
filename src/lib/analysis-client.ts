import type { WordAnalysis } from "@/types";
import type { AnalyzeRequest, AnalyzeResponse } from "@/workers/protocol.ts";

export function createAnalysisClient(sampleRate: number) {
  const worker = new Worker(new URL("../workers/analysis.worker.ts", import.meta.url), { type: "module" });

  return {
    analyze(word: string, samples: Float32Array): Promise<WordAnalysis> {
      const copy = samples.slice();
      const request: AnalyzeRequest = { word, samples: copy, sampleRate };
      return new Promise((resolve, reject) => {
        worker.onmessage = (event: MessageEvent<AnalyzeResponse>) => {
          const response = event.data;
          if (response.ok) resolve(response.analysis);
          else reject(new Error(response.error));
        };
        worker.onerror = () => reject(new Error("Analysis worker failed to run."));
        worker.postMessage(request, [copy.buffer]);
      });
    },
    close() {
      worker.terminate();
    },
  };
}
