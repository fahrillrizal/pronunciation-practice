import type { Milliseconds, PhonemeScore, TimeSpan } from "@/types";
import { getWordResult } from "@/lib/word-result";
import { ResultBadge } from "@/components/ui";

interface DurationComparisonProps {
  phonemes: PhonemeScore[];
  userSpans: TimeSpan[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  callouts: string[];
  selectedPhonemeIndex: number | null;
  onSelectPhoneme: (index: number) => void;
}

const SVG_WIDTH = 660;
const SVG_HEIGHT = 175;
const START_X = 96;
const PLOT_WIDTH = SVG_WIDTH - START_X - 20;
const TOP_BAR_Y = 28;
const BOTTOM_BAR_Y = 98;
const BAR_HEIGHT = 32;

interface Bar extends TimeSpan {
  phoneme: string;
  index: number;
}

function referenceBars(phonemes: readonly PhonemeScore[]): Bar[] {
  return phonemes.reduce<Bar[]>((bars, phoneme) => {
    const startMs = bars.at(-1)?.endMs ?? 0;
    bars.push({ ...phoneme, startMs, endMs: startMs + phoneme.referenceDurationMs });
    return bars;
  }, []);
}

function userBars(phonemes: readonly PhonemeScore[], spans: readonly TimeSpan[]): Bar[] {
  return phonemes.map((phoneme, index) => ({
    ...phoneme,
    ...(spans[index] ?? { startMs: 0, endMs: 0 }),
  }));
}

function activate(handler: () => void) {
  return (event: React.KeyboardEvent) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handler();
    }
  };
}

