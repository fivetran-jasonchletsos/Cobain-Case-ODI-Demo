/*
 * Cobain Case probability scoring model — Bayesian log-likelihood-ratio formulation.
 *
 * WHAT THIS MODEL IS:
 *   - A Bayesian evidence-weight model with explicit archetype priors.
 *   - Output P_posterior is derived from: logit(prior) + Σ log_LR(features).
 *   - Confidence intervals are bootstrap-derived using Beta posteriors.
 *   - NOT a forensic determination. NOT a verdict. NOT an empirical frequency.
 *   - The base rate (prior) is stated. Features come from corpus counts.
 *   - The model has no out-of-sample test set — descriptive, not predictive.
 *   - Higher score = more evidence weight in corpus, NOT more likely guilty.
 *
 * OFFICIAL RULING: Seattle PD Case #94-108620 (1994) — suicide.
 *   King County Medical Examiner — self-inflicted contact gunshot wound.
 *   The ruling has not been amended as of February 2026.
 *
 * ARCHETYPE PRIORS:
 *   suspect / primary / secondary: 0.04
 *     Rationale: among named-in-corpus suspects, ~4% base rate that any
 *     one was involved (very low; most named parties are exculpated or uncharged).
 *   witness:     0.005  (witnesses ≠ suspects by default)
 *   commentator: 0.001  (public commentators, near-zero suspect probability)
 *   unknown:     0.02   (unnamed assailant placeholder — lower than named suspects)
 *   baseline:    0.94   (Cobain — the official ruling IS the null hypothesis)
 *
 * FEATURE LOG-LR FORMULA:
 *   For each feature f with observed value v ∈ [0,1]:
 *     log_LR(f) = scale * (v − v₀)
 *   where v₀ is the expected feature value under the not-involved hypothesis.
 *   Witness/commentator archetypes: motive/means/opportunity log-LRs are
 *   capped at +0.5 (archetype-prior dominance).
 *
 *   For the baseline (Cobain) archetype:
 *     Only contradictions update the posterior. Supporting features are
 *     expected for the official ruling (they are already encoded in the prior)
 *     and do not provide additional likelihood information.
 *
 * BOOTSTRAP CI:
 *   For each suspect, sample a corroboration-density proxy from
 *   Beta(α=corroborating_claim_count+1, β=contradicting_claim_count+1),
 *   re-run the scorer 500 times, report 2.5th and 97.5th percentiles.
 *
 * JOINT HYPOTHESIS (Andrew's hypothesis):
 *   Two scores are computed:
 *   (1) P(at least one of {Carlson, Michaelson, Lanegan} involved):
 *       Union formula corrected for pairwise correlation ρ=0.3.
 *       ρ reflects mutual proximity to Courtney Love — if one is involved,
 *       the others are slightly more likely to be involved too.
 *   (2) P(all three involved): conjunction under the same correlation model.
 *
 * KNOWN LIMITATIONS:
 *   - No out-of-sample test set; model is descriptive only.
 *   - Corpus is biased toward conspiracy literature (Grant, Halperin, documentaries).
 *   - English-language only; no audio NLP; no forensic lab data ingested.
 *   - Rank order of suspects is more stable than absolute probability values.
 *   - Sensitivity to feature scales is documented; sliders allow exploration.
 */

import type { SuspectArchetype, SuspectFeatures } from './suspects';

// ── Archetype priors ──────────────────────────────────────────────────────────

export const ARCHETYPE_PRIORS: Record<SuspectArchetype, number> = {
  baseline:    0.94,   // Cobain — official ruling null hypothesis
  primary:     0.04,   // main alternative-theory suspects
  secondary:   0.04,   // named suspects with thinner sourcing
  witness:     0.005,  // witnesses are not suspects
  commentator: 0.001,  // commentators are not suspects
  unknown:     0.02,   // unknown assailant placeholder
};

