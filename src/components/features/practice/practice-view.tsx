"use client";

import { usePracticeState } from "@/hooks";
import { REFERENCE_SOURCE } from "@/data";
import {
  TextInputPanel,
  RecordPanel,
  DurationComparison,
  Waveforms,
  PhonemeScores,
  WordDisplay,
  ArticulationPanel,
} from "@/components/features/practice";

export function PracticeView() {
  const {
    screenState,
    word,
    hasText,
    analysis,
    error,
    recordingPhase,
    isPlayingReference,
    isPlayingRecording,
    hasRecording,
    selectedPhoneme,
    articulationEntry,
    isArticulationOpen,
    handleGenerate,
    handleClear,
    handlePlayReference,
    handlePlayRecording,
    handlePlayPhoneme,
    handleRecord,
    handleSelectPhoneme,
    handleCloseArticulation,
  } = usePracticeState();

  return (
    <div className="min-h-screen bg-neutral-100 text-neutral-900 font-sans antialiased">
      <main className="max-w-[720px] mx-auto px-4 py-8 space-y-6">
        <header className="border-b border-neutral-200 pb-3">
          <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
            Phoneme Pronunciation Practice
          </h1>
        </header>

        <section aria-label="Input and recording" className="space-y-3">
          <div className="grid grid-cols-1 min-[760px]:grid-cols-2 gap-3 items-stretch">
            <TextInputPanel
              value={word}
              onGenerate={handleGenerate}
              onClear={handleClear}
              isPlayingReference={isPlayingReference}
              onPlayReference={handlePlayReference}
              sourceLabel={REFERENCE_SOURCE}
            />
            <RecordPanel
              hasText={hasText}
              hasResult={screenState === "result"}
              isRecording={screenState === "recording"}
              isProcessing={screenState === "processing"}
              phase={recordingPhase}
              onRecord={handleRecord}
            />
          </div>
        </section>

        {error && (
          <div className="border border-red-300 bg-red-50 p-3 text-sm text-red-900">{error}</div>
        )}

        {hasText && screenState !== "empty" && (
          <WordDisplay
            word={word}
            analysis={analysis}
            state={screenState}
            phase={recordingPhase}
            selectedPhonemeIndex={selectedPhoneme?.index ?? null}
            onSelectPhoneme={handleSelectPhoneme}
            hasRecording={hasRecording}
            isPlayingRecording={isPlayingRecording}
            onPlayRecording={handlePlayRecording}
          />
        )}

        {screenState === "result" && analysis && (
          <section aria-label="Analysis results" className="space-y-5">
            <DurationComparison
              phonemes={analysis.phonemes}
              userSpans={analysis.userSpans}
              referenceTotalMs={analysis.referenceTotalMs}
              userTotalMs={analysis.userTotalMs}
              callouts={analysis.callouts}
              selectedPhonemeIndex={selectedPhoneme?.index ?? null}
              onSelectPhoneme={handleSelectPhoneme}
            />
            <Waveforms
              referenceWaveform={analysis.referenceWaveform}
              userWaveform={analysis.userWaveform}
              referenceTotalMs={analysis.referenceTotalMs}
              userTotalMs={analysis.userTotalMs}
              phonemes={analysis.phonemes}
              userSpans={analysis.userSpans}
              onSelectPhoneme={handleSelectPhoneme}
            />
            <PhonemeScores
              phonemes={analysis.phonemes}
              selectedPhonemeIndex={selectedPhoneme?.index ?? null}
              onSelectPhoneme={handleSelectPhoneme}
            />
          </section>
        )}

        <ArticulationPanel
          isOpen={isArticulationOpen}
          onClose={handleCloseArticulation}
          phonemeResult={selectedPhoneme}
          entry={articulationEntry}
          onPlayPhoneme={handlePlayPhoneme}
        />
      </main>
    </div>
  );
}
