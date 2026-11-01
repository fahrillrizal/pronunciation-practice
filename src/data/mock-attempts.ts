import type { SentenceAttempt, WordAnalysis } from "@/types";
import { generateSpeechEnvelope } from "@/lib/generate-speech-envelope";
import {
  WHAT_REF_ENV,
  WHAT_USER_ENV,
  IS_REF_ENV,
  IS_USER_ENV,
  YOUR_REF_ENV,
  YOUR_USER_ENV,
  NAME_REF_ENV,
  NAME_USER_ENV,
  THINK_REF_ENV,
  THINK_USER_ENV,
  THE_REF_ENV,
  THE_USER_ENV,
  COLD_REF_ENV,
  COLD_USER_ENV,
} from "./mock-envelopes";

// ─── Helpers ─────────────────────────────────────────────────────────

interface PhonemeSpec {
  phoneme: string;
  refMs: number;
  userMs: number;
}

interface EnvelopeSpec {
  center: number;
  width: number;
  amp: number;
}

/**
 * Builds an annotated word where every phoneme is pronounced correctly.
 */
function buildCorrectWord(
  index: number,
  text: string,
  specs: PhonemeSpec[],
  envelope: EnvelopeSpec[],
): WordAnalysis {
  let cursor = 0;
  const reference = specs.map((spec) => {
    const startMs = cursor;
    cursor += spec.refMs;
    return { phoneme: spec.phoneme, startMs, endMs: cursor };
  });

  return {
    index,
    text,
    kind: "annotated",
    hasProblem: false,
    referenceTotalMs: cursor,
    userTotalMs: specs.reduce((sum, spec) => sum + spec.userMs, 0),
    reference,
    phonemes: specs.map((spec, i) => ({
      index: i,
      phoneme: spec.phoneme,
      verdict: "ok" as const,
      referenceDurationMs: spec.refMs,
      userDurationMs: spec.userMs,
    })),
    referenceWaveform: generateSpeechEnvelope(envelope),
    userWaveform: generateSpeechEnvelope(
      envelope.map((e) => ({
        ...e,
        center: e.center + 0.01,
        amp: e.amp * 0.97,
      })),
    ),
    callouts: [],
  };
}

// ─── Sentence Attempts ──────────────────────────────────────────────

