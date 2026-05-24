/*
 * Page 5: Andrew's Hypothesis
 * Joint probability for Andrew's named suspects across the expanded 11-suspect slate.
 * Honest output — corroborating and contradicting evidence.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUSPECTS, SOURCES } from '../data/suspects';
import { scoreSuspect, scoreJointHypothesis, DEFAULT_WEIGHTS, ANDREW_DEPENDENCY_RHO } from '../data/scoring';
import CorroborationDivergingBar from '../components/CorroborationDivergingBar';

// Andrew's three originally named suspects
const ANDREW_CORE_IDS = ['carlson', 'michaelson', 'lanegan'];
// Extended pool: adding DeWitt (named by Grant and closely tied to the theory)
const EXTENDED_POOL_IDS = ['carlson', 'michaelson', 'lanegan', 'dewitt'];

const ANDREW_SUSPECTS = SUSPECTS.filter((s) => ANDREW_CORE_IDS.includes(s.id));
const EXTENDED_POOL = SUSPECTS.filter((s) => EXTENDED_POOL_IDS.includes(s.id));

// Corpus claims that specifically address the joint hypothesis
const JOINT_CORROBORATING = [
  {
    text: 'Tom Grant\'s archive argues that multiple parties had knowledge of Cobain\'s whereabouts in the days before death, creating a circumstantial case for coordination.',
    sourceIds: ['grant-archive'],
  },
  {
    text: 'The Soaked in Bleach documentary (2015) presents Grant\'s recorded calls as evidence that a network of people around Cobain may have had competing interests in his death or survival.',
    sourceIds: ['soaked-in-bleach-2015'],
  },
  {
    text: 'Halperin & Wallace (2004) note that proximity and access to the residence in the April 5–8 window was not exclusive to any single person, and that coordinated involvement is theoretically consistent with the physical evidence.',
    sourceIds: ['halperin-2004'],
  },
  {
    text: 'Burnett & Wilkins (2026) conclude that physical evidence — heroin level, spatter absence, organ necrosis — is consistent with one or more assailants incapacitating Cobain before staging the shooting. This supports a multi-party hypothesis without naming individuals.',
    sourceIds: ['burnett-wilkins-2026', 'euronews-2026', 'military-com-2026'],
  },
];

const JOINT_CONTRADICTING = [
  {
    text: 'No sworn testimony in the public record connects any of the three named suspects to a coordinated act. Seattle PD Case #94-108620 documents no co-conspirator investigation.',
    sourceIds: ['spd-report-1994'],
  },
  {
    text: 'Mark Lanegan is not named as a person of interest in any published investigative source and has no documented presence at the scene during the relevant window.',
    sourceIds: ['grant-archive', 'spd-report-1994'],
  },
  {
    text: 'Chris Michaelson cannot be matched to any individual in the mainstream Cobain investigative literature. The model scores him near zero due to absent corpus signal.',
    sourceIds: ['spd-report-1994'],
  },
  {
    text: 'The King County Medical Examiner autopsy report found no evidence inconsistent with a self-inflicted gunshot wound. Physical evidence as documented supports the suicide ruling.',
    sourceIds: ['kcme-autopsy-1994'],
  },
  {
    text: 'Cross (2001) documents Kurt Cobain\'s history of suicidal ideation, prior hospitalization, and the emotional trajectory leading to April 1994, which is consistent with the official ruling.',
    sourceIds: ['cross-2001'],
  },
  {
    text: 'No forensic evidence in any public document links Dylan Carlson to the greenhouse where the death occurred during the estimated death window.',
    sourceIds: ['spd-report-1994'],
  },
];

export default function HypothesisPage() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showExtended, setShowExtended] = useState(false);

  const allScores = useMemo(() => {
    const result: Record<string, ReturnType<typeof scoreSuspect>> = {};
    for (const s of SUSPECTS) {
      result[s.id] = scoreSuspect(s.features, DEFAULT_WEIGHTS, true, s.archetype);
    }
    return result;
  }, []);

  const coreJoint = useMemo(() => scoreJointHypothesis(allScores, ANDREW_CORE_IDS), [allScores]);
  const extendedJoint = useMemo(() => scoreJointHypothesis(allScores, EXTENDED_POOL_IDS), [allScores]);

  const activeJoint = showExtended ? extendedJoint : coreJoint;
  const activeSuspects = showExtended ? EXTENDED_POOL : ANDREW_SUSPECTS;

  const uPct = Math.round(activeJoint.union_probability * 100);
  const uLo  = Math.round(activeJoint.union_ci_lower * 100);
  const uHi  = Math.round(activeJoint.union_ci_upper * 100);
  const cPct = Math.round(activeJoint.conjunction_probability * 100);
  const cLo  = Math.round(activeJoint.conjunction_ci_lower * 100);
  const cHi  = Math.round(activeJoint.conjunction_ci_upper * 100);

  const jPct = uPct; // alias for legacy color logic
  const jColor = jPct > 45 ? 'var(--caution)' : jPct > 30 ? 'var(--amber-dim)' : 'var(--slate-mist)';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · Andrew's Hypothesis</div>
      <h1 className="mb-3" style={{ color: 'var(--ink-strong)' }}>
        Andrew's hypothesis, joint probability
      </h1>

      {/* Witness intake form, evidence card */}
      <div className="evidence-card max-w-4xl mb-8" style={{ paddingTop: '1.75rem' }}>
        <div className="flex items-start justify-between gap-4 flex-wrap mb-3">
          <div className="eyebrow" style={{ fontSize: 11 }}>Intake form, witness statement</div>
          <span className="stamp stamp--sm">Witness: Andrew Chletsos</span>
        </div>
        <p className="text-lg" style={{ color: 'var(--ink)', maxWidth: '60ch' }}>
          Andrew has held this theory for years, that Dylan Carlson, Chris Michaelson, and Mark
          Lanegan were involved, individually or in coordination. This page scores the joint
          hypothesis honestly against the corpus across the full 11-suspect slate. Toggle to include
          the extended pool (adding Michael "Cali" DeWitt, named by Tom Grant). The model surfaces
          both corroborating and contradicting evidence.
        </p>
      </div>

      {/* Official ruling callout */}
      <div className="casefile-callout mb-8 max-w-4xl">
        <span className="casefile-callout__stamp">Official Record</span>
        <div className="eyebrow mb-2" style={{ color: 'var(--official-blue)', fontSize: 11 }}>
          Seattle PD · King County ME
        </div>
        <p className="text-base" style={{ color: 'var(--ink)' }}>
          Seattle PD Case #94-108620 (1994), suicide. King County Medical Examiner, self-inflicted
          contact gunshot wound. The Cobain death remains officially classified as suicide as of
          February 2026. The Burnett and Wilkins (2026) peer-reviewed paper challenges the ruling
          but has not prompted a formal reinvestigation. This model does not overturn or assert an
          alternative to the official ruling.
        </p>
      </div>

      {/* Pool toggle */}
      <div className="mb-6 flex items-center gap-4 flex-wrap">
        <div className="eyebrow" style={{ fontSize: 10 }}>Hypothesis scope</div>
        <button
          type="button"
          onClick={() => setShowExtended(false)}
          className="font-mono text-[11px] px-3 py-1.5 rounded-sm border transition-colors"
          style={{
            background: !showExtended ? 'var(--amber-bg)' : 'var(--paper-deep)',
            borderColor: !showExtended ? 'var(--amber-dim)' : 'var(--hairline)',
            color: !showExtended ? 'var(--amber-dim)' : 'var(--ink-muted)',
          }}
        >
          Andrew's 3 (Carlson + Michaelson + Lanegan)
        </button>
        <button
          type="button"
          onClick={() => setShowExtended(true)}
          className="font-mono text-[11px] px-3 py-1.5 rounded-sm border transition-colors"
          style={{
            background: showExtended ? 'var(--amber-bg)' : 'var(--paper-deep)',
            borderColor: showExtended ? 'var(--amber-dim)' : 'var(--hairline)',
            color: showExtended ? 'var(--amber-dim)' : 'var(--ink-muted)',
          }}
        >
          Extended pool (+ DeWitt)
        </button>
      </div>

      {/* Joint scores — union and conjunction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
        {/* Union */}
        <div className="case-card p-6 border-l-4" style={{ borderLeftColor: jColor }}>
          <div className="eyebrow mb-2" style={{ fontSize: 10 }}>
            P(at least one of {activeSuspects.length} involved) — union
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-5xl font-bold" style={{ color: jColor }}>{uPct}%</span>
            <div>
              <div className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>
                95% CI [{uLo}%, {uHi}%]
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                pairwise dep. ρ = {ANDREW_DEPENDENCY_RHO}
              </div>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline)', maxWidth: 400 }}>
            <div className="h-full rounded-full prob-bar-fill" style={{ width: `${uPct}%`, background: jColor }} />
          </div>
          <p className="mt-2 text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
            P(A ∪ B ∪ C) via inclusion-exclusion with pairwise corr ρ = {ANDREW_DEPENDENCY_RHO}
          </p>
          <div className="mt-3 p-3 rounded-sm border text-sm" style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-dim)', color: 'var(--ink)' }}>
            <span className="font-semibold">Interpretation: </span>{activeJoint.interpretation}
          </div>
        </div>

        {/* Conjunction */}
        <div className="case-card p-6 border-l-4" style={{ borderLeftColor: 'var(--slate)' }}>
          <div className="eyebrow mb-2" style={{ fontSize: 10 }}>
            P(all {activeSuspects.length} involved) — conjunction
          </div>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="font-mono text-5xl font-bold" style={{ color: 'var(--slate)' }}>{cPct}%</span>
            <div>
              <div className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>
                95% CI [{cLo}%, {cHi}%]
              </div>
              <div className="font-mono text-xs mt-0.5" style={{ color: 'var(--ink-soft)' }}>
                pairwise dep. ρ = {ANDREW_DEPENDENCY_RHO}
              </div>
            </div>
          </div>
          <div className="mt-3 h-3 rounded-full overflow-hidden" style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline)', maxWidth: 400 }}>
            <div className="h-full rounded-full prob-bar-fill" style={{ width: `${cPct}%`, background: 'var(--slate)' }} />
          </div>
          <p className="mt-2 text-xs font-mono" style={{ color: 'var(--ink-soft)' }}>
            P(A ∩ B ∩ C) under shared latent factor model with ρ = {ANDREW_DEPENDENCY_RHO}
          </p>
          <div className="mt-3 p-3 rounded-sm border text-sm" style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8', color: 'var(--ink-muted)' }}>
            The conjunction is always much lower than any individual probability. Any claim that
            all three were involved together requires far more evidence than is present in the corpus.
            ρ = {ANDREW_DEPENDENCY_RHO} means suspects' involvements are positively correlated (mutual
            proximity to Love), which slightly elevates the conjunction relative to independence.
            A DS can challenge ρ by adjusting the value in scoring.ts: ANDREW_DEPENDENCY_RHO.
          </div>
        </div>
      </div>

      {/* Individual scores summary */}
      <div className="eyebrow mb-3">Individual component scores (grounded)</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {activeSuspects.map((s) => {
          const r = allScores[s.id];
          const pPct = Math.round(r.probability * 100);
          return (
            <div key={s.id} className="case-card p-4">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className="h-10 w-10 rounded-sm flex items-center justify-center font-mono font-bold shrink-0"
                  style={{ background: 'var(--slate-deep)', color: 'var(--amber)', fontSize: 13 }}
                >
                  {s.initials}
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: 'var(--ink-strong)' }}>{s.name}</div>
                  <div className="eyebrow" style={{ fontSize: 9 }}>{s.label}</div>
                </div>
              </div>
              <div className="font-mono text-2xl font-bold" style={{ color: 'var(--amber-dim)' }}>{pPct}%</div>
              <div
                className="mt-2 h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline-soft)' }}
              >
                <div
                  className="h-full rounded-full prob-bar-fill"
                  style={{ width: `${pPct}%`, background: 'var(--amber)' }}
                />
              </div>
              {s.sourceNote && (
                <p className="mt-1 text-[10px] font-mono" style={{ color: 'var(--slate)' }}>
                  Source pending — invite Andrew to identify
                </p>
              )}
              <Link
                to={`/suspect/${s.id}`}
                className="mt-3 inline-block font-mono text-[10px] uppercase tracking-wider"
                style={{ color: 'var(--amber-dim)' }}
              >
                Full profile
              </Link>
            </div>
          );
        })}
      </div>

      {/* Corroborating evidence */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div>
          <div className="eyebrow mb-3" style={{ color: 'var(--caution)' }}>
            What corroborates the joint hypothesis ({JOINT_CORROBORATING.length} claims)
          </div>
          <div className="flex flex-col gap-3">
            {JOINT_CORROBORATING.map((c, i) => (
              <div
                key={i}
                className="case-card p-4"
                style={{ borderLeft: '4px solid var(--caution)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>{c.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.sourceIds.map((sid) => {
                    const src = SOURCES[sid];
                    return src ? (
                      <span key={sid} className={`source-chip ${src.type}`}>{src.label}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="eyebrow mb-3" style={{ color: 'var(--confirm)' }}>
            What weakens the joint hypothesis ({JOINT_CONTRADICTING.length} claims)
          </div>
          <div className="flex flex-col gap-3">
            {JOINT_CONTRADICTING.map((c, i) => (
              <div
                key={i}
                className="case-card p-4"
                style={{ borderLeft: '4px solid var(--confirm)' }}
              >
                <p className="text-sm mb-2" style={{ color: 'var(--ink)' }}>{c.text}</p>
                <div className="flex flex-wrap gap-1.5">
                  {c.sourceIds.map((sid) => {
                    const src = SOURCES[sid];
                    return src ? (
                      <span key={sid} className={`source-chip ${src.type}`}>{src.label}</span>
                    ) : null;
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chart 7 (Bonus): Corroboration vs contradiction diverging bar */}
      <CorroborationDivergingBar />

      {/* Methodology note */}
      <div className="case-card p-5">
        <div className="eyebrow mb-3" style={{ fontSize: 10 }}>Joint probability methodology</div>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
          Two separate scores are shown. The union score uses the inclusion-exclusion formula with
          pairwise correlation ρ = {ANDREW_DEPENDENCY_RHO} between each pair of Andrew's three suspects.
          ρ reflects their mutual proximity to Courtney Love: if one member of the group is involved
          via Love's network, the others are somewhat more likely to be involved too. The correlation
          is explicitly stated so any data scientist can challenge it — change ANDREW_DEPENDENCY_RHO in
          scoring.ts and all scores update.
        </p>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
          The conjunction uses the same pairwise correlation model. It is always substantially lower
          than the union score; a claim that all three acted together requires far more corroborating
          evidence than exists in the current corpus.
        </p>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
          Note on Chris Michaelson: named by Andrew Chletsos. No matching individual appears in
          mainstream Cobain investigative literature. The model scores him near zero due to absent
          corpus signal. When Andrew identifies the source he is drawing from, the corpus will be
          updated and all scores re-run.
        </p>
        <p className="text-sm" style={{ color: 'var(--ink-muted)' }}>
          The model reflects corpus density — how much published evidence touches each suspect on
          each feature dimension. It does not represent a probabilistic reconstruction of events.
          For Andrew: the data, as grounded by Fivetran and scored by the model, does not rule the
          hypothesis in — but it does not rule it out either. The honest answer is that the sworn
          evidence base is thin, the corpus is dominated by non-sworn investigator and documentary
          sources, and the official ruling has not been formally reopened.
        </p>
        <button
          type="button"
          onClick={() => setExpanded(expanded === 'formula' ? null : 'formula')}
          className="mt-3 font-mono text-[11px] uppercase tracking-wider px-3 py-1.5 rounded-sm border"
          style={{ background: 'var(--paper-deep)', borderColor: 'var(--hairline)', color: 'var(--ink-muted)' }}
        >
          {expanded === 'formula' ? 'Hide' : 'Show'} joint formula
        </button>
        {expanded === 'formula' && (
          <pre
            className="mt-3 p-4 rounded-sm text-[12px] overflow-x-auto"
            style={{ background: '#0a1020', color: '#d0e0f0', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6 }}
          >
{`-- Bayesian log-LR individual scores:
--   logit(P_i) = logit(prior_i) + Σ log_LR(features)
--   P_i = sigmoid(logit(P_i))

-- Union with pairwise correlation ρ = ${ANDREW_DEPENDENCY_RHO}:
--   P(A,B) = P(A)·P(B) + ρ·√(P(A)(1-P(A))·P(B)(1-P(B)))
--   P(A,B,C) = P(A)·P(B)·P(C) + ρ·√(P(A)(1-P(A))·P(B)(1-P(B))·P(C)(1-P(C)))
--   P(A ∪ B ∪ C) = P(A)+P(B)+P(C) - P(A,B)-P(A,C)-P(B,C) + P(A,B,C)

-- Conjunction:
--   P(A ∩ B ∩ C) = P(A,B,C)  [from above]

-- Dependency note:
--   ρ = ${ANDREW_DEPENDENCY_RHO} reflects positive correlation among Andrew's three suspects.
--   Independence (ρ=0) gives lower conjunction; stronger correlation gives higher.
--   This value is explicitly configurable: ANDREW_DEPENDENCY_RHO in scoring.ts.`}
          </pre>
        )}
      </div>
    </div>
  );
}
