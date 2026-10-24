// ===================== AUDIO: seven dark-ambient day themes, a descent theme, quiet effects =====================
const AU = {
  ctx: null,
  on: { music: true, sfx: true },
  timer: null,
  next: 0,
  step: 0,
  ks: {},
  noise: null,
  sfxAt: 0,
  cur: null,
  want: null, // the theme that should be playing
  changing: null, // a change of theme under way (its epoch)
  cueOnWake: null, // the cue of a change asked for while the sound slept, to be played as it wakes (musicCatchUp)
  playlist: [],
  epoch: 0
};
try {
  const p = JSON.parse(localStorage.getItem('kutha-audio') || 'null');
  if (p) AU.on = { music: !!p.music, sfx: !!p.sfx };
} catch (e) {
  /* storage unavailable */
}
function auSave() {
  try {
    localStorage.setItem('kutha-audio', JSON.stringify(AU.on));
  } catch (e) {
    /* ignore */
  }
}
const MAQ = {
  bayati: [0, 150, 300, 500, 700, 800, 1000],
  kurd: [0, 100, 300, 500, 700, 800, 1000],
  hijaz: [0, 100, 400, 500, 700, 800, 1000],
  saba: [0, 150, 300, 400, 700, 800, 1000],
  nahawand: [0, 200, 300, 500, 700, 800, 1100],
  rast: [0, 200, 350, 500, 700, 900, 1050]
};
let SCL = MAQ.bayati,
  ROOT = 293.66;
const fq = (deg, oct = 0) => {
  const o = Math.floor(deg / 7),
    i = deg - o * 7;
  return ROOT * Math.pow(2, (SCL[i] + 1200 * (o + oct)) / 1200);
};
const rnd = () => Math.random();

