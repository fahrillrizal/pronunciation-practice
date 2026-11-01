import { generateSpeechEnvelope } from "@/lib/generate-speech-envelope";

// ─── Word-level envelope definitions ─────────────────────────────────

export const WHAT_REF_ENV = generateSpeechEnvelope([
  { center: 0.22, width: 0.16, amp: 0.65 },
  { center: 0.55, width: 0.2, amp: 0.88 },
  { center: 0.86, width: 0.08, amp: 0.4 },
]);
export const WHAT_USER_ENV = generateSpeechEnvelope([
  { center: 0.24, width: 0.15, amp: 0.62 },
  { center: 0.56, width: 0.19, amp: 0.85 },
  { center: 0.88, width: 0.07, amp: 0.38 },
]);

export const IS_REF_ENV = generateSpeechEnvelope([
  { center: 0.35, width: 0.25, amp: 0.78 },
  { center: 0.75, width: 0.2, amp: 0.6 },
]);
export const IS_USER_ENV = generateSpeechEnvelope([
  { center: 0.36, width: 0.24, amp: 0.75 },
  { center: 0.77, width: 0.19, amp: 0.58 },
]);

export const YOUR_REF_ENV = generateSpeechEnvelope([
  { center: 0.18, width: 0.14, amp: 0.55 },
  { center: 0.48, width: 0.24, amp: 0.92 },
  { center: 0.82, width: 0.18, amp: 0.72 },
]);
export const YOUR_USER_ENV = generateSpeechEnvelope([
  { center: 0.22, width: 0.15, amp: 0.58 },
  { center: 0.56, width: 0.25, amp: 0.9 },
  { center: 0.88, width: 0.06, amp: 0.28 },
]);

export const NAME_REF_ENV = generateSpeechEnvelope([
  { center: 0.18, width: 0.15, amp: 0.6 },
  { center: 0.52, width: 0.26, amp: 0.94 },
  { center: 0.85, width: 0.15, amp: 0.68 },
]);
export const NAME_USER_ENV = generateSpeechEnvelope([
  { center: 0.2, width: 0.16, amp: 0.62 },
  { center: 0.54, width: 0.25, amp: 0.9 },
  { center: 0.86, width: 0.14, amp: 0.65 },
]);

export const THINK_REF_ENV = generateSpeechEnvelope([
  { center: 0.18, width: 0.18, amp: 0.68 },
  { center: 0.44, width: 0.18, amp: 0.86 },
  { center: 0.7, width: 0.18, amp: 0.78 },
  { center: 0.9, width: 0.08, amp: 0.5 },
]);
export const THINK_USER_ENV = generateSpeechEnvelope([
  { center: 0.1, width: 0.08, amp: 0.4 },
  { center: 0.42, width: 0.2, amp: 0.85 },
  { center: 0.72, width: 0.19, amp: 0.76 },
  { center: 0.92, width: 0.04, amp: 0.15 },
]);

export const THE_REF_ENV = generateSpeechEnvelope([
  { center: 0.3, width: 0.2, amp: 0.6 },
  { center: 0.7, width: 0.24, amp: 0.75 },
]);
export const THE_USER_ENV = generateSpeechEnvelope([
  { center: 0.32, width: 0.19, amp: 0.58 },
  { center: 0.72, width: 0.23, amp: 0.72 },
]);

export const COLD_REF_ENV = generateSpeechEnvelope([
  { center: 0.14, width: 0.1, amp: 0.55 },
  { center: 0.45, width: 0.25, amp: 0.92 },
  { center: 0.76, width: 0.18, amp: 0.68 },
  { center: 0.92, width: 0.08, amp: 0.45 },
]);
export const COLD_USER_ENV = generateSpeechEnvelope([
  { center: 0.15, width: 0.09, amp: 0.52 },
  { center: 0.46, width: 0.24, amp: 0.89 },
  { center: 0.78, width: 0.17, amp: 0.65 },
  { center: 0.93, width: 0.07, amp: 0.42 },
]);

