/*
 * Cobain Case probability scoring model.
 *
 * Weighted logistic combination of observable corpus-derived features.
 * All output probabilities represent model estimates only — not factual
 * determinations. The official ruling (Seattle PD, King County ME) is
 * suicide by self-inflicted gunshot wound.
 *
 * The model is intentionally transparent and configurable via sensitivity
 * sliders so the user can explore how feature weights affect conclusions.
 */

import type { SuspectFeatures } from './suspects';

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

// Maximum values used to normalize raw feature counts to [0,1]
const NORM = {
  mention_count_total: 3000,
  mention_count_under_oath: 10,
  named_by_investigator_count: 20,
  contradiction_count: 25,
};

function sigmoid(x: number): number {
  return 1 / (1 + Math.exp(-x));
}

export interface ScoreResult {
  probability: number;      // point estimate, 0–1
  ci_lower: number;         // 95% CI lower bound
  ci_upper: number;         // 95% CI upper bound
  weighted_logit: number;   // raw logit before sigmoid
  feature_contributions: Record<string, number>;
}

export function scoreSuspect(
  features: SuspectFeatures,
  weights: FeatureWeights,
  grounded: boolean
): ScoreResult {
  if (!grounded) {
    // Ungrounded mode: all features collapse to uniform prior with wide CIs
    const p = 0.25 + (Math.random() * 0.001); // near-uniform, slight jitter
    return {
      probability: 0.25,
      ci_lower: 0.08,
      ci_upper: 0.52,
      weighted_logit: 0,
      feature_contributions: {
        mention_count: 0.25,
        motive: 0.25,
        means: 0.25,
        opportunity: 0.25,
        corroboration: 0.25,
        timeline: 0.25,
        investigator: 0.25,
        contradiction_penalty: 0,
      },
    };
    void p;
  }

  // Normalize features to [0,1]
  const f_mention = Math.min(1, features.mention_count_total / NORM.mention_count_total);
  const f_motive  = features.motive_strength_score;
  const f_means   = features.means_score;
  const f_opp     = features.opportunity_score;
  const f_corr    = features.corroboration_density;
  const f_time    = features.timeline_proximity;
  const f_invest  = Math.min(1, features.named_by_investigator_count / NORM.named_by_investigator_count);
  const f_contra  = Math.min(1, features.contradiction_count / NORM.contradiction_count);

  // Weighted logit (centered at 0)
  const logit =
    weights.mention_count   * (f_mention - 0.5) * 2 +
    weights.motive          * (f_motive  - 0.5) * 2 +
    weights.means           * (f_means   - 0.5) * 2 +
    weights.opportunity     * (f_opp     - 0.5) * 2 +
    weights.corroboration   * (f_corr    - 0.5) * 2 +
    weights.timeline        * (f_time    - 0.5) * 2 +
    weights.investigator    * (f_invest  - 0.5) * 2 -
    weights.contradiction_penalty * f_contra * 2;

  const p = sigmoid(logit);

  // 95% CI via approximate variance of weighted features
  const featureVals = [f_mention, f_motive, f_means, f_opp, f_corr, f_time, f_invest];
  const weightVals  = [
    weights.mention_count, weights.motive, weights.means,
    weights.opportunity, weights.corroboration, weights.timeline, weights.investigator,
  ];
  const totalWeight = weightVals.reduce((a, b) => a + b, 0);
  const mean = featureVals.reduce((s, v, i) => s + weightVals[i] * v, 0) / totalWeight;
  const variance = featureVals.reduce((s, v, i) => s + weightVals[i] * Math.pow(v - mean, 2), 0) / totalWeight;
  const se = Math.sqrt(variance) * 1.5; // scale to approximate logit SE

  const ci_lower = Math.max(0.01, sigmoid(logit - 1.96 * se));
  const ci_upper = Math.min(0.99, sigmoid(logit + 1.96 * se));

  return {
    probability: p,
    ci_lower,
    ci_upper,
    weighted_logit: logit,
    feature_contributions: {
      mention_count:  weights.mention_count   * f_mention,
      motive:         weights.motive          * f_motive,
      means:          weights.means           * f_means,
      opportunity:    weights.opportunity     * f_opp,
      corroboration:  weights.corroboration   * f_corr,
      timeline:       weights.timeline        * f_time,
      investigator:   weights.investigator    * f_invest,
      contradiction_penalty: -(weights.contradiction_penalty * f_contra),
    },
  };
}

// Joint probability for Andrew's three-suspect hypothesis
// P(joint) = P(any of the three are involved) under a naive Bayes independence assumption
// displayed alongside corroborating/contradicting joint evidence
export function scoreJointHypothesis(
  scores: { carlson: ScoreResult; michaelson: ScoreResult; lanegan: ScoreResult }
): {
  joint_probability: number;
  joint_ci_lower: number;
  joint_ci_upper: number;
  interpretation: string;
} {
  const { carlson, michaelson, lanegan } = scores;

  // Joint probability of at least one being involved (union, independence assumed)
  // P(A or B or C) = 1 - P(not A) * P(not B) * P(not C)
  const joint = 1 - (1 - carlson.probability) * (1 - michaelson.probability) * (1 - lanegan.probability);

  const joint_lower = 1 - (1 - carlson.ci_lower) * (1 - michaelson.ci_lower) * (1 - lanegan.ci_lower);
  const joint_upper = 1 - (1 - carlson.ci_upper) * (1 - michaelson.ci_upper) * (1 - lanegan.ci_upper);

  let interpretation: string;
  if (joint < 0.25) {
    interpretation = 'The grounded model finds weak support for the joint hypothesis. The corpus evidence, as weighted, does not distinguish this scenario from the official ruling.';
  } else if (joint < 0.45) {
    interpretation = 'The model finds modest but inconclusive support. Some features align with the hypothesis; significant contradictions and absent documentation prevent a strong inference.';
  } else if (joint < 0.65) {
    interpretation = 'The model finds moderate signal. Feature contributions from opportunity and investigator-named counts elevate the score, but wide confidence intervals reflect thin sworn-testimony coverage.';
  } else {
    interpretation = 'The model registers elevated signal for this joint hypothesis. Note: model output reflects corpus density, not forensic determination. Wide CIs apply.';
  }

  return { joint_probability: joint, joint_ci_lower: joint_lower, joint_ci_upper: joint_upper, interpretation };
}