function auInit() {
  if (AU.ctx) return true;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return false;
  try {
    AU.ctx = new AC();
  } catch (e) {
    return false;
  }
  const c = AU.ctx;
  AU.master = c.createGain();
  AU.master.gain.value = 0.9;
  AU.master.connect(c.destination);
  AU.rev = c.createConvolver();
  AU.rev.buffer = impulse(3.2);
  AU.rev.connect(AU.master);
  AU.mbus = c.createGain();
  AU.mbus.gain.value = 0.0001;
  AU.mlp = c.createBiquadFilter();
  AU.mlp.type = 'lowpass';
  AU.mlp.frequency.value = 3200;
  AU.mbus.connect(AU.mlp);
  AU.mlp.connect(AU.master);
  const mw = c.createGain();
  mw.gain.value = 0.42;
  AU.mlp.connect(mw);
  mw.connect(AU.rev);
  AU.sbus = c.createGain();
  AU.sbus.gain.value = 0.5;
  AU.sbus.connect(AU.master);
  const sw = c.createGain();
  sw.gain.value = 0.25;
  AU.sbus.connect(sw);
  sw.connect(AU.rev);
  const n = c.createBuffer(1, c.sampleRate * 2, c.sampleRate),
    d = n.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
  AU.noise = n;
  const s = c.createBufferSource();
  s.buffer = c.createBuffer(1, 1, 22050);
  s.connect(c.destination);
  s.start(0);
  return true;
}
function impulse(sec) {
  const c = AU.ctx,
    len = Math.floor(c.sampleRate * sec),
    b = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = b.getChannelData(ch);
    for (let i = 0; i < len; i++) d[i] = (rnd() * 2 - 1) * Math.pow(1 - i / len, 2.6);
  }
  return b;
}
// ---------- voices ----------
function ksBuf(f) {
  const key = Math.round(f * 10);
  if (AU.ks[key]) return AU.ks[key];
  const c = AU.ctx,
    sr = c.sampleRate,
    n = Math.floor(sr * 2.4),
    b = c.createBuffer(1, n, sr),
    d = b.getChannelData(0);
  const p = Math.max(2, Math.round(sr / f)),
    r = new Float32Array(p);
  let prev = 0;
  for (let i = 0; i < p; i++) {
    prev = prev * 0.45 + (rnd() * 2 - 1) * 0.55;
    r[i] = prev;
  }
  let j = 0;
  for (let i = 0; i < n; i++) {
    const a = r[j],
      nx = r[(j + 1) % p];
    d[i] = a * 0.7;
    r[j] = (a + nx) * 0.4986;
    j = (j + 1) % p;
  }
  return (AU.ks[key] = b);
}
function pluck(f, t, v, bus, cut = 2400) {
  const c = AU.ctx,
    s = c.createBufferSource(),
    lp = c.createBiquadFilter(),
    g = c.createGain();
  s.buffer = ksBuf(f);
  lp.type = 'lowpass';
  lp.frequency.value = cut;
  g.gain.value = v;
  s.connect(lp);
  lp.connect(g);
  g.connect(bus);
  s.start(t);
  s.stop(t + 2.4);
}
function glass(f, t, v, dur, bus) {
  const c = AU.ctx,
    o = c.createOscillator(),
    o2 = c.createOscillator(),
    g = c.createGain(),
    g2 = c.createGain();
  o.type = 'sine';
  o.frequency.value = f;
  o2.type = 'sine';
  o2.frequency.value = f * 3.01;
  g2.gain.value = 0.16;
  o.connect(g);
  o2.connect(g2);
  g2.connect(g);
  g.connect(bus);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.03);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.start(t);
  o2.start(t);
  o.stop(t + dur + 0.05);
  o2.stop(t + dur + 0.05);
}
function ney(f, t, dur, v, bus) {
  const c = AU.ctx,
    o = c.createOscillator(),
    o2 = c.createOscillator(),
    vib = c.createOscillator(),
    vg = c.createGain(),
    g2 = c.createGain(),
    g = c.createGain();
  o.type = 'sine';
  o.frequency.value = f;
  o2.type = 'triangle';
  o2.frequency.value = f * 2;
  g2.gain.value = 0.1;
  vib.frequency.value = 4.6;
  vg.gain.value = f * 0.004;
  vib.connect(vg);
  vg.connect(o.frequency);
  vg.connect(o2.frequency);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(v, t + 0.4);
  g.gain.setValueAtTime(v, t + Math.max(0.45, dur - 0.5));
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.4);
  const nz = c.createBufferSource(),
    bp = c.createBiquadFilter(),
    ng = c.createGain();
  nz.buffer = AU.noise;
  nz.loop = true;
  bp.type = 'bandpass';
  bp.frequency.value = f * 2;
  bp.Q.value = 2;
  ng.gain.value = 0.2;
  o.connect(g);
  o2.connect(g2);
  g2.connect(g);
  nz.connect(bp);
  bp.connect(ng);
  ng.connect(g);
  g.connect(bus);
  [o, o2, vib, nz].forEach(x => {
    x.start(t);
    x.stop(t + dur + 0.5);
  });
}
function dum(t, v, bus, hi = 120) {
  const c = AU.ctx,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(hi, t);
  o.frequency.exponentialRampToValueAtTime(hi * 0.42, t + 0.22);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.5);
}
function noiseHit(t, v, bus, freq, q, len) {
  const c = AU.ctx,
    s = c.createBufferSource(),
    bp = c.createBiquadFilter(),
    g = c.createGain();
  s.buffer = AU.noise;
  bp.type = 'bandpass';
  bp.frequency.value = freq;
  bp.Q.value = q;
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  s.connect(bp);
  bp.connect(g);
  g.connect(bus);
  s.start(t, rnd() * 1.2);
  s.stop(t + len + 0.02);
}
function bell(f, t, v, bus) {
  const c = AU.ctx;
  [
    [1, 1, 2.6],
    [2.76, 0.4, 1.2],
    [5.4, 0.18, 0.6]
  ].forEach(([m, a, len]) => {
    const o = c.createOscillator(),
      g = c.createGain();
    o.type = 'sine';
    o.frequency.value = f * m;
    g.gain.setValueAtTime(v * a, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + len);
    o.connect(g);
    g.connect(bus);
    o.start(t);
    o.stop(t + len + 0.05);
  });
}
function udu(t, v, bus, k = 1) {
  const c = AU.ctx,
    o = c.createOscillator(),
    g = c.createGain();
  o.type = 'sine';
  o.frequency.setValueAtTime(210 * k, t);
  o.frequency.exponentialRampToValueAtTime(92 * k, t + 0.18);
  g.gain.setValueAtTime(v, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
  o.connect(g);
  g.connect(bus);
  o.start(t);
  o.stop(t + 0.32);
  noiseHit(t, v * 0.25, bus, 900, 1, 0.05);
}
// ---------- continuous layers: each returns a stop function ----------
function layer(v) {
  const g = AU.ctx.createGain();
  g.gain.value = 0.0001;
  g.gain.setTargetAtTime(v, AU.ctx.currentTime, 1.8);
  g.connect(AU.mbus);
  return g;
}
function drone(fs, v, cut, type) {
  const c = AU.ctx,
    g = layer(v),
    lp = c.createBiquadFilter();
  lp.type = 'lowpass';
  lp.frequency.value = cut;
  lp.connect(g);
  const os = fs.map((f, i) => {
    const o = c.createOscillator();
    o.type = type || (i % 2 ? 'sine' : 'triangle');
    o.frequency.value = f;
    o.detune.value = (i - 1) * 5;
    o.connect(lp);
    o.start();
    return o;
  });
  const lfo = c.createOscillator(),
    lg = c.createGain();
  lfo.frequency.value = 0.06;
  lg.gain.value = cut * 0.35;
  lfo.connect(lg);
  lg.connect(lp.frequency);
  lfo.start();
  os.push(lfo);
  return () => {
    g.gain.setTargetAtTime(0.0001, c.currentTime, 0.5);
    os.forEach(o => o.stop(c.currentTime + 3));
  };
}
function hiss(v, f0, q, rate) {
  const c = AU.ctx,
    s = c.createBufferSource(),
    bp = c.createBiquadFilter(),
    g = layer(v),
    lfo = c.createOscillator(),
    lg = c.createGain();
  s.buffer = AU.noise;
  s.loop = true;
  bp.type = 'bandpass';
  bp.frequency.value = f0;
  bp.Q.value = q;
  lfo.frequency.value = rate;
  lg.gain.value = f0 * 0.5;
  lfo.connect(lg);
  lg.connect(bp.frequency);
  s.connect(bp);
  bp.connect(g);
  s.start();
  lfo.start();
  return () => {
    g.gain.setTargetAtTime(0.0001, c.currentTime, 0.5);
    s.stop(c.currentTime + 3);
    lfo.stop(c.currentTime + 3);
  };
}
const both =
  (...fs) =>
  () =>
    fs.forEach(f => {
      try {
        f();
      } catch (e) {
        /* already stopped */
      }
    });
// ---------- melody material ----------
const RHY = [
  [1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 0],
  [1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0],
  [1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0],
  [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0]
];
function motif(start, end) {
  const r = RHY[Math.floor(rnd() * RHY.length)];
  let d = start,
    last = -1;
  const out = [];
  r.forEach((on, i) => {
    if (!on) {
      out.push(null);
      return;
    }
    last = i;
    d = Math.max(-1, Math.min(9, d + [-2, -1, -1, 0, 1, 1, 2][Math.floor(rnd() * 7)]));
    out.push(d);
  });
  if (last >= 0) out[last] = end;
  return out;
}
const firstOf = row => {
  const x = row.find(v => v !== null);
  return x === undefined ? 0 : x;
};
// ---------- the tracks ----------
const TRACKS = {
  bayati: {
    scale: 'bayati',
    root: 293.66,
    dur: 0.44,
    song: () => [motif(2, 4), motif(4, 0), motif(2, 4), motif(2, 0)],
    init: () => drone([fq(0, -2), fq(4, -2), fq(0, -1)], 0.06, 560),
    tick(k, t, cur, b) {
      const ph = Math.floor(k / 16) % 4,
        i = k % 16,
        n = cur.song[ph][i];
      if (n !== null) pluck(fq(n), t, 0.24, b);
      if (i % 8 === 0) pluck(fq(i === 0 ? 0 : ph % 2 ? 4 : 3, -1), t, 0.22, b);
      if (i % 8 === 0 || i % 8 === 3) dum(t, 0.12, b);
      if (i % 8 === 6) noiseHit(t, 0.03, b, 2400, 1.2, 0.08);
      if (i === 0 && ph % 2 === 1) ney(fq(firstOf(cur.song[ph])), t, 2.6, 0.035, b);
    }
  },
  river: {
    scale: 'kurd',
    root: 293.66,
    dur: 0.62,
    song: () => [
      [4, 3, 2, 0],
      [4, 3, 5, 4],
      [2, 1, 0, -1],
      [4, 3, 2, 0]
    ],
    init: () => both(drone([fq(0, -2), fq(0, -3)], 0.07, 300), hiss(0.05, 700, 0.7, 0.11)),
    tick(k, t, cur, b) {
      const bar = Math.floor(k / 16) % 4,
        i = k % 16,
        pos = [0, 3, 6, 10].indexOf(i);
      if (pos >= 0) glass(fq(cur.song[bar][pos]), t, 0.1, 3.4, b);
      if (i === 0 && bar % 2 === 0) pluck(fq(0, -1), t, 0.18, b);
      if (k % 64 === 40) bell(fq(4, -1), t, 0.035, b);
      if (k % 64 === 63 && rnd() < 0.5) {
        const r = cur.song[Math.floor(rnd() * 4)];
        r[1 + Math.floor(rnd() * 3)] = Math.max(-1, Math.min(6, r[0] + Math.floor(rnd() * 3) - 1));
      }
    }
  },
  hijaz: {
    scale: 'hijaz',
    root: 293.66,
    dur: 0.5,
    song: () => [motif(4, 0), motif(2, 4), motif(4, 1), motif(2, 0)],
    init: () => drone([fq(0, -1), fq(4, -1), fq(0, -2)], 0.035, 650, 'sawtooth'),
    tick(k, t, cur, b) {
      const ph = Math.floor(k / 16) % 4,
        i = k % 16,
        n = cur.song[ph][i];
      if (n !== null && i % 2 === 0) {
        pluck(fq(n, 1), t, 0.11, b, 4200);
        pluck(fq(n, 1), t + 0.09, 0.07, b, 4200);
      }
      if (i === 0) pluck(fq(0, -1), t, 0.2, b);
      if (i === 8) pluck(fq(4, -2), t, 0.18, b);
    }
  },
  saba: {
    scale: 'saba',
    root: 293.66,
    dur: 0.72,
    song: () => [motif(2, 0), motif(3, 2), motif(2, 0)],
    init: () => both(drone([fq(0, -1), fq(4, -1)], 0.03, 480, 'sawtooth'), drone([fq(0, -2)], 0.05, 200)),
    tick(k, t, cur, b) {
      const ph = Math.floor(k / 16) % 3,
        i = k % 16,
        row = cur.song[ph];
      if (i % 8 === 0) {
        const notes = row.filter(x => x !== null);
        ney(fq(notes[(i / 8) % notes.length] || 0), t, 4.4, 0.045, b);
      }
      if (k % 32 === 16) bell(fq(0, -1), t, 0.04, b);
      if ((i === 4 || i === 12) && row[i] !== null) pluck(fq(row[i], -1), t, 0.13, b);
    }
  },
  kiln: {
    scale: 'nahawand',
    root: 261.63,
    dur: 0.58,
    song: () => [motif(2, 0), motif(4, 2)],
    init: () => drone([fq(0, -2), fq(4, -2)], 0.05, 380),
    tick(k, t, cur, b) {
      const i = k % 16,
        ph = Math.floor(k / 16) % 2,
        row = cur.song[ph];
      if (i % 4 === 0) {
        dum(t, 0.1, b, 90);
        dum(t + 0.22, 0.06, b, 90);
      }
      if ((i === 2 || i === 10) && row[i] !== null) bell(fq(row[i], 1), t, 0.022, b);
      if (i === 0) pluck(fq(0, -1), t, 0.2, b);
      if (i === 6 && rnd() < 0.6) pluck(fq(2 + Math.floor(rnd() * 3)), t, 0.14, b);
    }
  },
  stars: {
    scale: 'rast',
    root: 293.66,
    dur: 0.36,
    song: () => [
      [0, 2, 4, 6, 4, 2, 1],
      [0, 2, 4, 7, 5, 4, 2],
      [-1, 1, 3, 4, 3, 1, 0]
    ],
    init: () => drone([fq(0, -2), fq(4, -2)], 0.045, 480),
    tick(k, t, cur, b) {
      const cyc = Math.floor(k / 7),
        i = k % 7,
        row = cur.song[Math.floor(cyc / 4) % 3];
      glass(fq(row[i]), t, i === 0 ? 0.08 : 0.05, 1.8, b);
      if (i === 0 && cyc % 2 === 0) dum(t, 0.08, b);
      if (i === 0 && cyc % 4 === 3) ney(fq(row[4]), t, 2.4, 0.03, b);
    }
  },
  dust: {
    scale: 'kurd',
    root: 329.63,
    dur: 0.46,
    song: () => [motif(4, 0), motif(2, 4), motif(5, 0)],
    init: () => both(drone([fq(0, -2), fq(4, -2)], 0.045, 420), hiss(0.03, 420, 1.4, 0.05)),
    tick(k, t, cur, b) {
      const ph = Math.floor(k / 16) % 3,
        i = k % 16,
        n = cur.song[ph][i];
      if (n !== null) {
        pluck(fq(n, 1), t, 0.1, b, 5200);
        pluck(fq(n, 1), t + 0.06, 0.06, b, 5200);
      }
      if (i === 0 || i === 7) udu(t, 0.15, b);
      if (i === 11 && rnd() < 0.5) udu(t, 0.09, b, 1.4);
    }
  },
  deep: {
    scale: 'saba',
    root: 220,
    dur: 0.8,
    song: () => [[0, -1, 1, 0]],
    init: () => both(drone([fq(0, -2), fq(1, -2)], 0.06, 240), hiss(0.025, 300, 1.2, 0.04)),
    tick(k, t, cur, b) {
      if (k % 6 === 0) {
        dum(t, 0.09, b, 80);
        dum(t + 0.3, 0.05, b, 80);
      }
      if (k % 24 === 12) ney(fq(cur.song[0][Math.floor(k / 24) % 4], -1), t, 4, 0.035, b);
      if (k % 48 === 30) bell(fq(0, -1), t, 0.03, b);
    }
  }
};
const DAY_TRACKS = ['bayati', 'river', 'hijaz', 'saba', 'kiln', 'stars', 'dust'];
const TRACK_NAMES = {
  bayati: 'Bayati at Dusk',
  river: 'Black Water',
  hijaz: 'Hijaz in the Reeds',
  saba: 'Lament in Saba',
  kiln: 'The Kiln',
  stars: 'Seven Stars',
  dust: 'Dust and Clay',
  deep: 'Below Kutha'
};
function npUpdate() {
  const el = document.getElementById('nowPlaying');
  if (!el) return;
  const n = AU.cur && AU.on.music ? TRACK_NAMES[AU.cur.id] : '';
  el.innerHTML = n ? '\u266A ' + twin(n, R(n)) : '';
}
function dealPlaylist(keep) {
  const a = DAY_TRACKS.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  if (keep && a.indexOf(keep) > 0) {
    a.splice(a.indexOf(keep), 1);
    a.unshift(keep);
  }
  AU.playlist = a.slice(0, 5);
}
dealPlaylist();
function trackNow() {
  if (S && ['finale', 'descent', 'sanctum'].includes(S.phase)) return 'deep';
  if (S && S.phase === 'end') return AU.cur ? AU.cur.id : AU.playlist[0];
  return AU.playlist[Math.max(0, Math.min(4, ((S && S.day) || 1) - 1))];
}
// ---------- playback ----------
function musicPlay(id) {
  AU.want = id;
  if (!AU.ctx || AU.ctx.state !== 'running' || !AU.on.music) return;
  musicHalt();
  const tr = TRACKS[id];
  if (!tr) return;
  SCL = MAQ[tr.scale];
  ROOT = tr.root;
  AU.cur = { id, tr, song: tr.song(), stop: tr.init() };
  npUpdate();
  AU.step = 0;
  AU.next = AU.ctx.currentTime + 0.25;
  AU.mbus.gain.cancelScheduledValues(AU.ctx.currentTime);
  AU.mbus.gain.setTargetAtTime(0.34, AU.ctx.currentTime, 0.9);
  if (!AU.timer) AU.timer = setInterval(auTick, 60);
}
function musicHalt() {
  if (AU.cur) {
    try {
      AU.cur.stop();
    } catch (e) {
      /* ignore */
    }
    AU.cur = null;
  }
  npUpdate();
}
function musicStop() {
  if (AU.timer) {
    clearInterval(AU.timer);
    AU.timer = null;
  }
  if (AU.ctx) AU.mbus.gain.setTargetAtTime(0.0001, AU.ctx.currentTime, 0.3);
  musicHalt();
}
function auTick() {
  const c = AU.ctx;
  if (!c || c.state !== 'running' || !AU.cur) return;
  if (AU.next < c.currentTime) AU.next = c.currentTime + 0.05;
  const cur = AU.cur,
    tr = cur.tr;
  while (AU.next < c.currentTime + 0.3) {
    try {
      tr.tick(AU.step, AU.next, cur, AU.mbus);
    } catch (e) {
      /* skip a note */
    }
    AU.next += tr.dur;
    AU.step++;
  }
}
// Stop, play a cue, then start the next theme. A change asked for while another is under way replaces it (and asked
// for the theme already playing, brings its volume back); AU.changing marks a change under way, which a click must not
// cut short (auGesture). Asked for while the sound sleeps (a hidden page, the system's own pause, a click that is still
// waking it), the theme that was playing is stopped then and there, so that it cannot sound again for a moment as the
// sound wakes, and the change is made as it wakes, cue and all (musicCatchUp).
function musicChange(id, cue) {
  const ep = ++AU.epoch;
  AU.want = id;
  AU.changing = null;
  if (!AU.ctx || AU.ctx.state !== 'running') {
    if (AU.cur && AU.cur.id !== id) musicHalt();
    if (cue) AU.cueOnWake = cue;
    return;
  }
  AU.cueOnWake = null;
  const c = AU.ctx;
  if (AU.cur && AU.cur.id === id && !cue) {
    AU.mbus.gain.cancelScheduledValues(c.currentTime);
    AU.mbus.gain.setTargetAtTime(0.34, c.currentTime, 0.9);
    return;
  }
  AU.changing = ep;
  if (AU.cur) AU.mbus.gain.setTargetAtTime(0.0001, c.currentTime, 0.45);
  setTimeout(
    () => {
      if (ep !== AU.epoch) return;
      musicHalt();
      if (cue) sfx(cue);
    },
    AU.cur ? 1500 : 50
  );
  setTimeout(
    () => {
      if (ep !== AU.epoch) return;
      AU.changing = null;
      if (AU.on.music) musicPlay(id);
    },
    cue ? 4600 : 1700
  );
}
function setMood(m) {
  if (!AU.ctx) return;
  AU.mlp.frequency.setTargetAtTime({ day: 3400, evening: 2200, night: 1400, deep: 1100 }[m] || 3400, AU.ctx.currentTime, 1.2);
}
// ---------- effects ----------
function sfx(name) {
  if (!AU.on.sfx || !AU.ctx || AU.ctx.state !== 'running') return;
  const c = AU.ctx,
    b = AU.sbus,
    t = Math.max(c.currentTime + 0.01, AU.sfxAt);
  if (t - c.currentTime > 1.4) return;
  AU.sfxAt = t + (name === 'tick' ? 0.03 : 0.22);
  const arp = (degs, gap, v, oct = 0) => degs.forEach((d, i) => pluck(fq(d, oct), t + i * gap, v, b));
  try {
    switch (name) {
      case 'open':
        noiseHit(t, 0.03, b, 1400, 0.7, 0.3);
        pluck(fq(2), t + 0.04, 0.18, b, 3600);
        pluck(fq(4), t + 0.16, 0.16, b, 3600);
        break;
      case 'close':
        pluck(fq(4), t, 0.14, b, 3200);
        pluck(fq(2), t + 0.12, 0.12, b, 3200);
        noiseHit(t + 0.05, 0.02, b, 1200, 0.7, 0.25);
        break;
      case 'tab':
        noiseHit(t, 0.06, b, 3200, 1.4, 0.05);
        break;
      case 'mark':
        noiseHit(t, 0.05, b, 2600, 2, 0.04);
        noiseHit(t + 0.07, 0.04, b, 2900, 2, 0.04);
        break;
      case 'clink':
        bell(fq(4, 2), t, 0.05, b);
        break;
      case 'thud':
        dum(t, 0.28, b, 90);
        break;
      case 'soft':
        glass(fq(0, 1), t, 0.05, 1.4, b);
        glass(fq(4, 1), t + 0.08, 0.04, 1.4, b);
        break;
      case 'gong':
        bell(fq(0, -2), t, 0.16, b);
        dum(t, 0.18, b, 70);
        break;
      case 'tick': {
        const o = c.createOscillator(),
          g = c.createGain();
        o.frequency.setValueAtTime(1100, t);
        o.frequency.exponentialRampToValueAtTime(600, t + 0.04);
        g.gain.setValueAtTime(0.035, t);
        g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
        o.connect(g);
        g.connect(b);
        o.start(t);
        o.stop(t + 0.07);
        break;
      }
      case 'steps':
        for (let i = 0; i < 3; i++) noiseHit(t + i * 0.18, 0.1, b, 600, 0.8, 0.09);
        break;
      case 'item':
        arp([0, 2, 4, 7], 0.09, 0.26, 1);
        break;
      case 'clue':
        bell(fq(4, 1), t, 0.07, b);
        break;
      case 'omen':
        bell(fq(0, 1), t, 0.06, b);
        ney(fq(4), t + 0.1, 0.9, 0.03, b);
        break;
      case 'lore':
        noiseHit(t, 0.04, b, 1800, 0.6, 0.25);
        pluck(fq(4), t + 0.12, 0.22, b);
        break;
      case 'nerve':
        arp([4, 2], 0.18, 0.2, -1);
        break;
      case 'wound':
        dum(t, 0.3, b);
        pluck(fq(0, -1), t, 0.26, b);
        break;
      case 'night':
        arp([4, 2, 0], 0.24, 0.18);
        break;
      case 'daybreak':
        bell(fq(0, -1), t, 0.12, b);
        bell(fq(4, 0), t + 0.9, 0.05, b);
        noiseHit(t, 0.03, b, 500, 0.5, 2.2);
        break;
      case 'descent':
        bell(fq(0, -2), t, 0.14, b);
        dum(t + 0.6, 0.2, b, 70);
        break;
      case 'success':
        arp([0, 4, 7], 0.11, 0.24);
        dum(t, 0.2, b);
        break;
      case 'fail':
        arp([1, 0], 0.22, 0.22, -1);
        break;
      case 'victory':
        arp([0, 2, 4, 7, 9, 11, 14], 0.12, 0.22);
        break;
      case 'defeat':
        arp([7, 5, 4, 2, 0], 0.28, 0.2, -1);
        break;
    }
  } catch (e) {
    /* never let sound break the game */
  }
}
// ---------- unlock, toggles, lifecycle ----------
function auSession() {
  try {
    if (navigator.audioSession) navigator.audioSession.type = AU.on.music ? 'playback' : AU.on.sfx ? 'ambient' : 'auto';
  } catch (e) {
    /* unsupported */
  }
}
// the music that should be playing, once the sound is awake again: a change asked for while it slept is made now (with
// its cue, if it had one); one under way is left to finish
function musicCatchUp() {
  if (!AU.on.music || AU.changing || (AU.cur && (!AU.want || AU.cur.id === AU.want))) return;
  const id = AU.want || trackNow(),
    cue = AU.cueOnWake;
  AU.cueOnWake = null;
  if (cue) musicChange(id, cue);
  else musicPlay(id);
}
function auGesture() {
  if (!AU.on.music && !AU.on.sfx) return;
  if (!auInit()) return;
  auSession();
  if (AU.ctx.state !== 'running') {
    const p = AU.ctx.resume();
    if (p && p.then) p.then(musicCatchUp).catch(() => {});
  } else musicCatchUp();
}
['touchend', 'pointerdown', 'mousedown', 'keydown', 'click'].forEach(ev =>
  document.addEventListener(ev, auGesture, { capture: true, passive: true })
);
document.addEventListener(
  'click',
  e => {
    const el = e.target.closest && e.target.closest('.choice, .tab, .mark, .mini, .snd');
    if (!el) return;
    sfx(el.classList.contains('tab') ? 'tab' : el.classList.contains('mark') ? 'mark' : 'tick');
  },
  true
);
document.addEventListener('visibilitychange', () => {
  if (!AU.ctx) return;
  if (document.hidden) {
    const q = AU.ctx.suspend();
    if (q && q.catch) q.catch(() => {});
  } else if (AU.on.music || AU.on.sfx) {
    const p = AU.ctx.resume();
    if (p && p.then) p.then(musicCatchUp).catch(() => {});
  }
});
function auButtons() {
  const m = document.getElementById('musicBtn'),
    s = document.getElementById('sfxBtn');
  if (!m || !s) return;
  m.setAttribute('aria-pressed', AU.on.music ? 'true' : 'false');
  m.setAttribute('aria-label', LANG === 'ru' ? 'Музыка' : 'Music'); // (the name stays; on or off is the button's state)
  s.setAttribute('aria-label', LANG === 'ru' ? 'Звук' : 'Sound');
  m.innerHTML = AU.on.music
    ? twin('Music on', 'Музыка вкл.', ['Music off', 'Музыка выкл.'])
    : twin('Music off', 'Музыка выкл.', ['Music on', 'Музыка вкл.']);
  s.setAttribute('aria-pressed', AU.on.sfx ? 'true' : 'false');
  s.innerHTML = AU.on.sfx
    ? twin('Sound on', 'Звук вкл.', ['Sound off', 'Звук выкл.'])
    : twin('Sound off', 'Звук выкл.', ['Sound on', 'Звук вкл.']);
  npUpdate();
}
function audioInit() {
  const m = document.getElementById('musicBtn'),
    s = document.getElementById('sfxBtn');
  if (!m || !s) return;
  auButtons();
  m.addEventListener('click', () => {
    AU.on.music = !AU.on.music;
    auSave();
    auSession();
    if (AU.on.music) {
      auGesture();
    } else musicStop();
    auButtons();
  });
  s.addEventListener('click', () => {
    AU.on.sfx = !AU.on.sfx;
    auSave();
    auSession();
    if (AU.on.sfx) auGesture();
    auButtons();
  });
}
