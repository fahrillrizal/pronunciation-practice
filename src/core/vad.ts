import {
  VAD_CALIBRATION_MS,
  VAD_CONTINUE_DB,
  VAD_FRAME_MS,
  VAD_HANGOVER_MS,
  VAD_MAX_SPEECH_MS,
  VAD_MIN_NOISE_FLOOR_DB,
  VAD_MIN_ONSET_MS,
  VAD_MIN_SPEECH_MS,
  VAD_NO_SPEECH_TIMEOUT_MS,
  VAD_START_DB,
} from "./constants.ts";

export type VadDoneReason = "speech-ended" | "no-speech" | "max-length" | "manual";
export type VadPhase = "calibrating" | "listening" | "speaking" | "done";

export interface VadState {
  phase: VadPhase;
  frame: number;
  noiseFloorDb: number;
  calibrationSum: number;
  onsetRun: number;
  speechStartFrame: number;
  lastVoicedFrame: number;
  reason: VadDoneReason | null;
}

const toFrames = (ms: number) => Math.max(1, Math.round(ms / VAD_FRAME_MS));

export const VAD_FRAMES = {
  calibration: toFrames(VAD_CALIBRATION_MS),
  minOnset: toFrames(VAD_MIN_ONSET_MS),
  hangover: toFrames(VAD_HANGOVER_MS),
  minSpeech: toFrames(VAD_MIN_SPEECH_MS),
  noSpeechTimeout: toFrames(VAD_NO_SPEECH_TIMEOUT_MS),
  maxSpeech: toFrames(VAD_MAX_SPEECH_MS),
} as const;

export function createVadState(): VadState {
  return {
    phase: "calibrating",
    frame: 0,
    noiseFloorDb: VAD_MIN_NOISE_FLOOR_DB,
    calibrationSum: 0,
    onsetRun: 0,
    speechStartFrame: -1,
    lastVoicedFrame: -1,
    reason: null,
  };
}

function calibrate(state: VadState, frameDb: number): VadState {
  const calibrationSum = state.calibrationSum + frameDb;
  if (state.frame + 1 < VAD_FRAMES.calibration) return { ...state, frame: state.frame + 1, calibrationSum };
  return {
    ...state,
    frame: state.frame + 1,
    calibrationSum,
    noiseFloorDb: Math.max(VAD_MIN_NOISE_FLOOR_DB, calibrationSum / VAD_FRAMES.calibration),
    phase: "listening",
  };
}

function listen(state: VadState, frameDb: number): VadState {
  const next = { ...state, frame: state.frame + 1 };
  if (frameDb <= state.noiseFloorDb + VAD_START_DB) {
    const waited = state.frame - VAD_FRAMES.calibration;
    return waited >= VAD_FRAMES.noSpeechTimeout
      ? { ...next, onsetRun: 0, phase: "done", reason: "no-speech" }
      : { ...next, onsetRun: 0 };
  }
  const onsetRun = state.onsetRun + 1;
  if (onsetRun < VAD_FRAMES.minOnset) return { ...next, onsetRun };
  return {
    ...next,
    onsetRun,
    phase: "speaking",
    speechStartFrame: state.frame - onsetRun + 1,
    lastVoicedFrame: state.frame,
  };
}

// Hysteresis: speech continues above a lower threshold than it starts, so a
// brief dip inside a word is not taken as the end.
function speak(state: VadState, frameDb: number): VadState {
  const voiced = frameDb > state.noiseFloorDb + VAD_CONTINUE_DB;
  const lastVoicedFrame = voiced ? state.frame : state.lastVoicedFrame;
  const next = { ...state, frame: state.frame + 1, lastVoicedFrame };

  if (state.frame - state.speechStartFrame + 1 >= VAD_FRAMES.maxSpeech) {
    return { ...next, phase: "done", reason: "max-length" };
  }
  if (state.frame - lastVoicedFrame < VAD_FRAMES.hangover) return next;
  if (lastVoicedFrame - state.speechStartFrame + 1 >= VAD_FRAMES.minSpeech) {
    return { ...next, phase: "done", reason: "speech-ended" };
  }
  return { ...next, phase: "listening", onsetRun: 0, speechStartFrame: -1, lastVoicedFrame: -1 };
}

export function vadStep(state: VadState, frameDb: number): VadState {
  switch (state.phase) {
    case "calibrating":
      return calibrate(state, frameDb);
    case "listening":
      return listen(state, frameDb);
    case "speaking":
      return speak(state, frameDb);
    case "done":
      return state;
  }
}
