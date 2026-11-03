export const SAMPLE_RATE = 16000;

export const FRAME_SIZE = 512;
export const HOP_LENGTH = 160;
export const N_MELS = 26;
export const N_MFCC = 13;

export const CMVN_MIN_STD = 1e-3;

// Sakoe & Chiba (1978). Wider than the usual 10% because learners' durations
// can differ greatly from the reference.
export const DTW_BAND_RATIO = 0.25;

export const LOW_CONFIDENCE_MIN_FRAMES = 2;
// Relative to the two reference speakers' disagreement on the same phoneme (fallback: word median).
export const MISMATCH_RELATIVE_RATIO = 1.5;
export const MISMATCH_MIN_MEDIAN = 0.25;
export const MIN_SCORED_PHONEMES = 3;
export const DURATION_TOO_LONG_RATIO = 1.8;
export const DURATION_TOO_SHORT_RATIO = 0.45;
export const DURATION_MISMATCH_MAX_RATIO = 2;
export const DURATION_MISMATCH_MIN_RATIO = 0.4;

export const TRIM_THRESHOLD_DB = 10;
export const TRIM_NOISE_PERCENTILE = 0.1;

export const VAD_FRAME_MS = 10;
export const VAD_CALIBRATION_MS = 300;
export const VAD_MIN_NOISE_FLOOR_DB = -65;
export const VAD_START_DB = 12;
export const VAD_CONTINUE_DB = 6;
export const VAD_MIN_ONSET_MS = 80;
// Longer than a word-internal stop closure (~100–150 ms) so words are not cut.
export const VAD_HANGOVER_MS = 300;
export const VAD_MIN_SPEECH_MS = 150;
export const VAD_NO_SPEECH_TIMEOUT_MS = 6000;
export const VAD_MAX_SPEECH_MS = 4000;
export const VAD_PREROLL_MS = 200;

export const REFERENCE_MIN_WORD_MS = 150;
export const REFERENCE_MIN_PHONEME_MS = 15;
export const MIN_WORD_LENGTH = 3;

export const WAVEFORM_POINTS = 120;
