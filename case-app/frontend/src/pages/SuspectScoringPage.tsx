/*
 * Page 3: Suspect Scoring
 * Four suspect cards with probability scores. Grounded/Ungrounded toggle.
 * Sensitivity sliders for feature weights.
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SUSPECTS } from '../data/suspects';
import {
  scoreSuspect,
  DEFAULT_WEIGHTS,
  type FeatureWeights,
  type ScoreResult,
} from '../data/scoring';

const WEIGHT_LABELS: { key: keyof FeatureWeights; label: string; desc: string }[] = [
  { key: 'motive',               label: 'Motive weight',               desc: 'Financial, personal, professional motive mentions' },
  { key: 'means',                label: 'Means weight',                 desc: 'Documented access to firearm / drug supply' },
  { key: 'opportunity',          label: 'Opportunity weight',           desc: 'Documented proximity to scene, April 5–8' },
  { key: 'corroboration',        label: 'Corroboration weight',         desc: 'Independent sources making the same claim' },
  { key: 'timeline',             label: 'Timeline proximity weight',    desc: 'Claimed presence within the death window' },
  { key: 'investigator',         label: 'Investigator named weight',    desc: 'Times named in Grant materials / court filings' },
  { key: 'mention_count',        label: 'Mention count weight',         desc: 'Total corpus references (raw volume)' },
  { key: 'contradiction_penalty', label: 'Contradiction penalty',       desc: 'Published contradictions, alibis, counter-evidence' },
];

function ProbBar({ probability, ciLower, ciUpper, grounded }: {
  probability: number; ciLower: number; ciUpper: number; grounded: boolean;
}) {
  const pPct = Math.round(probability * 100);
  const loPct = Math.round(ciLower * 100);
  const hiPct = Math.round(ciUpper * 100);

  const barColor = probability > 0.45
    ? 'var(--caution)'
    : probability > 0.30
    ? 'var(--amber)'
    : 'var(--fog)';

  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-2xl font-bold" style={{ color: barColor }}>
          {pPct}%
        </span>
        <span className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
          {grounded
            ? `95% CI [${loPct}%, ${hiPct}%]`
            : '95% CI [8%, 52%] — ungrounded prior'}
        </span>
      </div>
      {/* Main bar */}
      <div
        className="relative h-3 rounded-full overflow-visible"
        style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline)' }}
      >
        <div
          className="absolute top-0 left-0 h-full rounded-full prob-bar-fill"
          style={{ width: `${pPct}%`, background: barColor }}
        />
        {/* CI whiskers */}
        {grounded && (
          <>
            <div
              className="absolute top-0 h-full border-l-2"
              style={{ left: `${loPct}%`, borderColor: 'rgba(0,0,0,0.25)' }}
            />
            <div
              className="absolute top-0 h-full border-l-2"
              style={{ left: `${hiPct}%`, borderColor: 'rgba(0,0,0,0.25)' }}
            />
          </>
        )}
      </div>
      {grounded && (
        <div className="flex justify-between font-mono text-[10px] mt-0.5" style={{ color: 'var(--ink-soft)' }}>
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      )}
    </div>
  );
}

function FeatureRow({ label, value, contribution }: {
  label: string; value: number; contribution: number;
}) {
  const pct = Math.round(value * 100);
  const contrib = Math.round(Math.abs(contribution) * 100);
  const isNegative = contribution < 0;
  return (
    <div className="flex items-center gap-2 py-0.5">
      <div className="text-[11px] w-32 shrink-0 font-mono" style={{ color: 'var(--ink-muted)' }}>{label}</div>
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline-soft)' }}
      >
        <div
          className="h-full rounded-full"
          style={{
            width: `${pct}%`,
            background: isNegative ? 'var(--alert)' : 'var(--amber)',
            opacity: 0.8,
          }}
        />
      </div>
      <div className="font-mono text-[10px] w-8 text-right" style={{ color: isNegative ? 'var(--alert)' : 'var(--ink-muted)' }}>
        {isNegative ? `-${contrib}` : `+${contrib}`}
      </div>
    </div>
  );
}