export const ARCHETYPE_PRIOR_RATIONALE: Record<SuspectArchetype, string> = {
  baseline:    'The official ruling (Seattle PD + King County ME, 1994) is the null hypothesis. Prior = 0.94; the only updates are contradictions from the 2026 forensic paper and the Grant archive.',
  primary:     'Named by multiple published investigators as persons of interest. Base rate: among all named-in-corpus individuals, ~4% were implicated in any formal investigation.',
  secondary:   'Named in secondary sources (podcasts, documentaries) without formal investigator corroboration. Same 4% base rate as primary; thin corpus drives posterior down.',
  witness:     'Witnesses and informants are not suspects by default. Prior = 0.5% to prevent corpus-citation volume from inflating apparent suspicion.',
  commentator: 'Public commentators (estranged relatives, media personalities) have near-zero suspect probability. Prior = 0.1%.',
  unknown:     'Generic placeholder for the Burnett & Wilkins (2026) unnamed assailant hypothesis. Prior = 2%, lower than named suspects because identification is the missing premise.',
};

// ── Feature LR scales and baselines ──────────────────────────────────────────
// v₀: expected feature value under the not-involved hypothesis
// scale: log-LR per unit deviation from v₀
// Cap for witness/commentator archetypes: +0.5 on any individual feature log-LR

const FEATURE_PARAMS = {
  motive:     { v0: 0.15, scale: 1.8 },
  means:      { v0: 0.15, scale: 1.8 },
  opportunity:{ v0: 0.15, scale: 1.8 },
  corroboration: { v0: 0.15, scale: 1.5 },
  timeline:   { v0: 0.15, scale: 1.2 },
  investigator: { v0: 0.05, scale: 2.0 },
  contradiction: { v0: 0.0,  scale: 1.5 },  // always negative contribution
  mention:    { v0: 0.05, scale: 0.8 },
};

const WITNESS_COMMENTATOR_CAP = 0.5;  // max log-LR per feature for w/c archetypes

// Normalization denominators for raw counts
const NORM_INVESTIGATOR  = 20;
const NORM_CONTRADICTION = 15;
const NORM_MENTION       = 5000;

// ── Utility ───────────────────────────────────────────────────────────────────

function logit(p: number): number {
  return Math.log(p / (1 - p));
}

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

function clamp(x: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, x));
}

// Gamma sampler via Marsaglia & Tsang (2000)
function gammaSample(a: number): number {
  if (a < 1) {
    return gammaSample(a + 1) * Math.pow(Math.random(), 1 / a);
  }
  const d = a - 1 / 3;
  const c = 1 / Math.sqrt(9 * d);
  for (;;) {
    let x: number;
    let v: number;
    do {
      x = gaussian();
      v = 1 + c * x;
    } while (v <= 0);
    v = v * v * v;
    const u = Math.random();
    const x2 = x * x;
    if (u < 1 - 0.0331 * x2 * x2) return d * v;
    if (Math.log(u) < 0.5 * x2 + d * (1 - v + Math.log(v))) return d * v;
  }
}

// Box-Muller Gaussian
let _spareGaussian: number | null = null;
function gaussian(): number {
  if (_spareGaussian !== null) {
    const val = _spareGaussian;
    _spareGaussian = null;
    return val;
  }
  const u = Math.random(), v = Math.random();
  const mag = Math.sqrt(-2 * Math.log(u));
  _spareGaussian = mag * Math.cos(2 * Math.PI * v);
  return mag * Math.sin(2 * Math.PI * v);
}

function betaSample(alpha: number, beta: number): number {
  const ga = gammaSample(alpha);
  const gb = gammaSample(beta);
  return ga / (ga + gb);
}

// ── Feature log-LR contributions ─────────────────────────────────────────────

export interface FeatureLR {
  feature: string;
  log_LR_contribution: number;
  normalized_value: number;
  citation_count: number;   // raw count or 0 for normalized features
}

