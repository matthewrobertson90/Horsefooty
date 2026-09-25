/*
 * Cups & Flags — game flow.
 */
(function () {
  const { SEASONS, TRIVIA, eraFor, CLUBS, PARADE_EXTRAS, horseMatches, clubMatches, horseClue, HORSE_CLUE_LABELS, CLUB_CLUE_LABELS, art, sound } = window.HF;

  const REVEAL_PENALTY_MS = 30000;
  const MAX_CLUES = { horse: HORSE_CLUE_LABELS.length, club: CLUB_CLUE_LABELS.length };
  const ADVANCE_DELAY_MS = 1400;
  const LOCK_DELAY_MS = 220;
  const RUN_KEY = "hf-run";
  const BOARD_KEY = "hf-board";

  const $ = (id) => document.getElementById(id);
  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : fallback; } catch (e) { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} },
    del(k) { try { localStorage.removeItem(k); } catch (e) {} },
  };

  let run = null;
  let advanceTimer = null;
  let rafId = null;
  const lockTimers = {};

  // ---------- helpers ----------
  const seasonAt = (i) => SEASONS[run.years[i]];
  const current = () => seasonAt(run.pos);
  const clubOf = (s) => CLUBS[s.club];
  const resultFor = (year) => (run.results[year] ||= { horse: { status: "open", clues: 0 }, club: { status: "open", clues: 0 } });

  function yearMark(r) {
    if (!r || r.horse.status === "open" || r.club.status === "open") return null;
    if (r.horse.status === "missed" || r.club.status === "missed") return "missed";
    if (r.horse.status === "partial" || r.club.status === "partial") return "partial";
    return "full";
  }

  function tally() {
    const t = { full: 0, partial: 0, missed: 0, clues: 0, reveals: 0 };
    for (const r of Object.values(run.results)) {
      const m = yearMark(r);
      if (m) t[m]++;
      t.clues += r.horse.clues + r.club.clues;
      t.reveals += (r.horse.status === "missed") + (r.club.status === "missed");
    }
    return t;
  }

  function elapsed() {
    const end = run.finishedAt || Date.now();
    return end - run.startedAt + run.penalty;
  }

  function fmt(ms) {
    const t = Math.max(0, ms) / 1000;
    const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60), d = Math.floor((t * 10) % 10);
    const ss = String(s).padStart(2, "0");
    return h ? `${h}:${String(m).padStart(2, "0")}:${ss}.${d}` : `${m}:${ss}.${d}`;
  }

  const save = () => store.set(RUN_KEY, run);

  function show(screen) {
    document.querySelectorAll(".screen").forEach((s) => s.classList.toggle("active", s.id === "screen-" + screen));
    window.scrollTo(0, 0);
  }

  // ---------- background parade ----------
  function buildParade() {
    const jumpers = [...Object.values(CLUBS).map((c) => c.jumper), ...PARADE_EXTRAS];
    const row = (items) => `<div class="parade-row">${items}${items}</div>`;
    const jRow = jumpers.map((j, i) => art.jumper(j, { width: 70, number: String((i * 7) % 40 + 1) })).join("");
    const hRow = Array.from({ length: 10 }, (_, i) => art.horseFor(1890 + i * 13, { width: 150, number: String(i + 1) })).join("");
    $("parade").innerHTML = row(jRow) + `<div class="parade-row reverse">${hRow}${hRow}</div>` + row(jRow);
  }

  function buildTrack() {
    $("runners").innerHTML = Array.from({ length: 5 }, (_, i) =>
      `<div class="runner" style="--lane:${i};--dur:${7 + ((i * 3) % 5)}s;--delay:${-i * 1.9}s">${art.horseFor(2000 + i * 7, { width: 120, number: String(i + 1), cls: "galloping" })}</div>`
    ).join("");
  }

  // ---------- title ----------
  function renderTitle() {
    body("modern");
    $("last-year").textContent = SEASONS[SEASONS.length - 1].year;
    $("title-art").innerHTML =
      `<div class="title-horses">${[1930, 2003, 1965].map((y, i) => art.horseFor(y, { width: 190, number: String(i + 1), cls: "galloping" })).join("")}</div>` +
      `<div class="title-jumpers">${["collingwood", "carlton", "essendon", "richmond", "hawthorn", "geelong", "melbourne", "sydney", "brisbane", "westcoast"].map((k, i) => art.jumper(CLUBS[k].jumper, { width: 56, number: String(i + 1) })).join("")}</div>`;

    const decades = [];
    for (let d = 1890; d <= SEASONS[SEASONS.length - 1].year; d += 10) decades.push(d);
    $("decades").innerHTML = decades.map((d) => `<button class="btn small ghost" data-decade="${d}">${d}s</button>`).join("");

    const board = store.get(BOARD_KEY, []);
    $("leaderboard").innerHTML = board.length
      ? `<table><thead><tr><th>#</th><th>Time</th><th>✓</th><th>◐</th><th>✗</th><th>Date</th></tr></thead><tbody>${board
          .map((b, i) => `<tr><td>${i + 1}</td><td class="mono">${fmt(b.time)}</td><td>${b.full}</td><td>${b.partial}</td><td>${b.missed}</td><td>${new Date(b.date).toLocaleDateString()}</td></tr>`)
          .join("")}</tbody></table>`
      : `<p class="small">No full runs yet. The track is waiting.</p>`;

    const saved = store.get(RUN_KEY, null);
    $("btn-resume").classList.toggle("hidden", !(saved && !saved.finishedAt));
    show("title");
  }

  // ---------- run lifecycle ----------
  function startRun(yearIdx, mode, label) {
    const saved = store.get(RUN_KEY, null);
    if (saved && !saved.finishedAt && !confirm("Abandon the run in progress and start a new one?")) return;
    run = { mode, label, years: yearIdx, pos: 0, startedAt: Date.now(), penalty: 0, results: {}, finishedAt: null };
    save();
    sound.bell();
    enterGame();
  }

  function enterGame() {
    show("game");
    buildStrip();
    renderYear(true);
    tick();
  }

  function tick() {
    cancelAnimationFrame(rafId);
    const loop = () => {
      if (!run || run.finishedAt) return;
      $("clock").textContent = fmt(elapsed());
      rafId = requestAnimationFrame(loop);
    };
    loop();
  }

  function body(tone) { document.body.dataset.tone = tone; }

  // ---------- year screen ----------
  function buildStrip() {
    $("strip").innerHTML = run.years.map((i) => `<span data-year="${SEASONS[i].year}" title="${SEASONS[i].year}"></span>`).join("");
    updateStrip();
  }

  function updateStrip() {
    const cur = current().year;
    $("strip").querySelectorAll("span").forEach((el) => {
      const y = +el.dataset.year;
      el.className = (yearMark(run.results[y]) || "") + (y === cur ? " current" : "");
    });
  }

  function renderYear(first) {
    clearTimeout(advanceTimer);
    advanceTimer = null;
    const s = current();
    const club = clubOf(s);
    const r = resultFor(s.year);
    const era = eraFor(s.year);
    body(era.tone);

    const yearEl = $("year");
    yearEl.textContent = s.year;
    if (!first) { yearEl.classList.remove("flip"); void yearEl.offsetWidth; yearEl.classList.add("flip"); }
    $("era").textContent = era.name;
    $("count").textContent = `${run.pos + 1} / ${run.years.length}`;
    $("comp-name").textContent = s.year < 1990 ? "VFL Premiership" : "AFL Premiership";
    $("comp-sub").textContent = s.year < 1990 ? "Victorian Football League" : "Australian Football League";
    $("cup-icon").innerHTML = art.cup({ width: 34 });
    $("flag-icon").innerHTML = art.flag({ width: 34, color: "#c9a227" });
    $("trivia").textContent = "";
    $("trivia").classList.remove("show");
    document.querySelectorAll(".card").forEach((c) => c.classList.remove("done"));

    for (const item of ["horse", "club"]) {
      clearTimeout(lockTimers[item]);
      const input = $("in-" + item);
      input.value = "";
      input.disabled = false;
      input.classList.remove("ok", "bad", "revealed");
      renderItem(item, s, club, r[item]);
    }
    updateTally();
    updateStrip();
    save();
    focusNext();
  }

  function renderItem(item, s, club, st) {
    const done = st.status !== "open";
    const input = $("in-" + item);
    const card = $("card-" + item);
    card.classList.toggle("resolved", done);
    $("mark-" + item).innerHTML = done ? markHtml(st.status) : "";

    if (done) {
      input.value = item === "horse" ? s.horse : club.name;
      input.disabled = true;
      input.classList.add(st.status === "missed" ? "revealed" : "ok");
    }

    // Artwork
    if (item === "horse") {
      $("art-horse").innerHTML =
        `<div class="art-bg-rail"></div>` +
        art.horseFor(s.year, { width: 230, number: done ? String(s.year).slice(2) : "?", cls: "galloping hero" }) +
        (done ? `<div class="nameplate">${escapeHtml(s.horse)}</div>` : "");
    } else {
      const showJumper = done || st.clues >= 1;
      $("art-club").innerHTML =
        `<div class="posts-wrap">${art.goalposts({ width: 170 })}</div>` +
        art.jumper(club.jumper, { width: 120, number: showJumper ? String(s.year).slice(2) : "", mystery: !showJumper, cls: "hero-jumper" + (done ? " pop" : "") }) +
        `<div class="footy-wrap">${art.footy({ width: 64, cls: "spin" })}</div>` +
        (done ? `<div class="nameplate">${escapeHtml(club.name)}</div>` : "");
    }

    // Clue list
    const clues = [];
    for (let lvl = 1; lvl <= st.clues; lvl++) {
      if (item === "horse") {
        const letters = s.horse.replace(/[^a-z]/gi, "").length;
        const label = lvl === 1 ? `${HORSE_CLUE_LABELS[0]}: ${letters} letters` : HORSE_CLUE_LABELS[lvl - 1];
        clues.push(`<div class="clue"><span class="clue-label">${label}</span><span class="pattern">${escapeHtml(horseClue(s.horse, lvl))}</span></div>`);
      } else if (lvl === 1) {
        clues.push(`<div class="clue"><span class="clue-label">${CLUB_CLUE_LABELS[0]}</span>Wore ${escapeHtml(club.colours)}</div>`);
      } else {
        clues.push(`<div class="clue"><span class="clue-label">${CLUB_CLUE_LABELS[1]}</span>The ${escapeHtml(club.nickname)} · ${escapeHtml(club.home)}${club.note ? ` (${escapeHtml(club.note)})` : ""}</div>`);
      }
    }
    $("clues-" + item).innerHTML = clues.join("");

    const clueBtn = card.querySelector(".clue-btn");
    const left = MAX_CLUES[item] - st.clues;
    clueBtn.textContent = left > 0 ? `Clue (${left} left)` : "No clues left";
    clueBtn.disabled = done || left <= 0;
    card.querySelector(".reveal-btn").disabled = done;
  }

  function markHtml(status) {
    return { full: `<span class="mark full">✓</span>`, partial: `<span class="mark partial">◐</span>`, missed: `<span class="mark missed">✗</span>` }[status] || "";
  }

  function updateTally() {
    const t = tally();
    $("t-full").textContent = t.full;
    $("t-partial").textContent = t.partial;
    $("t-missed").textContent = t.missed;
  }

  function focusNext() {
    const r = resultFor(current().year);
    const target = r.horse.status === "open" ? "horse" : r.club.status === "open" ? "club" : null;
    if (target) $("in-" + target).focus({ preventScroll: true });
  }

  // ---------- answering ----------
  function onInput(item) {
    if (!run || advanceTimer) return;
    const input = $("in-" + item);
    let v = input.value;
    if (v.includes("?")) { input.value = v.replace(/\?/g, ""); return useClue(item); }
    if (v.includes("!")) { input.value = v.replace(/!/g, ""); return reveal(item); }
    // Exact answers lock in on their own after a short pause (so a longer name
    // that starts with a valid answer can still be typed); typos need Enter.
    clearTimeout(lockTimers[item]);
    if (isCorrect(item, v, false)) lockTimers[item] = setTimeout(() => tryLock(item, false), LOCK_DELAY_MS);
  }

  function isCorrect(item, v, forgiving) {
    const s = current();
    return item === "horse" ? horseMatches(v, s.horse, forgiving) : clubMatches(v, clubOf(s));
  }

  function tryLock(item, forgiving) {
    const s = current();
    const st = resultFor(s.year)[item];
    if (st.status !== "open" || !isCorrect(item, $("in-" + item).value, forgiving)) return false;
    resolve(item, st.clues ? "partial" : "full");
    return true;
  }

  function onEnter(item) {
    if (advanceTimer) return advance();
    const input = $("in-" + item);
    if (!input.value.trim()) return;
    clearTimeout(lockTimers[item]);
    if (tryLock(item, true)) return;
    input.classList.remove("bad");
    void input.offsetWidth;
    input.classList.add("bad");
    sound.wrong();
  }

  function useClue(item) {
    const s = current();
    const st = resultFor(s.year)[item];
    if (st.status !== "open" || st.clues >= MAX_CLUES[item]) return;
    st.clues++;
    sound.clue();
    renderItem(item, s, clubOf(s), st);
    save();
    $("in-" + item).focus();
  }

  function reveal(item) {
    const s = current();
    const st = resultFor(s.year)[item];
    if (st.status !== "open") return;
    run.penalty += REVEAL_PENALTY_MS;
    flashPenalty();
    resolve(item, "missed");
  }

  function resolve(item, status) {
    const s = current();
    const r = resultFor(s.year);
    r[item].status = status;
    status === "full" ? sound.correct() : status === "partial" ? sound.partial() : sound.wrong();
    renderItem(item, s, clubOf(s), r[item]);
    save();
    if (yearMark(r)) completeYear(s, r);
    else focusNext();
  }

  function completeYear(s, r) {
    const mark = yearMark(r);
    updateTally();
    updateStrip();
    document.querySelectorAll(".card").forEach((c) => c.classList.add("done"));
    if (TRIVIA[s.year]) { $("trivia").textContent = "Did you know? " + TRIVIA[s.year]; $("trivia").classList.add("show"); }
    if (mark !== "missed") { sound.year(); confetti(clubOf(s).jumper.colors); }
    const delay = TRIVIA[s.year] ? ADVANCE_DELAY_MS + 1600 : ADVANCE_DELAY_MS;
    advanceTimer = setTimeout(advance, delay);
    save();
  }

  function advance() {
    clearTimeout(advanceTimer);
    advanceTimer = null;
    if (run.pos + 1 >= run.years.length) return finish();
    run.pos++;
    renderYear(false);
  }

  function flashPenalty() {
    const c = $("clock");
    c.classList.remove("penalty");
    void c.offsetWidth;
    c.classList.add("penalty");
  }

  // ---------- finish ----------
  function finish() {
    run.finishedAt = Date.now();
    save();
    cancelAnimationFrame(rafId);
    sound.siren();
    const t = tally();
    const time = elapsed();
    const n = run.years.length;

    if (run.mode === "full") {
      const board = store.get(BOARD_KEY, []);
      board.push({ time, full: t.full, partial: t.partial, missed: t.missed, date: Date.now() });
      board.sort((a, b) => a.time - b.time);
      store.set(BOARD_KEY, board.slice(0, 10));
    }

    body("modern");
    $("finish-art").innerHTML = art.cup({ width: 110, cls: "trophy" }) + art.flag({ width: 110, color: "#c9a227", cls: "trophy" });
    $("final-time").innerHTML = `<span class="hud-label">${run.mode === "full" ? "Full run" : escapeHtml(run.label)}</span>${fmt(time)}`;
    $("final-breakdown").innerHTML =
      `<span class="mark full">✓ ${t.full}</span><span class="mark partial">◐ ${t.partial}</span><span class="mark missed">✗ ${t.missed}</span>` +
      `<span class="small">${t.clues} clue${t.clues === 1 ? "" : "s"} · ${t.reveals} reveal${t.reveals === 1 ? "" : "s"} (+${fmt(t.reveals * REVEAL_PENALTY_MS)})</span>`;
    $("grade").textContent = grade(t.full / n, t.missed / n);
    $("year-grid").innerHTML = run.years
      .map((i) => {
        const s = SEASONS[i], r = run.results[s.year], m = yearMark(r) || "missed";
        return `<div class="yg ${m}" title="${s.year}: ${escapeHtml(s.horse)} / ${escapeHtml(CLUBS[s.club].name)}"><b>${s.year}</b><span>${escapeHtml(s.horse)}</span><span>${escapeHtml(CLUBS[s.club].name)}</span></div>`;
      })
      .join("");
    store.del(RUN_KEY);
    confetti(["#c9a227", "#ffffff", "#1a7f3c", "#e21937"], 90);
    show("finish");
  }

  function grade(fullRatio, missRatio) {
    if (fullRatio === 1) return "Perfect run. A Makybe Diva of a performance: unbeatable.";
    if (fullRatio >= 0.85) return "Champion of the turf and the terraces.";
    if (fullRatio >= 0.6) return "Premiership quarter. Strong through the line.";
    if (missRatio <= 0.25) return "Solid stayer. You ran out the two miles.";
    if (missRatio <= 0.5) return "Midfield finish. Back to the form guide.";
    return "Pulled up sore. The Footy Record and the form guide are calling.";
  }

  // ---------- confetti ----------
  function confetti(colors, count = 50) {
    const box = $("confetti");
    const frag = document.createDocumentFragment();
    for (let i = 0; i < count; i++) {
      const p = document.createElement("i");
      p.style.left = Math.random() * 100 + "vw";
      p.style.background = colors[i % colors.length];
      p.style.animationDelay = Math.random() * 0.3 + "s";
      p.style.animationDuration = 1.2 + Math.random() * 1.2 + "s";
      p.style.setProperty("--drift", (Math.random() - 0.5) * 200 + "px");
      p.style.setProperty("--spin", Math.random() * 720 + "deg");
      frag.appendChild(p);
    }
    box.appendChild(frag);
    setTimeout(() => { for (let i = 0; i < count && box.firstChild; i++) box.firstChild.remove(); }, 2800);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  }

  // ---------- wiring ----------
  function wire() {
    $("btn-start").addEventListener("click", () => startRun(SEASONS.map((_, i) => i), "full", "Full run"));
    $("btn-resume").addEventListener("click", () => {
      run = store.get(RUN_KEY, null);
      if (run) enterGame();
    });
    $("decades").addEventListener("click", (e) => {
      const d = +e.target.dataset.decade;
      if (!d) return;
      const idx = SEASONS.map((s, i) => [s, i]).filter(([s]) => s.year >= d && s.year < d + 10).map(([, i]) => i);
      startRun(idx, "practice", `${d}s practice`);
    });
    $("btn-again").addEventListener("click", renderTitle);
    $("btn-quit").addEventListener("click", () => {
      if (!confirm("Abandon this run? Your progress will be lost.")) return;
      clearTimeout(advanceTimer);
      advanceTimer = null;
      cancelAnimationFrame(rafId);
      store.del(RUN_KEY);
      run = null;
      renderTitle();
    });
    const muteBtn = $("btn-mute");
    const setMuteIcon = () => (muteBtn.textContent = sound.muted ? "🔇" : "🔊");
    setMuteIcon();
    muteBtn.addEventListener("click", () => { sound.toggle(); setMuteIcon(); });

    for (const item of ["horse", "club"]) {
      const input = $("in-" + item);
      input.addEventListener("input", () => onInput(item));
      input.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); onEnter(item); } });
    }
    document.querySelectorAll(".clue-btn").forEach((b) => b.addEventListener("click", () => useClue(b.dataset.item)));
    document.querySelectorAll(".reveal-btn").forEach((b) => b.addEventListener("click", () => reveal(b.dataset.item)));
    document.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && advanceTimer && document.activeElement.tagName !== "INPUT") advance();
    });
  }

  buildParade();
  buildTrack();
  wire();
  renderTitle();
})();
