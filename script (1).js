/* ============================================================
   MY SANDBOX DAY
   Vanilla JS, no build step. Everything persists in localStorage
   under one key so the whole app survives a refresh / tomorrow.
   ============================================================ */

const $ = (id) => document.getElementById(id);
const STORAGE_KEY = "sandbox_day_v1";
const HOURS = Array.from({ length: 18 }, (_, i) => i + 6); // 6am .. 11pm

const PILLARS = {
  wellness: { label: "Wellness", color: "var(--mint)" },
  hobby:    { label: "Hobby",    color: "var(--gold)" },
  social:   { label: "Social",   color: "var(--coral)" },
  growth:   { label: "Growth",   color: "var(--violet)" },
  rest:     { label: "Rest",     color: "var(--paper)" },
};

const BLOCK_LIBRARY = [
  { id: "meditate", pillar: "wellness", label: "Meditate", emoji: "☀️" },
  { id: "workout",  pillar: "wellness", label: "Move your body", emoji: "🏃" },
  { id: "skincare", pillar: "wellness", label: "Skincare ritual", emoji: "🧴" },
  { id: "draw",     pillar: "hobby",    label: "Make something", emoji: "🎨" },
  { id: "music",    pillar: "hobby",    label: "Play or make music", emoji: "🎧" },
  { id: "read",     pillar: "hobby",    label: "Read for fun", emoji: "📖" },
  { id: "call",     pillar: "social",   label: "Call someone", emoji: "📞" },
  { id: "hangout",  pillar: "social",   label: "Hang out IRL", emoji: "🧑‍🤝‍🧑" },
  { id: "checkin",  pillar: "social",   label: "Check in on a friend", emoji: "💬" },
  { id: "study",    pillar: "growth",   label: "Learn something", emoji: "📚" },
  { id: "journal",  pillar: "growth",   label: "Journal", emoji: "✍️" },
  { id: "goal",     pillar: "growth",   label: "Work on a goal", emoji: "🎯" },
  { id: "nap",      pillar: "rest",     label: "Nap", emoji: "😴" },
  { id: "walk",     pillar: "rest",     label: "Walk outside", emoji: "🌿" },
  { id: "nothing",  pillar: "rest",     label: "Do absolutely nothing", emoji: "🌙" },
  { id: "coffee",   pillar: "rest",     label: "Perfect coffee or tea", emoji: "☕" },
];

const EGO_EMOJIS = ["👑","🎨","🌙","⚡","🌱","🔥","🧘","🚀","🦋","🎧"];
const VIBES = ["Future CEO Me", "Cozy Artist Me", "Night Owl Dreamer", "Wildcard Me", "Soft Life Me", "Main Character Me"];
const MOODS = ["😩","😐","🙂","😊","🤩"];

/* ------------------------------------------------------------
   STORAGE
   ------------------------------------------------------------ */

function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function defaultData() {
  return {
    alterEgo: null,                          // { name, emoji, vibe }
    blueprint: [],                           // [{ hour, blockId }]
    progress: { xp: { wellness:0, hobby:0, social:0, growth:0, rest:0 }, streak: 0, lastLogDate: null },
    today: { date: todayStr(), completed: [] },
    journal: [],                             // [{ date, pct, mood, note }]
  };
}

function loadData() {
  let data;
  try {
    data = JSON.parse(localStorage.getItem(STORAGE_KEY)) || defaultData();
  } catch (e) {
    data = defaultData();
  }
  // roll over to a fresh quest log on a new day, without touching XP/streak/journal
  if (data.today.date !== todayStr()) {
    data.today = { date: todayStr(), completed: [] };
    saveData(data);
  }
  return data;
}

function saveData(data) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) { /* storage unavailable — app still runs in-memory for this session */ }
}

let data = loadData();

/* ------------------------------------------------------------
   THE LIVING SKY — now tracks the real clock, not a quiz.
   ------------------------------------------------------------ */

const SKY_STAGES = [
  { end: 5,  css: "linear-gradient(180deg,#0f1226 0%, #1a1c3d 55%, #2c1250 100%)" },  // night
  { end: 8,  css: "linear-gradient(180deg,#1b2255 0%, #7a3f7f 55%, #f2a15f 100%)" },  // dawn
  { end: 17, css: "linear-gradient(180deg,#1e6091 0%, #4f9dde 55%, #eaf6ff 100%)" },  // day
  { end: 20, css: "linear-gradient(180deg,#2c3d82 0%, #b06fae 55%, #f2765b 100%)" },  // dusk
  { end: 24, css: "linear-gradient(180deg,#0f1226 0%, #2c1250 55%, #6c3483 100%)" },  // night
];

