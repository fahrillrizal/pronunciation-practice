import type { ArticulationEntry } from "@/types";

export const ARTICULATION_ENTRIES: Record<string, ArticulationEntry> = {
  TH: {
    phoneme: "TH",
    howTo: "Place the tip of your tongue slightly between the upper and lower front teeth (interdental position). Push air out gently through the gap without vibrating the vocal cords (voiceless dental fricative).",
    commonError: "Indonesian speakers often replace it with a dental /t/ or /s/, because this voiceless dental fricative does not exist in Indonesian phonology.",
  },
  IH: {
    phoneme: "IH",
    howTo: "A lax high front vowel. The mouth is open slightly wider than for /IY/, the tongue is relaxed, and the corners of the lips are not pulled tight.",
    commonError: "Often pronounced too tense and long, like the Indonesian /i/ vowel, which confuses minimal pairs such as \"sheep\" vs \"ship\".",
  },
  NG: {
    phoneme: "NG",
    howTo: "A velar nasal consonant. The back of the tongue presses firmly against the soft palate (velum) and all the airflow is directed through the nasal cavity.",
    commonError: "Often followed by a hard /g/ or /k/ plosive at the end of the syllable (for example sounding like \"thin-g\"), instead of ending softly as a pure nasal hum.",
  },
  K: {
    phoneme: "K",
    howTo: "A voiceless velar plosive. The back of the tongue blocks the airflow at the velum, then releases it suddenly with a light puff of air (aspiration).",
    commonError: "At the end of English words it is often replaced by an unreleased glottal stop (like the \"k\" in Indonesian \"bapak\"), without a clear burst of air.",
  },
  R: {
    phoneme: "R",
    howTo: "A post-alveolar approximant. The tip of the tongue curls back toward the palate without touching it at all, the mouth stays open, and the lips are slightly rounded.",
    commonError: "Rolled or trilled like the Indonesian \"r\", even though the \"r\" in standard English is never trilled.",
  },
  AO: {
    phoneme: "AO",
    howTo: "A long open-mid back rounded vowel. The tongue is pulled back in the mouth, the jaw is moderately open, and the lips form a round circle.",
    commonError: "Often pronounced too short or not rounded enough, resembling the plain short Indonesian /o/ vowel.",
  },
  Z: {
    phoneme: "Z",
    howTo: "A voiced alveolar fricative. The tongue is in the same position as for /s/ (near the upper gum ridge), but the vocal cords vibrate actively.",
    commonError: "The vocal cords often do not vibrate at the end of a word, so it sounds unvoiced like /s/.",
  },
  EY: {
    phoneme: "EY",
    howTo: "A diphthong that glides from the close-mid front vowel /e/ toward the lax high front vowel /ɪ/. The jaw moves from slightly open to more closed.",
    commonError: "Pronounced as a flat single vowel (monophthong) /e/ without the glide toward /ɪ/, typical of Indonesian syllable rhythm.",
  },
  W: {
    phoneme: "W",
    howTo: "A voiced labial-velar approximant. The lips are tightly rounded and the back of the tongue rises toward the velum, then moves toward the next vowel.",
    commonError: "The lips are not rounded fully, or the sound is confused with a labiodental articulation like the /v/ consonant.",
  },
  AH: {
    phoneme: "AH",
    howTo: "A short open-mid back unrounded vowel. The jaw is relaxed and fairly wide open, and the tongue sits in a neutral low central-back position.",
    commonError: "Confused with an overly weak schwa /ə/ or with the Indonesian /a/, which is more open and fronted.",
  },
  T: {
    phoneme: "T",
    howTo: "A voiceless alveolar plosive. The tip of the tongue presses against the upper gum ridge (not the surface of the front teeth), then releases with a short puff of air.",
    commonError: "Pronounced as a heavy dental consonant like the Indonesian \"t\", with the tongue touching the front teeth.",
  },
  Y: {
    phoneme: "Y",
    howTo: "A voiced palatal approximant. The blade of the tongue approaches the hard palate and then glides quickly into the next vowel.",
    commonError: "Pronounced too stiffly or without enough flow as a semivowel glide transition.",
  },
  N: {
    phoneme: "N",
    howTo: "A voiced alveolar nasal consonant. The tip of the tongue blocks the airflow at the upper gum ridge and air passes through the nasal cavity.",
    commonError: "The nasal release at the end of a word is often cut off too quickly, before enough resonance time.",
  },
  M: {
    phoneme: "M",
    howTo: "A voiced bilabial nasal consonant. Both lips are pressed together while the vocal cords vibrate and air exits through the nose.",
    commonError: "The lips are not closed firmly enough, or the nasal duration is made too short.",
  },
  DH: {
    phoneme: "DH",
    howTo: "A voiced dental fricative. The tip of the tongue is between the front teeth, and air is pushed out while the vocal cords vibrate.",
    commonError: "Often replaced with a heavy /d/ plosive, because this voiced dental fricative is unfamiliar to Indonesian speakers.",
  },
  OW: {
    phoneme: "OW",
    howTo: "A diphthong that glides from the open-mid back vowel /o/ toward the high back rounded vowel /ʊ/. The lips become more rounded at the end of the sound.",
    commonError: "Pronounced as a static pure vowel /o/ without the lip-rounding glide at the end of the syllable.",
  },
  L: {
    phoneme: "L",
    howTo: "A voiced alveolar lateral consonant. The tip of the tongue touches the upper gum ridge, and air flows freely along both sides of the tongue.",
    commonError: "In word-final position (dark L), the back of the tongue is often not raised toward the velum, so the sound is too bright or disappears.",
  },
  D: {
    phoneme: "D",
    howTo: "A voiced alveolar plosive. The tip of the tongue blocks the air at the upper gum ridge with vocal cord vibration before releasing.",
    commonError: "Often pronounced as a dental plosive like the Indonesian \"d\", or loses vocal cord vibration at the end of a word.",
  },
};
