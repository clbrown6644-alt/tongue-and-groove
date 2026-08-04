import { WORD_TIERS, WORD_CORE, WORD_SLP, WORDS_PS } from "./words.gen.js";
export { WORD_TIERS };

// Practice order per category: 2 core (rank 1-1,000) words for every 1
// SLP-informed addition (clinically valuable words from ranks 1,001-1,500 —
// 3+ syllables, heavy clusters, or place-switchers). Both lists come
// syllable-sorted (short first), so decks ramp word length as they unlock.
// "ps" is the hidden place-switcher category — practiced, never shown in scoring.
function mix2to1(core, adds) {
  const out = [];
  let i = 0, j = 0;
  while (i < core.length || j < adds.length) {
    for (let k = 0; k < 2 && i < core.length; k++) out.push(core[i++]);
    if (j < adds.length) out.push(adds[j++]);
  }
  return out;
}
export const WORDS = {
  ...Object.fromEntries(Object.keys(WORD_CORE).map((c) => [c, mix2to1(WORD_CORE[c], WORD_SLP[c] || [])])),
  ps: WORDS_PS,
};

// Why 2:1 and not 50/50: common words carry real-life carryover and confidence;
// clinical words drive motor gains. A third clinical keeps drills recognizable
// while every third word stretches the mouth. Condition presets tune WHICH
// categories get time; the mix stays constant.

// Condition presets — default 1-5 category weights per diagnosis, set at the
// "What brings you here?" screen. ps = hidden place-switcher weight.
// Grounded in dysarthria/apraxia literature (see Clinical Notes in vault):
// stroke → clusters/fricatives; Parkinson's → final consonants & fricatives
// (articulatory undershoot); TBI → coordination: clusters + place transitions;
// dementia (nfvPPA/PPAOS) → length-sensitive, keep weights even, transitions up.
export const CONDITIONS = [
  { id: "stroke", name: "Stroke" },
  { id: "dementia", name: "Dementia / PPA" },
  { id: "tbi", name: "Traumatic brain injury (TBI)" },
  { id: "parkinsons", name: "Parkinson's disease" },
  { id: "other", name: "Other / not sure" },
];
export const PRESETS = {
  stroke:     { th: 4, tri: 5, lb: 3, rb: 3, sb: 4, fc: 4, ps: 4 },
  dementia:   { th: 3, tri: 3, lb: 3, rb: 3, sb: 3, fc: 3, ps: 4 },
  tbi:        { th: 3, tri: 5, lb: 4, rb: 4, sb: 4, fc: 4, ps: 5 },
  parkinsons: { th: 4, tri: 4, lb: 3, rb: 3, sb: 4, fc: 5, ps: 3 },
  other:      { th: 3, tri: 3, lb: 3, rb: 3, sb: 3, fc: 3, ps: 3 },
};

export const PAIRS = {
  th: [["thin","fin"],["three","free"],["thick","tick"],["think","sink"],["thought","taught"],["path","pass"],["math","mat"],["both","boat"],["they","day"],["then","den"],["bath","bat"],["mouth","mouse"]],
  tri: [["street","treat"],["string","sting"],["spring","sing"],["scream","cream"],["throw","row"],["strap","trap"],["spray","pray"],["screw","crew"],["split","spit"],["three","tree"]],
  lb: [["play","pay"],["please","peas"],["black","back"],["clap","cap"],["glow","go"],["flame","fame"],["slow","so"],["place","pace"],["blue","boo"],["clock","cock"],["flat","fat"],["slip","sip"]],
  rb: [["train","rain"],["tree","tea"],["grass","gas"],["drip","dip"],["free","fee"],["brake","bake"],["crash","cash"],["grow","go"],["brand","band"],["drive","dive"],["press","pess"],["crow","row"]],
  sb: [["stop","top"],["spin","pin"],["snow","no"],["small","mall"],["stick","tick"],["spot","pot"],["skate","Kate"],["smile","mile"],["steam","team"],["spill","pill"],["sweet","wheat"],["stair","tear"]],
  fc: [["cart","car"],["park","par"],["farm","far"],["cold","coal"],["hold","hole"],["went","wet"],["tent","ten"],["band","ban"],["milk","mill"],["fort","for"],["harm","are"],["bird","burr"]],
  x: [["juice","use"],["gin","yin"],["shoe","Sue"],["shame","same"],["beach","beat"],["chip","ship"],["chair","share"],["jeep","cheap"],["joke","yolk"],["wash","watch"],["cash","catch"],["jam","yam"]],
};