function updateSky() {
  const now = new Date();
  const hourFloat = now.getHours() + now.getMinutes() / 60;
  const stage = SKY_STAGES.find((s) => hourFloat <= s.end) || SKY_STAGES[SKY_STAGES.length - 1];
  $("sky-gradient").style.background = stage.css;

  const progress = hourFloat / 24;
  const left = 4 + progress * 92;
  const top = 82 - Math.sin(progress * Math.PI) * 62;
  $("sun").style.left = left + "%";
  $("sun").style.top = Math.max(6, top) + "%";
}

/* ------------------------------------------------------------
   SCREEN / TAB NAVIGATION
   ------------------------------------------------------------ */

function showOnboardIfNeeded() {
  if (data.alterEgo) {
    $("screen-onboard").classList.remove("active");
    $("app-shell").style.display = "block";
    goToTab("home");
  } else {
    $("screen-onboard").classList.add("active");
    $("app-shell").style.display = "none";
  }
}

function goToTab(name) {
  document.querySelectorAll("#app-shell .screen").forEach((s) => s.classList.remove("active"));
  $("screen-" + name).classList.add("active");
  document.querySelectorAll(".tab").forEach((t) => t.classList.toggle("active", t.dataset.tab === name));

  if (name === "home") renderHome();
  if (name === "blueprint") renderBlueprintScreen();
  if (name === "today") renderToday();
  if (name === "stats") renderStats();
}

document.querySelectorAll(".tab").forEach((t) => t.addEventListener("click", () => goToTab(t.dataset.tab)));

/* ------------------------------------------------------------
   ONBOARDING
   ------------------------------------------------------------ */

let pickedEmoji = null, pickedVibe = null;

