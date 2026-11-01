"use client";

import { useCallback, useMemo, useState } from "react";
import type { PhonemeResult, ScreenState, WordAnalysis } from "@/types";
import { MOCK_ARTICULATION_ENTRIES, MOCK_WORD_GROUPS } from "@/data";
import { resolveSentenceAttempt } from "@/lib/sentence-builder";

const DEFAULT_TEXT = "what is your name?";
const DEFAULT_WORD_INDEX = 2;
const DEFAULT_RECORDING_PROGRESS = 0.65;

/**
 * Central state management hook for the phoneme practice feature.
 *
 * Encapsulates all practice session state including text input,
 * recording state, word/phoneme selection, and articulation panel.
 */
export function usePracticeState() {
  // ─── Core State ──────────────────────────────────────────────────
  const [screenState, setScreenState] = useState<ScreenState>("result");
  const [activeAudioTarget, setActiveAudioTarget] = useState<
    "reference" | "system" | null
  >(null);
  const [recordingProgress] = useState(DEFAULT_RECORDING_PROGRESS);

  // ─── Text Input State ────────────────────────────────────────────
  const [textInput, setTextInput] = useState(DEFAULT_TEXT);
  const [selectedWordIndex, setSelectedWordIndex] = useState(DEFAULT_WORD_INDEX);

  // ─── Recording State ─────────────────────────────────────────────
  const [isRerecording, setIsRerecording] = useState(false);
  const [isImproved, setIsImproved] = useState(false);

  // ─── Articulation Panel State ────────────────────────────────────
  const [selectedPhonemeIndex, setSelectedPhonemeIndex] = useState<
    number | null
  >(null);
  const [isArticulationOpen, setIsArticulationOpen] = useState(false);

  // ─── Derived Data ────────────────────────────────────────────────
  const hasText = textInput.trim().length > 0;
  const normalizedText = textInput.trim().toLowerCase();

  const currentSentenceAttempt = useMemo(
    () => resolveSentenceAttempt(textInput, isImproved),
    [textInput, isImproved],
  );

  const allWordsAnnotated = useMemo(
    () =>
      hasText &&
      currentSentenceAttempt.words.length > 0 &&
      currentSentenceAttempt.words.every((w) => w.kind === "annotated"),
    [hasText, currentSentenceAttempt.words],
  );

  const safeWordIndex = Math.min(
    Math.max(0, selectedWordIndex),
    Math.max(0, currentSentenceAttempt.words.length - 1),
  );

  const selectedWord: WordAnalysis | undefined =
    currentSentenceAttempt.words[safeWordIndex];

  const selectedPhonemeResult: PhonemeResult | null =
    selectedWord &&
    selectedPhonemeIndex !== null &&
    selectedWord.phonemes[selectedPhonemeIndex]
      ? selectedWord.phonemes[selectedPhonemeIndex]
      : null;

  const articulationEntry = selectedPhonemeResult
    ? (MOCK_ARTICULATION_ENTRIES[selectedPhonemeResult.phoneme] ?? null)
    : null;

  // ─── Action Handlers ─────────────────────────────────────────────
  const resetPhonemeSelection = useCallback(() => {
    setSelectedPhonemeIndex(null);
    setIsArticulationOpen(false);
  }, []);

  const resetRecordingState = useCallback(() => {
    setIsImproved(false);
    setIsRerecording(false);
  }, []);

  const handleSelectPhrase = useCallback(
    (phrase: string) => {
      setTextInput(phrase);
      setSelectedWordIndex(phrase === DEFAULT_TEXT ? DEFAULT_WORD_INDEX : 0);
      resetPhonemeSelection();
      resetRecordingState();
      setScreenState("result");
    },
    [resetPhonemeSelection, resetRecordingState],
  );

  const handleRandomPhrase = useCallback(() => {
    const allPhrases = MOCK_WORD_GROUPS.flatMap((g) => g.words);
    const currentIndex = allPhrases.indexOf(textInput.toLowerCase());
    const nextIndex = (currentIndex + 1) % allPhrases.length;
    handleSelectPhrase(allPhrases[nextIndex] ?? allPhrases[0]);
  }, [textInput, handleSelectPhrase]);

  const handleClearText = useCallback(() => {
    setTextInput("");
    setSelectedWordIndex(0);
    resetPhonemeSelection();
    resetRecordingState();
    setScreenState("empty");
  }, [resetPhonemeSelection, resetRecordingState]);

  const handlePlayReference = useCallback(() => {
    setActiveAudioTarget("reference");
    setScreenState("playing");
  }, []);

  const handleSpeak = useCallback(() => {
    setActiveAudioTarget("system");
    setScreenState("playing");
  }, []);

  const handleRecord = useCallback(() => {
    if (screenState === "recording") {
      if (isRerecording && normalizedText === DEFAULT_TEXT) {
        setIsImproved(true);
      }
      setIsRerecording(false);
      resetPhonemeSelection();
      setScreenState("result");
    } else {
      setIsRerecording(screenState === "result");
      setScreenState("recording");
    }
  }, [screenState, isRerecording, normalizedText, resetPhonemeSelection]);

  const handleSelectWord = useCallback(
    (index: number) => {
      setSelectedWordIndex(index);
      resetPhonemeSelection();
    },
    [resetPhonemeSelection],
  );

  const handleSelectPhoneme = useCallback((index: number) => {
    setSelectedPhonemeIndex(index);
    setIsArticulationOpen(true);
  }, []);

  const handleCloseArticulation = useCallback(() => {
    setIsArticulationOpen(false);
  }, []);

  return {
    // State
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

    // Actions
    handleSelectPhrase,
    handleRandomPhrase,
    handleClearText,
    handlePlayReference,
    handleSpeak,
    handleRecord,
    handleSelectWord,
    handleSelectPhoneme,
    handleCloseArticulation,
  } as const;
}
