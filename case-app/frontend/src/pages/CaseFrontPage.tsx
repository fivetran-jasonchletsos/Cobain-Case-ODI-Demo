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

      {/* ── Hero / Case-file tab masthead ── */}
      <div className="mb-10 newsprint-texture relative">
        {/* CONFIDENTIAL stamp in the top-right */}
        <div className="absolute right-0 top-0 hidden sm:block">
          <span className="stamp stamp--lg">Confidential</span>
        </div>

        <div className="case-file-tab mb-0 max-w-3xl">
          <div className="eyebrow" style={{ fontSize: 11 }}>
            Case File · No. 94-108620 · Cobain Case ODI · Page 1
          </div>
        </div>
        <div
          className="border-t-0 border max-w-3xl px-7 py-7"
          style={{ background: 'var(--card)', borderColor: 'var(--smudge-soft)', borderRadius: '0 0 6px 6px' }}
        >
          <h1 className="mb-4" style={{ color: 'var(--ink-strong)' }}>
            Can a grounded model tell us anything about a 30-year-old unresolved question?
          </h1>
          <p className="text-lg" style={{ color: 'var(--ink)', maxWidth: '60ch' }}>
            This demo answers a different question first: what happens when you run an AI
            probability model without grounded data, versus with it. The Cobain case lives in
            unstructured data, books, FOIA records, documentary transcripts, investigator notes.
            Almost none of it is in a database. Fivetran is what makes the AI-grade data possible.
          </p>
        </div>

        {/* Headline-message evidence card with paperclip */}
        <div className="evidence-card mt-7 max-w-3xl">
          <div className="eyebrow mb-2" style={{ fontSize: 11 }}>Exhibit A — the headline message</div>
          <p className="font-serif font-semibold text-xl" style={{ color: 'var(--ink-strong)', lineHeight: 1.35 }}>
            AI is useless without grounded data. Fivetran is what makes the messy AI-grade data possible.
          </p>
          <p className="mt-3 text-base" style={{ color: 'var(--ink-soft)' }}>
            Toggle between Grounded and Ungrounded mode on the Suspect Scoring page to see exactly what
            changes, and why the CI bands widen to near-uniform priors without corpus data behind them.
          </p>
        </div>
      </div>

      {/* ── Official ruling — casefile-callout ── */}
      <div className="casefile-callout mb-10 max-w-4xl">
        <span className="casefile-callout__stamp">Official Record</span>
        <div className="eyebrow mb-2" style={{ color: 'var(--official-blue)', fontSize: 11 }}>
          Seattle Police Department · King County Medical Examiner
        </div>
        <p className="font-serif font-semibold text-lg" style={{ color: 'var(--ink-strong)' }}>
          Official ruling, Seattle PD Case #94-108620 (1994). Manner of death, suicide. King County
          Medical Examiner, cause, contact gunshot wound to the head. Self-inflicted.
        </p>
        <p className="mt-2 text-base" style={{ color: 'var(--ink-soft)' }}>
          This model tests Andrew's hypothesis against the public record. It does not assert an
          alternative to the official ruling. All probability outputs are model estimates, not
          forensic findings.
        </p>
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
                  <p className="text-[15px] leading-snug" style={{ color: 'var(--ink-soft)' }}>
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
            <div
              className="font-mono text-[10px] mb-3 px-2 py-1.5 rounded-sm"
              style={{ background: 'var(--paper-deep)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)' }}
            >
              Source → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Sources (23 long-tail)', desc: 'Investigator archives, documentary transcripts, true-crime podcast feeds, FOIA portals, news microfilm. Not available in any standard connector catalog.' },
                { label: 'Fivetran Connector SDK', desc: 'Every CDC row landed into Iceberg (MDLS) on S3 in open Apache Iceberg format. One copy of the bytes, source-type and provenance preserved.' },
                { label: 'Iceberg (MDLS) on S3', desc: 'Snowflake, Athena, and Trino read the same Iceberg bytes via external catalogs. No copies, no extracts — multi-engine reads against a single open table.' },
                { label: 'dbt Labs (bronze → silver → gold)', desc: 'Fivetran Transformations triggers dbt Labs the moment the source sync finishes. Bronze → silver → gold stays in Iceberg. dbt-wizard run-time agents extract entities, claims, and attributions inside the dbt graph.' },
                { label: 'React surface', desc: 'gold.fct_claim · gold.dim_suspect · gold.fct_witness_attribution · gold.fct_timeline_anchor materialize the suspect scoring, hypothesis, and timeline pages here.' },
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
                    <div className="text-[15px]" style={{ color: 'var(--ink-soft)' }}>{item.desc}</div>
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
            <div className="text-[15px] mt-1" style={{ color: 'var(--ink-soft)' }}>{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
