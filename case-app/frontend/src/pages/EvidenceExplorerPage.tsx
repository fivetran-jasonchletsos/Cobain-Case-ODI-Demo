/*
 * Page 6: Evidence Explorer
 * NL-search-style page over the corpus.
 * Filter by source-type, sworn-vs-unsworn, date range, named-person.
 */

import { useState, useMemo } from 'react';
import { SUSPECTS, SOURCES } from '../data/suspects';

// Build a flat list of all claims from all suspects, deduplicated by text
interface ClaimRow {
  id: string;
  text: string;
  suspectName: string;
  suspectId: string;
  direction: 'supporting' | 'contradicting';
  claimType: string;
  sourceIds: string[];
  sworn: boolean;
}

function buildClaimRows(): ClaimRow[] {
  const seen = new Set<string>();
  const rows: ClaimRow[] = [];
  for (const s of SUSPECTS) {
    for (const c of s.claims) {
      const key = c.text.slice(0, 60) + s.id;
      if (seen.has(key)) continue;
      seen.add(key);
      const sworn = c.sourceIds.some((sid) => SOURCES[sid]?.sworn);
      rows.push({
        id: key,
        text: c.text,
        suspectName: s.name,
        suspectId: s.id,
        direction: c.direction,
        claimType: c.claimType,
        sourceIds: c.sourceIds,
        sworn,
      });
    }
  }
  return rows;
}

const ALL_CLAIMS = buildClaimRows();
const ALL_SOURCE_TYPES = Array.from(new Set(Object.values(SOURCES).map((s) => s.type)));
const ALL_SUSPECTS = SUSPECTS.map((s) => ({ id: s.id, name: s.name }));

