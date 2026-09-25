/*
 * Premiership clubs: display name, accepted answers, nickname and guernsey design.
 * Guernseys are drawn in club colours by art.js — no club logos are used.
 * Design types: solid, stripes, hoops, sash, yoke, vee, band, panels.
 */
(function (root) {
  const CLUBS = {
    adelaide: {
      name: "Adelaide",
      nickname: "Crows",
      home: "Adelaide, SA",
      answers: ["adelaide", "adelaide crows", "crows"],
      colours: "navy, red and gold",
      jumper: { type: "hoops", colors: ["#002b5c", "#e21937", "#ffd200"], base: "#002b5c" },
    },
    brisbane: {
      name: "Brisbane Lions",
      nickname: "Lions",
      home: "Brisbane, QLD",
      answers: ["brisbane", "brisbane lions", "lions"],
      colours: "maroon, blue and gold",
      jumper: { type: "vee", colors: ["#7a003c", "#fdbe57", "#0055a3"], base: "#7a003c" },
    },
    carlton: {
      name: "Carlton",
      nickname: "Blues",
      home: "Carlton, VIC",
      answers: ["carlton", "carlton blues", "blues"],
      colours: "navy blue",
      jumper: { type: "solid", colors: ["#0e1e2d", "#ffffff"], base: "#0e1e2d" },
    },
    collingwood: {
      name: "Collingwood",
      nickname: "Magpies",
      home: "Collingwood, VIC",
      answers: ["collingwood", "collingwood magpies", "magpies", "pies"],
      colours: "black and white stripes",
      jumper: { type: "stripes", colors: ["#000000", "#ffffff"], base: "#000000" },
    },
    essendon: {
      name: "Essendon",
      nickname: "Bombers",
      home: "Essendon, VIC",
      answers: ["essendon", "essendon bombers", "bombers", "dons"],
      colours: "black with a red sash",
      jumper: { type: "sash", colors: ["#000000", "#cc2031"], base: "#000000" },
    },
    fitzroy: {
      name: "Fitzroy",
      nickname: "Maroons (later the Lions)",
      home: "Fitzroy, VIC",
      answers: ["fitzroy", "fitzroy lions", "fitzroy maroons", "roys", "maroons"],
      colours: "maroon and blue",
      jumper: { type: "yoke", colors: ["#6d1f3a", "#4a90d9"], base: "#6d1f3a" },
    },
    footscray: {
      name: "Footscray",
      nickname: "Bulldogs",
      home: "Footscray, VIC",
      answers: ["footscray", "footscray bulldogs", "bulldogs", "western bulldogs", "doggies", "dogs"],
      colours: "blue with red and white bands",
      jumper: { type: "band", colors: ["#014896", "#ffffff", "#e2002b"], base: "#014896" },
    },
    geelong: {
      name: "Geelong",
      nickname: "Cats",
      home: "Geelong, VIC",
      answers: ["geelong", "geelong cats", "cats"],
      colours: "navy and white hoops",
      jumper: { type: "hoops", colors: ["#001f3d", "#ffffff"], base: "#001f3d" },
    },
    hawthorn: {
      name: "Hawthorn",
      nickname: "Hawks",
      home: "Hawthorn, VIC",
      answers: ["hawthorn", "hawthorn hawks", "hawks"],
      colours: "brown and gold stripes",
      jumper: { type: "stripes", colors: ["#4d2004", "#fbbf15"], base: "#4d2004" },
    },
    melbourne: {
      name: "Melbourne",
      nickname: "Demons",
      home: "Melbourne, VIC",
      answers: ["melbourne", "melbourne demons", "demons", "dees", "redlegs"],
      colours: "navy with a red yoke",
      jumper: { type: "yoke", colors: ["#0f1131", "#cc2031"], base: "#0f1131" },
    },
    northmelbourne: {
      name: "North Melbourne",
      nickname: "Kangaroos",
      home: "North Melbourne, VIC",
      answers: ["north melbourne", "north", "kangaroos", "roos", "north melbourne kangaroos", "shinboners"],
      colours: "royal blue and white stripes",
      jumper: { type: "stripes", colors: ["#013b9f", "#ffffff"], base: "#013b9f" },
    },
    portadelaide: {
      name: "Port Adelaide",
      nickname: "Power",
      home: "Port Adelaide, SA",
      answers: ["port adelaide", "port", "power", "port adelaide power"],
      colours: "black, teal and white",
      jumper: { type: "vee", colors: ["#000000", "#008aab", "#ffffff"], base: "#000000" },
    },
    richmond: {
      name: "Richmond",
      nickname: "Tigers",
      home: "Richmond, VIC",
      answers: ["richmond", "richmond tigers", "tigers", "tiges"],
      colours: "black with a yellow sash",
      jumper: { type: "sash", colors: ["#000000", "#fed102"], base: "#000000" },
    },
    southmelbourne: {
      name: "South Melbourne",
      nickname: "Bloods (later the Swans)",
      home: "South Melbourne, VIC",
      note: "the club moved north and became the Sydney Swans",
      answers: ["south melbourne", "south", "bloods", "swans", "sydney", "sydney swans", "south melbourne swans"],
      colours: "white with a red vee",
      jumper: { type: "vee", colors: ["#ffffff", "#e1251b"], base: "#ffffff" },
    },
    stkilda: {
      name: "St Kilda",
      nickname: "Saints",
      home: "St Kilda, VIC",
      answers: ["st kilda", "saint kilda", "st kilda saints", "saints"],
      colours: "red, white and black panels",
      jumper: { type: "panels", colors: ["#ed0f05", "#ffffff", "#000000"], base: "#ffffff" },
    },
    sydney: {
      name: "Sydney",
      nickname: "Swans",
      home: "Sydney, NSW",
      answers: ["sydney", "sydney swans", "swans", "south melbourne", "bloods"],
      colours: "white with a red vee",
      jumper: { type: "vee", colors: ["#ffffff", "#e1251b"], base: "#ffffff" },
    },
    westcoast: {
      name: "West Coast",
      nickname: "Eagles",
      home: "Perth, WA",
      answers: ["west coast", "west coast eagles", "eagles", "weagles"],
      colours: "royal blue and gold",
      jumper: { type: "band", colors: ["#003087", "#f2a900", "#003087"], base: "#003087" },
    },
    westernbulldogs: {
      name: "Western Bulldogs",
      nickname: "Bulldogs",
      home: "Footscray, VIC",
      answers: ["western bulldogs", "bulldogs", "doggies", "dogs", "footscray", "footscray bulldogs"],
      colours: "blue with red and white bands",
      jumper: { type: "band", colors: ["#014896", "#ffffff", "#e2002b"], base: "#014896" },
    },
  };

  // Extra jumpers for the background parade (clubs without a flag in the quiz).
  const PARADE_EXTRAS = [
    { type: "vee", colors: ["#e02112", "#ffd200", "#e02112"], base: "#e02112" }, // Gold Coast-ish red & gold
    { type: "panels", colors: ["#f47920", "#4a4f55", "#ffffff"], base: "#4a4f55" }, // GWS-ish charcoal & orange
    { type: "solid", colors: ["#2a0d54", "#ffffff"], base: "#2a0d54" }, // Fremantle-ish purple
  ];

  const api = { CLUBS, PARADE_EXTRAS };
  root.HF = Object.assign(root.HF || {}, api);
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
