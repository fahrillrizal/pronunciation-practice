import type { WordGroup } from "@/types";

/** Curated word/phrase groups for practice */
export const MOCK_WORD_GROUPS: WordGroup[] = [
  {
    id: "group-conversation",
    label: "Pertanyaan umum",
    hint: "Kalimat tanya percakapan sehari-hari",
    words: ["what is your name?", "where do you live?", "how are you?"],
  },
  {
    id: "group-th",
    label: "Bunyi /θ/ dan /ð/",
    hint: "Posisi lidah di antara gigi atas dan bawah tanpa getaran berlebih",
    words: ["think", "three", "this", "mother", "bath"],
  },
  {
    id: "group-mixed",
    label: "Kalimat uji campuran",
    hint: "Kombinasi kata referensi dan kata sintetis",
    words: ["the refrigerator is cold", "street", "school"],
  },
];
