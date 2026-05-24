/*
 * Page 3: Suspect Scoring
 * 11 suspect cards with probability scores. Grounded/Ungrounded toggle.
 * Sensitivity sliders for feature weights.
 * Distinct visual treatment for the baseline (Kurt Cobain / official ruling).
 */

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SUSPECTS } from '../data/suspects';
import {
  scoreSuspect,
  DEFAULT_WEIGHTS,
  ARCHETYPE_PRIORS,
  ARCHETYPE_PRIOR_RATIONALE,
  type FeatureWeights,
  type ScoreResult,
} from '../data/scoring';
import ForestPlot from '../components/ForestPlot';
import SuspectMentionQualityChart from '../components/SuspectMentionQualityChart';
import GroundedUngroundedChart from '../components/GroundedUngroundedChart';

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

// Archetype → visual accent
const ARCHETYPE_STYLE: Record<string, { accent: string; badgeBg: string; badgeText: string; labelText: string }> = {
  baseline:    { accent: '#4a90a4', badgeBg: 'rgba(74,144,164,0.10)', badgeText: '#4a90a4', labelText: 'Official ruling' },
  primary:     { accent: 'var(--caution)', badgeBg: 'var(--caution-bg)', badgeText: 'var(--caution)', labelText: 'Primary suspect' },
  secondary:   { accent: 'var(--amber)', badgeBg: 'var(--amber-bg)', badgeText: 'var(--amber-dim)', labelText: 'Named suspect' },
  witness:     { accent: '#7ab0e0', badgeBg: 'rgba(122,176,224,0.10)', badgeText: '#4a78a0', labelText: 'Witness / informant' },
  commentator: { accent: 'var(--slate)', badgeBg: 'rgba(108,120,140,0.08)', badgeText: 'var(--slate)', labelText: 'Commentator' },
  unknown:     { accent: '#a07850', badgeBg: 'rgba(160,120,80,0.10)', badgeText: '#a07850', labelText: 'Unknown assailant' },
};