function renderOnboardOptions() {
  const eg = $("emoji-grid");
  eg.innerHTML = "";
  EGO_EMOJIS.forEach((e) => {
    const b = document.createElement("button");
    b.className = "pill-choice";
    b.textContent = e;
    b.addEventListener("click", () => {
      pickedEmoji = e;
      eg.querySelectorAll(".pill-choice").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
    eg.appendChild(b);
  });

  const vg = $("vibe-grid");
  vg.innerHTML = "";
  VIBES.forEach((v) => {
    const b = document.createElement("button");
    b.className = "pill-choice";
    b.textContent = v;
    b.addEventListener("click", () => {
      pickedVibe = v;
      vg.querySelectorAll(".pill-choice").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
    vg.appendChild(b);
  });
}

$("btn-create-ego").addEventListener("click", () => {
  const name = $("input-name").value.trim() || "Unnamed Main Character";
  if (!pickedEmoji) pickedEmoji = EGO_EMOJIS[0];
  if (!pickedVibe) pickedVibe = VIBES[0];
  data.alterEgo = { name, emoji: pickedEmoji, vibe: pickedVibe };
  saveData(data);
  showOnboardIfNeeded();
});

/* ------------------------------------------------------------
   HOME
   ------------------------------------------------------------ */

function renderHome() {
  const ego = data.alterEgo;
  $("ego-card").innerHTML = `
    <div class="ego-emoji">${ego.emoji}</div>
    <div>
      <div class="ego-name">${ego.name}</div>
      <div class="ego-vibe">${ego.vibe}</div>
    </div>`;

  const now = new Date();
  $("now-line").textContent = `It's ${formatHour(now.getHours())}. ${blueprintCountLine()}`;

  const preview = $("home-today-preview");
  const items = todaysBlocks();
  if (items.length === 0) {
    preview.innerHTML = `<p class="empty-note">No blueprint yet. Head to <strong>Blueprint</strong> and place a few blocks — that's what shows up here every day.</p>`;
    return;
  }
  const doneCount = items.filter((i) => data.today.completed.includes(i.hour)).length;
  preview.innerHTML = `<p class="lede small" style="margin-bottom:.6rem;">${doneCount} / ${items.length} done today. See the full quest log under <strong>Today</strong>.</p>`;
}

function blueprintCountLine() {
  return data.blueprint.length === 0
    ? "Your sandbox is still empty."
    : `Your blueprint has ${data.blueprint.length} block${data.blueprint.length === 1 ? "" : "s"} in it.`;
}

function formatHour(h) {
  const period = h >= 12 ? "PM" : "AM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}${period}`;
}

/* ------------------------------------------------------------
   BLUEPRINT BUILDER
   ------------------------------------------------------------ */

let selectedBlockId = null;

function renderBlockLibrary() {
  const lib = $("block-library");
  lib.innerHTML = "";
  BLOCK_LIBRARY.forEach((block) => {
    const card = document.createElement("button");
    card.className = "block-card";
    card.draggable = true;
    card.dataset.blockId = block.id;
    card.innerHTML = `<span class="swatch" style="background:${PILLARS[block.pillar].color}"></span>${block.emoji} ${block.label}`;
    card.addEventListener("click", () => {
      selectedBlockId = selectedBlockId === block.id ? null : block.id;
      lib.querySelectorAll(".block-card").forEach((c) => c.classList.toggle("selected", c.dataset.blockId === selectedBlockId));
    });
    card.addEventListener("dragstart", (e) => e.dataTransfer.setData("text/plain", block.id));
    lib.appendChild(card);
  });
}

function renderBlueprintScreen() {
  const tl = $("blueprint-timeline");
  tl.innerHTML = "";
  const nowHour = new Date().getHours();

  HOURS.forEach((hour) => {
    const existing = data.blueprint.find((b) => b.hour === hour);
    const slot = document.createElement("div");
    slot.className = "slot" + (existing ? " filled" : "") + (hour === nowHour ? " now-slot" : "");
    slot.dataset.hour = hour;

    const label = existing ? BLOCK_LIBRARY.find((b) => b.id === existing.blockId) : null;
    slot.innerHTML = `
      <span class="slot-hour">${formatHour(hour)}</span>
      <span class="slot-content">${label ? `${label.emoji} ${label.label}` : ""}</span>
      ${existing ? `<button class="slot-remove" title="Remove">✕</button>` : ""}`;

    slot.addEventListener("click", (e) => {
      if (e.target.classList.contains("slot-remove")) {
        data.blueprint = data.blueprint.filter((b) => b.hour !== hour);
        saveData(data);
        renderBlueprintScreen();
        return;
      }
      if (selectedBlockId) {
        placeBlock(hour, selectedBlockId);
        selectedBlockId = null;
        renderBlockLibrary();
        renderBlueprintScreen();
      }
    });

    slot.addEventListener("dragover", (e) => { e.preventDefault(); slot.classList.add("dragover"); });
    slot.addEventListener("dragleave", () => slot.classList.remove("dragover"));
    slot.addEventListener("drop", (e) => {
      e.preventDefault();
      slot.classList.remove("dragover");
      const blockId = e.dataTransfer.getData("text/plain");
      if (blockId) { placeBlock(hour, blockId); renderBlueprintScreen(); }
    });

    tl.appendChild(slot);
  });

  renderBlockLibrary();
}

function placeBlock(hour, blockId) {
  data.blueprint = data.blueprint.filter((b) => b.hour !== hour);
  data.blueprint.push({ hour, blockId });
  saveData(data);
}

/* ------------------------------------------------------------
   BRAINSTORM MY VIBE — local generator.
   Swap in a real API call here if you have a key: replace the
   body of generateVibeSuggestion() with a fetch() to your
   OpenAI/Gemini endpoint using the same three words as input.
   ------------------------------------------------------------ */

function generateVibeSuggestion(words) {
  const [a, b, c] = words;
  const openers = [
    `Start small: something ${a} doesn't need to be fixed, just held for an hour.`,
    `Lean into ${a} instead of fighting it — that's the actual material you're working with today.`,
    `${cap(a)} isn't a problem to solve, it's just today's weather.`,
  ];
  const middles = [
    `Let that turn ${b} — one block, twenty minutes, nothing scheduled after it.`,
    `Somewhere in the next few hours, make room for ${b}, even a small version of it.`,
    `Feed the ${b} part on purpose, before the day decides for you.`,
  ];
  const closers = [
    `If the ${c} shows up, that's not a distraction — that's the blueprint working.`,
    `End on ${c}, deliberately, so the day has a shape instead of just an ending.`,
    `Let ${c} be the last thing, and call that enough.`,
  ];
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  return `${pick(openers)} ${pick(middles)} ${pick(closers)}`;
}

function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

$("btn-brainstorm").addEventListener("click", () => {
  const raw = $("brainstorm-input").value.trim();
  if (!raw) { $("brainstorm-output").textContent = "Give it three words first — mood, weather, whatever's true right now."; return; }
  const words = raw.split(/[,\s]+/).filter(Boolean).slice(0, 3);
  while (words.length < 3) words.push(words[words.length - 1] || "quiet");
  $("brainstorm-output").textContent = generateVibeSuggestion(words);
});

/* ------------------------------------------------------------
   TODAY — the blueprint, turned into a checklist that earns XP.
   ------------------------------------------------------------ */

function todaysBlocks() {
  return data.blueprint
    .slice()
    .sort((a, b) => a.hour - b.hour)
    .map((b) => ({ ...b, block: BLOCK_LIBRARY.find((x) => x.id === b.blockId) }))
    .filter((b) => b.block);
}

function renderToday() {
  $("today-date").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  const list = $("today-list");
  list.innerHTML = "";
  const items = todaysBlocks();

  if (items.length === 0) {
    list.innerHTML = `<p class="empty-note">Nothing here yet — go build your <a href="#" id="link-to-blueprint">Blueprint</a> first.</p>`;
    $("link-to-blueprint").addEventListener("click", (e) => { e.preventDefault(); goToTab("blueprint"); });
    return;
  }

  items.forEach(({ hour, block }) => {
    const done = data.today.completed.includes(hour);
    const row = document.createElement("label");
    row.className = "quest" + (done ? " done" : "");
    row.innerHTML = `
      <input type="checkbox" ${done ? "checked" : ""}>
      <span class="quest-hour">${formatHour(hour)}</span>
      <span class="quest-label">${block.emoji} ${block.label}</span>
      <span class="quest-xp">+10 ${PILLARS[block.pillar].label.toUpperCase()}</span>`;
    row.querySelector("input").addEventListener("change", (e) => toggleQuest(hour, block.pillar, e.target.checked));
    list.appendChild(row);
  });
}

function toggleQuest(hour, pillar, checked) {
  const idx = data.today.completed.indexOf(hour);
  if (checked && idx === -1) {
    data.today.completed.push(hour);
    data.progress.xp[pillar] += 10;
  } else if (!checked && idx !== -1) {
    data.today.completed.splice(idx, 1);
    data.progress.xp[pillar] = Math.max(0, data.progress.xp[pillar] - 10);
  }
  saveData(data);
  renderToday();
}

/* ------------------------------------------------------------
   VIBE CHECK
   ------------------------------------------------------------ */

let selectedMood = null;

function renderMoodGrid() {
  const mg = $("mood-grid");
  mg.innerHTML = "";
  MOODS.forEach((m) => {
    const b = document.createElement("button");
    b.className = "mood-btn";
    b.textContent = m;
    b.addEventListener("click", () => {
      selectedMood = m;
      mg.querySelectorAll(".mood-btn").forEach((x) => x.classList.remove("selected"));
      b.classList.add("selected");
    });
    mg.appendChild(b);
  });
}

$("vibe-slider").addEventListener("input", (e) => { $("vibe-pct").textContent = e.target.value; });

$("btn-submit-vibe").addEventListener("click", () => {
  const pct = Number($("vibe-slider").value);
  const note = $("vibe-note").value.trim();
  const date = todayStr();

  const existingIdx = data.journal.findIndex((j) => j.date === date);
  const entry = { date, pct, mood: selectedMood || "🙂", note };
  if (existingIdx !== -1) data.journal[existingIdx] = entry; else data.journal.push(entry);

  updateStreak(date);
  saveData(data);

  $("vibe-confirm").textContent = `Logged. ${data.progress.streak} day streak.`;
});

function updateStreak(date) {
  const last = data.progress.lastLogDate;
  if (last === date) return; // already logged today, no change
  if (last) {
    const yesterday = new Date(date);
    yesterday.setDate(yesterday.getDate() - 1);
    const yStr = yesterday.toISOString().slice(0, 10);
    data.progress.streak = last === yStr ? data.progress.streak + 1 : 1;
  } else {
    data.progress.streak = 1;
  }
  data.progress.lastLogDate = date;
}

/* ------------------------------------------------------------
   STATS
   ------------------------------------------------------------ */

function levelFromXP(xp) {
  return { level: Math.floor(xp / 50) + 1, withinLevel: xp % 50 };
}

function renderStats() {
  $("streak-row").textContent = data.progress.streak > 0
    ? `🔥 ${data.progress.streak} day streak`
    : `Log a Vibe Check to start a streak`;

  const bars = $("level-bars");
  bars.innerHTML = "";
  Object.keys(PILLARS).forEach((key) => {
    const { level, withinLevel } = levelFromXP(data.progress.xp[key]);
    const row = document.createElement("div");
    row.className = "level-row";
    row.innerHTML = `
      <div class="level-label"><span>${PILLARS[key].label}</span><span>Lv. ${level}</span></div>
      <div class="level-track"><div class="level-fill" style="width:${(withinLevel / 50) * 100}%; background:${PILLARS[key].color}"></div></div>`;
    bars.appendChild(row);
  });

  const jlist = $("journal-list");
  jlist.innerHTML = "";
  const recent = data.journal.slice().reverse().slice(0, 6);
  if (recent.length === 0) {
    jlist.innerHTML = `<p class="empty-note">No days logged yet — do a Vibe Check tonight.</p>`;
  } else {
    recent.forEach((j) => {
      const row = document.createElement("div");
      row.className = "journal-row";
      row.innerHTML = `<span class="j-date">${j.date.slice(5)}</span><span>${j.mood}</span><span class="j-pct">${j.pct}%</span><span class="j-note">${j.note || ""}</span>`;
      jlist.appendChild(row);
    });
  }
}

/* ------------------------------------------------------------
   INIT
   ------------------------------------------------------------ */

renderOnboardOptions();
renderMoodGrid();
showOnboardIfNeeded();
updateSky();
setInterval(updateSky, 60000);
