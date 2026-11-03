import type { AudioClip } from "./types.ts";

const PCM_FORMAT = 1;
const BITS_PER_SAMPLE = 16;
const HEADER_BYTES = 44;

function chunkTag(buffer: ArrayBuffer, offset: number): string {
  return String.fromCharCode(...new Uint8Array(buffer, offset, 4));
}

function readPcm16(view: DataView, offset: number, byteLength: number, channels: number): Float32Array {
  const frames = Math.floor(byteLength / (2 * channels));
  const samples = new Float32Array(frames);
  for (let i = 0; i < frames; i++) samples[i] = view.getInt16(offset + i * 2 * channels, true) / 32768;
  return samples;
}

export function decodeWav(buffer: ArrayBuffer): AudioClip {
  if (chunkTag(buffer, 0) !== "RIFF" || chunkTag(buffer, 8) !== "WAVE") throw new Error("Not a WAV file");
  const view = new DataView(buffer);
  let sampleRate = 0;
  let channels = 1;

  for (let offset = 12; offset + 8 <= buffer.byteLength; ) {
    const tag = chunkTag(buffer, offset);
    const size = view.getUint32(offset + 4, true);
    const body = offset + 8;
    if (tag === "fmt ") {
      if (view.getUint16(body, true) !== PCM_FORMAT || view.getUint16(body + 14, true) !== BITS_PER_SAMPLE) {
        throw new Error("Only 16-bit PCM WAV is supported");
      }
      channels = view.getUint16(body + 2, true);
      sampleRate = view.getUint32(body + 4, true);
    } else if (tag === "data") {
      const byteLength = Math.min(size, buffer.byteLength - body);
      return { sampleRate, samples: readPcm16(view, body, byteLength, channels) };
    }
    offset = body + size + (size % 2);
  }
  throw new Error("WAV data chunk not found");
}

export function encodeWav({ samples, sampleRate }: AudioClip): ArrayBuffer {
  const buffer = new ArrayBuffer(HEADER_BYTES + samples.length * 2);
  const view = new DataView(buffer);
  const writeTag = (offset: number, tag: string) =>
    [...tag].forEach((c, i) => view.setUint8(offset + i, c.charCodeAt(0)));

  writeTag(0, "RIFF");
  view.setUint32(4, HEADER_BYTES - 8 + samples.length * 2, true);
  writeTag(8, "WAVE");
  writeTag(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, PCM_FORMAT, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, BITS_PER_SAMPLE, true);
  writeTag(36, "data");
  view.setUint32(40, samples.length * 2, true);

  samples.forEach((sample, i) => {
    const s = Math.max(-1, Math.min(1, sample));
    view.setInt16(HEADER_BYTES + i * 2, Math.round(s < 0 ? s * 32768 : s * 32767), true);
  });
  return buffer;
}

// A moving average of one decimation period acts as a simple anti-alias filter
// before linear interpolation.
export function resample(clip: AudioClip, targetRate: number): AudioClip {
  if (clip.sampleRate === targetRate) return clip;
  const ratio = clip.sampleRate / targetRate;
  const source = ratio > 1 ? movingAverage(clip.samples, Math.round(ratio)) : clip.samples;
  const samples = new Float32Array(Math.floor(source.length / ratio));
  for (let i = 0; i < samples.length; i++) {
    const position = i * ratio;
    const i0 = Math.floor(position);
    const i1 = Math.min(source.length - 1, i0 + 1);
    samples[i] = source[i0] + (source[i1] - source[i0]) * (position - i0);
  }
  return { sampleRate: targetRate, samples };
}

function movingAverage(samples: Float32Array, width: number): Float32Array {
  const out = new Float32Array(samples.length);
  let sum = 0;
  for (let i = 0; i < samples.length; i++) {
    sum += samples[i];
    if (i >= width) sum -= samples[i - width];
    out[i] = sum / Math.min(i + 1, width);
  }
  return out;
}