// Every sentence carries 4+ target-pattern words (function words like "the"/
// "them" don't count toward the quota) — SLP loading standard for drill text.
export const SENTENCES = {
  th: ["Think it through, then thank them both.","My brother thinks the weather will change this month.","Their mother has a birthday on Thursday this month.","The path goes north through the thick trees.","Both of them thought the theory was the truth.","Thank them both for the thoughtful birthday gifts.","We thought the weather this month felt rather warm.","Truthfully, I think both paths lead north.","My father and mother both live up north.","Health and strength come through monthly practice.","Nothing is worth more than your health and strength.","Think about something worth doing this month.","Breathe deeply, think it through, and say thanks."],
  tri: ["A strong string stretched across the street.","Three strong trucks struggled up the steep street.","The spring stream splashed straight over the stones.","She scrubbed the screen and sprayed the strawberry plants.","Spread the straw and spray the spring plants.","Strong students stretch and sprint down the street.","The screen showed a strange script about spring.","He threw three straight strikes in a row.","Squeeze the stroller through the narrow spring gate.","A splash of cream, a squeeze of lime, a sprig of mint, a straw.","Scrape the scrap wood and spread it across the street.","The string stretched straight across the stream."],
  lb: ["Please place the black clock on the table.","The blue flame glowed in the fireplace.","A plane flew slowly over the playground.","Play it slow, plain, and clean.","Please close the blue glass door.","The black clock glows blue in the dark.","Please plant the flowers along the flat path.","The plane climbed slowly above the clouds.","Place the plates on the clean table.","The blue flag flapped in the blowing wind.","Glad flames glowed in the black stove.","Slide the glass slowly across the table."],
  rb: ["The train brought fresh bread from France.","Green grass grew around the broken truck.","Press the brake before you drive across the bridge.","My friend drew a great brown dragon.","Bring fresh bread for breakfast.","The crowd pressed toward the bright green stage.","Grandpa drives a green truck.","Practice brings progress and pride.","Drink your fresh drink before we drive.","Brown branches broke in the breeze.","My friend brought French bread from town.","The brave crew crossed the frozen creek."],
  sb: ["The small spider spun on the stairs.","Stack the sticks beside the stone steps.","She swept the smooth stone floor with a stiff broom.","Stop and smell the sweet spring air.","Stop at the store for sweet snacks.","The smart student speaks with skill.","Snow settled on the steep stone steps.","Stand still and smell the smoke.","She spun the spoon across the smooth stone.","Start slow, stay steady, then pick up speed.","Spring sports start this Saturday at the stadium.","Skip the small stones and stay on the path."],
  fc: ["Hold the cold milk with both hands.","The old band played past midnight last night.","Send the list to my old friend.","He built a small fort in the west field.","Hold my hand and help the child stand.","The old barn stood in the cold wind.","First, send the list to the front desk.","Milk and toast make a fast breakfast.","The band marched past the old church at dusk.","Hard work helped him hold his ground.","The child found gold sand at the beach.","Paint the fence and mend the yard."],
};

export const CATS = [
  { id: "th",  name: "TH sounds",        ex: "three, month, think" },
  { id: "tri", name: "3-consonant clusters", ex: "street, strong, spring" },
  { id: "lb",  name: "L-blends",         ex: "please, black, clap" },
  { id: "rb",  name: "R-blends",         ex: "train, friend, grow" },
  { id: "sb",  name: "S-blends",         ex: "stop, spin, small" },
  { id: "fc",  name: "Final clusters",   ex: "world, want, help" },
];

