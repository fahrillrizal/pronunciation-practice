import type { PhonemeResult } from "@/types";
import { getWordResult, type WordResult } from "@/lib/word-result";

interface ResultBadgeProps {
  result: WordResult;
  className?: string;
}

/**
 * Displays a "Correct" badge when all phonemes match.
 * Returns null for any non-perfect result.
 */
export function ResultBadge({ result, className = "" }: ResultBadgeProps) {
  if (result !== "correct") return null;

  return (
    <span
      className={`inline-block text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 border text-emerald-900 bg-emerald-50 border-emerald-700 ${className}`}
    >
      Correct
    </span>
  );
}

/**
 * Convenience wrapper: computes WordResult from phonemes, then renders badge.
 */
export function WordResultBadge({
  phonemes,
  className,
}: {
  phonemes: PhonemeResult[];
  className?: string;
}) {
  return <ResultBadge result={getWordResult(phonemes)} className={className} />;
}

