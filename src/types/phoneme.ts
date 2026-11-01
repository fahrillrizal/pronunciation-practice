/** Duration in milliseconds */
export type Milliseconds = number;

/** Evaluation verdict for a single phoneme */
export type PhonemeVerdict = "ok" | "mismatch" | "low-confidence";

/** Whether a word has full annotation or is synthetic */
export type WordKind = "annotated" | "synthetic";

/** All possible screen states in the practice flow */
export type ScreenState =
  | "empty"
  | "ready"
  | "playing"
  | "recording"
  | "processing"
  | "result";