// Situation packs — functional vocabulary for real settings. Deliberately mixes
// motor-difficult words with easy-but-essential ones: in a scenario, usefulness
// outranks difficulty (personally relevant words drive adherence — see PRD).
export const SCENARIOS = [
  { id: "rest", name: "Restaurant", words: ["reservation","table","waiter","waitress","menu","special","appetizer","entree","dessert","breakfast","lunch","dinner","coffee","salad","dressing","chicken","steak","shrimp","salmon","grilled","fried","baked","mashed","potatoes","vegetables","spicy","mild","allergic","gluten","substitute","medium","check","separate","credit","refill","straw","napkin","silverware","takeout","leftovers","delicious"] },
  { id: "dr", name: "Doctor visit", words: ["appointment","doctor","nurse","patient","symptoms","prescription","pharmacy","medication","dosage","refill","insurance","copay","deductible","blood","pressure","cholesterol","diabetes","therapy","therapist","stroke","speech","swallowing","dizzy","numbness","tingling","weakness","fatigue","headache","chest","breathing","allergies","aspirin","ibuprofen","exercise","stretches","specialist","referral","results","treatment","recovery","progress","questions"] },
  { id: "biz", name: "Work & business", words: ["meeting","schedule","calendar","project","deadline","email","spreadsheet","presentation","client","customer","contract","invoice","budget","report","conference","colleague","manager","supervisor","interview","promotion","salary","benefits","retirement","training","feedback","strategy","quarterly","revenue","profit","proposal","agenda","minutes","remote","office","business","professional","experience","responsibility","organization","department"] },
  { id: "phone", name: "Phone calls", words: ["hello","speaking","calling","message","voicemail","transfer","extension","hold","appointment","confirm","cancel","reschedule","address","street","avenue","apartment","zip","account","number","password","username","confirmation","operator","representative","customer","service","billing","statement","balance","payment","transaction","deposit","withdrawal","branch","location","directions"] },
  { id: "fam", name: "Family & social", words: ["family","brother","sister","mother","father","grandchildren","granddaughter","grandson","birthday","anniversary","holiday","Christmas","Thanksgiving","weekend","visiting","pictures","weather","beautiful","church","neighborhood","neighbors","friends","celebration","congratulations","wonderful","exciting","vacation","traveling","stories","memories","laughing","together","welcome","thankful","blessing","barbecue","football","baseball"] },
  { id: "shop", name: "Shopping", words: ["groceries","shopping","store","receipt","register","checkout","cashier","aisle","produce","frozen","bakery","deli","coupon","discount","sale","price","expensive","cheaper","brand","generic","credit","debit","change","exchange","return","refund","warranty","delivery","curbside","pickup","cart","basket","heavy","plastic"] },
];

// ---------------------------------------------------------------------------
// Practice restructure (2026-08 build spec): Words + Sentences merge into one
// staged session — warm-up words, then word→sentence "couples", then carryover.
// Scenario sentences below are the couples material: first person, 6–10 words,
// adult phrasing, each containing at least one mechanically demanding word
// from its pack. Doctor & Restaurant run 60 deep (event-prep priorities 1–2);
// the rest are session-ready at 30.
// ---------------------------------------------------------------------------

