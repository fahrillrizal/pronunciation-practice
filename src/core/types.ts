export type Milliseconds = number;
export type FrameIndex = number;
export type FeatureMatrix = Float64Array[];

export interface PhonemeSegment {
  phoneme: string;
  startMs: Milliseconds;
  endMs: Milliseconds;
}

export interface AudioClip {
  sampleRate: number;
  samples: Float32Array;
}

export interface SpokenWord {
  word: string;
  phonemes: PhonemeSegment[];
  startMs: Milliseconds;
  endMs: Milliseconds;
  precededByPause: boolean;
  followedByPause: boolean;
}

export type PhonemeVerdict = "ok" | "mismatch" | "low-confidence";

export interface PhonemeMeasurement {
  index: number;
  phoneme: string;
  referenceDurationMs: Milliseconds;
  userDurationMs: Milliseconds;
  mappedFrames: number;
  distance: number;
}

export interface PhonemeScore extends PhonemeMeasurement {
  verdict: PhonemeVerdict;
  relativeDistance: number;
}

export interface TimeSpan {
  startMs: Milliseconds;
  endMs: Milliseconds;
}
