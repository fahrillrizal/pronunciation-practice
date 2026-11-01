interface UnsupportedNoticeProps {
  onPickCuratedWord?: () => void;
}

/**
 * Informational notice shown when a synthetic (non-annotated) word is selected.
 *
 * Explains why phoneme analysis is unavailable and offers a link
 * to switch to a curated word.
 */
export function UnsupportedNotice({ onPickCuratedWord }: UnsupportedNoticeProps) {
  return (
    <div className="border border-neutral-300 bg-neutral-50 p-6 space-y-3">
      <h3 className="text-base font-medium text-neutral-900 tracking-tight">
        Kata ini belum punya audio referensi beranotasi
      </h3>
      <p className="text-sm text-neutral-600 leading-relaxed">
        Sistem dapat melafalkan kata ini menggunakan mesin suara peramban, namun belum dapat
        melakukan evaluasi fonem. Analisis pengucapan memerlukan rekaman audio penutur asli
        dengan penanda batas fonem yang telah dikurasi secara manual.
      </p>
      <p className="text-sm text-neutral-600 leading-relaxed">
        Silakan pilih salah satu kata dari kelompok daftar kurasi di atas untuk mencoba evaluasi
        durasi dan artikulasi fonem secara lengkap.
      </p>
      {onPickCuratedWord && (
        <div className="pt-2">
          <button
            type="button"
            onClick={onPickCuratedWord}
            className="text-xs font-medium text-neutral-800 underline underline-offset-4 hover:text-neutral-950 cursor-pointer"
          >
            Lihat daftar kata kurasi
          </button>
        </div>
      )}
    </div>
  );
}