export const SCENARIO_SENTENCES = {
  dr: [
    "I need to schedule an appointment with my doctor.",
    "My speech has been slurred since the stroke.",
    "Can I get a refill on my prescription?",
    "I'm still taking the blood pressure medication.",
    "The new dosage makes me dizzy in the morning.",
    "My symptoms started about three weeks ago.",
    "I have a question about my test results.",
    "Does my insurance cover speech therapy?",
    "How much is the copay for this visit?",
    "I haven't met my deductible yet this year.",
    "My cholesterol was high at the last checkup.",
    "I check my blood pressure every morning.",
    "The doctor referred me to a specialist.",
    "I need a referral for the speech therapist.",
    "My swallowing gets worse when I'm tired.",
    "I feel numbness and tingling in my left hand.",
    "The weakness in my arm is improving slowly.",
    "Fatigue hits me hard every afternoon.",
    "I've had a headache for two days straight.",
    "My chest feels tight when I climb stairs.",
    "My breathing gets short when I walk fast.",
    "I'm allergic to penicillin and aspirin.",
    "Can I take ibuprofen with this medication?",
    "The pharmacy said my prescription is ready.",
    "What are the side effects of this treatment?",
    "My recovery is going better than expected.",
    "I do my speech exercises twice a day.",
    "The therapist gave me new stretches this week.",
    "When will the test results come back?",
    "I'd like to discuss my progress with the doctor.",
    "The nurse checked my blood pressure twice.",
    "I've been a patient here for ten years.",
    "My diabetes is under control with medication.",
    "Could you explain the dosage instructions again?",
    "I missed my appointment last Thursday.",
    "Can we reschedule my appointment for next week?",
    "My symptoms get worse in the evening.",
    "I wrote down my questions before this visit.",
    "Is this covered by my insurance plan?",
    "The medication upsets my stomach sometimes.",
    "I get dizzy when I stand up too fast.",
    "My therapist says my speech is improving.",
    "Should I keep taking the aspirin every day?",
    "The swallowing therapy has really helped me.",
    "I need my prescription sent to a different pharmacy.",
    "My headache starts behind my right eye.",
    "The stretches help with the stiffness in my neck.",
    "How long will this treatment take to work?",
    "I'd like a copy of my test results.",
    "The specialist wants to see me next month.",
    "My progress has been slow but steady.",
    "Exercise helps with my strength and balance.",
    "I take my medication with breakfast every day.",
    "The tingling in my fingers comes and goes.",
    "Can the nurse show me the breathing exercises?",
    "My blood pressure was normal this morning.",
    "I have trouble swallowing pills without water.",
    "Please speak slowly — I had a stroke.",
    "What symptoms should I watch out for?",
    "Thank you, doctor — that answers my questions.",
  ],
  rest: [
    "I have a reservation for six o'clock.",
    "Could we get a table by the window?",
    "Could we sit somewhere quieter, please?",
    "What are the specials tonight?",
    "I'll have the soup and a coffee.",
    "Can we start with an appetizer to share?",
    "I'd like the grilled salmon, please.",
    "Does the chicken come with vegetables?",
    "I'll take the steak, cooked medium.",
    "Can I substitute mashed potatoes for the fries?",
    "I'm allergic to shrimp and shellfish.",
    "Is there gluten in the salad dressing?",
    "Could I get the dressing on the side?",
    "Is the sauce spicy or mild?",
    "I'll have the fried chicken with vegetables.",
    "What do you recommend for dessert?",
    "Could I get a refill on my coffee?",
    "Can I have a straw for my drink?",
    "We need more napkins at this table.",
    "I dropped my fork — could I get more silverware?",
    "The salmon was absolutely delicious tonight.",
    "Could we get the check, please?",
    "Could we get separate checks, please?",
    "I'll put it on my credit card.",
    "Can I get a box for the leftovers?",
    "I'd like to order takeout for tonight.",
    "We're ready to order breakfast now.",
    "Is lunch still being served?",
    "What time do you stop serving dinner?",
    "The baked potato needs more butter.",
    "That food was terrible.",
    "This is the best steak I've had in years.",
    "Could you warm this up a little more?",
    "My entree hasn't come out yet.",
    "We've been waiting twenty minutes for our drinks.",
    "Could you tell the waiter we're ready?",
    "Is there a wait for a table right now?",
    "Can we move to a bigger table?",
    "I'd like my eggs scrambled, please.",
    "Do you have decaf coffee?",
    "The dessert menu, please — we're celebrating.",
    "I can't eat anything too spicy.",
    "Could I see the menu again, please?",
    "We'd like to order an appetizer first.",
    "Does the special come with a salad?",
    "I'll have the grilled vegetables as my side.",
    "My wife will have the baked salmon.",
    "Everything was delicious — our compliments to the chef.",
    "Could you bring some water for the table?",
    "Is the tip included in the check?",
    "Can I make a reservation for Saturday night?",
    "We need a high chair for the baby.",
    "The leftovers will make a good lunch tomorrow.",
    "I'd like a coffee with cream and sugar.",
    "What kind of dressing do you have?",
    "Could you box up the rest of my dinner?",
    "This table is a little close to the kitchen.",
    "Do you take reservations for large groups?",
    "My steak is overcooked — I ordered medium.",
    "Thank you — the service was wonderful tonight.",
  ],
  phone: [
    "Hello, may I speak with the billing department?",
    "I'm calling about my account balance.",
    "Could you transfer me to customer service?",
    "I'd like to speak with a representative, please.",
    "Please speak slowly — I'm still recovering my speech.",
    "I left a message on your voicemail yesterday.",
    "My extension is two four seven.",
    "I've been on hold for twenty minutes.",
    "I'm calling to confirm my appointment.",
    "I need to cancel my appointment for Tuesday.",
    "Can we reschedule for later this week?",
    "Let me give you my street address.",
    "I live in the corner apartment on Fifth Avenue.",
    "Do you need my zip code and apartment number?",
    "I forgot the password for my account.",
    "My username is my email address.",
    "Could you send me a confirmation number?",
    "May I speak with the operator, please?",
    "I have a question about my billing statement.",
    "When is my next payment due?",
    "I don't recognize this transaction on my statement.",
    "I'd like to make a deposit by phone.",
    "Can I make a withdrawal at any branch?",
    "What's the location of your nearest branch?",
    "Could you give me directions to your office?",
    "Please hold while I find my account number.",
    "I'm returning a call about my appointment.",
    "Is there a confirmation email coming?",
    "Sorry, could you repeat the extension number?",
    "Thank you for your help — have a good day.",
  ],
  fam: [
    "The grandchildren are visiting this weekend.",
    "My granddaughter starts school in September.",
    "My grandson made the baseball team.",
    "Happy birthday — the party was wonderful.",
    "We're celebrating our fortieth anniversary this fall.",
    "The whole family is coming for Thanksgiving.",
    "We're hosting Christmas dinner this year.",
    "Congratulations on the new baby!",
    "Show me the pictures from your vacation.",
    "The weather was beautiful for the barbecue.",
    "My brother is traveling through in August.",
    "My sister calls me every Sunday evening.",
    "Mother would have loved this celebration.",
    "We watched the football game together on Saturday.",
    "The neighbors brought dinner over last night.",
    "Our neighborhood has a picnic every summer.",
    "We saw old friends at church this morning.",
    "Tell me that story about Grandpa again.",
    "We stayed up late laughing at old memories.",
    "It's a blessing to have everyone together.",
    "I'm thankful for my family every day.",
    "Welcome home — we missed you so much.",
    "The kids grow up so fast, don't they?",
    "What an exciting weekend for the whole family.",
    "We're planning a family vacation for next summer.",
    "Dad told his favorite fishing story again.",
    "The birthday cake was chocolate with strawberries.",
    "Let's take a family picture before everyone leaves.",
    "The holiday traffic was terrible this year.",
    "Come visit us again soon — anytime.",
  ],
  shop: [
    "Which aisle has the frozen vegetables?",
    "Where can I find the fresh produce?",
    "Is the bakery bread made this morning?",
    "A pound of turkey from the deli, please.",
    "I have a coupon for this brand.",
    "Is this still on sale this week?",
    "What's the price without the discount?",
    "That's too expensive — is there a cheaper brand?",
    "I'll take the generic brand instead.",
    "Do you take credit or debit here?",
    "I'd like to pay with my debit card.",
    "You gave me the wrong change, I think.",
    "I need to return this — here's my receipt.",
    "Can I exchange this for a larger size?",
    "I'd like a refund on this purchase.",
    "Does this come with a warranty?",
    "Do you offer home delivery for groceries?",
    "I ordered curbside pickup for noon.",
    "My cart has a squeaky wheel.",
    "This basket is getting too heavy for me.",
    "Could someone help me carry the heavy bags?",
    "Plastic bags, please — they're easier to carry.",
    "The checkout line is shorter over there.",
    "The cashier forgot to scan my coupon.",
    "I left my shopping list in the car.",
    "The register gave me the wrong total.",
    "Where do I pick up my online order?",
    "Excuse me, where are the shopping carts?",
    "I'm just picking up a few groceries.",
    "Could you double-bag that, please? It's heavy.",
  ],
  biz: [
    "Can we schedule the meeting for Thursday morning?",
    "I'll send the agenda before the meeting.",
    "Let me check my calendar and get back to you.",
    "The project deadline is the end of the month.",
    "I emailed the spreadsheet to the whole team.",
    "The presentation went better than I expected.",
    "Our client wants the proposal by Friday.",
    "The customer asked for a detailed invoice.",
    "We signed the contract yesterday afternoon.",
    "The budget report is due next quarter.",
    "I'm attending the conference in October.",
    "My colleague is covering my calls today.",
    "My manager approved the vacation request.",
    "I have an interview scheduled for Monday.",
    "She earned that promotion — congratulations.",
    "The salary and benefits are negotiable.",
    "I'm planning my retirement for next spring.",
    "The training session runs from nine to noon.",
    "I'd appreciate your feedback on the proposal.",
    "Our strategy for the quarter is simple.",
    "Revenue was up eight percent this quarter.",
    "The profit margin improved after the changes.",
    "Who's taking the minutes for this meeting?",
    "I'm working remote on Tuesdays and Thursdays.",
    "The office is closed for the holiday.",
    "It's been a pleasure doing business with you.",
    "Keep it professional in the client meeting.",
    "I have ten years of experience in this department.",
    "That responsibility belongs to our organization.",
    "Let's follow up by email after the call.",
  ],
};

