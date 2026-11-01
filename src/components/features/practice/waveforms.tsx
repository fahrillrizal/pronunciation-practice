import type { Milliseconds, PhonemeResult } from "@/types";

interface WaveformsProps {
  referenceWaveform: number[];
  userWaveform: number[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  phonemes: PhonemeResult[];
  onSelectPhoneme?: (index: number) => void;
}

// ─── SVG Constants ───────────────────────────────────────────────────

const WIDTH = 280;
const HEIGHT = 56;
const CENTER_Y = HEIGHT / 2;
const MAX_AMP = 22;

/**
 * Side-by-side waveform visualization comparing reference and user recordings.
 *
 * Renders mirrored envelope paths with markers for problematic phonemes
 * on the user waveform.
 */
export function Waveforms({
  referenceWaveform,
  userWaveform,
  referenceTotalMs,
  userTotalMs,
  phonemes,
  onSelectPhoneme,
}: WaveformsProps) {
  const refPath = createWaveformPath(referenceWaveform);
  const userPath = createWaveformPath(userWaveform);

  const problematicPhonemes = getProblematicPhonemes(phonemes);
  const userDurationTotal = userTotalMs || 1;

  return (
    <div className="border border-neutral-200 bg-white p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
        BENTUK GELOMBANG SUARA
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Reference waveform */}
        <WaveformCard
          label="Referensi"
          durationMs={referenceTotalMs}
          path={refPath}
        />

        {/* User waveform with markers */}
        <WaveformCard
          label="Ucapanmu"
          durationMs={userTotalMs}
          path={userPath}
        >
          {problematicPhonemes.map((p) => {
            const xPos = (p.midMs / userDurationTotal) * WIDTH;
            const markerColor = p.verdict === "mismatch" ? "#b45309" : "#737373";

            return (
              <g
                key={`marker-${p.index}`}
                className="cursor-pointer"
                onClick={() => onSelectPhoneme?.(p.index)}
              >
                <line
                  x1={xPos} y1="3" x2={xPos} y2={HEIGHT - 3}
                  stroke={markerColor} strokeWidth="1.5" strokeDasharray="2 2"
                />
                <text
                  x={xPos} y="10" textAnchor="middle"
                  className="font-mono text-[9px] fill-amber-950 font-bold"
                >
                  {p.phoneme}
                </text>
              </g>
            );
          })}
        </WaveformCard>
      </div>
    </div>
  );
}

// ─── Sub-components ──────────────────────────────────────────────────

interface WaveformCardProps {
  label: string;
  durationMs: Milliseconds;
  path: string;
  children?: React.ReactNode;
}

function WaveformCard({ label, durationMs, path, children }: WaveformCardProps) {
  return (
    <div className="border border-neutral-200 p-2.5 bg-neutral-50">
      <div className="text-[11px] font-mono text-neutral-500 mb-1.5 flex justify-between">
        <span>{label}</span>
        <span>{durationMs} ms</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-14 select-none">
        <line x1="0" y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="#d4d4d4" strokeWidth="1" />
        <path d={path} fill="#e5e5e5" stroke="#a3a3a3" strokeWidth="1" />
        {children}
      </svg>
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────

/** Builds a mirrored SVG path string from an envelope array */
function createWaveformPath(samples: number[]): string {
  if (!samples || samples.length === 0) return "";
  const n = samples.length;
  const step = WIDTH / (n - 1 || 1);

  let topPath = `M 0 ${CENTER_Y}`;
  for (let i = 0; i < n; i++) {
    const x = i * step;
    const y = CENTER_Y - samples[i] * MAX_AMP;
    topPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  let bottomPath = ` L ${WIDTH} ${CENTER_Y}`;
  for (let i = n - 1; i >= 0; i--) {
    const x = i * step;
    const y = CENTER_Y + samples[i] * MAX_AMP;
    bottomPath += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }

  return `${topPath} ${bottomPath} Z`;
}

interface ProblematicPhoneme extends PhonemeResult {
  midMs: number;
}

/** Finds phonemes with mismatch or low-confidence verdicts and their positions */
function getProblematicPhonemes(phonemes: PhonemeResult[]): ProblematicPhoneme[] {
  let cumulativeUser = 0;

  return phonemes
    .map((p) => {
      const start = cumulativeUser;
      cumulativeUser += p.userDurationMs;
      return {
        ...p,
        midMs: start + p.userDurationMs / 2,
      };
    })
    .filter((p) => p.verdict === "mismatch" || p.verdict === "low-confidence");
}

