"use client";

import { usePracticeState } from "@/hooks";
import {
  TextInputPanel,
  RecordPanel,
  SentenceRow,
  DurationComparison,
  Waveforms,
  ArticulationPanel,
  UnsupportedNotice,
} from "@/components/features/practice";

/**
 * Main practice view component.
 *
 * Orchestrates all practice sub-components using the centralized
 * usePracticeState hook. This is the only "use client" boundary
 * for the practice feature.
 */
export function PracticeView() {
  const {
    screenState,
    activeAudioTarget,
    recordingProgress,
    textInput,
    hasText,
    allWordsAnnotated,
    currentSentenceAttempt,
    safeWordIndex,
    selectedWord,
    selectedPhonemeIndex,
    selectedPhonemeResult,
    articulationEntry,
    isArticulationOpen,
    handleSelectPhrase,
    handleRandomPhrase,
    handleClearText,
    handlePlayReference,
    handleRecord,
    handleSelectWord,
    handleSelectPhoneme,
    handleCloseArticulation,
  } = usePracticeState();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <main className="max-w-[720px] mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <header className="border-b border-neutral-200 pb-3">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Latihan Pengucapan Fonem
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Analisis durasi dan kesesuaian fonem per kata dalam kalimat dengan
            batas fonem referensi.
          </p>
        </header>

        {/* Section 1: Text Input & Recording */}
        <section aria-label="Masukan Teks dan Perekaman" className="space-y-3">
          <div className="grid grid-cols-1 min-[760px]:grid-cols-2 gap-3 items-stretch">
            <TextInputPanel
              value={textInput}
              onRandomPhrase={handleRandomPhrase}
              onClear={handleClearText}
              allWordsAnnotated={allWordsAnnotated}
              isPlayingReference={
                screenState === "playing" && activeAudioTarget === "reference"
              }
              onPlayReference={handlePlayReference}
            />
            <RecordPanel
              hasText={hasText}
              hasResult={screenState === "result"}
              isRecording={screenState === "recording"}
              onRecord={handleRecord}
            />
          </div>
        </section>

        {/* Section 2: Sentence Row */}
        {screenState !== "empty" &&
          currentSentenceAttempt.words.length > 0 && (
            <section aria-label="Deretan Kata Kalimat">
              <SentenceRow
                words={currentSentenceAttempt.words}
                selectedWordIndex={safeWordIndex}
                onSelectWord={handleSelectWord}
                state={screenState}
                recordingProgress={recordingProgress}
              />
            </section>
          )}

        {/* Processing skeleton */}
        {screenState === "processing" && <ProcessingSkeleton />}

        {/* Section 3: Word Analysis */}
        {screenState === "result" && selectedWord && (
          <section aria-label="Area Analisis Kata Terpilih" className="space-y-5">
            {selectedWord.kind === "synthetic" ? (
              <UnsupportedNotice
                onPickCuratedWord={() =>
                  handleSelectPhrase("what is your name?")
                }
              />
            ) : (
              <>
                <DurationComparison
                  reference={selectedWord.reference}
                  phonemes={selectedWord.phonemes}
                  referenceTotalMs={selectedWord.referenceTotalMs}
                  userTotalMs={selectedWord.userTotalMs}
                  callouts={selectedWord.callouts}
                  selectedPhonemeIndex={selectedPhonemeIndex}
                  onSelectPhoneme={handleSelectPhoneme}
                />
                <Waveforms
                  referenceWaveform={selectedWord.referenceWaveform}
                  userWaveform={selectedWord.userWaveform}
                  referenceTotalMs={selectedWord.referenceTotalMs}
                  userTotalMs={selectedWord.userTotalMs}
                  phonemes={selectedWord.phonemes}
                  onSelectPhoneme={handleSelectPhoneme}
                />
              </>
            )}
          </section>
        )}

        {/* Articulation Panel (modal/sheet) */}
        <ArticulationPanel
          isOpen={isArticulationOpen}
          onClose={handleCloseArticulation}
          phonemeResult={selectedPhonemeResult}
          entry={articulationEntry}
          onPlayPhoneme={() => {}}
        />
      </main>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

function ProcessingSkeleton() {
  return (
    <section
      aria-label="Memproses Hasil"
      className="border border-neutral-200 bg-white p-6 space-y-4"
    >
      <div className="text-xs uppercase tracking-wider font-semibold text-neutral-500">
        Menganalisis sinyal akustik...
      </div>
      <div className="space-y-3">
        <div className="h-5 bg-neutral-200 w-1/4 animate-pulse" />
        <div className="h-32 bg-neutral-100 border border-neutral-200 animate-pulse" />
        <div className="h-20 bg-neutral-100 border border-neutral-200 animate-pulse" />
      </div>
    </section>
  );
}

