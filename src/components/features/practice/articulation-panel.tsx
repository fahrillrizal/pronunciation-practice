import type { ArticulationEntry, PhonemeResult } from "@/types";

interface ArticulationPanelProps {
  isOpen: boolean;
  onClose: () => void;
  phonemeResult: PhonemeResult | null;
  entry: ArticulationEntry | null;
  onPlayPhoneme: (index: number) => void;
}

/**
 * Slide-in panel showing phoneme pronunciation guidance.
 *
 * Bottom sheet on mobile, right side panel on desktop.
 * Contains articulation instructions, common errors, and duration stats.
 */
export function ArticulationPanel({
  isOpen,
  onClose,
  phonemeResult,
  entry,
  onPlayPhoneme,
}: ArticulationPanelProps) {
  if (!isOpen || (!phonemeResult && !entry)) {
    return null;
  }

  const phonemeName = entry?.phoneme ?? phonemeResult?.phoneme ?? "";
  const phonemeIndex = phonemeResult?.index ?? 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-neutral-900/30 z-40 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Container */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="articulation-title"
        className="fixed z-50 bg-white border-neutral-300 shadow-none
          inset-x-0 bottom-0 max-h-[85vh] border-t overflow-y-auto
          md:inset-y-0 md:right-0 md:left-auto md:w-[380px] md:max-h-full md:border-l md:border-t-0"
      >
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="flex items-start justify-between pb-4 border-b border-neutral-200">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 block mb-1">
                Panduan Fonetik
              </span>
              <h2
                id="articulation-title"
                className="text-2xl font-mono font-bold text-neutral-900"
              >
                /{phonemeName}/
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-xs border border-neutral-300 px-2.5 py-1 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
            >
              Tutup
            </button>
          </div>

          {/* Audio trigger */}
          <button
            type="button"
            onClick={() => onPlayPhoneme(phonemeIndex)}
            className="w-full py-2 px-3 border border-neutral-900 bg-neutral-900 text-white text-xs font-medium hover:bg-neutral-800 cursor-pointer flex items-center justify-center gap-2"
          >
            Putar fonem ini
          </button>

          {/* Pronunciation guide */}
          <div className="space-y-4">
            <GuideSection title="Cara Pengucapan">
              {entry?.howTo ??
                "Informasi artikulasi spesifik untuk fonem ini belum ditambahkan dalam basis data."}
            </GuideSection>

            <GuideSection title="Kekeliruan Umum">
              {entry?.commonError ??
                "Tidak ada catatan kekeliruan khusus untuk penutur bahasa Indonesia."}
            </GuideSection>

            {phonemeResult && <PhonemeStats result={phonemeResult} />}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function GuideSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-xs uppercase tracking-wider font-semibold text-neutral-600 mb-1.5">
        {title}
      </h3>
      <p className="text-sm text-neutral-800 leading-relaxed bg-neutral-50 p-3 border border-neutral-200">
        {children}
      </p>
    </div>
  );
}

function PhonemeStats({ result }: { result: PhonemeResult }) {
  const verdictLabel =
    result.verdict === "mismatch"
      ? "perlu dilatih"
      : result.verdict === "low-confidence"
        ? "keyakinan rendah (tidak dinilai)"
        : "sesuai";

  return (
    <div className="pt-2 border-t border-neutral-200 text-xs text-neutral-500 font-mono space-y-1">
      <div>Durasi referensi: {result.referenceDurationMs} ms</div>
      <div>Durasi rekaman: {result.userDurationMs} ms</div>
      <div>Status evaluasi: {verdictLabel}</div>
    </div>
  );
}

