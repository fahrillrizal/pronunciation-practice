import { FRAME_SIZE, HOP_LENGTH, SAMPLE_RATE } from "./constants.ts";
import type { FrameIndex, Milliseconds } from "./types.ts";

export const FRAME_MS: Milliseconds = (HOP_LENGTH / SAMPLE_RATE) * 1000;

export function frameCenterMs(frame: FrameIndex): Milliseconds {
  return ((frame * HOP_LENGTH + FRAME_SIZE / 2) / SAMPLE_RATE) * 1000;
}

export function framesToMs(frameCount: number): Milliseconds {
  return frameCount * FRAME_MS;
}

export function msToSamples(ms: Milliseconds, sampleRate: number): number {
  return Math.round((ms / 1000) * sampleRate);
}

export function samplesToMs(sampleCount: number, sampleRate: number): Milliseconds {
  return (sampleCount / sampleRate) * 1000;
}
