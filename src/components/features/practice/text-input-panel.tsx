import { Shuffle, Volume2 } from "lucide-react";

interface TextInputPanelProps {
  value: string;
  onGenerate: () => void;
  onClear: () => void;
  isPlayingReference: boolean;
  onPlayReference: () => void;
  sourceLabel: string;
}

export function TextInputPanel({
  value,
  onGenerate,
  onClear,
  isPlayingReference,
  onPlayReference,
  sourceLabel,
}: TextInputPanelProps) {
  const hasText = value.trim().length > 0;

  return (
    <div className="border border-neutral-200 bg-white p-4 sm:p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor="practice-textarea"
          className="text-xs uppercase tracking-wider font-semibold text-neutral-600"
        >
          Kata Latihan
        </label>
        <span className="text-[11px] font-mono text-neutral-400 truncate">{sourceLabel}</span>
      </div>

      <div className="relative flex-1">
        <textarea
          id="practice-textarea"
          rows={3}
          value={value}
          readOnly
          placeholder="Klik 'Generate sentence' untuk mendapat kata latihan"
          className="block w-full p-3 pb-12 border border-neutral-300 text-neutral-900 text-base resize-none bg-neutral-50 cursor-default focus:outline-none font-normal leading-relaxed"
        />

        {hasText && (
          <button
            type="button"
            onClick={onClear}
            className="absolute top-2 right-2 text-[11px] font-mono text-neutral-400 hover:text-neutral-700 bg-white/90 px-1.5 py-0.5 border border-neutral-200 cursor-pointer"
          >
            Hapus
          </button>
        )}

        <button
          type="button"
          onClick={onPlayReference}
          disabled={!hasText}
          aria-label="Dengarkan referensi"
          title={hasText ? "Dengarkan rekaman penutur asli" : "Pilih kata terlebih dahulu"}
          className={`absolute bottom-2 right-2 p-1.5 border transition-colors ${
            !hasText
              ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
              : isPlayingReference
                ? "border-neutral-900 bg-neutral-100 text-neutral-900 ring-1 ring-neutral-900 cursor-pointer"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-600 hover:text-neutral-950 cursor-pointer"
          }`}
        >
          <Volume2 size={16} className={isPlayingReference ? "animate-pulse" : ""} />
        </button>
      </div>

      <button
        type="button"
        onClick={onGenerate}
        className={`group w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border text-sm font-medium transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 ${
          hasText
            ? "border-neutral-900 bg-white text-neutral-900 hover:bg-neutral-100"
            : "border-neutral-900 bg-neutral-900 text-white hover:bg-neutral-700"
        }`}
      >
        <Shuffle
          size={16}
          aria-hidden="true"
          className="transition-transform duration-300 group-active:rotate-180"
        />
        Generate sentence
      </button>
    </div>
  );
}
