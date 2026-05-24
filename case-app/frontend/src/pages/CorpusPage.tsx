/*
 * Page 2: The Corpus
 * What Fivetran pulled in. Source inventory with examples per type.
 */

import { CORPUS_STATS, SOURCES } from '../data/suspects';

const SOURCE_EXAMPLES = [
  {
    type: 'Books',
    chipClass: 'book',
    count: 12,
    examples: [
      {
        title: 'Heavier Than Heaven',
        author: 'Charles R. Cross',
        year: 2001,
        publisher: 'Hyperion',
        notes: 'Authorized biography. Primary narrative source for timeline and personal relationships. Extensively sourced.',
        sworn: false,
      },
      {
        title: 'Love & Death: The Murder of Kurt Cobain',
        author: 'Ian Halperin & Max Wallace',
        year: 2004,
        publisher: 'Atria Books',
        notes: 'Presents a murder hypothesis; primary source for the financial motive argument. Authors acknowledge the hypothesis is unproven.',
        sworn: false,
      },
      {
        title: 'Come As You Are: The Story of Nirvana',
        author: 'Michael Azerrad',
        year: 1993,
        publisher: 'Doubleday',
        notes: 'Pre-death authorized biography. Useful for establishing relationships and context prior to 1994.',
        sworn: false,
      },
    ],
  },
  {
    type: 'FOIA / Official Records',
    chipClass: 'foia',
    count: 38,
    examples: [
      {
        title: 'Seattle PD Case #94-108620 Final Report',
        author: 'Seattle Police Department',
        year: 1994,
        publisher: 'City of Seattle (FOIA release)',
        notes: 'Primary official record. Documents the scene, shotgun purchase records, witness statements taken by SPD. Ruling: suicide.',
        sworn: true,
      },
      {
        title: 'King County Medical Examiner Autopsy Report',
        author: 'King County ME Office',
        year: 1994,
        publisher: 'King County (FOIA release)',
        notes: 'Cause of death: contact gunshot wound to the head. Manner: suicide. Toxicology included. Self-inflicted ruling.',
        sworn: true,
      },
    ],
  },
  {
    type: 'Documentaries',
    chipClass: 'documentary',
    count: 9,
    examples: [
      {
        title: 'Kurt & Courtney',
        author: 'Nick Broomfield (director)',
        year: 1998,
        publisher: 'Lafayette Films',
        notes: 'Contains the El Duce (Eldon Hoke) interview. El Duce died in a train accident two days after filming. Broomfield\'s own assessment notes the claim is unverified.',
        sworn: false,
      },
      {
        title: 'Soaked in Bleach',
        author: 'Benjamin Statler (director)',
        year: 2015,
        publisher: 'Black Market Entertainment',
        notes: 'Documentary built around Tom Grant\'s recorded phone conversations. Presents the murder hypothesis most fully. Not an evidentiary proceeding.',
        sworn: false,
      },
      {
        title: 'The Cobain Case',
        author: 'Benjamin Statler (director)',
        year: 2015,
        publisher: 'Black Market Entertainment',
        notes: 'Companion piece to Soaked in Bleach; focuses on SPD investigation methodology questions raised by Grant.',
        sworn: false,
      },
    ],
  },
  {
    type: 'Podcasts / Audio',
    chipClass: 'podcast',
    count: 64,
    examples: [
      {
        title: 'Tom Grant Interview Archives',
        author: 'Tom Grant',
        year: 1994,
        publisher: 'tomgrant.com (self-published)',
        notes: 'Audio recordings, transcripts, and written summaries of Grant\'s investigation, published on his website. Self-produced; not peer-reviewed or sworn.',
        sworn: false,
      },
      {
        title: 'El Duce Interview Audio Tape',
        author: 'Eldon Hoke (El Duce)',
        year: 1998,
        publisher: 'Original tape, used in Kurt & Courtney (Broomfield)',
        notes: 'Unedited audio. Corpus extracts the named allegations as claim objects attributed to El Duce, not as facts.',
        sworn: false,
      },
    ],
  },
  {
    type: 'News Archives',
    chipClass: 'news',
    count: 312,
    examples: [
      {
        title: 'Seattle Times, April 1994 coverage',
        author: 'Seattle Times staff',
        year: 1994,
        publisher: 'Seattle Times',
        notes: 'Contemporaneous reporting. Includes day-of discovery reports, memorial coverage, and initial SPD statements.',
        sworn: false,
      },
      {
        title: 'Rolling Stone, "The Real Kurt Cobain"',
        author: 'Rolling Stone staff',
        year: 1994,
        publisher: 'Rolling Stone',
        notes: 'Post-death profile. Contemporaneous accounts of the Seattle music community\'s reaction.',
        sworn: false,
      },
    ],
  },
  {
    type: 'Investigator Notes',
    chipClass: 'investigator',
    count: 405,
    examples: [
      {
        title: 'Tom Grant Published Investigation Notes',
        author: 'Tom Grant',
        year: 1994,
        publisher: 'tomgrant.com',
        notes: 'The largest single corpus source by document count. Named person references, timeline claims, and source attributions extracted via Cortex. All extracted as allegations.',
        sworn: false,
      },
    ],
  },
];