// Carryover stage (Practice mode): short functional sentences — the things a
// person actually needs to say clearly this week. Scenario sessions draw
// carryover from their own bank instead (requests and questions first).
export const FUNCTIONAL = [
  "Could you speak a little slower, please?",
  "I need a minute to get the words out.",
  "Please give me some water.",
  "Thanks for being patient with me.",
  "Can you hear me okay?",
  "Let me try saying that again.",
  "I'd like to make an appointment.",
  "Could you turn down the television, please?",
  "I'm ready to leave in ten minutes.",
  "Please write that down for me.",
  "What time is dinner tonight?",
  "Thank you for helping me today.",
];

// Words that never count as practice targets — articles, prepositions,
// auxiliaries, pronouns, and other carrier glue (build-spec counting rule:
// target words only, carrier words never).
const FUNCTION_WORDS = new Set(("a an the and or but so if then than that this these those there here " +
  "of to in on at by for from with without into over under about after before between during up down out off " +
  "is are was were be been being am do does did done have has had having will would can could should may might " +
  "must shall it its i you he she we they them him her his my your our their me us mine yours what which who " +
  "whom whose when where why how not no yes too very just also as again once more most some any all both each " +
  "few other such only own same don't isn't wasn't aren't won't can't couldn't wouldn't shouldn't let's " +
  "i'm i'd i'll i've we're we've you're they're he's she's it's there's what's that's who's").split(" "));

