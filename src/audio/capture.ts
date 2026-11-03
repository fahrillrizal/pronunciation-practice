import { SAMPLE_RATE, VAD_FRAME_MS, VAD_PREROLL_MS } from "../core/constants.ts";
import { rmsDb } from "../core/energy.ts";
import { createVadState, vadStep, type VadDoneReason, type VadState } from "../core/vad.ts";
import { resample } from "../core/wav.ts";

const WORKLET_URL = "/recorder-worklet.js";
const TAIL_MS = 100;

interface CaptureResult {
  samples: Float32Array;
  sampleRate: number;
  reason: VadDoneReason;
}

export interface Recording {
  done: Promise<CaptureResult | null>;
  stop: () => void;
}

function concat(chunks: readonly Float32Array[], length: number): Float32Array {
  const out = new Float32Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

function sliceSpeech(samples: Float32Array, frameSize: number, state: VadState): Float32Array {
  const preroll = Math.round(VAD_PREROLL_MS / VAD_FRAME_MS);
  const tail = Math.round(TAIL_MS / VAD_FRAME_MS);
  const start = Math.max(0, (state.speechStartFrame - preroll) * frameSize);
  const end = Math.min(samples.length, (state.lastVoicedFrame + 1 + tail) * frameSize);
  return samples.subarray(start, end);
}

export async function startRecording(onPhaseChange?: (state: VadState) => void): Promise<Recording> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: { channelCount: 1, echoCancellation: false, noiseSuppression: false, autoGainControl: false },
  });
  const context = new AudioContext();
  await context.resume();
  await context.audioWorklet.addModule(WORKLET_URL);

  const source = context.createMediaStreamSource(stream);
  const node = new AudioWorkletNode(context, "recorder");
  const mute = context.createGain();
  mute.gain.value = 0;
  source.connect(node);
  node.connect(mute);
  mute.connect(context.destination);

  const chunks: Float32Array[] = [];
  const frameSize = Math.round(context.sampleRate / 100);
  const pending = new Float32Array(frameSize);
  let pendingLength = 0;
  let totalLength = 0;
  let state = createVadState();
  let lastPhase = state.phase;
  let finished = false;
  let finish: (result: CaptureResult | null) => void = () => {};

  const done = new Promise<CaptureResult | null>((resolve) => {
    finish = resolve;
  });

  const cleanup = async () => {
    node.port.onmessage = null;
    source.disconnect();
    node.disconnect();
    mute.disconnect();
    stream.getTracks().forEach((track) => track.stop());
    await context.close();
  };

  const complete = (reason: VadDoneReason) => {
    if (finished) return;
    finished = true;
    state = { ...state, phase: "done", reason };
    onPhaseChange?.(state);

    const all = concat(chunks, totalLength);
    const speech = state.speechStartFrame < 0 ? null : sliceSpeech(all, frameSize, state);
    const clip = speech && resample({ sampleRate: context.sampleRate, samples: speech }, SAMPLE_RATE);
    finish(
      clip && {
        samples: clip.samples,
        sampleRate: clip.sampleRate,
        reason,
      },
    );
    void cleanup();
  };

  node.port.onmessage = (event: MessageEvent<Float32Array>) => {
    if (finished) return;
    const chunk = event.data;
    chunks.push(chunk);
    totalLength += chunk.length;

    for (let offset = 0; offset < chunk.length && !finished; ) {
      const take = Math.min(frameSize - pendingLength, chunk.length - offset);
      pending.set(chunk.subarray(offset, offset + take), pendingLength);
      pendingLength += take;
      offset += take;
      if (pendingLength < frameSize) continue;

      state = vadStep(state, rmsDb(pending));
      pendingLength = 0;
      if (state.phase !== lastPhase) {
        lastPhase = state.phase;
        onPhaseChange?.(state);
      }
      if (state.phase === "done") complete(state.reason ?? "no-speech");
    }
  };

  return {
    done,
    stop: () => complete("manual"),
  };
}
