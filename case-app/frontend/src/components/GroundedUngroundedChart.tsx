/*
 * Chart 6: Grounded vs Ungrounded paired comparison
 * Location: SuspectScoringPage (near the toggle)
 * Grouped bar: grounded probability + CI vs ungrounded probability + CI, per suspect
 */

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ErrorBar,
} from 'recharts';
import { SUSPECTS } from '../data/suspects';
import { scoreSuspect, DEFAULT_WEIGHTS } from '../data/scoring';

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

export default function GroundedUngroundedChart() {
  const data = useMemo(() => {
    return SUSPECTS
      .filter((s) => s.archetype !== 'baseline') // Cobain baseline excluded — different scale
      .sort((a, b) => {
        const rA = scoreSuspect(a.features, DEFAULT_WEIGHTS, true, a.archetype);
        const rB = scoreSuspect(b.features, DEFAULT_WEIGHTS, true, b.archetype);
        return rB.probability - rA.probability;
      })
      .map((s) => {
        const grounded = scoreSuspect(s.features, DEFAULT_WEIGHTS, true, s.archetype);
        const ungrounded = scoreSuspect(s.features, DEFAULT_WEIGHTS, false, s.archetype);

        return {
          name: s.name.split(' ')[0], // first name only for axis brevity
          fullName: s.name,
          grounded: Math.round(grounded.probability * 100),
          groundedError: [
            Math.round(grounded.probability * 100) - Math.round(grounded.ci_lower * 100),
            Math.round(grounded.ci_upper * 100) - Math.round(grounded.probability * 100),
          ],
          ungrounded: Math.round(ungrounded.probability * 100),
          ungroundedError: [
            Math.round(ungrounded.probability * 100) - Math.round(ungrounded.ci_lower * 100),
            Math.round(ungrounded.ci_upper * 100) - Math.round(ungrounded.probability * 100),
          ],
        };
      });
  }, []);

  function CustomTooltip({ active, payload, label }: {
    active?: boolean;
    payload?: Array<{ name: string; value: number; color: string }>;
    label?: string;
  }) {
    if (!active || !payload?.length) return null;
    return (
      <div
        style={{
          background: 'var(--card)',
          border: '1px solid var(--smudge-faint)',
          padding: '8px 12px',
          fontFamily: MONO,
          fontSize: 11,
          color: 'var(--ink)',
          boxShadow: '2px 2px 0 var(--smudge-faint)',
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
        {payload.map((p) => (
          <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, marginBottom: 2 }}>
            <span style={{ color: 'var(--ink-soft)' }}>{p.name}</span>
            <span style={{ color: p.color, fontWeight: 600 }}>{p.value}%</span>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Grounded vs Ungrounded — probability comparison</div>
      <p className="font-mono text-[11px] mb-4" style={{ color: 'var(--ink-soft)' }}>
        Left bar = Fivetran on (grounded, corpus-derived score). Right bar = Fivetran off (ungrounded, flat prior ~25%).
        Error bars show 95% CI. Cobain baseline excluded (different scale).
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 560 }}>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 20, right: 16, left: 0, bottom: 8 }}
              barGap={2}
              barCategoryGap="25%"
            >
              <XAxis
                dataKey="fullName"
                tick={{ fontFamily: MONO, fontSize: 8.5, fill: 'var(--ink-soft)' }}
                axisLine={{ stroke: 'var(--smudge-faint)' }}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={52}
              />
              <YAxis
                tick={{ fontFamily: MONO, fontSize: 9, fill: 'var(--ink-soft)' }}
                axisLine={false}
                tickLine={false}
                width={32}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 100]}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />

              <Bar
                dataKey="grounded"
                name="Grounded (Fivetran on)"
                fill="var(--cassette)"
                opacity={0.85}
                stroke="var(--cassette-dim)"
                strokeWidth={0.5}
                radius={[1, 1, 0, 0]}
                maxBarSize={22}
              >
                <ErrorBar
                  dataKey="groundedError"
                  width={4}
                  strokeWidth={1.5}
                  stroke="var(--cassette-dim)"
                  direction="y"
                />
              </Bar>

              <Bar
                dataKey="ungrounded"
                name="Ungrounded (Fivetran off)"
                fill="var(--smudge)"
                opacity={0.7}
                stroke="var(--smudge)"
                strokeWidth={0.5}
                radius={[1, 1, 0, 0]}
                maxBarSize={22}
              >
                <ErrorBar
                  dataKey="ungroundedError"
                  width={4}
                  strokeWidth={1.5}
                  stroke="var(--ink-muted)"
                  direction="y"
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--cassette)', opacity: 0.85, border: '0.5px solid var(--cassette-dim)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Grounded (Fivetran on)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--smudge)', opacity: 0.7, border: '0.5px solid var(--smudge)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Ungrounded (Fivetran off)</span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'var(--ink-muted)' }}>Error bars = 95% CI</span>
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        Turn Fivetran off and the scoring collapses to flat priors with wide CIs. The probabilities don't move because there's no grounded evidence to move them.
      </p>
    </div>
  );
}
