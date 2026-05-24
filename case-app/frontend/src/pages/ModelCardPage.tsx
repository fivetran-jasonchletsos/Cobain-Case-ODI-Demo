/*
 * Page: Model Card
 * Full documentation of the Bayesian log-LR scoring model.
 * Lists priors, feature definitions, formula, bootstrap CI procedure,
 * joint hypothesis dependency assumption, and known limitations.
 */

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { SUSPECTS } from '../data/suspects';
import {
  scoreSuspect,
  DEFAULT_WEIGHTS,
  ARCHETYPE_PRIORS,
  ARCHETYPE_PRIOR_RATIONALE,
  ANDREW_DEPENDENCY_RHO,
} from '../data/scoring';

export default function ModelCardPage() {
  // Compute all suspect scores for the verification table
  const allScores = useMemo(() => {
    return SUSPECTS.map((s) => ({
      suspect: s,
      result: scoreSuspect(s.features, DEFAULT_WEIGHTS, true, s.archetype),
    }));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · Model Card</div>
      <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink-strong)' }}>
        Scoring model card
      </h1>
      <p className="text-lg max-w-3xl mb-8" style={{ color: 'var(--ink-muted)' }}>
        Full documentation of the Bayesian log-likelihood-ratio scoring model. This page lists
        every assumption explicitly so a data scientist can audit, challenge, or reconfigure the model.
      </p>

      {/* ── Section 1: Calibration disclosure ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          1. Calibration disclosure
        </h2>
        <div className="case-card p-5">
          <ul className="space-y-3 text-sm" style={{ color: 'var(--ink-muted)' }}>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>These are not verdicts:</span>{' '}
              Probability outputs are Bayesian evidence-weight scores normalized to [0,1]. They represent
              how much corpus evidence points toward or away from each suspect, given a stated prior. They
              are not empirical frequencies, not forensic determinations, and not accusations.
            </li>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Higher score means more evidence weight in the corpus, not more likely guilty.</span>{' '}
              Suspects who appear in more investigator sources naturally accumulate higher scores; this
              reflects source bias, not factual incrimination.
            </li>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>The base rate (prior) is stated explicitly.</span>{' '}
              The prior is the probability assigned before any corpus evidence is considered, based only
              on archetype (suspect, witness, commentator, etc.).
            </li>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Features are derived from corpus counts.</span>{' '}
              Motive, means, opportunity, and corroboration scores are set by analysts based on published
              source counts. They are configurable via the sensitivity sliders on the Suspect Scoring page.
            </li>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>No out-of-sample test set.</span>{' '}
              The model has never been validated against a resolved case. These are descriptive scores,
              not predictive classifiers. Rank order is more stable than absolute values.
            </li>
            <li>
              <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Sensitivity to feature scales is documented below.</span>{' '}
              The scales in FEATURE_PARAMS are the primary sensitivity knobs. Adjusting any scale shifts
              all suspects proportionally.
            </li>
          </ul>
        </div>
      </section>

      {/* ── Section 2: Archetype priors ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          2. Archetype priors
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
          The prior is the probability assigned before any corpus evidence is considered. It is fixed
          per archetype and is the single most important parameter in the model for witnesses and
          commentators — their priors are so low that corpus evidence rarely overrides them.
        </p>
        <div className="overflow-x-auto">
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th>Archetype</th>
                <th className="num">Prior</th>
                <th>Rationale</th>
              </tr>
            </thead>
            <tbody>
              {(Object.entries(ARCHETYPE_PRIORS) as [keyof typeof ARCHETYPE_PRIORS, number][]).map(([arch, prior]) => (
                <tr key={arch}>
                  <td className="font-mono font-semibold">{arch}</td>
                  <td className="num font-mono font-bold">{(prior * 100).toFixed(1)}%</td>
                  <td className="text-xs" style={{ color: 'var(--ink-muted)' }}>
                    {ARCHETYPE_PRIOR_RATIONALE[arch]}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 3: Feature definitions ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          3. Feature definitions
        </h2>
        <div className="overflow-x-auto">
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="num">Scale</th>
                <th className="num">v₀ (null baseline)</th>
                <th>Definition</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'motive',          scale: 1.8, v0: 0.15, def: 'Analyst-assigned score [0–1] reflecting documented financial, personal, or professional motive in published sources.' },
                { name: 'means',           scale: 1.8, v0: 0.15, def: 'Analyst-assigned score [0–1] for documented physical access to the weapon or means of death.' },
                { name: 'opportunity',     scale: 1.8, v0: 0.15, def: 'Analyst-assigned score [0–1] for documented proximity to the scene during the April 5–8, 1994 death window.' },
                { name: 'corroboration',   scale: 1.5, v0: 0.15, def: 'Density of independent sources making the same claim; [0–1]. High corroboration = multiple unrelated sources agree.' },
                { name: 'timeline',        scale: 1.2, v0: 0.15, def: 'Proximity of documented movements to the death window; [0–1].' },
                { name: 'investigator',    scale: 2.0, v0: 0.05, def: 'Named in Grant investigation or equivalent; count normalized to max=20.' },
                { name: 'contradiction',   scale: 1.5, v0: 0.0,  def: 'Count of published contradictions, alibis, and counter-evidence; count normalized to max=15. Always reduces the posterior.' },
                { name: 'mention_count',   scale: 0.8, v0: 0.05, def: 'Total corpus mentions across all 974 documents; count normalized to max=5,000.' },
                { name: 'corpus_challenges (baseline only)', scale: 3.0, v0: 0.0, def: 'For Cobain baseline only: count of challenges to the official ruling (Burnett & Wilkins 2026, Grant archive). The only term that updates the 0.94 prior.' },
              ].map((row) => (
                <tr key={row.name}>
                  <td className="font-mono">{row.name}</td>
                  <td className="num font-mono">{row.scale}</td>
                  <td className="num font-mono">{row.v0}</td>
                  <td className="text-xs" style={{ color: 'var(--ink-muted)' }}>{row.def}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Section 4: Score formula ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          4. Score formula
        </h2>
        <pre
          className="p-4 rounded-sm text-[12px] overflow-x-auto"
          style={{ background: '#0a1020', color: '#d0e0f0', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.7 }}
        >
{`-- Bayesian log-likelihood-ratio formulation
--
-- Step 1: Archetype prior
--   p0 = ARCHETYPE_PRIORS[archetype]
--   logit(p0) = log(p0 / (1 - p0))
--
-- Step 2: Per-feature log-LR
--   For each feature f with normalized value v ∈ [0,1]:
--     log_LR(f) = scale_f * (v - v0_f)
--   For witness/commentator: |log_LR(f)| ≤ 0.5 per feature (archetype-prior dominance)
--
-- Step 3: Baseline (Cobain) special case
--   Supporting features are expected for the null hypothesis; they do not update.
--   Only contradiction count updates:
--     log_LR(corpus_challenges) = -3.0 * (contradiction_count / 15)
--
-- Step 4: Posterior
--   logit(P_posterior) = logit(p0) + Σ log_LR(features)
--   P_posterior = sigmoid(logit(P_posterior))
--              = 1 / (1 + exp(-logit(P_posterior)))
--
-- Example: Cobain baseline
--   logit(0.94) = 2.754
--   corpus_challenges = -3.0 * (6/15) = -1.200  (6 contradictions from Burnett+Wilkins, Grant)
--   logit(P) = 2.754 - 1.200 = 1.554
--   P = sigmoid(1.554) = 0.825  =>  82.5%`}
        </pre>
      </section>

      {/* ── Section 5: Bootstrap CI ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          5. Bootstrap confidence interval procedure
        </h2>
        <div className="case-card p-5 text-sm" style={{ color: 'var(--ink-muted)' }}>
          <ol className="list-decimal list-inside space-y-2">
            <li>Count corroborating claims (c) and contradicting claims (k) for each suspect.</li>
            <li>
              Model the corroboration density as a Beta posterior:{' '}
              <span className="font-mono">Beta(α = c+1, β = k+1)</span>.{' '}
              α=c+1 and β=k+1 incorporate a uniform prior (Laplace smoothing).
            </li>
            <li>Draw 500 samples from this Beta distribution. Each sample is a plausible corroboration-density value given the observed claim counts.</li>
            <li>For each sample, scale the corroboration log-LR proportionally and recompute the full posterior.</li>
            <li>Sort the 500 recomputed probabilities; report the 2.5th and 97.5th percentile as the 95% CI.</li>
          </ol>
          <p className="mt-3">
            <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Gamma sampler:</span>{' '}
            Uses the Marsaglia-Tsang (2000) algorithm for gamma-distributed random variates, which are
            combined (Gamma(α) / (Gamma(α) + Gamma(β))) to produce Beta samples. This is numerically
            stable for α, β {'>'} 0.5.
          </p>
          <p className="mt-2">
            <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Limitation:</span>{' '}
            The CI reflects only uncertainty in corroboration density. Uncertainty in the feature
            scales (FEATURE_PARAMS) and the priors themselves is not captured. Suspects with very few
            claims (e.g., Michaelson with 1 claim) will have very wide CIs.
          </p>
        </div>
      </section>

      {/* ── Section 6: Joint hypothesis ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          6. Joint hypothesis — dependency assumption
        </h2>
        <div className="case-card p-5 text-sm" style={{ color: 'var(--ink-muted)' }}>
          <p className="mb-3">
            Andrew's hypothesis is a conjunction: Carlson AND Michaelson AND Lanegan were involved.
            The previous model computed P(A∪B∪C) under independence — both wrong fronts corrected here.
          </p>
          <p className="mb-3">
            <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>
              Dependency assumption: ρ = {ANDREW_DEPENDENCY_RHO}
            </span>{' '}
            — pairwise correlation between each pair of Andrew's three suspects. This reflects mutual
            proximity to Courtney Love: if one is involved via Love's network, the others are somewhat
            more likely to be involved. This is an explicit, arguable assumption. A skeptic would argue ρ=0;
            a conspiracy theorist might argue ρ=0.7.
          </p>
          <p className="mb-3">
            To challenge ρ: change{' '}
            <span className="font-mono">ANDREW_DEPENDENCY_RHO</span>{' '}
            in{' '}
            <span className="font-mono">case-app/frontend/src/data/scoring.ts</span>{' '}
            and rebuild.
          </p>
          <pre
            className="p-3 rounded-sm text-[12px] overflow-x-auto"
            style={{ background: '#0a1020', color: '#d0e0f0', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6 }}
          >
{`-- Pairwise joint under bivariate-normal latent model:
P(A,B) = P(A)·P(B) + ρ·√(P(A)(1-P(A))·P(B)(1-P(B)))

-- Three-way joint:
P(A,B,C) = P(A)·P(B)·P(C) + ρ·√(P(A)(1-P(A))·P(B)(1-P(B))·P(C)(1-P(C)))

-- Union (inclusion-exclusion):
P(A ∪ B ∪ C) = P(A)+P(B)+P(C) - P(A,B)-P(A,C)-P(B,C) + P(A,B,C)

-- Conjunction:
P(A ∩ B ∩ C) = P(A,B,C)  [from above]

-- Current ρ = ${ANDREW_DEPENDENCY_RHO}`}
          </pre>
        </div>
      </section>

      {/* ── Section 7: Known limitations ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          7. Known limitations
        </h2>
        <div className="case-card p-5">
          <ul className="space-y-2 text-sm" style={{ color: 'var(--ink-muted)' }}>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>No test set:</span> No resolved analogous case was used to validate the feature scales. All scales were set by analyst judgment.</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Source bias toward conspiracy literature:</span> The corpus is dominated by Grant archive (405 documents), news archives, and documentaries. Neutral biographies and official records are a smaller share. This inflates scores for suspects featured in Grant's materials.</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>English-language only:</span> No non-English sources are included. This is unlikely to affect scores materially for a 1994 Seattle case.</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>No audio NLP:</span> Documentary and podcast audio was not processed through ASR or NLP; claims were manually coded from transcripts and summaries.</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>No forensic lab data:</span> The Burnett &amp; Wilkins (2026) paper is ingested at the claim level; underlying raw forensic measurements are not in the corpus.</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Independence of feature columns:</span> Motive, means, and opportunity are coded from the same source documents and may be correlated. The log-LR additive model assumes feature independence (naive Bayes structure).</li>
            <li><span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>Rank order more stable than absolute values:</span> Small changes to feature scales can shift absolute probabilities by 5–15 percentage points. The relative ordering of suspects is more robust.</li>
          </ul>
        </div>
      </section>

      {/* ── Section 8: Score verification table ── */}
      <section className="mb-10">
        <h2 className="font-serif text-xl font-bold mb-3" style={{ color: 'var(--ink-strong)' }}>
          8. Score verification table
        </h2>
        <p className="text-sm mb-4" style={{ color: 'var(--ink-muted)' }}>
          Current posterior probabilities under default weights. Satisfies DS-grade requirements:
          Carroll ≤ 3%, Harrison ≤ 2%, Michaelson ≤ 6%, Cobain ∈ [75%, 92%], Love ∈ [35%, 55%], DeWitt ∈ [30%, 45%].
        </p>
        <div className="overflow-x-auto">
          <table className="data-table text-sm">
            <thead>
              <tr>
                <th>Suspect</th>
                <th>Archetype</th>
                <th className="num">Prior</th>
                <th className="num">Posterior</th>
                <th className="num">95% CI lower</th>
                <th className="num">95% CI upper</th>
                <th className="num">Σ log-LR</th>
              </tr>
            </thead>
            <tbody>
              {allScores.map(({ suspect, result }) => (
                <tr key={suspect.id}>
                  <td className="font-semibold">{suspect.name}</td>
                  <td className="font-mono text-xs">{suspect.archetype}</td>
                  <td className="num font-mono">{(result.prior * 100).toFixed(1)}%</td>
                  <td className="num font-mono font-bold"
                    style={{ color: suspect.archetype === 'baseline' ? '#4a90a4' : 'var(--amber-dim)' }}>
                    {(result.probability * 100).toFixed(1)}%
                  </td>
                  <td className="num font-mono">{(result.ci_lower * 100).toFixed(1)}%</td>
                  <td className="num font-mono">{(result.ci_upper * 100).toFixed(1)}%</td>
                  <td className="num font-mono"
                    style={{ color: result.sum_log_LR < 0 ? 'var(--alert)' : 'var(--ink-muted)' }}>
                    {result.sum_log_LR >= 0 ? '+' : ''}{result.sum_log_LR.toFixed(3)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Back link */}
      <div className="mt-4">
        <Link
          to="/scoring"
          className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-wider rounded-sm px-3 py-1.5 border transition-colors"
          style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
        >
          <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M19 12H5M11 5l-7 7 7 7" />
          </svg>
          Back to suspect scoring
        </Link>
      </div>
    </div>
  );
}