const CONNECTOR_SOURCES = [
  'Tom Grant investigator archive (tomgrant.com)',
  'Internet Archive — documentary transcript deposits',
  'PACER — related civil case filings',
  'King County Records Portal — FOIA releases',
  'Seattle Municipal Archives — SPD case record exports',
  'Spotify Podcasts API — true-crime episode transcripts',
  'YouTube Data API — documentary interview captions',
  'Google Books API — biography full-text (licensed)',
  'Wayback Machine CDX — archived news pages',
  'Open Library — Cobain-related book metadata',
  'ProQuest Historical Newspapers — Seattle Times archives',
  'Factiva — Rolling Stone, NME, Melody Maker archives',
  'Lexis+ — legal filings related to the estate',
];

export default function CorpusPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · The Corpus</div>
      <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink-strong)' }}>
        What Fivetran pulled in
      </h1>
      <p className="text-lg max-w-3xl mb-8" style={{ color: 'var(--ink-muted)' }}>
        The Cobain case has no enterprise data source. Its primary record lives in unstructured form —
        books, government FOIA releases, documentary transcripts, investigator self-published archives,
        news microfilm, and podcast audio. Fivetran Connector SDK is the ingestion layer for all 23
        long-tail sources that don't have a standard connector.
      </p>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total documents', val: CORPUS_STATS.totalDocuments.toLocaleString(), color: 'var(--ink-strong)' },
          { label: 'Total claims extracted', val: CORPUS_STATS.totalClaims.toLocaleString(), color: 'var(--ink-strong)' },
          { label: 'Connector SDK sources', val: CORPUS_STATS.connectorSdkSources, color: 'var(--amber-dim)' },
          { label: 'Source types', val: CORPUS_STATS.sourceBreakdown.length, color: 'var(--slate)' },
        ].map((t) => (
          <div key={t.label} className="case-card p-4">
            <div className="eyebrow mb-1" style={{ fontSize: 10 }}>{t.label}</div>
            <div className="font-mono text-3xl font-bold" style={{ color: t.color }}>{t.val}</div>
          </div>
        ))}
      </div>

      {/* Source type inventory */}
      <div className="eyebrow mb-4">Source type inventory</div>
      <div className="flex flex-col gap-5 mb-10">
        {SOURCE_EXAMPLES.map((group) => (
          <div key={group.type} className="case-card overflow-hidden">
            <div
              className="px-5 py-3 flex items-center justify-between border-b"
              style={{ borderColor: 'var(--hairline)', background: 'var(--paper-deep)' }}
            >
              <div className="flex items-center gap-3">
                <span className={`source-chip ${group.chipClass}`}>{group.type}</span>
                <span className="font-serif font-semibold" style={{ color: 'var(--ink-strong)' }}>{group.type}</span>
              </div>
              <div className="font-mono font-bold text-lg" style={{ color: 'var(--amber-dim)' }}>
                {group.count.toLocaleString()}
              </div>
            </div>
            <div className="divide-y" style={{ borderColor: 'var(--hairline-soft)' }}>
              {group.examples.map((ex) => (
                <div key={ex.title} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-3 flex-wrap mb-1">
                    <div>
                      <span className="font-semibold" style={{ color: 'var(--ink-strong)' }}>
                        {ex.title}
                      </span>
                      <span className="text-sm ml-2" style={{ color: 'var(--ink-muted)' }}>
                        {ex.author}, {ex.year}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {ex.sworn && <span className="source-chip sworn">Sworn</span>}
                      <span className="source-chip" style={{ background: 'var(--paper-deep)', color: 'var(--ink-soft)', border: '1px solid var(--hairline)' }}>
                        {ex.publisher}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{ex.notes}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Connector SDK sources */}
      <div className="case-card p-5 mb-10">
        <div className="eyebrow mb-3">Connector SDK — long-tail sources ({CONNECTOR_SOURCES.length} of 23)</div>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
          These sources have no Fivetran-managed connector. Each is a custom Connector SDK implementation
          that pulls raw bytes into Iceberg. The SDK pattern is the same whether the source is a Salesforce
          instance or an investigator's personal archive website.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {CONNECTOR_SOURCES.map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{ background: 'var(--amber)' }}
              />
              <span className="font-mono text-[12px]" style={{ color: 'var(--ink-muted)' }}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Gold layer models */}
      <div className="eyebrow mb-3">Gold layer models (dbt)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { model: 'gold.fct_claim', desc: 'One row per extracted claim. Source type, named person, claim text, sworn flag, confidence score from Cortex.' },
          { model: 'gold.dim_suspect', desc: 'Suspect dimension: name, role, corpus mention counts, feature scores used by the probability model.' },
          { model: 'gold.fct_witness_attribution', desc: 'Claims attributed to named witnesses or sources. Joins to fct_claim. Filters to sworn vs unsworn.' },
          { model: 'gold.fct_timeline_anchor', desc: 'Resolved timeline events with corroboration counts. April 5–8, 1994 window and surrounding context.' },
        ].map((m) => (
          <div key={m.model} className="case-card p-4">
            <div className="font-mono text-[12px] font-bold mb-1" style={{ color: 'var(--amber-dim)' }}>
              {m.model}
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{m.desc}</p>
          </div>
        ))}
      </div>

      {/* Freshness */}
      <div className="mt-6 flex items-center gap-3">
        <span className="status-pill neutral">Corpus freshness</span>
        <span className="font-mono text-[12px]" style={{ color: 'var(--ink-muted)' }}>
          Last ingestion run: {CORPUS_STATS.freshness}
        </span>
        <span
          className="h-2 w-2 rounded-full"
          style={{ background: 'var(--confirm)', animation: 'signal-pulse 2s ease-in-out infinite' }}
        />
        <span className="font-mono text-[11px]" style={{ color: 'var(--confirm)' }}>Live</span>
      </div>

      {/* Source citations for SOURCES in data file */}
      <div className="mt-8 case-card p-5">
        <div className="eyebrow mb-3" style={{ fontSize: 10 }}>All corpus sources</div>
        <table className="data-table">
          <thead>
            <tr>
              <th>Source ID</th>
              <th>Label</th>
              <th>Type</th>
              <th>Year</th>
              <th>Sworn</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SOURCES).map((s) => (
              <tr key={s.id}>
                <td className="font-mono text-[11px]" style={{ color: 'var(--amber-dim)' }}>{s.id}</td>
                <td>{s.label}</td>
                <td><span className={`source-chip ${s.type}`}>{s.type}</span></td>
                <td className="num">{s.year}</td>
                <td>
                  {s.sworn
                    ? <span className="source-chip sworn">Yes</span>
                    : <span className="text-sm" style={{ color: 'var(--ink-soft)' }}>No</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
