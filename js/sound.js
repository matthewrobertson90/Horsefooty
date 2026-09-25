/*
 * Tiny synthesised sound effects (no audio files): a correct-answer ding,
 * a wrong-answer thud, the starting bell, and the final siren.
 */
(function (root) {
  let ctx = null;
  let muted = false;
  try { muted = localStorage.getItem("hf-muted") === "1"; } catch (e) {}

  function ac() {
    if (!ctx) {
      const C = root.AudioContext || root.webkitAudioContext;
      if (!C) return null;
      ctx = new C();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, { type = "sine", gain = 0.15, when = 0, slideTo = null } = {}) {
    if (muted) return;
    const a = ac();
    if (!a) return;
    const t = a.currentTime + when;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.linearRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(gain, t + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(a.destination);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  const sound = {
    get muted() { return muted; },
    toggle() {
      muted = !muted;
      try { localStorage.setItem("hf-muted", muted ? "1" : "0"); } catch (e) {}
      return muted;
    },
    correct() { tone(880, 0.12, { type: "triangle" }); tone(1320, 0.18, { type: "triangle", when: 0.08 }); },
    partial() { tone(660, 0.16, { type: "triangle" }); },
    wrong() { tone(140, 0.18, { type: "square", gain: 0.06 }); },
    clue() { tone(520, 0.08, { type: "sine", gain: 0.08 }); },
    year() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, { type: "triangle", when: i * 0.06, gain: 0.1 })); },
    bell() { for (let i = 0; i < 6; i++) tone(1400, 0.09, { type: "square", when: i * 0.1, gain: 0.05 }); },
    siren() { tone(420, 2.4, { type: "sawtooth", gain: 0.12, slideTo: 620 }); tone(425, 2.4, { type: "sawtooth", gain: 0.06, slideTo: 610 }); },
  };

  root.HF = Object.assign(root.HF || {}, { sound });
})(typeof window !== "undefined" ? window : globalThis);