function computeFeatureLRs(
  features: SuspectFeatures,
  archetype: SuspectArchetype,
  capFeatures: boolean,
): FeatureLR[] {
  const cap = capFeatures ? WITNESS_COMMENTATOR_CAP : Infinity;

  const f_motive   = features.motive_strength_score;
  const f_means    = features.means_score;
  const f_opp      = features.opportunity_score;
  const f_corr     = features.corroboration_density;
  const f_time     = features.timeline_proximity;
  const f_invest   = clamp(features.named_by_investigator_count / NORM_INVESTIGATOR, 0, 1);
  const f_contra   = clamp(features.contradiction_count / NORM_CONTRADICTION, 0, 1);
  const f_mention  = clamp(features.mention_count_total / NORM_MENTION, 0, 1);

  if (archetype === 'baseline') {
    // For the official-ruling null, supporting features are expected (already encoded
    // in the strong prior). Only contradictions update the posterior.
    const lr_contra = -FEATURE_PARAMS.contradiction.scale * 2.0 * f_contra;
    return [
      {
        feature: 'official_record_support',
        log_LR_contribution: 0,
        normalized_value: features.corroboration_density,
        citation_count: 0,
      },
      {
        feature: 'corpus_challenges',
        log_LR_contribution: lr_contra,
        normalized_value: f_contra,
        citation_count: features.contradiction_count,
      },
    ];
  }

  const lr_motive  = clamp(FEATURE_PARAMS.motive.scale   * (f_motive  - FEATURE_PARAMS.motive.v0),   -cap, cap);
  const lr_means   = clamp(FEATURE_PARAMS.means.scale    * (f_means   - FEATURE_PARAMS.means.v0),    -cap, cap);
  const lr_opp     = clamp(FEATURE_PARAMS.opportunity.scale * (f_opp  - FEATURE_PARAMS.opportunity.v0), -cap, cap);
  const lr_corr    = clamp(FEATURE_PARAMS.corroboration.scale * (f_corr - FEATURE_PARAMS.corroboration.v0), -cap, cap);
  const lr_time    = clamp(FEATURE_PARAMS.timeline.scale  * (f_time   - FEATURE_PARAMS.timeline.v0),  -cap, cap);
  const lr_invest  = clamp(FEATURE_PARAMS.investigator.scale * (f_invest - FEATURE_PARAMS.investigator.v0), -cap, cap);
  const lr_contra  = -FEATURE_PARAMS.contradiction.scale * f_contra;
  const lr_mention = clamp(FEATURE_PARAMS.mention.scale   * (f_mention - FEATURE_PARAMS.mention.v0),  -cap, cap);

  return [
    { feature: 'motive',        log_LR_contribution: lr_motive,  normalized_value: f_motive,  citation_count: 0 },
    { feature: 'means',         log_LR_contribution: lr_means,   normalized_value: f_means,   citation_count: 0 },
    { feature: 'opportunity',   log_LR_contribution: lr_opp,     normalized_value: f_opp,     citation_count: 0 },
    { feature: 'corroboration', log_LR_contribution: lr_corr,    normalized_value: f_corr,    citation_count: 0 },
    { feature: 'timeline',      log_LR_contribution: lr_time,    normalized_value: f_time,    citation_count: 0 },
    { feature: 'investigator',  log_LR_contribution: lr_invest,  normalized_value: f_invest,  citation_count: features.named_by_investigator_count },
    { feature: 'contradiction', log_LR_contribution: lr_contra,  normalized_value: f_contra,  citation_count: features.contradiction_count },
    { feature: 'mention_count', log_LR_contribution: lr_mention, normalized_value: f_mention, citation_count: features.mention_count_total },
  ];
}

// ── Score result ──────────────────────────────────────────────────────────────

export interface ScoreResult {
  probability: number;           // posterior point estimate, 0–1
  ci_lower: number;              // 2.5th percentile from bootstrap
  ci_upper: number;              // 97.5th percentile from bootstrap
  logit_prior: number;
  logit_posterior: number;
  sum_log_LR: number;
  prior: number;                 // archetype prior probability
  feature_contributions: Record<string, number>;  // keyed by feature name, value = log_LR
  feature_lr_detail: FeatureLR[];
  // Legacy field: weighted_logit kept for any downstream reference
  weighted_logit: number;
}

// ── Main scorer ───────────────────────────────────────────────────────────────

export interface FeatureWeights {
  mention_count: number;
  motive: number;
  means: number;
  opportunity: number;
  corroboration: number;
  timeline: number;
  investigator: number;
  contradiction_penalty: number;
}

