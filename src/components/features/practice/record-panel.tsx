import { Mic } from "lucide-react";

interface RecordPanelProps {
  hasText: boolean;
  hasResult: boolean;
  isRecording: boolean;
  onRecord: () => void;
}

/**
 * Recording control panel with mic button and status text.
 *
 * Shows a disabled placeholder when no text is entered,
 * otherwise displays a large clickable recording button.
 */
export function RecordPanel({
  hasText,
  hasResult,
  isRecording,
  onRecord,
}: RecordPanelProps) {
  if (!hasText) {
    return (
      <div className="border border-neutral-200 bg-neutral-50 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
        <div className="w-12 h-12 rounded-none border border-neutral-300 flex items-center justify-center text-neutral-300">
          <Mic size={24} strokeWidth={1.5} />
        </div>
        <p className="text-sm text-neutral-400 font-medium">
          Pilih frasa dulu untuk dilatih
        </p>
      </div>
    );
  }

  const label = isRecording
    ? "Sedang merekam..."
    : hasResult
      ? "Rekam ulang"
      : "Klik untuk merekam";

  const hint = isRecording
    ? "Klik di sini untuk menghentikan dan menganalisis"
    : hasResult
      ? "Ucapkan lagi untuk memperbaiki hasil"
      : "Dengarkan dulu, lalu ucapkan dengan suara jelas";

  return (
    <button
      type="button"
      onClick={onRecord}
      className={`w-full min-h-[200px] p-6 border flex flex-col items-center justify-center text-center space-y-3 transition-colors cursor-pointer ${
        isRecording
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-300 bg-white hover:border-neutral-900 text-neutral-900"
      }`}
    >
      <div
        className={`w-12 h-12 border flex items-center justify-center transition-colors ${
          isRecording
            ? "border-white text-white"
            : "border-neutral-900 text-neutral-900"
        }`}
      >
        <Mic size={24} strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <span className="block font-medium text-base">{label}</span>
        <span
          className={`block text-xs leading-relaxed max-w-[240px] ${
            isRecording ? "text-neutral-300" : "text-neutral-500"
          }`}
        >
          {hint}
        </span>
      </div>
    </button>
  );
}

