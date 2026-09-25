/*
 * Hand-drawn SVG art: galloping horses with jockeys in silks, guernseys in
 * club colours, footies and goalposts. Everything is inline SVG so the game
 * works offline and without any image files.
 */
(function (root) {
  let uid = 0;

  // A galloping thoroughbred with jockey. `silk` = [body, sleeves/cap].
  function horse({ coat = "#5a3418", silk = ["#e21937", "#ffffff"], number = "", width = 180, cls = "" } = {}) {
    const id = "h" + ++uid;
    const [silkA, silkB] = silk;
    const mane = shade(coat, -0.35);
    return `
<svg class="horse ${cls}" viewBox="0 0 200 130" width="${width}" aria-hidden="true">
  <defs>
    <linearGradient id="${id}c" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${shade(coat, 0.18)}"/><stop offset="1" stop-color="${shade(coat, -0.2)}"/>
    </linearGradient>
  </defs>
  <g class="legs-back" fill="${shade(coat, -0.25)}">
    <path class="leg lb1" d="M62 78 C54 92 44 100 30 104 L27 110 L36 110 C50 104 62 96 72 84 Z"/>
    <path class="leg lf1" d="M138 74 C146 88 156 96 170 100 L174 106 L165 107 C150 100 140 92 130 80 Z"/>
  </g>
  <path d="M30 66 C22 62 12 66 6 76 C14 72 20 72 26 74 C18 80 14 88 14 96 C22 86 28 80 36 76 Z" fill="${mane}"/>
  <path fill="url(#${id}c)" d="M34 64 C44 50 70 48 96 52 C118 55 132 52 142 44 C150 34 156 24 164 18 C168 14 174 12 178 14 L186 22 C192 28 196 34 194 38 C192 42 186 42 182 40 L172 38 C166 46 162 56 156 66 C150 78 140 84 126 86 C108 88 86 88 70 86 C54 84 40 80 34 64 Z"/>
  <path d="M164 18 C160 26 154 34 150 44 C156 36 162 30 168 26 Z" fill="${mane}"/>
  <circle cx="180" cy="24" r="1.8" fill="#111"/>
  <path d="M172 14 L170 6 L176 12 Z" fill="${shade(coat, -0.2)}"/>
  <g class="legs-front" fill="url(#${id}c)">
    <path class="leg lb2" d="M70 80 C66 96 60 108 52 116 L54 122 L62 120 C70 110 78 98 84 84 Z"/>
    <path class="leg lf2" d="M128 80 C134 96 146 104 160 110 L162 116 L154 117 C140 110 128 100 120 86 Z"/>
  </g>
  <!-- saddle cloth -->
  <path d="M88 52 L118 54 L116 76 L90 74 Z" fill="#fff" stroke="#222" stroke-width="1"/>
  <text x="103" y="70" text-anchor="middle" font-size="14" font-weight="800" font-family="Georgia, serif" fill="#111">${number}</text>
  <!-- jockey -->
  <path d="M104 50 C98 44 96 36 100 30 L116 26 C120 34 118 44 112 50 Z" fill="${silkA}" stroke="#222" stroke-width="1"/>
  <path d="M102 34 L96 44 L108 50" fill="none" stroke="${silkB}" stroke-width="5" stroke-linecap="round"/>
  <path d="M112 30 L128 34 L134 40" fill="none" stroke="${silkB}" stroke-width="5" stroke-linecap="round"/>
  <path d="M104 52 L110 60 L120 58" fill="none" stroke="#f3efe6" stroke-width="6" stroke-linecap="round"/>
  <circle cx="120" cy="20" r="7" fill="#e8c4a0"/>
  <path d="M112 19 C112 11 128 10 128 18 L131 19 L112 20 Z" fill="${silkB}" stroke="#222" stroke-width="1"/>
  <path d="M134 40 L150 34" stroke="#333" stroke-width="1.2"/>
</svg>`;
  }

  // A guernsey in club colours. `mystery` hides it behind a question mark.
  function jumper(j, { width = 120, number = "", mystery = false, cls = "" } = {}) {
    const id = "j" + ++uid;
    const shape = "M30 8 L50 2 C56 12 74 12 80 2 L100 8 L124 34 L108 50 L96 40 L96 136 L34 136 L34 40 L22 50 L6 34 Z";
    if (mystery) {
      return `<svg class="jumper ${cls}" viewBox="0 0 130 140" width="${width}" aria-hidden="true">
  <path d="${shape}" fill="#1b2a1b" stroke="#c9b37e" stroke-width="3" stroke-dasharray="6 5"/>
  <text x="65" y="95" text-anchor="middle" font-size="58" font-family="Georgia, serif" font-weight="900" fill="#c9b37e">?</text></svg>`;
    }
    const [a, b, c] = j.colors;
    let pattern = "";
    switch (j.type) {
      case "stripes":
        for (let x = 0; x < 130; x += 20) pattern += `<rect x="${x + 10}" y="0" width="10" height="140" fill="${b}"/>`;
        break;
      case "hoops":
        for (let y = 20, k = 0; y < 140; y += 22, k++) pattern += `<rect x="0" y="${y}" width="130" height="11" fill="${c && k % 2 ? c : b}"/>`;
        break;
      case "sash":
        pattern = `<path d="M30 0 L56 0 L130 120 L130 140 L104 140 L0 20 L0 0 Z" fill="${b}"/>`;
        break;
      case "yoke":
        pattern = `<path d="M0 0 L130 0 L130 44 C100 52 30 52 0 44 Z" fill="${b}"/>`;
        break;
      case "vee":
        pattern = `<path d="M20 0 L65 64 L110 0 L96 0 L65 42 L34 0 Z" fill="${b}"/>` + (c ? `<path d="M34 0 L65 42 L96 0 L88 0 L65 30 L42 0 Z" fill="${c}"/>` : "");
        break;
      case "band":
        pattern = `<rect x="0" y="54" width="130" height="16" fill="${b}"/>` + (c ? `<rect x="0" y="62" width="130" height="8" fill="${c}"/>` : "");
        break;
      case "panels":
        pattern = `<rect x="0" y="0" width="52" height="140" fill="${a}"/><rect x="78" y="0" width="52" height="140" fill="${c}"/>`;
        break;
      default:
        pattern = `<path d="M50 2 C56 12 74 12 80 2 L80 6 C72 16 58 16 50 6 Z" fill="${b}"/>`;
    }
    const numberFill = luminance(j.type === "stripes" || j.type === "panels" ? "#000" : j.base) > 0.5 ? "#111" : "#fff";
    return `<svg class="jumper ${cls}" viewBox="0 0 130 140" width="${width}" aria-hidden="true">
  <defs><clipPath id="${id}"><path d="${shape}"/></clipPath>
  <linearGradient id="${id}s" x1="0" x2="1"><stop offset="0" stop-color="#000" stop-opacity=".18"/><stop offset=".5" stop-color="#fff" stop-opacity=".08"/><stop offset="1" stop-color="#000" stop-opacity=".22"/></linearGradient></defs>
  <g clip-path="url(#${id})"><rect width="130" height="140" fill="${j.base || a}"/>${pattern}<rect width="130" height="140" fill="url(#${id}s)"/></g>
  <path d="${shape}" fill="none" stroke="rgba(0,0,0,.55)" stroke-width="2"/>
  ${number ? `<text x="65" y="100" text-anchor="middle" font-size="34" font-weight="900" font-family="Arial Black, Arial, sans-serif" fill="${numberFill}" stroke="${numberFill === "#fff" ? "#000" : "#fff"}" stroke-width="1.5" paint-order="stroke">${number}</text>` : ""}
</svg>`;
  }

  function footy({ width = 70, cls = "" } = {}) {
    return `<svg class="footy ${cls}" viewBox="0 0 120 70" width="${width}" aria-hidden="true">
  <defs><radialGradient id="fb${++uid}" cx=".4" cy=".35" r=".8"><stop offset="0" stop-color="#e0473a"/><stop offset="1" stop-color="#7e1510"/></radialGradient></defs>
  <ellipse cx="60" cy="35" rx="56" ry="31" fill="url(#fb${uid})" stroke="#4a0c08" stroke-width="2"/>
  <path d="M8 35 C30 22 90 22 112 35" fill="none" stroke="#4a0c08" stroke-width="1.5" opacity=".6"/>
  <path d="M8 35 C30 48 90 48 112 35" fill="none" stroke="#4a0c08" stroke-width="1.5" opacity=".6"/>
  <path d="M40 14 L80 14" stroke="#f7f1e1" stroke-width="3"/>
  ${[44, 51, 58, 65, 72, 78].map((x) => `<path d="M${x} 10 L${x} 18" stroke="#f7f1e1" stroke-width="2.4" stroke-linecap="round"/>`).join("")}
</svg>`;
  }

  function goalposts({ width = 160, cls = "" } = {}) {
    return `<svg class="goalposts ${cls}" viewBox="0 0 160 120" width="${width}" aria-hidden="true">
  <g fill="#f5f2ea" stroke="#9c9480" stroke-width="1">
    <rect x="14" y="40" width="5" height="80" rx="2"/><rect x="56" y="6" width="6" height="114" rx="2"/>
    <rect x="98" y="6" width="6" height="114" rx="2"/><rect x="141" y="40" width="5" height="80" rx="2"/>
  </g>
  <g fill="#c62828"><rect x="56" y="96" width="6" height="18"/><rect x="98" y="96" width="6" height="18"/></g>
</svg>`;
  }

  function cup({ width = 60, cls = "" } = {}) {
    return `<svg class="cup ${cls}" viewBox="0 0 80 100" width="${width}" aria-hidden="true">
  <defs><linearGradient id="cg${++uid}" x1="0" x2="1"><stop offset="0" stop-color="#8a6b1f"/><stop offset=".45" stop-color="#ffe9a3"/><stop offset="1" stop-color="#9c7a22"/></linearGradient></defs>
  <g fill="url(#cg${uid})" stroke="#5c4410" stroke-width="1.2">
    <path d="M18 14 L62 14 C62 40 54 54 40 56 C26 54 18 40 18 14 Z"/>
    <path d="M18 20 C4 20 4 40 20 42 L21 37 C11 35 11 25 18 25 Z"/><path d="M62 20 C76 20 76 40 60 42 L59 37 C69 35 69 25 62 25 Z"/>
    <rect x="36" y="56" width="8" height="18"/><path d="M26 74 L54 74 L58 86 L22 86 Z"/><rect x="18" y="86" width="44" height="8" rx="2"/>
    <ellipse cx="40" cy="14" rx="22" ry="4"/>
  </g>
</svg>`;
  }

  function flag({ width = 60, color = "#c9a227", cls = "" } = {}) {
    return `<svg class="flag ${cls}" viewBox="0 0 80 100" width="${width}" aria-hidden="true">
  <rect x="8" y="4" width="4" height="94" fill="#ddd" stroke="#777" stroke-width=".8"/>
  <path class="flag-cloth" d="M12 8 C30 2 44 16 72 8 L72 46 C44 54 30 40 12 46 Z" fill="${color}" stroke="rgba(0,0,0,.4)"/>
  <text x="42" y="32" text-anchor="middle" font-size="11" font-weight="800" font-family="Georgia, serif" fill="#fff" stroke="#000" stroke-width=".4">FLAG</text>
</svg>`;
  }

  // --- colour helpers ---
  function hexToRgb(h) {
    h = h.replace("#", "");
    if (h.length === 3) h = [...h].map((c) => c + c).join("");
    const n = parseInt(h, 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  function shade(hex, amt) {
    const [r, g, b] = hexToRgb(hex).map((v) => Math.round(Math.max(0, Math.min(255, amt < 0 ? v * (1 + amt) : v + (255 - v) * amt))));
    return "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("");
  }
  function luminance(hex) {
    const [r, g, b] = hexToRgb(hex);
    return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  }

  // Deterministic per-year randomness so each year always gets the same horse.
  function seeded(seed) {
    let s = seed * 9301 + 49297;
    return () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  }

  const COATS = ["#5a3418", "#3b2210", "#7a4a22", "#241710", "#8b5a2b", "#6e6e6e", "#4a2c17", "#1c1c1c"];
  const SILKS = [
    ["#e21937", "#ffffff"], ["#0055a3", "#ffd200"], ["#1a7f3c", "#ffffff"], ["#ffd200", "#111111"],
    ["#6b2c91", "#f7a800"], ["#ffffff", "#c62828"], ["#f47920", "#0e1e2d"], ["#00a3ad", "#ffffff"],
    ["#111111", "#e8e8e8"], ["#c2185b", "#ffeb3b"], ["#2e7d32", "#fdd835"], ["#1565c0", "#e53935"],
  ];

  function horseFor(year, opts = {}) {
    const r = seeded(year);
    return horse({ coat: COATS[Math.floor(r() * COATS.length)], silk: SILKS[Math.floor(r() * SILKS.length)], ...opts });
  }

  const api = { horse, horseFor, jumper, footy, goalposts, cup, flag, shade, COATS, SILKS };
  root.HF = Object.assign(root.HF || {}, { art: api });
  if (typeof module !== "undefined") module.exports = api;
})(typeof window !== "undefined" ? window : globalThis);
