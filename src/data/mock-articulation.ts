import type { ArticulationEntry } from "@/types";

/** Pronunciation guide entries indexed by ARPAbet phoneme symbol */
export const MOCK_ARTICULATION_ENTRIES: Record<string, ArticulationEntry> = {
  TH: {
    phoneme: "TH",
    howTo: "Tempatkan ujung lidah sedikit di antara gigi seri atas dan bawah (posisi interdental). Alirkan udara keluar perlahan melalui celah tanpa menggetarkan pita suara (voiceless dental fricative).",
    commonError: "Penutur Indonesia kerap menggantinya dengan bunyi /t/ dental atau /s/ karena fonem geser gigi tak bersuara ini tidak terdapat dalam fonologi bahasa Indonesia.",
  },
  IH: {
    phoneme: "IH",
    howTo: "Vokal depan tinggi kendur (lax vowel). Rongga mulut terbuka sedikit lebih lebar daripada bunyi /IY/, lidah rileks, dan sudut bibir tidak ditarik tegang.",
    commonError: 'Sering diucapkan terlalu tegang dan panjang menyerupai vokal /i/ bahasa Indonesia, sehingga rancu dengan kata pasangan minimal seperti "sheep" vs "ship".',
  },
  NG: {
    phoneme: "NG",
    howTo: "Konsonan sengau velar (dorso-velar nasal). Pangkal belakang lidah menempel rapat pada langit-langit lunak (velum) dan aliran udara sepenuhnya diarahkan melalui rongga hidung.",
    commonError: 'Kerap ditambahi bunyi letupan keras /g/ atau /k/ di akhir suku kata (misalnya terdengar seperti "thin-g"), alih-alih ditutup secara lembut sebagai dengung sengau murni.',
  },
  K: {
    phoneme: "K",
    howTo: "Konsonan letup velar tak bersuara (voiceless velar plosive). Bagian belakang lidah menahan aliran udara di velum, lalu dilepaskan secara tiba-tiba dengan hembusan udara ringan (aspirasi).",
    commonError: 'Di posisi akhir kata bahasa Inggris sering diganti menjadi bunyi hambat glotal mati (seperti huruf "k" pada kata Indonesia "bapak"), tanpa letupan udara yang jelas.',
  },
  R: {
    phoneme: "R",
    howTo: "Konsonan hampiran pasca-alveolar (approximant). Ujung lidah melengkung ke belakang ke arah langit-langit tanpa menyentuhnya sama sekali, rongga mulut terbuka, dan bibir sedikit membulat.",
    commonError: 'Digetarkan (rolled/trilled) seperti bunyi "r" bahasa Indonesia, padahal konsonan "r" dalam bahasa Inggris standar tidak pernah bergetar.',
  },
  AO: {
    phoneme: "AO",
    howTo: "Vokal belakang setengah terbuka bulat panjang (open-mid back rounded vowel). Lidah ditarik ke belakang rongga mulut, rahang terbuka sedang, dan bibir membentuk lingkaran bundar.",
    commonError: "Sering diucapkan terlalu pendek atau kurang bulat menyerupai bunyi vokal /o/ pendek biasa pada bahasa Indonesia.",
  },
  Z: {
    phoneme: "Z",
    howTo: "Konsonan desis alveolar bersuara (voiced alveolar fricative). Posisi lidah sama seperti bunyi /s/ (dekat gusi atas), namun pita suara digetarkan secara aktif.",
    commonError: "Pita suara sering kali tidak digetarkan di akhir kata, sehingga terdengar mati seperti konsonan tak bersuara /s/.",
  },
  EY: {
    phoneme: "EY",
    howTo: "Diftong bergerak dari vokal depan setengah tertutup /e/ meluncur ke arah vokal depan tinggi kendur /ɪ/. Rahang bergerak dari agak terbuka ke lebih tertutup.",
    commonError: "Diucapkan sebagai vokal tunggal datar (monoftong) /e/ tanpa luncuran menuju bunyi /ɪ/, khas intonasi suku kata bahasa Indonesia.",
  },
  W: {
    phoneme: "W",
    howTo: "Konsonan hampiran bibir-velar bersuara (voiced labial-velar approximant). Bibir membulat rapat dan pangkal lidah terangkat ke velum, lalu bergerak menuju vokal berikutnya.",
    commonError: "Bibir kurang membulat sempurna atau tertukar dengan artikulasi labiodental seperti konsonan /v/.",
  },
  AH: {
    phoneme: "AH",
    howTo: "Vokal belakang setengah terbuka tak bulat pendek (open-mid back unrounded vowel). Rahang rileks terbuka agak lebar, lidah berada di posisi netral rendah tengah-belakang.",
    commonError: "Tertukar dengan vokal pepet /ə/ yang terlalu lemah atau vokal /a/ bahasa Indonesia yang lebih terbuka ke depan.",
  },
  T: {
    phoneme: "T",
    howTo: "Konsonan letup alveolar tak bersuara. Ujung lidah menekan gusi atas (bukan permukaan gigi seri), lalu dilepas dengan hembusan udara singkat.",
    commonError: 'Diucapkan sebagai konsonan dental tebal seperti bunyi "t" bahasa Indonesia dengan lidah menempel pada gigi seri.',
  },
  Y: {
    phoneme: "Y",
    howTo: "Konsonan hampiran palatal bersuara (palatal approximant). Daun lidah mendekati langit-langit keras (palatum) lalu meluncur cepat ke vokal berikutnya.",
    commonError: "Diucapkan terlalu kaku atau kurang mengalir sebagai transisi luncur semivokal.",
  },
  N: {
    phoneme: "N",
    howTo: "Konsonan sengau alveolar bersuara. Ujung lidah menutup aliran udara pada gusi atas dan udara dialirkan melalui rongga hidung.",
    commonError: "Pelepasan sengau di akhir kata sering diputus terlalu cepat sebelum waktu resonansi yang cukup.",
  },
  M: {
    phoneme: "M",
    howTo: "Konsonan sengau bilabial bersuara. Kedua bibir terkatup rapat sementara pita suara bergetar dan udara keluar melalui hidung.",
    commonError: "Kedua bibir kurang terkatup rapat atau durasi sengau dibuat terlalu pendek.",
  },
  DH: {
    phoneme: "DH",
    howTo: "Konsonan geser gigi bersuara (voiced dental fricative). Ujung lidah di antara gigi seri, udara dihembuskan sambil menggetarkan pita suara.",
    commonError: "Kerap diganti dengan bunyi letup /d/ tebal karena fonem geser gigi bersuara ini asing bagi penutur bahasa Indonesia.",
  },
  OW: {
    phoneme: "OW",
    howTo: "Diftong meluncur dari vokal belakang setengah terbuka /o/ menuju vokal belakang tinggi bulat /ʊ/. Bibir semakin membulat di akhir bunyi.",
    commonError: "Diucapkan sebagai vokal murni statis /o/ tanpa luncuran pembulatan bibir di akhir suku kata.",
  },
  L: {
    phoneme: "L",
    howTo: "Konsonan lateral alveolar bersuara. Ujung lidah menyentuh gusi atas, udara mengalir bebas di sisi kiri dan kanan lidah.",
    commonError: "Pada posisi akhir kata (dark L), pangkal lidah sering tidak dinaikkan ke velum sehingga bunyi terdengar terlalu terang atau hilang.",
  },
  D: {
    phoneme: "D",
    howTo: 'Konsonan letup alveolar bersuara. Ujung lidah menahan udara di gusi atas dengan getaran pita suara sebelum dilepaskan.',
    commonError: 'Sering diucapkan sebagai letup dental mirip "d" bahasa Indonesia, atau kehilangan getaran pita suara di akhir kata.',
  },
};
