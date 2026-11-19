// Leonida Legends — GTA VI trophy tracker.
// Loads app/data/trophies.json (relative path only), renders the checklist,
// saves progress in localStorage, and offers export / import of that progress.
// No network requests besides the local data file; no external resources.

const STORAGE_KEY = 'leonida-legends-progress-v1';
const DATA_URL = 'data/trophies.json';

const ROADMAP_STAGES = [
  { title: 'Play the story — Chapters 1 to 4 and the finale', hours: '60–80 hours', text: 'Finish all five chapters and the named story missions (Gone Fishing, Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory). That earns the chapter trophies, the mission trophies and the gold for the final mission. On the way, scan vehicles and study animals with the binoculars, take optional missions as they appear, and meditate whenever the game offers it.' },
  { title: 'Side characters and strangers', hours: 'about 10 hours', text: 'Finish the final missions for Andy, Kenton, Billy, Randy and Tyrone, beat Cal at fishing, hunt Bret\u2019s unique animal, and start the Strangers & Freaks strands. These all stay available in free roam, so sweep up any you skipped during the story.' },
  { title: 'Collectibles and activity counts', hours: 'the long middle', text: 'Work the counted trophies: 250 stunts, gold on all 42 Shooting Range challenges, drone-race wins at all 14 locations, 20 different race wins, 3 card sets, WAiNK at 100 locations, 100 vehicles discovered, all 52 areas explored, 5 bank vaults, one illegal operation per gang, 8 garages, 10 vehicles in the Scooter Bros app, $250,000 of Marked Bills laundered and $100,000 spent. Do 50 challenges on the way — the checklist later asks for 70 of 80.' },
  { title: '100% completion and the platinum', hours: 'about 100 hours', text: 'Open Progress, Stats, 100% Completion after the story and finish the checklist. It is lenient — roughly 60% of true completion, for example 200 of 277 vehicles and 100 of 255 animals — and nothing on it is missable. When it is done, A Long Road (gold) pops, and Vice Got a Price! (platinum) follows at once.' },
];

const listEl = document.getElementById('trophyList');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kindFilter');
const gradeEl = document.getElementById('gradeFilter');
const hideEarnedEl = document.getElementById('hideEarned');
const spoilerEl = document.getElementById('spoilerToggle');
const earnedCountEl = document.getElementById('earnedCount');
const totalCountEl = document.getElementById('totalCount');
const progressFillEl = document.getElementById('progressFill');
const progressNoteEl = document.getElementById('progressNote');
const resultCountEl = document.getElementById('resultCount');
const detailEl = document.getElementById('detail');
const detailBodyEl = document.getElementById('detailBody');

let allTrophies = [];
let earnedNames = loadProgress();

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earnedNames]));
}

function trophyIsHiddenStory(trophy) {
  return trophy.kind === 'story' && spoilerEl.checked && !earnedNames.has(trophy.name);
}

function kindLabel(kind) {
  const labels = { story: 'Story', missable: 'Missable', collectibles: 'Collectibles', activities: 'Activities', online: 'Online' };
  return labels[kind] ?? kind;
}

function gradeLabel(grade) {
  return grade.charAt(0).toUpperCase() + grade.slice(1);
}

function trophyMatchesFilters(trophy) {
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = [trophy.name, trophy.description, trophy.guide, trophy.kind, trophy.grade].join(' ').toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  if (kindEl.value === 'online') return false; // No online trophies exist in this list.
  if (kindEl.value !== 'all' && trophy.kind !== kindEl.value) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (hideEarnedEl.checked && earnedNames.has(trophy.name)) return false;
  return true;
}

function buildTrophyCard(trophy) {
  const card = document.createElement('article');
  card.className = 'trophy-card' + (earnedNames.has(trophy.name) ? ' earned' : '');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  const hiddenStory = trophyIsHiddenStory(trophy);

  const topRow = document.createElement('div');
  topRow.className = 'top-row';
  const check = document.createElement('span');
  check.textContent = earnedNames.has(trophy.name) ? '✔ Earned' : '○ Not earned';
  check.className = 'tag' + (earnedNames.has(trophy.name) ? ' earned-tag' : '');
  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  topRow.append(check, badge);
  card.append(topRow);

  const name = document.createElement('h3');
  name.className = 'trophy-name';
  name.textContent = hiddenStory ? 'Hidden story trophy' : trophy.name;
  card.append(name);

  const desc = document.createElement('p');
  desc.className = 'trophy-desc';
  desc.textContent = hiddenStory ? 'Spoiler-safe mode is on. Earn this trophy to reveal its name and description.' : trophy.description;
  card.append(desc);

  const meta = document.createElement('div');
  meta.className = 'trophy-meta';
  const kindTag = document.createElement('span');
  kindTag.className = 'tag';
  kindTag.textContent = kindLabel(trophy.kind);
  meta.append(kindTag);
  if (trophy.missable) {
    const miss = document.createElement('span');
    miss.className = 'tag missable';
    miss.textContent = '⚠ MISSABLE';
    meta.append(miss);
  }
  if (trophy.hidden) {
    const hid = document.createElement('span');
    hid.className = 'tag hidden-tag';
    hid.textContent = 'Hidden on PSN';
    meta.append(hid);
  }
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = 'Roadmap stage ' + trophy.stage;
  meta.append(stageTag);
  card.append(meta);

  if (!hiddenStory) {
    const preview = document.createElement('p');
    preview.className = 'trophy-guide-preview';
    preview.textContent = trophy.guide;
    card.append(preview);
  }

  card.addEventListener('click', (event) => {
    if (event.target === check) return;
    openDetail(trophy);
  });
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') openDetail(trophy);
  });
  check.addEventListener('click', (event) => {
    event.stopPropagation();
    toggleEarned(trophy);
  });
  return card;
}

