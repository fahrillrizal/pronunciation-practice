/// <reference lib="webworker" />
import { analyzeWord, type ReferenceFeatures } from "../core/analysis.ts";
import { WAVEFORM_POINTS } from "../core/constants.ts";
import { envelope } from "../core/energy.ts";
import { decodeFeatures, type ReferenceAnnotation } from "../core/reference.ts";
import { decodeWav } from "../core/wav.ts";
import { referenceAudioUrl, REFERENCE_SPEAKERS } from "../data/reference-words.ts";
import type { AnalyzeRequest, AnalyzeResponse } from "./protocol.ts";

const references = new Map<string, ReferenceFeatures>();
const waveforms = new Map<string, number[]>();

async function fetchBuffer(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return response.arrayBuffer();
}

function assetUrl(speaker: string, word: string, file: string): string {
  return `/ref/${speaker}/${word}/${file}`;
}

async function loadReference(speaker: string, word: string): Promise<ReferenceFeatures> {
  const key = `${speaker}/${word}`;
  const cached = references.get(key);
  if (cached) return cached;

  const [annotationBuffer, mfccBuffer, audioBuffer] = await Promise.all([
    fetchBuffer(assetUrl(speaker, word, "annotation.json")),
    fetchBuffer(assetUrl(speaker, word, "mfcc.bin")),
    fetchBuffer(referenceAudioUrl(speaker, word)),
  ]);
  const annotation = JSON.parse(new TextDecoder().decode(annotationBuffer)) as ReferenceAnnotation;
  const clip = decodeWav(audioBuffer);

  waveforms.set(key, envelope(clip.samples, WAVEFORM_POINTS));
  const reference: ReferenceFeatures = {
    speaker,
    word,
    phonemes: annotation.phonemes,
    mfcc: decodeFeatures(mfccBuffer, annotation.mfccFrames, annotation.mfccDims),
    durationMs: annotation.durationMs,
  };
  references.set(key, reference);
  return reference;
}

async function analyze(request: AnalyzeRequest): Promise<AnalyzeResponse> {
  try {
    const candidates = (
      await Promise.all(
        REFERENCE_SPEAKERS.map(async (speaker) => {
          try {
            return await loadReference(speaker, request.word);
          } catch {
            return null;
          }
        }),
      )
    ).filter((reference): reference is ReferenceFeatures => reference !== null);
    const result = analyzeWord(request.samples, request.sampleRate, candidates);
    const [start, end] = result.userBounds;
    return {
      ok: true,
      analysis: {
        ...result,
        referenceWaveform: waveforms.get(`${result.speaker}/${request.word}`) ?? [],
        userWaveform: envelope(request.samples.subarray(start, end), WAVEFORM_POINTS),
      },
    };
  } catch (error) {
    return { ok: false, error: error instanceof Error ? error.message : String(error) };
  }
}

self.onmessage = async (event: MessageEvent<AnalyzeRequest>) => {
  self.postMessage(await analyze(event.data));
};
