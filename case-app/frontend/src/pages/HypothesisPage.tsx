/*
 * Page 5: Andrew's Hypothesis
 * Joint probability for all three named suspects involved.
 * Honest output — corroborating and contradicting evidence.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { SUSPECTS, SOURCES } from '../data/suspects';
import { scoreSuspect, scoreJointHypothesis, DEFAULT_WEIGHTS } from '../data/scoring';

const ANDREW_SUSPECTS = SUSPECTS.filter((s) =>
  ['carlson', 'michaelson', 'lanegan'].includes(s.id)
);

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
    text: 'The King County Medical Examiner autopsy report found no evidence inconsistent with a self-inflicted gunshot wound. Physical evidence as documented supports the suicide ruling.',
    sourceIds: ['kcme-autopsy-1994'],
  },
  {
    text: 'Cross (2001) documents Kurt Cobain\'s history of suicidal ideation, prior hospitalization, and the emotional trajectory leading to April 1994, which is consistent with the official ruling.',
    sourceIds: ['cross-2001'],
  },
  {
    text: 'No forensic evidence in any public document links Dylan Carlson or the houseguest figure to the greenhouse where the death occurred during the estimated death window.',
    sourceIds: ['spd-report-1994'],
  },
];

export default function HypothesisPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  const scores = useMemo(() => {
    const carlson = ANDREW_SUSPECTS.find((s) => s.id === 'carlson')!;
    const michaelson = ANDREW_SUSPECTS.find((s) => s.id === 'michaelson')!;
    const lanegan = ANDREW_SUSPECTS.find((s) => s.id === 'lanegan')!;
    return {
      carlson: scoreSuspect(carlson.features, DEFAULT_WEIGHTS, true),
      michaelson: scoreSuspect(michaelson.features, DEFAULT_WEIGHTS, true),
      lanegan: scoreSuspect(lanegan.features, DEFAULT_WEIGHTS, true),
    };
  }, []);

  const joint = useMemo(() => scoreJointHypothesis(scores), [scores]);

  const jPct = Math.round(joint.joint_probability * 100);
  const jLo  = Math.round(joint.joint_ci_lower * 100);
  const jHi  = Math.round(joint.joint_ci_upper * 100);

  const jColor = jPct > 45 ? 'var(--caution)' : jPct > 30 ? 'var(--amber-dim)' : 'var(--slate-mist)';

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <div className="eyebrow mb-2">Cobain Case ODI · Andrew's Hypothesis</div>
      <h1 className="font-serif text-3xl font-bold mb-2" style={{ color: 'var(--ink-strong)' }}>
        Andrew's three-suspect joint hypothesis
      </h1>
      <p className="text-lg max-w-3xl mb-8" style={{ color: 'var(--ink-muted)' }}>
        Andrew has held this theory for years: that Dylan Carlson, the houseguest figure, and Mark
        Lanegan were involved — individually or in coordination. This page scores the joint hypothesis
        honestly against the corpus. The model surfaces both corroborating and contradicting evidence.
      </p>

      {/* Official ruling */}
      <div
        className="mb-8 p-4 rounded-sm border text-sm"
        style={{ background: 'var(--fog-bg)', borderColor: '#c0ccd8' }}
      >
        <span className="font-mono font-semibold" style={{ color: 'var(--slate)' }}>
          Official ruling:
        </span>{' '}
        Seattle PD Case #94-108620 (1994) — suicide. King County Medical Examiner — self-inflicted
        contact gunshot wound. This model does not overturn or assert an alternative to that ruling.
        All output is model-derived from published public sources only.
      </div>

      {/* Joint score */}
      <div
        className="case-card p-6 mb-8 border-l-4"
        style={{ borderLeftColor: jColor }}
      >
        <div className="eyebrow mb-2" style={{ fontSize: 10 }}>Joint hypothesis probability</div>
        <div className="flex items-baseline gap-4 flex-wrap">
          <span className="font-mono text-5xl font-bold" style={{ color: jColor }}>{jPct}%</span>
          <div>
            <div className="font-mono text-sm" style={{ color: 'var(--ink-soft)' }}>
              95% CI [{jLo}%, {jHi}%]
            </div>
            <div className="text-sm mt-1" style={{ color: 'var(--ink-muted)' }}>
              P(at least one of the three is involved) — naive Bayes union
            </div>
          </div>
        </div>
        <div
          className="mt-4 h-4 rounded-full overflow-hidden"
          style={{ background: 'var(--paper-deep)', border: '1px solid var(--hairline)', maxWidth: 500 }}
        >
          <div
            className="h-full rounded-full prob-bar-fill"
            style={{ width: `${jPct}%`, background: jColor }}
          />
        </div>
        <div
          className="mt-4 p-4 rounded-sm border text-sm"
          style={{ background: 'var(--amber-bg)', borderColor: 'var(--amber-dim)', color: 'var(--ink)' }}
        >
          <span className="font-semibold">Model interpretation: </span>
          {joint.interpretation}
        </div>
      </div>

      {/* Individual scores summary */}
      <div className="eyebrow mb-3">Individual component scores (grounded)</div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {ANDREW_SUSPECTS.map((s) => {
          const r = scores[s.id as 'carlson' | 'michaelson' | 'lanegan'];
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

      {/* Methodology note */}
      <div className="case-card p-5">
        <div className="eyebrow mb-3" style={{ fontSize: 10 }}>Joint probability methodology</div>
        <p className="text-sm mb-3" style={{ color: 'var(--ink-muted)' }}>
          The joint probability is computed as P(A ∪ B ∪ C) = 1 − P(¬A) × P(¬B) × P(¬C), applying
          a naive Bayes independence assumption. This assumption is almost certainly violated in
          reality — if one suspect is involved, the others may be more or less likely to be involved
          as well. The independence assumption widens the joint CI and should be treated as an upper
          bound on the joint score.
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
          {expanded === 'formula' ? 'Hide' : 'Show'} scoring formula
        </button>
        {expanded === 'formula' && (
          <pre
            className="mt-3 p-4 rounded-sm text-[12px] overflow-x-auto"
            style={{ background: '#0a1020', color: '#d0e0f0', fontFamily: '"JetBrains Mono", monospace', lineHeight: 1.6 }}
          >
{`-- Weighted logit for each suspect s:
logit(s) =
  w_mention   * (f_mention   - 0.5) * 2
  + w_motive  * (f_motive    - 0.5) * 2
  + w_means   * (f_means     - 0.5) * 2
  + w_opp     * (f_opp       - 0.5) * 2
  + w_corr    * (f_corr      - 0.5) * 2
  + w_time    * (f_time      - 0.5) * 2
  + w_invest  * (f_invest    - 0.5) * 2
  - w_contra  * f_contra * 2

P(s) = sigmoid(logit(s)) = 1 / (1 + exp(-logit(s)))

-- Joint hypothesis (union, independence):
P(joint) = 1 - (1-P(carlson)) * (1-P(michaelson)) * (1-P(lanegan))`}
          </pre>
        )}
      </div>
    </div>
  );
}
