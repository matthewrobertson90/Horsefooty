# Cups & Flags 🏇🏉

A timed speed quiz through every year since the VFL began. For each year from **1897** to the most recent completed season, name:

1. the **Melbourne Cup** winner, and
2. the **VFL/AFL premiership** club.

Get both and the year is complete. The goal is to run through every year in one sitting as fast as you can.

## Scoring

| Result | Meaning |
| --- | --- |
| ✓ full tick | Both answers right with no clues |
| ◐ partial tick | Both answers right, but at least one clue used |
| ✗ miss | At least one answer revealed (+30s on the clock) |

**Clues** (button, or type `?` in the box):
- Horse: letter count → first letters → half the letters
- Club: the guernsey in club colours → the nickname and home

**Reveal** (button, or type `!`) shows the answer, marks the item ✗ and adds 30 seconds.

Correct answers lock in as you type. Small typos in a horse's name are forgiven when you press **Enter** (for example "Makybe Deva"). Club nicknames work too ("Pies", "Dees", "Swans"). The clock keeps running if you refresh, and you can resume the run from the title screen. Your ten best full runs are saved in the browser. There's also a practice mode for one decade at a time.

## Running it

It's plain HTML, CSS and JavaScript, with no build step and no dependencies. Open `index.html` in a browser, or serve the folder:

```sh
npx http-server .   # or: python3 -m http.server
```

It can be hosted anywhere static, such as GitHub Pages.

## Visuals

All artwork is inline SVG drawn in code: galloping horses with jockeys in silks, guernseys in club colours, footies, goalposts, the Cup and the flag. No club logos or image files are used. The look changes by era: sepia for the early VFL and war years, faded post-war colour, saturated colour-TV tones for the 70s and 80s, and full colour for the modern game.

## Project layout

```
index.html        screens: title, game, finish
css/style.css     styling, era tones, animations
js/data.js        every season: year, Cup winner, premier (+ trivia, eras)
js/clubs.js       clubs: names, accepted answers, nicknames, guernsey designs
js/match.js       answer matching and clue generation
js/art.js         SVG art (horses, guernseys, footy, posts, cup, flag)
js/sound.js       synthesised sound effects (Web Audio, no files)
js/game.js        game flow, timer, scoring, leaderboard
tests/check.mjs   data and matching checks: node tests/check.mjs
```

### Adding a new year

After each Melbourne Cup, add a line to `SEASONS` in `js/data.js`:

```js
[2026, "Horse Name", "clubkey"],
```

Then run `node tests/check.mjs`. Update the premiership tally test if needed.
