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
  th: ["Think it through, then thank them both.","My brother thinks the weather will change.","Their mother has a birthday this month.","The path goes north through the trees.","Both of them thought about the truth."],
  tri: ["A strong string stretched across the street.","Three trucks struggled up the steep street.","The spring stream splashed over the stones.","She spread the straw across the ground."],
  lb: ["Please place the black clock on the table.","The blue flame glowed in the fireplace.","A plane flew slowly over the playground.","Play it slow and keep it clean."],
  rb: ["The train brought fresh bread from France.","Green grass grew around the broken truck.","Press the brake before you drive away.","My friend drew a great brown dragon."],
  sb: ["The small spider spun on the stairs.","Stack the sticks beside the stone steps.","She swept the smooth stone floor slowly.","Stop and smell the sweet spring air."],
  fc: ["Hold the cold milk with both hands.","The band played past midnight last night.","Send the list to my old friend.","He built a small fort in the field."],
};

export const CATS = [
  { id: "th",  name: "TH sounds",        ex: "three, month, think" },
  { id: "tri", name: "3-consonant clusters", ex: "street, strong, spring" },
  { id: "lb",  name: "L-blends",         ex: "please, black, clap" },
  { id: "rb",  name: "R-blends",         ex: "train, friend, grow" },
  { id: "sb",  name: "S-blends",         ex: "stop, spin, small" },
  { id: "fc",  name: "Final clusters",   ex: "world, want, help" },
];

export const MILESTONES = [500, 1000, 2000, 5000, 10000, 15000];
export const GOALS = { words: 1000, pairs: 80, sets: 60 }; // daily ring scales