export const MOCK_SENTENCE_ATTEMPTS: Record<string, SentenceAttempt> = {
  "what is your name?": {
    text: "what is your name?",
    words: [
      {
        index: 0,
        text: "what",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 220,
        userTotalMs: 225,
        reference: [
          { phoneme: "W", startMs: 0, endMs: 70 },
          { phoneme: "AH", startMs: 70, endMs: 160 },
          { phoneme: "T", startMs: 160, endMs: 220 },
        ],
        phonemes: [
          { index: 0, phoneme: "W", verdict: "ok", referenceDurationMs: 70, userDurationMs: 68 },
          { index: 1, phoneme: "AH", verdict: "ok", referenceDurationMs: 90, userDurationMs: 95 },
          { index: 2, phoneme: "T", verdict: "ok", referenceDurationMs: 60, userDurationMs: 62 },
        ],
        referenceWaveform: WHAT_REF_ENV,
        userWaveform: WHAT_USER_ENV,
        callouts: [],
      },
      {
        index: 1,
        text: "is",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 200,
        userTotalMs: 202,
        reference: [
          { phoneme: "IH", startMs: 0, endMs: 90 },
          { phoneme: "Z", startMs: 90, endMs: 200 },
        ],
        phonemes: [
          { index: 0, phoneme: "IH", verdict: "ok", referenceDurationMs: 90, userDurationMs: 88 },
          { index: 1, phoneme: "Z", verdict: "ok", referenceDurationMs: 110, userDurationMs: 114 },
        ],
        referenceWaveform: IS_REF_ENV,
        userWaveform: IS_USER_ENV,
        callouts: [],
      },
      {
        index: 2,
        text: "your",
        kind: "annotated",
        hasProblem: true,
        referenceTotalMs: 350,
        userTotalMs: 238,
        reference: [
          { phoneme: "Y", startMs: 0, endMs: 60 },
          { phoneme: "AO", startMs: 60, endMs: 210 },
          { phoneme: "R", startMs: 210, endMs: 350 },
        ],
        phonemes: [
          { index: 0, phoneme: "Y", verdict: "ok", referenceDurationMs: 60, userDurationMs: 58 },
          { index: 1, phoneme: "AO", verdict: "ok", referenceDurationMs: 150, userDurationMs: 145 },
          { index: 2, phoneme: "R", verdict: "mismatch", referenceDurationMs: 140, userDurationMs: 35 },
        ],
        referenceWaveform: YOUR_REF_ENV,
        userWaveform: YOUR_USER_ENV,
        callouts: ["Bunyi ini kamu ucapkan jauh lebih pendek dari referensi."],
      },
      {
        index: 3,
        text: "name?",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 330,
        userTotalMs: 332,
        reference: [
          { phoneme: "N", startMs: 0, endMs: 80 },
          { phoneme: "EY", startMs: 80, endMs: 240 },
          { phoneme: "M", startMs: 240, endMs: 330 },
        ],
        phonemes: [
          { index: 0, phoneme: "N", verdict: "ok", referenceDurationMs: 80, userDurationMs: 82 },
          { index: 1, phoneme: "EY", verdict: "ok", referenceDurationMs: 160, userDurationMs: 155 },
          { index: 2, phoneme: "M", verdict: "ok", referenceDurationMs: 90, userDurationMs: 95 },
        ],
        referenceWaveform: NAME_REF_ENV,
        userWaveform: NAME_USER_ENV,
        callouts: [],
      },
    ],
  },

  "where do you live?": {
    text: "where do you live?",
    words: [
      buildCorrectWord(
        0,
        "where",
        [
          { phoneme: "W", refMs: 70, userMs: 72 },
          { phoneme: "EH", refMs: 130, userMs: 126 },
          { phoneme: "R", refMs: 110, userMs: 112 },
        ],
        [
          { center: 0.2, width: 0.15, amp: 0.6 },
          { center: 0.55, width: 0.22, amp: 0.9 },
          { center: 0.86, width: 0.12, amp: 0.55 },
        ],
      ),
      buildCorrectWord(
        1,
        "do",
        [
          { phoneme: "D", refMs: 60, userMs: 62 },
          { phoneme: "UW", refMs: 140, userMs: 138 },
        ],
        [
          { center: 0.2, width: 0.12, amp: 0.55 },
          { center: 0.65, width: 0.28, amp: 0.85 },
        ],
      ),
      buildCorrectWord(
        2,
        "you",
        [
          { phoneme: "Y", refMs: 60, userMs: 58 },
          { phoneme: "UW", refMs: 150, userMs: 152 },
        ],
        [
          { center: 0.18, width: 0.13, amp: 0.5 },
          { center: 0.63, width: 0.28, amp: 0.88 },
        ],
      ),
      buildCorrectWord(
        3,
        "live?",
        [
          { phoneme: "L", refMs: 70, userMs: 69 },
          { phoneme: "IH", refMs: 110, userMs: 112 },
          { phoneme: "V", refMs: 90, userMs: 91 },
        ],
        [
          { center: 0.18, width: 0.13, amp: 0.55 },
          { center: 0.5, width: 0.2, amp: 0.86 },
          { center: 0.84, width: 0.13, amp: 0.6 },
        ],
      ),
    ],
  },

  think: {
    text: "think",
    words: [
      {
        index: 0,
        text: "think",
        kind: "annotated",
        hasProblem: true,
        referenceTotalMs: 450,
        userTotalMs: 310,
        reference: [
          { phoneme: "TH", startMs: 0, endMs: 130 },
          { phoneme: "IH", startMs: 130, endMs: 240 },
          { phoneme: "NG", startMs: 240, endMs: 360 },
          { phoneme: "K", startMs: 360, endMs: 450 },
        ],
        phonemes: [
          { index: 0, phoneme: "TH", verdict: "mismatch", referenceDurationMs: 130, userDurationMs: 45 },
          { index: 1, phoneme: "IH", verdict: "ok", referenceDurationMs: 110, userDurationMs: 115 },
          { index: 2, phoneme: "NG", verdict: "ok", referenceDurationMs: 120, userDurationMs: 125 },
          { index: 3, phoneme: "K", verdict: "low-confidence", referenceDurationMs: 90, userDurationMs: 25 },
        ],
        referenceWaveform: THINK_REF_ENV,
        userWaveform: THINK_USER_ENV,
        callouts: [
          "Bunyi ini kamu ucapkan jauh lebih pendek dari referensi.",
          "Bagian ini hampir tidak terdeteksi dalam ucapanmu.",
        ],
      },
    ],
  },

  "the refrigerator is cold": {
    text: "the refrigerator is cold",
    words: [
      {
        index: 0,
        text: "the",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 160,
        userTotalMs: 165,
        reference: [
          { phoneme: "DH", startMs: 0, endMs: 70 },
          { phoneme: "AH", startMs: 70, endMs: 160 },
        ],
        phonemes: [
          { index: 0, phoneme: "DH", verdict: "ok", referenceDurationMs: 70, userDurationMs: 72 },
          { index: 1, phoneme: "AH", verdict: "ok", referenceDurationMs: 90, userDurationMs: 93 },
        ],
        referenceWaveform: THE_REF_ENV,
        userWaveform: THE_USER_ENV,
        callouts: [],
      },
      {
        index: 1,
        text: "refrigerator",
        kind: "synthetic",
        hasProblem: false,
        referenceTotalMs: 0,
        userTotalMs: 0,
        reference: [],
        phonemes: [],
        referenceWaveform: [],
        userWaveform: [],
        callouts: [],
      },
      {
        index: 2,
        text: "is",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 200,
        userTotalMs: 195,
        reference: [
          { phoneme: "IH", startMs: 0, endMs: 90 },
          { phoneme: "Z", startMs: 90, endMs: 200 },
        ],
        phonemes: [
          { index: 0, phoneme: "IH", verdict: "ok", referenceDurationMs: 90, userDurationMs: 88 },
          { index: 1, phoneme: "Z", verdict: "ok", referenceDurationMs: 110, userDurationMs: 107 },
        ],
        referenceWaveform: IS_REF_ENV,
        userWaveform: IS_USER_ENV,
        callouts: [],
      },
      {
        index: 3,
        text: "cold",
        kind: "annotated",
        hasProblem: false,
        referenceTotalMs: 340,
        userTotalMs: 335,
        reference: [
          { phoneme: "K", startMs: 0, endMs: 70 },
          { phoneme: "OW", startMs: 70, endMs: 200 },
          { phoneme: "L", startMs: 200, endMs: 270 },
          { phoneme: "D", startMs: 270, endMs: 340 },
        ],
        phonemes: [
          { index: 0, phoneme: "K", verdict: "ok", referenceDurationMs: 70, userDurationMs: 68 },
          { index: 1, phoneme: "OW", verdict: "ok", referenceDurationMs: 130, userDurationMs: 128 },
          { index: 2, phoneme: "L", verdict: "ok", referenceDurationMs: 70, userDurationMs: 71 },
          { index: 3, phoneme: "D", verdict: "ok", referenceDurationMs: 70, userDurationMs: 68 },
        ],
        referenceWaveform: COLD_REF_ENV,
        userWaveform: COLD_USER_ENV,
        callouts: [],
      },
    ],
  },
};

