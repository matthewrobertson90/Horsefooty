// Run with: node tests/check.mjs
import { createRequire } from "module";
import assert from "assert/strict";
const require = createRequire(import.meta.url);
const { SEASONS, eraFor } = require("../js/data.js");
const { CLUBS } = require("../js/clubs.js");
const { horseMatches, clubMatches, horseClue } = require("../js/match.js");

// Every year from 1897 onwards, no gaps or duplicates.
SEASONS.forEach((s, i) => assert.equal(s.year, 1897 + i, `year gap at ${s.year}`));
assert.equal(SEASONS[0].year, 1897);
for (const s of SEASONS) {
  assert.ok(CLUBS[s.club], `unknown club ${s.club} in ${s.year}`);
  assert.ok(eraFor(s.year), `no era for ${s.year}`);
  assert.ok(horseMatches(s.horse, s.horse), `horse self-match ${s.horse}`);
  assert.ok(clubMatches(CLUBS[s.club].name, CLUBS[s.club]), `club self-match ${s.club}`);
}

// Premiership tallies (VFL/AFL, 1897–2025).
const count = {};
for (const s of SEASONS) {
  const k = { sydney: "southmelbourne", westernbulldogs: "footscray" }[s.club] || s.club;
  count[k] = (count[k] || 0) + 1;
}
assert.deepEqual(
  { carlton: 16, essendon: 16, collingwood: 16, hawthorn: 13, richmond: 13, melbourne: 13, geelong: 10, fitzroy: 8, southmelbourne: 5, brisbane: 5, northmelbourne: 4, westcoast: 4, footscray: 2, adelaide: 2, portadelaide: 1, stkilda: 1 },
  count
);

// Forgiving matching.
assert.ok(horseMatches("phar lap", "Phar Lap"));
assert.ok(horseMatches("pharlap", "Phar Lap"));
assert.ok(horseMatches("makybe deva", "Makybe Diva"));
assert.ok(horseMatches("gurners lane", "Gurner's Lane"));
assert.ok(horseMatches("gold & black", "Gold and Black"));
assert.ok(horseMatches("grafter", "The Grafter"));
assert.ok(!horseMatches("brow", "Brew"));
assert.ok(!horseMatches("", "Brew"));
assert.ok(clubMatches("Pies", CLUBS.collingwood));
assert.ok(clubMatches("st. kilda", CLUBS.stkilda));
assert.ok(clubMatches("Swans", CLUBS.southmelbourne));
assert.ok(!clubMatches("melbourne", CLUBS.northmelbourne));

// Clues.
assert.equal(horseClue("Phar Lap", 1), "_ _ _ _   _ _ _");
assert.equal(horseClue("Phar Lap", 2), "P _ _ _   L _ _");
assert.equal(horseClue("Phar Lap", 3), "P _ A _   L _ P");

console.log(`OK: ${SEASONS.length} seasons (${SEASONS[0].year}–${SEASONS.at(-1).year})`);
