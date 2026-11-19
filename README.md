[![make.fun bounty](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Rank](https://make.fun/badge/gta6-trophy-guide-01/jxjxjsj857-alt/gta6-trophy-guide-makefun/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01)
[![Reward](https://make.fun/badge/gta6-trophy-guide-01/jxjxjsj857-alt/gta6-trophy-guide-makefun/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01)

# Leonida Legends — GTA VI Trophy Guide & Tracker

An offline guide and tracker for all **55 Grand Theft Auto VI PlayStation 5 trophies** (1 platinum, 2 gold, 6 silver, 46 bronze, 28 hidden), built for the [make.fun GTA 6 trophy guide bounty](https://make.fun/bounty/gta6-trophy-guide-01).

## What it is

- **Every trophy** with its official name, description and grade exactly as published (via Exophase and PSNProfiles), plus a guide written in my own words for this entry — what to do, where and how, and when it can be missed.
- **Sources named beside every guide.** Each trophy's guide cites the published guide its facts came from (PowerPyx, Exophase, PSNProfiles, GTABase, KeenGamer). Sources are cited, never copied. Where a step is read from the official description rather than confirmed in play, the guide says so — GTA VI launches 19 November 2026, and some hidden trophies' exact triggers were not yet pinned down when this guide was written.
- **Roadmap to the platinum** in four stages, built from the official descriptions: story chapters and missions, side-character finales, collectible and activity counts, then the 100% checklist. PowerPyx rates the set 4/10 and about 200 hours.
- **One missable trophy, clearly flagged:** *Positive Mental Attitude* (meditate at every spot). The first meditation, in Chapter 1 after Down to Earth, is reported as gone after that chapter — the guide tells you exactly when to grab it.
- **Tracker:** checklist with progress saved in localStorage, export to file and import back, filters by kind (story, missable, collectibles, activities, online) and by grade, text search, a spoiler setting that hides the names and descriptions of un-earned story trophies, and a per-trophy guide panel showing the guide and its sources.

## Honest notes

- There are **no online trophies** in this list, so the Online filter shows none — that is the answer, not a missing feature.
- Keep cheats off during a trophy run: published coverage reports cheats disable trophies and saving.
- No Rockstar logo, official artwork, box art or game screenshots are used anywhere. The look is original CSS art and typography.

## Run it

```sh
node serve.ts
```

Then open http://localhost:8080. The app is plain static files under `app/` with no build step and no network requests at runtime — it works with the network off.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `app/` and `screenshots/` to the output folder and writes `out/dossier.json` with the vendored make.fun library (`vendor/makefun-frontend.ts`, unchanged).

## Layout

- `app/index.html` — page structure: roadmap, missables, checklist, guide panel, about.
- `app/app.js` — loads the trophy data, renders the checklist and roadmap, saves progress, export/import.
- `app/style.css` — the original Vice City sunset look (pure CSS, no images or web fonts).
- `app/data/trophies.json` — all 55 trophies: official name, description, grade, hidden flag, kind, missable flag, roadmap stage, guide, and sources.
- `screenshots/` — real renders of the app running in a browser.

## License

MIT — see [LICENSE](LICENSE).
