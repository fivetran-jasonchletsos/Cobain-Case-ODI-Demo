/*
 * Page 4: Suspect Detail
 * Click any suspect card to see full motive/means/opportunity panels,
 * corroboration and contradiction counts, and all claims cited to source.
 */

import { useParams, Link } from 'react-router-dom';
import { SUSPECTS, SOURCES } from '../data/suspects';
import { scoreSuspect, DEFAULT_WEIGHTS } from '../data/scoring';

export default function SuspectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const suspect = SUSPECTS.find((s) => s.id === id);

  if (!suspect) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <div className="eyebrow mb-2">Not found</div>
        <p style={{ color: 'var(--ink-muted)' }}>Suspect not found.</p>
        <Link to="/scoring" className="mt-4 inline-block font-mono text-sm underline" style={{ color: 'var(--amber-dim)' }}>
          Back to scoring
        </Link>
      </div>
    );
  }

  const result = scoreSuspect(suspect.features, DEFAULT_WEIGHTS, true);

  const supporting = suspect.claims.filter((c) => c.direction === 'supporting');
  const contradicting = suspect.claims.filter((c) => c.direction === 'contradicting');

  const pPct = Math.round(result.probability * 100);
  const loPct = Math.round(result.ci_lower * 100);
  const hiPct = Math.round(result.ci_upper * 100);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-6">
        <Link
          to="/scoring"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider rounded-sm px-3 py-1.5 border mb-4 transition-colors"
          style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M11 5l-7 7 7 7" />
          </svg>
          Back to scoring
        </Link>

        <div className="eyebrow mb-2">Cobain Case ODI · Suspect Detail</div>
        <div className="flex items-start gap-5 flex-wrap">
          <div
            className="h-20 w-20 rounded-sm flex items-center justify-center font-mono font-bold text-3xl shrink-0"
            style={{ background: 'var(--slate-deep)', color: 'var(--amber)', border: '2px solid var(--slate-soft)' }}
          >
            {suspect.initials}
          </div>
          <div>
            <h1 className="font-serif text-3xl font-bold" style={{ color: 'var(--ink-strong)' }}>
              {suspect.name}
            </h1>
            <p className="text-lg mt-1" style={{ color: 'var(--ink-muted)' }}>{suspect.role}</p>
            <div className="eyebrow mt-1" style={{ fontSize: 9 }}>{suspect.label}</div>
          </div>
        </div>
      </div>

      {/* Probability summary */}
      <div
        className="case-card p-5 mb-8 border-l-4"
        style={{ borderLeftColor: 'var(--amber)' }}
      >
        <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Grounded model score</div>
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-mono text-4xl font-bold" style={{ color: 'var(--amber-dim)' }}>{pPct}%</span>
          <span className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>
            95% CI [{loPct}%, {hiPct}%]
          </span>
        </div>
        <div
          className="mt-3 h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline)', maxWidth: 400 }}
        >
          <div
            className="h-full rounded-full prob-bar-fill"
            style={{ width: `${pPct}%`, background: 'var(--amber)' }}
          />
        </div>
        <p className="text-sm mt-2" style={{ color: 'var(--ink-muted)' }}>
          Model estimate only. All output represents corpus-derived scoring, not forensic determination.
          Official ruling: suicide.
        </p>
      </div>

      {/* Three panels: motive, means, opportunity */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
        {[
          { label: 'Motive', score: suspect.features.motive_strength_score, body: suspect.motive_summary },
          { label: 'Means', score: suspect.features.means_score, body: suspect.means_summary },
          { label: 'Opportunity', score: suspect.features.opportunity_score, body: suspect.opportunity_summary },
        ].map((panel) => (
          <div key={panel.label} className="case-card p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="eyebrow" style={{ fontSize: 10 }}>{panel.label}</div>
              <span
                className="font-mono text-lg font-bold"
                style={{ color: panel.score > 0.5 ? 'var(--caution)' : panel.score > 0.3 ? 'var(--amber-dim)' : 'var(--ink-soft)' }}
              >
                {Math.round(panel.score * 100)}
              </span>
            </div>
            <div
              className="h-1.5 rounded-full overflow-hidden mb-3"
              style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline-soft)' }}
            >
              <div
                className="h-full rounded-full prob-bar-fill"
                style={{
                  width: `${Math.round(panel.score * 100)}%`,
                  background: panel.score > 0.5 ? 'var(--caution)' : panel.score > 0.3 ? 'var(--amber)' : 'var(--fog)',
                }}
              />
            </div>
            <p className="text-sm leading-relaxed" style={{ color: 'var(--ink-muted)' }}>
              {panel.body}
            </p>
          </div>
        ))}
      </div>

      {/* Corroboration / Contradiction counts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total corpus mentions', val: suspect.features.mention_count_total.toLocaleString(), color: 'var(--ink-strong)' },
          { label: 'Sworn-testimony mentions', val: suspect.features.mention_count_under_oath, color: 'var(--confirm)' },
          { label: 'Supporting claims', val: supporting.length, color: 'var(--caution)' },
          { label: 'Contradicting claims', val: contradicting.length, color: 'var(--confirm)' },
        ].map((t) => (
          <div key={t.label} className="case-card p-4">
            <div className="eyebrow mb-1" style={{ fontSize: 9 }}>{t.label}</div>
            <div className="font-mono text-2xl font-bold" style={{ color: t.color }}>{t.val}</div>
          </div>
        ))}
      </div>

      {/* Claims tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Supporting */}
        <div>
          <div className="eyebrow mb-3" style={{ color: 'var(--caution)' }}>
            Supporting claims ({supporting.length})
          </div>
          <div className="flex flex-col gap-3">
            {supporting.length === 0 && (
              <div className="case-card p-4 text-sm" style={{ color: 'var(--ink-soft)' }}>
                No supporting claims in the grounded corpus for this suspect.
              </div>
            )}
            {supporting.map((c, i) => (
              <div
                key={i}
                className="case-card p-4"
                style={{ borderLeft: '4px solid var(--caution)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>{c.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.sourceIds.map((sid) => {
                    const src = SOURCES[sid];
                    return src ? (
                      <span key={sid} className={`source-chip ${src.type}`}>
                        {src.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Contradicting */}
        <div>
          <div className="eyebrow mb-3" style={{ color: 'var(--confirm)' }}>
            Contradicting evidence and alibis ({contradicting.length})
          </div>
          <div className="flex flex-col gap-3">
            {contradicting.length === 0 && (
              <div className="case-card p-4 text-sm" style={{ color: 'var(--ink-soft)' }}>
                No contradicting claims documented in the grounded corpus.
              </div>
            )}
            {contradicting.map((c, i) => (
              <div
                key={i}
                className="case-card p-4"
                style={{ borderLeft: '4px solid var(--confirm)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>{c.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.sourceIds.map((sid) => {
                    const src = SOURCES[sid];
                    return src ? (
                      <span key={sid} className={`source-chip ${src.type}`}>
                        {src.label}
                      </span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Feature scores table */}
      <div className="mt-8 case-card p-5">
        <div className="eyebrow mb-3">Raw feature scores</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Feature</th>
              <th className="num">Value</th>
              <th className="num">Normalized</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: 'Total mention count', raw: suspect.features.mention_count_total.toLocaleString(), norm: (suspect.features.mention_count_total / 3000).toFixed(3) },
              { label: 'Sworn-testimony mentions', raw: suspect.features.mention_count_under_oath, norm: (suspect.features.mention_count_under_oath / 10).toFixed(3) },
              { label: 'Motive strength score', raw: suspect.features.motive_strength_score.toFixed(2), norm: suspect.features.motive_strength_score.toFixed(3) },
              { label: 'Means score', raw: suspect.features.means_score.toFixed(2), norm: suspect.features.means_score.toFixed(3) },
              { label: 'Opportunity score', raw: suspect.features.opportunity_score.toFixed(2), norm: suspect.features.opportunity_score.toFixed(3) },
              { label: 'Corroboration density', raw: suspect.features.corroboration_density.toFixed(2), norm: suspect.features.corroboration_density.toFixed(3) },
              { label: 'Contradiction count', raw: suspect.features.contradiction_count, norm: (suspect.features.contradiction_count / 25).toFixed(3) },
              { label: 'Timeline proximity', raw: suspect.features.timeline_proximity.toFixed(2), norm: suspect.features.timeline_proximity.toFixed(3) },
              { label: 'Named by investigator count', raw: suspect.features.named_by_investigator_count, norm: (suspect.features.named_by_investigator_count / 20).toFixed(3) },
            ].map((row) => (
              <tr key={row.label}>
                <td>{row.label}</td>
                <td className="num">{row.raw}</td>
                <td className="num">{row.norm}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
