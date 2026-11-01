import { Volume2 } from "lucide-react";

interface TextInputPanelProps {
  value: string;
  onRandomPhrase: () => void;
  onClear: () => void;
  allWordsAnnotated: boolean;
  isPlayingReference: boolean;
  onPlayReference: () => void;
}

/**
 * Panel for displaying the practice text with playback controls.
 *
 * Shows the current practice sentence in a read-only textarea with
 * buttons for random phrase selection, clearing, and reference audio.
 */
export function TextInputPanel({
  value,
  onRandomPhrase,
  onClear,
  allWordsAnnotated,
  isPlayingReference,
  onPlayReference,
}: TextInputPanelProps) {
  const hasText = value.trim().length > 0;
  const canPlayReference = allWordsAnnotated && hasText;

  return (
    <div className="border border-neutral-200 bg-white p-4 sm:p-5 flex flex-col justify-between space-y-4">
      {/* Top action row */}
      <div className="flex items-center justify-between">
        <label
          htmlFor="practice-textarea"
          className="text-xs uppercase tracking-wider font-semibold text-neutral-600"
        >
          Teks Latihan
        </label>
        <button
          type="button"
          onClick={onRandomPhrase}
          className="text-xs font-medium text-neutral-700 hover:text-neutral-950 underline underline-offset-2 cursor-pointer"
        >
          Frasa acak
        </button>
      </div>

      {/* Multi-line textarea */}
      <div className="relative flex-1">
        <textarea
          id="practice-textarea"
          rows={3}
          value={value}
          readOnly
          placeholder="Klik 'Frasa acak' untuk latihan"
          className="w-full p-3 pb-12 border border-neutral-300 text-neutral-900 text-base resize-none bg-neutral-50 cursor-default focus:outline-none font-normal leading-relaxed"
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

        {/* Speaker button: listen to reference */}
        <button
          type="button"
          onClick={onPlayReference}
          disabled={!canPlayReference}
          aria-label="Dengarkan referensi"
          title={
            canPlayReference
              ? "Dengarkan referensi (rekaman penutur)"
              : "Hanya untuk kata beranotasi"
          }
          className={`absolute bottom-2 right-2 p-1.5 border transition-colors ${
            !canPlayReference
              ? "border-neutral-200 bg-neutral-50 text-neutral-300 cursor-not-allowed"
              : isPlayingReference
                ? "border-neutral-900 bg-neutral-100 text-neutral-900 ring-1 ring-neutral-900 cursor-pointer"
                : "border-neutral-300 bg-white text-neutral-700 hover:border-neutral-600 hover:text-neutral-950 cursor-pointer"
          }`}
        >
          <Volume2
            size={16}
            className={isPlayingReference ? "animate-pulse" : ""}
          />
        </button>
      </div>
    </div>
  );
}