export const DEFAULT_WEIGHTS: FeatureWeights = {
  mention_count:        0.08,
  motive:               0.22,
  means:                0.20,
  opportunity:          0.18,
  corroboration:        0.15,
  timeline:             0.12,
  investigator:         0.10,
  contradiction_penalty: 0.15,
};

const BOOTSTRAP_N = 500;

export function scoreSuspect(
  features: SuspectFeatures,
  _weights: FeatureWeights,   // retained for API compatibility; LR model uses fixed scales
  grounded: boolean,
  archetype: SuspectArchetype = 'secondary',
): ScoreResult {
  if (!grounded) {
    return {
      probability: 0.25,
      ci_lower: 0.08,
      ci_upper: 0.52,
      logit_prior: 0,
      logit_posterior: 0,
      sum_log_LR: 0,
      prior: 0.25,
      weighted_logit: 0,
      feature_contributions: {
        motive: 0, means: 0, opportunity: 0, corroboration: 0,
        timeline: 0, investigator: 0, contradiction: 0, mention_count: 0,
      },
      feature_lr_detail: [],
    };
  }

  const prior = ARCHETYPE_PRIORS[archetype] ?? 0.04;
  const isWC = archetype === 'witness' || archetype === 'commentator';
  const lp = logit(prior);

  const lrDetail = computeFeatureLRs(features, archetype, isWC);
  const sumLR = lrDetail.reduce((s, d) => s + d.log_LR_contribution, 0);
  const logit_post = lp + sumLR;
  const p = sigmoid(logit_post);

  // Bootstrap: sample corroboration density from Beta(corr_count+1, contra_count+1)
  // and scale the corroboration log-LR proportionally for each replicate.
  const corr_count = features.mention_count_total > 100
    ? Math.round(features.corroboration_density * 10) + 1
    : 1;
  const contra_count = features.contradiction_count + 1;

  const bootstrapProbs: number[] = new Array(BOOTSTRAP_N);
  const corr_base = features.corroboration_density;

  for (let i = 0; i < BOOTSTRAP_N; i++) {
    const corr_sample = betaSample(corr_count, contra_count);
    // Scale corroboration log-LR by the ratio of sampled to observed
    const corr_ratio = corr_base > 0 ? corr_sample / corr_base : 1;
    const lrDetailBoot = lrDetail.map((d) => {
      if (d.feature === 'corroboration' || d.feature === 'corpus_challenges') {
        return d.log_LR_contribution * corr_ratio;
      }
      return d.log_LR_contribution;
    });
    const sumLR_boot = lrDetailBoot.reduce((s, v) => s + v, 0);
    bootstrapProbs[i] = sigmoid(lp + sumLR_boot);
  }

  bootstrapProbs.sort((a, b) => a - b);
  const ci_lower = clamp(bootstrapProbs[Math.floor(BOOTSTRAP_N * 0.025)], 0.001, 0.999);
  const ci_upper = clamp(bootstrapProbs[Math.floor(BOOTSTRAP_N * 0.975)], 0.001, 0.999);

  const feature_contributions: Record<string, number> = {};
  for (const d of lrDetail) {
    feature_contributions[d.feature] = d.log_LR_contribution;
  }
  // Legacy aliases for any old-style rendering code
  feature_contributions['contradiction_penalty'] = feature_contributions['contradiction'] ?? feature_contributions['corpus_challenges'] ?? 0;

  return {
    probability: p,
    ci_lower,
    ci_upper,
    logit_prior: lp,
    logit_posterior: logit_post,
    sum_log_LR: sumLR,
    prior,
    weighted_logit: logit_post,
    feature_contributions,
    feature_lr_detail: lrDetail,
  };
}

// ── Joint hypothesis — Andrew's three suspects ────────────────────────────────
//
// Two scores:
//   union:       P(at least one of {Carlson, Michaelson, Lanegan} involved)
//   conjunction: P(all three involved)
//
// Dependency assumption: pairwise correlation ρ = 0.3 between Andrew's three
// suspects, reflecting mutual proximity to Courtney Love (if one is involved
// via Love's network, the others are somewhat more likely to be too).
//
// Union formula (inclusion-exclusion with correlated joint terms):
//   P(A ∪ B ∪ C) = P(A) + P(B) + P(C)
//                 − P(A,B) − P(A,C) − P(B,C)
//                 + P(A,B,C)
//
// Pairwise joint under bivariate-normal latent model:
//   P(A,B) ≈ P(A)·P(B) + ρ·√(P(A)(1−P(A))·P(B)(1−P(B)))
//
// Three-way joint (approximation):
//   P(A,B,C) ≈ P(A)·P(B)·P(C) + ρ·√(P(A)(1−P(A))·P(B)(1−P(B))·P(C)(1−P(C)))

