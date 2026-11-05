import type { PhonemeScore } from "@/types";

interface PhonemeScoresProps {
  phonemes: PhonemeScore[];
  selectedPhonemeIndex: number | null;
  onSelectPhoneme: (index: number) => void;
}

function barWidths(phonemes: readonly PhonemeScore[]): number[] {
  const distances = phonemes.map((p) => p.relativeDistance);
  const min = Math.min(...distances);
  const max = Math.max(...distances);
  return distances.map((d) => (max - min < 1e-9 ? 1 : 1 - (d - min) / (max - min)));
}

const VERDICT_LABEL: Record<PhonemeScore["verdict"], string> = {
  ok: "correct",
  mismatch: "needs practice",
  "low-confidence": "low confidence",
};

export function PhonemeScores({ phonemes, selectedPhonemeIndex, onSelectPhoneme }: PhonemeScoresProps) {
  const widths = barWidths(phonemes);

  return (
    <div className="border border-neutral-200 bg-white p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
        Relative Score per Phoneme
      </div>
      <div className="space-y-1.5">
        {phonemes.map((phoneme, index) => (
          <button
            key={`${phoneme.index}-${phoneme.phoneme}`}
            type="button"
            onClick={() => onSelectPhoneme(index)}
            aria-label={`Phoneme ${phoneme.phoneme}, ${VERDICT_LABEL[phoneme.verdict]}`}
            className={`w-full flex items-center gap-3 px-2 py-1 text-left cursor-pointer transition-colors ${
              selectedPhonemeIndex === index ? "bg-neutral-100" : "hover:bg-neutral-50"
            }`}
          >
            <span className="w-10 shrink-0 font-mono text-xs font-medium text-neutral-700">{phoneme.phoneme}</span>
            <span className="flex-1 h-3 bg-neutral-100">
              <span
                className={`block h-full ${phoneme.verdict === "mismatch" ? "bg-red-700" : phoneme.verdict === "low-confidence" ? "bg-neutral-400" : "bg-neutral-700"}`}
                style={{ width: `${Math.round(30 + widths[index] * 70)}%` }}
              />
            </span>
            <span className="w-28 shrink-0 text-right text-[11px] text-neutral-500">{VERDICT_LABEL[phoneme.verdict]}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
