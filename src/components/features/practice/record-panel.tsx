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
  if (phase === "calibrating") return "Get ready, stay quiet...";
  if (phase === "listening") return "Say the word now";
  if (phase === "speaking" || phase === "done") return "Listening to you...";
  return "Preparing microphone...";
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
          Click &lsquo;Generate sentence&rsquo; first to start
        </p>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="w-full min-h-[200px] p-6 border border-neutral-300 bg-white flex flex-col items-center justify-center text-center space-y-3">
        <div className="w-12 h-12 border border-neutral-400 border-t-neutral-900 animate-spin" />
        <span className="font-medium text-base">Analyzing speech...</span>
        <span className="text-xs text-neutral-500">DTW is running in the background.</span>
      </div>
    );
  }

  const label = isRecording
    ? recordingLabel(phase)
    : hasResult
      ? "Record again"
      : "Click to record";

  const hint = isRecording
    ? "Stops automatically after 0.3 seconds of silence. Click to stop now."
    : hasResult
      ? "Speak again to compare results"
      : "Listen to the reference, then say the word clearly";

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
