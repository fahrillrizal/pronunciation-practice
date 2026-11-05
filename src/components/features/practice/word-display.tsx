import { Play } from "lucide-react";
import type { ScreenState, WordAnalysis } from "@/types";
import { getWordResult } from "@/lib/word-result";
import { ResultBadge } from "@/components/ui";
import type { VadPhase } from "@/core/vad";

interface WordDisplayProps {
  word: string;
  analysis: WordAnalysis | null;
  state: ScreenState;
  phase: VadPhase | null;
  selectedPhonemeIndex: number | null;
  onSelectPhoneme: (index: number) => void;
  hasRecording: boolean;
  isPlayingRecording: boolean;
  onPlayRecording: () => void;
}

function recordingStatus(phase: VadPhase | null): string {
  if (phase === "calibrating") return "Measuring room noise...";
  if (phase === "listening") return "Say the word now";
  if (phase === "speaking") return "Recording speech...";
  if (phase === "done") return "Recording finished";
  return "Preparing microphone...";
}

const PHONEME_STYLE: Record<string, string> = {
  ok: "border-neutral-300 bg-white text-neutral-800",
  mismatch: "border-red-700 bg-red-50 text-red-900 font-semibold",
  "low-confidence": "border-dashed border-neutral-500 bg-neutral-100 text-neutral-600",
};

export function WordDisplay({
  word,
  analysis,
  state,
  phase,
  selectedPhonemeIndex,
  onSelectPhoneme,
  hasRecording,
  isPlayingRecording,
  onPlayRecording,
}: WordDisplayProps) {
  const hasProblem = analysis?.phonemes.some((p) => p.verdict === "mismatch") ?? false;

  return (
    <div className="border border-neutral-200 bg-white p-6 sm:p-8 space-y-4 text-center">
      <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
        {state === "recording"
          ? recordingStatus(phase)
          : analysis
            ? `Reference speaker ${analysis.speaker} — click a phoneme for guidance`
            : "Listen to the reference, then record yourself"}
      </p>

      <div className="flex flex-col items-center gap-2">
        <span
          className={`font-serif text-4xl sm:text-5xl tracking-tight ${
            hasProblem ? "text-red-800" : "text-neutral-900"
          }`}
        >
          {word}
        </span>
        {analysis && <ResultBadge result={getWordResult(analysis.phonemes)} />}
      </div>

      {analysis && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          {analysis.phonemes.map((phoneme, index) => (
            <button
              key={`${phoneme.index}-${phoneme.phoneme}`}
              type="button"
              onClick={() => onSelectPhoneme(index)}
              title={`/${phoneme.phoneme}/ — ${Math.round(phoneme.userDurationMs)} ms`}
              className={`border px-2 py-1 font-mono text-xs cursor-pointer transition-colors ${
                PHONEME_STYLE[phoneme.verdict]
              } ${selectedPhonemeIndex === index ? "ring-2 ring-neutral-900 ring-offset-1" : ""}`}
            >
              {phoneme.phoneme}
            </button>
          ))}
        </div>
      )}

      {analysis && hasRecording && (
        <button
          type="button"
          onClick={onPlayRecording}
          disabled={isPlayingRecording}
          className="inline-flex items-center gap-2 border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition-colors hover:border-neutral-900 hover:text-neutral-950 disabled:cursor-default disabled:text-neutral-400 cursor-pointer"
        >
          <Play size={13} aria-hidden="true" className={isPlayingRecording ? "animate-pulse" : ""} />
          {isPlayingRecording ? "Playing recording..." : "Listen to your recording"}
        </button>
      )}
    </div>
  );
}
