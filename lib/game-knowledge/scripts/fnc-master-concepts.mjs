/**
 * Metabuffed Fight Night Champion Master AI Training Spec — concept domain map.
 * Source of truth for generate-fnc-domain-map.mjs
 */
export const CONCEPTS = [
  {
    id: "fight-iq",
    name: "Fight IQ",
    aliases: ["fight iq", "game sense"],
    category: "meta",
    definition:
      "Ability to process opponent patterns, stamina state, scoring context, and FNC animation timing to choose the correct response instead of default habits. High fight IQ means adjusting before the fourth repeated punish, not after losing the round.",
    whyItWorks:
      "FNC rewards reads and punish windows more than raw input speed. Players with fight IQ spend actions where impact scoring and stamina ROI are highest.",
    whenEffective: [
      "Mid-fight when opponent shows a repeating trigger",
      "Late rounds when scorecard and stamina context change decisions",
    ],
    counters: [
      {
        name: "Deny readable patterns",
        explanation: "Vary entry timing and defense rhythm so their reads never confirm",
      },
    ],
    overuseSignals: ["Calling fight IQ when only describing generic boxing awareness"],
    related: ["pattern-speed", "adaptation", "read-confirmed", "exploit-aware-play"],
    communityTerms: ["fight IQ"],
  },
  {
    id: "pattern-speed",
    name: "Pattern Speed",
    aliases: ["pattern speed", "read speed"],
    category: "meta",
    definition:
      "How quickly a player identifies and acts on repeated opponent behaviors within FNC exchanges. Elite players confirm a pattern in two to three reps and commit a punish; slow pattern speed repeats the same losing entry into an established counter.",
    whyItWorks:
      "Most FNC meta punishes (sidestep uppercut, power straight off block release, recovery punish) require recognizing timing before the opponent adapts.",
    whenEffective: [
      "First two rounds when opponent habits are still forming",
      "Against spam-heavy players with obvious triggers",
    ],
    counters: [
      {
        name: "Rhythm break",
        explanation: "Change timing between actions so pattern never fully confirms",
      },
    ],
    overuseSignals: ["Assuming pattern speed without visible repeated exchanges"],
    related: ["rhythm-read", "read-confirmed", "adaptation-failure", "spam-read"],
    communityTerms: ["pattern speed"],
  },
  {
    id: "adaptation",
    name: "Adaptation",
    aliases: ["adapt", "mid-fight adjustment"],
    category: "strategy",
    definition:
      "Mid-fight change to entries, defense rhythm, or offense after the opponent shows a counter. In FNC this means breaking straight-line entries, changing block rhythm, or stopping punch-three habits once a punish is established.",
    whyItWorks:
      "Opponent meta mechanics are trigger-based. Removing or altering the trigger collapses their prepared response.",
    whenEffective: [
      "After second confirmed sidestep uppercut on same entry",
      "When block release timing is being timed with power straight",
    ],
    counters: [
      {
        name: "Layered reads",
        explanation: "Punish the adaptation itself with a secondary trigger",
      },
    ],
    overuseSignals: ["Switching strategy every exchange without evidence of a read"],
    related: ["adaptation-successful", "adaptation-failure", "adaptation-check", "rhythm-break"],
    communityTerms: ["adaptation"],
  },
  {
    id: "adaptation-failure",
    name: "Adaptation Failure",
    aliases: ["failed adaptation", "no adjustment"],
    category: "meta",
    definition:
      "Continuing the same losing pattern after the opponent has clearly established a punish. Classic FNC example: repeating the same sidestep-uppercut entry three or four times after each one was answered by the same sidestep uppercut.",
    whyItWorks:
      "By the third repetition the opponent is no longer reacting — they are waiting on your trigger. FNC scoring and stamina punish this hard.",
    whenEffective: [],
    counters: [
      {
        name: "Adaptation check",
        explanation: "After two punishes, change entry angle, delay second punch, or feint entry",
      },
    ],
    overuseSignals: [
      "Same linear entry punished repeatedly",
      "Same block-hold release timed repeatedly",
    ],
    related: ["adaptation", "adaptation-check", "sidestep-uppercut-read", "straight-line-trap"],
    communityTerms: ["adaptation failure"],
  },
  {
    id: "controlled-efficiency",
    name: "Controlled Efficiency",
    aliases: ["efficient play", "stamina efficiency"],
    category: "strategy",
    definition:
      "Spending stamina and actions only when they produce impact moments, positional gain, or confirmed reads in FNC. Every jab, sidestep, and combo must justify its cost against the round and scorecard context.",
    whyItWorks:
      "FNC rounds turn on stamina collapse and impact scoring, not activity volume. Efficient players win late without needing more inputs.",
    whenEffective: [
      "Long OWC/H2H fights where stamina tax accumulates",
      "When ahead on impact and protecting lead",
    ],
    counters: [
      {
        name: "Stamina tax",
        explanation: "Force misses and chases so their efficiency drops to empty offense",
      },
    ],
    overuseSignals: ["Passive play mistaken for efficiency when giving up steal windows"],
    related: ["stamina-collapse", "movement-waste", "combination-waste", "meaningful-offense"],
    communityTerms: ["controlled efficiency"],
  },
  {
    id: "centerline",
    name: "Centerline",
    aliases: ["center line", "straight line"],
    category: "mechanic",
    definition:
      "Direct line between fighters that FNC straights, jabs, and linear entries track. Controlling centerline means your straight lands before theirs; losing it means sidesteps, uppercuts, and power straights punish your linear path.",
    whyItWorks:
      "Most FNC counter meta assumes the attacker stays on centerline. Step off line and their straight spam and straight-line traps fail.",
    whenEffective: ["Mid-range straight exchanges", "Setting up straight-line trap reads"],
    counters: [
      { name: "Sidestep off line", explanation: "Break tracking before committing punch two or three" },
    ],
    overuseSignals: ["Staying on centerline after opponent shows sidestep-uppercut read"],
    related: ["straight-line-trap", "straight-line-pressure", "off-center-positioning", "sidestep"],
    communityTerms: ["centerline"],
  },
  {
    id: "off-center-positioning",
    name: "Off-Center Positioning",
    aliases: ["off center", "angle step"],
    category: "technique",
    definition:
      "Stepping lateral to break opponent straight tracking and create counter angles without full retreat. In FNC this is the foundation for sidestep uppercuts, push straights off angle, and escaping straight-line pressure.",
    whyItWorks:
      "Opponent straight and jab tracking assumes shared centerline. Off-center steps force whiffs or weak blocks and open recovery punish windows.",
    whenEffective: ["Against straight spam and linear pressure", "Before counter straight or uppercut"],
    counters: [
      { name: "Cut angle", explanation: "Step to re-establish centerline while they are recovering from sidestep" },
    ],
    overuseSignals: ["Repeated sidestep without follow-up punch — becomes movement waste"],
    related: ["sidestep", "micro-positioning", "centerline", "sidestep-uppercut"],
    communityTerms: ["off-center positioning"],
  },
  {
    id: "micro-positioning",
    name: "Micro-Positioning",
    aliases: ["micro position", "small adjustments"],
    category: "technique",
    definition:
      "Small foot and guard adjustments that change punch line without full sidestep or backstep commitment. Used in Money Team resets and to maintain counter range while staying in block rhythm.",
    whyItWorks:
      "Micro shifts keep you in safe defensive state while denying opponent clean straight tracking — lower stamina cost than full movement.",
    whenEffective: ["Inside Money Team reset phase", "Maintaining jab range without overcommitting"],
    counters: [
      { name: "Body during reset", explanation: "Attack low line while they micro-adjust without counter threat" },
    ],
    overuseSignals: ["Micro-positioning without block refresh or counter — static shell"],
    related: ["half-step", "money-team-rhythm", "weave-reset", "distance-management"],
    communityTerms: ["micro positioning"],
  },
  {
    id: "half-step",
    name: "Half-Step",
    aliases: ["half step", "short step"],
    category: "technique",
    definition:
      "Short forward or lateral step used to probe range, feint entry, or maintain pressure range without triggering full punch commitment or punch-three recovery in FNC.",
    whyItWorks:
      "Draws reactions (block, sidestep uppercut) at low cost so you can read before committing power straight or combo.",
    whenEffective: ["Testing sidestep-uppercut read", "Maintaining pressure without straight-line trap"],
    counters: [
      { name: "Wait for overcommit", explanation: "Let half-step become full entry then punish recovery" },
    ],
    overuseSignals: ["Half-steps that never change — become predictable feint rhythm"],
    related: ["jab-as-data", "pressure-range", "micro-positioning", "bait"],
    communityTerms: ["half step"],
  },
  {
    id: "distance-management",
    name: "Distance Management",
    aliases: ["range control", "distance control"],
    category: "strategy",
    definition:
      "Controlling outside, mid-range, and pocket distance so opponent attacks from unfavorable range in FNC. Includes knowing when to step in for pressure range versus when to hold counter range for recovery punish.",
    whyItWorks:
      "Wrong range turns your offense into whiffs and their offense into impact moments. Reach and speed builds live or die on distance management.",
    whenEffective: ["Outfighter vs pressure matchups", "Speed-based fighter vs heavy-impact fighter"],
    counters: [
      { name: "Cut the ring", explanation: "Limit lateral escape and force exchanges at their bad range" },
    ],
    overuseSignals: ["Backpedaling in straight line under pressure — straight-line-retreat tell"],
    related: ["pressure-range", "counter-range", "reach-advantage", "reach-disadvantage"],
    communityTerms: ["distance management"],
  },
  {
    id: "pressure-range",
    name: "Pressure Range",
    aliases: ["pressure distance", "closing range"],
    category: "mechanic",
    definition:
      "Distance where forward steps force opponent backward or into shell without you overcommitting punch three. Real pressure lives here — fake pressure steps in but throws nothing meaningful.",
    whyItWorks:
      "Forces defensive reactions (block refresh, weave) that create readable release timing and body openings at manageable stamina cost.",
    whenEffective: ["Against stationary-defense and static-block", "Setting up body-investment"],
    counters: [
      { name: "Sidestep counter", explanation: "Change line as pressure steps in behind jab rhythm" },
    ],
    overuseSignals: ["Stepping forward without jab or body threat — feeds sidestep uppercut"],
    related: ["real-pressure", "fake-pressure", "body-pressure", "straight-line-pressure"],
    communityTerms: ["pressure range"],
  },
  {
    id: "counter-range",
    name: "Counter Range",
    aliases: ["counter distance", "punish range"],
    category: "mechanic",
    definition:
      "Distance where opponent commitment creates recovery windows for power straight, whiff punish, or sidestep uppercut. Counter-range play invites the opponent to punch first then punishes animation recovery.",
    whyItWorks:
      "FNC impact scoring favors clean counters over volume. Counter range maximizes recovery-window value per stamina spent.",
    whenEffective: ["Against straight spam and emotional-aggression", "When opponent chases after whiffs"],
    counters: [
      { name: "Feint commitment", explanation: "Draw partial startup without full recovery window for you" },
    ],
    overuseSignals: ["Standing at counter range but missing recovery punishes"],
    related: ["recovery-window", "counter-window", "whiff-punish", "counter-puncher"],
    communityTerms: ["counter range"],
  },
  {
    id: "cutting-the-ring",
    name: "Cutting the Ring",
    aliases: ["ring cutting", "cut off"],
    category: "strategy",
    definition:
      "Lateral movement that limits opponent backpedaling and sidestep escape space using FNC ring geometry. Cuts force straight-line retreat or shell instead of free angle resets.",
    whyItWorks:
      "Outfighters and speed-based fighters rely on space to reset rhythm. Cutting the ring collapses their distance-management plan.",
    whenEffective: ["Against outfighter and back-step patterns", "When opponent favors straight-line-retreat"],
    counters: [
      { name: "Hard pivot sidestep", explanation: "Change escape angle through cut rather than backing straight" },
    ],
    overuseSignals: ["Chasing forward instead of cutting — runs into straight-line trap"],
    related: ["chasing", "straight-line-retreat", "pressure-range", "real-pressure"],
    communityTerms: ["cutting the ring"],
  },
  {
    id: "chasing",
    name: "Chasing",
    aliases: ["chase", "pursuit offense"],
    category: "exploit",
    definition:
      "Pursuing opponent after failed attacks, whiffs, or stun with high-input volume and low impact return. Chasing burns stamina, feeds counter-range play, and often loses the round despite looking active.",
    whyItWorks:
      "Only works against panicked or stamina-collapsed opponents. Against disciplined defense it creates recovery windows for the retreating player.",
    whenEffective: ["Opponent is stamina-collapsed with no escape punch", "Confirmed stun with intelligent-finish setup"],
    counters: [
      { name: "Escape punch", explanation: "Push straight or step-back straight while exiting range" },
    ],
    overuseSignals: ["Panic-chase-after-stun", "Chasing after every blocked combo"],
    related: ["panic-chase-after-stun", "movement-waste", "stamina-collapse", "emotional-aggression"],
    communityTerms: ["chasing"],
  },
  {
    id: "money-team-rhythm",
    name: "Money Team Rhythm",
    aliases: ["money team system", "mt rhythm", "money team cycle"],
    category: "mechanic",
    definition:
      "Full FNC defensive-offensive system: block → refresh → weave → reposition → power straight → reset. This is the Money Team system — not holding block. Each phase must flow into counter threat or the rhythm becomes static-block.",
    whyItWorks:
      "Forces opponent to attack the rhythm instead of a stationary guard. Offensive threat out of defense creates hesitation and power-straight counter windows on block release.",
    whenEffective: ["OWC/H2H high-level exchanges", "When paired with power-straight-engineering"],
    counters: [
      { name: "Attack the rhythm", explanation: "Body during reset, slow the fight, step in without throwing to force early refresh" },
    ],
    overuseSignals: ["Holding block without refresh, weave, or counter — not Money Team"],
    related: ["money-team-block", "block-refresh", "weave-reset", "power-straight", "pump-block"],
    communityTerms: ["Money Team", "Money Team rhythm", "MTB system"],
  },
  {
    id: "pump-block",
    name: "Pump Block",
    aliases: ["pump blocking", "block tap"],
    category: "mechanic",
    definition:
      "Tapping block to refresh guard stamina and reset block state without holding. Core input in Money Team rhythm — separates active shell from static-block hold patterns.",
    whyItWorks:
      "Refresh keeps guard effective while preserving movement and counter options. Predictable pump rhythm becomes readable for power straight off release.",
    whenEffective: ["Inside Money Team cycle", "When opponent is timing block-hold-pattern"],
    counters: [
      { name: "Time release", explanation: "Power straight or body shot as guard refreshes and opens" },
    ],
    overuseSignals: ["Pump-block at fixed interval — block-rhythm tell"],
    related: ["block-refresh", "static-block", "block-rhythm", "money-team-rhythm"],
    communityTerms: ["pump block", "pump blocking"],
  },
  {
    id: "static-block",
    name: "Static Block",
    aliases: ["static block", "block hold", "held block"],
    category: "mechanic",
    definition:
      "Master Spec term: holding block through multiple exchanges without refresh, weave, reposition, or counter threat. Anti-pattern distinct from Money Team system — opponent times straights and body shots off predictable release.",
    whyItWorks:
      "It does not work at high level — included as a diagnosable failure mode. Early-round shell may block volume until opponent reads release timing.",
    whenEffective: ["Never optimal — only briefly against low pattern-speed opponents"],
    counters: [
      { name: "Straight off release", explanation: "Time power straight when static block finally opens" },
      { name: "Body investment", explanation: "Drain stamina and guard while they hold high shell" },
    ],
    overuseSignals: ["Block held through three or more exchanges", "No weave-reset or power straight counter"],
    related: ["block-hold-pattern", "stationary-defense", "money-team-rhythm", "power-straight"],
    communityTerms: ["static block", "holding block"],
  },
  {
    id: "weave-reset",
    name: "Weave Reset",
    aliases: ["weave reset", "head movement reset"],
    category: "mechanic",
    definition:
      "Head movement or weave after block refresh to exit shell, change punch line, and reposition — the weave phase of Money Team rhythm before counter or reset.",
    whyItWorks:
      "Breaks straight tracking through shell and sets up power straight or reposition without staying in static-block state.",
    whenEffective: ["After pump-block refresh", "When opponent is straight-spamming into shell"],
    counters: [
      { name: "Uppercut on weave", explanation: "Attack rising line during weave animation if timing is predictable" },
    ],
    overuseSignals: ["Same weave direction every cycle — predictable lean pattern"],
    related: ["money-team-rhythm", "micro-lean", "block-refresh", "predictable-lean"],
    communityTerms: ["weave reset"],
  },
  {
    id: "micro-lean",
    name: "Micro-Lean",
    aliases: ["micro lean", "slight lean"],
    category: "technique",
    definition:
      "Small lean input to slip a punch line while maintaining counter readiness and low stamina cost. Distinct from lean-back escape — micro-lean stays in exchange range.",
    whyItWorks:
      "Creates whiffs and weak contact without full sidestep commitment, preserving counter-range position.",
    whenEffective: ["Against jab rhythm probes", "Inside block-rhythm exchanges"],
    counters: [
      { name: "Feint jab", explanation: "Draw lean then attack opposite line with straight or hook" },
    ],
    overuseSignals: ["Same lean direction repeatedly — becomes predictable-lean"],
    related: ["predictable-lean", "lean-back", "micro-positioning", "rhythm-read"],
    communityTerms: ["micro lean"],
  },
  {
    id: "predictable-lean",
    name: "Predictable Lean",
    aliases: ["readable lean", "lean tell"],
    category: "exploit",
    definition:
      "Repeated lean direction or timing that opponent reads and times with power straight or uppercut through the lean path. Common when defensive-discipline breaks into habit.",
    whyItWorks:
      "Lean animations have recovery frames. Opponent with rhythm-read commits during the lean window for impact moment.",
    whenEffective: [],
    counters: [
      { name: "Alternate lean side", explanation: "Break lean pattern once punished twice" },
    ],
    overuseSignals: ["Lean same direction after every jab", "Lean without counter threat"],
    related: ["micro-lean", "lean-back", "rhythm-read", "power-straight"],
    communityTerms: ["predictable lean"],
  },
  {
    id: "sidestep",
    name: "Sidestep",
    aliases: ["side step", "lateral step"],
    category: "mechanic",
    definition:
      "Lateral step that changes punch line — foundation for sidestep uppercut, sidestep counters, and off-center-positioning. Not every uppercut after movement is sidestep uppercut; the sidestep must connect immediately to the counter punch.",
    whyItWorks:
      "Breaks centerline tracking so linear entries whiff or land weak, opening recovery punish or immediate counter.",
    whenEffective: ["Against straight-line-pressure", "When connected immediately to uppercut or straight"],
    counters: [
      { name: "Delayed second punch", explanation: "Do not follow entry into waiting sidestep uppercut" },
    ],
    overuseSignals: ["Sidestep without immediate follow-up — movement-waste"],
    related: ["sidestep-uppercut", "off-center-positioning", "sidestep-spam", "centerline"],
    communityTerms: ["sidestep"],
  },
  {
    id: "sidestep-uppercut-read",
    name: "Sidestep Uppercut Read",
    aliases: ["su read", "sidestep uppercut read"],
    category: "strategy",
    definition:
      "Recognizing opponent waits for linear entry to trigger sidestep uppercut. Once read is confirmed, change entry angle, feint entry, or punish recovery instead of repeating the same forward line.",
    whyItWorks:
      "Sidestep uppercut spam depends on your entry trigger. Removing the trigger collapses their highest-value counter.",
    whenEffective: ["After two identical sidestep uppercuts on your entry", "Against pressure-counter-fighter archetype"],
    counters: [
      { name: "Feint entry", explanation: "Draw sidestep uppercut then recovery-punish" },
      { name: "Angle entry", explanation: "Step off centerline before second punch" },
    ],
    overuseSignals: ["Continuing linear entry after third sidestep uppercut — adaptation-failure"],
    related: ["sidestep-uppercut", "adaptation-failure", "read-confirmed", "straight-line-trap"],
    communityTerms: ["sidestep uppercut read"],
  },
  {
    id: "philly-shell",
    name: "Philly Shell",
    aliases: ["philly shell", "shell guard"],
    category: "mechanic",
    definition:
      "Guard configuration and body positioning associated with shell defense in FNC community play. Often overlaps with Money Team shell but Philly Shell alone does not imply full Money Team rhythm — must still refresh, weave, and counter.",
    whyItWorks:
      "Covers body and head lines while allowing pump-block and lean counters when actively managed.",
    whenEffective: ["Mid-range against straight-heavy opponents", "As entry into Money Team rhythm"],
    counters: [
      { name: "Body during shell", explanation: "Attack body line when shell is high and static" },
    ],
    overuseSignals: ["Shell without block refresh — static-block pattern"],
    related: ["money-team-block", "cross-block", "static-block", "money-team-rhythm"],
    communityTerms: ["Philly Shell", "shell"],
  },
  {
    id: "cross-block",
    name: "Cross Block",
    aliases: ["cross block", "cross-block guard"],
    category: "mechanic",
    definition:
      "Block style/guard configuration in FNC affecting head movement options, counter angles, and stamina cost during shell exchanges. Build and boxer selection affect cross-block effectiveness in OWC/H2H.",
    whyItWorks:
      "Different block styles change which counters are available out of shell and how fast block refresh recovers.",
    whenEffective: ["OWC build planning with Money Team archetype", "H2H when opponent uses straight-heavy meta"],
    counters: [
      { name: "Test block style", explanation: "Probe with jab-as-data to see release and lean options" },
    ],
    overuseSignals: ["Assuming cross-block without build context in analysis"],
    related: ["philly-shell", "block-refresh", "owc-build", "meta-build"],
    communityTerms: ["cross block"],
  },
  {
    id: "block-rhythm",
    name: "Block Rhythm",
    aliases: ["block rhythm", "guard rhythm"],
    category: "mechanic",
    definition:
      "Timing pattern of block tap, refresh, and release during defensive exchanges. Readable block-rhythm lets opponent time power straight off release or body during reset phase.",
    whyItWorks:
      "When rhythm is varied and tied to Money Team cycle, opponent cannot commit on fixed beat. When static, it becomes block-hold-pattern exploit.",
    whenEffective: ["Active Money Team play with weave-reset between taps"],
    counters: [
      { name: "Rhythm read", explanation: "Count tap-release interval then power straight on beat" },
    ],
    overuseSignals: ["Same tap interval for three or more exchanges"],
    related: ["rhythm-read", "pump-block", "block-hold-pattern", "defensive-chants"],
    communityTerms: ["block rhythm"],
  },
  {
    id: "defensive-chants",
    name: "Defensive Chants",
    aliases: ["defensive chants", "defense rhythm inputs"],
    category: "terminology",
    definition:
      "Community term for rhythmic defensive input patterns — block tap sequences, weave timing, and reset cadence that experienced players internalize as repeatable chants during Money Team exchanges.",
    whyItWorks:
      "Consistent input rhythm enables muscle-memory Money Team cycles at high speed, but predictable chants become readable to rhythm-read opponents.",
    whenEffective: ["High-level Money Team execution under pressure"],
    counters: [
      { name: "Break their chant", explanation: "Vary offense timing so their defensive rhythm never settles" },
    ],
    overuseSignals: ["Defensive chant with no counter threat — static-block with rhythm"],
    related: ["money-team-rhythm", "block-rhythm", "rhythm-read", "defensive-discipline"],
    communityTerms: ["defensive chants"],
  },
  {
    id: "power-straight-engineering",
    name: "Power Straight Engineering",
    aliases: ["power straight setup", "engineering power straight"],
    category: "strategy",
    definition:
      "Deliberate setup of power straight through confirmed reads: block release timing, recovery window after combo, linear entry punish, or weave-reset opening. Not throwing powered straight without trigger.",
    whyItWorks:
      "Power straight is highest impact per input when timed to commitment-window. Engineering creates impact moments that swing FNC round scoring.",
    whenEffective: ["After read-confirmed block release", "Recovery-window after opponent punch three"],
    counters: [
      { name: "Sidestep off line", explanation: "Break centerline before straight lands" },
    ],
    overuseSignals: ["Power straight without visible setup — becomes straight-spam"],
    related: ["power-straight", "commitment-window", "recovery-punish", "controlled-cheese"],
    communityTerms: ["power straight engineering"],
  },
  {
    id: "commitment-window",
    name: "Commitment Window",
    aliases: ["commitment window", "overcommit moment"],
    category: "mechanic",
    definition:
      "Moment in FNC exchange where opponent commits to punch or combo and cannot safely defend or reposition until animation recovery completes.",
    whyItWorks:
      "All counter meta (power straight, whiff punish, sidestep uppercut) targets this window. Missing it is missed-counter-window.",
    whenEffective: ["Punch three of long combos", "After whiff or push straight overcommitment"],
    counters: [
      { name: "Feint to draw partial commit", explanation: "Only half-commit so you are not in your own window" },
    ],
    overuseSignals: ["Throwing punch three without read — creates own commitment-window"],
    related: ["recovery-window", "overcommitment", "counter-window", "whiff"],
    communityTerms: ["commitment window"],
  },
  {
    id: "straight-spam",
    name: "Straight Spam",
    aliases: ["straight spam", "spamming straights"],
    category: "exploit",
    definition:
      "Repeated straight responses especially when waiting for the same trigger — forward entry, block release, or retreat line. Distinct from jab rhythm when same powered or timed straight fires on every trigger.",
    whyItWorks:
      "Low pattern-speed opponents feed the same trigger repeatedly. Becomes punishable via sidestep, lean read, or body during arm extension.",
    whenEffective: ["Against predictable entries", "When opponent has adaptation-failure"],
    counters: [
      { name: "Sidestep uppercut", explanation: "Punish linear straight path after lateral step" },
    ],
    overuseSignals: ["Same straight on every forward step — readable spam"],
    related: ["straight-line-pressure", "push-straight", "spam-read", "power-straight"],
    communityTerms: ["straight spam"],
  },
  {
    id: "straight-line-trap",
    name: "Straight-Line Trap",
    aliases: ["linear trap", "straight line trap"],
    category: "strategy",
    definition:
      "Forcing opponent to move or attack on straight line so sidestep uppercut, power straight, or back-step straight can punish. You control centerline until they commit linearly.",
    whyItWorks:
      "FNC tracking favors linear paths. Opponent who only knows forward/back on centerline walks into prepared counter.",
    whenEffective: ["Against pressure-fighter with fixed entry", "When you have sidestep-uppercut-read confirmed on them"],
    counters: [
      { name: "Angle entry", explanation: "Step off line before second punch in combo" },
    ],
    overuseSignals: ["Trap set but no punish connected — opponent learns to ignore"],
    related: ["centerline", "sidestep-uppercut", "straight-line-pressure", "bait"],
    communityTerms: ["straight line trap"],
  },
  {
    id: "jab",
    name: "Jab",
    aliases: ["lead jab", "jab punch"],
    category: "mechanic",
    definition:
      "Fastest punch in FNC — range probe, rhythm starter, and setup for straight or body follow-up. Jab alone scores lightly; value comes from data gathered and second-punch timing.",
    whyItWorks:
      "Low commitment cost lets you test block rhythm, lean direction, and sidestep tendency before power investment.",
    whenEffective: ["Opening pressure-range", "Jab-setup for straight or body"],
    counters: [
      { name: "Pull counter straight", explanation: "Answer jab with timed straight during extension" },
    ],
    overuseSignals: ["Empty-jab-volume with no follow-up read"],
    related: ["jab-as-data", "jab-setup", "empty-jab-volume", "pressure-range"],
    communityTerms: ["jab"],
  },
  {
    id: "jab-as-data",
    name: "Jab as Data",
    aliases: ["jab for reads", "probing jab"],
    category: "strategy",
    definition:
      "Using jab primarily to gather opponent reaction data — block tap, lean, sidestep, counter straight — before committing combo or power straight.",
    whyItWorks:
      "One jab stamina cost buys read-confirmed information for high-ROI power straight or body-investment plan.",
    whenEffective: ["First exchanges of round", "Against unknown opponent patterns"],
    counters: [
      { name: "Same response every jab", explanation: "Give false data then punish their prepared counter" },
    ],
    overuseSignals: ["Jabbing without recording or acting on reactions"],
    related: ["jab", "read-confirmed", "rhythm-read", "pattern-speed"],
    communityTerms: ["jab as data"],
  },
  {
    id: "empty-jab-volume",
    name: "Empty Jab Volume",
    aliases: ["empty jabs", "jab volume without impact"],
    category: "exploit",
    definition:
      "High jab volume without follow-up impact, positional gain, or read utility. Inflates punch stats but loses impact-fight scoring and drains stamina for low return.",
    whyItWorks:
      "Only effective against opponents who panic to shell. Disciplined players tax empty jabs with counter straight or body.",
    whenEffective: [],
    counters: [
      { name: "Counter jab", explanation: "Straight or body when they jab without follow-up" },
    ],
    overuseSignals: ["Jab count high but no second punch or impact moment"],
    related: ["empty-offense", "winning-statistical-fight", "stamina-fraud", "jab"],
    communityTerms: ["empty jab volume"],
  },
  {
    id: "body-investment",
    name: "Body Investment",
    aliases: ["body investment", "body work plan"],
    category: "strategy",
    definition:
      "Sustained body attack plan to drain opponent stamina, open head later, and force defensive-frustration. Body shots in FNC carry stamina tax that compounds into late-round collapse.",
    whyItWorks:
      "Head shell stays strong until body stamina tax accumulates. Connects to stamina-collapse, especially vs static-block and stationary-defense.",
    whenEffective: ["Mid-round against shell-heavy opponents", "When opponent shows movement-waste on head chase"],
    counters: [
      { name: "Body return", explanation: "Trade body when they invest — stamina war both ways" },
    ],
    overuseSignals: ["Body spam without head threat — becomes body-spam without payoff"],
    related: ["body-pressure", "body-spam", "stamina-collapse", "stamina-fraud"],
    communityTerms: ["body investment"],
  },
  {
    id: "body-pressure",
    name: "Body Pressure",
    aliases: ["body pressure", "body attack pressure"],
    category: "strategy",
    definition:
      "Body shots combined with forward pressure-range steps to force block-low reactions and open head counters. Distinct from static body-spam — pressure implies positional follow-up.",
    whyItWorks:
      "Forces opponent to split guard attention and breaks Money Team rhythm when body is attacked during reset.",
    whenEffective: ["Against money-team-rhythm with high shell", "Real-pressure combinations"],
    counters: [
      { name: "Clinch or pivot", explanation: "Exit body line and reset distance" },
    ],
    overuseSignals: ["Body without forward threat — opponent shells and counters"],
    related: ["body-investment", "body-spam", "pressure-range", "real-pressure"],
    communityTerms: ["body pressure"],
  },
  {
    id: "interruption-offense",
    name: "Interruption Offense",
    aliases: ["interrupt offense", "interrupting attacks"],
    category: "technique",
    definition:
      "Attacking during opponent startup or between combo punches to deny their rhythm completion. Uses jab, straight, or body to stop block-rhythm or combo before punch three.",
    whyItWorks:
      "FNC combos have vulnerable gaps between punches. Interruption creates whiffs and defensive-frustration without full counter commitment.",
    whenEffective: ["Against long combination-waste patterns", "When opponent telegraphs combo start"],
    counters: [
      { name: "Single-shot discipline", explanation: "Throw one punch and exit so interruption whiffs" },
    ],
    overuseSignals: ["Interrupting without follow-up punish"],
    related: ["rhythm-break", "commitment-window", "free-offense", "counter-window"],
    communityTerms: ["interruption offense"],
  },
  {
    id: "escape-punch",
    name: "Escape Punch",
    aliases: ["escape punch", "punch on exit"],
    category: "technique",
    definition:
      "Punch thrown while exiting range — push straight, step-back straight, back-step straight — scoring or discouraging chase without staying in counter-range.",
    whyItWorks:
      "Punishes chasing and panic offense while creating safe distance reset. Key tool for outfighter and speed-based-fighter archetypes.",
    whenEffective: ["Opponent chases after whiff", "Exiting straight-line-pressure"],
    counters: [
      { name: "Do not chase", explanation: "Cut ring instead of running into escape punch line" },
    ],
    overuseSignals: ["Same escape punch every retreat — readable timing"],
    related: ["push-straight", "back-step-straight", "back-step", "chasing"],
    communityTerms: ["escape punch"],
  },
  {
    id: "animation-recovery-exploitation",
    name: "Animation Recovery Exploitation",
    aliases: ["animation exploit", "recovery frame exploit"],
    category: "exploit",
    definition:
      "Punishing fixed recovery frames after specific FNC punch or defensive animations complete — whiff recovery, weave end, combo finish, block release.",
    whyItWorks:
      "FNC uses animation-locked windows. Elite players map which moves create longest recovery-window for power straight or recovery-punish.",
    whenEffective: ["After whiff on power punch", "Block release in static-block pattern"],
    counters: [
      { name: "Shorten combos", explanation: "Stop at punch two to minimize recovery exposure" },
    ],
    overuseSignals: ["Calling exploit without identifying which animation"],
    related: ["recovery-window", "recovery-punish", "whiff-punish", "commitment-window"],
    communityTerms: ["animation recovery"],
  },
  {
    id: "whiff",
    name: "Whiff",
    aliases: ["whiffed punch", "miss"],
    category: "mechanic",
    definition:
      "Missed punch in FNC that spends stamina and opens recovery-window before guard resets. Whiffs are highest tax events when opponent has counter-range discipline.",
    whyItWorks:
      "N/A as offensive choice — whiff is failure state. Defensively, inducing whiffs is core stamina-tax strategy.",
    whenEffective: [],
    counters: [
      { name: "Whiff punish", explanation: "Attack during recovery before guard returns" },
    ],
    overuseSignals: ["Power-punch-waste on repeated whiffs", "Chasing after own whiff"],
    related: ["whiff-punish", "missed-whiff-punish", "recovery-window", "stamina-tax"],
    communityTerms: ["whiff"],
  },
  {
    id: "missed-whiff-punish",
    name: "Missed Whiff Punish",
    aliases: ["missed whiff punish", "failed whiff punish"],
    category: "counterplay",
    definition:
      "Failure to capitalize on visible opponent whiff and recovery-window. Common when player chases volume instead of counter-range discipline.",
    whyItWorks:
      "N/A — this is a failure mode. Each missed whiff punish lets opponent recover stamina and reset rhythm free.",
    whenEffective: [],
    counters: [
      { name: "Counter-range discipline", explanation: "Hold position and fire power straight during recovery" },
    ],
    overuseSignals: ["Opponent whiffs repeatedly with no punish connected"],
    related: ["whiff-punish", "missed-recovery-punish", "missed-counter-window", "hesitation"],
    communityTerms: ["missed whiff punish"],
  },
  {
    id: "rhythm",
    name: "Rhythm",
    aliases: ["exchange rhythm", "timing rhythm"],
    category: "meta",
    definition:
      "Predictable timing pattern in offense or defense — jab-straight beat, block tap interval, entry-punish cycle. Rhythm is neutral until opponent rhythm-reads it.",
    whyItWorks:
      "Human input and FNC animation cadence create repeating beats. Meta play exploits or breaks those beats.",
    whenEffective: ["When establishing Money Team rhythm", "When setting bait for reaction-bait"],
    counters: [
      { name: "Rhythm break", explanation: "Deliberately skip or delay beat to ruin prepared counter" },
    ],
    overuseSignals: ["Same beat for entire round without variation"],
    related: ["rhythm-read", "rhythm-break", "block-rhythm", "timing-pattern"],
    communityTerms: ["rhythm"],
  },
  {
    id: "rhythm-read",
    name: "Rhythm Read",
    aliases: ["rhythm read", "reading rhythm"],
    category: "strategy",
    definition:
      "Master Spec term: identifying opponent attack or block timing pattern to set up counter, power straight off release, or controlled-cheese. Distinct from guessing — requires confirmed repetition of the same beat.",
    whyItWorks:
      "Once rhythm is read, next action becomes reaction not decision for the reader — they commit during your predictable window.",
    whenEffective: ["After two or three identical block-rhythm or entry cycles", "Against defensive-chants patterns"],
    counters: [
      { name: "Rhythm break", explanation: "Change interval or skip action in sequence" },
    ],
    overuseSignals: ["Calling rhythm read after single exchange"],
    related: ["read-confirmed", "controlled-cheese", "block-rhythm", "timing-trap"],
    communityTerms: ["rhythm read"],
  },
  {
    id: "rhythm-break",
    name: "Rhythm Break",
    aliases: ["break rhythm", "rhythm disruption"],
    category: "counterplay",
    definition:
      "Deliberately changing timing between actions to disrupt opponent prepared response — delay second punch, skip jab in sequence, or pause before entry.",
    whyItWorks:
      "Counters keyed to rhythm-read fire on wrong frame when beat shifts, causing whiff or missed-counter-window for them.",
    whenEffective: ["When opponent shows spam-read on your entries", "Against straight-spam triggers"],
    counters: [
      { name: "Patience trap", explanation: "Opponent waits longer — do not commit first after break" },
    ],
    overuseSignals: ["Breaking rhythm without purpose — gives up your own pressure"],
    related: ["rhythm-read", "rhythm-manipulation", "adaptation", "bait"],
    communityTerms: ["rhythm break"],
  },
  {
    id: "bait",
    name: "Bait",
    aliases: ["baiting", "feint bait"],
    category: "strategy",
    definition:
      "Deliberate partial action — feint jab, half-step entry, shell opening — to draw opponent commitment for punish.",
    whyItWorks:
      "FNC players trained on triggers will throw prepared counter into bait, creating whiff or overcommitment.",
    whenEffective: ["Against sidestep-uppercut-read setups", "When opponent has pattern-speed on your habits"],
    counters: [
      { name: "Do not bite", explanation: "Wait for full commit before countering bait" },
    ],
    overuseSignals: ["Same bait three times — becomes your tell"],
    related: ["reaction-bait", "timing-trap", "half-step", "read-confirmed"],
    communityTerms: ["bait"],
  },
  {
    id: "reaction-bait",
    name: "Reaction Bait",
    aliases: ["reaction bait", "trigger bait"],
    category: "strategy",
    definition:
      "Creating situation where opponent trained reaction becomes punishable — feint entry to draw sidestep uppercut then recovery-punish, or jab to draw lean then straight opposite line.",
    whyItWorks:
      "Meta-heavy opponents run scripts. Reaction bait breaks script by giving false trigger.",
    whenEffective: ["Against ultimate-cheeser and spam-read players", "After read-confirmed on their counter"],
    counters: [
      { name: "Secondary read", explanation: "Recognize bait and hold counter for real commit" },
    ],
    overuseSignals: ["Bait without punish follow-up"],
    related: ["bait", "sidestep-uppercut-read", "timing-trap", "controlled-cheese"],
    communityTerms: ["reaction bait"],
  },
  {
    id: "pressure-fighter",
    name: "Pressure Fighter",
    aliases: ["pressure fighter", "pressure style"],
    category: "matchup",
    definition:
      "Archetype favoring forward movement, volume, and forcing mistakes at pressure-range. In FNC must distinguish real-pressure from fake-pressure to score impact rounds.",
    whyItWorks:
      "Forces shell, stamina tax, and defensive-frustration when combined with body-investment and meaningful-offense.",
    whenEffective: ["Against outfighter with poor escape punch", "When opponent shows adaptation-failure"],
    counters: [
      { name: "Pressure-counter-fighter tools", explanation: "Sidestep uppercut, pull counter on linear entries" },
    ],
    overuseSignals: ["Forward steps without impact — fake-pressure"],
    related: ["real-pressure", "fake-pressure", "pressure-counter-fighter", "straight-line-pressure"],
    communityTerms: ["pressure fighter"],
  },
  {
    id: "real-pressure",
    name: "Real Pressure",
    aliases: ["real pressure", "effective pressure"],
    category: "strategy",
    definition:
      "Forward pressure that produces impact moments, body-investment, or forced defensive errors — not empty volume. Each step threatens jab-setup, body, or inside-fighting entry.",
    whyItWorks:
      "Opponent must respond with real defense stamina cost. Creates scoring and opens adaptation-failure when they repeat wrong answers.",
    whenEffective: ["Mid-round stamina advantage", "Against stationary-defense"],
    counters: [
      { name: "Counter-range reset", explanation: "Sidestep uppercut or escape punch to exit pressure" },
    ],
    overuseSignals: ["High punch volume with no impact moments"],
    related: ["pressure-fighter", "body-pressure", "meaningful-offense", "pressure-range"],
    communityTerms: ["real pressure"],
  },
  {
    id: "fake-pressure",
    name: "Fake Pressure",
    aliases: ["fake pressure", "empty pressure"],
    category: "exploit",
    definition:
      "Forward steps and activity without meaningful offense — looks aggressive but feeds sidestep uppercut, counter straight, and stamina tax with no scoring return.",
    whyItWorks:
      "Only punishes passive opponents. Counter-punchers and pressure-counter-fighters feast on fake-pressure entries.",
    whenEffective: [],
    counters: [
      { name: "Sidestep uppercut on entry", explanation: "Punish linear forward step without threat" },
    ],
    overuseSignals: ["Steps forward every beat with jab only or no punch"],
    related: ["empty-offense", "fake-pressure", "emotional-aggression", "straight-line-trap"],
    communityTerms: ["fake pressure"],
  },
  {
    id: "pressure-counter-fighter",
    name: "Pressure Counter Fighter",
    aliases: ["pressure counter", "counter pressure style"],
    category: "matchup",
    definition:
      "Style that counters forward entries with sidestep uppercut, pull counter, and recovery punish — waits at counter-range for pressure-fighter triggers.",
    whyItWorks:
      "Linear pressure creates commitment-windows. This archetype never initiates long combos, only punishes entries.",
    whenEffective: ["Against pressure-fighter and fake-pressure", "H2H with strong counter stats"],
    counters: [
      { name: "Angle and feint entries", explanation: "Remove linear trigger from pressure game" },
    ],
    overuseSignals: ["Waiting without counter when entry is feinted"],
    related: ["counter-puncher", "sidestep-uppercut", "pressure-fighter", "counter-range"],
    communityTerms: ["pressure counter fighter"],
  },
  {
    id: "counter-puncher",
    name: "Counter Puncher",
    aliases: ["counter puncher", "counter fighter"],
    category: "matchup",
    definition:
      "Fighter archetype relying on opponent commitment for scoring — lives at counter-range with power straight, whiff punish, and sidestep counters rather than initiating volume.",
    whyItWorks:
      "FNC impact scoring rewards clean counters. Lower stamina spend per impact moment vs pressure volume.",
    whenEffective: ["Against emotional-aggression and straight-spam", "When opponent has combination-waste habits"],
    counters: [
      { name: "Calculated annoyance", explanation: "Feint and body without full commit to draw weak counters" },
    ],
    overuseSignals: ["Never initiating — gives up round steal windows"],
    related: ["counter-range", "pressure-counter-fighter", "whiff-punish", "outfighter"],
    communityTerms: ["counter puncher"],
  },
  {
    id: "outfighter",
    name: "Outfighter",
    aliases: ["outside fighter", "out-boxer"],
    category: "matchup",
    definition:
      "Archetype controlling outside and mid-range with jab, escape punch, and lateral movement — punishes entries from distance rather than trading inside.",
    whyItWorks:
      "Reach-advantage and speed-based builds excel here until opponent cuts ring and lands body-investment for stamina-collapse.",
    whenEffective: ["Reach-advantage matchups", "Against brawler and heavy-impact-fighter who cannot cut ring"],
    counters: [
      { name: "Cut the ring", explanation: "Force exchanges at bad range with body-pressure" },
    ],
    overuseSignals: ["Straight-line-retreat only — becomes trap"],
    related: ["distance-management", "escape-punch", "reach-advantage", "speed-based-fighter"],
    communityTerms: ["outfighter"],
  },
  {
    id: "brawler",
    name: "Brawler",
    aliases: ["brawler style", "inside brawler"],
    category: "matchup",
    definition:
      "Archetype favoring inside-fighting, power exchanges, and impact over finesse — accepts stamina cost for stun-state and heavy-impact-fighter moments.",
    whyItWorks:
      "Short exchanges with power-modified shots swing momentum when opponent lacks defensive-discipline inside.",
    whenEffective: ["Against low-power-disadvantage outfighters", "When opponent shows panic-defense inside"],
    counters: [
      { name: "Escape and counter-range", explanation: "Clinch, pivot, escape punch to reset distance" },
    ],
    overuseSignals: ["Mindless inside spam without impact"],
    related: ["inside-fighting", "heavy-impact-fighter", "controlled-aggression", "stun-state"],
    communityTerms: ["brawler"],
  },
  {
    id: "controlled-aggression",
    name: "Controlled Aggression",
    aliases: ["controlled aggression", "disciplined aggression"],
    category: "strategy",
    definition:
      "Aggressive actions tied to confirmed reads and stamina budget — pushing when read-confirmed, backing off when counter-range danger is high.",
    whyItWorks:
      "Captures impact moments without emotional-aggression tax. Wins impact-fight scoring while preserving stamina for late rounds.",
    whenEffective: ["After read-confirmed on opponent shell", "Late-round when ahead on impact"],
    counters: [
      { name: "Rhythm break defense", explanation: "Deny their aggression triggers with timing shifts" },
    ],
    overuseSignals: ["Aggression without read — becomes mindless-spam"],
    related: ["emotional-aggression", "offensive-discipline", "controlled-cheese", "real-pressure"],
    communityTerms: ["controlled aggression"],
  },
  {
    id: "emotional-aggression",
    name: "Emotional Aggression",
    aliases: ["emotional aggression", "tilted offense"],
    category: "exploit",
    definition:
      "Chasing, spamming, and overcommitting after frustration, getting countered, or stun — abandons offensive-discipline and feeds recovery punish loops.",
    whyItWorks:
      "N/A — failure mode. Opponent with fight-iq and counter-range exploits this for momentum-shift and stamina-collapse.",
    whenEffective: [],
    counters: [
      { name: "Counter and reset", explanation: "Punish overcommit then hold counter-range" },
    ],
    overuseSignals: ["Panic-chase-after-stun", "Long combos after getting hit clean"],
    related: ["panic-offense", "chasing", "mental-break", "fear-loop"],
    communityTerms: ["emotional aggression"],
  },
  {
    id: "cheese",
    name: "Cheese",
    aliases: ["cheesy", "cheese mechanics"],
    category: "terminology",
    definition:
      "Community slang for strong repeatable FNC mechanics or exploits — Money Team rhythm, sidestep uppercut spam, recovery punish loops. Informal term; in Master Spec distinguish from controlled-cheese and mindless-spam.",
    whyItWorks:
      "Cheese wins rounds when opponent has adaptation-failure or low pattern-speed. Becomes punishable once read-confirmed.",
    whenEffective: ["H2H/OWC when opponent has not seen meta before"],
    counters: [
      { name: "Adaptation", explanation: "Break trigger pattern cheese depends on" },
    ],
    overuseSignals: ["Using cheese label without naming specific mechanic"],
    related: ["controlled-cheese", "meta-abuse", "mechanic-on-read", "ultimate-cheeser"],
    communityTerms: ["cheese"],
  },
  {
    id: "controlled-cheese",
    name: "Controlled Cheese",
    aliases: ["controlled cheese", "read-based cheese"],
    category: "strategy",
    definition:
      "Master Spec term: deliberate use of strong FNC mechanic after confirmed read — timed power straight, sidestep uppercut on linear entry, Money Team into counter. Not blind repetition; requires read-confirmed trigger.",
    whyItWorks:
      "High-impact mechanics win rounds when timed to opponent commitment-window, not when spammed without trigger.",
    whenEffective: ["After read-confirmed on block release or entry", "When opponent shows adaptation-failure"],
    counters: [
      { name: "Stop feeding trigger", explanation: "Change pattern that enables the cheese read" },
    ],
    overuseSignals: ["Same mechanic with no remaining read — mindless-spam"],
    related: ["mechanic-on-read", "cheese", "rhythm-read", "read-confirmed"],
    communityTerms: ["controlled cheese"],
  },
  {
    id: "mindless-spam",
    name: "Mindless Spam",
    aliases: ["mindless spam", "blind spam"],
    category: "exploit",
    definition:
      "Repeating mechanic without read, adaptation, or trigger awareness — straight-spam, sidestep-spam, body-spam without opponent pattern confirmation.",
    whyItWorks:
      "Only beats low fight-iq opponents. High-level players adaptation-check and punish by round two.",
    whenEffective: [],
    counters: [
      { name: "Spam-read", explanation: "Identify trigger and punish on third repetition" },
    ],
    overuseSignals: ["Same response every exchange regardless of opponent adjustment"],
    related: ["straight-spam", "sidestep-spam", "body-spam", "adaptation-failure"],
    communityTerms: ["mindless spam"],
  },
  {
    id: "meta-abuse",
    name: "Meta Abuse",
    aliases: ["meta abuse", "abusing meta"],
    category: "exploit",
    definition:
      "Systematic use of known FNC competitive meta — recovery punish, block release timing, sidestep uppercut on entry, late-round-steal-window — as primary win condition.",
    whyItWorks:
      "Meta mechanics have highest ROI in OWC/H2H when opponent lacks exploit-aware-play or matchup-discipline.",
    whenEffective: ["Ranked OWC", "H2H against unfamiliar opponents"],
    counters: [
      { name: "Exploit-aware-play", explanation: "Scout habits in round one and adapt before meta stacks" },
    ],
    overuseSignals: ["Single meta mechanic with no backup plan when adapted to"],
    related: ["exploit-aware-play", "ultimate-cheeser", "owc-meta", "h2h-meta"],
    communityTerms: ["meta abuse"],
  },
  {
    id: "exploit-aware-play",
    name: "Exploit Aware Play",
    aliases: ["exploit aware", "meta aware play"],
    category: "strategy",
    definition:
      "Recognizing and punishing opponent meta habits while minimizing own tells — adaptation after one punish, varied rhythm, and matchup-discipline against cheese.",
    whyItWorks:
      "Ultimate-cheeser and meta-abuse players depend on trigger repetition. Awareness removes their win condition.",
    whenEffective: ["Round two onward after scouting", "Against known FNC meta patterns"],
    counters: [
      { name: "Layered cheese", explanation: "Switch primary exploit when first is adapted to" },
    ],
    overuseSignals: ["Over-adapting and becoming passive — losing steal windows"],
    related: ["fight-iq", "adaptation", "meta-abuse", "matchup-discipline"],
    communityTerms: ["exploit aware play"],
  },
  {
    id: "ultimate-cheeser",
    name: "Ultimate Cheeser",
    aliases: ["ultimate cheeser", "cheese stacker"],
    category: "matchup",
    definition:
      "Player who stacks multiple meta exploits with high pattern-speed — Money Team rhythm, sidestep uppercut read, recovery punish, scorecard manipulation — and adapts when one is checked.",
    whyItWorks:
      "Forces opponent to solve several problems mid-fight while maintaining pressure. Requires exploit-aware-play and fight-iq to beat consistently.",
    whenEffective: ["OWC high ranks", "H2H against unprepared opponents"],
    counters: [
      { name: "Prioritize one adaptation", explanation: "Stop biggest scoring exploit first, not all at once" },
    ],
    overuseSignals: ["Labeling any good player as cheeser without evidence"],
    related: ["meta-abuse", "controlled-cheese", "pattern-speed", "reads-meta"],
    communityTerms: ["ultimate cheeser"],
  },
  {
    id: "impact-moment",
    name: "Impact Moment",
    aliases: ["impact moment", "impact shot"],
    category: "meta",
    definition:
      "Single exchange that swings FNC round scoring — clean counter, stun, power straight through shell, or fight-ending sequence. Impact moments outweigh volume in close rounds.",
    whyItWorks:
      "FNC judges quality and impact over punch totals. One impact moment can win round-steal against winning-statistical-fight.",
    whenEffective: ["Close rounds", "Late-round-steal-window setup"],
    counters: [
      { name: "Own impact answer", explanation: "Land counter impact before or after theirs in same round" },
    ],
    overuseSignals: ["Calling impact without visible stun, counter clean, or score swing"],
    related: ["winning-impact-fight", "power-straight", "stun-state", "scorecard-manipulation"],
    communityTerms: ["impact moment"],
  },
  {
    id: "late-round-steal-window",
    name: "Late Round Steal Window",
    aliases: ["late round steal", "round steal window"],
    category: "meta",
    definition:
      "Final 20–30 seconds of close FNC round where increased activity can steal round on judges despite trailing earlier — connected to round-steal and scorecard-manipulation meta.",
    whyItWorks:
      "Judges weight late visible activity and impact. Controlled burst of meaningful-offense can flip close rounds.",
    whenEffective: ["Round within one impact moment", "When opponent is stamina-collapsed"],
    counters: [
      { name: "Early impact anchor", explanation: "Land impact moment mid-round so steal is insufficient" },
    ],
    overuseSignals: ["Empty volume in steal window — winning-statistical-fight but still losing"],
    related: ["round-steal", "scorecard-manipulation", "meaningful-offense", "calculated-annoyance"],
    communityTerms: ["late round steal", "steal window"],
  },
  {
    id: "winning-statistical-fight",
    name: "Winning Statistical Fight",
    aliases: ["statistical fight", "volume lead losing"],
    category: "meta",
    definition:
      "Landing more punches or showing higher activity while losing FNC rounds on impact and quality. Common when empty-jab-volume and combination-waste inflate stats without impact moments.",
    whyItWorks:
      "N/A — failure mode. Player confuses punch totals with scoring reality.",
    whenEffective: [],
    counters: [
      { name: "Impact discipline", explanation: "Trade volume for power straight and counter quality" },
    ],
    overuseSignals: ["High connects with no stun or counter impact", "Losing round despite leading stats"],
    related: ["winning-impact-fight", "empty-offense", "scoring-anomaly", "impact-moment"],
    communityTerms: ["statistical fight"],
  },
  {
    id: "winning-impact-fight",
    name: "Winning Impact Fight",
    aliases: ["impact fight", "quality over volume"],
    category: "meta",
    definition:
      "Winning FNC rounds with fewer punches but cleaner counters, stuns, and impact moments — the correct competitive scoring model.",
    whyItWorks:
      "Judges reward damage, counters, and round-defining shots. Stamina-efficient path to winning close fights.",
    whenEffective: ["Close rounds", "Against winning-statistical-fight opponents"],
    counters: [
      { name: "Late steal volume", explanation: "Combine empty activity with one late impact in steal window" },
    ],
    overuseSignals: ["Too passive — gives up steal window entirely"],
    related: ["impact-moment", "counter-puncher", "power-straight", "intelligent-finish"],
    communityTerms: ["impact fight"],
  },
  {
    id: "stamina-collapse",
    name: "Stamina Collapse",
    aliases: ["stamina collapse", "gassed"],
    category: "meta",
    definition:
      "Sudden inability to attack or defend effectively from stamina depletion mid-round — guard slows, movement whiffs increase, panic-defense emerges.",
    whyItWorks:
      "N/A — failure state caused by movement-waste, combination-waste, power-punch-waste, and stamina-fraud patterns compounding.",
    whenEffective: [],
    counters: [
      { name: "Stamina tax", explanation: "Do not trade volume — let collapse happen and punish" },
    ],
    overuseSignals: ["Heavy breathing animation with missed blocks", "Cannot complete Money Team rhythm"],
    related: ["stamina-fraud", "movement-waste", "combination-waste", "power-punch-waste", "body-investment"],
    communityTerms: ["stamina collapse", "gassed"],
  },
  {
    id: "movement-waste",
    name: "Movement Waste",
    aliases: ["wasted movement", "movement spam"],
    category: "exploit",
    definition:
      "Unnecessary sidesteps, backpedaling, and circling that drains FNC stamina without positional gain or counter setup.",
    whyItWorks:
      "N/A — failure mode. Contributes to stamina-collapse and lets opponent hold counter-range.",
    whenEffective: [],
    counters: [
      { name: "Hold center and counter", explanation: "Let them waste movement then punish whiff" },
    ],
    overuseSignals: ["Sidestep without punch", "Circular backpedaling under no pressure"],
    related: ["stamina-collapse", "stamina-tax", "controlled-efficiency", "sidestep"],
    communityTerms: ["movement waste"],
  },
  {
    id: "combination-waste",
    name: "Combination Waste",
    aliases: ["combo waste", "wasted combinations"],
    category: "exploit",
    definition:
      "Long FNC combos that miss, get blocked, or create recovery-window without landing impact — poor stamina ROI versus one-two counter discipline.",
    whyItWorks:
      "N/A — failure mode. Punch three overcommitment feeds power-straight-engineering and recovery-punish.",
    whenEffective: [],
    counters: [
      { name: "Recovery punish punch two", explanation: "Counter during combo before punch three" },
    ],
    overuseSignals: ["Four or five punch combos with no clean connect"],
    related: ["overcommitment", "recovery-window", "power-punch-waste", "offensive-discipline"],
    communityTerms: ["combination waste"],
  },
  {
    id: "power-punch-waste",
    name: "Power Punch Waste",
    aliases: ["wasted power", "power whiff"],
    category: "exploit",
    definition:
      "Power-modified punches on whiffs, blocked shots, or without setup — highest stamina tax per failed attempt in FNC.",
    whyItWorks:
      "N/A — failure mode. Multiple power-punch-waste events trigger stamina-collapse quickly.",
    whenEffective: [],
    counters: [
      { name: "Make them miss", explanation: "Sidestep and lean to induce power whiffs" },
    ],
    overuseSignals: ["Powered straight blocked three times in row", "Power hook whiffed chasing"],
    related: ["whiff", "stamina-collapse", "power-straight", "stamina-tax"],
    communityTerms: ["power punch waste"],
  },
  {
    id: "hesitation",
    name: "Hesitation",
    aliases: ["hesitating", "delayed reaction"],
    category: "meta",
    definition:
      "Delay after read-confirmed that loses counter-window or recovery-punish timing in FNC. Distinct from calculated patience — hesitation misses the frame.",
    whyItWorks:
      "N/A — failure mode. Opponent recovers guard and momentum returns.",
    whenEffective: [],
    counters: [
      { name: "Immediate punish", explanation: "Fire on first frame of recovery-window" },
    ],
    overuseSignals: ["Visible whiff with no follow-up punch", "Read confirmed but no commit"],
    related: ["missed-counter-window", "missed-recovery-punish", "read-confirmed", "counter-window"],
    communityTerms: ["hesitation"],
  },
  {
    id: "mental-break",
    name: "Mental Break",
    aliases: ["mental break", "tilt"],
    category: "meta",
    definition:
      "Decision quality collapse after repeated punishment, stun, or score deficit — manifests as emotional-aggression, defensive-frustration, and adaptation-failure combined.",
    whyItWorks:
      "N/A — failure mode. Opponent with stun-state-predator and exploit-aware-play capitalizes.",
    whenEffective: [],
    counters: [
      { name: "Reset discipline", explanation: "Single adjustment per round — do not spam new strategy" },
    ],
    overuseSignals: ["Strategy changes every 30 seconds without logic", "panic-offense after one counter"],
    related: ["emotional-aggression", "fear-loop", "defensive-frustration", "adaptation-failure"],
    communityTerms: ["mental break", "tilt"],
  },
  {
    id: "defensive-frustration",
    name: "Defensive Frustration",
    aliases: ["defensive frustration", "shell frustration"],
    category: "meta",
    definition:
      "Overblocking, static-block, panic movement, or defensive-overreaction after failed offense — breaks defensive-discipline and creates new tells.",
    whyItWorks:
      "N/A — failure mode. Opponent times power straight off shell release or body during stationary-defense.",
    whenEffective: [],
    counters: [
      { name: "Body and feint", explanation: "Attack without requiring them to swing — force shell mistakes" },
    ],
    overuseSignals: ["Static-block after missed combo", "Lean spam after getting countered"],
    related: ["static-block", "defensive-overreaction", "stationary-defense", "panic-defense"],
    communityTerms: ["defensive frustration"],
  },
  {
    id: "calculated-annoyance",
    name: "Calculated Annoyance",
    aliases: ["calculated annoyance", "annoyance tactics"],
    category: "strategy",
    definition:
      "Low-risk patterns that drain opponent patience and stamina — body jabs, feint entries, jab-as-data probes — without emotional-aggression or overcommitment.",
    whyItWorks:
      "Forces opponent to swing or chase, creating whiffs and defensive-frustration while you maintain controlled-efficiency.",
    whenEffective: ["Against counter-puncher who waits forever", "Mid-round even scorecards"],
    counters: [
      { name: "Patience", explanation: "Do not bite — land one impact moment when they finally commit" },
    ],
    overuseSignals: ["Annoyance without ever landing impact — too passive"],
    related: ["jab-as-data", "body-investment", "rhythm-break", "late-round-steal-window"],
    communityTerms: ["calculated annoyance"],
  },
  {
    id: "momentum",
    name: "Momentum",
    aliases: ["fight momentum", "round momentum"],
    category: "meta",
    definition:
      "Perceived flow of round control from impact moments, successful reads, and opponent hesitation — not identical to punch volume.",
    whyItWorks:
      "Momentum affects opponent mental state — defensive-frustration and emotional-aggression increase under sustained momentum pressure.",
    whenEffective: ["After impact-moment or stun", "When opponent shows adaptation-failure"],
    counters: [
      { name: "Impact reset", explanation: "Land clean counter to shift momentum back" },
    ],
    overuseSignals: ["Assuming momentum from activity without impact"],
    related: ["momentum-shift", "impact-moment", "stun-state", "mental-break"],
    communityTerms: ["momentum"],
  },
  {
    id: "momentum-shift",
    name: "Momentum Shift",
    aliases: ["momentum shift", "swing"],
    category: "meta",
    definition:
      "Moment impact, stun, or clean counter flips round control from one fighter to the other in FNC exchanges.",
    whyItWorks:
      "Judges and players both reweight following action after visible shift — sets up late-round-steal-window opportunity.",
    whenEffective: ["After stun-state", "When trailing fighter lands power straight counter"],
    counters: [
      { name: "Shell and reset", explanation: "Survive shift without panic-chase-after-stun" },
    ],
    overuseSignals: ["Calling shift without visible impact or opponent behavior change"],
    related: ["momentum", "stun-state", "impact-moment", "intelligent-finish"],
    communityTerms: ["momentum shift"],
  },
  {
    id: "stun-state",
    name: "Stun State",
    aliases: ["stun", "rocked", "stunned"],
    category: "mechanic",
    definition:
      "Opponent stunned or rocked in FNC with reduced defensive options and increased damage vulnerability — creates finish and momentum-shift windows.",
    whyItWorks:
      "Defender cannot execute full Money Team rhythm or escape punch cleanly — predator player commits intelligent-finish.",
    whenEffective: ["After clean power straight or combo impact"],
    counters: [
      { name: "Shell survival", explanation: "Block and clinch to recover — do not swing wild" },
    ],
    overuseSignals: ["Calling stun without visible rocked animation or guard break"],
    related: ["stun-state-predator", "panic-chase-after-stun", "intelligent-finish", "impact-moment"],
    communityTerms: ["stun", "rocked"],
  },
  {
    id: "stun-state-predator",
    name: "Stun State Predator",
    aliases: ["stun predator", "finish hunter"],
    category: "strategy",
    definition:
      "Player who recognizes stun-state and commits measured finish — power straight, body, positioning — without panic-chase-after-stun whiffs.",
    whyItWorks:
      "Stun windows close fast. Predator maximizes impact per input instead of combination-waste chase.",
    whenEffective: ["Confirmed stun with stamina advantage"],
    counters: [
      { name: "Clinch reset", explanation: "Survive stun window without trading wild" },
    ],
    overuseSignals: ["Overchasing and whiffing powered shots in stun"],
    related: ["intelligent-finish", "stun-state", "power-straight-engineering", "controlled-aggression"],
    communityTerms: ["stun predator"],
  },
  {
    id: "panic-chase-after-stun",
    name: "Panic Chase After Stun",
    aliases: ["panic chase", "stun chase"],
    category: "exploit",
    definition:
      "Wild pursuit after stunning opponent — long combos, power-punch-waste, and chasing that whiffs when defender shells or pivots.",
    whyItWorks:
      "N/A — failure mode. Burns stamina and can lose round if opponent survives stun.",
    whenEffective: [],
    counters: [
      { name: "Intelligent finish", explanation: "One or two measured power shots then reposition" },
    ],
    overuseSignals: ["Five punch combo whiffed on stunned opponent"],
    related: ["chasing", "stun-state", "intelligent-finish", "combination-waste"],
    communityTerms: ["panic chase"],
  },
  {
    id: "intelligent-finish",
    name: "Intelligent Finish",
    aliases: ["intelligent finish", "smart finish"],
    category: "strategy",
    definition:
      "Measured power and positioning to capitalize on stun-state without overchasing — power straight through shell gaps, body to drain recovery, cut ring to prevent escape.",
    whyItWorks:
      "Preserves stamina and lands fight-ending impact instead of feeding panic-defense recovery.",
    whenEffective: ["Stun-state with angle advantage", "Opponent stamina-collapsed"],
    counters: [
      { name: "Clinch and survive", explanation: "Reset to defensive-discipline until stun clears" },
    ],
    overuseSignals: ["Multiple whiffed power shots in stun window"],
    related: ["stun-state-predator", "power-straight", "winning-impact-fight", "controlled-aggression"],
    communityTerms: ["intelligent finish"],
  },
  {
    id: "owc-build",
    name: "OWC Build",
    aliases: ["owc build", "create a boxer build"],
    category: "matchup",
    definition:
      "Create-A-Boxer attribute and style configuration in OWC — power, speed, stamina, block style, punch styles, and CAB perks affecting meta-build viability.",
    whyItWorks:
      "Build determines access to Money Team effectiveness, power-straight damage, and stamina budget for game plan.",
    whenEffective: ["OWC ranked preparation", "Countering known meta-build archetypes"],
    counters: [
      { name: "Matchup-specific CAB", explanation: "Tune build for opponent archetype not highest overall" },
    ],
    overuseSignals: ["Highest overall rating without matchup plan"],
    related: ["meta-build", "owc-meta", "power-toughness-priority", "speed-based-fighter"],
    communityTerms: ["OWC build", "CAB build"],
  },
  {
    id: "meta-build",
    name: "Meta Build",
    aliases: ["meta build", "competitive build"],
    category: "matchup",
    definition:
      "OWC/H2H build optimized for current FNC competitive meta — power access, block style for Money Team, stamina for body-investment wars, not generic stat stacking.",
    whyItWorks:
      "Meta-build aligns attributes with exploit mechanics — recovery punish damage, shell durability, straight speed.",
    whenEffective: ["OWC high ranks", "When opponent uses known cheese stack"],
    counters: [
      { name: "Anti-meta build", explanation: "Speed-trap or body-focused build to exploit meta-build weakness" },
    ],
    overuseSignals: ["Copy build without understanding mechanic synergy"],
    related: ["owc-build", "owc-meta", "h2h-meta", "ultimate-cheeser"],
    communityTerms: ["meta build"],
  },
  {
    id: "power-toughness-priority",
    name: "Power Toughness Priority",
    aliases: ["power toughness build", "power chin build"],
    category: "matchup",
    definition:
      "Build emphasizing power and chin/toughness over speed in OWC/H2H — heavy-impact-fighter template that wins on impact moments and survives speed-trap early rounds.",
    whyItWorks:
      "One clean power straight swings speed-based-fighter momentum. Toughness absorbs volume until stamina-collapse.",
    whenEffective: ["Against speed-based-fighter and low-power-disadvantage opponents", "H2H power outliers"],
    counters: [
      { name: "Distance and body", explanation: "Speed fighter invests body and avoids power trade" },
    ],
    overuseSignals: ["Slow build without cut-ring plan vs outfighter"],
    related: ["heavy-impact-fighter", "speed-trap", "low-power-disadvantage", "owc-build"],
    communityTerms: ["power toughness priority"],
  },
  {
    id: "speed-trap",
    name: "Speed Trap",
    aliases: ["speed trap", "speed feels good trap"],
    category: "matchup",
    definition:
      "Situation where fast fighter dominates early on volume and evasion until heavy-impact-fighter lands clean power — then stamina and momentum flip. Explains why Ali feels good then gets cooked by power guys.",
    whyItWorks:
      "Speed-based-fighter wins statistical exchanges early; power-toughness-priority wins impact-fight once connect lands and stamina tax accumulates.",
    whenEffective: ["H2H Ali vs power punchers", "Speed OWC build vs power-toughness-priority"],
    counters: [
      { name: "Matchup discipline", explanation: "Speed fighter must body-invest and avoid power trade, not ego box" },
    ],
    overuseSignals: ["Speed fighter trading in pocket with heavy-impact-fighter"],
    related: ["speed-based-fighter", "heavy-impact-fighter", "low-power-disadvantage", "stamina-collapse"],
    communityTerms: ["speed trap"],
  },
  {
    id: "reach-advantage",
    name: "Reach Advantage",
    aliases: ["reach advantage", "long reach"],
    category: "matchup",
    definition:
      "Longer reach in FNC controlling jab and straight entries at outside range — outfighter tool when paired with distance-management and escape punch.",
    whyItWorks:
      "Opponent must spend extra movement and stamina to enter pressure-range. Jab-setup dominates timing at safe distance.",
    whenEffective: ["Outfighter vs brawler", "OWC/H2H with long-limbed CAB"],
    counters: [
      { name: "Body investment and cut ring", explanation: "Take legs and space until reach cannot be maintained" },
    ],
    overuseSignals: ["Reach advantage but straight-line-retreat only — no angle control"],
    related: ["reach-disadvantage", "outfighter", "jab", "distance-management"],
    communityTerms: ["reach advantage"],
  },
  {
    id: "reach-disadvantage",
    name: "Reach Disadvantage",
    aliases: ["reach disadvantage", "short reach"],
    category: "matchup",
    definition:
      "Shorter reach requiring inside-fighting, angle changes, or body-investment to negate opponent jab and straight control at distance.",
    whyItWorks:
      "Inside pocket and off-center-positioning remove reach value — brawler and heavy-impact-fighter paths.",
    whenEffective: ["Against outfighter with poor inside defense", "When opponent shells at close range"],
    counters: [
      { name: "Maintain jab range", explanation: "Outfighter keeps distance with jab and escape punch" },
    ],
    overuseSignals: ["Short fighter boxing at straight range entire round"],
    related: ["reach-advantage", "inside-fighting", "brawler", "cutting-the-ring"],
    communityTerms: ["reach disadvantage"],
  },
  {
    id: "h2h-meta",
    name: "H2H Meta",
    aliases: ["h2h meta", "head to head meta"],
    category: "meta",
    definition:
      "Head-to-head licensed fighter meta in FNC — attribute quirks, unusual power fighters, punch-style differences, and matchup disadvantages independent of overall rating.",
    whyItWorks:
      "Licensed fighters have non-CAB stat profiles creating speed-trap and low-power-disadvantage scenarios real boxing logic misses.",
    whenEffective: ["H2H ranked", "Licensed power outliers vs speed fighters"],
    counters: [
      { name: "Matchup discipline", explanation: "Pick fighter and plan for attribute reality not name recognition" },
    ],
    overuseSignals: ["Assuming higher rated fighter wins matchup"],
    related: ["owc-meta", "matchup-advantage", "speed-trap", "heavy-impact-fighter"],
    communityTerms: ["H2H meta"],
  },
  {
    id: "matchup-advantage",
    name: "Matchup Advantage",
    aliases: ["matchup advantage", "favorable matchup"],
    category: "matchup",
    definition:
      "Style, build, or licensed fighter attributes favorable against specific opponent archetype — e.g. pressure-counter-fighter vs pressure-fighter, power-toughness vs speed-based-fighter.",
    whyItWorks:
      "FNC mechanics are matchup-dependent. Advantage means your triggers align with their adaptation-failure habits.",
    whenEffective: ["Pre-fight build and fighter selection", "When opponent has one-dimensional cheese"],
    counters: [
      { name: "Adaptation", explanation: "Change primary mechanic when disadvantage is scouted" },
    ],
    overuseSignals: ["Claiming advantage without style evidence"],
    related: ["matchup-discipline", "h2h-meta", "owc-build", "speed-trap"],
    communityTerms: ["matchup advantage"],
  },
  {
    id: "low-power-disadvantage",
    name: "Low Power Disadvantage",
    aliases: ["low power disadvantage", "low power stat"],
    category: "matchup",
    definition:
      "Fighter with low power stat feels competitive on volume and speed until opponent power shots land clean — explains why Ali feels good then gets cooked by power guys in H2H.",
    whyItWorks:
      "N/A as advantage — describes structural H2H/OWC weakness. Speed-trap eventually resolves to heavy-impact-fighter impact moments.",
    whenEffective: [],
    counters: [
      { name: "Avoid power trade", explanation: "Body-investment, matchup-discipline, never pocket trade with heavy-impact-fighter" },
    ],
    overuseSignals: ["Low power fighter ego trading after winning statistical early round"],
    related: ["speed-based-fighter", "heavy-impact-fighter", "speed-trap", "winning-statistical-fight"],
    communityTerms: ["low power disadvantage"],
  },
  {
    id: "speed-based-fighter",
    name: "Speed Based Fighter",
    aliases: ["speed fighter", "speed build"],
    category: "matchup",
    definition:
      "Build or licensed archetype relying on speed, volume, evasion, and outfighter distance over power — excels early until power connects or stamina-collapse from movement-waste.",
    whyItWorks:
      "Pattern-speed and jab-as-data dominate before opponent lands impact. Requires matchup-discipline vs power.",
    whenEffective: ["Against slow heavy-impact-fighter who cannot cut ring", "Early rounds of speed-trap"],
    counters: [
      { name: "Body and power straight", explanation: "Invest body, land one impact, let speed-trap resolve" },
    ],
    overuseSignals: ["Speed fighter trading power in pocket — low-power-disadvantage exposed"],
    related: ["heavy-impact-fighter", "speed-trap", "outfighter", "low-power-disadvantage"],
    communityTerms: ["speed fighter", "speed based fighter"],
  },
  {
    id: "heavy-impact-fighter",
    name: "Heavy Impact Fighter",
    aliases: ["heavy impact fighter", "power fighter archetype"],
    category: "matchup",
    definition:
      "Build or licensed archetype relying on power straights, body-investment, stun finishes, and power-toughness-priority over volume — wins winning-impact-fight not statistical fight.",
    whyItWorks:
      "One impact-moment resets speed-based-fighter momentum. Stamina tax from opponent volume pays off in late round collapse.",
    whenEffective: ["Against speed-trap and low-power-disadvantage opponents", "When cutting ring successfully"],
    counters: [
      { name: "Distance and body plan", explanation: "Speed fighter avoids trade and invests body from range" },
    ],
    overuseSignals: ["Power fighter chasing without cut-ring — whiffs and stamina-collapse"],
    related: ["power-toughness-priority", "speed-based-fighter", "brawler", "impact-moment"],
    communityTerms: ["heavy impact fighter", "power fighter"],
  },
  {
    id: "matchup-discipline",
    name: "Matchup Discipline",
    aliases: ["matchup discipline", "stick to gameplan"],
    category: "strategy",
    definition:
      "Sticking to gameplan for unfavorable matchup — speed fighter avoids pocket, power fighter cuts ring, counter fighter does not fake-pressure — instead of ego trading.",
    whyItWorks:
      "FNC punishes ignoring attribute reality. Ali must not brawl power guys; brawler must not chase outfighter forever.",
    whenEffective: ["Unfavorable h2h-meta matchups", "When behind but strategy is working"],
    counters: [
      { name: "Emotional bait", explanation: "Taunt with volume to draw ego break in matchup-discipline" },
    ],
    overuseSignals: ["Abandoning plan after one clean shot received"],
    related: ["fight-iq", "low-power-disadvantage", "speed-trap", "controlled-aggression"],
    communityTerms: ["matchup discipline"],
  },
  {
    id: "boxing-mode",
    name: "Boxing Mode",
    aliases: ["boxing mode", "boxer mode"],
    category: "mechanic",
    definition:
      "FNC stance/mode affecting punch selection, movement options, and defensive tools — primary mode for jab, straight meta and Money Team shell play.",
    whyItWorks:
      "Boxing mode optimizes counter-range and outfighter tools. Wrong mode reduces access to key meta mechanics.",
    whenEffective: ["Outfighter and counter-puncher game plans", "Money Team rhythm exchanges"],
    counters: [
      { name: "Mode switch pressure", explanation: "Force inside-fighting where boxing mode is weaker" },
    ],
    overuseSignals: ["Staying boxing mode inside without switching-modes plan"],
    related: ["fighting-mode", "switching-modes", "outfighter", "money-team-rhythm"],
    communityTerms: ["boxing mode"],
  },
  {
    id: "fighting-mode",
    name: "Fighting Mode",
    aliases: ["fighting mode", "fight mode"],
    category: "mechanic",
    definition:
      "Alternate FNC mode with different offensive and defensive options — used for inside-fighting, hooks, and close-range exchanges distinct from boxing-mode straight meta.",
    whyItWorks:
      "Unlocks close-range tools when opponent shells in boxing range or when reach-disadvantage requires pocket work.",
    whenEffective: ["Inside-fighting vs stationary-defense", "Brawler archetype exchanges"],
    counters: [
      { name: "Reset to boxing range", explanation: "Escape punch and distance-management when fighting mode overextended" },
    ],
    overuseSignals: ["Fighting mode at range whiffing — wrong mode for distance"],
    related: ["boxing-mode", "switching-modes", "inside-fighting", "brawler"],
    communityTerms: ["fighting mode"],
  },
  {
    id: "switching-modes",
    name: "Switching Modes",
    aliases: ["switching modes", "mode switch"],
    category: "technique",
    definition:
      "Changing boxing/fighting mode mid-exchange for unpredictability — prevents opponent rhythm-read on mode-specific patterns.",
    whyItWorks:
      "Opponent prepared for boxing-mode straight meta whiffs when mode switches into inside hook attack.",
    whenEffective: ["When opponent has spam-read on boxing patterns", "Closing from outfighter to brawler range"],
    counters: [
      { name: "Read mode tell", explanation: "Some players telegraph switch — punish startup" },
    ],
    overuseSignals: ["Random switching without range logic"],
    related: ["boxing-mode", "fighting-mode", "rhythm-break", "inside-fighting"],
    communityTerms: ["switching modes"],
  },
  {
    id: "defensive-overreaction",
    name: "Defensive Overreaction",
    aliases: ["defensive overreaction", "overreacting on defense"],
    category: "exploit",
    definition:
      "Excessive blocking, weaving, or leaning after one clean shot — breaks defensive-discipline and creates new block-rhythm and predictable-lean tells.",
    whyItWorks:
      "N/A — failure mode. Opponent rhythm-reads exaggerated defense for power-straight-engineering.",
    whenEffective: [],
    counters: [
      { name: "Feint and punish release", explanation: "Attack shell rhythm after overreaction establishes" },
    ],
    overuseSignals: ["Full shell after single jab connect", "Panic weave spam"],
    related: ["defensive-frustration", "predictable-lean", "panic-defense", "static-block"],
    communityTerms: ["defensive overreaction"],
  },
  {
    id: "stationary-defense",
    name: "Stationary Defense",
    aliases: ["stationary defense", "flat footed defense"],
    category: "exploit",
    definition:
      "Defending without foot reposition — static-block or shell in place — readable release timing and no weave-reset reposition.",
    whyItWorks:
      "N/A — failure mode. Opponent times power straight and body during fixed shell.",
    whenEffective: [],
    counters: [
      { name: "Power straight off release", explanation: "Time straight when stationary shell opens" },
    ],
    overuseSignals: ["No micro-positioning during block exchanges"],
    related: ["static-block", "block-hold-pattern", "money-team-rhythm", "power-straight"],
    communityTerms: ["stationary defense"],
  },
  {
    id: "defensive-discipline",
    name: "Defensive Discipline",
    aliases: ["defensive discipline", "disciplined defense"],
    category: "strategy",
    definition:
      "Maintaining Money Team rhythm without panic shell, defensive-overreaction, or static-block — refresh, weave-reset, and counter threat every cycle.",
    whyItWorks:
      "Denies opponent rhythm-read and power-straight-engineering while preserving stamina vs body-investment.",
    whenEffective: ["Against pressure-fighter and body-pressure", "When ahead and protecting lead"],
    counters: [
      { name: "Calculated annoyance", explanation: "Body and feint to erode discipline without overcommitting" },
    ],
    overuseSignals: ["Perfect shell but no counter — becomes stationary-defense"],
    related: ["money-team-rhythm", "offensive-discipline", "defensive-chants", "block-refresh"],
    communityTerms: ["defensive discipline"],
  },
  {
    id: "offensive-discipline",
    name: "Offensive Discipline",
    aliases: ["offensive discipline", "disciplined offense"],
    category: "strategy",
    definition:
      "Not throwing punch three without read; respecting recovery-window risk; choosing meaningful-offense over mindless-spam and combination-waste.",
    whyItWorks:
      "Avoids creating own commitment-window. Maximizes impact per stamina for winning-impact-fight.",
    whenEffective: ["Against counter-puncher and pressure-counter-fighter", "When stamina lead matters late"],
    counters: [
      { name: "Pressure and body", explanation: "Force them to swing and break discipline with body-pressure" },
    ],
    overuseSignals: ["Punch three habit punished repeatedly"],
    related: ["controlled-aggression", "meaningful-offense", "overcommitment", "read-confirmed"],
    communityTerms: ["offensive discipline"],
  },
  {
    id: "missed-counter-window",
    name: "Missed Counter Window",
    aliases: ["missed counter window", "missed counter"],
    category: "counterplay",
    definition:
      "Visible opponent commitment-window not punished — hesitation or volume chase instead of counter-range power straight or whiff punish.",
    whyItWorks:
      "N/A — failure mode. Free recovery for opponent and lost impact-moment opportunity.",
    whenEffective: [],
    counters: [
      { name: "Counter-window training", explanation: "Fire one punch on first recovery frame not combo chase" },
    ],
    overuseSignals: ["Opponent overextends repeatedly with no counter landed"],
    related: ["counter-window", "hesitation", "missed-recovery-punish", "recovery-punish"],
    communityTerms: ["missed counter window"],
  },
  {
    id: "missed-recovery-punish",
    name: "Missed Recovery Punish",
    aliases: ["missed recovery punish", "missed punish window"],
    category: "counterplay",
    definition:
      "Failure to attack during post-combo or post-whiff recovery-window — opponent returns to safe guard without cost.",
    whyItWorks:
      "N/A — failure mode. Core difference between counter-puncher and winning-statistical-fight volume player.",
    whenEffective: [],
    counters: [
      { name: "Recovery-punish discipline", explanation: "Pre-load power straight during opponent punch three animation" },
    ],
    overuseSignals: ["Combo ends with no follow-up while opponent still in recovery"],
    related: ["recovery-punish", "recovery-window", "missed-whiff-punish", "power-straight-engineering"],
    communityTerms: ["missed recovery punish"],
  },
  {
    id: "read-confirmed",
    name: "Read Confirmed",
    aliases: ["confirmed read", "read confirmed"],
    category: "meta",
    definition:
      "Opponent pattern verified two or more times — safe to commit controlled-cheese, power-straight-engineering, or rhythm-read counter without guessing.",
    whyItWorks:
      "FNC meta punishes on third rep. Confirmed read means opponent is on script not reacting.",
    whenEffective: ["Before committing power straight off block release", "Before sidestep uppercut spam trigger"],
    counters: [
      { name: "Rhythm break", explanation: "Break pattern on third rep before punish lands" },
    ],
    overuseSignals: ["Committing full cheese on single observation — read-unconfirmed"],
    related: ["read-unconfirmed", "rhythm-read", "controlled-cheese", "pattern-speed"],
    communityTerms: ["read confirmed"],
  },
  {
    id: "read-unconfirmed",
    name: "Read Unconfirmed",
    aliases: ["unconfirmed read", "single read"],
    category: "meta",
    definition:
      "Single instance of opponent pattern — insufficient evidence to overcommit mechanic or controlled-cheese. Use jab-as-data for second confirmation.",
    whyItWorks:
      "Prevents mindless-spam and adaptation-failure from punishing on guess. Elite players wait for read-confirmed.",
    whenEffective: ["First round scouting", "New opponent habits unknown"],
    counters: [
      { name: "Fake pattern", explanation: "Show false trigger once to bait premature punish" },
    ],
    overuseSignals: ["Full power straight setup after one block release"],
    related: ["read-confirmed", "jab-as-data", "adaptation-check", "hesitation"],
    communityTerms: ["read unconfirmed"],
  },
  {
    id: "adaptation-successful",
    name: "Adaptation Successful",
    aliases: ["successful adaptation", "adapted successfully"],
    category: "meta",
    definition:
      "Correct mid-fight adjustment that stops opponent established punish — e.g. angle entry after sidestep uppercut read, rhythm-break after block release timing, body plan after straight-spam failure.",
    whyItWorks:
      "Removes opponent trigger and forces them to find new read. Marks fight-iq advantage over adaptation-failure.",
    whenEffective: ["After second punish on same pattern", "Round two onward with scout data"],
    counters: [
      { name: "Secondary exploit", explanation: "Ultimate-cheeser switches to backup mechanic when primary is adapted to" },
    ],
    overuseSignals: ["Claiming adaptation without opponent punish stopping"],
    related: ["adaptation", "adaptation-failure", "adaptation-check", "rhythm-break"],
    communityTerms: ["adaptation successful"],
  },
];
