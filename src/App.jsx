import { useState, useEffect, useRef } from "react";
import { WORDS, PAIRS, SENTENCES, CATS, MILESTONES, GOALS, SCENARIOS } from "./data.js";
import { loadState, saveState, dkey } from "./storage.js";

const saved = loadState();

const isIOS = typeof navigator !== "undefined" && /iP(hone|ad|od)/.test(navigator.userAgent);
const isStandalone =
  typeof window !== "undefined" &&
  (window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true);
const isAndroid = typeof navigator !== "undefined" && /Android/.test(navigator.userAgent);

// adaptive word selection tuning
const GRAD_X = 5;        // clean exposures before a word graduates to the review pool
const HARD_BOOST = 3;    // hard-marked words appear 3× as often as normal words
const REVIEW_P = 0.1;    // share of picks that revisit graduated words so they aren't forgotten
const ACTIVE_START = 40; // words per category in the starting deck (most common first)
const ACTIVE_MIN = 25;   // when fewer un-graduated words remain, unlock more
const ACTIVE_STEP = 15;  // how many next-most-common words unlock per refill

function pickCat(ratings, keys) {
  const pool = [];
  keys.forEach((k) => {
    const w = ratings[k] || 3;
    for (let i = 0; i < w; i++) pool.push(k);
  });
  return pool[Math.floor(Math.random() * pool.length)];
}

function Badge({ size, color, ring, star }) {
  return (
    <svg width={size} height={size} viewBox="0 0 72 72" aria-hidden="true">
      <path d="M28 44l-7 20 10-6 5 10 6-22" fill={ring} opacity="0.85" />
      <path d="M44 44l7 20-10-6-5 10-6-22" fill={ring} opacity="0.6" />
      <circle cx="36" cy="28" r="23" fill={color} />
      <circle cx="36" cy="28" r="17" fill="none" stroke={star} strokeWidth="2" opacity="0.6" />
      <path d="M36 17l3.6 7.4 8.2 1.1-6 5.8 1.5 8.1-7.3-3.9-7.3 3.9 1.5-8.1-6-5.8 8.2-1.1z" fill={star} />
    </svg>
  );
}

function Ring({ r, sw, frac, color, overColor }) {
  const C = 2 * Math.PI * r;
  const over = frac > 1 ? (frac - 1) % 1 : 0; // second lap past the goal
  return (
    <>
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeOpacity="0.18" strokeWidth={sw} />
      <circle cx="70" cy="70" r={r} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round"
        strokeDasharray={(C * Math.min(frac, 1)) + " " + C} transform="rotate(-90 70 70)" />
      {over > 0 && (
        <circle cx="70" cy="70" r={r} fill="none" stroke={overColor || "#E9B44C"} strokeWidth={sw} strokeLinecap="round"
          strokeDasharray={(C * over) + " " + C} transform="rotate(-90 70 70)" />
      )}
    </>
  );
}

