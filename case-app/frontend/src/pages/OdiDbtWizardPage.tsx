/*
 * Page 7 (entry): dbt-wizard
 * Andrew asks an ad-hoc question the gold layer doesn't yet answer.
 * Links to the live playback page.
 */

import { useNavigate } from 'react-router-dom';

const SAMPLE_QUESTIONS = [
  'Rank the full 11-suspect slate by probability score — include the 2026 Burnett and Wilkins forensic claims as a scored input. Which suspects does the new evidence move the most, and does the joint hypothesis for Carlson, Michaelson, and Lanegan change?',
  'Cross-reference Tom Grant\'s notes with El Duce\'s published interviews — where do claimed timeline anchors overlap?',
  'How many independent unsworn sources allege financial motive vs how many sworn sources corroborate it?',
];

const EXAMPLE_MARTS = [
  { name: 'gold.fct_suspect_ranked_probability_v2', status: 'In this demo', desc: 'Ranks all 11 suspects by probability score integrating Burnett & Wilkins (2026) forensic claims. One row per (suspect_id, model_run_id).' },
  { name: 'gold.fct_grant_elduce_cross_reference', status: 'Existing', desc: 'Joins Grant archive claims with El Duce interview segments on named person and date.' },
  { name: 'gold.fct_claim_by_source_date', status: 'Existing', desc: 'One row per claim with source, date, and named-person attribution.' },
  { name: 'gold.fct_timeline_anchor', status: 'Existing', desc: 'Resolved timeline events with corroboration counts.' },
  { name: 'gold.dim_suspect', status: 'Existing', desc: 'Suspect dimension — 11 suspects with corpus feature scores and archetypes.' },
];

export default function OdiDbtWizardPage() {
  const navigate = useNavigate();

  const launchWithQuestion = (q: string) => {
    navigate('/wizard-live', { state: { question: q } });
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · dbt-wizard</div>
      <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink-strong)' }}>
        Ad-hoc mart authoring in 90 seconds
      </h1>
      <p className="text-lg max-w-3xl mb-4" style={{ color: 'var(--ink-muted)' }}>
        Andrew asks a question the gold layer doesn't yet answer. Four sub-agents — Explorer, Summary,
        Worker, Verification — collaborate to author a new dbt mart, materialize it to Iceberg (MDLS),
        and run all tests. Fivetran Transformations triggers dbt Labs the moment the source sync
        finishes; bronze → silver → gold stays in Iceberg. No engineer required. Watch the live build.
      </p>
      <div
        className="font-mono text-[11px] mb-8 px-3 py-2 rounded-sm inline-block"
        style={{ background: 'var(--paper-deep)', color: 'var(--ink-muted)', border: '1px solid var(--hairline)' }}
      >
        Source → Fivetran → Iceberg (MDLS) → Snowflake / Athena / Trino → dbt Labs → React
      </div>

      {/* Scenario card */}
      <div
        className="case-card p-6 mb-8 border-l-4"
        style={{ borderLeftColor: 'var(--amber)' }}
      >
        <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Today's scenario</div>
        <p className="font-serif font-semibold text-xl mb-3" style={{ color: 'var(--ink-strong)' }}>
          "Rank the full 11-suspect slate by probability score — include the 2026 Burnett and Wilkins
          forensic claims as a scored input. Which suspects does the new evidence move the most?"
        </p>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
          The gold layer has the expanded dim_suspect (11 suspects) and the new stg_burnett_wilkins_2026
          staging model, but no mart versions them together with probability scores. The dbt-wizard builds
          {' '}<span className="font-mono" style={{ color: 'var(--amber-dim)' }}>gold.fct_suspect_ranked_probability_v2</span>{' '}
          in a single 92-second build run, including tests and YAML schema documentation.
        </p>
        <button
          type="button"
          onClick={() => launchWithQuestion(SAMPLE_QUESTIONS[0])}
          className="inline-flex items-center gap-2 rounded-sm font-semibold px-5 py-2.5 transition-colors"
          style={{ background: 'var(--amber)', color: 'var(--slate-deep)', fontSize: 14 }}
        >
          Watch the live build
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Sub-agents overview */}
      <div className="eyebrow mb-3">Four sub-agents</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {[
          { code: 'EXP', name: 'Explorer', color: '#7ab0e0', role: 'Finds the relevant staging models for the question. Starts from the analytic gap, not the file tree.' },
          { code: 'SUM', name: 'Summary', color: '#c8a860', role: 'Explains grain, join keys, and where the gap is. Decides before any SQL whether the data can answer the question.' },
          { code: 'WRK', name: 'Worker', color: '#c070a0', role: 'Authors the SQL file — CTEs, source joins, grain validation via dbt_show, materialization to Iceberg.' },
          { code: 'VER', name: 'Verification', color: '#5aaa80', role: 'Writes the YAML companion: tests, schema contract, ownership. Confirms tests pass, lineage updates.' },
        ].map((agent) => (
          <div key={agent.code} className="case-card p-4">
            <div
              className="h-12 w-12 rounded-sm flex items-center justify-center font-mono font-bold text-lg mb-3"
              style={{ background: 'var(--slate-deep)', color: agent.color, border: `1.5px solid ${agent.color}40` }}
            >
              {agent.code}
            </div>
            <div className="font-mono font-semibold text-sm mb-1" style={{ color: agent.color }}>
              {agent.name} Agent
            </div>
            <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>{agent.role}</p>
          </div>
        ))}
      </div>

      {/* Gold layer inventory */}
      <div className="eyebrow mb-3">Gold layer inventory</div>
      <table className="data-table case-card overflow-hidden mb-10">
        <thead>
          <tr>
            <th>Model</th>
            <th>Status</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          {EXAMPLE_MARTS.map((m) => (
            <tr key={m.name}>
              <td className="font-mono text-[12px]" style={{ color: 'var(--amber-dim)' }}>{m.name}</td>
              <td>
                <span
                  className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
                  style={{
                    background: m.status === 'In this demo' ? 'var(--amber-bg)' : 'var(--confirm-bg)',
                    borderColor: m.status === 'In this demo' ? 'var(--amber-dim)' : '#a8d8b8',
                    color: m.status === 'In this demo' ? 'var(--amber-dim)' : 'var(--confirm)',
                  }}
                >
                  {m.status}
                </span>
              </td>
              <td className="text-sm">{m.desc}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Other questions */}
      <div className="eyebrow mb-3">Try other questions</div>
      <div className="flex flex-col gap-3">
        {SAMPLE_QUESTIONS.slice(1).map((q) => (
          <div key={q} className="case-card p-4 flex items-start justify-between gap-4">
            <p className="text-sm font-serif" style={{ color: 'var(--ink)' }}>"{q}"</p>
            <button
              type="button"
              onClick={() => launchWithQuestion(q)}
              className="shrink-0 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider rounded-sm px-3 py-1.5 border transition-colors"
              style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
            >
              Launch
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