function renderRoadmap() {
  const list = document.getElementById('roadmapList');
  list.replaceChildren();
  ROADMAP_STAGES.forEach((stage) => {
    const item = document.createElement('li');
    const title = document.createElement('strong');
    title.textContent = stage.title + ' — ' + stage.hours;
    const text = document.createElement('p');
    text.textContent = stage.text;
    item.append(title, text);
    list.append(item);
  });
}

function renderChecklist() {
  const visible = allTrophies.filter(trophyMatchesFilters);
  listEl.replaceChildren();
  if (visible.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'empty';
    empty.textContent = kindEl.value === 'online'
      ? 'No online trophies: every one of the 55 is single-player and offline. Try another kind.'
      : 'No trophies match these filters. Clear the search or widen the filters.';
    listEl.append(empty);
  } else {
    visible.forEach((trophy) => listEl.append(buildTrophyCard(trophy)));
  }
  resultCountEl.textContent = visible.length + ' of ' + allTrophies.length + ' shown';
  updateProgress();
}

function updateProgress() {
  const earned = allTrophies.filter((t) => earnedNames.has(t.name)).length;
  earnedCountEl.textContent = String(earned);
  totalCountEl.textContent = String(allTrophies.length);
  progressFillEl.style.width = allTrophies.length ? (earned / allTrophies.length * 100) + '%' : '0%';
  progressNoteEl.textContent = earned === allTrophies.length && allTrophies.length > 0
    ? 'Platinum earned — you are a Leonida Legend.'
    : 'The platinum is Vice Got a Price! — earn the other 54.';
}

function toggleEarned(trophy) {
  if (earnedNames.has(trophy.name)) earnedNames.delete(trophy.name);
  else earnedNames.add(trophy.name);
  saveProgress();
  renderChecklist();
  if (!detailEl.hidden) openDetail(trophy);
}

function openDetail(trophy) {
  const hiddenStory = trophyIsHiddenStory(trophy);
  detailBodyEl.replaceChildren();

  const heading = document.createElement('h3');
  heading.textContent = hiddenStory ? 'Hidden story trophy' : trophy.name;
  detailBodyEl.append(heading);

  const badgeLine = document.createElement('p');
  const badge = document.createElement('span');
  badge.className = 'grade-badge grade-' + trophy.grade;
  badge.textContent = gradeLabel(trophy.grade);
  badgeLine.append(badge);
  if (trophy.missable) {
    const warn = document.createElement('strong');
    warn.textContent = '  ⚠ MISSABLE — do this before the chapter ends (see the guide).';
    badgeLine.append(warn);
  }
  detailBodyEl.append(badgeLine);

  const desc = document.createElement('p');
  desc.textContent = hiddenStory ? 'Spoiler-safe mode is on. Earn this trophy to reveal its name and description.' : trophy.description;
  detailBodyEl.append(desc);

  const guideHeading = document.createElement('h4');
  guideHeading.textContent = 'Guide';
  const guide = document.createElement('p');
  guide.textContent = trophy.guide;
  detailBodyEl.append(guideHeading, guide);

  const sourcesBox = document.createElement('div');
  sourcesBox.className = 'sources';
  const sourcesHeading = document.createElement('h4');
  sourcesHeading.textContent = 'Sources — where each fact came from';
  sourcesBox.append(sourcesHeading);
  const sourcesList = document.createElement('ul');
  (trophy.sources ?? []).forEach((source) => {
    const item = document.createElement('li');
    item.textContent = source;
    sourcesList.append(item);
  });
  sourcesBox.append(sourcesList);
  const sourceNote = document.createElement('p');
  sourceNote.className = 'fine';
  sourceNote.textContent = 'Official names, descriptions and grades are shown as published. The guide text is written in my own words for this entry; the sources above were consulted, never copied.';
  sourcesBox.append(sourceNote);
  detailBodyEl.append(sourcesBox);

  const earnedButton = document.createElement('button');
  earnedButton.type = 'button';
  earnedButton.textContent = earnedNames.has(trophy.name) ? 'Mark as not earned' : 'Mark as earned';
  earnedButton.addEventListener('click', () => toggleEarned(trophy));
  detailBodyEl.append(earnedButton);

  detailEl.hidden = false;
  detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function exportProgress() {
  const payload = { game: 'Grand Theft Auto VI', exported: new Date().toISOString(), earned: [...earnedNames] };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'gta6-trophy-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    earnedNames = new Set(names.filter((name) => allTrophies.some((t) => t.name === name)));
    saveProgress();
    renderChecklist();
  } catch {
    alert('That file could not be imported. It should be a progress file exported by this tracker.');
  }
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  if (!response.ok) throw new Error('trophy data did not load');
  const data = await response.json();
  allTrophies = data.trophies ?? data;
}

document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earnedNames = new Set();
    saveProgress();
    renderChecklist();
  }
});
document.getElementById('closeDetail').addEventListener('click', () => {
  detailEl.hidden = true;
});
[searchEl, kindEl, gradeEl, hideEarnedEl, spoilerEl].forEach((el) => el.addEventListener('input', renderChecklist));

renderRoadmap();
loadTrophies()
  .then(renderChecklist)
  .catch(() => {
    listEl.replaceChildren();
    const error = document.createElement('p');
    error.className = 'empty';
    error.textContent = 'The trophy data could not be loaded. Serve app/ over HTTP (for example, node serve.ts) and reload.';
    listEl.append(error);
  });