function correlatedJointPair(pA: number, pB: number, rho: number): number {
  return clamp(
    pA * pB + rho * Math.sqrt(pA * (1 - pA) * pB * (1 - pB)),
    0, 1,
  );
}

function correlatedJointTriple(pA: number, pB: number, pC: number, rho: number): number {
  return clamp(
    pA * pB * pC + rho * Math.sqrt(pA * (1 - pA) * pB * (1 - pB) * pC * (1 - pC)),
    0, 1,
  );
}

export const ANDREW_DEPENDENCY_RHO = 0.3;

export interface JointHypothesisResult {
  union_probability: number;
  conjunction_probability: number;
  union_ci_lower: number;
  union_ci_upper: number;
  conjunction_ci_lower: number;
  conjunction_ci_upper: number;
  rho: number;
  interpretation: string;
  // Legacy alias
  joint_probability: number;
  joint_ci_lower: number;
  joint_ci_upper: number;
}

export function scoreJointHypothesis(
  scores: Record<string, ScoreResult>,
  suspectIds: string[],
): JointHypothesisResult {
  const probs  = suspectIds.map((id) => scores[id]?.probability ?? 0);
  const lowers = suspectIds.map((id) => scores[id]?.ci_lower   ?? 0);
  const uppers = suspectIds.map((id) => scores[id]?.ci_upper   ?? 0);

  function computeUnionConj(ps: number[], rho: number) {
    if (ps.length === 0) return { union: 0, conj: 0 };
    if (ps.length === 1) return { union: ps[0], conj: ps[0] };
    if (ps.length === 2) {
      const pAB = correlatedJointPair(ps[0], ps[1], rho);
      return { union: clamp(ps[0] + ps[1] - pAB, 0, 1), conj: pAB };
    }
    // n=3 (Andrew's core case)
    const pAB  = correlatedJointPair(ps[0], ps[1], rho);
    const pAC  = correlatedJointPair(ps[0], ps[2], rho);
    const pBC  = correlatedJointPair(ps[1], ps[2], rho);
    const pABC = correlatedJointTriple(ps[0], ps[1], ps[2], rho);
    const union = clamp(ps[0] + ps[1] + ps[2] - pAB - pAC - pBC + pABC, 0, 1);
    // For 4+ suspects: fallback to iterative correlated union
    return { union, conj: pABC };
  }

  const rho = ANDREW_DEPENDENCY_RHO;
  const { union: u, conj: c }     = computeUnionConj(probs,  rho);
  const { union: ul, conj: cl }   = computeUnionConj(lowers, rho);
  const { union: uu, conj: cu }   = computeUnionConj(uppers, rho);

  let interpretation: string;
  if (u < 0.15) {
    interpretation = 'The grounded model finds weak support for the joint hypothesis. Corpus evidence does not distinguish this scenario from the official ruling.';
  } else if (u < 0.30) {
    interpretation = 'The model finds modest but inconclusive support. Some features align with the hypothesis; significant contradictions and absent documentation prevent a strong inference.';
  } else if (u < 0.50) {
    interpretation = 'The model finds moderate signal for the union hypothesis. Wide confidence intervals reflect thin sworn-testimony coverage.';
  } else {
    interpretation = 'The model registers elevated signal. Note: model output reflects corpus density, not forensic determination. Wide CIs apply.';
  }

  return {
    union_probability: u,
    conjunction_probability: c,
    union_ci_lower:    ul,
    union_ci_upper:    uu,
    conjunction_ci_lower: cl,
    conjunction_ci_upper: cu,
    rho,
    interpretation,
    // Legacy aliases
    joint_probability: u,
    joint_ci_lower: ul,
    joint_ci_upper: uu,
  };
}
