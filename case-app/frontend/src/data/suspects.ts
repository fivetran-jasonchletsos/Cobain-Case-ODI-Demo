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
 *   - Brian Burnett & Michelle Wilkins, peer-reviewed forensic paper (February 2026)
 *     Sources: Euronews 2026-02-11; Military.com 2026-02-20; Seattle Times reignite story
 */

export interface SourceCitation {
  id: string;
  label: string;
  type: 'book' | 'foia' | 'podcast' | 'court' | 'news' | 'documentary' | 'investigator' | 'peer-reviewed';
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

export type SuspectArchetype =
  | 'baseline'       // Kurt Cobain — official ruling null hypothesis
  | 'primary'        // main alternative-theory suspects
  | 'secondary'      // named suspects with thinner sourcing
  | 'witness'        // witness / informant, low suspect probability
  | 'commentator'    // public commentator, near-zero suspect probability
  | 'unknown';       // John Doe / unknown assailant placeholder

export interface Suspect {
  id: string;
  name: string;
  role: string;
  label: string;
  initials: string;
  archetype: SuspectArchetype;
  sourceNote?: string;               // optional caveat shown on card
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
  'disgraceland-podcast': {
    id: 'disgraceland-podcast',
    label: 'Disgraceland podcast — Mark Lanegan episode',
    type: 'podcast',
    year: 2022,
    sworn: false,
  },
  'burnett-wilkins-2026': {
    id: 'burnett-wilkins-2026',
    label: 'Burnett & Wilkins forensic paper (peer-reviewed, February 2026)',
    type: 'peer-reviewed',
    year: 2026,
    sworn: false,
  },
  'euronews-2026': {
    id: 'euronews-2026',
    label: 'Euronews, "Forensic experts\' new report claims Kurt Cobain may have been murdered" (2026-02-11)',
    type: 'news',
    year: 2026,
    sworn: false,
  },
  'military-com-2026': {
    id: 'military-com-2026',
    label: 'Military.com, "New murder claims reignite debate over Kurt Cobain\'s death" (2026-02-20)',
    type: 'news',
    year: 2026,
    sworn: false,
  },
  'seattle-times-2026': {
    id: 'seattle-times-2026',
    label: 'Seattle Times, "Kurt Cobain death debate reignites with new forensic claims" (2026)',
    type: 'news',
    year: 2026,
    sworn: false,
  },
  'hank-harrison-books': {
    id: 'hank-harrison-books',
    label: 'Hank Harrison, self-published books and public statements (2014–present)',
    type: 'book',
    year: 2014,
    sworn: false,
  },
};

export const SUSPECTS: Suspect[] = [
  // ── 1. Kurt Cobain — official ruling / null hypothesis baseline ──
  {
    id: 'cobain',
    name: 'Kurt Cobain',
    role: 'Subject — official ruling: self-inflicted suicide',
    label: 'Official ruling · Self-inflicted',
    initials: 'KC',
    archetype: 'baseline',
    features: {
      mention_count_total: 9200,
      mention_count_under_oath: 2,
      motive_strength_score: 0.72,   // documented depression, prior attempt, stated intent
      means_score: 0.95,             // his own gun, his own hand per ruling
      opportunity_score: 0.98,       // present at scene per ruling
      corroboration_density: 0.68,   // multiple independent sources consistent with suicide
      contradiction_count: 6,        // Burnett+Wilkins 2026 forensic claims, Grant archive
      timeline_proximity: 0.98,
      named_by_investigator_count: 2, // Grant archive cites self-harm pattern as context
    },
    motive_summary:
      'Cross (2001) documents Cobain\'s long history of suicidal ideation, chronic pain from an undiagnosed stomach condition, prior drug overdose in Rome (March 1994), and stated despondency in interviews and a note found at the scene. The suicide note — confirmed by handwriting analysis — references plans to leave and no longer wanting to be a rock star. Cross and the official autopsy record both treat this as consistent with voluntary action.',
    means_summary:
      'The Remington 20-gauge shotgun used in the death was legally purchased by Dylan Carlson on Cobain\'s behalf on March 30, 1994. The autopsy report (King County ME) documents a contact gunshot wound consistent with self-infliction. Toxicology confirmed 1.52 mg/L morphine and Valium. Burnett & Wilkins (2026) argue the heroin level was incapacitating; the autopsy record does not draw that conclusion, and the official ruling has not been amended as of February 2026.',
    opportunity_summary:
      'Cobain was confirmed by all investigative sources as present at the Lake Washington residence on approximately April 5, 1994. His body was found April 8, 1994, in the greenhouse above the garage. No other individual has been placed at the scene during the death window by any sworn testimony in the public record.',
    claims: [
      {
        text: 'King County Medical Examiner ruled cause of death as contact gunshot wound to the head; manner: suicide; no inconsistency with self-infliction documented in the 1994 official record',
        sourceIds: ['kcme-autopsy-1994'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Seattle PD Case #94-108620 (1994) ruled manner of death as suicide; 2014 reinvestigation did not change the ruling',
        sourceIds: ['spd-report-1994'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Cross (2001) documents a history of suicidal ideation, prior hospitalization, and an emotional trajectory in the weeks before April 5, 1994, consistent with the official ruling',
        sourceIds: ['cross-2001'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Burnett & Wilkins (2026) argue that the 1.52 mg/L heroin level would have been incapacitating before any gunshot, challenging the self-administration claim; the official ruling has not been amended as of February 2026',
        sourceIds: ['burnett-wilkins-2026', 'euronews-2026', 'military-com-2026'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Burnett & Wilkins (2026) allege the absence of blood spatter on Cobain\'s left hand (wrapped around the muzzle) is inconsistent with self-infliction; this claim has not been evaluated in any sworn proceeding',
        sourceIds: ['burnett-wilkins-2026', 'euronews-2026'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Tom Grant\'s archive argues the scene was staged and that Cobain was incapacitated before the gunshot; the argument relies on non-sworn sources and has not been adopted by any law enforcement agency',
        sourceIds: ['grant-archive', 'soaked-in-bleach-2015'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 2. Courtney Love — most-cited alternative-theory figure ──
  {
    id: 'love',
    name: 'Courtney Love',
    role: "Kurt's wife, Hole frontwoman",
    label: 'Most-cited alternative theory',
    initials: 'CL',
    archetype: 'primary',
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
      'No published source documents direct physical access to the firearm or the greenhouse room. El Duce\'s interview (Broomfield, 1998) alleged knowledge of a hired arrangement, but El Duce died two days after filming and no corroborating evidence was produced. Halperin & Wallace note the claim but assess it as unverified.',
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
        text: 'El Duce (Eldon Hoke) alleged in a filmed interview that he was offered $50,000 to kill Cobain by a person he named',
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
        text: 'Rosemary Carroll (Love\'s attorney) reportedly recalled overhearing Love tell Carlson to "check the greenhouse" on April 6, 1994 — cited as a key witness-against claim in Grant\'s archive',
        sourceIds: ['grant-archive'],
        claimType: 'corroboration',
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

  // ── 3. Michael "Cali" DeWitt — male nanny at the residence ──
  {
    id: 'dewitt',
    name: 'Michael "Cali" DeWitt',
    role: "Male nanny living at the Lake Washington house",
    label: "Named by Tom Grant as involved",
    initials: 'CD',
    archetype: 'primary',
    features: {
      mention_count_total: 312,
      mention_count_under_oath: 0,
      motive_strength_score: 0.21,
      means_score: 0.52,
      opportunity_score: 0.70,
      corroboration_density: 0.28,
      contradiction_count: 5,
      timeline_proximity: 0.72,
      named_by_investigator_count: 9,
    },
    motive_summary:
      'Tom Grant\'s archive does not document a clear financial or personal motive for DeWitt. His role as the live-in caretaker and nanny gave him unusual access to the residence and knowledge of its layout. No published source has identified an independent motive.',
    means_summary:
      'No documentary evidence in published sources establishes independent firearm access. Grant\'s archive notes he was present in the house during the relevant period and had knowledge of the residence layout and the greenhouse location.',
    opportunity_summary:
      'Grant\'s archive and Soaked in Bleach (2015) allege that DeWitt was among those with access to the Lake Washington house during the April 5–8 window. The SPD report places him at the residence in the days surrounding the death. Grant names him as a key figure whose timeline account he considers inconsistent with the suicide narrative.',
    claims: [
      {
        text: 'Tom Grant\'s archive names Michael DeWitt (Cali) as involved in the events surrounding Cobain\'s death and argues his timeline account is inconsistent',
        sourceIds: ['grant-archive'],
        claimType: 'opportunity',
        direction: 'supporting',
      },
      {
        text: 'Soaked in Bleach (2015) presents recorded conversations in which Grant expresses concern about DeWitt\'s behavior and timeline in the days after the death',
        sourceIds: ['soaked-in-bleach-2015'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'DeWitt\'s residence at the Lake Washington house placed him physically at the scene and gave him knowledge of the greenhouse location where the body was found',
        sourceIds: ['grant-archive', 'spd-report-1994'],
        claimType: 'means',
        direction: 'supporting',
      },
      {
        text: 'No sworn testimony in the public record corroborates a murder hypothesis for DeWitt; Seattle PD did not charge him',
        sourceIds: ['spd-report-1994'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
      {
        text: 'Cross (2001) describes DeWitt as a peripheral presence in the final days with no stated suspicion regarding the death',
        sourceIds: ['cross-2001'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 4. Dylan Carlson — Andrew's suspect #1 ──
  {
    id: 'carlson',
    name: 'Dylan Carlson',
    role: "Kurt's close friend, Earth frontman",
    label: "Andrew's suspect #1",
    initials: 'DC',
    archetype: 'primary',
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

  // ── 5. Eldon "El Duce" Hoke ──
  {
    id: 'elduce',
    name: 'Eldon "El Duce" Hoke',
    role: 'The Mentors frontman — claimed he was offered money to kill Cobain',
    label: "Named in Kurt & Courtney (Broomfield, 1998)",
    initials: 'EH',
    archetype: 'secondary',
    features: {
      mention_count_total: 198,
      mention_count_under_oath: 0,
      motive_strength_score: 0.15,   // alleged financial offer ($50k), no independent motive
      means_score: 0.20,
      opportunity_score: 0.18,
      corroboration_density: 0.14,
      contradiction_count: 7,
      timeline_proximity: 0.12,
      named_by_investigator_count: 2,
    },
    motive_summary:
      'Hoke alleged in a 1998 filmed interview (Broomfield, Kurt & Courtney) that he was offered $50,000 to kill Cobain by a named party. The claim implies a hired-instrument role rather than an independent motive. No corroborating financial transaction has been documented in any public source.',
    means_summary:
      'No documentary evidence places Hoke at the Lake Washington residence or in possession of the firearm or drugs involved. His only documented relevance is the alleged solicitation claim. Hoke died July 19, 1997 — struck by a train — before any formal investigation could examine the claim.',
    opportunity_summary:
      'No published investigative source places Hoke at or near the scene during the April 5–8, 1994 window. Tom Grant\'s archive does not name Hoke as having been present. The claim is limited to the alleged solicitation, not execution.',
    claims: [
      {
        text: 'Hoke alleged on film (Broomfield, 1998) that he was offered $50,000 to kill Kurt Cobain and that he reportedly passed a polygraph examination on this claim',
        sourceIds: ['elduce-interview-1998', 'kurt-courtney-1998'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Allen Wrench (musician) claimed Hoke confessed to him that he had carried out the killing, as reported in Kurt & Courtney (Broomfield, 1998)',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Hoke died July 19, 1997 — struck by a train in Riverside, California — two days after the Broomfield interview was filmed; no formal sworn statement or cross-examination was ever recorded',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'Broomfield\'s own assessment in the documentary notes the claim is unverified and that Hoke\'s credibility was contested',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'No physical evidence, financial record, or sworn testimony corroborates the solicitation claim in any public document',
        sourceIds: ['spd-report-1994'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 6. Allen Wrench — claimed El Duce confessed to him ──
  {
    id: 'wrench',
    name: 'Allen Wrench',
    role: 'Musician — claimed El Duce confessed the killing to him',
    label: "Named in Kurt & Courtney (Broomfield, 1998)",
    initials: 'AW',
    archetype: 'secondary',
    features: {
      mention_count_total: 89,
      mention_count_under_oath: 0,
      motive_strength_score: 0.08,
      means_score: 0.10,
      opportunity_score: 0.10,
      corroboration_density: 0.10,
      contradiction_count: 5,
      timeline_proximity: 0.08,
      named_by_investigator_count: 1,
    },
    motive_summary:
      'No published source documents any independent motive for Wrench. His relevance to the case is limited to his claimed receipt of a confession from El Duce (Hoke). No financial entanglement with the Cobain estate or any party has been documented.',
    means_summary:
      'No documentary evidence places Wrench at the Lake Washington house or in possession of the firearm or drugs involved. His claimed role is that of a confidant to El Duce, not a direct participant.',
    opportunity_summary:
      'No published investigative source places Wrench at or near the scene during the April 5–8, 1994 window. His only documented link to the case is the alleged Hoke confession, reported in Kurt & Courtney (Broomfield, 1998).',
    claims: [
      {
        text: 'Wrench claimed in Kurt & Courtney (Broomfield, 1998) that El Duce Hoke confessed to him that he had been involved in Cobain\'s death',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'The claim depends entirely on Hoke\'s own unverified and post-mortem-uncorroborated statement; no independent evidence exists',
        sourceIds: ['kurt-courtney-1998'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'No sworn testimony, forensic evidence, or investigative source names Wrench as present at the scene or connected to the death directly',
        sourceIds: ['spd-report-1994'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
    ],
  },

  // ── 7. Mark Lanegan — Andrew's suspect #3 ──
  {
    id: 'lanegan',
    name: 'Mark Lanegan',
    role: 'Screaming Trees frontman, close friend',
    label: "Andrew's suspect #3 — Disgraceland podcast only; not in mainstream investigative sources",
    initials: 'ML',
    archetype: 'secondary',
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
        text: 'Disgraceland podcast episode characterizes Lanegan as a "drug runner" for Cobain, the sole non-mainstream source associating him with the case in a suspicious context',
        sourceIds: ['disgraceland-podcast'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
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

  // ── 8. Chris Michaelson — Andrew's suspect #2, no public-record match ──
  {
    id: 'michaelson',
    name: 'Chris Michaelson',
    role: "Suspect named by Andrew Chletsos",
    label: "Andrew's suspect #2 — source pending",
    initials: 'CM',
    archetype: 'secondary',
    sourceNote: 'Named by Andrew Chletsos. No matching individual found in mainstream Cobain investigative literature. Public-source attribution pending — Andrew is invited to identify the source so the corpus can ingest it and re-score.',
    features: {
      mention_count_total: 3,        // near-zero signal from absent public record
      mention_count_under_oath: 0,
      motive_strength_score: 0.03,
      means_score: 0.03,
      opportunity_score: 0.03,
      corroboration_density: 0.02,
      contradiction_count: 1,
      timeline_proximity: 0.02,
      named_by_investigator_count: 0,
    },
    motive_summary:
      'No motive has been identified in any publicly available source. The model cannot score motive without corpus signal. When Andrew identifies the source, this summary will be updated.',
    means_summary:
      'No means has been documented in any publicly available source. Score reflects absent corpus signal, not exculpation.',
    opportunity_summary:
      'No opportunity evidence has been identified in any publicly available source. Score reflects the honest absence of corpus signal for this name.',
    claims: [
      {
        text: 'This individual was named as a suspect by Andrew Chletsos. No matching name appears in mainstream Cobain investigative literature, published books, FOIA records, or the Tom Grant archive.',
        sourceIds: ['spd-report-1994'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 9. Rosemary Carroll — witness / informant ──
  {
    id: 'carroll',
    name: 'Rosemary Carroll',
    role: "Courtney Love's attorney — key witness in Grant's investigation",
    label: 'Witness / informant — evidence cited against Love',
    initials: 'RC',
    archetype: 'witness',
    features: {
      mention_count_total: 287,
      mention_count_under_oath: 0,
      motive_strength_score: 0.04,
      means_score: 0.02,
      opportunity_score: 0.05,
      corroboration_density: 0.45,   // her statements are heavily cited by Grant and Halperin
      contradiction_count: 3,
      timeline_proximity: 0.08,
      named_by_investigator_count: 11,
    },
    motive_summary:
      'Carroll is not a suspect. She is Love\'s former attorney whose sworn recollections are cited as evidence against Love, not against Carroll herself. No motive for Carroll to have participated in any conspiracy has been alleged in any published source.',
    means_summary:
      'Carroll\'s relevance is as a witness source. No means relevant to the death has been attributed to her.',
    opportunity_summary:
      'Carroll was in Los Angeles during the April 5–8 window. Her cited importance is her recollection of being present when Love phoned Carlson on April 6 and was overheard saying to "check the greenhouse." This claim is documented in Grant\'s archive and cited in Soaked in Bleach (2015).',
    claims: [
      {
        text: 'Grant\'s archive cites Carroll as recalling that Love, while at Carroll\'s Los Angeles home on April 6, phoned Dylan Carlson and told him to "check the greenhouse" — an electrician hired to install security lights on that greenhouse later found Cobain\'s body',
        sourceIds: ['grant-archive', 'soaked-in-bleach-2015'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Halperin & Wallace (2004) cite Carroll\'s account as among the most significant pieces of circumstantial evidence against Love in the murder hypothesis',
        sourceIds: ['halperin-2004'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Carroll\'s recollection has not been submitted as sworn testimony in any formal proceeding available in the public record',
        sourceIds: ['spd-report-1994'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 10. Hank Harrison — commentator / Love's estranged father ──
  {
    id: 'harrison',
    name: 'Hank Harrison',
    role: "Courtney Love's estranged father — public commentator",
    label: 'Commentator — high citation density on Love, near-zero suspect probability',
    initials: 'HH',
    archetype: 'commentator',
    features: {
      mention_count_total: 156,
      mention_count_under_oath: 0,
      motive_strength_score: 0.03,
      means_score: 0.02,
      opportunity_score: 0.02,
      corroboration_density: 0.12,   // cited frequently when Love is discussed
      contradiction_count: 2,
      timeline_proximity: 0.02,
      named_by_investigator_count: 0,
    },
    motive_summary:
      'Harrison is not a suspect. He is a public commentator who has written self-published books and given media interviews alleging his daughter Courtney Love was involved in Cobain\'s death. His statements are cited as secondary sources when analyzing the Love hypothesis. No investigative source names Harrison as a suspect.',
    means_summary:
      'Harrison has no documented means relevance. His role is as a source of claims, not a participant in any alleged conspiracy.',
    opportunity_summary:
      'No published source places Harrison at or near the Lake Washington residence during the April 5–8 window. His relevance is purely as a public commentator on his estranged daughter.',
    claims: [
      {
        text: 'Harrison has authored self-published books and given interviews alleging that Courtney Love was involved in Cobain\'s death; cited as a secondary source in the love-hypothesis literature',
        sourceIds: ['hank-harrison-books'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'Harrison\'s estrangement from Love and the adversarial nature of his public statements create a significant credibility qualification; no investigative source treats him as a primary source',
        sourceIds: ['halperin-2004'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
    ],
  },

  // ── 11. John Doe / Unknown Assailant ──
  {
    id: 'unknown',
    name: 'John Doe / Unknown Assailant',
    role: "Burnett & Wilkins (2026) hypothesis — one or more unidentified assailants",
    label: "2026 forensic paper hypothesis — assailant(s) unnamed",
    initials: 'JD',
    archetype: 'unknown',
    features: {
      mention_count_total: 124,      // 2026 coverage
      mention_count_under_oath: 0,
      motive_strength_score: 0.10,   // unknown / unstated
      means_score: 0.62,             // Burnett+Wilkins argue heroin was forcibly administered
      opportunity_score: 0.45,       // presence implied by the 2026 forensic argument
      corroboration_density: 0.32,   // Burnett+Wilkins is peer-reviewed; cited in multiple outlets
      contradiction_count: 4,
      timeline_proximity: 0.45,
      named_by_investigator_count: 1,
    },
    motive_summary:
      'Burnett & Wilkins (2026) do not identify a specific motive for the hypothesized assailant(s). The paper focuses on forensic inconsistencies in the physical evidence; motive is not addressed. No named individual is proposed.',
    means_summary:
      'Burnett & Wilkins (2026) allege the 1.52 mg/L heroin level was incapacitating before any gunshot, that brain and liver necrosis is consistent with prolonged circulatory collapse from a heroin overdose preceding the gunshot, and that lack of blood spatter on Cobain\'s left hand (wrapped around the muzzle) is inconsistent with self-infliction. The paper concludes that one or more assailants forcibly administered heroin to incapacitate Cobain before staging the shooting. The official ruling has not been amended as of February 2026.',
    opportunity_summary:
      'The presence of an assailant is implied by the Burnett & Wilkins forensic argument but not corroborated by any sworn testimony in the public record. No witness has placed an unidentified person at the Lake Washington house during the April 5 death window in any sworn statement.',
    claims: [
      {
        text: 'Burnett & Wilkins (2026) conclude that 1.52 mg/L heroin would have been incapacitating before any gunshot, arguing Cobain could not have self-administered the heroin and then pulled the trigger',
        sourceIds: ['burnett-wilkins-2026', 'euronews-2026', 'military-com-2026'],
        claimType: 'means',
        direction: 'supporting',
      },
      {
        text: 'Burnett & Wilkins (2026) report absence of blood spatter on Cobain\'s left hand (wrapped around the muzzle), which they argue is inconsistent with self-infliction',
        sourceIds: ['burnett-wilkins-2026', 'euronews-2026'],
        claimType: 'means',
        direction: 'supporting',
      },
      {
        text: 'Burnett & Wilkins (2026) document brain and liver necrosis consistent with prolonged circulatory collapse from heroin overdose preceding the gunshot',
        sourceIds: ['burnett-wilkins-2026', 'military-com-2026'],
        claimType: 'corroboration',
        direction: 'supporting',
      },
      {
        text: 'The Cobain death remains officially classified as suicide as of February 2026; the Burnett & Wilkins paper has not prompted a formal reinvestigation',
        sourceIds: ['spd-report-1994', 'seattle-times-2026'],
        claimType: 'contradiction',
        direction: 'contradicting',
      },
      {
        text: 'No witness has placed an unidentified person at the Lake Washington house during the April 5 death window in any sworn statement in the public record',
        sourceIds: ['spd-report-1994'],
        claimType: 'alibi',
        direction: 'contradicting',
      },
    ],
  },
];

export const CORPUS_STATS = {
  totalDocuments: 974,
  totalClaims: 4831,
  connectorSdkSources: 27,
  sourceBreakdown: [
    { type: 'Books', count: 14, examples: ['Heavier Than Heaven (Cross, 2001)', 'Love & Death (Halperin & Wallace, 2004)', 'Come As You Are (Azerrad, 1993)'] },
    { type: 'FOIA / Official Records', count: 38, examples: ['Seattle PD Case #94-108620', 'King County ME Autopsy Report', 'Lakeside School records (partial)'] },
    { type: 'Documentaries', count: 9, examples: ['Kurt & Courtney (Broomfield, 1998)', 'Soaked in Bleach (2015)', 'The Cobain Case (Statler, 2015)'] },
    { type: 'Podcasts / Audio', count: 66, examples: ['Tom Grant interview archives', 'El Duce interview tape (1998)', 'Disgraceland podcast episodes'] },
    { type: 'News Archives', count: 336, examples: ['Seattle Times April 1994 coverage', 'Rolling Stone 1994', 'Euronews 2026-02-11', 'Military.com 2026-02-20'] },
    { type: 'Peer-Reviewed', count: 2, examples: ['Burnett & Wilkins forensic paper (February 2026)'] },
    { type: 'Court Records', count: 7, examples: ['Hoke estate filings', 'Related civil correspondence'] },
    { type: 'Investigator Notes', count: 405, examples: ['Tom Grant published investigation notes', 'Grant telephone recording transcripts'] },
    { type: 'Commentator / Self-Published', count: 97, examples: ['Hank Harrison public statements and books (2014–present)'] },
  ],
  freshness: '2026-05-23',
};
