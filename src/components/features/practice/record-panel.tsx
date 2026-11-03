import { Mic } from "lucide-react";
import type { VadPhase } from "@/core/vad";

interface RecordPanelProps {
  hasText: boolean;
  hasResult: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  phase: VadPhase | null;
  onRecord: () => void;
}

function recordingLabel(phase: VadPhase | null): string {
  if (phase === "calibrating") return "Bersiap, jangan bersuara...";
  if (phase === "listening") return "Ucapkan kata sekarang";
  if (phase === "speaking" || phase === "done") return "Mendengar ucapanmu...";
  return "Menyiapkan mikrofon...";
}

export function RecordPanel({
  hasText,
  hasResult,
  isRecording,
  isProcessing,
  phase,
  onRecord,
}: RecordPanelProps) {
  if (!hasText) {
    return (
      <div className="border border-neutral-200 bg-neutral-50 p-6 flex flex-col items-center justify-center text-center space-y-3 min-h-[200px]">
        <div className="w-12 h-12 border border-neutral-300 flex items-center justify-center text-neutral-300">
          <Mic size={24} strokeWidth={1.5} />
        </div>
        <p className="text-sm text-neutral-400 font-medium">
          Klik &lsquo;Generate sentence&rsquo; dulu untuk mulai
        </p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="w-full min-h-[200px] p-6 border border-neutral-300 bg-white flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 border border-neutral-400 border-t-neutral-900 animate-spin" />
        <span className="font-medium text-base">Menganalisis ucapan...</span>
        <span className="text-xs text-neutral-500">DTW berjalan di latar belakang.</span>
      </div>
    );
  }

  const label = isRecording
    ? recordingLabel(phase)
    : hasResult
      ? "Rekam ulang"
      : "Klik untuk merekam";

  const hint = isRecording
    ? "Berhenti otomatis setelah 0,3 detik hening. Klik untuk berhenti sekarang."
    : hasResult
      ? "Ucapkan lagi untuk membandingkan hasil"
      : "Dengarkan referensi, lalu ucapkan kata dengan jelas";

  return (
    <button
      type="button"
      onClick={onRecord}
      className={`w-full min-h-[200px] p-6 border flex flex-col items-center justify-center text-center space-y-3 transition-colors cursor-pointer ${
        isRecording
          ? "border-red-700 bg-red-700 text-white"
          : "border-neutral-300 bg-white hover:border-neutral-900 text-neutral-900"
      }`}
    >
      <div
        className={`w-12 h-12 border flex items-center justify-center transition-colors ${
          isRecording ? "border-white text-white" : "border-neutral-900 text-neutral-900"
        }`}
      >
        <Mic size={24} strokeWidth={1.5} />
      </div>

      <div className="space-y-1">
        <span className="block font-medium text-base">{label}</span>
        <span
          className={`block text-xs leading-relaxed max-w-[260px] ${
            isRecording ? "text-red-100" : "text-neutral-500"
          }`}
        >
          {hint}
        </span>
      </div>
    </button>
  );
}
