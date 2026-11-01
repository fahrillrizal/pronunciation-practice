import type { Milliseconds, PhonemeResult, PhonemeSegment } from "@/types";
import { getWordResult } from "@/lib/word-result";
import { ResultBadge } from "@/components/ui";

interface DurationComparisonProps {
  reference: PhonemeSegment[];
  phonemes: PhonemeResult[];
  referenceTotalMs: Milliseconds;
  userTotalMs: Milliseconds;
  callouts: string[];
  selectedPhonemeIndex: number | null;
  onSelectPhoneme: (index: number) => void;
}

// ─── SVG Layout Constants ────────────────────────────────────────────

const SVG_WIDTH = 660;
const SVG_HEIGHT = 175;
const START_X = 96;
const PLOT_WIDTH = SVG_WIDTH - START_X - 20;
const TOP_BAR_Y = 28;
const BOTTOM_BAR_Y = 98;
const BAR_HEIGHT = 32;

/**
 * Dual-bar timeline comparing reference vs user phoneme durations.
 *
 * Renders an inline SVG with:
 * - Top bar: reference phoneme segments
 * - Bottom bar: user phoneme segments (color-coded by verdict)
 * - Dashed connectors between corresponding segment boundaries
 * - Callout feedback below the chart
 */
export function DurationComparison({
  reference,
  phonemes,
  referenceTotalMs,
  userTotalMs,
  callouts,
  selectedPhonemeIndex,
  onSelectPhoneme,
}: DurationComparisonProps) {
  const maxDurationMs = Math.max(referenceTotalMs, userTotalMs, 1);

  // Build user segments with cumulative timing
  let userCumulative = 0;
  const userSegments = phonemes.map((p) => {
    const startMs = userCumulative;
    const endMs = userCumulative + p.userDurationMs;
    userCumulative = endMs;
    return { ...p, startMs, endMs };
  });

  return (
    <div className="border border-neutral-200 bg-white p-5 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex items-baseline justify-between flex-wrap gap-2 border-b border-neutral-100 pb-3">
        <h3 className="flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-neutral-900">
          ANALISIS DURASI &amp; KESESUAIAN FONEM
          <ResultBadge result={getWordResult(phonemes)} />
        </h3>
        <span className="text-xs text-neutral-600 font-mono">
          Total ref: {referenceTotalMs}ms | Ucapan: {userTotalMs}ms
        </span>
      </div>

      {/* SVG Timeline */}
      <div className="w-full overflow-x-auto pb-1">
        <svg
          viewBox={`0 0 ${SVG_WIDTH} ${SVG_HEIGHT}`}
          className="w-full min-w-[560px] h-auto select-none font-sans"
        >
          {/* Row labels */}
          <text x="12" y={TOP_BAR_Y + 20} className="text-[12px] font-medium fill-neutral-700">
            Referensi
          </text>
          <text x="12" y={BOTTOM_BAR_Y + 20} className="text-[12px] font-medium fill-neutral-700">
            Ucapanmu
          </text>

          {/* Connectors */}
          {reference.map((refSeg, idx) => {
            const userSeg = userSegments[idx];
            if (!userSeg) return null;

            const xRefStart = START_X + (refSeg.startMs / maxDurationMs) * PLOT_WIDTH;
            const xUserStart = START_X + (userSeg.startMs / maxDurationMs) * PLOT_WIDTH;
            const xRefEnd = START_X + (refSeg.endMs / maxDurationMs) * PLOT_WIDTH;
            const xUserEnd = START_X + (userSeg.endMs / maxDurationMs) * PLOT_WIDTH;

            return (
              <g key={`conn-${idx}`}>
                {idx === 0 && (
                  <line
                    x1={xRefStart} y1={TOP_BAR_Y + BAR_HEIGHT}
                    x2={xUserStart} y2={BOTTOM_BAR_Y}
                    stroke="#a3a3a3" strokeDasharray="3 3" strokeWidth="1"
                  />
                )}
                <line
                  x1={xRefEnd} y1={TOP_BAR_Y + BAR_HEIGHT}
                  x2={xUserEnd} y2={BOTTOM_BAR_Y}
                  stroke="#a3a3a3" strokeDasharray="3 3" strokeWidth="1"
                />
              </g>
            );
          })}

          {/* Reference bar segments */}
          {reference.map((seg, idx) => {
            const segDuration = seg.endMs - seg.startMs;
            const x = START_X + (seg.startMs / maxDurationMs) * PLOT_WIDTH;
            const width = Math.max(1, (segDuration / maxDurationMs) * PLOT_WIDTH);
            const isNarrow = width < 30;
            const isSelected = selectedPhonemeIndex === idx;

            return (
              <g key={`ref-${idx}`} className="cursor-pointer" onClick={() => onSelectPhoneme(idx)}>
                <rect
                  x={x} y={TOP_BAR_Y} width={width} height={BAR_HEIGHT}
                  fill={isSelected ? "#e5e5e5" : "#f5f5f5"}
                  stroke={isSelected ? "#171717" : "#a3a3a3"}
                  strokeWidth={isSelected ? 1.5 : 1}
                />
                {isNarrow ? (
                  <g>
                    <line
                      x1={x + width / 2} y1={TOP_BAR_Y - 2}
                      x2={x + width / 2} y2={TOP_BAR_Y - 8}
                      stroke="#737373" strokeWidth="1"
                    />
                    <text
                      x={x + width / 2} y={TOP_BAR_Y - 10}
                      textAnchor="middle"
                      className="font-mono text-[11px] font-medium fill-neutral-800"
                    >
                      {seg.phoneme}
                    </text>
                  </g>
                ) : (
                  <text
                    x={x + width / 2} y={TOP_BAR_Y + 20}
                    textAnchor="middle"
                    className="font-mono text-[12px] font-medium fill-neutral-800 pointer-events-none"
                  >
                    {seg.phoneme}
                  </text>
                )}
              </g>
            );
          })}

          {/* User bar segments */}
          {userSegments.map((seg) => {
            const x = START_X + (seg.startMs / maxDurationMs) * PLOT_WIDTH;
            const width = Math.max(1, (seg.userDurationMs / maxDurationMs) * PLOT_WIDTH);
            const isNarrow = width < 30;
            const isSelected = selectedPhonemeIndex === seg.index;

            const style = getVerdictStyle(seg.verdict, isSelected);

            return (
              <g key={`user-${seg.index}`} className="cursor-pointer" onClick={() => onSelectPhoneme(seg.index)}>
                <rect
                  x={x} y={BOTTOM_BAR_Y} width={width} height={BAR_HEIGHT}
                  fill={style.fill} stroke={style.stroke}
                  strokeWidth={isSelected ? 2 : 1}
                  strokeDasharray={style.dash}
                />
                {isNarrow ? (
                  <g>
                    <line
                      x1={x + width / 2} y1={BOTTOM_BAR_Y + BAR_HEIGHT + 2}
                      x2={x + width / 2} y2={BOTTOM_BAR_Y + BAR_HEIGHT + 8}
                      stroke="#737373" strokeWidth="1"
                    />
                    <text
                      x={x + width / 2} y={BOTTOM_BAR_Y + BAR_HEIGHT + 18}
                      textAnchor="middle"
                      className={`font-mono text-[11px] ${style.textClass}`}
                    >
                      {seg.phoneme}
                    </text>
                  </g>
                ) : (
                  <text
                    x={x + width / 2} y={BOTTOM_BAR_Y + 20}
                    textAnchor="middle"
                    className={`font-mono text-[12px] pointer-events-none ${style.textClass}`}
                  >
                    {seg.phoneme}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Callouts */}
      {callouts.length > 0 && (
        <div className="pt-3 border-t border-neutral-100 space-y-1.5">
          <ul className="space-y-1">
            {callouts.map((callout, index) => (
              <li
                key={index}
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

// ─── Helpers ─────────────────────────────────────────────────────────

interface VerdictStyle {
  fill: string;
  stroke: string;
  dash: string | undefined;
  textClass: string;
}

function getVerdictStyle(
  verdict: string,
  isSelected: boolean,
): VerdictStyle {
  if (verdict === "mismatch") {
    return {
      fill: "#fef3c7",
      stroke: "#b45309",
      dash: undefined,
      textClass: "fill-amber-950 font-semibold",
    };
  }

  if (verdict === "low-confidence") {
    return {
      fill: "#f5f5f5",
      stroke: "#737373",
      dash: "2 2",
      textClass: "fill-neutral-700",
    };
  }

  return {
    fill: isSelected ? "#e5e5e5" : "#f5f5f5",
    stroke: isSelected ? "#171717" : "#a3a3a3",
    dash: undefined,
    textClass: "fill-neutral-800",
  };
}

