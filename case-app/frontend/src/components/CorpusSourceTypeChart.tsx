/*
 * Chart 1: Corpus by source-type — stacked horizontal bar
 * Location: CorpusPage
 * Structured (FOIA, Peer-Reviewed, Court) vs Unstructured (everything else)
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';

const DATA = [
  { type: 'Investigator Notes',        count: 405, structured: false },
  { type: 'News Archives',             count: 336, structured: false },
  { type: 'Commentator / Self-Pub.',   count: 97,  structured: false },
  { type: 'Podcasts / Audio',          count: 66,  structured: false },
  { type: 'FOIA / Official Records',   count: 38,  structured: true  },
  { type: 'Books',                     count: 14,  structured: false },
  { type: 'Court Records',             count: 7,   structured: true  },
  { type: 'Documentaries',            count: 9,   structured: false },
  { type: 'Peer-Reviewed',            count: 2,   structured: true  },
];

// Sort descending for readability
const SORTED = [...DATA].sort((a, b) => b.count - a.count);

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number; name: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const row = SORTED.find((d) => d.type === label);
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
      <div>{payload[0]?.value.toLocaleString()} documents</div>
      <div style={{ color: 'var(--ink-soft)', marginTop: 2 }}>
        {row?.structured ? 'Structured source' : 'Unstructured source'}
      </div>
    </div>
  );
}

export default function CorpusSourceTypeChart() {
  const total = DATA.reduce((s, d) => s + d.count, 0);
  const unstructured = DATA.filter((d) => !d.structured).reduce((s, d) => s + d.count, 0);
  const unstructuredPct = Math.round((unstructured / total) * 100);

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Corpus composition — documents by source type</div>
      <div className="flex items-baseline gap-3 mb-4 flex-wrap">
        <span className="font-mono text-2xl font-bold" style={{ color: 'var(--ink-strong)' }}>
          {total.toLocaleString()}
        </span>
        <span className="font-mono text-[12px]" style={{ color: 'var(--ink-soft)' }}>total documents</span>
        <span
          className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm border"
          style={{ background: 'var(--rain-bg)', borderColor: 'var(--rain)', color: 'var(--rain)' }}
        >
          {unstructuredPct}% unstructured
        </span>
        <span
          className="font-mono text-[11px] px-1.5 py-0.5 rounded-sm border"
          style={{ background: 'var(--cassette-bg)', borderColor: 'var(--cassette)', color: 'var(--cassette-dim)' }}
        >
          {100 - unstructuredPct}% structured
        </span>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 400 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={SORTED}
              layout="vertical"
              margin={{ top: 4, right: 60, left: 8, bottom: 4 }}
              barSize={18}
            >
              <XAxis
                type="number"
                tick={{ fontFamily: MONO, fontSize: 10, fill: 'var(--ink-soft)' }}
                axisLine={{ stroke: 'var(--smudge-faint)' }}
                tickLine={false}
                tickCount={6}
              />
              <YAxis
                type="category"
                dataKey="type"
                width={160}
                tick={{ fontFamily: MONO, fontSize: 10, fill: 'var(--ink)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.04)' }} />
              <Bar dataKey="count" radius={[0, 1, 1, 0]}>
                {SORTED.map((entry) => (
                  <Cell
                    key={entry.type}
                    fill={entry.structured ? 'var(--cassette)' : 'var(--rain)'}
                    opacity={0.85}
                    stroke={entry.structured ? 'var(--cassette-dim)' : 'var(--rain)'}
                    strokeWidth={0.5}
                  />
                ))}
                <LabelList
                  dataKey="count"
                  position="right"
                  style={{ fontFamily: MONO, fontSize: 10, fill: 'var(--ink-soft)' }}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--rain)', opacity: 0.85, border: '0.5px solid var(--rain)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Unstructured (requires Fivetran + run-time agents)</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--cassette)', opacity: 0.85, border: '0.5px solid var(--cassette-dim)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Structured (standard connectors)</span>
        </div>
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        Roughly 80% of the corpus is unstructured. Fivetran ingest + dbt-wizard run-time agent extraction is the precondition for AI scoring.
      </p>
    </div>
  );
}
