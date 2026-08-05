#!/usr/bin/env node
// Regenerate the Word Library reference doc (vault .md + .docx) from the live
// app data. Run after any change to words.gen.js or data.js:
//   node scripts/build_library.mjs
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const { WORDS_BY_CAT, WORD_META, WORDS_PS } = await import("../src/words.gen.js");
const { SENT_META } = await import("../src/sentences.gen.js");
const { PAIRS, SENTENCES, CATS, SCENARIOS, SCENARIO_SENTENCES, FUNCTIONAL, PRESETS, CONDITIONS, VARIANTS } = await import("../src/data.js");

const VAULT = "/Users/chrisbrown/Projects/obsidian-vault/CB_Brain/Business Projects/Tongue and Groove/02-Technical-Docs";
const stamp = new Date().toISOString().slice(0, 10);

const catName = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
const nWords = Object.keys(WORD_META).length;
const nScen = Object.values(SCENARIO_SENTENCES).reduce((a, v) => a + v.length, 0);
const nSent = Object.values(SENTENCES).reduce((a, v) => a + v.length, 0);
const tierOf = (w) => WORD_META[w]?.t ?? 0;

let md = `---
project: Tongue and Groove
type: reference
status: regenerated ${stamp} — Correction Spec v2: two-gate pool, difficulty tiers, sentence ladder
---

# Tongue and Groove — Word Library

Every word and sentence in the app. Each word passed two gates: it contains a cluster from one of the six target sound categories, AND it clears the automaticity guard — words in the top-500 frequency band are dropped unless they carry 3+ syllables, 2+ clusters, or a 3-consonant cluster (over-rehearsed words like *best, most, world* teach nothing). Survivors are scored 1–5 on syllables, clusters, cluster position, and frequency; tier 1 (trivially easy) is deleted. Tiers 2–3 come from the top 1,500 conversational words; tier 4–5 depth also draws on ranks 1,500–3,000. Web-corpus junk and function words are filtered out. Full audit: vocab-audit.md in the repo.

A session runs a 30-word warm-up (tier spread 6/9/9/6, categories weighted by the user's ratings) → 3×10 word→sentence couples that escalate 1 → 2 → 3+ instances of the target sound → an optional 6-sentence Bonus Round drawn one-per-scenario.

**Totals: ${nWords} pool words (tiers 2–5) + ${WORDS_PS.length} place-switchers · ${nSent} drill sentences · ${nScen} scenario sentences**

`;

for (const c of CATS) {
  const list = WORDS_BY_CAT[c.id];
  md += `## ${c.name} (${list.length})\n\n`;
  for (const t of [2, 3, 4, 5]) {
    const tw = list.filter((w) => tierOf(w) === t);
    if (tw.length) md += `### Tier ${t} (${tw.length})\n\n${tw.join(", ")}\n\n`;
  }
}

md += `## Place-switchers — hidden category (${WORDS_PS.length} words)\n\n### Practiced in rotation, never shown in scoring. Words forcing lips ↔ tongue-tip ↔ back-of-tongue jumps.\n\n${WORDS_PS.join(", ")}\n\n`;

md += `## Condition presets (1–5 practice weight)\n\n| Condition | TH | 3-clusters | L-blends | R-blends | S-blends | Final | Place-switch |\n|---|---|---|---|---|---|---|---|\n`;
for (const c of CONDITIONS) {
  const p = PRESETS[c.id];
  md += `| ${c.name} | ${p.th} | ${p.tri} | ${p.lb} | ${p.rb} | ${p.sb} | ${p.fc} | ${p.ps} |\n`;
}
md += `\n## Session variants — "What's hardest right now?"\n\nOnly the warm-up shape changes; the 3×10 sentence couples and carryover are constant.\n\n| User selects | Maps to | Warm-up |\n|---|---|---|\n`;
for (const v of VARIANTS) md += `| ${v.label} | ${v.id} | ${v.warmup.map((n) => "1×" + n).join(" + ").replace(/1×(\d+) \+ 1×\1 \+ 1×\1/, "3×$1").replace(/1×(\d+) \+ 1×\1/, "2×$1")} |\n`;