function ProbBar({ probability, ciLower, ciUpper, grounded, accent }: {
  probability: number; ciLower: number; ciUpper: number; grounded: boolean; accent: string;
}) {
  const pPct = Math.round(probability * 100);
  const loPct = Math.round(ciLower * 100);
  const hiPct = Math.round(ciUpper * 100);

  return (
    <div className="mt-2">
      <div className="flex items-baseline gap-2 mb-1">
        <span className="font-mono text-2xl font-bold" style={{ color: accent }}>
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
          style={{ width: `${pPct}%`, background: accent }}
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

// Renders a feature log-LR contribution row.
// log_LR is the raw log-likelihood-ratio contribution; barWidth is normalized for display.
function FeatureRow({ label, log_LR, barWidth }: {
  label: string; log_LR: number; barWidth: number;
}) {
  const isNegative = log_LR < 0;
  const displayPct = Math.min(100, Math.round(Math.abs(barWidth) * 100));
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
            width: `${displayPct}%`,
            background: isNegative ? 'var(--alert)' : 'var(--amber)',
            opacity: 0.8,
          }}
        />
      </div>
      <div className="font-mono text-[10px] w-14 text-right" style={{ color: isNegative ? 'var(--alert)' : 'var(--ink-muted)' }}>
        {isNegative ? '' : '+'}{log_LR.toFixed(2)} LR
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
  const style = ARCHETYPE_STYLE[suspect.archetype] ?? ARCHETYPE_STYLE['secondary'];
  const isBaseline = suspect.archetype === 'baseline';

  return (
    <div
      className="case-card overflow-hidden"
      style={isBaseline ? { border: `1.5px solid ${style.accent}`, boxShadow: `0 0 0 1px ${style.accent}22` } : {}}
    >
      <div
        className="px-5 py-4 border-b flex items-start gap-3"
        style={{
          borderColor: 'var(--hairline)',
          background: isBaseline ? `${style.accent}0d` : 'var(--paper-deep)',
        }}
      >
        {/* Initials badge */}
        <div
          className="h-12 w-12 rounded-sm flex items-center justify-center font-mono font-bold text-lg shrink-0"
          style={{
            background: 'var(--slate-deep)',
            color: style.accent,
            border: `1.5px solid ${style.accent}55`,
          }}
        >
          {suspect.initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-serif font-bold text-xl" style={{ color: 'var(--ink-strong)' }}>
              {suspect.name}
            </span>
            {isBaseline && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
                style={{ background: style.badgeBg, borderColor: `${style.accent}55`, color: style.badgeText }}
              >
                OFFICIAL RULING
              </span>
            )}
            {!isBaseline && (
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
                style={{
                  background: rank === 1 ? style.badgeBg : 'var(--paper-deep)',
                  borderColor: rank === 1 ? `${style.accent}55` : 'var(--hairline)',
                  color: rank === 1 ? style.badgeText : 'var(--ink-soft)',
                }}
              >
                #{rank}
              </span>
            )}
            <span
              className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border"
              style={{ background: style.badgeBg, borderColor: `${style.accent}33`, color: style.badgeText }}
            >
              {style.labelText}
            </span>
          </div>
          <div className="text-sm mt-0.5" style={{ color: 'var(--ink-muted)' }}>{suspect.role}</div>
          <div className="eyebrow mt-1" style={{ fontSize: 9 }}>{suspect.label}</div>
        </div>
      </div>

      <div className="px-5 py-4">
        {/* Prior badge */}
        {grounded && (
          <div className="mb-2 flex items-center gap-2 flex-wrap">
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-sm border" style={{ background: style.badgeBg, borderColor: `${style.accent}44`, color: style.badgeText }}>
              prior = {(result.prior * 100).toFixed(1)}%
            </span>
            <span className="font-mono text-[10px]" style={{ color: 'var(--ink-soft)' }}>
              {style.labelText}
            </span>
          </div>
        )}

        {isBaseline && (
          <div
            className="mb-3 p-2 rounded-sm border text-xs font-mono"
            style={{ background: `${style.accent}0a`, borderColor: `${style.accent}33`, color: style.accent }}
          >
            P(official ruling holds | corpus) — null hypothesis. Only contradictions (Burnett &amp;
            Wilkins 2026, Grant archive) update this from the 0.94 prior. A score below 90%
            means the corpus challenges carry measurable weight.
          </div>
        )}

        <ProbBar
          probability={result.probability}
          ciLower={result.ci_lower}
          ciUpper={result.ci_upper}
          grounded={grounded}
          accent={style.accent}
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
            <div className="eyebrow mb-2" style={{ fontSize: 9 }}>Log-LR contributions (logit prior {result.logit_prior.toFixed(2)} + {result.sum_log_LR.toFixed(2)} = {result.logit_posterior.toFixed(2)})</div>
            {result.feature_lr_detail.map((d) => (
              <FeatureRow
                key={d.feature}
                label={d.feature}
                log_LR={d.log_LR_contribution}
                barWidth={Math.abs(d.log_LR_contribution) / 3}
              />
            ))}
          </div>
        )}

        {suspect.sourceNote && (
          <div
            className="mt-3 p-3 rounded-sm border text-xs"
            style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--slate)' }}
          >
            <span className="font-mono font-semibold">Source note: </span>{suspect.sourceNote}
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
      result: scoreSuspect(s.features, weights, grounded, s.archetype),
    }));
  }, [weights, grounded]);

  // Separate baseline from the rest for ranking purposes
  const baseline = scores.find((s) => s.suspect.archetype === 'baseline');
  const nonBaseline = scores.filter((s) => s.suspect.archetype !== 'baseline');

  const ranked = useMemo(() => {
    return [...nonBaseline].sort((a, b) => b.result.probability - a.result.probability);
  }, [nonBaseline]);

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
        Bayesian log-likelihood-ratio model across 11 suspects and archetypes. Each score is a
        posterior probability: logit(prior) + sum of per-feature log-LRs, passed through sigmoid.
        Output is a model estimate — not a forensic determination. The official ruling is suicide.
        Toggle Grounded mode off to see what the model looks like without Fivetran.
      </p>

      {/* Chart 5: Forest plot — headline chart */}
      <ForestPlot grounded={grounded} />

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

      {/* Chart 6: Grounded vs Ungrounded paired comparison — near the toggle */}
      <GroundedUngroundedChart />

      {/* ── Sensitivity sliders ── */}
      {showSliders && (
        <div className="case-card p-5 mb-8">
          <div className="eyebrow mb-3">Feature weight sensitivity</div>
          <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
            Adjust the weight each feature contributes to the scoring model. Drag any slider to
            argue with the model's assumptions. Changes apply immediately to all 11 suspect cards.
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

      {/* Chart 3: Suspect mention distribution by source quality — above suspect cards */}
      <SuspectMentionQualityChart />

      {/* ── Baseline card (Kurt Cobain / official ruling) ── */}
      {baseline && (
        <div className="mb-6">
          <div className="eyebrow mb-3" style={{ color: '#4a90a4' }}>
            Null hypothesis baseline — official ruling
          </div>
          <div className="grid grid-cols-1">
            <SuspectCard
              suspect={baseline.suspect}
              result={baseline.result}
              grounded={grounded}
              rank={0}
            />
          </div>
        </div>
      )}

      {/* ── Suspect cards grid — 3 per row on desktop ── */}
      <div className="eyebrow mb-3">Alternative-theory suspects — ranked by model score</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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

      {/* ── Model Card ── */}
      <ModelCard />
    </div>
  );
}