function SuspectCard({
  suspect, result, grounded, rank,
}: {
  suspect: typeof SUSPECTS[0];
  result: ScoreResult;
  grounded: boolean;
  rank: number;
}) {
  return (
    <div className="case-card overflow-hidden">
      <div
        className="px-5 py-4 border-b flex items-start gap-3"
        style={{ borderColor: 'var(--hairline)', background: 'var(--paper-deep)' }}
      >
        {/* Initials badge */}
        <div
          className="h-12 w-12 rounded-sm flex items-center justify-center font-mono font-bold text-lg shrink-0"
          style={{
            background: 'var(--slate-deep)',
            color: 'var(--amber)',
            border: '1.5px solid var(--slate-soft)',
          }}
        >
          {suspect.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-xl" style={{ color: 'var(--ink-strong)' }}>
              {suspect.name}
            </span>
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
              style={{
                background: rank === 1 ? 'var(--amber-bg)' : 'var(--paper-deep)',
                borderColor: rank === 1 ? 'var(--amber-dim)' : 'var(--hairline)',
                color: rank === 1 ? 'var(--amber-dim)' : 'var(--ink-soft)',
              }}
            >
              #{rank}
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>{suspect.role}</div>
          <div className="eyebrow mt-1" style={{ fontSize: 9 }}>{suspect.label}</div>
        </div>
      </div>

      <div className="px-5 py-4">
        <ProbBar
          probability={result.probability}
          ciLower={result.ci_lower}
          ciUpper={result.ci_upper}
          grounded={grounded}
        />

        {!grounded && (
          <div
            className="mt-3 p-3 rounded-sm border text-sm"
            style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--slate)' }}
          >
            <span className="font-mono font-semibold">Ungrounded:</span> No corpus data is informing
            this score. All suspects score near the uniform prior (~25%). CIs span 8–52%. This is
            what AI looks like without Fivetran.
          </div>
        )}

        {grounded && (
          <div className="mt-4">
            <div className="eyebrow mb-2" style={{ fontSize: 9 }}>Feature contributions</div>
            <FeatureRow label="motive"      value={suspect.features.motive_strength_score}   contribution={result.feature_contributions.motive ?? 0} />
            <FeatureRow label="means"       value={suspect.features.means_score}             contribution={result.feature_contributions.means ?? 0} />
            <FeatureRow label="opportunity" value={suspect.features.opportunity_score}       contribution={result.feature_contributions.opportunity ?? 0} />
            <FeatureRow label="corroboration" value={suspect.features.corroboration_density} contribution={result.feature_contributions.corroboration ?? 0} />
            <FeatureRow label="timeline"    value={suspect.features.timeline_proximity}      contribution={result.feature_contributions.timeline ?? 0} />
            <FeatureRow label="investigator" value={Math.min(1, suspect.features.named_by_investigator_count / 20)} contribution={result.feature_contributions.investigator ?? 0} />
            <FeatureRow label="contradiction" value={Math.min(1, suspect.features.contradiction_count / 25)} contribution={result.feature_contributions.contradiction_penalty ?? 0} />
          </div>
        )}

        <div className="mt-4 flex items-center gap-2 flex-wrap">
          <span className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
            {suspect.features.mention_count_total.toLocaleString()} corpus mentions
          </span>
          {suspect.features.mention_count_under_oath > 0 && (
            <span className="source-chip sworn">{suspect.features.mention_count_under_oath} sworn</span>
          )}
          <span className="font-mono text-[11px]" style={{ color: 'var(--ink-soft)' }}>
            {suspect.features.named_by_investigator_count} investigator citations
          </span>
        </div>

        <Link
          to={`/suspect/${suspect.id}`}
          className="mt-4 inline-flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-wider rounded-sm px-3 py-1.5 border transition-colors"
          style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
        >
          Full profile
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
}

export default function SuspectScoringPage() {
  const [grounded, setGrounded] = useState(true);
  const [weights, setWeights] = useState<FeatureWeights>(DEFAULT_WEIGHTS);
  const [showSliders, setShowSliders] = useState(false);

  const scores = useMemo(() => {
    return SUSPECTS.map((s) => ({
      suspect: s,
      result: scoreSuspect(s.features, weights, grounded),
    }));
  }, [weights, grounded]);

  const ranked = useMemo(() => {
    return [...scores].sort((a, b) => b.result.probability - a.result.probability);
  }, [scores]);

  const setWeight = (key: keyof FeatureWeights, val: number) => {
    setWeights((w) => ({ ...w, [key]: val }));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · Suspect Scoring</div>
      <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink-strong)' }}>
        Probability scoring model
      </h1>
      <p className="text-lg max-w-3xl mb-6" style={{ color: 'var(--ink-muted)' }}>
        Weighted logistic combination of corpus-derived features. Output is a model estimate — not a
        forensic determination. The official ruling is suicide. Toggle Grounded mode off to see what
        the model looks like without Fivetran data behind it.
      </p>

      {/* ── Grounded / Ungrounded toggle ── */}
      <div
        className="mb-8 p-4 rounded-sm border flex items-center justify-between flex-wrap gap-4 sticky top-20 z-10"
        style={{ background: 'var(--card)', borderColor: 'var(--hairline)', boxShadow: '0 2px 8px rgba(44,51,64,0.08)' }}
      >
        <div className="flex items-center gap-4 flex-wrap">
          <div>
            <div className="eyebrow mb-0.5" style={{ fontSize: 10 }}>Data mode</div>
            <div className="font-serif font-semibold text-lg" style={{ color: 'var(--ink-strong)' }}>
              {grounded ? 'Grounded mode — Fivetran on' : 'Ungrounded mode — Fivetran off'}
            </div>
            <div className="text-sm" style={{ color: 'var(--ink-muted)' }}>
              {grounded
                ? 'Scores derived from corpus features. CIs reflect available evidence density.'
                : 'No corpus data. Scores collapse to ~uniform prior. CIs widen to 8–52%.'}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setGrounded((g) => !g)}
            className="inline-flex items-center gap-3 rounded-sm px-4 py-2 font-mono font-semibold text-sm border transition-colors"
            style={{
              background: grounded ? 'rgba(45, 90, 61, 0.08)' : 'rgba(139, 44, 44, 0.08)',
              borderColor: grounded ? '#a8d8b8' : '#f5c2c2',
              color: grounded ? 'var(--confirm)' : 'var(--alert)',
            }}
          >
            <span
              className="toggle-track"
              style={{ background: grounded ? 'var(--confirm)' : '#ddd' }}
            >
              <span
                className="toggle-thumb"
                style={{ transform: grounded ? 'translateX(20px)' : 'translateX(0px)' }}
              />
            </span>
            {grounded ? 'Fivetran on' : 'Fivetran off'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowSliders((s) => !s)}
          className="inline-flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider rounded-sm px-3 py-1.5 border transition-colors"
          style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
        >
          {showSliders ? 'Hide' : 'Show'} sensitivity sliders
        </button>
      </div>

      {/* ── Sensitivity sliders ── */}
      {showSliders && (
        <div className="case-card p-5 mb-8">
          <div className="eyebrow mb-3">Feature weight sensitivity</div>
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
            Adjust the weight each feature contributes to the scoring model. Drag any slider to
            argue with the model's assumptions. Changes apply immediately to all four suspect cards.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4">
            {WEIGHT_LABELS.map(({ key, label, desc }) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1">
                  <div>
                    <span className="font-mono text-[12px] font-semibold" style={{ color: 'var(--ink-strong)' }}>
                      {label}
                    </span>
                    <div className="text-[11px]" style={{ color: 'var(--ink-soft)' }}>{desc}</div>
                  </div>
                  <span className="font-mono text-[12px] font-bold ml-3" style={{ color: 'var(--amber-dim)' }}>
                    {weights[key].toFixed(2)}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="0.5"
                  step="0.01"
                  value={weights[key]}
                  onChange={(e) => setWeight(key, parseFloat(e.target.value))}
                  className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, var(--amber) 0%, var(--amber) ${(weights[key] / 0.5) * 100}%, var(--paper-deep) ${(weights[key] / 0.5) * 100}%, var(--paper-deep) 100%)`,
                    accentColor: 'var(--amber)',
                  }}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={() => setWeights(DEFAULT_WEIGHTS)}
            className="mt-4 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border"
            style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
          >
            Reset to defaults
          </button>
        </div>
      )}

      {/* ── Suspect cards grid ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {ranked.map(({ suspect, result }, idx) => (
          <SuspectCard
            key={suspect.id}
            suspect={suspect}
            result={result}
            grounded={grounded}
            rank={idx + 1}
          />
        ))}
      </div>

      {/* ── Model disclaimer ── */}
      <div
        className="mt-8 p-4 rounded-sm border text-sm"
        style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--ink-muted)' }}
      >
        <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Model note:</span>{' '}
        Probability outputs are weighted logistic combinations of corpus-derived feature scores. They
        represent the model's estimate given the available published evidence, not forensic findings.
        The official ruling is suicide (Seattle PD Case #94-108620, 1994; King County ME). No claim
        here constitutes a factual allegation. All evidence cited is from publicly available sources.
      </div>
    </div>
  );
}
