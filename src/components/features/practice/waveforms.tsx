import type { Milliseconds, PhonemeScore, TimeSpan } from "@/types";

interface WaveformsProps {
  referenceWaveform: number[];
  userWaveform: number[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  phonemes: PhonemeScore[];
  userSpans: TimeSpan[];
  onSelectPhoneme: (index: number) => void;
}

const WIDTH = 280;
const HEIGHT = 56;
const CENTER_Y = HEIGHT / 2;
const MAX_AMP = 22;

interface Marker {
  index: number;
  phoneme: string;
  midMs: Milliseconds;
  verdict: PhonemeScore["verdict"];
}

function markers(phonemes: readonly PhonemeScore[], spans: readonly TimeSpan[]): Marker[] {
  return phonemes
    .flatMap((phoneme, index) => {
      const span = spans[index];
      if (phoneme.verdict === "ok" || !span) return [];
      return [{ index, phoneme: phoneme.phoneme, midMs: (span.startMs + span.endMs) / 2, verdict: phoneme.verdict }];
    })
    .filter((marker) => marker.midMs > 0);
}

export function Waveforms({
  referenceWaveform,
  userWaveform,
  referenceTotalMs,
  userTotalMs,
  phonemes,
  userSpans,
  onSelectPhoneme,
}: WaveformsProps) {
  return (
    <div className="border border-neutral-200 bg-white p-5 space-y-3">
      <div className="text-xs uppercase tracking-wider font-semibold text-neutral-900 border-b border-neutral-100 pb-2">
        Bentuk Gelombang Suara
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <WaveformCard label="Referensi" durationMs={referenceTotalMs} path={createWaveformPath(referenceWaveform)} />

        <WaveformCard label="Ucapanmu" durationMs={userTotalMs} path={createWaveformPath(userWaveform)}>
          {markers(phonemes, userSpans).map((marker) => {
            const x = (marker.midMs / Math.max(userTotalMs, 1)) * WIDTH;
            const color = marker.verdict === "mismatch" ? "#b91c1c" : "#737373";
            return (
              <g
                key={`marker-${marker.index}`}
                role="button"
                tabIndex={0}
                aria-label={`Fonem ${marker.phoneme}`}
                className="cursor-pointer focus:outline-none"
                onClick={() => onSelectPhoneme(marker.index)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelectPhoneme(marker.index);
                  }
                }}
              >
                <line
                  x1={x}
                  y1="3"
                  x2={x}
                  y2={HEIGHT - 3}
                  stroke={color}
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
                <text x={x} y="10" textAnchor="middle" className="font-mono text-[9px] fill-red-900 font-bold">
                  {marker.phoneme}
                </text>
              </g>
            );
          })}
        </WaveformCard>
      </div>
    </div>
  );
}

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
        <span>{Math.round(durationMs)} ms</span>
      </div>
      <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-14 select-none">
        <line x1="0" y1={CENTER_Y} x2={WIDTH} y2={CENTER_Y} stroke="#d4d4d4" strokeWidth="1" />
        <path d={path} fill="#e5e5e5" stroke="#a3a3a3" strokeWidth="1" />
        {children}
      </svg>
    </div>
  );
}

function createWaveformPath(samples: readonly number[]): string {
  if (samples.length === 0) return "";
  const step = WIDTH / Math.max(1, samples.length - 1);

  const top = samples.reduce(
    (path, sample, i) => `${path} L ${(i * step).toFixed(1)} ${(CENTER_Y - sample * MAX_AMP).toFixed(1)}`,
    `M 0 ${CENTER_Y}`,
  );
  const bottom = samples.reduceRight(
    (path, sample, i) => `${path} L ${(i * step).toFixed(1)} ${(CENTER_Y + sample * MAX_AMP).toFixed(1)}`,
    ` L ${WIDTH} ${CENTER_Y}`,
  );
  return `${top} ${bottom} Z`;
}
