"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { PhonemeScore, ScreenState, WordAnalysis } from "@/types";
import { ARTICULATION_ENTRIES, REFERENCE_SPEAKERS, REFERENCE_WORDS } from "@/data";
import { startRecording, type Recording } from "@/audio/capture";
import { playSamples, playUrl, stopPlayback } from "@/audio/playback";
import { pickRandomWord } from "@/core/corpus";
import { SAMPLE_RATE } from "@/core/constants";
import type { VadPhase } from "@/core/vad";
import { referenceAudioUrl } from "@/data/reference-words";
import { createAnalysisClient } from "@/lib/analysis-client";

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function usePracticeState() {
  const [screenState, setScreenState] = useState<ScreenState>("empty");
  const [word, setWord] = useState("");
  const [analysis, setAnalysis] = useState<WordAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recordingPhase, setRecordingPhase] = useState<VadPhase | null>(null);
  const [isPlayingReference, setIsPlayingReference] = useState(false);
  const [isPlayingRecording, setIsPlayingRecording] = useState(false);
  const [userRecording, setUserRecording] = useState<Float32Array | null>(null);
  const [selectedPhonemeIndex, setSelectedPhonemeIndex] = useState<number | null>(null);
  const [isArticulationOpen, setIsArticulationOpen] = useState(false);

  const recordingRef = useRef<Recording | null>(null);
  const clientRef = useRef<ReturnType<typeof createAnalysisClient> | null>(null);

  const analysisClient = useCallback(() => {
    clientRef.current ??= createAnalysisClient(SAMPLE_RATE);
    return clientRef.current;
  }, []);

  useEffect(
    () => () => {
      recordingRef.current?.stop();
      clientRef.current?.close();
      stopPlayback();
    },
    [],
  );

  const resetSelection = useCallback(() => {
    setSelectedPhonemeIndex(null);
    setIsArticulationOpen(false);
  }, []);

  const referenceUrl = useCallback(
    (speaker: string) => referenceAudioUrl(speaker, word),
    [word],
  );

  const handleGenerate = useCallback(() => {
    stopPlayback();
    const picked = pickRandomWord(REFERENCE_WORDS, word || null, Math.random);
    if (!picked) return;
    setWord(picked.word);
    setAnalysis(null);
    setUserRecording(null);
    setError(null);
    resetSelection();
    setScreenState("ready");
  }, [word, resetSelection]);

  const handleClear = useCallback(() => {
    stopPlayback();
    setWord("");
    setAnalysis(null);
    setUserRecording(null);
    setError(null);
    resetSelection();
    setScreenState("empty");
  }, [resetSelection]);

  const handlePlayReference = useCallback(async () => {
    if (!word || isPlayingReference) return;
    setIsPlayingReference(true);
    try {
      await playUrl(referenceUrl(analysis?.speaker ?? REFERENCE_SPEAKERS[0]));
    } catch (playbackError) {
      setError(`Audio referensi tidak dapat diputar: ${message(playbackError)}`);
    } finally {
      setIsPlayingReference(false);
    }
  }, [word, analysis, isPlayingReference, referenceUrl]);

  const handlePlayPhoneme = useCallback(
    async (index: number) => {
      const phoneme = analysis?.phonemes[index];
      if (!analysis || !phoneme) return;
      const startMs = analysis.phonemes
        .slice(0, index)
        .reduce((total, p) => total + p.referenceDurationMs, 0);
      try {
        await playUrl(referenceUrl(analysis.speaker), startMs, startMs + phoneme.referenceDurationMs);
      } catch (playbackError) {
        setError(`Fonem tidak dapat diputar: ${message(playbackError)}`);
      }
    },
    [analysis, referenceUrl],
  );

  const handlePlayRecording = useCallback(async () => {
    if (!analysis || !userRecording || isPlayingRecording) return;
    setIsPlayingRecording(true);
    try {
      const [start, end] = analysis.userBounds;
      await playSamples(userRecording.subarray(start, end), SAMPLE_RATE);
    } catch (playbackError) {
      setError(`Rekaman tidak dapat diputar: ${message(playbackError)}`);
    } finally {
      setIsPlayingRecording(false);
    }
  }, [analysis, userRecording, isPlayingRecording]);

  const analyze = useCallback(
    async (samples: Float32Array) => {
      setScreenState("processing");
      const result = await analysisClient().analyze(word, samples);
      setAnalysis(result);
      setScreenState("result");
    },
    [word, analysisClient],
  );

  const handleRecord = useCallback(async () => {
    if (screenState === "recording") {
      recordingRef.current?.stop();
      return;
    }
    if (!word || screenState === "processing") return;

    stopPlayback();
    setError(null);
    setRecordingPhase("calibrating");
    setScreenState("recording");

    try {
      const recording = await startRecording((state) => setRecordingPhase(state.phase));
      recordingRef.current = recording;
      const captured = await recording.done;
      recordingRef.current = null;
      setRecordingPhase(null);

      if (!captured) {
        setError("Tidak ada suara yang terdeteksi. Coba lagi dan ucapkan kata dengan jelas.");
        setScreenState(analysis ? "result" : "ready");
        return;
      }
      setUserRecording(captured.samples);
      await analyze(captured.samples);
    } catch (recordingError) {
      recordingRef.current = null;
      setRecordingPhase(null);
      setError(`Mikrofon tidak dapat digunakan: ${message(recordingError)}`);
      setScreenState(analysis ? "result" : "ready");
    }
  }, [screenState, word, analysis, analyze]);

  const handleSelectPhoneme = useCallback((index: number) => {
    setSelectedPhonemeIndex(index);
    setIsArticulationOpen(true);
  }, []);

  const selectedPhoneme: PhonemeScore | null =
    analysis && selectedPhonemeIndex !== null ? (analysis.phonemes[selectedPhonemeIndex] ?? null) : null;

  return {
    screenState,
    word,
    hasText: word.length > 0,
    analysis,
    error,
    recordingPhase,
    isPlayingReference,
    isPlayingRecording,
    hasRecording: userRecording !== null,
    selectedPhonemeIndex,
    selectedPhoneme,
    articulationEntry: selectedPhoneme ? (ARTICULATION_ENTRIES[selectedPhoneme.phoneme] ?? null) : null,
    isArticulationOpen,
    handleGenerate,
    handleClear,
    handlePlayReference,
    handlePlayRecording,
    handlePlayPhoneme,
    handleRecord,
    handleSelectPhoneme,
    handleCloseArticulation: () => setIsArticulationOpen(false),
  } as const;
}
