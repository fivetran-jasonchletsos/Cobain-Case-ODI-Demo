/*
 * Chart 7 (Bonus): Corroboration vs Contradiction diverging bar
 * Location: HypothesisPage (Andrew's Hypothesis)
 * Supporting claims to right (cassette gold), refuting claims to left (rust red)
 * Baseline at zero
 */

import { SUSPECTS } from '../data/suspects';

const MONO = '"JetBrains Mono", ui-monospace, Menlo, monospace';

// Build data from claims per suspect
const DATA = SUSPECTS
  .sort((a, b) => {
    const netA = a.claims.filter((c) => c.direction === 'supporting').length -
                 a.claims.filter((c) => c.direction === 'contradicting').length;
    const netB = b.claims.filter((c) => c.direction === 'supporting').length -
                 b.claims.filter((c) => c.direction === 'contradicting').length;
    return netB - netA;
  })
  .map((s) => {
    const supporting = s.claims.filter((c) => c.direction === 'supporting').length;
    const contradicting = s.claims.filter((c) => c.direction === 'contradicting').length;
    return {
      id: s.id,
      name: s.name,
      archetype: s.archetype,
      supporting,
      contradicting,
      net: supporting - contradicting,
    };
  });

// SVG layout
const W = 640;
const ROW_H = 30;
const PAD_TOP = 24;
const PAD_BOTTOM = 32;
const PAD_LEFT = 148;
const PAD_RIGHT = 32;
const H = PAD_TOP + ROW_H * DATA.length + PAD_BOTTOM;

const chartW = W - PAD_LEFT - PAD_RIGHT;
const centerX = PAD_LEFT + chartW / 2;

// Max claims in either direction (for scale)
const maxClaims = Math.max(
  ...DATA.map((d) => Math.max(d.supporting, d.contradicting)),
);

function claimX(count: number, direction: 'left' | 'right') {
  const half = chartW / 2;
  const scale = half / (maxClaims + 0.5);
  if (direction === 'right') return centerX + count * scale;
  return centerX - count * scale;
}

