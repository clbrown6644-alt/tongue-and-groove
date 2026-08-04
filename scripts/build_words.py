#!/usr/bin/env python3
"""Generate the Tongue & Groove word library from wordfreq.

v2 (2026-08-04): core-1000 + SLP-informed additions + hidden place-switcher list.

- WORD_TIERS: full top-1500 in 2 frequency tiers per category (reference/docs)
- WORD_CORE:  rank 1-1000 words per category ("most common" base)
- WORD_SLP:   clinically valuable words from rank 1001-1500 — kept only if
              3+ syllables, contains a 3-consonant cluster, or is a
              place-switcher (what an SLP would add beyond frequency)
- WORDS_PS:   hidden place-switcher category — words forcing the tongue/lips
              to jump between articulation places (lips ↔ tongue-tip ↔ back),
              like clinical "buttercup" / pa-ta-ka sequencing drills
- Every list is stable-sorted by syllable count (short words first) within
  its frequency order → implicit syllable-count progression as decks unlock.

Run: python3 scripts/build_words.py  → writes src/words.gen.js + prints stats
"""
import json
import re
from wordfreq import top_n_list, word_frequency, zipf_frequency

TOP_N = 1500
TIERS = [(0, 1000), (1000, 1500)]

STOP = {
    "could", "would", "should", "walk", "talk", "talked", "talking", "walking",
    "folk", "folks", "chalk", "yolk", "half", "who", "whose", "whom", "whole",
    "answer", "island", "listen", "often", "castle", "christmas", "wednesday",
    "climbed", "comb", "thumb", "dumb", "lamb", "limb", "debt", "doubt",
    "receipt", "iron", "colonel", "sword", "know", "known", "knows", "knew",
    # proper nouns / artifacts in the frequency list
    "thomas", "smith", "elizabeth", "australia", "africa", "france", "thats",
    "trump", "april", "february", "friday", "thursday", "saturday",
    # web-corpus junk: URLs, acronyms, abbreviations (not real spoken words)
    "http", "https", "www", "com", "org", "net", "gov", "html", "pdf",
    "nfl", "nba", "nhl", "mlb", "bbc", "cnn", "fbi", "cia", "ltd", "inc",
    "mrs", "etc", "usa", "dvd", "gps", "app", "apps", "online", "url",
    # more proper nouns: people, places, brands, months, days
    "christ", "jesus", "christian", "christians", "catholic", "bible",
    "muslim", "jewish", "islam", "israel", "england", "ireland", "scotland",
    "wales", "london", "florida", "francisco", "california", "texas",
    "virginia", "washington", "boston", "chicago", "manchester", "germany",
    "german", "russia", "russian", "china", "chinese", "japan", "japanese",
    "europe", "india", "canada", "mexico", "andrew", "david", "michael",
    "john", "james", "george", "robert", "william", "richard", "facebook",
    "google", "twitter", "youtube", "instagram", "iphone", "microsoft",
    "australian", "centre", "monday", "tuesday", "sunday", "january", "june",
    "july", "august", "september", "october", "november", "december",
}

FC_EXCLUDE_END = re.compile(r"(gh|ght|ng|ck|ss|ll|ff|zz|mb|gn|wn|sh|ch|tch|dge|ce|ge|se|ze|ve|le|re|ue|ye|oe)$")
VOWEL_TH_END = re.compile(r"[aeiou]th$")

CATS = {
    "th":  lambda w: "th" in w,
    "tri": lambda w: re.search(r"(str|spr|scr|spl|squ|thr)", w) is not None,
    "lb":  lambda w: re.search(r"(bl|cl|fl|gl|pl|sl)", w) is not None
                     and re.search(r"(b|p|c|g|f|d|t|s)les?$", w) is None,
    "rb":  lambda w: re.search(r"(br|cr|dr|fr|gr|pr|tr)", w) is not None,
    "sb":  lambda w: re.match(r"s(t|p|c|k|m|n|w)", w) is not None,
    "fc":  lambda w: re.search(r"[bcdfgklmnprstvz]{2}$", w) is not None
                     and FC_EXCLUDE_END.search(w) is None
                     and VOWEL_TH_END.search(w) is None,
}