export function syllables(w) {
  const groups = w.toLowerCase().match(/[aeiouy]+/g) || [];
  let n = groups.length;
  if (/e$/.test(w) && !/(le|ee|ie|oe|ye)$/.test(w) && n > 1) n -= 1;
  return Math.max(1, n);
}

// Difficulty score per word — syllable load + cluster analysis + articulator
// place jumps (same heuristics as scripts/build_words.py). Drives which target
// in a sentence becomes the couple's beat-1 word.
const PLACE = { p: 1, b: 1, m: 1, w: 1, f: 1, v: 1, t: 2, d: 2, s: 2, z: 2, n: 2, l: 2, r: 2, k: 3, g: 3, c: 3, q: 3, x: 3 };
export function difficultyScore(word) {
  const w = word.toLowerCase();
  let s = 0;
  const syl = syllables(w);
  if (syl >= 4) s += 4; else if (syl === 3) s += 3; else if (syl === 2) s += 1;
  if (/(str|spr|scr|spl|squ|thr)/.test(w)) s += 3;
  const clusters = w.match(/[bcdfghjklmnpqrstvwxz]{2,}/g) || [];
  if (clusters.length >= 1) s += 1;
  if (clusters.length >= 2) s += 2;
  if (/^[bcdfghjklmnpqrstvwxz]{2}/.test(w)) s += 1;
  const seq = [...w].map((c) => PLACE[c]).filter(Boolean);
  let jumps = 0;
  for (let i = 1; i < seq.length; i++) if (seq[i] !== seq[i - 1]) jumps++;
  if (jumps >= 3) s += 2;
  return s;
}

export const cleanToken = (t) => t.toLowerCase().replace(/[^a-z']/g, "").replace(/'s$/, "");

// Target words of a sentence: content words with real motor demand (2+
// syllables, a consonant cluster, or a TH). These are what the counter credits.
export function targetsOf(sentence) {
  const seen = new Set();
  const out = [];
  for (const tok of sentence.split(/\s+/)) {
    const w = cleanToken(tok);
    if (!w || FUNCTION_WORDS.has(w) || seen.has(w)) continue;
    if (syllables(w) >= 2 || /[bcdfgklmnprstvz]{2}/.test(w) || w.includes("th")) {
      out.push(w);
      seen.add(w);
    }
  }
  return out;
}
export function topTarget(sentence) {
  const t = targetsOf(sentence);
  return t.length ? t.reduce((a, b) => (difficultyScore(b) > difficultyScore(a) ? b : a)) : cleanToken(sentence.split(/\s+/)[0]);
}

// Condition variants (build spec §3): only the warm-up shape changes — apraxia
// needs volume at the word level (motor plan is the work), dysarthria should
// reach connected speech fast (plan intact, execution degraded).
export const VARIANTS = [
  { id: "apraxia", label: "Getting the word out at all", warmup: [10, 10, 10] },
  { id: "dysarthria", label: "Slurred or hard to understand", warmup: [30] },
  { id: "articulation", label: "Specific sounds", warmup: [15, 15] },
];
export const COND_VARIANT = { stroke: "dysarthria", dementia: "apraxia", tbi: "dysarthria", parkinsons: "dysarthria", other: "dysarthria" };

export const MILESTONES = [500, 1000, 2000, 5000, 10000, 15000];
// Daily ring scales, recalibrated for staged sessions: one full session banks
// ~175 target credits and 5 stage-sets, so the rings ≈ two sessions a day.
export const GOALS = { words: 350, pairs: 80, sets: 10 };
