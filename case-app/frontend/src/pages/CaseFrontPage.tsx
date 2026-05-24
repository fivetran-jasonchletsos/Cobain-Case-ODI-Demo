/*
 * Page 1: Case Front
 * Andrew's question framed in AI terms. Timeline April 5–8, 1994. Corpus stats.
 */

import { Link } from 'react-router-dom';
import { CORPUS_STATS } from '../data/suspects';
import ClaimDensityTimeline from '../components/ClaimDensityTimeline';

const TIMELINE_EVENTS = [
  {
    date: 'March 30, 1994',
    label: 'Firearm purchased',
    body: 'Dylan Carlson purchases a Remington 20-gauge shotgun on Kurt Cobain\'s behalf. Cobain signs into the purchase. Cited in Seattle PD Case #94-108620.',
    severity: 'caution',
    sources: ['spd-report-1994'],
  },
  {
    date: 'April 1, 1994',
    label: 'Rome incident follow-up / return to Seattle',
    body: 'Cobain returns to Seattle following the Rome hospitalization (March 4, 1994). Cross (2001) documents increasing isolation. Courtney Love departs for Los Angeles.',
    severity: 'neutral',
    sources: ['cross-2001'],
  },
  {
    date: 'April 2–4, 1994',
    label: 'Cobain last seen by acquaintances',
    body: 'Multiple accounts cited by Cross (2001) place Cobain in the Seattle area. Carlson and others report contact. No single account is sworn testimony.',
    severity: 'neutral',
    sources: ['cross-2001'],
  },
  {
    date: 'April 5, 1994 (estimated)',
    label: 'Death window — estimated time of death',
    body: 'King County Medical Examiner estimated time of death as April 5, 1994, based on physical evidence and the last confirmed sighting on April 3. Cause: contact gunshot wound to the head. Manner: suicide.',
    severity: 'alert',
    sources: ['kcme-autopsy-1994', 'spd-report-1994'],
  },
  {
    date: 'April 8, 1994',
    label: 'Body discovered',
    body: 'An electrician working at 171 Lake Washington Blvd E, Seattle, discovers Cobain\'s body in the greenhouse above the garage. Seattle Police Department responds. Case #94-108620 opened.',
    severity: 'alert',
    sources: ['spd-report-1994'],
  },
  {
    date: 'April 10, 1994',
    label: 'Public memorial — Seattle Center Flag Pavilion',
    body: 'Approximately 7,000 fans gather at the Seattle Center Flag Pavilion. Courtney Love reads from Kurt\'s note. Documented in Seattle Times and Rolling Stone.',
    severity: 'neutral',
    sources: ['seattle-times-1994', 'rolling-stone-1994'],
  },
  {
    date: 'February 2026',
    label: 'Burnett & Wilkins peer-reviewed forensic paper published',
    body: 'A peer-reviewed forensic paper by Brian Burnett and Michelle Wilkins challenges the suicide ruling on three grounds: heroin-level incapacitation, blood-spatter absence, and organ necrosis consistent with prolonged circulatory collapse preceding the gunshot. Conclusion: one or more assailants. The official ruling has not been amended. Reported by Euronews, Military.com, and Seattle Times.',
    severity: 'caution',
    sources: ['burnett-wilkins-2026', 'euronews-2026'],
  },
];

const SEV_STYLE: Record<string, { border: string; dot: string; bg: string }> = {
  alert:   { border: 'var(--alert)',   dot: 'var(--alert)',   bg: 'var(--alert-bg)' },
  caution: { border: 'var(--caution)', dot: 'var(--caution)', bg: 'var(--caution-bg)' },
  neutral: { border: 'var(--hairline)', dot: 'var(--ink-soft)', bg: 'var(--card)' },
};

