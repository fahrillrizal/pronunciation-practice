import type { ScreenState, WordAnalysis } from "@/types";
import { getWordResult } from "@/lib/word-result";
import { ResultBadge } from "@/components/ui";

interface SentenceRowProps {
  words: WordAnalysis[];
  selectedWordIndex: number;
  onSelectWord: (index: number) => void;
  state: ScreenState;
  recordingProgress?: number;
}

/**
 * Displays the sentence as clickable word chips.
 *
 * During recording, words darken left-to-right based on progress.
 * In result state, each word shows its pronunciation verdict.
 */
export function SentenceRow({
  words,
  selectedWordIndex,
  onSelectWord,
  state,
  recordingProgress = 0,
}: SentenceRowProps) {
  const isRecording = state === "recording";

  return (
    <div className="border border-neutral-200 bg-white p-6 sm:p-8 space-y-4 text-center">
      <p className="text-xs font-mono uppercase tracking-wider text-neutral-500">
        {isRecording ? "Merekam suara..." : "Klik kata untuk melihat analisisnya"}
      </p>

      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4">
        {words.map((word, idx) => {
          if (isRecording) {
            return (
              <RecordingWordChip
                key={word.index}
                word={word}
                index={idx}
                totalWords={words.length}
                progress={recordingProgress}
              />
            );
          }

          return (
            <AnalyzedWordChip
              key={word.index}
              word={word}
              isSelected={selectedWordIndex === idx}
              showResult={state === "result"}
              onSelect={() => onSelectWord(idx)}
            />
          );
        })}
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

interface RecordingWordChipProps {
  word: WordAnalysis;
  index: number;
  totalWords: number;
  progress: number;
}

function RecordingWordChip({
  word,
  index,
  totalWords,
  progress,
}: RecordingWordChipProps) {
  const threshold = (index + 0.5) / (totalWords || 1);
  const isDarkened = progress >= threshold;

  return (
    <span
      className={`text-2xl sm:text-[32px] px-2 py-1 select-none font-serif transition-colors ${
        isDarkened
          ? "text-neutral-900 font-semibold"
          : "text-neutral-300 font-normal"
      }`}
    >
      {word.text}
    </span>
  );
}

interface AnalyzedWordChipProps {
  word: WordAnalysis;
  isSelected: boolean;
  showResult: boolean;
  onSelect: () => void;
}

function AnalyzedWordChip({
  word,
  isSelected,
  showResult,
  onSelect,
}: AnalyzedWordChipProps) {
  const isSynthetic = word.kind === "synthetic";

  const wordStyle = isSynthetic
    ? "text-neutral-500"
    : word.hasProblem
      ? "text-amber-900 underline decoration-amber-700 decoration-4 underline-offset-8 font-medium"
      : "text-neutral-900";

  const borderStyle = isSynthetic
    ? "border border-dotted border-neutral-400 bg-neutral-50"
    : "border border-transparent";

  const title = isSynthetic
    ? "Kata sintetis (tanpa audio referensi)"
    : word.hasProblem
      ? "Fonem perlu dilatih — klik untuk detail"
      : "Pengucapan sesuai — klik untuk detail";

  return (
    <div className="flex flex-col items-center gap-1.5">
      <button
        type="button"
        onClick={onSelect}
        title={title}
        className={`text-2xl sm:text-[32px] px-3 py-1 font-serif cursor-pointer transition-all ${borderStyle} ${wordStyle} ${
          isSelected
            ? "ring-2 ring-neutral-900 ring-offset-2"
            : "hover:border-neutral-300"
        }`}
      >
        {word.text}
      </button>
      {showResult && !isSynthetic && (
        <ResultBadge result={getWordResult(word.phonemes)} />
      )}
    </div>
  );
}

