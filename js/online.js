// =============================================
//  あいことば対戦（Firebase Realtime Database）
//  自分のキャラは自分の画面で動かし、ようすを1秒に20回送る。
//  自分の攻撃が当たったかは自分の画面で決めて「当てた」を送る。受けた側がダメージを入れる。
//
//  データの形： eshi/{あいことば}/
//    players/{0|1} : { id, name }
//    ch/{0|1}      : キャラ（絵と骨）
//    ready/{0|1}   : 何回戦をやりたいか
//    game          : { round, startAt }       0番の人が書く
//    st/{0|1}      : ようす（文字列）
//    hit/r{回戦}/{自動ID} : { to, part, dmg, crit, stun, kx }
//    end/r{回戦}   : { winner, why }
//    mode          : 'normal'（いまのキャラ）か 'raku'（らくがきバトル：60秒で描く）
//    rch/r{回戦}/{0|1} : らくがきバトルで描いたキャラ
//    watchers/{id} : 観戦している人 { name }（10人まで）
//    cheer/r{回戦}/{自動ID} : 応援スタンプ { e, n, t }
// =============================================
(function () {
  const clean = s => String(s || '').replace(/[.#$\[\]\/\s]/g, '').slice(0, 20);
  const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
  const LIMBS = EK.CH.LIMBS;
  const r3 = v => Math.round(v * 1000) / 1000;
  const DRAW_MS = 60000;   // らくがきバトルで描く時間
  const ACT = ['punch', 'jatk', 'drop', 'slam', 'lag'];
  // ようす ⇄ 文字列
  EK.packState = (f, time) => JSON.stringify([r3(f.x), r3(f.z), r3(f.y), r3(f.vy), f.face, r3(f.vx), r3(f.vz),
    f.act ? [ACT.indexOf(f.act.type), f.act.arm === 'armR' ? 1 : 0, r3(f.act.t), r3(f.act.hit || 0), r3(f.act.rec || 0), r3(f.act.aim || 0.12), r3(f.act.stop || 1)] : 0,
    LIMBS.map(p => Math.round(f.dur[p])), r3(f.stun), r3(f.hurtT), r3(time)]);
  EK.applyState = (f, str) => {
    let d; try { d = JSON.parse(str); } catch (e) { return null; }
    const [x, z, y, vy, face, vx, vz, act, dur, stun, hurtT, time] = d;
    f.tx = x; f.tz = z; f.y = y; f.vy = vy; f.face = face; f.vx = vx; f.vz = vz; f.stun = stun; f.hurtT = Math.max(f.hurtT, hurtT);
    if (f.x == null || Math.hypot(f.x - x, f.z - z) > 2) { f.x = x; f.z = z; }
    if (act) { const type = ACT[act[0]]; if (!f.act || f.act.type !== type || Math.abs(f.act.t - act[2]) > 0.15) f.act = { type, arm: act[1] ? 'armR' : 'armL', t: act[2], hit: act[3], rec: act[4] }; if (f.act) { f.act.aim = act[5]; f.act.stop = act[6]; } }
    else f.act = null;
    const broke = [];
    LIMBS.forEach((p, i) => { if (dur[i] < f.dur[p]) f.flash[p] = 0.2; f.dur[p] = dur[i]; if (dur[i] <= 0 && !f.gone[p]) { f.gone[p] = true; broke.push(p); } });
    f.hip = f.calcHip();
    return { broke, time };
  };
  // 届いていないあいだも、なめらかに動かす
  EK.smoothRemote = (f, dt) => {
    if (f.tx == null) return;
    f.tx += f.vx * dt; f.tz += f.vz * dt;
    f.x += (f.tx - f.x) * Math.min(1, dt * 12); f.z += (f.tz - f.z) * Math.min(1, dt * 12);
    if (f.y > 0 || f.vy > 0) { f.vy -= EK.CONFIG.G * dt; f.y = Math.max(0, f.y + f.vy * dt); }
    if (f.act) f.act.t += dt;
    for (const p in f.flash) f.flash[p] = Math.max(0, f.flash[p] - dt);
    f.hurtT = Math.max(0, f.hurtT - dt * 1.6); f.t += dt;
    const nj = f.legJoints(); f.sway = Math.sin(f.t * 5.3 + f.slot) * 0.6 + Math.sin(f.t * 8.7) * 0.4;
    f.ox = Math.sin(f.t * 3.1 + 1) * 0.022 * nj; f.oz = Math.cos(f.t * 2.3) * 0.03 * nj;
  };

  class OnlineRoom {
    constructor(db, code, name, charStr, cb, want) {
      this.db = db; this.code = clean(code); this.name = (String(name || '').trim().slice(0, 8)) || I18N.t('noname');
      this.want = want === 'raku' ? 'raku' : 'normal'; this.mode = this.want; this.watching = false; this.watchers = 0; this.rch = {};
      this.charStr = charStr; this.cb = cb || {}; this.id = uid(); this.slot = -1;
      this.players = {}; this.ready = {}; this.chars = {}; this.game = null; this.round = 0; this.ended = {};
      this.subs = []; this.evSubs = []; this.offset = 0; this.root = db.ref('eshi/' + this.code); this.left = false;
    }
    call(n, ...a) { if (this.cb[n]) this.cb[n](...a); }
    now() { return Date.now() + this.offset; }
    on(ref, ev, fn) { ref.on(ev, fn); this.subs.push([ref, ev, fn]); }
    async join() {
      if (!this.code) throw new Error(I18N.t('err_code_short'));
      this.on(this.db.ref('.info/serverTimeOffset'), 'value', s => { this.offset = s.val() || 0; });
      for (const s of [0, 1]) {
        const ref = this.root.child('players/' + s);
        const res = await ref.transaction(cur => (cur ? undefined : { id: this.id, name: this.name }));
        if (res.committed && res.snapshot.val() && res.snapshot.val().id === this.id) { this.slot = s; break; }
      }
      // ふたりとも入っている → 観戦（10人まで）
      if (this.slot < 0) return this.joinWatch();
      const s = this.slot;
      for (const k of ['players/', 'ready/', 'ch/', 'st/']) this.root.child(k + s).onDisconnect().remove();
      // あそびかた：あいてがまだいなければ自分が決める。いれば部屋に合わせる
      const other = (await this.root.child('players/' + (1 - s)).once('value')).val();
      if (!other) await this.root.child('mode').set(this.want);
      this.on(this.root.child('mode'), 'value', snap => { const m = snap.val() === 'raku' ? 'raku' : 'normal'; if (m !== this.mode) { this.mode = m; this.call('onMode', m); } });
      if (this.charStr) await this.root.child('ch/' + s).set(this.charStr);
      const g0 = (await this.root.child('game').once('value')).val();
      this.joinRound = ((g0 && g0.round) || 0) + 1;
      this.on(this.root.child('players'), 'value', snap => {
        const prev = this.players; this.players = snap.val() || {};
        this.call('onPeople', this.people());
        const o = 1 - this.slot;
        if (this.game && prev[o] && !this.players[o]) this.endRound(this.slot, 'left');
        this.tryStart();
      });
      this.on(this.root.child('ch'), 'value', snap => { this.chars = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('ready'), 'value', snap => { this.ready = snap.val() || {}; this.tryStart(); });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      this.on(this.root.child('st/' + (1 - s)), 'value', snap => { const v = snap.val(); if (v) this.call('onState', v, 1 - s); });
      this.on(this.root.child('watchers'), 'value', snap => { this.watchers = Object.keys(snap.val() || {}).length; this.call('onWatchers', this.watchers); });
      await this.root.child('ready/' + s).set(this.joinRound);
      return { slot: s, code: this.code, mode: this.mode };
    }
    async joinWatch() {
      const w = (await this.root.child('watchers').once('value')).val() || {};
      if (Object.keys(w).length >= 10) throw new Error(I18N.t('room_full'));
      this.watching = true; this.slot = -1;
      const me = this.root.child('watchers/' + this.id);
      await me.set({ name: this.name }); me.onDisconnect().remove();
      this.mode = (await this.root.child('mode').once('value')).val() === 'raku' ? 'raku' : 'normal';
      this.on(this.root.child('mode'), 'value', snap => { this.mode = snap.val() === 'raku' ? 'raku' : 'normal'; });
      this.on(this.root.child('players'), 'value', snap => { this.players = snap.val() || {}; this.call('onPeople', this.people()); });
      this.on(this.root.child('ch'), 'value', snap => { this.chars = snap.val() || {}; });
      this.on(this.root.child('game'), 'value', snap => this.onGame(snap.val()));
      for (const k of [0, 1]) this.on(this.root.child('st/' + k), 'value', snap => { const v = snap.val(); if (v) this.call('onState', v, k); });
      this.on(this.root.child('watchers'), 'value', snap => { this.watchers = Object.keys(snap.val() || {}).length; this.call('onWatchers', this.watchers); });
      return { slot: -1, code: this.code, mode: this.mode, watching: true };
    }
    people() { return { names: [0, 1].map(s => (this.players[s] ? this.players[s].name : null)), slot: this.slot, watching: this.watching }; }
    tryStart() {
      if (this.slot !== 0 || this.left || !this.joinRound) return;
      const r = this.ready || {}, next = (this.game ? this.game.round : 0) + 1;
      const raku = this.mode === 'raku';
      if (!this.players[0] || !this.players[1] || (!raku && (!this.chars[0] || !this.chars[1]))) return;
      if (!(r[0] >= next && r[1] >= next)) return;
      if (this.starting === next) return;
      this.starting = next;
      // らくがきバトルは、まず60秒で描く
      if (raku) { const until = this.now() + 3000 + (EK.DRAW_MS || DRAW_MS); this.root.child('game').set({ round: next, phase: 'draw', drawEnd: until, startAt: until }); }
      else this.root.child('game').set({ round: next, phase: 'fight', startAt: this.now() + 4200 });
      if (next > 2) for (const k of ['hit/', 'end/', 'rch/', 'cheer/']) this.root.child(k + 'r' + (next - 2)).remove();
    }
    async onGame(g) {
      if (!g || this.left) { this.game = g; return; }
      const key = g.round + ':' + (g.phase || 'fight');
      if (this.gameKey === key) return;
      this.gameKey = key; this.game = g;
      if (this.joinRound && g.round < this.joinRound) return;
      this.round = g.round;
      const RK = 'r' + g.round;
      if (g.phase === 'draw') {
        for (const [ref, ev, fn] of this.evSubs) ref.off(ev, fn);
        this.evSubs = []; this.rch = {}; this.cheerRK = null;
        this.call('onDraw', { round: g.round, until: g.drawEnd, slot: this.slot, names: this.people().names });
        // 描いたキャラが集まったら（または時間を少しすぎたら）0番の人が「たたかう」に進める
        const rref = this.root.child('rch/' + RK), rfn = snap => { this.rch = snap.val() || {}; this.call('onDrawn', this.rch); this.checkDrawn(); };
        rref.on('value', rfn); this.evSubs.push([rref, 'value', rfn]);
        this.listenCheer(RK);
        clearInterval(this.drawTm); if (this.slot === 0) this.drawTm = setInterval(() => this.checkDrawn(), 1000);
        return;
      }
      clearInterval(this.drawTm);
      if (!g.raku) { for (const [ref, ev, fn] of this.evSubs) ref.off(ev, fn); this.evSubs = []; this.cheerRK = null; }
      this.listenCheer(RK);
      let chars = [this.chars[0], this.chars[1]];
      if (g.raku) { const v = (await this.root.child('rch/' + RK).once('value')).val() || {}; chars = [v[0] || null, v[1] || null]; if (this.left || this.gameKey !== key) return; }
      this.call('onStart', { round: g.round, slot: this.slot, wait: Math.max(0, g.startAt - this.now()), names: this.people().names, chars, raku: !!g.raku, watching: this.watching });
      const href = this.root.child('hit/' + RK), hfn = snap => { const v = snap.val(); if (!v) return; if (this.watching) this.call('onWatchHit', v); else if (v.to === this.slot) this.call('onHit', v); };
      href.on('child_added', hfn); this.evSubs.push([href, 'child_added', hfn]);
      const eref = this.root.child('end/' + RK), efn = snap => { const v = snap.val(); if (v && !this.ended[RK]) { this.ended[RK] = v; this.call('onEnd', v); } };
      eref.on('value', efn); this.evSubs.push([eref, 'value', efn]);
    }
    listenCheer(RK) {
      if (this.cheerRK === RK) return; this.cheerRK = RK;
      const since = this.now() - 1500;
      const cref = this.root.child('cheer/' + RK), cfn = snap => { const v = snap.val(); if (v && (v.t || 0) >= since) this.call('onCheer', v); };
      cref.on('child_added', cfn); this.evSubs.push([cref, 'child_added', cfn]);
    }
    checkDrawn() {
      const g = this.game; if (this.slot !== 0 || !g || g.phase !== 'draw' || this.left) return;
      const both = this.rch[0] && this.rch[1], late = this.now() > g.drawEnd + 6000;
      if (!both && !late) return;
      clearInterval(this.drawTm);
      this.root.child('game').set({ round: g.round, phase: 'fight', raku: true, startAt: this.now() + 7500 });
    }
    submitDraw(str) { if (!this.left && !this.watching && this.round) this.root.child('rch/r' + this.round + '/' + this.slot).set(str); }
    cheer(e) { if (!this.left && this.round) this.root.child('cheer/r' + this.round).push({ e, n: this.name, t: this.now() }); }
    sendState(str) { if (!this.left && !this.watching) this.root.child('st/' + this.slot).set(str); }
    sendHit(h) { if (!this.left) this.root.child('hit/r' + this.round).push(h); }
    endRound(winner, why) { this.root.child('end/r' + this.round).transaction(cur => (cur ? undefined : { winner, why: why || 'ko' })); }
    rematch() { this.root.child('ready/' + this.slot).set(this.round + 1); }
    leave() {
      if (this.left) return; this.left = true;
      for (const [ref, ev, fn] of this.subs.concat(this.evSubs)) ref.off(ev, fn);
      this.subs = []; this.evSubs = [];
      clearInterval(this.drawTm);
      if (this.watching) this.root.child('watchers/' + this.id).remove();
      else if (this.slot >= 0) for (const k of ['players/', 'ready/', 'ch/', 'st/']) this.root.child(k + this.slot).remove();
    }
  }
  EK.OnlineRoom = OnlineRoom; EK.cleanCode = clean;
})();
