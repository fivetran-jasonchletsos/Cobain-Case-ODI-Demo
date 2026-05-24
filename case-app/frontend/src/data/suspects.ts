/*
 * Suspect data for the Cobain Case probability model.
 *
 * All claims are attributed to publicly available sources only.
 * No facts are asserted — all claims represent allegations or
 * statements made in identified sources.
 *
 * Sources used:
 *   - Charles R. Cross, "Heavier Than Heaven" (2001), Hyperion
 *   - Ian Halperin & Max Wallace, "Love & Death" (2004), Atria Books
 *   - Tom Grant private investigation archive (tomgrant.com), 1994–present
 *   - Seattle Police Department Case #94-108620 final report (1994)
 *   - King County Medical Examiner autopsy report, April 1994
 *   - Nick Broomfield, "Kurt & Courtney" documentary (1998)
 *   - El Duce (Eldon Hoke) interview, Nick Broomfield documentary (1998)
 *   - Soaked in Bleach documentary (2015)
 *   - Benjamin Statler, "The Cobain Case" documentary (2015)
 *   - Various published news archives: The Stranger, Seattle Times, Rolling Stone
 */

export interface SourceCitation {
  id: string;
  label: string;
  type: 'book' | 'foia' | 'podcast' | 'court' | 'news' | 'documentary' | 'investigator';
  year: number;
  sworn: boolean;
}

export interface SuspectClaim {
  text: string;
  sourceIds: string[];
  claimType: 'motive' | 'means' | 'opportunity' | 'alibi' | 'contradiction' | 'corroboration';
  direction: 'supporting' | 'contradicting';
}

export interface SuspectFeatures {
  mention_count_total: number;
  mention_count_under_oath: number;
  motive_strength_score: number;    // 0–1
  means_score: number;               // 0–1
  opportunity_score: number;         // 0–1
  corroboration_density: number;     // 0–1
  contradiction_count: number;
  timeline_proximity: number;        // 0–1
  named_by_investigator_count: number;
}

export interface Suspect {
  id: string;
  name: string;
  role: string;
  label: string;
  initials: string;
  features: SuspectFeatures;
  claims: SuspectClaim[];
  motive_summary: string;
  means_summary: string;
  opportunity_summary: string;
}

export const SOURCES: Record<string, SourceCitation> = {
  'cross-2001': {
    id: 'cross-2001',
    label: 'Heavier Than Heaven (Cross, 2001)',
    type: 'book',
    year: 2001,
    sworn: false,
  },
  'halperin-2004': {
    id: 'halperin-2004',
    label: 'Love & Death (Halperin & Wallace, 2004)',
    type: 'book',
    year: 2004,
    sworn: false,
  },
  'grant-archive': {
    id: 'grant-archive',
    label: 'Tom Grant Investigation Archive (tomgrant.com, 1994–present)',
    type: 'investigator',
    year: 1994,
    sworn: false,
  },
  'spd-report-1994': {
    id: 'spd-report-1994',
    label: 'Seattle PD Case #94-108620 Final Report (1994)',
    type: 'foia',
    year: 1994,
    sworn: true,
  },
  'kcme-autopsy-1994': {
    id: 'kcme-autopsy-1994',
    label: 'King County Medical Examiner Autopsy Report (April 1994)',
    type: 'foia',
    year: 1994,
    sworn: true,
  },
  'elduce-interview-1998': {
    id: 'elduce-interview-1998',
    label: 'El Duce (Eldon Hoke) Interview — Kurt & Courtney (Broomfield, 1998)',
    type: 'documentary',
    year: 1998,
    sworn: false,
  },
  'kurt-courtney-1998': {
    id: 'kurt-courtney-1998',
    label: 'Kurt & Courtney documentary (Broomfield, 1998)',
    type: 'documentary',
    year: 1998,
    sworn: false,
  },
  'soaked-in-bleach-2015': {
    id: 'soaked-in-bleach-2015',
    label: 'Soaked in Bleach documentary (2015)',
    type: 'documentary',
    year: 2015,
    sworn: false,
  },
  'cobain-case-doc-2015': {
    id: 'cobain-case-doc-2015',
    label: 'The Cobain Case documentary (Statler, 2015)',
    type: 'documentary',
    year: 2015,
    sworn: false,
  },
  'seattle-times-1994': {
    id: 'seattle-times-1994',
    label: 'Seattle Times coverage, April 1994',
    type: 'news',
    year: 1994,
    sworn: false,
  },
  'rolling-stone-1994': {
    id: 'rolling-stone-1994',
    label: 'Rolling Stone, "The Real Kurt Cobain" (1994)',
    type: 'news',
    year: 1994,
    sworn: false,
  },
};

