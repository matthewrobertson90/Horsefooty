/*
 * Answer checking and clue generation.
 */
(function (root) {
  function normalize(s) {
    return String(s || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/&/g, " and ")
      .replace(/['’`]/g, "")
      .replace(/[^a-z0-9 ]+/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .replace(/^the /, "");
  }

  const squash = (s) => normalize(s).replace(/ /g, "");

  function levenshtein(a, b) {
    if (a === b) return 0;
    const m = a.length, n = b.length;
    if (!m) return n;
    if (!n) return m;
    let prev = Array.from({ length: n + 1 }, (_, j) => j);
    for (let i = 1; i <= m; i++) {
      const cur = [i];
      for (let j = 1; j <= n; j++) {
        cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      prev = cur;
    }
    return prev[n];
  }

  // How many typos we forgive in a horse name, by length.
  const tolerance = (len) => (len >= 11 ? 2 : len >= 7 ? 1 : 0);

  // `forgiving` allows a typo or two (used when the player presses Enter).
  function horseMatches(guess, answer, forgiving = true) {
    const g = squash(guess), a = squash(answer);
    if (!g) return false;
    if (g === a) return true;
    return forgiving && levenshtein(g, a) <= tolerance(a.length);
  }

  function clubMatches(guess, club) {
    const g = normalize(guess);
    if (!g) return false;
    return club.answers.some((ans) => normalize(ans) === g || squash(ans) === squash(guess));
  }

  // Horse clue ladder: word shape -> first letters -> every other letter.
  function horseClue(name, level) {
    const words = name.split(" ");
    return words
      .map((w) =>
        [...w]
          .map((ch, i) => {
            if (!/[a-z]/i.test(ch)) return ch;
            if (level >= 2 && i === 0) return ch.toUpperCase();
            if (level >= 3 && i % 2 === 0) return ch.toUpperCase();
            return "_";
          })
          .join(" ")
      )
      .join("   ");
  }

  const HORSE_CLUE_LABELS = ["Letter count", "First letters", "Half the letters"];
  const CLUB_CLUE_LABELS = ["The guernsey", "The nickname"];

  const api = { normalize, levenshtein, horseMatches, clubMatches, horseClue, HORSE_CLUE_LABELS, CLUB_CLUE_LABELS };
  root.HF = Object.assign(root.HF || {}, api);
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
