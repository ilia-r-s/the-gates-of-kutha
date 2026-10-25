// The social layer: temperaments, sympathies, gossip, confessions, reputation, the cult's craft, the way down and the
// romances at the end. Plays seasons through the page with a talkative policy, scans every scene and casebook page in
// both languages, checks the rules that must always hold and reports the rates that matter for balance.
// usage: node test/social.js [games] [--page=path]
const { run, open, args } = require('./lib/harness');
const A = args(),
  N = A._[0] || 120;

run(async browser => {
  const { page, errors } = await open(browser, { file: A.page || 'standalone', seed: 4242, mathSeed: 4242 });
  const res = await page.evaluate(N => {
    window.sfx = () => {};
    window.musicChange = () => {};
    const bad = [],
      seen = new Set();
    __T.watchScenes(bad, seen);
    const st = {
      games: 0,
      rare: {},
      ends: {},
      temper: {},
      claims: {},
      pretenders: 0,
      keptToEnd: 0,
      gossip: { n: 0, right: 0 },
      gossipBy: {},
      bond: { n: 0, right: 0 },
      sums: { confess: 0, cultTruth: 0, rumours: 0, mien: 0, tips: 0, evade: 0, friends: 0, enemies: 0 },
      gossipKinds: {},
      scandal: { visits: 0, bad: 0, kind: 0, heard: 0, herDown: 0, herUp: 0, youDown: 0, youUp: 0 },
      victims: [0, 0, 0],
      stirs: {},
      flirt: { you: 0, pairs: 0, said: 0 },
      thief: { saw: 0, named: 0, hints: 0 },
      craft: { plants: 0, seen: 0, sloppy: 0, blurts: 0, kept: 0, betrayals: 0 },
      below: {
        descents: 0,
        offered: 0,
        offeredCult: 0,
        withCult: 0,
        knife: 0,
        caught: 0,
        waited: 0,
        turned: 0,
        stolen: 0,
        encounters: 0,
        refused: 0
      },
      romance: { you: 0, pairs: 0, mourn: 0 },
      verdict: { held: 0, passed: 0, refused: 0, walkouts: 0, cultPushed: 0, cultDefended: 0, cultSacrificed: 0 },
      dread: 0,
      base: [0, 0, 0],
      styles: {}
    };
    const add = (o, k, n = 1) => {
      o[k] = (o[k] || 0) + n;
    };
    // what someone says another thinks of you, true or not as it stood when it was said; a night in your tent told as
    // gossip only once the camp knows of it, and never by her or of anyone else
    const thinks = { n: 0, right: 0 },
      keepAddTest = window.addTest;
    window.addTest = function (from, about, kind, verdict) {
      if (kind === 'thinks') {
        thinks.n++;
        const r = Ties.trust(C(about));
        if ((verdict === 'good' && r >= 2) || (verdict === 'bad' && r <= -1)) thinks.right++;
        if (from === about) bad.push('gossip about what one thinks of you, by that one');
      }
      if (kind === 'scandal') {
        const v = S.log.visit;
        if (!v || !v.agreed || !v.morning || v.id !== about || from === about) bad.push('gossip about a night in your tent that was not');
      }
      return keepAddTest.apply(this, arguments);
    };
    // talkative: goes where people are, talks a great deal, holds inquiries now and then
    const rnd = __T.lcg(99),
      random = __T.policies.random(rnd);
    const pickRe = (bs, re) => {
      const m = bs.filter(b => re.test(b.textContent));
      return m.length ? m[Math.floor(rnd() * m.length)] : null;
    };
    const talkative = bs => {
      if (S.phase === 'plan') return S.slot === 2 && rnd() < 0.5 ? pickRe(bs, /Expedition camp/) : pickRe(bs, /·|Here/);
      if (S.phase === 'loc')
        return (
          (S.slot === 2 && S.loc === 'camp' && rnd() < 0.35 && pickRe(bs, /Convene an inquiry/)) ||
          (rnd() < 0.7 && pickRe(bs, /^\d?Speak with/)) ||
          random(bs)
        );
      if (S.phase === 'talk') return rnd() < 0.85 ? pickRe(bs, /^(?!.*(Never mind|Take your leave)).*/) : pickRe(bs, /Take your leave/);
      if (S.phase === 'inquiry') return rnd() < 0.6 ? pickRe(bs, /Accuse/) : pickRe(bs, /Think better/);
      return random(bs);
    };
    for (let g = 0; g < N; g++) {
      __T.start(g % 3);
      if (
        !__T.play(bs => talkative(bs) || random(bs), {
          each: s => {
            if (s % 7 === 0) __T.scanBook(bad, seen);
          }
        })
      ) {
        bad.push('a season did not end');
        continue;
      }
      st.games++;
      add(st.ends, S.endId);
      // rules that must always hold; and what may happen only seldom, nothing being certain (counted: st.rare)
      const rare = k => add(st.rare, k);
      S.order.map(C).forEach(c => {
        const k = temperOf(c),
          cl = claimOf(c),
          told = cl.was || cl.role;
        add(st.temper, k);
        add(st.claims, `${k}:${c.role}:${told}`);
        if (k === 'honest' && c.role === 'cult' && (told === 'seer' || told === 'warden')) rare('an honest cultist claimed a part');
        if (k === 'honest' && cl.why === 'liked') rare('an honest pretender');
        if (k === 'honest' && c.role !== 'cult' && c.role !== 'smuggler' && told !== 'evade' && told !== trueClaim(c))
          rare('an honest liar');
        if (k === 'honest' && c.role === 'cult' && S.testimony.some(t => t.from === c.id && t.kind === 'distrust'))
          rare('an honest cultist named someone');
        if (k === 'honest' && c.role === 'cult' && S.nights.some(n => n && n.saw[c.id])) rare('an honest cultist invented a sighting');
        // (one of the cult drops a false part before everyone as a pretender would, or stages a coming clean: nothing else)
        if (
          c.role === 'cult' &&
          S.testimony.some(t => t.from === c.id && t.kind === 'confess') &&
          !(cl.was === 'seer' || cl.was === 'warden' || (cl.was === 'none' && cl.role === 'warden'))
        )
          bad.push('a cultist confessed');
        if (c.rapport < -2 || c.rapport > 3) bad.push('trust out of range: ' + c.rapport);
        if (told === 'evade') st.sums.evade++;
        if ((cl.why === 'liked' || (c.role === 'smuggler' && told === 'warden')) && cl.said != null) {
          st.pretenders++;
          if (cl.recanted == null) st.keptToEnd++;
        }
      });
      S.glosses
        .filter(gl => gl.by !== 'you' && C(gl.by).role === 'cult')
        .forEach(gl => {
          if (S.titleOf[gl.e] === S.patron && gl.g === S.patron) rare('the cult told the truth about the power below');
          if (temperOf(gl.by) === 'honest' && S.titleOf[gl.e] !== S.patron && gl.g !== S.titleOf[gl.e])
            rare('an honest cultist lied about another power');
        });
      Object.values(S.readings)
        .filter(r => C(r.by).role === 'cult' && S.godOfWard[r.w] === S.patron && r.gods && r.gods.includes(S.patron))
        .forEach(() => rare('the cult read the true ward truly'));
      // what was said, and how much of it was true
      S.testimony
        .filter(t => t.kind === 'temper')
        .forEach(t => {
          st.gossip.n++;
          const ok = t.verdict === temperOf(t.about),
            k = temperOf(t.from);
          st.gossipBy[k] = st.gossipBy[k] || [0, 0];
          st.gossipBy[k][0]++;
          if (ok) {
            st.gossip.right++;
            st.gossipBy[k][1]++;
          }
        });
      S.testimony
        .filter(t => t.kind === 'bond')
        .forEach(t => {
          st.bond.n++;
          const [k, o] = t.verdict.split(':'),
            real = Ties.likes(t.about, o) + Ties.likes(o, t.about);
          if ((k === 'close' && real >= 2) || (k === 'feud' && real <= -2)) st.bond.right++;
        });
      // what the gossip was about, by kind; and what a night in your tent told as gossip did
      S.testimony
        .filter(t => ['temper', 'bond', 'flirt', 'hint', 'thinks', 'scandal'].includes(t.kind))
        .forEach(t => add(st.gossipKinds, t.kind));
      if (S.log.visit && S.log.visit.agreed) {
        const sc = st.scandal;
        sc.visits++;
        S.testimony.filter(t => t.kind === 'scandal').forEach(t => sc[t.verdict]++);
        sc.heard += (S.log.visit.heard || []).length;
        S.stirs
          .filter(r => r.kind === 'scandal')
          .forEach(r =>
            r.moved.forEach(([w, , d, ids]) => {
              sc[(w === 'like' ? 'her' : 'you') + (d < 0 ? 'Down' : 'Up')] += ids.length;
            })
          );
      }
      // sympathies stay in range, however much the camp has made of what it heard
      Object.values(S.like).forEach(m =>
        Object.values(m).forEach(v => {
          if (v < -2 || v > 2) bad.push('liking out of range: ' + v);
        })
      );
      const sums = st.sums;
      sums.mien += S.testimony.filter(t => t.kind === 'mien').length;
      sums.tips += S.testimony.filter(t => t.kind === 'tip').length;
      sums.confess += S.log.confess;
      sums.cultTruth += S.log.cultTruth;
      sums.rumours += (S.rumors || []).length;
      // the night's victims against everyone who could have been taken: how the cult's likes weigh
      const cult = S.order.filter(id => C(id).role === 'cult'),
        lean = v => Math.sign(cult.reduce((s, k) => s + Ties.likes(k, v), 0)) + 1;
      S.order.filter(id => C(id).status === 'taken').forEach(v => st.victims[lean(v)]++);
      S.order.filter(id => C(id).role !== 'cult').forEach(v => st.base[lean(v)]++);
      // public moments: how many each moved (0, 1, 2, 3 ...), which way
      S.stirs.forEach(x => {
        const k = (st.stirs[x.kind] = st.stirs[x.kind] || {
          n: 0,
          moved: [0, 0, 0, 0, 0, 0, 0],
          up: 0,
          down: 0,
          sus: 0,
          clear: 0,
          spoke: 0
        });
        k.n++;
        if (x.spoke) k.spoke++;
        const all = x.moved.reduce((s, g) => s + g[3].length, 0);
        k.moved[Math.min(6, all)]++;
        x.moved.forEach(([what, whom, d, ids]) => {
          k[what === 'trust' ? (d > 0 ? 'up' : 'down') : d > 0 ? 'sus' : 'clear'] += ids.length;
          if (ids.length > RULES.camp.cap) bad.push('a moment moved more than the cap');
        });
      });
      // suspicion stays in range; flirtation only across the sexes, never from a priest, toward you only from a woman
      S.order.forEach(a =>
        S.order.forEach(b => {
          if (sus(a, b) < 0 || sus(a, b) > 3) bad.push('suspicion out of range');
        })
      );
      S.order.forEach(a => {
        const f = S.flirt[a];
        if (f.you && C(a).p !== 'she') bad.push('a man dealt a flirtation toward you');
        if (Ties.vowed(a) && Object.keys(f).some(k => k !== 'you' && f[k])) bad.push('a vow broken');
        Object.keys(f).forEach(k => {
          if (k !== 'you' && f[k] && C(k).p === C(a).p) bad.push('a flirtation within one sex');
        });
        if (f.you) st.flirt.you++;
      });
      st.flirt.pairs += S.order.reduce((n, a) => n + S.order.filter(b => b !== a && Ties.sweetOn(a, b)).length, 0);
      st.flirt.said += S.testimony.filter(t => t.kind === 'flirt' || (t.kind === 'feel' && t.verdict === 'flirt')).length;
      // the thief: names only someone he saw (the one who did it, all but always), and a second only if he would
      st.thief.saw += S.witness.length ? 1 : 0;
      st.thief.hints += S.testimony.filter(
        t => t.kind === 'hint' || (t.kind === 'distrust' && C(t.from).role === 'smuggler' && S.witness.some(w => w.actor === t.about))
      ).length;
      const named = S.testimony.filter(t => t.kind === 'witness');
      if (named.length) st.thief.named++;
      if (named.length > 1 && !S.witnessMore) bad.push('the thief named more than one');
      if (new Set(named.map(t => t.about)).size < named.length) bad.push('the thief named the same one twice');
      if (named.length > 1) rare('the thief named a second');
      named.forEach(t => {
        if (!S.witness.some(w => w.actor === t.about)) bad.push('the thief named someone he did not see');
        if (C(t.about).role !== 'cult') rare('the thief named an innocent he took for the one who did it');
      });
      // the cult's craft: an innocent's trace laid only by the cult; slips of the tongue only from the cult
      S.clues.forEach(cl => {
        if (cl.source === 'plant' && !cl.extra) {
          // (extra: more of the same owner's, found beside a trace misread as the attacker's; nobody laid it)
          st.craft.plants++;
          if (cl.status === 'planted') st.craft.seen++;
          if (C(cl.owner).role === 'cult') bad.push('the cult planted its own trace');
          if (C(cl.by).role !== 'cult') bad.push('a trace planted by someone outside the cult');
        }
      });
      st.craft.sloppy += S.clues.filter(cl => cl.careless).length;
      // one of the cult killed only by another (or by you, the night you went out yourself), and only as the craft allows:
      // seldom on the first night
      S.betrayals.forEach(b => {
        st.craft.betrayals++;
        if (C(b.by).role !== 'cult' || C(b.victim).role !== 'cult' || b.by === b.victim) bad.push('a betrayal outside the cult');
        if (b.day < 2) rare('a betrayal on the first night');
      });
      S.order
        .map(C)
        .filter(c => c.role === 'cult' && c.status === 'taken')
        .forEach(c => {
          if (c.takenBy !== 'you' && !S.betrayals.some(b => b.victim === c.id && !b.saved))
            bad.push('one of the cult died, and not by one of its own (nor by your hand: game/deed.js)');
        });
      S.testimony
        .filter(t => t.kind === 'blurt')
        .forEach(t => {
          st.craft.blurts++;
          // the one who did it, or one who knew it innocently: who found the body, or was there by ill luck (the other
          // of the cult as readily as anyone: people/cunning.js, blurt)
          const [n, why] = t.verdict.split(':'),
            rec = S.nights[+n];
          if (C(t.from).role === 'cult') {
            if (why && (!rec || rec.actor === t.from || !(why === 'found' ? rec.finder === t.from : wasAbout(rec, t.from))))
              bad.push('a slip of the tongue from the cult, marked as innocent, by one who did not know it innocently');
          } else if (!why || !rec || !(why === 'found' ? rec.finder === t.from : wasAbout(rec, t.from)))
            bad.push('a slip of the tongue from outside the cult, by one who could not have known');
          else st.craft.innocentBlurts = (st.craft.innocentBlurts || 0) + 1;
        });
      st.craft.kept += S.log.keptWatch.length;
      st.dread += S.log.dread;
      // the way down: who offered, who went, what the cult did there
      if (S.fin) {
        const f = S.fin,
          B = st.below;
        B.descents++;
        B.offered += (f.offered || []).length;
        B.offeredCult += (f.offered || []).filter(id => C(id).role === 'cult').length;
        if ((f.took || []).some(id => C(id).role === 'cult')) B.withCult++;
        B.knife += f.betrayed.length;
        B.caught += (f.took || []).filter(id => C(id).role === 'cult' && C(id).status === 'exposed').length;
        B.waited += f.patient ? 1 : 0;
        B.turned += (f.turned || []).length;
        B.stolen += f.stolen ? 1 : 0;
        B.encounters += (f.enc || []).length;
        B.refused += (f.refused || []).length;
      }
      // the camp's verdicts: the accused never votes, nobody votes twice, a verdict passes only as the rules say; the
      // cult's hands, and walkouts
      (S.inquiries || []).forEach(v => {
        const V = st.verdict,
          all = v.back.concat(v.against, v.silent);
        V.held++;
        if (v.passed) V.passed++;
        else V.refused++;
        if (all.includes(v.id)) bad.push('the accused voted at their own inquiry');
        if (new Set(all).size < all.length) bad.push('someone voted twice at one inquiry');
        const need = Math.min(RULES.verdict.need, all.length);
        if (v.passed && all.length && !(v.back.length >= need && v.back.length > v.against.length))
          bad.push('an inquiry passed without the camp');
        if (!v.passed && v.back.length >= need && v.back.length > v.against.length) bad.push('an inquiry refused with the camp behind it');
        if (S.walkout && v.day > S.walkout) bad.push('an inquiry after the camp walked out');
        const x = C(v.id);
        all
          .map(C)
          .filter(o => o.role === 'cult')
          .forEach(o => {
            if (x.role !== 'cult' && v.back.includes(o.id)) V.cultPushed++;
            if (x.role === 'cult' && v.against.includes(o.id)) V.cultDefended++;
            if (x.role === 'cult' && v.back.includes(o.id)) V.cultSacrificed++;
          });
      });
      if (S.walkout) st.verdict.walkouts++;
      // the flirtations that came to more: nobody in two of them
      if (S.romance) {
        const ids = [S.romance.you, ...S.romance.pairs.flatMap(x => [x.a, x.b])].filter(Boolean);
        if (new Set(ids).size < ids.length) bad.push('someone in two romances');
        // between the camp, only a man and a woman; never the priest; and only a woman with you
        S.romance.pairs.forEach(x => {
          if (C(x.a).p === C(x.b).p) bad.push(`a romance between two of one sex: ${x.a}, ${x.b}`);
          if (Ties.vowed(x.a) || Ties.vowed(x.b)) bad.push(`a romance with the priest: ${x.a}, ${x.b}`);
        });
        S.romance.mourn.forEach(x => {
          if (C(x.a).p === C(x.b).p) bad.push(`mourning between two of one sex: ${x.a}, ${x.b}`);
        });
        if (S.romance.you && C(S.romance.you).p !== 'she') bad.push('a romance with you from a man');
        st.romance.you += S.romance.you ? 1 : 0;
        st.romance.pairs += S.romance.pairs.length;
        st.romance.mourn += S.romance.mourn.length;
      }
      const r = endReckon();
      sums.friends += r.friends.length;
      sums.enemies += r.enemies.length;
      add(st.styles, endStyle(r));
    }
    const pc = (x, n) => (n ? ((100 * x) / n).toFixed(0) + '%' : '-'),
      share = a => {
        const n = a[0] + a[1] + a[2];
        return `disliked ${pc(a[0], n)} · neither ${pc(a[1], n)} · liked ${pc(a[2], n)}`;
      };
    return {
      games: st.games,
      ends: st.ends,
      styles: st.styles,
      temperaments: st.temper,
      perGame: Object.fromEntries(Object.entries(st.sums).map(([k, v]) => [k, +(v / st.games).toFixed(2)])),
      pretendersKeptTheLie: `${st.keptToEnd}/${st.pretenders}`,
      gossipTrue: `${pc(st.gossip.right, st.gossip.n)} of ${st.gossip.n}`,
      gossipTrueBy: Object.fromEntries(Object.entries(st.gossipBy).map(([k, [n, r2]]) => [k, `${pc(r2, n)} of ${n}`])),
      bondTrue: `${pc(st.bond.right, st.bond.n)} of ${st.bond.n}`,
      thinksTrue: `${pc(thinks.right, thinks.n)} of ${thinks.n}`,
      gossipKinds: st.gossipKinds,
      scandal: st.scandal,
      victimsByCultLikes: share(st.victims),
      publicMoments: st.stirs,
      flirtation: st.flirt,
      thief: st.thief,
      cultCraft: st.craft,
      descent: st.below,
      romance: st.romance,
      verdict: st.verdict,
      horrorsOutsidePerGame: +(st.dread / st.games).toFixed(2),
      everyoneByCultLikes: share(st.base),
      claims: Object.fromEntries(
        Object.entries(st.claims)
          .sort((p, q) => q[1] - p[1])
          .slice(0, 30)
      ),
      // what nothing forbids, but should come seldom: in at most one season in ten each
      rare: st.rare,
      problems: [...new Set(bad)]
        .concat(
          Object.entries(st.rare)
            .filter(([, v]) => v / st.games > 0.1)
            .map(([k, v]) => `too often: ${k} (${v} in ${st.games})`)
        )
        .slice(0, 25),
      nProblems: bad.length + Object.values(st.rare).filter(v => v / st.games > 0.1).length,
      missingRu: [...MISSING].slice(0, 10)
    };
  }, N);
  return { ...res, errors };
});