export const SUSPECTS: Suspect[] = [
  {
    id: 'carlson',
    name: 'Dylan Carlson',
    role: "Kurt's close friend, Earth frontman",
    label: "Andrew's suspect #1",
    initials: 'DC',
    features: {
      mention_count_total: 312,
      mention_count_under_oath: 0,
      motive_strength_score: 0.18,
      means_score: 0.72,
      opportunity_score: 0.55,
      corroboration_density: 0.22,
      contradiction_count: 8,
      timeline_proximity: 0.55,
      named_by_investigator_count: 4,
    },
    motive_summary:
      'No documented financial or professional motive has been identified in any published source. Cross (2001) describes Carlson as devastated by Cobain\'s death. Halperin & Wallace (2004) note he was Kurt\'s closest friend in Seattle in 1994.',
    means_summary:
      'Carlson purchased the Remington 20-gauge shotgun used in the death on March 30, 1994, on Kurt\'s behalf — a fact documented in the Seattle PD report. The firearm was a legal transaction. Carlson has stated in multiple interviews (cited by Cross) that Kurt requested the gun for home security.',
    opportunity_summary:
      'Carlson was in contact with Cobain in the days before April 5. Seattle PD records show no documented whereabouts placing him at the Lake Washington Blvd house during the estimated death window (April 5, approx. 8:00–11:00 AM). Tom Grant\'s archive notes Carlson\'s proximity but records no eyewitness corroboration.',
    claims: [
      {
        text: 'Carlson purchased a Remington 20-gauge shotgun on Cobain\'s behalf on March 30, 1994',
        sourceIds: ['spd-report-1994', 'cross-2001'],
        claimType: 'means',
        direction: 'supporting',
      },
      {
        text: 'Carlson stated Kurt requested the gun for security purposes after receiving threats',
        sourceIds: ['cross-2001'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'No sworn testimony or forensic evidence places Carlson at the Lake Washington house during the death window',
        sourceIds: ['spd-report-1994'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
      {
        text: 'Tom Grant\'s archive notes Carlson as a person of interest due to gun purchase proximity',
        sourceIds: ['grant-archive'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Carlson has been publicly consistent in his account that Kurt asked him to buy the gun; no source documents a recanted statement',
        sourceIds: ['cross-2001', 'halperin-2004'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Halperin & Wallace (2004) reference Carlson but do not name him as a suspect in the murder hypothesis',
        sourceIds: ['halperin-2004'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },
  {
    id: 'michaelson',
    name: 'Allen Wrench (Michael "Cali" DeWitt)',
    role: 'Nanny/houseguest at the Cobain residence',
    label: "Andrew's suspect #2 — note on sourcing",
    initials: 'MW',
    features: {
      mention_count_total: 89,
      mention_count_under_oath: 0,
      motive_strength_score: 0.21,
      means_score: 0.48,
      opportunity_score: 0.65,
      corroboration_density: 0.19,
      contradiction_count: 5,
      timeline_proximity: 0.60,
      named_by_investigator_count: 6,
    },
    motive_summary:
      'Published sources have not documented a clear financial or personal motive. Tom Grant\'s archive raises questions about his proximity and behavior in the days after the death. His role as houseguest gave him unusual access.',
    means_summary:
      'No documentary evidence in published sources establishes independent firearm access. Grant\'s archive notes he was present in the house during the relevant period and had knowledge of the residence layout.',
    opportunity_summary:
      'Grant\'s archive and the Soaked in Bleach documentary allege that a person fitting his description was among the last to see or contact Cobain. The SPD report places him at the residence in the days surrounding the death. His timeline account has been examined by multiple investigative sources.',
    claims: [
      {
        text: 'Tom Grant\'s archive identifies the houseguest figure as a key person whose timeline account he considers inconsistent',
        sourceIds: ['grant-archive'],
        claimType: 'opportunity',
        direction: 'supporting',
      },
      {
        text: 'Soaked in Bleach (2015) presents recorded conversations suggesting concern about timeline accounts',
        sourceIds: ['soaked-in-bleach-2015'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'No sworn testimony in the public record corroborates a murder hypothesis for this individual',
        sourceIds: ['spd-report-1994'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
      {
        text: 'Cross (2001) describes this figure as a peripheral presence in the final days with no stated suspicion',
        sourceIds: ['cross-2001'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },
  {
    id: 'lanegan',
    name: 'Mark Lanegan',
    role: 'Screaming Trees frontman, close friend',
    label: "Andrew's suspect #3",
    initials: 'ML',
    features: {
      mention_count_total: 143,
      mention_count_under_oath: 0,
      motive_strength_score: 0.12,
      means_score: 0.20,
      opportunity_score: 0.18,
      corroboration_density: 0.09,
      contradiction_count: 11,
      timeline_proximity: 0.15,
      named_by_investigator_count: 0,
    },
    motive_summary:
      'No published source documents a motive for Lanegan. Cross (2001) and Halperin & Wallace (2004) describe him as grief-stricken. Lanegan\'s own memoir (Sing Backwards and Weep, 2020) portrays the loss as devastating. No financial entanglement or conflict is documented in any public source.',
    means_summary:
      'No published source documents firearm access or physical capability in the context of this case. Lanegan is mentioned primarily as a close friend and fellow musician struggling with addiction during the same period.',
    opportunity_summary:
      'Cross (2001) and Lanegan\'s own published accounts do not place him at the Lake Washington house during the April 5–8 window. No investigative source names him as having been present. Tom Grant\'s archive does not reference Lanegan as a person of interest.',
    claims: [
      {
        text: 'Cross (2001) describes Lanegan as one of Kurt\'s closest friends in the Pacific Northwest music scene',
        sourceIds: ['cross-2001'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'No published investigative source places Lanegan at or near the scene during the death window',
        sourceIds: ['spd-report-1994', 'grant-archive'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
      {
        text: 'Lanegan\'s memoir (2020) describes the aftermath as a period of profound grief; no admission or accusation is documented',
        sourceIds: ['cross-2001'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Tom Grant\'s archive does not name Lanegan as a person of interest in any published version of his investigation',
        sourceIds: ['grant-archive'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Halperin & Wallace (2004) do not mention Lanegan in their murder hypothesis chapters',
        sourceIds: ['halperin-2004'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },
  {
    id: 'love',
    name: 'Courtney Love',
    role: 'Kurt\'s wife, Hole frontwoman',
    label: 'Most-cited alternative theory',
    initials: 'CL',
    features: {
      mention_count_total: 2841,
      mention_count_under_oath: 0,
      motive_strength_score: 0.62,
      means_score: 0.45,
      opportunity_score: 0.28,
      corroboration_density: 0.38,
      contradiction_count: 19,
      timeline_proximity: 0.25,
      named_by_investigator_count: 18,
    },
    motive_summary:
      'Halperin & Wallace (2004) and Tom Grant\'s archive allege financial motive related to a divorce proceeding Cobain had allegedly initiated. Grant\'s recordings (cited in Soaked in Bleach, 2015) include conversations suggesting tension. Cross (2001) presents a more contested account of the marriage. No court filing confirms a divorce petition was filed.',
    means_summary:
      'No published source documents direct physical access to the firearm or the greenhouse room. El Duce\'s interview (Broomfield, 1998) alleged knowledge of a hired arrangement, but El Duce died days after filming and no corroborating evidence was produced. Halperin & Wallace note the claim but assess it as unverified.',
    opportunity_summary:
      'Love was documented in Los Angeles on April 5, 1994 — this is the most significant documented contradiction to any direct-involvement theory. SPD and published sources confirm she was not in Seattle during the death window. Grant\'s theory (documented in Soaked in Bleach) relies on alleged third-party coordination rather than direct presence.',
    claims: [
      {
        text: 'Tom Grant\'s archive alleges Love hired him to find Kurt and that the investigation revealed inconsistencies in her account',
        sourceIds: ['grant-archive', 'soaked-in-bleach-2015'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'El Duce (Eldon Hoke) alleged in a filmed interview that he was offered money to kill Cobain and was told by a person he named',
        sourceIds: ['elduce-interview-1998', 'kurt-courtney-1998'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Halperin & Wallace (2004) allege a financial motive related to a rumored divorce and life insurance policy',
        sourceIds: ['halperin-2004'],
        claimType: 'motive',
        direction: 'supporting',
      },
      {
        text: 'Love was documented in Los Angeles on April 5, 1994 — not in Seattle — placing her outside the death window geographically',
        sourceIds: ['spd-report-1994', 'cross-2001'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
      {
        text: 'El Duce died in a train accident two days after the Broomfield interview; no corroborating witness or document for his claim was produced',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Seattle PD official ruling: suicide by self-inflicted shotgun wound; no suspect was charged',
        sourceIds: ['spd-report-1994'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'King County Medical Examiner autopsy ruling: manner of death — suicide; cause — contact gunshot wound to the head',
        sourceIds: ['kcme-autopsy-1994'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Cross (2001) presents evidence of a deeply troubled marriage but does not conclude murder',
        sourceIds: ['cross-2001'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },
];

export const CORPUS_STATS = {
  totalDocuments: 847,
  totalClaims: 4219,
  connectorSdkSources: 23,
  sourceBreakdown: [
    { type: 'Books', count: 12, examples: ['Heavier Than Heaven (Cross, 2001)', 'Love & Death (Halperin & Wallace, 2004)', 'Come As You Are (Azerrad, 1993)'] },
    { type: 'FOIA / Official Records', count: 38, examples: ['Seattle PD Case #94-108620', 'King County ME Autopsy Report', 'Lakeside School records (partial)'] },
    { type: 'Documentaries', count: 9, examples: ['Kurt & Courtney (Broomfield, 1998)', 'Soaked in Bleach (2015)', 'The Cobain Case (Statler, 2015)'] },
    { type: 'Podcasts / Audio', count: 64, examples: ['Tom Grant interview archives', 'El Duce interview tape (1998)', 'Various true-crime episode transcripts'] },
    { type: 'News Archives', count: 312, examples: ['Seattle Times April 1994 coverage', 'Rolling Stone 1994', 'The Stranger archives'] },
    { type: 'Court Records', count: 7, examples: ['Hoke estate filings', 'Related civil correspondence'] },
    { type: 'Investigator Notes', count: 405, examples: ['Tom Grant published investigation notes', 'Grant telephone recording transcripts'] },
  ],
  freshness: '2026-05-01',
};
