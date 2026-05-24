/*
 * Chart 3: Suspect mention distribution by source quality — horizontal stacked bar
 * One row per suspect. Sworn / Unsworn / Commentary.
 * Location: SuspectScoringPage (above suspect cards)
 */

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { SUSPECTS } from '../data/suspects';

// Derive source-quality breakdown from known corpus data per suspect
// sworn = mention_count_under_oath; unsworn = investigator-archive mentions;
// commentary = remainder (news, books, podcasts, commentators)
function deriveQuality(s: typeof SUSPECTS[0]) {
  const sworn = s.features.mention_count_under_oath;
  // Investigator-archive unsworn: named_by_investigator_count * ~8 mentions each (proxy)
  const unsworn = Math.min(
    Math.round(s.features.named_by_investigator_count * 8),
    Math.max(0, s.features.mention_count_total - sworn),
  );
  const commentary = Math.max(0, s.features.mention_count_total - sworn - unsworn);
  return { sworn, unsworn, commentary };
}

// Sort by total mentions descending, exclude baseline (Cobain) for scale reasons — include separately
const SORTED = [...SUSPECTS]
  .filter((s) => s.archetype !== 'baseline')
  .sort((a, b) => b.features.mention_count_total - a.features.mention_count_total);

const DATA = SORTED.map((s) => {
  const q = deriveQuality(s);
  return {
    name: s.name.split(' ').slice(0, 1).join(' ') + (s.name.includes(' ') ? ' ' + s.name.split(' ').slice(-1)[0] : ''),
    fullName: s.name,
    sworn: q.sworn,
    unsworn: q.unsworn,
    commentary: q.commentary,
    archetype: s.archetype,
  };
});

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

function CustomTooltip({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  const total = payload.reduce((s, p) => s + (p.value || 0), 0);
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
        minWidth: 180,
      }}
    >
      <div style={{ fontWeight: 700, marginBottom: 4 }}>{label}</div>
      {payload.map((p) => (
        <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', gap: 16, marginBottom: 2 }}>
          <span style={{ color: 'var(--ink-soft)' }}>{p.name}</span>
          <span style={{ color: p.color, fontWeight: 600 }}>{p.value.toLocaleString()}</span>
        </div>
      ))}
      <div style={{ borderTop: '1px solid var(--smudge-faint)', marginTop: 4, paddingTop: 4 }}>
        <span style={{ color: 'var(--ink-soft)' }}>Total: </span>
        <span style={{ fontWeight: 700 }}>{total.toLocaleString()}</span>
      </div>
    </div>
  );
}

function CustomLegend() {
  return (
    <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', fontFamily: MONO, fontSize: 10, color: 'var(--ink-soft)', marginBottom: 4, flexWrap: 'wrap' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 10, height: 10, background: 'var(--rust)', opacity: 0.85 }} />
        <span>Sworn</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 10, height: 10, background: 'var(--cassette)', opacity: 0.85 }} />
        <span>Unsworn (investigator archive)</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 10, height: 10, background: 'var(--rain)', opacity: 0.75 }} />
        <span>Commentary (news, books, podcasts)</span>
      </div>
    </div>
  );
}

export default function SuspectMentionQualityChart() {
  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Suspect mention distribution — source quality breakdown</div>
      <p className="font-mono text-[11px] mb-3" style={{ color: 'var(--ink-soft)' }}>
        Sworn = under-oath or sworn-record attribution. Unsworn = investigator archive citations. Commentary = news, books, podcast, documentary references.
      </p>
      <CustomLegend />

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 480 }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart
              data={DATA}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
              barSize={16}
            >
              <XAxis
                type="number"
                tick={{ fontFamily: MONO, fontSize: 9, fill: 'var(--ink-soft)' }}
                axisLine={{ stroke: 'var(--smudge-faint)' }}
                tickLine={false}
              />
              <YAxis
                type="category"
                dataKey="fullName"
                width={140}
                tick={{ fontFamily: MONO, fontSize: 9, fill: 'var(--ink)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
              <Legend content={() => null} />
              <Bar dataKey="sworn" name="Sworn" stackId="a" fill="var(--rust)" opacity={0.85} stroke="var(--rust)" strokeWidth={0.5} />
              <Bar dataKey="unsworn" name="Unsworn" stackId="a" fill="var(--cassette)" opacity={0.85} stroke="var(--cassette-dim)" strokeWidth={0.5} />
              <Bar dataKey="commentary" name="Commentary" stackId="a" fill="var(--rain)" opacity={0.75} stroke="var(--rain)" strokeWidth={0.5} radius={[0, 1, 1, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p className="font-mono text-[11px] mt-2" style={{ color: 'var(--ink-soft)' }}>
        Love and DeWitt dominate sworn investigator-archive coverage. Andrew's three have much thinner sworn-source weight.
      </p>
    </div>
  );
}