md += `\n## Sound pairs (minimal pairs)\n\n`;
const pairName = { ...catName, x: "SH·CH·J contrasts" };
for (const [id, ps] of Object.entries(PAIRS)) {
  md += `### ${pairName[id]} (${ps.length})\n\n${ps.map(([a, b]) => `${a}/${b}`).join(", ")}\n\n`;
}

const ladder = (s) => { const m = SENT_META[s]; return m && m.cat && m.n ? ` (${m.cat} ×${m.n})` : ""; };
md += `## Drill sentences — heavily loaded, tagged with target sound × instance count\n\n`;
for (const [id, ss] of Object.entries(SENTENCES)) {
  md += `### ${catName[id]} (${ss.length})\n\n${ss.map((s) => `- ${s}${ladder(s)}`).join("\n")}\n\n`;
}

md += `## Scenario packs — words and sentence banks\n\nDoctor and Restaurant are fully ladder-populated (10+ sentences at every rung 1 / 2 / 3+); the rest show "In progress" in the app until their 2- and 3-instance rungs fill out. Each sentence is tagged with its target sound and instance count — that tag drives which couples set it can serve.\n\n`;
for (const sc of SCENARIOS) {
  md += `### ${sc.name} (${sc.words.length} words · ${(SCENARIO_SENTENCES[sc.id] || []).length} sentences)\n\n`;
  md += `**Words:** ${sc.words.join(", ")}\n\n`;
  md += `**Sentences:**\n${(SCENARIO_SENTENCES[sc.id] || []).map((s) => `- ${s}${ladder(s)}`).join("\n")}\n\n`;
}

md += `## Functional sentences (reference — no longer a session stage)\n\n${FUNCTIONAL.map((s) => `- ${s}`).join("\n")}\n`;

writeFileSync(`${VAULT}/Tongue and Groove Word Library.md`, md);

// --- .docx via minimal md→html + textutil -------------------------------
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
const lines = md.split("\n");
let html = `<html><head><meta charset="utf-8"><title>Tongue and Groove — Word Library</title></head><body style="font-family: Helvetica, Arial, sans-serif;">`;
let i = 0, inTable = false, inList = false;
if (lines[0] === "---") { i = lines.indexOf("---", 1) + 1; } // skip frontmatter
for (; i < lines.length; i++) {
  const L = lines[i];
  if (inList && !L.startsWith("- ")) { html += "</ul>"; inList = false; }
  if (inTable && !L.startsWith("|")) { html += "</table>"; inTable = false; }
  if (!L.trim()) continue;
  if (L.startsWith("### ")) html += `<h3>${inline(L.slice(4))}</h3>`;
  else if (L.startsWith("## ")) html += `<h2>${inline(L.slice(3))}</h2>`;
  else if (L.startsWith("# ")) html += `<h1>${inline(L.slice(2))}</h1>`;
  else if (L.startsWith("|")) {
    const cells = L.split("|").slice(1, -1).map((c) => c.trim());
    if (cells.every((c) => /^-+$/.test(c))) continue;
    if (!inTable) { html += `<table border="1" cellpadding="4" cellspacing="0">`; inTable = true; }
    html += "<tr>" + cells.map((c) => `<td>${inline(c)}</td>`).join("") + "</tr>";
  } else if (L.startsWith("- ")) {
    if (!inList) { html += "<ul>"; inList = true; }
    html += `<li>${inline(L.slice(2))}</li>`;
  } else html += `<p>${inline(L)}</p>`;
}
if (inList) html += "</ul>";
if (inTable) html += "</table>";
html += "</body></html>";

const tmpHtml = "/tmp/tg-word-library.html";
writeFileSync(tmpHtml, html);
execSync(`textutil -convert docx -output "${VAULT}/Tongue and Groove Word Library.docx" "${tmpHtml}"`);
// CB's copy in the project folder — same file, easier to find than the vault
execSync(`cp "${VAULT}/Tongue and Groove Word Library.docx" "/Users/chrisbrown/Projects/Tongue-Groove/Tongue and Groove Word Library.docx"`);
console.log(`wrote Word Library .md + .docx (${stamp}) — ${nWords} words, ${nSent + nScen + FUNCTIONAL.length} sentences`);