export function DurationComparison({
  phonemes,
  userSpans,
  referenceTotalMs,
  userTotalMs,
  callouts,
  selectedPhonemeIndex,
  onSelectPhoneme,
}: DurationComparisonProps) {
  const maxDurationMs = Math.max(referenceTotalMs, userTotalMs, 1);
  const reference = referenceBars(phonemes);
  const user = userBars(phonemes, userSpans);
  const x = (ms: Milliseconds) => START_X + (ms / maxDurationMs) * PLOT_WIDTH;
  const width = (span: TimeSpan) => Math.max(1, ((span.endMs - span.startMs) / maxDurationMs) * PLOT_WIDTH);

  return (
    <div className="border border-neutral-200 bg-white p-5 sm:p-6 space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2 border-b border-neutral-100 pb-3">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-900">
          Phoneme Duration &amp; Accuracy Analysis
          <ResultBadge result={getWordResult(phonemes)} />
        </h3>
        <span className="text-xs text-neutral-600 font-mono">
          Reference {Math.round(referenceTotalMs)} ms · Your speech {Math.round(userTotalMs)} ms
        </span>
      </div>

      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[560px] h-auto select-none font-sans"
          role="group"
          aria-label="Comparison of reference and spoken phoneme durations"
        >
          <text x="12" y={TOP_BAR_Y + 20} className="text-[12px] font-medium fill-neutral-700">
            Reference
          </text>
          <text x="12" y={BOTTOM_BAR_Y + 20} className="text-[12px] font-medium fill-neutral-700">
            Your speech
          </text>

          {reference.map((bar) => {
            const userBar = user[bar.index] ?? bar;
            return (
              <g key={`connector-${bar.index}`}>
                {bar.index === 0 && (
                  <line
                    x1={x(bar.startMs)}
                    y1={TOP_BAR_Y + BAR_HEIGHT}
                    x2={x(userBar.startMs)}
                    y2={BOTTOM_BAR_Y}
                    stroke="#a3a3a3"
                    strokeDasharray="3 3"
                    strokeWidth="1"
                  />
                )}
                <line
                  x1={x(bar.endMs)}
                  y1={TOP_BAR_Y + BAR_HEIGHT}
                  x2={x(userBar.endMs)}
                  y2={BOTTOM_BAR_Y}
                  stroke="#a3a3a3"
                  strokeDasharray="3 3"
                  strokeWidth="1"
                />
              </g>
            );
          })}

          {reference.map((bar) => (
            <PhonemeBar
              key={`reference-${bar.index}`}
              bar={bar}
              x={x(bar.startMs)}
              width={width(bar)}
              y={TOP_BAR_Y}
              labelAbove
              selected={selectedPhonemeIndex === bar.index}
              onSelect={() => onSelectPhoneme(bar.index)}
            />
          ))}

          {user.map((bar) => (
            <PhonemeBar
              key={`user-${bar.index}`}
              bar={bar}
              x={x(bar.startMs)}
              width={width(bar)}
              y={BOTTOM_BAR_Y}
              verdict={phonemes[bar.index].verdict}
              selected={selectedPhonemeIndex === bar.index}
              onSelect={() => onSelectPhoneme(bar.index)}
            />
          ))}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 text-[11px] text-neutral-600">
        <Legend swatch="border border-neutral-400 bg-neutral-50" label="Correct" />
        <Legend swatch="border border-red-700 bg-red-100" label="Needs practice" />
        <Legend swatch="border border-dashed border-neutral-500 bg-neutral-100" label="Low confidence" />
      </div>

      {callouts.length > 0 && (
        <div className="pt-3 border-t border-neutral-100">
          <ul className="space-y-1">
            {callouts.map((callout, index) => (
              <li
                key={`${index}-${callout}`}
                className="text-xs sm:text-sm text-neutral-800 leading-relaxed pl-3 border-l-2 border-neutral-300"
              >
                {callout}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

interface PhonemeBarProps {
  bar: Bar;
  x: number;
  width: number;
  y: number;
  verdict?: PhonemeScore["verdict"];
  labelAbove?: boolean;
  selected: boolean;
  onSelect: () => void;
}

function PhonemeBar({ bar, x, width, y, verdict = "ok", labelAbove = false, selected, onSelect }: PhonemeBarProps) {
  const style = verdictStyle(verdict, selected);
  const labelY = labelAbove ? y - 10 : y + BAR_HEIGHT + 18;
  const narrow = width < 30;

  return (
    <g
      role="button"
      tabIndex={0}
      aria-label={`Phoneme ${bar.phoneme}`}
      className="cursor-pointer focus:outline-none"
      onClick={onSelect}
      onKeyDown={activate(onSelect)}
    >
      <rect
        x={x}
        y={y}
        width={width}
        height={BAR_HEIGHT}
        fill={style.fill}
        stroke={style.stroke}
        strokeWidth={selected ? 2 : 1}
        strokeDasharray={style.dash}
      />
      <text
        x={x + width / 2}
        y={narrow ? labelY : y + 20}
        textAnchor="middle"
        className={`font-mono text-[12px] ${style.text} ${narrow ? "font-medium" : "pointer-events-none"}`}
      >
        {bar.phoneme}
      </text>
      {narrow && (
        <line
          x1={x + width / 2}
          y1={labelAbove ? y - 2 : y + BAR_HEIGHT + 2}
          x2={x + width / 2}
          y2={labelAbove ? y - 8 : y + BAR_HEIGHT + 8}
          stroke="#737373"
          strokeWidth="1"
        />
      )}
    </g>
  );
}

function Legend({ swatch, label }: { swatch: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`inline-block w-3 h-3 ${swatch}`} />
      {label}
    </span>
  );
}

function verdictStyle(verdict: PhonemeScore["verdict"], selected: boolean) {
  if (verdict === "mismatch") {
    return { fill: "#fee2e2", stroke: "#b91c1c", dash: undefined, text: "fill-red-900 font-semibold" };
  }
  if (verdict === "low-confidence") {
    return { fill: "#f5f5f5", stroke: "#737373", dash: "2 2", text: "fill-neutral-700" };
  }
  return {
    fill: selected ? "#e5e5e5" : "#fafafa",
    stroke: selected ? "#171717" : "#a3a3a3",
    dash: undefined,
    text: "fill-neutral-800",
  };
}
