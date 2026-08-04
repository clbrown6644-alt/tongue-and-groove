#!/usr/bin/env node
// Regenerate the Word Library reference doc (vault .md + .docx) from the live
// app data. Run after any change to words.gen.js or data.js:
//   node scripts/build_library.mjs
import { execSync } from "child_process";
import { writeFileSync } from "fs";

const { WORD_CORE, WORD_SLP, WORDS_PS } = await import("../src/words.gen.js");
const { PAIRS, SENTENCES, CATS, SCENARIOS, SCENARIO_SENTENCES, FUNCTIONAL, PRESETS, CONDITIONS, VARIANTS } = await import("../src/data.js");

const VAULT = "/Users/chrisbrown/Projects/obsidian-vault/CB_Brain/Business Projects/Tongue and Groove/02-Technical-Docs";
const stamp = new Date().toISOString().slice(0, 10);

const catName = Object.fromEntries(CATS.map((c) => [c.id, c.name]));
const nCore = Object.values(WORD_CORE).reduce((a, v) => a + v.length, 0);
const nSlp = Object.values(WORD_SLP).reduce((a, v) => a + v.length, 0);
const nScen = Object.values(SCENARIO_SENTENCES).reduce((a, v) => a + v.length, 0);
const nSent = Object.values(SENTENCES).reduce((a, v) => a + v.length, 0);

let md = `---
project: Tongue and Groove
type: reference
status: regenerated ${stamp} — junk-word purge + staged-session sentence banks
---

# Tongue and Groove — Word Library

Every word and sentence in the app. The word library is built two ways at once: a CORE of the most common conversational English words (rank 1–1,000, filtered to motor-difficult patterns), plus SLP-INFORMED ADDITIONS from ranks 1,001–3,000 kept only when clinically valuable (3+ syllables, a heavy consonant cluster, or a place-switcher). Web-corpus junk — URLs, acronyms, proper nouns, brand names — is filtered out: every entry is a real spoken word that exercises the tongue. Practice decks deal 2 core words for every 1 addition, ordered short-words-first so length ramps up.

Since the ${stamp.slice(0, 7)} practice restructure, a session runs warm-up words → 3×10 word→sentence couples → carryover. The couples draw on the sentence banks below; only target words (2+ syllables, a cluster, or a TH — never "the/was/and") count toward practice totals.

**Totals: ${nCore} core + ${nSlp} SLP-addition + ${WORDS_PS.length} place-switcher words · ${nSent} drill sentences · ${nScen} scenario sentences · ${FUNCTIONAL.length} carryover sentences**

`;

for (const c of CATS) {
  md += `## ${c.name} (${WORD_CORE[c.id].length} core + ${(WORD_SLP[c.id] || []).length} SLP additions)\n\n`;
  md += `### Core — most common 1,000 (${WORD_CORE[c.id].length})\n\n${WORD_CORE[c.id].join(", ")}\n\n`;
  md += `### SLP additions — ranks 1,001–3,000, clinically filtered (${(WORD_SLP[c.id] || []).length})\n\n${(WORD_SLP[c.id] || []).join(", ")}\n\n`;
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

md += `## Drill sentences (every sentence carries 4+ target-pattern words)\n\n`;
for (const [id, ss] of Object.entries(SENTENCES)) {
  md += `### ${catName[id]} (${ss.length})\n\n${ss.map((s) => `- ${s}`).join("\n")}\n\n`;
}

md += `## Scenario packs — words and sentence banks\n\nDoctor and Restaurant run 60 sentences deep (event-prep priorities); the rest are session-ready at 30. Every sentence is first-person, 6–10 words, adult phrasing, and contains at least one mechanically demanding word.\n\n`;
for (const sc of SCENARIOS) {
  md += `### ${sc.name} (${sc.words.length} words · ${(SCENARIO_SENTENCES[sc.id] || []).length} sentences)\n\n`;
  md += `**Words:** ${sc.words.join(", ")}\n\n`;
  md += `**Sentences:**\n${(SCENARIO_SENTENCES[sc.id] || []).map((s) => `- ${s}`).join("\n")}\n\n`;
}

md += `## Carryover sentences (Practice mode)\n\n${FUNCTIONAL.map((s) => `- ${s}`).join("\n")}\n`;

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
console.log(`wrote Word Library .md + .docx (${stamp}) — ${nCore + nSlp} words, ${nSent + nScen + FUNCTIONAL.length} sentences`);
