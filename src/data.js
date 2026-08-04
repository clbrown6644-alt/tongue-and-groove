import { WORD_TIERS } from "./words.gen.js";

// Rank-ordered per category (most common first): tier1 + tier2 + tier3.
// Generated from wordfreq top-3000 conversational English — see scripts/build_words.py
export const WORDS = Object.fromEntries(
  Object.entries(WORD_TIERS).map(([cat, tiers]) => [cat, tiers.flat()])
);

export const PAIRS = {
  th: [["thin","fin"],["three","free"],["thick","tick"],["think","sink"],["thought","taught"],["path","pass"],["math","mat"],["both","boat"],["they","day"],["then","den"],["bath","bat"],["mouth","mouse"]],
  tri: [["street","treat"],["string","sting"],["spring","sing"],["scream","cream"],["throw","row"],["strap","trap"],["spray","pray"],["screw","crew"],["split","spit"],["three","tree"]],
  lb: [["play","pay"],["please","peas"],["black","back"],["clap","cap"],["glow","go"],["flame","fame"],["slow","so"],["place","pace"],["blue","boo"],["clock","cock"],["flat","fat"],["slip","sip"]],
  rb: [["train","rain"],["tree","tea"],["grass","gas"],["drip","dip"],["free","fee"],["brake","bake"],["crash","cash"],["grow","go"],["brand","band"],["drive","dive"],["press","pess"],["crow","row"]],
  sb: [["stop","top"],["spin","pin"],["snow","no"],["small","mall"],["stick","tick"],["spot","pot"],["skate","Kate"],["smile","mile"],["steam","team"],["spill","pill"],["sweet","wheat"],["stair","tear"]],
  fc: [["cart","car"],["park","par"],["farm","far"],["cold","coal"],["hold","hole"],["went","wet"],["tent","ten"],["band","ban"],["milk","mill"],["fort","for"],["harm","are"],["bird","burr"]],
  x: [["juice","use"],["gin","yin"],["shoe","Sue"],["shame","same"],["beach","beat"],["chip","ship"],["chair","share"],["jeep","cheap"],["joke","yolk"],["wash","watch"],["cash","catch"],["jam","yam"]],
};

export const SENTENCES = {
  th: ["Think it through, then thank them both.","My brother thinks the weather will change.","Their mother has a birthday this month.","The path goes north through the trees.","Both of them thought about the truth.","Thank them both for the birthday gifts.","The weather this month has been rather warm.","Tell the truth, even when it is hard.","My father and mother live up north.","Health and strength come through practice.","Nothing is worth more than your health.","Think about something worth doing this month.","Breathe deeply and think it through."],
  tri: ["A strong string stretched across the street.","Three trucks struggled up the steep street.","The spring stream splashed over the stones.","She spread the straw across the ground.","Spread the straw and spray the plants.","Strong students stretch before the sprint.","The screen showed a strange script.","He threw three strikes in a row.","Squeeze through the narrow spring gate.","A splash of cream, a squeeze of lime.","Scrape the scrap wood off the street.","The string stretched straight across the stream."],
  lb: ["Please place the black clock on the table.","The blue flame glowed in the fireplace.","A plane flew slowly over the playground.","Play it slow and keep it clean.","Please close the blue glass door.","The black clock glows in the dark.","Plant the flowers along the flat path.","The plane climbed above the clouds.","Place the plates on the clean table.","The flag flapped in the blowing wind.","Glad flames glowed in the black stove.","Slide the glass slowly across the table."],
  rb: ["The train brought fresh bread from France.","Green grass grew around the broken truck.","Press the brake before you drive away.","My friend drew a great brown dragon.","Bring fresh bread for breakfast.","The crowd pressed toward the bright stage.","Grandpa drives a green truck.","Practice brings progress and pride.","Drink your drink before we drive.","Brown branches broke in the breeze.","My friend brought French bread from town.","The brave crew crossed the frozen creek."],
  sb: ["The small spider spun on the stairs.","Stack the sticks beside the stone steps.","She swept the smooth stone floor slowly.","Stop and smell the sweet spring air.","Stop at the store for sweet snacks.","The smart student speaks with skill.","Snow settled on the steep steps.","Stand still and smell the smoke.","She spun the spoon on the smooth table.","Start slow, then pick up speed.","Sports start at six on Saturday.","Skip the small steps and stay steady."],
  fc: ["Hold the cold milk with both hands.","The band played past midnight last night.","Send the list to my old friend.","He built a small fort in the field.","Hold my hand and don't let go.","The old barn stood in the cold wind.","First, send the list to the front desk.","Milk and toast make a fast breakfast.","The band marched past the old church.","Hard work helped him hold his ground.","The child found gold sand at the beach.","Paint the fence and mend the yard."],
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