def syllables(w):
    groups = re.findall(r"[aeiouy]+", w)
    n = len(groups)
    if w.endswith("e") and not w.endswith(("le", "ee", "ie", "oe", "ye")) and n > 1:
        n -= 1
    return max(1, n)

# place-of-articulation groups for the switcher heuristic
PLACE = {}
for ch in "pbmwfv": PLACE[ch] = "labial"
for ch in "tdsznlr": PLACE[ch] = "alveolar"
for ch in "kgcqx": PLACE[ch] = "velar"

def place_switches(w):
    seq = [PLACE[c] for c in w if c in PLACE]
    switches = sum(1 for a, b in zip(seq, seq[1:]) if a != b)
    return switches

def is_place_switcher(w):
    # strong switchers only: 3+ syllables AND 3+ jumps between articulation places
    return syllables(w) >= 3 and place_switches(w) >= 3

HAS_TRI_CLUSTER = re.compile(r"[bcdfghjklmnpqrstvwxz]{3}")

def slp_valuable(w):
    return syllables(w) >= 3 or HAS_TRI_CLUSTER.search(w) or is_place_switcher(w)

# clinical classics an SLP would drill that fall outside the top-1500
PS_HAND_LIST = [
    "buttercup", "basketball", "cucumber", "helicopter", "calculator",
    "refrigerator", "thermometer", "caterpillar", "watermelon", "motorcycle",
    "supermarket", "gymnasium", "cinnamon", "aluminum", "spaghetti",
    "umbrella", "banana", "potato", "tomato", "pajamas", "magnificent",
    "comfortable", "particular", "temperature", "vegetable", "probably",
]

def syl_sorted(words):
    return sorted(words, key=lambda w: min(syllables(w), 4))  # stable: keeps freq order within band

words = [w for w in top_n_list("en", TOP_N * 2)
         if w.isalpha() and len(w) >= 3 and w not in STOP][:TOP_N]

tiers_out = {c: [[] for _ in TIERS] for c in CATS}
core = {c: [] for c in CATS}
slp = {c: [] for c in CATS}
for rank, w in enumerate(words):
    tier = next(i for i, (lo, hi) in enumerate(TIERS) if lo <= rank < hi)
    for cat, test in CATS.items():
        if test(w):
            tiers_out[cat][tier].append(w)
            if tier == 0:
                core[cat].append(w)
            elif slp_valuable(w):
                slp[cat].append(w)

ps = [w for w in words if is_place_switcher(w)]
ps += [w for w in PS_HAND_LIST if w not in ps]

core = {c: syl_sorted(v) for c, v in core.items()}
slp = {c: syl_sorted(v) for c, v in slp.items()}
ps = syl_sorted(ps)

print("core (rank 1-1000):", {c: len(v) for c, v in core.items()})
print("slp adds (1001-1500, clinically filtered):", {c: len(v) for c, v in slp.items()})
print("place-switchers (hidden):", len(ps), "e.g.", ", ".join(ps[:8]), "...")
print("ps hand-list additions:", len(PS_HAND_LIST))

with open("src/words.gen.js", "w") as f:
    f.write("// GENERATED by scripts/build_words.py — do not edit by hand.\n")
    f.write("// Lists are frequency-ordered, stable-sorted by syllable count (short first).\n")
    f.write("export const WORD_TIERS = " + json.dumps(tiers_out, separators=(",", ":")) + ";\n")
    f.write("export const WORD_CORE = " + json.dumps(core, separators=(",", ":")) + ";\n")
    f.write("export const WORD_SLP = " + json.dumps(slp, separators=(",", ":")) + ";\n")
    f.write("export const WORDS_PS = " + json.dumps(ps, separators=(",", ":")) + ";\n")
print("wrote src/words.gen.js")
