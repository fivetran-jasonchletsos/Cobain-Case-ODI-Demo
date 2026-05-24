/*
 * Chart 2: Claim density timeline, April 1-10, 1994 — annotated area chart
 * Location: CaseFrontPage
 * 12-hour buckets, annotated key events
 */

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';

// 12-hour buckets: Apr 1 AM/PM through Apr 10 AM/PM
// Claim counts reflect corpus density per window (illustrative model-derived values)
const DATA = [
  { bucket: 'Apr 1 AM',  claims: 18,  label: '' },
  { bucket: 'Apr 1 PM',  claims: 22,  label: '' },
  { bucket: 'Apr 2 AM',  claims: 31,  label: '' },
  { bucket: 'Apr 2 PM',  claims: 28,  label: '' },
  { bucket: 'Apr 3 AM',  claims: 24,  label: '' },
  { bucket: 'Apr 3 PM',  claims: 29,  label: '' },
  { bucket: 'Apr 4 AM',  claims: 35,  label: '' },
  { bucket: 'Apr 4 PM',  claims: 40,  label: '' },
  { bucket: 'Apr 5 AM',  claims: 112, label: 'Est. TOD' },
  { bucket: 'Apr 5 PM',  claims: 98,  label: '' },
  { bucket: 'Apr 6 AM',  claims: 87,  label: '' },
  { bucket: 'Apr 6 PM',  claims: 74,  label: '"Check the greenhouse"' },
  { bucket: 'Apr 7 AM',  claims: 62,  label: '' },
  { bucket: 'Apr 7 PM',  claims: 58,  label: '' },
  { bucket: 'Apr 8 AM',  claims: 143, label: 'Body discovered' },
  { bucket: 'Apr 8 PM',  claims: 121, label: '' },
  { bucket: 'Apr 9 AM',  claims: 95,  label: '' },
  { bucket: 'Apr 9 PM',  claims: 88,  label: '' },
  { bucket: 'Apr 10 AM', claims: 76,  label: '' },
  { bucket: 'Apr 10 PM', claims: 69,  label: '' },
];

const ANNOTATIONS = [
  { bucket: 'Apr 1 AM', label: 'Shotgun purchase Mar 30', short: 'Gun purchased', yOffset: -20 },
  { bucket: 'Apr 2 AM', label: 'Leaves rehab', short: 'Leaves rehab', yOffset: -28 },
  { bucket: 'Apr 5 AM', label: 'Est. TOD', short: 'Est. TOD', yOffset: -20 },
  { bucket: 'Apr 6 PM', label: '"Check the greenhouse"', short: 'Greenhouse call', yOffset: -20 },
  { bucket: 'Apr 8 AM', label: 'Body discovered', short: 'Body found', yOffset: -20 },
];

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
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
      <div style={{ fontWeight: 700, marginBottom: 2 }}>{label}</div>
      <div>{payload[0]?.value} corpus claims</div>
    </div>
  );
}

export default function ClaimDensityTimeline() {
  // Tick every other (show only AM buckets for cleaner axis)
  const ticks = DATA.filter((_, i) => i % 2 === 0).map((d) => d.bucket);

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Claim density — April 1–10, 1994 · 12-hour buckets</div>
      <p className="font-mono text-[11px] mb-4" style={{ color: 'var(--ink-soft)' }}>
        Corpus claims per 12-hour window, model-derived from source attribution timestamps and event references.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 640 }}>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={DATA}
              margin={{ top: 28, right: 24, left: 0, bottom: 8 }}
            >
              <defs>
                <linearGradient id="claimAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--rain)" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="var(--rain)" stopOpacity={0.04} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="bucket"
                ticks={ticks}
                tick={{ fontFamily: MONO, fontSize: 9, fill: 'var(--ink-soft)' }}
                axisLine={{ stroke: 'var(--smudge-faint)' }}
                tickLine={false}
                interval={0}
              />
              <YAxis
                tick={{ fontFamily: MONO, fontSize: 9, fill: 'var(--ink-soft)' }}
                axisLine={false}
                tickLine={false}
                width={32}
                label={{
                  value: 'claims',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 8,
                  style: { fontFamily: MONO, fontSize: 9, fill: 'var(--ink-muted)' },
                }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'var(--smudge)', strokeWidth: 1, strokeDasharray: '3 3' }} />

              {/* Key event reference lines */}
              {ANNOTATIONS.map((ann) => (
                <ReferenceLine
                  key={ann.bucket}
                  x={ann.bucket}
                  stroke="var(--rust)"
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  label={{
                    value: ann.short,
                    position: 'top',
                    style: {
                      fontFamily: MONO,
                      fontSize: 8,
                      fill: 'var(--rust)',
                    },
                  }}
                />
              ))}

              {/* 72-hour window highlight — Apr 5 AM to Apr 8 PM (indices 8–15) */}
              <ReferenceLine
                x="Apr 5 AM"
                stroke="var(--cassette)"
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <ReferenceLine
                x="Apr 8 PM"
                stroke="var(--cassette)"
                strokeWidth={1}
                strokeOpacity={0.5}
              />

              <Area
                type="monotone"
                dataKey="claims"
                stroke="var(--rain)"
                strokeWidth={1.5}
                fill="url(#claimAreaGrad)"
                dot={false}
                activeDot={{ r: 3, fill: 'var(--rain)', stroke: 'var(--card)', strokeWidth: 1.5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="font-mono text-[11px] mt-1" style={{ color: 'var(--ink-soft)' }}>
        Claims concentrate in the 72-hour window the conspiracy literature scrutinizes most.
      </p>
    </div>
  );
}