export default function App() {
  const [screen, setScreen] = useState(saved?.ratings ? "progress" : "assess"); // progress is the landing page · assess | drill | summary | settings
  const [ratings, setRatings] = useState(saved?.ratings ?? { th: 3, tri: 3, lb: 3, rb: 3, sb: 3, fc: 3 });
  const [mode, setMode] = useState("words"); // words | pairs | sents | scen
  const [scenario, setScenario] = useState(saved?.scenario ?? null); // selected scenario pack id
  const [paced, setPaced] = useState(saved?.paced ?? false); // false = self-paced (tap Next)
  const [wpm, setWpm] = useState(saved?.wpm ?? 25);
  const [playing, setPlaying] = useState(false);
  const [item, setItem] = useState(null);
  const [setSize, setSetSize] = useState(saved?.setSize ?? 25); // 25–150 in blocks of 25
  const [setItems, setSetItems] = useState([]); // labels shown this set
  const [difficult, setDifficult] = useState({});
  const [totalWords, setTotalWords] = useState(saved?.totalWords ?? 0);
  const [hist, setHist] = useState(saved?.hist ?? {}); // { "YYYY-MM-DD": { w, p, s } }
  const [range, setRange] = useState("d"); // d | w | m
  const [award, setAward] = useState(null); // {set:true} | {milestone:n}
  const [dark, setDark] = useState(saved?.dark ?? false);
  const [fontScale, setFontScale] = useState(saved?.fontScale ?? 1); // 1 | 1.15 | 1.3
  const [feedbackOn, setFeedbackOn] = useState(saved?.feedbackOn ?? true);
  const [iosHintDismissed, setIosHintDismissed] = useState(saved?.iosHintDismissed ?? false);
  const [wordStats, setWordStats] = useState(saved?.wordStats ?? {}); // { word: { s: seen count, h: hard level } }
  const [activeN, setActiveN] = useState(saved?.activeN ?? {});       // words unlocked so far per category
  const statsRef = useRef(wordStats);
  const activeRef = useRef(activeN);
  useEffect(() => { statsRef.current = wordStats; }, [wordStats]);
  useEffect(() => { activeRef.current = activeN; }, [activeN]);
  const timerRef = useRef(null);
  const itemRef = useRef(null);
  const doneRef = useRef(0);
  const wakeRef = useRef(null);
  const marksAppliedRef = useRef(true); // false only while a fresh summary awaits its hard-word taps
  const chartScrollRef = useRef(null);
  const totalDone = totalWords;

  const todayKey = dkey(new Date());
  const todayEntry = hist[todayKey] || { w: 0, p: 0, s: 0 };
  const todayWords = todayEntry.w;
  const todayPairs = todayEntry.p;
  const todaySets = todayEntry.s;

  const T = dark
    ? { bg:"#141824", card:"#1E2534", ink:"#B9CDF5", mut:"#9BA4B4", line:"#2D3648", blue:"#7FA4E8", onBlue:"#101A30", btn:"#3563C7", onBtn:"#FFFFFF", rust:"#D07A55", amber:"#E9B44C", chip:"#28324A", tex:"none" }
    : { bg:"#F3ECDC", card:"#FFFDF6", ink:"#012169", mut:"#5C647A", line:"#E0D6BD", blue:"#012169", onBlue:"#FFFFFF", btn:"#012169", onBtn:"#FFFFFF", rust:"#B4532A", amber:"#E9B44C", chip:"#ECE3CC", tex:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)' opacity='0.05'/%3E%3C/svg%3E")` };
  const S = (px) => Math.round(px * fontScale) + "px";

  // persist everything that should survive a close (A8 / M-persist)
  useEffect(() => {
    saveState({ ratings, paced, wpm, setSize, dark, fontScale, feedbackOn, totalWords, hist, iosHintDismissed, wordStats, activeN, scenario });
  }, [ratings, paced, wpm, setSize, dark, fontScale, feedbackOn, totalWords, hist, iosHintDismissed, wordStats, activeN, scenario]);

  const bump = (inc, isPair) => {
    setTotalWords((t) => t + inc);
    setHist((h) => {
      const k = dkey(new Date());
      const d = h[k] || { w: 0, p: 0, s: 0 };
      return { ...h, [k]: { ...d, w: d.w + inc, p: d.p + (isPair ? 1 : 0) } };
    });
  };

  // Adaptive pick: weighted among the "active" deck (most common words first).
  // Hard-marked words appear HARD_BOOST× as often; words seen GRAD_X times with
  // no hard mark graduate to a review pool (REVIEW_P of picks); when the live
  // deck runs low, the next most common words unlock.
  const pickWord = (cat) => {
    const list = WORDS[cat];
    const stats = statsRef.current;
    let aN = Math.min(activeRef.current[cat] ?? ACTIVE_START, list.length);
    const grads = [], live = [];
    for (let i = 0; i < aN; i++) {
      const w = list[i], st = stats[w];
      if (st && st.s >= GRAD_X && !(st.h > 0)) grads.push(w); else live.push(w);
    }
    if (live.length < ACTIVE_MIN && aN < list.length) {
      const nA = Math.min(aN + ACTIVE_STEP, list.length);
      for (let i = aN; i < nA; i++) live.push(list[i]);
      activeRef.current = { ...activeRef.current, [cat]: nA };
      setActiveN(activeRef.current);
    }
    if (grads.length && (Math.random() < REVIEW_P || !live.length))
      return grads[Math.floor(Math.random() * grads.length)];
    let total = 0;
    const weights = live.map((w) => { const wt = stats[w]?.h > 0 ? HARD_BOOST : 1; total += wt; return wt; });
    let r = Math.random() * total;
    for (let i = 0; i < live.length; i++) { r -= weights[i]; if (r <= 0) return live[i]; }
    return live[live.length - 1];
  };

  const recordSeen = (w) => {
    setWordStats((s) => ({ ...s, [w]: { s: (s[w]?.s || 0) + 1, h: s[w]?.h || 0 } }));
  };

  const next = () => {
    if (doneRef.current >= setSize) return;
    let nx;
    if (mode === "words") {
      const c = pickCat(ratings, Object.keys(WORDS));
      nx = { cat: c, w: pickWord(c) };
      recordSeen(nx.w);
    } else if (mode === "pairs") {
      const c = pickCat({ ...ratings, x: 3 }, Object.keys(PAIRS));
      const list = PAIRS[c];
      nx = { cat: c, pair: list[Math.floor(Math.random() * list.length)] };
    } else if (mode === "scen") {
      const sc = SCENARIOS.find((s) => s.id === scenario);
      if (!sc) return;
      const stats = statsRef.current;
      let total = 0;
      const ws = sc.words.map((w) => { const wt = stats[w]?.h > 0 ? HARD_BOOST : 1; total += wt; return wt; });
      let r = Math.random() * total;
      let w = sc.words[sc.words.length - 1];
      for (let i = 0; i < sc.words.length; i++) { r -= ws[i]; if (r <= 0) { w = sc.words[i]; break; } }
      nx = { cat: scenario, w };
      recordSeen(w);
    } else {
      const cur = itemRef.current;
      if (cur && cur.words && cur.idx < cur.words.length - 1) {
        nx = { ...cur, idx: cur.idx + 1 };
      } else {
        const c = pickCat(ratings, Object.keys(SENTENCES));
        const list = SENTENCES[c];
        nx = { cat: c, words: list[Math.floor(Math.random() * list.length)].split(" "), idx: 0 };
      }
    }
    itemRef.current = nx;
    setItem(nx);
    const label = mode === "words" ? nx.w : mode === "pairs" ? nx.pair[0] + " / " + nx.pair[1] : nx.words[nx.idx];
    doneRef.current += 1;
    setSetItems((p) => [...p, label]);
    bump(mode === "pairs" ? 2 : 1, mode === "pairs"); // a pair counts for 2 words
  };

  useEffect(() => {
    if (playing && paced) {
      next();
      timerRef.current = setInterval(next, (60 / wpm) * 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [playing, wpm, mode, ratings, paced]);

  // M1 — keep the screen awake during a paced drill; release on pause/unmount
  useEffect(() => {
    if (playing && "wakeLock" in navigator) {
      navigator.wakeLock.request("screen").then((l) => { wakeRef.current = l; }).catch(() => {});
    }
    return () => {
      if (wakeRef.current) { wakeRef.current.release().catch(() => {}); wakeRef.current = null; }
    };
  }, [playing]);

  // M2 — auto-pause when the app is backgrounded; never silently resume
  useEffect(() => {
    const onHide = () => { if (document.hidden) setPlaying(false); };
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, []);

  // set completion → award + summary
  useEffect(() => {
    if (screen === "drill" && setItems.length >= setSize) {
      setPlaying(false);
      const prevTotal = totalDone - setItems.length;
      const ms = MILESTONES.find((m) => prevTotal < m && totalDone >= m);
      setAward(ms ? { milestone: ms } : { set: true });
      if (!ms) setTimeout(() => setAward(null), 3000); // little award fades away
      setHist((h) => {
        const k = dkey(new Date());
        const d = h[k] || { w: 0, p: 0, s: 0 };
        return { ...h, [k]: { ...d, s: d.s + 1 } };
      });
      setDifficult({});
      marksAppliedRef.current = false;
      setScreen("summary");
    }
  }, [setItems]);

  useEffect(() => { // keep charts scrolled to the latest bar
    if (chartScrollRef.current) chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth;
  }, [range, screen]);

  // Fold the summary-screen "hard" taps into word stats: marked words get the
  // hard boost and restart their clean streak; unmarked appearances cool a
  // previous hard flag down one level.
  const applyHardMarks = () => {
    if (marksAppliedRef.current || !setItems.length) return;
    marksAppliedRef.current = true;
    const marks = difficult;
    const labels = setItems;
    setWordStats((s) => {
      const ns = { ...s };
      labels.forEach((label, i) => {
        label.split(" / ").forEach((w) => {
          const cur = ns[w] || { s: 0, h: 0 };
          if (marks[i]) ns[w] = { s: 0, h: 2 };
          else if (cur.h > 0) ns[w] = { ...cur, h: cur.h - 1 };
        });
      });
      return ns;
    });
  };

  const startNewSet = () => {
    applyHardMarks();
    doneRef.current = 0;
    itemRef.current = null;
    setSetItems([]);
    setItem(null);
    setAward(null);
    setScreen("drill");
  };
  const switchMode = (m) => { setPlaying(false); setMode(m); setItem(null); itemRef.current = null; doneRef.current = 0; setSetItems([]); }; // each set is one mode — hard-word review never mixes words with pairs
  const togglePaced = () => { setPlaying(false); setPaced((p) => !p); };

  const css = `
    @import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible:wght@400;700&family=Bricolage+Grotesque:wght@600;700&display=swap');
    * { box-sizing: border-box; margin: 0; }
    .app { min-height: 100vh; min-height: 100dvh; background: ${T.bg}; background-image: ${T.tex}; color: ${T.ink}; font-family: 'Atkinson Hyperlegible', sans-serif; display: flex; flex-direction: column; padding-bottom: env(safe-area-inset-bottom); }
    .app button:focus-visible, .app input:focus-visible { outline: 3px solid ${T.blue}; outline-offset: 2px; }
    .top { padding: calc(18px + env(safe-area-inset-top)) 20px 10px; display: flex; align-items: center; justify-content: space-between; }
    .logo { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: 20px; letter-spacing: -0.01em; border: 2px solid ${T.ink}; border-radius: 14px; padding: 8px 14px; }
    .logo span { color: ${dark ? T.blue : T.blue}; }
    .logo em { font-style: normal; color: ${T.amber}; }
    .hdrBtns { display: flex; gap: 8px; }
    .hdrBtn { border: none; cursor: pointer; background: ${T.btn}; color: ${T.onBtn}; font-weight: 700; font-size: ${S(16)}; min-height: 44px; padding: 0 18px; border-radius: 12px; font-family: 'Atkinson Hyperlegible'; }
    .card { background: ${T.card}; border-radius: 20px; margin: 10px 8px; padding: 20px; box-shadow: 0 1px 3px rgba(20,25,40,0.10); }
    h2 { font-family: 'Bricolage Grotesque'; font-size: ${S(21)}; margin-bottom: 6px; color: ${T.blue}; }
    .sub { font-size: ${S(16)}; color: ${T.mut}; line-height: 1.45; margin-bottom: 14px; }
    .catRow { padding: 12px 0; border-bottom: 1px solid ${T.line}; }
    .catRow:last-child { border-bottom: none; }
    .catTop { display: flex; align-items: baseline; justify-content: space-between; gap: 6px 12px; flex-wrap: wrap; margin-bottom: 10px; }
    .catName { font-weight: 700; font-size: ${S(18)}; }
    .catEx { font-size: ${S(18)}; color: ${T.mut}; font-style: italic; }
    .dots { display: flex; gap: 8px; }
    .dot { width: 44px; height: 44px; border-radius: 12px; border: 1.5px solid ${T.line}; background: ${T.card}; font-weight: 700; font-size: ${S(17)}; color: ${T.mut}; cursor: pointer; font-family: 'Atkinson Hyperlegible'; }
    .dot.on { background: ${T.btn}; border-color: ${T.btn}; color: ${T.onBtn}; }
    .cta { display: block; width: calc(100% - 32px); margin: 14px 16px 24px; padding: 16px; border: none; border-radius: 16px; background: ${T.btn}; color: ${T.onBtn}; font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(16)}; cursor: pointer; }
    .tabs { display: flex; gap: 8px; margin: 4px 16px; }
    .tab { flex: 1; padding: 12px 6px; border-radius: 12px; border: 1.5px solid ${T.line}; background: ${T.card}; font-weight: 700; font-size: ${S(15)}; color: ${T.mut}; cursor: pointer; min-height: 44px; font-family: 'Atkinson Hyperlegible'; }
    .tab.on { background: ${T.btn}; border-color: ${T.btn}; color: ${T.onBtn}; }
    .stage { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 300px; padding: 10px 16px; }
    .word { font-weight: 700; font-size: calc(clamp(44px, 13vw, 76px) * ${fontScale}); letter-spacing: -0.01em; text-align: center; line-height: 1.05; color: ${T.blue}; }
    .pairWrap { display: flex; flex-direction: row; flex-wrap: wrap; gap: 6px 20px; align-items: baseline; justify-content: center; }
    .pair2 { font-weight: 700; font-size: calc(clamp(44px, 13vw, 76px) * ${fontScale}); letter-spacing: -0.01em; text-align: center; line-height: 1.05; color: ${T.blue}; }
    .sentWrap { display: flex; flex-wrap: wrap; justify-content: center; gap: 8px 12px; max-width: 560px; }
    .sw { font-weight: 400; font-size: calc(clamp(26px, 7vw, 42px) * ${fontScale}); line-height: 1.2; color: ${T.blue}; padding: 2px 8px; border-radius: 10px; }
    .sw.done { color: ${T.mut}; }
    .sw.now { background: ${T.btn}; color: ${T.onBtn}; font-weight: 700; }
    .idle { color: ${T.mut}; font-size: ${S(17)}; text-align: center; max-width: 340px; line-height: 1.5; }
    .controls { padding: 0 16px 26px; }
    .paceRow { display: flex; align-items: center; gap: 12px; background: ${T.card}; border-radius: 16px; padding: 10px 16px; margin-bottom: 12px; box-shadow: 0 1px 3px rgba(20,25,40,0.10); min-height: 60px; }
    .paceVal { font-weight: 700; font-size: 15px; min-width: 44px; text-align: right; }
    input[type=range] { flex: 1; accent-color: ${T.blue}; height: 28px; }
    .switch { display: flex; align-items: center; gap: 10px; border: none; background: none; cursor: pointer; padding: 8px 0; min-height: 44px; font-family: 'Atkinson Hyperlegible'; }
    .swLbl { font-size: ${S(14)}; font-weight: 700; color: ${T.ink}; white-space: nowrap; }
    .track { width: 46px; height: 26px; border-radius: 999px; background: ${dark ? "#3A4560" : "#CFC5AB"}; position: relative; flex-shrink: 0; }
    .track.on { background: ${T.blue}; }
    .knob { position: absolute; top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #fff; transition: left 0.15s; }
    .track.on .knob { left: 23px; }
    .btnRow { display: flex; gap: 10px; }
    .play { flex: 2; padding: 16px; border: none; border-radius: 16px; font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(17)}; cursor: pointer; background: ${T.btn}; color: ${T.onBtn}; }
    .play.stop { background: ${T.rust}; color: #fff; }
    .ghost { flex: 1; padding: 16px; border-radius: 16px; border: 1.5px solid ${T.line}; background: ${T.card}; font-weight: 700; font-size: ${S(14)}; color: ${T.ink}; cursor: pointer; font-family: 'Atkinson Hyperlegible'; }
    .meta { text-align: center; font-size: ${S(14)}; color: ${T.mut}; margin-top: 10px; }
    .setBar { height: 6px; border-radius: 999px; background: ${T.line}; margin: 0 16px 4px; overflow: hidden; }
    .setFill { height: 100%; background: ${T.btn}; border-radius: 999px; transition: width 0.3s; }
    .awardWrap { display: flex; flex-direction: column; align-items: center; gap: 6px; animation: pop 0.5s ease-out; }
    .awardFade { animation: pop 0.5s ease-out, fadeout 0.6s ease 2.2s forwards; }
    @keyframes pop { 0% { transform: scale(0.3); opacity: 0; } 55% { transform: scale(1.12); opacity: 1; } 100% { transform: scale(1); opacity: 1; } }
    @keyframes fadeout { to { opacity: 0; } }
    .awardLbl { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(17)}; color: ${T.ink}; }
    .wordGrid { display: flex; flex-wrap: wrap; gap: 8px; }
    .wchip { padding: 10px 14px; min-height: 44px; border-radius: 12px; border: 1.5px solid ${T.line}; background: ${T.card}; font-size: ${S(17)}; font-weight: 400; color: ${T.ink}; cursor: pointer; font-family: 'Atkinson Hyperlegible'; }
    .wchip.hard { background: ${T.btn}; border-color: ${T.btn}; color: ${T.onBtn}; font-weight: 700; }
    .bigNum { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(46)}; line-height: 1; }
    .bigLbl { font-size: ${S(14)}; color: ${T.mut}; margin-top: 4px; }
    .chartWrap { position: relative; height: 224px; margin-top: 14px; }
    .chartScroll { position: absolute; left: 42px; right: 0; top: 0; bottom: 0; overflow-x: auto; padding-bottom: 12px; scrollbar-width: thin; scrollbar-color: ${T.blue} ${T.line}; }
    .chartScroll::-webkit-scrollbar { height: 8px; }
    .chartScroll::-webkit-scrollbar-track { background: ${T.line}; border-radius: 999px; }
    .chartScroll::-webkit-scrollbar-thumb { background: ${T.blue}; border-radius: 999px; }
    .chartInner { position: relative; height: 100%; min-width: 100%; }
    .chartArea { display: flex; gap: 6px; height: 100%; width: 100%; }
    .col { flex: 1 0 42px; min-width: 42px; display: flex; flex-direction: column; align-items: center; height: 100%; }
    .barBox { flex: 1; width: 100%; display: flex; align-items: flex-end; justify-content: center; }
    .bar { width: 100%; max-width: 26px; border-radius: 7px; background: ${T.blue}; opacity: 0.45; }
    .bar.today { opacity: 1; }
    .dayLbl { height: 22px; font-size: 12px; color: ${T.mut}; display: flex; align-items: center; }
    .gLine { position: absolute; left: 0; right: 0; border-top: 1px solid ${T.line}; }
    .gLbl { position: absolute; left: 0; width: 36px; text-align: right; font-size: 12px; color: ${T.mut}; transform: translateY(50%); }
    .ringsRow { display: flex; align-items: center; gap: 18px; }
    .ringsSvg { width: 44%; max-width: 170px; flex-shrink: 0; }
    .bigLeg { display: flex; flex-direction: column; gap: 12px; }
    .bigLegName { font-size: ${S(18)}; font-weight: 700; }
    .bigLegVal { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(34)}; line-height: 1; margin-top: 2px; }
    .streakNum { font-family: 'Bricolage Grotesque'; font-weight: 700; line-height: 0.9; }
    .streakLbl { font-size: ${S(20)}; font-weight: 700; color: ${T.mut}; }
    .legend { display: flex; flex-direction: column; gap: 12px; }
    .legLbl { font-size: ${S(15)}; font-weight: 700; }
    .legVal { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(30)}; line-height: 1.05; }
    .rangeBar { display: flex; gap: 4px; background: ${dark ? "#2A3346" : "#E7DDC6"}; border-radius: 14px; padding: 4px; }
    .rangeBtn { flex: 1; min-height: 44px; border: none; border-radius: 11px; background: transparent; color: ${T.mut}; font-weight: 700; font-size: ${S(15)}; cursor: pointer; font-family: 'Atkinson Hyperlegible'; }
    .rangeBtn.on { background: ${T.card}; color: ${T.ink}; box-shadow: 0 1px 3px rgba(20,25,40,0.15); }
    .tiles { display: flex; gap: 10px; margin: 10px 8px; }
    .tile { flex: 1; background: ${T.card}; border-radius: 20px; padding: 16px 18px; box-shadow: 0 1px 3px rgba(20,25,40,0.10); }
    .tileLbl { font-family: 'Bricolage Grotesque'; font-size: ${S(22)}; font-weight: 700; margin-bottom: 8px; }
    .tileVal { font-family: 'Bricolage Grotesque'; font-weight: 700; font-size: ${S(30)}; line-height: 1; }
    .sizeRow { display: flex; justify-content: center; align-items: center; gap: 8px; padding: 4px 16px 22px; }
    .sizeLbl { font-size: ${S(14)}; color: ${T.mut}; font-weight: 700; margin-right: 4px; }
    .setting { display: flex; align-items: center; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid ${T.line}; min-height: 56px; gap: 12px; }
    .setting:last-child { border-bottom: none; }
    .setLbl { font-weight: 700; font-size: ${S(16)}; }
    .seg { display: flex; gap: 6px; }
    .segBtn { min-width: 44px; min-height: 44px; border-radius: 12px; border: 1.5px solid ${T.line}; background: ${T.card}; color: ${T.mut}; font-weight: 700; cursor: pointer; font-family: 'Atkinson Hyperlegible'; }
    .segBtn.on { background: ${T.btn}; border-color: ${T.btn}; color: ${T.onBtn}; }
    .stepVal { font-weight: 700; font-size: ${S(16)}; min-width: 40px; text-align: center; }
    .hintRow { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .hintTxt { font-size: ${S(15)}; line-height: 1.5; }
    .instSteps { display: flex; flex-direction: column; gap: 14px; margin-top: 6px; }
    .instStep { display: flex; align-items: center; gap: 14px; }
    .instIcon { flex: 0 0 auto; }
    @media (max-width: 640px) {
      .tiles { flex-direction: column; }
      .ringsRow { gap: 22px; justify-content: center; }
      .ringsSvg { width: 62%; max-width: 320px; }
      .bigLegVal { font-size: ${S(40)}; }
      .tile { padding: 20px; }
    }
    @media (prefers-reduced-motion: reduce) { .knob, .setFill { transition: none; } .awardWrap, .awardFade { animation: none; } }
  `;

  const Header = ({ right }) => (
    <div className="top">
      <div className="logo">Tongue <em>&amp;</em> <span>Groove</span></div>
      <div className="hdrBtns">{right}</div>
    </div>
  );

  const SizeRow = () => (
    <div className="sizeRow">
      <span className="sizeLbl">Text size</span>
      {[[1, 13], [1.15, 18], [1.3, 25]].map(([v, px]) => (
        <button key={v} className={"segBtn" + (fontScale === v ? " on" : "")} style={{ fontSize: px }}
          onClick={() => setFontScale(v)} aria-label={"Text size " + px}>A</button>
      ))}
    </div>
  );

  if (screen === "assess") {
    return (
      <div className="app">
        <style>{css}</style>
        <Header right={<span className="hdrBtn" style={{ color: T.mut, cursor: "default", background: "none" }}>SETUP</span>} />
        <div className="card">
          <h2>Rate each sound type</h2>
          <p className="sub"><b>5 = hardest for you.</b> Higher ratings get more practice time.</p>
          {CATS.map((c) => (
            <div className="catRow" key={c.id}>
              <div className="catTop"><span className="catName">{c.name}</span><span className="catEx">like {c.ex}</span></div>
              <div className="dots">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button key={n} className={"dot" + (ratings[c.id] === n ? " on" : "")}
                    onClick={() => setRatings({ ...ratings, [c.id]: n })}>{n}</button>
                ))}
              </div>
            </div>
          ))}
        </div>
        <button className="cta" onClick={() => setScreen("drill")}>Start practicing</button>
        <SizeRow />
      </div>
    );
  }

  if (screen === "summary") {
    const hardCount = Object.values(difficult).filter(Boolean).length;
    return (
      <div className="app">
        <style>{css}</style>
        <Header right={<button className="hdrBtn" onClick={() => { applyHardMarks(); setScreen("progress"); }}>Progress</button>} />
        <div className="card" style={{ textAlign: "center", paddingTop: 26 }}>
          {award && (
            <div className={"awardWrap" + (award.set ? " awardFade" : "")}>
              <Badge size={award.milestone ? 104 : 72} color={award.milestone ? T.amber : T.blue}
                ring={award.milestone ? T.blue : T.amber} star={award.milestone ? T.ink : "#fff"} />
              <div className="awardLbl">{award.milestone ? award.milestone.toLocaleString() + " words!" : "Set complete"}</div>
            </div>
          )}
          <div className="bigNum" style={{ marginTop: award ? 12 : 0 }}>{setItems.length}</div>
          <div className="bigLbl">words this set · {totalDone.toLocaleString()} total</div>
        </div>
        {feedbackOn && (
          <div className="card">
            <h2>Any hard ones?</h2>
            <p className="sub">Tap the words that felt hard to say.{hardCount > 0 ? ` ${hardCount} marked.` : ""}</p>
            <div className="wordGrid">
              {setItems.map((w, i) => (
                <button key={i} className={"wchip" + (difficult[i] ? " hard" : "")}
                  onClick={() => setDifficult((d) => ({ ...d, [i]: !d[i] }))}>{w}</button>
              ))}
            </div>
          </div>
        )}
        <button className="cta" onClick={startNewSet}>Next set</button>
        <SizeRow />
      </div>
    );
  }

  if (screen === "settings") {
    return (
      <div className="app">
        <style>{css}</style>
        <Header right={<><button className="hdrBtn" onClick={() => { if (setItems.length >= setSize) startNewSet(); else setScreen("drill"); }}>Practice</button><button className="hdrBtn" onClick={() => setScreen("progress")}>Progress</button></>} />
        <div className="card">
          <h2>Settings</h2>
          <div className="setting">
            <span className="setLbl">Words per set</span>
            <div className="seg">
              <button className="segBtn" onClick={() => setSetSize((s) => Math.max(25, s - 25))} aria-label="Fewer words per set">−</button>
              <span className="stepVal" style={{ alignSelf: "center" }}>{setSize}</span>
              <button className="segBtn" onClick={() => setSetSize((s) => Math.min(150, s + 25))} aria-label="More words per set">+</button>
            </div>
          </div>
          <div className="setting">
            <span className="setLbl">Dark mode</span>
            <button className="switch" onClick={() => setDark((d) => !d)} aria-pressed={dark}>
              <span className={"track" + (dark ? " on" : "")}><span className="knob" /></span>
            </button>
          </div>
          <div className="setting">
            <span className="setLbl">Ask about hard words</span>
            <button className="switch" onClick={() => setFeedbackOn((f) => !f)} aria-pressed={feedbackOn}>
              <span className={"track" + (feedbackOn ? " on" : "")}><span className="knob" /></span>
            </button>
          </div>
          <div className="setting">
            <span className="setLbl">Sound ratings</span>
            <button className="hdrBtn" onClick={() => { setPlaying(false); setScreen("assess"); }}>Edit</button>
          </div>
        </div>
        <SizeRow />
      </div>
    );
  }

  if (screen === "progress") {
    const now = new Date();
    const dow = now.getDay(); // 0 = Sunday
    const dayVals = [0, 1, 2, 3, 4, 5, 6].map((i) => {
      if (i > dow) return null;
      const d = new Date(now); d.setDate(now.getDate() - (dow - i));
      return hist[dkey(d)]?.w ?? 0;
    });
    const weekVals = [], weekLbls = [];
    for (let k = 11; k >= 0; k--) {
      const start = new Date(now); start.setDate(now.getDate() - dow - 7 * k);
      let sum = 0;
      for (let j = 0; j < 7; j++) { const d = new Date(start); d.setDate(start.getDate() + j); sum += hist[dkey(d)]?.w ?? 0; }
      weekVals.push(sum);
      weekLbls.push((start.getMonth() + 1) + "/" + start.getDate());
    }
    const MN = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const monVals = [], monLbls = [];
    for (let k = 11; k >= 0; k--) {
      const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
      const prefix = d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0");
      let sum = 0;
      for (const [key, v] of Object.entries(hist)) if (key.startsWith(prefix)) sum += v.w || 0;
      monVals.push(sum);
      monLbls.push(MN[d.getMonth()]);
    }
    const charts = {
      d: { title: "This week", vals: dayVals, labels: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], hot: dow },
      w: { title: "Weekly totals", vals: weekVals, labels: weekLbls, hot: weekVals.length - 1 },
      m: { title: "Monthly totals", vals: monVals, labels: monLbls, hot: monVals.length - 1 },
    };
    const ch = charts[range];
    const niceMax = Math.ceil(Math.max(...ch.vals.filter((v) => v != null), 4) / 4) * 4;
    const fmt = (v) => (v >= 1000 ? Math.round(v / 100) / 10 + "k" : "" + v);
    let streak = 0;
    { const d = new Date(now);
      if (!((hist[todayKey]?.w ?? 0) > 0)) d.setDate(d.getDate() - 1); // today not practiced yet doesn't break the streak
      while ((hist[dkey(d)]?.w ?? 0) > 0) { streak++; d.setDate(d.getDate() - 1); } }
    const showInstall = (isIOS || isAndroid) && !isStandalone && !iosHintDismissed;
    const iosBlue = "#0A7AFF";
    const ShareIcon = () => (
      <svg className="instIcon" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="10" fill={T.card} stroke={T.line} strokeWidth="1.5" />
        <rect x="13" y="18" width="18" height="16" rx="3" fill="none" stroke={iosBlue} strokeWidth="2.5" />
        <path d="M22 25V8" stroke={iosBlue} strokeWidth="2.5" strokeLinecap="round" />
        <path d="M16.5 13L22 7.5 27.5 13" fill="none" stroke={iosBlue} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
    const AddIcon = () => (
      <svg className="instIcon" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="10" fill={T.card} stroke={T.line} strokeWidth="1.5" />
        <rect x="11" y="11" width="22" height="22" rx="6" fill="none" stroke={T.ink} strokeWidth="2.5" />
        <path d="M22 16.5v11M16.5 22h11" stroke={T.ink} strokeWidth="2.5" strokeLinecap="round" />
      </svg>
    );
    const AppIcon = () => (
      <svg className="instIcon" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="10" fill="#012169" />
        <text x="22" y="28" textAnchor="middle" fontFamily="Helvetica, Arial, sans-serif" fontWeight="bold" fontSize="15">
          <tspan fill="#FFFDF6">T</tspan><tspan fill="#E9B44C">&amp;</tspan><tspan fill="#FFFDF6">G</tspan>
        </text>
      </svg>
    );
    const MenuIcon = () => (
      <svg className="instIcon" width="44" height="44" viewBox="0 0 44 44" aria-hidden="true">
        <rect x="2" y="2" width="40" height="40" rx="10" fill={T.card} stroke={T.line} strokeWidth="1.5" />
        <circle cx="22" cy="12.5" r="2.6" fill={T.ink} /><circle cx="22" cy="22" r="2.6" fill={T.ink} /><circle cx="22" cy="31.5" r="2.6" fill={T.ink} />
      </svg>
    );
    return (
      <div className="app">
        <style>{css}</style>
        <Header right={<><button className="hdrBtn" onClick={() => { if (setItems.length >= setSize) startNewSet(); else setScreen("drill"); }}>Practice</button><button className="hdrBtn" onClick={() => setScreen("settings")}>Settings</button></>} />
        {showInstall && (
          <div className="card">
            <h2>Get the app on your phone</h2>
            <p className="sub" style={{ marginBottom: 10 }}>Three taps — then it opens full screen and works with no internet.</p>
            <div className="instSteps">
              {isIOS ? (
                <>
                  <div className="instStep"><ShareIcon /><div className="hintTxt"><b>1.</b> In <b>Safari</b>, tap the <b>Share</b> button — the square with the up arrow, bottom of the screen</div></div>
                  <div className="instStep"><AddIcon /><div className="hintTxt"><b>2.</b> Scroll down the list and tap <b>Add to Home Screen</b></div></div>
                  <div className="instStep"><AppIcon /><div className="hintTxt"><b>3.</b> Tap <b>Add</b>, then open <b>Tongue &amp; Groove</b> from your home screen — not from Safari</div></div>
                </>
              ) : (
                <>
                  <div className="instStep"><MenuIcon /><div className="hintTxt"><b>1.</b> In <b>Chrome</b>, tap the <b>⋮ menu</b> in the top corner</div></div>
                  <div className="instStep"><AddIcon /><div className="hintTxt"><b>2.</b> Tap <b>Add to Home screen</b> (or <b>Install app</b>)</div></div>
                  <div className="instStep"><AppIcon /><div className="hintTxt"><b>3.</b> Open <b>Tongue &amp; Groove</b> from your home screen</div></div>
                </>
              )}
            </div>
            <button className="cta" style={{ width: "100%", margin: "16px 0 0" }} onClick={() => setIosHintDismissed(true)}>Got it — hide these steps</button>
          </div>
        )}
        <div className="tiles">
          <div className="tile" style={{ flex: 1.9 }}>
            <div className="tileLbl">Today</div>
            <div className="ringsRow">
              <svg viewBox="0 0 140 140" aria-hidden="true" className="ringsSvg">
                <Ring r={58} sw={13} frac={todayWords / GOALS.words} color={T.blue} />
                <Ring r={43} sw={13} frac={todayPairs / GOALS.pairs} color={T.amber} />
                <Ring r={28} sw={13} frac={todaySets / GOALS.sets} color={T.rust} />
              </svg>
              <div className="bigLeg">
                <div><div className="bigLegName">Words</div><div className="bigLegVal" style={{ color: T.blue }}>{todayWords.toLocaleString()}</div></div>
                <div><div className="bigLegName">Sound pairs</div><div className="bigLegVal" style={{ color: dark ? T.amber : "#8A6414" }}>{todayPairs.toLocaleString()}</div></div>
                <div><div className="bigLegName">Sets</div><div className="bigLegVal" style={{ color: T.rust }}>{todaySets.toLocaleString()}</div></div>
              </div>
            </div>
            {todayWords > GOALS.words ? (
              <p className="sub" style={{ margin: "10px 0 0", fontSize: "14px", fontWeight: 700, color: dark ? T.amber : "#8A6414" }}>Daily goal beaten — the gold lap shows words past {GOALS.words.toLocaleString()}.</p>
            ) : (
              <p className="sub" style={{ margin: "10px 0 0", fontSize: "13px" }}>Sound pairs count as 2 words.</p>
            )}
          </div>
          <div className="tile" style={{ display: "flex", flexDirection: "column" }}>
            <div className="tileLbl">Streak</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <div className="streakNum" style={{ color: T.blue, fontSize: "calc(54px * " + fontScale + ")" }}>{streak}</div>
              <div className="streakLbl">days in a row</div>
            </div>
          </div>
          <div className="tile" style={{ display: "flex", flexDirection: "column" }}>
            <div className="tileLbl">All-time</div>
            <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", gap: 8 }}>
              <div className="streakNum" style={{ color: T.blue, fontSize: "calc(40px * " + fontScale + ")" }}>{totalWords.toLocaleString()}</div>
              <div className="streakLbl">words</div>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="rangeBar">
            {[["d", "Day"], ["w", "Week"], ["m", "Month"]].map(([k, l]) => (
              <button key={k} className={"rangeBtn" + (range === k ? " on" : "")} onClick={() => setRange(k)}>{l}</button>
            ))}
          </div>
          <h2 style={{ marginTop: 16 }}>{ch.title}</h2>
          <div className="chartWrap">
            {[1, 2, 3, 4].map((g) => (
              <span className="gLbl" key={g} style={{ bottom: "calc(22px + (100% - 22px) * " + g / 4 + ")" }}>{fmt(niceMax * g / 4)}</span>
            ))}
            <div className="chartScroll" ref={chartScrollRef}>
              <div className="chartInner" style={{ width: Math.max(ch.vals.length * 48, 0) + "px" }}>
                {[1, 2, 3, 4].map((g) => (
                  <div className="gLine" key={g} style={{ bottom: "calc(22px + (100% - 22px) * " + g / 4 + ")" }} />
                ))}
                <div className="gLine" style={{ bottom: 22 }} />
                <div className="chartArea">
                  {ch.vals.map((v, i) => (
                    <div className="col" key={i}>
                      <div className="barBox">{v != null && <div className={"bar" + (i === ch.hot ? " today" : "")} style={{ height: Math.max((v / niceMax) * 100, 1.5) + "%" }} />}</div>
                      <div className="dayLbl" style={i === ch.hot ? { fontWeight: 700, color: T.blue } : null}>{ch.labels[i]}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <SizeRow />
      </div>
    );
  }

  return (
    <div className="app">
      <style>{css}</style>
      <Header right={<><button className="hdrBtn" onClick={() => { setPlaying(false); setScreen("progress"); }}>Progress</button><button className="hdrBtn" onClick={() => { setPlaying(false); setScreen("settings"); }}>Settings</button></>} />
      <div className="tabs">
        <button className={"tab" + (mode === "words" ? " on" : "")} onClick={() => switchMode("words")}>Words</button>
        <button className={"tab" + (mode === "pairs" ? " on" : "")} onClick={() => switchMode("pairs")}>Sound pairs</button>
        <button className={"tab" + (mode === "sents" ? " on" : "")} onClick={() => switchMode("sents")}>Sentences</button>
        <button className={"tab" + (mode === "scen" ? " on" : "")} onClick={() => switchMode("scen")}>Scenarios</button>
      </div>
      {mode === "scen" && scenario && (
        <div style={{ textAlign: "center", margin: "6px 16px 0" }}>
          <button className="ghost" style={{ padding: "8px 16px" }}
            onClick={() => { setPlaying(false); setScenario(null); setItem(null); itemRef.current = null; }}>
            {SCENARIOS.find((s) => s.id === scenario)?.name} — change
          </button>
        </div>
      )}
      <div className="stage">
        {mode === "scen" && !scenario && (
          <div style={{ textAlign: "center" }}>
            <div className="idle" style={{ margin: "0 auto 16px" }}>Pick a situation — practice the words you actually need there.</div>
            <div className="wordGrid" style={{ justifyContent: "center" }}>
              {SCENARIOS.map((s) => (
                <button key={s.id} className="wchip" onClick={() => setScenario(s.id)}>{s.name}</button>
              ))}
            </div>
          </div>
        )}
        {!item && !(mode === "scen" && !scenario) && (
          <div className="idle">
            {paced
              ? "Press Start. Words appear one at a time — say each one out loud before the next arrives."
              : mode === "sents"
                ? "Tap Next to begin. Say each highlighted word out loud."
                : "Tap Next to begin. Say each word out loud, then tap Next when you're ready."}
          </div>
        )}
        {item && (mode === "words" || mode === "scen") && <div className="word">{item.w}</div>}
        {item && mode === "pairs" && item.pair && (
          <div className="pairWrap">
            <div className="word">{item.pair[0]}</div>
            <div className="pair2">{item.pair[1]}</div>
          </div>
        )}
        {item && mode === "sents" && item.words && (
          <div className="sentWrap">
            {item.words.map((w, i) => (
              <span key={i} className={"sw" + (i === item.idx ? " now" : i < item.idx ? " done" : "")}>{w}</span>
            ))}
          </div>
        )}
      </div>
      <div className="setBar"><div className="setFill" style={{ width: Math.min((setItems.length / setSize) * 100, 100) + "%" }} /></div>
      <div className="controls">
        <div className="paceRow">
          <button className="switch" onClick={togglePaced} aria-pressed={paced}>
            <span className={"track" + (paced ? " on" : "")}><span className="knob" /></span>
            <span className="swLbl">Auto pace</span>
          </button>
          {paced && (
            <>
              <input type="range" min="10" max="150" step="5" value={wpm}
                onChange={(e) => setWpm(parseInt(e.target.value))} />
              <span className="paceVal">{wpm} wpm</span>
            </>
          )}
        </div>
        <div className="btnRow">
          {paced ? (
            <>
              <button className={"play" + (playing ? " stop" : "")} onClick={() => { if (mode === "scen" && !scenario) return; setPlaying(!playing); }}>
                {playing ? "Pause" : "Start"}
              </button>
              <button className="ghost" onClick={next}>Next</button>
            </>
          ) : (
            <button className="play" style={{ flex: 1 }} onClick={next}>
              {item ? "Next" : "Start"}
            </button>
          )}
        </div>
        <div className="meta">{setItems.length} of {setSize} this set · {todayWords} today</div>
      </div>
      <SizeRow />
    </div>
  );
}