export default function EvidenceExplorerPage() {
  const [query, setQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterSworn, setFilterSworn] = useState<'all' | 'sworn' | 'unsworn'>('all');
  const [filterSuspect, setFilterSuspect] = useState<string>('all');
  const [filterDirection, setFilterDirection] = useState<'all' | 'supporting' | 'contradicting'>('all');

  const filtered = useMemo(() => {
    let rows = ALL_CLAIMS;

    if (query.trim().length > 1) {
      const q = query.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.text.toLowerCase().includes(q) ||
          r.suspectName.toLowerCase().includes(q) ||
          r.claimType.toLowerCase().includes(q) ||
          r.sourceIds.some((sid) => SOURCES[sid]?.label.toLowerCase().includes(q))
      );
    }

    if (filterSuspect !== 'all') {
      rows = rows.filter((r) => r.suspectId === filterSuspect);
    }

    if (filterType !== 'all') {
      rows = rows.filter((r) =>
        r.sourceIds.some((sid) => SOURCES[sid]?.type === filterType)
      );
    }

    if (filterSworn === 'sworn') {
      rows = rows.filter((r) => r.sworn);
    } else if (filterSworn === 'unsworn') {
      rows = rows.filter((r) => !r.sworn);
    }

    if (filterDirection !== 'all') {
      rows = rows.filter((r) => r.direction === filterDirection);
    }

    return rows;
  }, [query, filterType, filterSworn, filterSuspect, filterDirection]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · Evidence Explorer</div>
      <h1 className="mb-3" style={{ color: 'var(--ink-strong)' }}>
        Evidence Explorer
      </h1>
      <p className="text-lg max-w-3xl mb-6" style={{ color: 'var(--ink)' }}>
        Search and filter the extracted claim corpus. Every claim is attributed to a published source.
        Filter by source type, sworn testimony status, named suspect, or supporting vs contradicting
        direction.
      </p>

      {/* Filters */}
      <div
        className="case-card p-5 mb-6 sticky top-20 z-10"
        style={{ boxShadow: '0 2px 8px rgba(44,51,64,0.08)' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search — magnifying-glass evidence search field */}
          <div className="lg:col-span-3">
            <label className="eyebrow block mb-1" style={{ fontSize: 10 }}>Search claims</label>
            <div className="relative">
              <span
                aria-hidden
                className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                style={{ color: 'var(--ink-soft)' }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-4-4" />
                </svg>
              </span>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by claim text, suspect name, or source"
                className="w-full rounded-sm border pl-10 pr-3 py-2.5 font-mono text-sm"
                style={{
                  borderColor: 'var(--smudge)',
                  background: 'var(--paper)',
                  color: 'var(--ink)',
                  outline: 'none',
                  borderWidth: '1.5px',
                  minHeight: 44,
                }}
              />
            </div>
          </div>

          {/* Suspect filter */}
          <div>
            <label className="eyebrow block mb-1" style={{ fontSize: 10 }}>Named suspect</label>
            <select
              value={filterSuspect}
              onChange={(e) => setFilterSuspect(e.target.value)}
              className="w-full rounded-sm border px-3 py-2 font-mono text-[12px]"
              style={{ borderColor: 'var(--hairline)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <option value="all">All suspects</option>
              {ALL_SUSPECTS.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Source type */}
          <div>
            <label className="eyebrow block mb-1" style={{ fontSize: 10 }}>Source type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full rounded-sm border px-3 py-2 font-mono text-[12px]"
              style={{ borderColor: 'var(--hairline)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <option value="all">All source types</option>
              {ALL_SOURCE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          {/* Direction */}
          <div>
            <label className="eyebrow block mb-1" style={{ fontSize: 10 }}>Evidence direction</label>
            <select
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value as typeof filterDirection)}
              className="w-full rounded-sm border px-3 py-2 font-mono text-[12px]"
              style={{ borderColor: 'var(--hairline)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <option value="all">All directions</option>
              <option value="supporting">Supporting</option>
              <option value="contradicting">Contradicting / alibi</option>
            </select>
          </div>

          {/* Sworn */}
          <div>
            <label className="eyebrow block mb-1" style={{ fontSize: 10 }}>Testimony type</label>
            <select
              value={filterSworn}
              onChange={(e) => setFilterSworn(e.target.value as typeof filterSworn)}
              className="w-full rounded-sm border px-3 py-2 font-mono text-[12px]"
              style={{ borderColor: 'var(--hairline)', background: 'var(--paper)', color: 'var(--ink)' }}
            >
              <option value="all">All (sworn + unsworn)</option>
              <option value="sworn">Sworn only</option>
              <option value="unsworn">Unsworn only</option>
            </select>
          </div>

          {/* Result count */}
          <div className="flex items-end">
            <span className="font-mono text-sm" style={{ color: 'var(--ink-muted)' }}>
              {filtered.length} of {ALL_CLAIMS.length} claims
            </span>
          </div>
        </div>
      </div>

      {/* Results */}
      {filtered.length === 0 && (
        <div className="case-card p-8 text-center">
          <p className="text-lg" style={{ color: 'var(--ink-muted)' }}>
            No claims match the current filters.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((row) => {
          const isSupporting = row.direction === 'supporting';
          const borderColor = isSupporting ? 'var(--caution)' : 'var(--confirm)';
          return (
            <div
              key={row.id}
              className="case-card p-4"
              style={{ borderLeft: `4px solid ${borderColor}` }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className="font-mono text-[10px] font-semibold px-1.5 py-0.5 rounded-sm"
                    style={{
                      background: 'var(--slate-deep)',
                      color: 'var(--amber)',
                      fontFamily: 'monospace',
                    }}
                  >
                    {SUSPECTS.find((s) => s.id === row.suspectId)?.initials ?? row.suspectId}
                  </span>
                  <span className="font-semibold text-sm" style={{ color: 'var(--ink-strong)' }}>
                    {row.suspectName}
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
                    style={{
                      borderColor: isSupporting ? 'var(--caution)' : 'var(--confirm)',
                      color: isSupporting ? 'var(--caution)' : 'var(--confirm)',
                      background: isSupporting ? 'var(--caution-bg)' : 'var(--confirm-bg)',
                    }}
                  >
                    {row.direction}
                  </span>
                  <span
                    className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
                    style={{ borderColor: 'var(--hairline)', color: 'var(--ink-soft)', background: 'var(--paper-deep)' }}
                  >
                    {row.claimType}
                  </span>
                  {row.sworn && <span className="source-chip sworn">sworn</span>}
                </div>
              </div>
              <p className="text-sm mb-3" style={{ color: 'var(--ink)' }}>{row.text}</p>
              <div className="flex flex-wrap gap-1.5">
                {row.sourceIds.map((sid) => {
                  const src = SOURCES[sid];
                  return src ? (
                    <span key={sid} className={`source-chip ${src.type}`}>{src.label}</span>
                  ) : null;
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Disclaimer */}
      <div
        className="mt-8 p-4 rounded-sm border text-sm"
        style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--ink-muted)' }}
      >
        All claims shown are extracted from publicly available published sources only. No fabricated
        quotes, invented documents, or made-up forensic findings are included. All claims are framed
        as allegations in identified sources, not as facts. The official ruling is suicide (Seattle PD,
        1994; King County ME, 1994).
      </div>
    </div>
  );
}