export default function CaseFrontPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">

      {/* ── Hero ── */}
      <div className="mb-10">
        <div className="eyebrow mb-2">Cobain Case ODI · Case Front</div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          Can a grounded model tell us anything about a 30-year-old unresolved question?
        </h1>
        <p className="text-lg max-w-3xl" style={{ color: 'var(--ink-muted)' }}>
          This demo answers a different question first: what happens when you run an AI probability model
          without grounded data, versus with it. The Cobain case lives in unstructured data — books, FOIA
          records, documentary transcripts, investigator notes. Almost none of it is in a database. Fivetran
          is what makes the AI-grade data possible.
        </p>

        <div
          className="mt-6 p-5 rounded-sm border-l-4 max-w-3xl"
          style={{
            borderLeftColor: 'var(--amber)',
            background: 'var(--amber-bg)',
            borderTop: '1px solid var(--hairline)',
            borderRight: '1px solid var(--hairline)',
            borderBottom: '1px solid var(--hairline)',
          }}
        >
          <div className="eyebrow mb-1" style={{ fontSize: 10 }}>The headline message</div>
          <p className="font-serif font-semibold text-xl" style={{ color: 'var(--ink-strong)' }}>
            AI is useless without grounded data. Fivetran is what makes the messy AI-grade data possible.
          </p>
          <p className="mt-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
            Toggle between Grounded and Ungrounded mode on the Suspect Scoring page to see exactly what
            changes — and why the CI bands widen to near-uniform priors without corpus data behind them.
          </p>
        </div>
      </div>

      {/* ── Official ruling banner ── */}
      <div
        className="mb-8 p-4 rounded-sm border flex items-start gap-3"
        style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8' }}
      >
        <div
          className="shrink-0 mt-0.5 h-5 w-5 rounded-full flex items-center justify-center"
          style={{ background: '#6b7d93', color: 'white', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}
        >
          !
        </div>
        <div>
          <p className="font-mono text-sm font-semibold" style={{ color: '#2c3340' }}>
            Official ruling: Seattle PD Case #94-108620 (1994) — Manner of death: suicide. King County
            Medical Examiner — Cause: contact gunshot wound to the head. Self-inflicted.
          </p>
          <p className="mt-1 text-sm" style={{ color: 'var(--ink-muted)' }}>
            This model tests Andrew's hypothesis against the public record. It does not assert an alternative
            to the official ruling. All probability outputs are model estimates, not forensic findings.
          </p>
        </div>
      </div>

      {/* Chart 2: Claim density timeline */}
      <ClaimDensityTimeline />

      {/* ── Two columns: timeline + corpus stats ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">

        {/* Timeline */}
        <div>
          <div className="eyebrow mb-3">Timeline · April 5–8, 1994</div>
          <div className="flex flex-col gap-2">
            {TIMELINE_EVENTS.map((ev) => {
              const s = SEV_STYLE[ev.severity];
              return (
                <div
                  key={ev.date}
                  className="case-card p-4"
                  style={{
                    borderLeft: `4px solid ${s.border}`,
                    background: s.bg,
                  }}
                >
                  <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                    <span className="font-mono text-[11px] font-semibold" style={{ color: s.dot }}>
                      {ev.date}
                    </span>
                    <span className="font-semibold text-sm" style={{ color: 'var(--ink-strong)' }}>
                      {ev.label}
                    </span>
                  </div>
                  <p className="text-sm leading-snug" style={{ color: 'var(--ink-muted)' }}>
                    {ev.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Corpus stats */}
        <div>
          <div className="eyebrow mb-3">Corpus statistics</div>
          <div className="case-card p-5 mb-4">
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Total documents</div>
                <div className="font-mono text-3xl font-bold" style={{ color: 'var(--ink-strong)' }}>
                  {CORPUS_STATS.totalDocuments.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Extracted claims</div>
                <div className="font-mono text-3xl font-bold" style={{ color: 'var(--ink-strong)' }}>
                  {CORPUS_STATS.totalClaims.toLocaleString()}
                </div>
              </div>
              <div>
                <div className="eyebrow mb-1" style={{ fontSize: 10 }}>SDK connectors</div>
                <div className="font-mono text-3xl font-bold" style={{ color: 'var(--amber-dim)' }}>
                  {CORPUS_STATS.connectorSdkSources}
                </div>
              </div>
            </div>
            <div className="section-rule" />
            <table className="data-table">
              <thead>
                <tr>
                  <th>Source type</th>
                  <th className="num">Documents</th>
                </tr>
              </thead>
              <tbody>
                {CORPUS_STATS.sourceBreakdown.map((row) => (
                  <tr key={row.type}>
                    <td className="font-semibold">{row.type}</td>
                    <td className="num font-mono">{row.count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-3 flex items-center gap-2">
              <span className="source-chip investigator">Freshness</span>
              <span className="font-mono text-[11px]" style={{ color: 'var(--ink-muted)' }}>
                Last ingested: {CORPUS_STATS.freshness}
              </span>
            </div>
          </div>

          {/* Data flow summary */}
          <div className="case-card p-5">
            <div className="eyebrow mb-3" style={{ fontSize: 10 }}>How the data gets here</div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Fivetran Connector SDK', desc: '23 long-tail sources — investigator archives, documentary transcripts, true-crime podcast feeds, FOIA portals. Not available in any standard connector catalog.' },
                { label: 'MDLS → Apache Iceberg on S3', desc: 'Raw bytes landed as Iceberg tables. Source-type, provenance URL, and ingestion timestamp preserved. No schema transformation at landing.' },
                { label: 'Snowflake Cortex', desc: 'Entity extraction, claim attribution, timestamp normalization across free-form text. Outputs feed the bronze → silver → gold dbt pipeline.' },
                { label: 'dbt gold layer', desc: 'gold.fct_claim · gold.dim_suspect · gold.fct_witness_attribution · gold.fct_timeline_anchor. Governed, tested, documented.' },
              ].map((item) => (
                <div key={item.label} className="flex gap-3">
                  <div
                    className="mt-1.5 h-2 w-2 rounded-full shrink-0"
                    style={{ background: 'var(--amber)' }}
                  />
                  <div>
                    <div className="font-mono text-[12px] font-semibold" style={{ color: 'var(--ink-strong)' }}>
                      {item.label}
                    </div>
                    <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Navigation CTA row ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { to: '/corpus', label: 'The Corpus', desc: 'What Fivetran pulled in — source inventory, connectors, examples per type.' },
          { to: '/scoring', label: 'Suspect Scoring', desc: '11 suspect cards with probability scores. Distinct baseline for the official ruling. Toggle Grounded vs Ungrounded mode.' },
          { to: '/hypothesis', label: "Andrew's Hypothesis", desc: 'Score the joint theory — all three suspects involved — against the record.' },
        ].map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="case-card p-4 block"
            style={{ textDecoration: 'none' }}
          >
            <div className="eyebrow mb-1" style={{ fontSize: 10 }}>Go to</div>
            <div className="font-serif font-semibold text-lg" style={{ color: 'var(--ink-strong)' }}>
              {c.label}
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