function ModelCard() {
  const [showBootstrap, setShowBootstrap] = useState(false);
  const [showPriors, setShowPriors] = useState(false);
  const [showFormula, setShowFormula] = useState(false);

  const archetypes = Object.entries(ARCHETYPE_PRIORS) as [keyof typeof ARCHETYPE_PRIORS, number][];

  return (
    <div className="mt-8 case-card p-5">
      <div className="eyebrow mb-3" style={{ fontSize: 10 }}>Model card — scoring methodology and calibration</div>

      {/* Calibration disclosure */}
      <div className="mb-4 p-4 rounded-sm border text-sm" style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--ink-muted)' }}>
        <p className="mb-2"><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>What these scores are:</span> Bayesian posterior probabilities derived from archetype priors updated by corpus-derived log-likelihood ratios. They are evidence-weight scores normalized to [0,1].</p>
        <p className="mb-2"><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>What these scores are not:</span> Verdicts. Forensic determinations. Empirical frequencies. Accusations. Higher score means more evidence weight in the corpus, not more likely guilty.</p>
        <p className="mb-2"><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Cobain baseline:</span> Scored as P(official ruling holds | corpus). Only contradictions (Burnett &amp; Wilkins 2026, Grant archive) update the prior. A score of 82% means the 2026 forensic challenges are measurable but do not overturn the prior weight of the official ruling.</p>
        <p className="mb-2"><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>No test set:</span> The model has no out-of-sample validation. Scores are descriptive, not predictive. Rank order is more stable than absolute probabilities.</p>
        <p><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Known biases:</span> Corpus is dominated by conspiracy literature (Grant archive, documentaries, Halperin). English-language only. No audio NLP. No forensic lab data.</p>
      </div>

      {/* Priors accordion */}
      <button type="button" onClick={() => setShowPriors((s) => !s)}
        className="mb-2 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border"
        style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}>
        {showPriors ? 'Hide' : 'Show'} archetype priors
      </button>
      {showPriors && (
        <div className="mb-4 overflow-x-auto">
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th>Archetype</th>
                <th className="num">Prior</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {archetypes.map(([arch, prior]) => (
                <tr key={arch}>
                  <td className="font-mono">{arch}</td>
                  <td className="num font-mono">{(prior * 100).toFixed(1)}%</td>
                  <td className="text-xs" style={{ color: 'var(--ink-muted)' }}>{ARCHETYPE_PRIOR_RATIONALE[arch]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Formula accordion */}
      <button type="button" onClick={() => setShowFormula((s) => !s)}
        className="mb-2 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border"
        style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}>
        {showFormula ? 'Hide' : 'Show'} scoring formula
      </button>
      {showFormula && (
        <pre className="mb-4 p-4 rounded-sm text-[12px] overflow-x-auto"
          style={{ background: '#0a1020', color: '#d0e0f0', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6 }}>
{`-- Bayesian log-LR scoring formula
--
-- 1. Archetype prior: p0 ∈ {0.001, 0.005, 0.02, 0.04, 0.94}
-- 2. logit(prior) = log(p0 / (1 - p0))
--
-- 3. For each feature f with normalized value v ∈ [0,1]:
--      log_LR(f) = scale_f * (v - v0_f)
--    where v0_f is the expected value under the not-involved hypothesis.
--    Witness/commentator: log_LR capped at ±0.5 per feature.
--
-- 4. For baseline (Cobain) archetype:
--      Only corpus_challenges (contradictions) update the prior.
--      Supporting features are already encoded in the 0.94 prior.
--
-- 5. logit(posterior) = logit(prior) + Σ log_LR(features)
-- 6. P_posterior = sigmoid(logit(posterior)) = 1 / (1 + exp(-logit(posterior)))
--
-- Feature scales (log-LR per unit deviation from v0):
--   motive:        scale=1.8, v0=0.15
--   means:         scale=1.8, v0=0.15
--   opportunity:   scale=1.8, v0=0.15
--   corroboration: scale=1.5, v0=0.15
--   timeline:      scale=1.2, v0=0.15
--   investigator:  scale=2.0, v0=0.05  (normalized to 20 max)
--   contradiction: scale=1.5, v0=0.0   (always negative; normalized to 15 max)
--   mention_count: scale=0.8, v0=0.05  (normalized to 5000 max)
--   baseline only: corpus_challenges scale=3.0 on contradiction_count/15`}
        </pre>
      )}

      {/* Bootstrap CI accordion */}
      <button type="button" onClick={() => setShowBootstrap((s) => !s)}
        className="mb-2 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border"
        style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}>
        {showBootstrap ? 'Hide' : 'Show'} how we computed the confidence intervals
      </button>
      {showBootstrap && (
        <div className="p-4 rounded-sm border text-sm" style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--ink-muted)' }}>
          <p className="mb-2 font-mono font-semibold" style={{ color: 'var(--slate)' }}>Bootstrap procedure (n=500)</p>
          <ol className="list-decimal list-inside space-y-1 text-sm">
            <li>From each suspect's claim set, count corroborating claims (c) and contradicting claims (k).</li>
            <li>Treat the corroboration density as a Bayesian posterior: Beta(α = c+1, β = k+1).</li>
            <li>Draw 500 samples from this Beta distribution. Each sample represents a plausible corroboration-density value given the observed claim counts.</li>
            <li>For each sample, scale the corroboration log-LR proportionally and recompute the full score.</li>
            <li>Report the 2.5th and 97.5th percentiles of the 500 recomputed probabilities as the 95% CI.</li>
          </ol>
          <p className="mt-2 text-xs" style={{ color: 'var(--slate)' }}>
            Note: CI width reflects uncertainty in corroboration density, not all model uncertainty.
            Suspects with high claim counts have tighter CIs; suspects with few claims have wider CIs.
            The Beta sampler uses the Marsaglia-Tsang (2000) gamma algorithm.
          </p>
        </div>
      )}
    </div>
  );
}
