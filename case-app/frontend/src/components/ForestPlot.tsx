/*
 * Chart 5: Forest plot — all 11 suspects with 95% CI
 * Location: SuspectScoringPage (headline chart at top)
 * Height ~440px desktop. Cobain visually distinct (baseline archetype).
 */

import { useMemo } from 'react';
import { SUSPECTS } from '../data/suspects';
import { scoreSuspect, DEFAULT_WEIGHTS } from '../data/scoring';
import type { ScoreResult } from '../data/scoring';

interface Props {
  grounded: boolean;
}

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

export default function ForestPlot({ grounded }: Props) {
  const rows = useMemo(() => {
    return SUSPECTS.map((s) => ({
      suspect: s,
      result: scoreSuspect(s.features, DEFAULT_WEIGHTS, grounded, s.archetype),
    })).sort((a, b) => b.result.probability - a.result.probability);
  }, [grounded]);

  const N = rows.length; // 11

  // SVG layout
  const W = 720;
  const ROW_H = 34;
  const PAD_TOP = 28;
  const PAD_BOTTOM = 36;
  const PAD_LEFT = 148;
  const PAD_RIGHT = 80;
  const H = PAD_TOP + ROW_H * N + PAD_BOTTOM;

  const chartW = W - PAD_LEFT - PAD_RIGHT;

  // X-axis: 0 to 1 (probability)
  function xScale(p: number) {
    return PAD_LEFT + p * chartW;
  }

  const xTicks = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];

  function getColor(r: ScoreResult, archetype: string): string {
    if (archetype === 'baseline') return '#4a90a4';
    if (r.probability > 0.3) return 'var(--rust)';
    if (r.probability > 0.15) return 'var(--cassette-dim)';
    return 'var(--rain)';
  }

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>
        Forest plot — all 11 suspects · 95% confidence intervals · {grounded ? 'Grounded (Fivetran on)' : 'Ungrounded (Fivetran off)'}
      </div>
      <p className="font-mono text-[11px] mb-4" style={{ color: 'var(--ink-soft)' }}>
        Ranked highest to lowest by point estimate. CI width = corpus signal available for each suspect. Cobain shown separately as baseline archetype.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: 'block', fontFamily: MONO }}
            role="img"
            aria-label="Forest plot of all 11 suspects with 95% confidence intervals"
          >
            {/* X-axis grid */}
            {xTicks.map((t) => {
              const x = xScale(t);
              return (
                <g key={t}>
                  <line
                    x1={x}
                    x2={x}
                    y1={PAD_TOP - 8}
                    y2={PAD_TOP + ROW_H * N}
                    stroke={t === 0 ? 'var(--smudge)' : 'var(--smudge-faint)'}
                    strokeWidth={t === 0.5 ? 0.75 : 0.5}
                    strokeDasharray={t === 0 ? 'none' : t === 0.5 ? '3 3' : '2 4'}
                  />
                  <text
                    x={x}
                    y={PAD_TOP + ROW_H * N + 14}
                    textAnchor="middle"
                    fontSize={8}
                    fill="var(--ink-soft)"
                  >
                    {Math.round(t * 100)}%
                  </text>
                </g>
              );
            })}

            {/* X-axis label */}
            <text
              x={PAD_LEFT + chartW / 2}
              y={H - 4}
              textAnchor="middle"
              fontSize={8}
              fill="var(--ink-muted)"
            >
              Posterior probability
            </text>

            {/* Rows */}
            {rows.map(({ suspect, result }, i) => {
              const y = PAD_TOP + i * ROW_H + ROW_H / 2;
              const isBaseline = suspect.archetype === 'baseline';
              const color = getColor(result, suspect.archetype);
              const xPoint = xScale(result.probability);
              const xLo = xScale(result.ci_lower);
              const xHi = xScale(result.ci_upper);
              const pPct = Math.round(result.probability * 100);
              const loPct = Math.round(result.ci_lower * 100);
              const hiPct = Math.round(result.ci_upper * 100);

              return (
                <g key={suspect.id}>
                  {/* Row background — subtle alternate */}
                  {i % 2 === 0 && (
                    <rect
                      x={0}
                      y={PAD_TOP + i * ROW_H}
                      width={W}
                      height={ROW_H}
                      fill="rgba(0,0,0,0.018)"
                    />
                  )}

                  {/* Baseline archetype gets a subtle highlight */}
                  {isBaseline && (
                    <rect
                      x={0}
                      y={PAD_TOP + i * ROW_H}
                      width={W}
                      height={ROW_H}
                      fill="rgba(74,144,164,0.06)"
                    />
                  )}

                  {/* Suspect label */}
                  <text
                    x={PAD_LEFT - 6}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={9.5}
                    fontWeight={isBaseline ? 700 : 400}
                    fill={isBaseline ? '#4a90a4' : 'var(--ink)'}
                  >
                    {suspect.name}
                  </text>

                  {/* CI line */}
                  <line
                    x1={xLo}
                    x2={xHi}
                    y1={y}
                    y2={y}
                    stroke={color}
                    strokeWidth={isBaseline ? 2 : 1.5}
                    strokeOpacity={0.7}
                  />

                  {/* CI caps */}
                  {[xLo, xHi].map((cx, ci) => (
                    <line
                      key={ci}
                      x1={cx}
                      x2={cx}
                      y1={y - 4}
                      y2={y + 4}
                      stroke={color}
                      strokeWidth={1}
                      strokeOpacity={0.7}
                    />
                  ))}

                  {/* Point estimate */}
                  <circle
                    cx={xPoint}
                    cy={y}
                    r={isBaseline ? 5 : 4}
                    fill={color}
                    stroke="var(--card)"
                    strokeWidth={1.5}
                  />

                  {/* Probability label */}
                  <text
                    x={W - PAD_RIGHT + 4}
                    y={y + 4}
                    textAnchor="start"
                    fontSize={8.5}
                    fill={color}
                    fontWeight={600}
                  >
                    {pPct}%
                  </text>

                  {/* CI annotation — shown for selected rows to avoid clutter */}
                  {(isBaseline || i <= 3) && (
                    <text
                      x={W - PAD_RIGHT + 4}
                      y={y + 13}
                      textAnchor="start"
                      fontSize={6.5}
                      fill="var(--ink-soft)"
                    >
                      [{loPct},{hiPct}]
                    </text>
                  )}
                </g>
              );
            })}

            {/* Column header */}
            <text
              x={W - PAD_RIGHT + 4}
              y={PAD_TOP - 6}
              textAnchor="start"
              fontSize={8}
              fill="var(--ink-muted)"
            >
              P(%)
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 mb-3 flex-wrap">
        <div className="flex items-center gap-2">
          <svg width="28" height="10" style={{ overflow: 'visible' }}>
            <line x1="0" y1="5" x2="28" y2="5" stroke="var(--rain)" strokeWidth="1.5" strokeOpacity="0.7" />
            <circle cx="14" cy="5" r="4" fill="var(--rain)" stroke="white" strokeWidth="1.5" />
          </svg>
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Low probability (CI + point)</span>
        </div>
        <div className="flex items-center gap-2">
          <svg width="28" height="10" style={{ overflow: 'visible' }}>
            <line x1="0" y1="5" x2="28" y2="5" stroke="#4a90a4" strokeWidth="2" strokeOpacity="0.7" />
            <circle cx="14" cy="5" r="5" fill="#4a90a4" stroke="white" strokeWidth="1.5" />
          </svg>
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Cobain — baseline archetype (official ruling)</span>
        </div>
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        The 95% confidence interval width = how much the corpus actually has to say about each suspect. Chris Michaelson's CI is wide because corpus signal is near-zero (transparently).
      </p>
    </div>
  );
}
