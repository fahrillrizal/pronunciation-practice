/** Pronunciation guide entry for a specific phoneme */
export interface ArticulationEntry {
  phoneme: string;
  howTo: string;
  commonError: string;
}

/** A group of curated practice words/phrases */
export interface WordGroup {
  id: string;
  label: string;
  hint: string;
  words: string[];
}
