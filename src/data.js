import { WORD_TIERS, WORD_CORE, WORD_SLP, WORDS_PS } from "./words.gen.js";
export { WORD_TIERS };

// Practice order per category: 2 core (rank 1-1,000) words for every 1
// SLP-informed addition (clinically valuable words from ranks 1,001-3,000 —
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

export const MILESTONES = [500, 1000, 2000, 5000, 10000, 15000];
export const GOALS = { words: 1000, pairs: 80, sets: 60 }; // daily ring scales