export default function CorroborationDivergingBar() {
  const ticks = [0, Math.ceil(maxClaims / 2), maxClaims];

  return (
    <div className="case-card p-5 mb-8">
      <div className="eyebrow mb-1" style={{ fontSize: 10 }}>
        Net evidence direction — corroboration vs contradiction per suspect
      </div>
      <p className="font-mono text-[11px] mb-4" style={{ color: 'var(--ink-soft)' }}>
        Supporting claims extend right (gold). Contradicting / alibi claims extend left (rust). Baseline at zero. Counts from the grounded corpus claim set.
      </p>

      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 520 }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            width="100%"
            style={{ display: 'block', fontFamily: MONO }}
            role="img"
            aria-label="Corroboration vs contradiction diverging bar chart"
          >
            {/* Column headers */}
            <text x={centerX - 8} y={PAD_TOP - 6} textAnchor="end" fontSize={8} fill="var(--rust)" fontWeight={600}>
              Contradicting claims
            </text>
            <text x={centerX + 8} y={PAD_TOP - 6} textAnchor="start" fontSize={8} fill="var(--cassette-dim)" fontWeight={600}>
              Supporting claims
            </text>

            {/* Center axis */}
            <line
              x1={centerX}
              x2={centerX}
              y1={PAD_TOP - 10}
              y2={PAD_TOP + ROW_H * DATA.length}
              stroke="var(--smudge)"
              strokeWidth={1}
            />

            {/* X-axis ticks + grid (right side) */}
            {ticks.map((t) => {
              const xR = claimX(t, 'right');
              const xL = claimX(t, 'left');
              return (
                <g key={t}>
                  <line x1={xR} x2={xR} y1={PAD_TOP - 6} y2={PAD_TOP + ROW_H * DATA.length}
                    stroke="var(--smudge-faint)" strokeWidth={0.5} strokeDasharray="2 3" />
                  <text x={xR} y={H - PAD_BOTTOM + 14} textAnchor="middle" fontSize={7.5} fill="var(--ink-soft)">{t}</text>
                  {t > 0 && (
                    <>
                      <line x1={xL} x2={xL} y1={PAD_TOP - 6} y2={PAD_TOP + ROW_H * DATA.length}
                        stroke="var(--smudge-faint)" strokeWidth={0.5} strokeDasharray="2 3" />
                      <text x={xL} y={H - PAD_BOTTOM + 14} textAnchor="middle" fontSize={7.5} fill="var(--ink-soft)">{t}</text>
                    </>
                  )}
                </g>
              );
            })}

            {/* Rows */}
            {DATA.map((row, i) => {
              const y = PAD_TOP + i * ROW_H;
              const midY = y + ROW_H / 2;
              const isBaseline = row.archetype === 'baseline';
              const barH = ROW_H - 8;

              const xRight = claimX(row.supporting, 'right');
              const xLeft = claimX(row.contradicting, 'left');

              return (
                <g key={row.id}>
                  {i % 2 === 0 && (
                    <rect x={0} y={y} width={W} height={ROW_H} fill="rgba(0,0,0,0.018)" />
                  )}
                  {isBaseline && (
                    <rect x={0} y={y} width={W} height={ROW_H} fill="rgba(74,144,164,0.06)" />
                  )}

                  {/* Suspect name */}
                  <text
                    x={PAD_LEFT - 6}
                    y={midY + 4}
                    textAnchor="end"
                    fontSize={9}
                    fontWeight={isBaseline ? 700 : 400}
                    fill={isBaseline ? '#4a90a4' : 'var(--ink)'}
                  >
                    {row.name}
                  </text>

                  {/* Supporting bar (right) */}
                  {row.supporting > 0 && (
                    <>
                      <rect
                        x={centerX}
                        y={midY - barH / 2}
                        width={xRight - centerX}
                        height={barH}
                        fill="var(--cassette)"
                        opacity={0.82}
                        stroke="var(--cassette-dim)"
                        strokeWidth={0.5}
                        rx={1}
                      />
                      <text
                        x={xRight + 3}
                        y={midY + 3}
                        textAnchor="start"
                        fontSize={8}
                        fill="var(--cassette-dim)"
                        fontWeight={600}
                      >
                        {row.supporting}
                      </text>
                    </>
                  )}

                  {/* Contradicting bar (left) */}
                  {row.contradicting > 0 && (
                    <>
                      <rect
                        x={xLeft}
                        y={midY - barH / 2}
                        width={centerX - xLeft}
                        height={barH}
                        fill="var(--rust)"
                        opacity={0.78}
                        stroke="var(--rust)"
                        strokeWidth={0.5}
                        rx={1}
                      />
                      <text
                        x={xLeft - 3}
                        y={midY + 3}
                        textAnchor="end"
                        fontSize={8}
                        fill="var(--rust)"
                        fontWeight={600}
                      >
                        {row.contradicting}
                      </text>
                    </>
                  )}

                  {/* Net label at far right */}
                  <text
                    x={W - 4}
                    y={midY + 3}
                    textAnchor="end"
                    fontSize={8}
                    fill={row.net > 0 ? 'var(--cassette-dim)' : row.net < 0 ? 'var(--rust)' : 'var(--ink-muted)'}
                    fontWeight={600}
                  >
                    {row.net >= 0 ? '+' : ''}{row.net}
                  </text>
                </g>
              );
            })}

            {/* Footer label */}
            <text
              x={W - 8}
              y={PAD_TOP - 6}
              textAnchor="end"
              fontSize={7.5}
              fill="var(--ink-muted)"
            >
              net
            </text>
          </svg>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-2 mb-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--cassette)', opacity: 0.82, border: '0.5px solid var(--cassette-dim)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Supporting claims</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div style={{ width: 12, height: 12, background: 'var(--rust)', opacity: 0.78, border: '0.5px solid var(--rust)' }} />
          <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>Contradicting / alibi claims</span>
        </div>
        <span className="font-mono text-[10px]" style={{ color: 'var(--ink-muted)' }}>Net = supporting minus contradicting</span>
      </div>

      <p className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
        Net evidence direction per suspect. Cobain has net-positive supporting claims (the official ruling has many sources); Andrew's three have net signal close to zero.
      </p>
    </div>
  );
}
