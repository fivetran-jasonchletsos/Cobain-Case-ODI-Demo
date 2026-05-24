/*
 * Chart 4: Per-suspect probability waterfall — Suspect Detail page
 * prior → motive log-LR → means log-LR → opportunity log-LR →
 * corroboration log-LR → contradiction log-LR → posterior
 *
 * Rendered as a vanilla SVG waterfall (no Recharts needed for this shape).
 * The "running total" is shown as the bar bottom; each segment floats.
 */

import type { ScoreResult } from '../data/scoring';
import type { Suspect } from '../data/suspects';

interface Props {
  suspect: Suspect;
  result: ScoreResult;
}

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

// Map feature names to display labels
const FEATURE_LABELS: Record<string, string> = {
  motive:               'Motive',
  means:                'Means',
  opportunity:          'Opportunity',
  corroboration:        'Corroboration',
  timeline:             'Timeline',
  investigator:         'Investigator',
  contradiction:        'Contradiction',
  mention_count:        'Mention ct.',
  corpus_challenges:    'Challenges',
  official_record_support: 'Official rec.',
};

export default function ProbabilityWaterfall({ suspect, result }: Props) {
  const isBaseline = suspect.archetype === 'baseline';
  const accentColor = isBaseline ? '#4a90a4' : 'var(--cassette-dim)';

  // Build waterfall steps: prior + each log-LR contribution + posterior
  // We work in probability space for display clarity, annotating log-LR values
  const prior = result.prior;
  const posterior = result.probability;
  const details = result.feature_lr_detail;

  // For display: convert prior to %, each log-LR to delta-%, posterior to %
  // Running logit accumulation
  function logit(p: number) { return Math.log(p / (1 - p)); }
  function sigmoid(x: number) { return 1 / (1 + Math.exp(-x)); }

  const lp = logit(Math.max(0.001, Math.min(0.999, prior)));

  interface WaterfallStep {
    label: string;
    logLR: number;
    running: number; // probability at end of this step
    delta: number;   // change in probability
  }

  const steps: WaterfallStep[] = [];
  let runningLogit = lp;
  const priorProb = sigmoid(lp);
  steps.push({ label: 'Prior', logLR: 0, running: priorProb, delta: 0 });

  for (const d of details) {
    const prevRunning = sigmoid(runningLogit);
    runningLogit += d.log_LR_contribution;
    const nextRunning = sigmoid(runningLogit);
    const label = FEATURE_LABELS[d.feature] ?? d.feature;
    steps.push({
      label,
      logLR: d.log_LR_contribution,
      running: nextRunning,
      delta: nextRunning - prevRunning,
    });
  }

  // Final bar = posterior
  steps.push({ label: 'Posterior', logLR: 0, running: posterior, delta: 0 });

  // SVG dimensions
  const W = 640;
  const H = 200;
  const PAD_LEFT = 72;
  const PAD_RIGHT = 16;
  const PAD_TOP = 16;
  const PAD_BOTTOM = 48;
  const chartW = W - PAD_LEFT - PAD_RIGHT;
  const chartH = H - PAD_TOP - PAD_BOTTOM;

  const barW = Math.floor(chartW / steps.length) - 3;
  const maxProb = 1.0;
  const yScale = (p: number) => chartH - (p / maxProb) * chartH;

  // Y-axis ticks at 0%, 25%, 50%, 75%, 100%
  const yTicks = [0, 0.25, 0.5, 0.75, 1.0];

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Probability waterfall — log-LR accumulation</div>
      <p className="font-mono text-[11px] mb-3" style={{ color: 'var(--ink-soft)' }}>
        Each bar shows how the probability changes as each feature log-LR is added to logit(prior).
        Positive steps lift probability; negative steps lower it.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: 'block', fontFamily: MONO }}
            role="img"
            aria-label={`Probability waterfall for ${suspect.name}`}
          >
            {/* Y-axis grid lines and labels */}
            {yTicks.map((t) => {
              const y = PAD_TOP + yScale(t);
              return (
                <g key={t}>
                  <line
                    x1={PAD_LEFT}
                    x2={W - PAD_RIGHT}
                    y1={y}
                    y2={y}
                    stroke="var(--smudge-faint)"
                    strokeWidth={0.5}
                    strokeDasharray={t === 0 ? 'none' : '2 2'}
                  />
                  <text
                    x={PAD_LEFT - 4}
                    y={y + 3}
                    textAnchor="end"
                    fontSize={8}
                    fill="var(--ink-soft)"
                  >
                    {Math.round(t * 100)}%
                  </text>
                </g>
              );
            })}

            {/* Bars */}
            {steps.map((step, i) => {
              const x = PAD_LEFT + i * (barW + 3);
              const isPrior = i === 0;
              const isPosterior = i === steps.length - 1;
              const isPositive = step.delta > 0;
              const isZeroChange = step.delta === 0;

              // Bar position: from previous running to current running
              const prevRunning = i === 0 ? 0 : steps[i - 1].running;
              let barTop: number;
              let barHeight: number;

              if (isPrior || isPosterior) {
                // Prior and posterior: full bar from 0 to value
                barTop = PAD_TOP + yScale(step.running);
                barHeight = chartH - yScale(step.running);
              } else {
                // Delta bar — floating
                const fromY = PAD_TOP + yScale(prevRunning);
                const toY = PAD_TOP + yScale(step.running);
                barTop = Math.min(fromY, toY);
                barHeight = Math.abs(fromY - toY) || 2;
              }

              let fillColor: string;
              if (isPrior || isPosterior) {
                fillColor = accentColor;
              } else if (isZeroChange) {
                fillColor = 'var(--smudge)';
              } else if (isPositive) {
                fillColor = 'var(--cassette)';
              } else {
                fillColor = 'var(--rust)';
              }

              const opacity = (isPrior || isPosterior) ? 0.9 : 0.78;

              return (
                <g key={step.label}>
                  {/* Connector line to next bar (thin hairline) */}
                  {!isPosterior && i > 0 && (
                    <line
                      x1={x + barW}
                      x2={x + barW + 3}
                      y1={PAD_TOP + yScale(step.running)}
                      y2={PAD_TOP + yScale(step.running)}
                      stroke="var(--smudge-faint)"
                      strokeWidth={0.5}
                    />
                  )}

                  <rect
                    x={x}
                    y={barTop}
                    width={barW}
                    height={Math.max(barHeight, 2)}
                    fill={fillColor}
                    opacity={opacity}
                    stroke={fillColor}
                    strokeWidth={0.5}
                    rx={1}
                  />

                  {/* Log-LR label above/below */}
                  {!isPrior && !isPosterior && step.logLR !== 0 && (
                    <text
                      x={x + barW / 2}
                      y={isPositive ? barTop - 2 : barTop + barHeight + 9}
                      textAnchor="middle"
                      fontSize={7}
                      fill={isPositive ? 'var(--cassette-dim)' : 'var(--rust)'}
                      fontWeight={600}
                    >
                      {step.logLR >= 0 ? '+' : ''}{step.logLR.toFixed(2)}
                    </text>
                  )}

                  {/* Probability label for prior/posterior */}
                  {(isPrior || isPosterior) && (
                    <text
                      x={x + barW / 2}
                      y={barTop - 3}
                      textAnchor="middle"
                      fontSize={9}
                      fill={accentColor}
                      fontWeight={700}
                    >
                      {Math.round(step.running * 100)}%
                    </text>
                  )}

                  {/* X-axis label */}
                  <text
                    x={x + barW / 2}
                    y={H - PAD_BOTTOM + 12}
                    textAnchor="middle"
                    fontSize={7.5}
                    fill="var(--ink-soft)"
                    transform={`rotate(-35, ${x + barW / 2}, ${H - PAD_BOTTOM + 12})`}
                  >
                    {step.label}
                  </text>
                </g>
              );
            })}

            {/* Baseline at 0 */}
            <line
              x1={PAD_LEFT}
              x2={W - PAD_RIGHT}
              y1={PAD_TOP + chartH}
              y2={PAD_TOP + chartH}
              stroke="var(--smudge)"
              strokeWidth={1}
            />
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-1 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 10, height: 10, background: 'var(--cassette)', opacity: 0.78 }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Positive log-LR (lifts probability)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 10, height: 10, background: 'var(--rust)', opacity: 0.78 }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Negative log-LR (lowers probability)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 10, height: 10, background: accentColor, opacity: 0.9 }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Prior / Posterior</span>
        </div>
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        {isBaseline
          ? "Cobain's posterior is driven down almost entirely by corpus challenges (Burnett & Wilkins 2026, Grant archive). The high prior reflects the official ruling."
          : "Carlson's probability is driven almost entirely by means (shotgun purchase). Love's is driven by corpus volume but penalized by her documented LA alibi."}
      </p>
    </div>
  );
}
