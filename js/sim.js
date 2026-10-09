// =============================================
//  戦いのルール本体（画面とは切りはなし）
//  地面は x-z 平面、高さは y。キャラの絵（頭と体）はいつもカメラの方（+z）を向いた板。
//  うで・あしは、つなぎ目から相手の方向へ飛び出す。当たり判定は立体で行う
// =============================================
(function () {
  const S = EK.SCALE, HIP = EK.CH.HIP, LIMBS = EK.CH.LIMBS, W = EK.CH.W;
  const C = EK.CONFIG = {
    TIME: 90, WALL: 5.2, G: 18, DUR: 130,
    SPURT: 30, SPURT_DMG: 1.5, WALL_MIN: 0.3,   // 残り30秒からダメージ1.5倍・かべがせまくなる
    STALE: 6, SQUEEZE: 0.35,                    // 6秒だれも当たらないと、かべがせまくなっていく（1秒に0.35）
    AIM: 0.12,                 // パンチは少し下向き
    THICK: 0.14,               // 絵の板の厚み（当たり判定）
    CRIT: 1.5, STUN: 0.5,
    JATK_DMG: 16, DROP_DMG: 12, SLAM_DMG: 9, LAG: 0.35
  };
  const R6 = 6 * S;            // 当たり判定の円（1マス）の半径
  const rnd = seed => { let a = seed >>> 0 || 1; return () => { a ^= a << 13; a ^= a >>> 17; a ^= a << 5; return ((a >>> 0) % 100000) / 100000; }; };

  class Fighter {
    constructor(ch, slot, x) {
      this.ch = ch; this.st = EK.stats(ch); this.slot = slot;
      this.x = x; this.z = 0; this.y = 0; this.vy = 0; this.vx = 0; this.vz = 0; this.ox = 0; this.oz = 0;
      this.face = x < 0 ? 1 : -1; this.dx = this.face; this.dz = 0;
      this.act = null; this.cd = 0; this.stun = 0; this.hurtT = 0; this.sway = 0; this.t = 0;
      this.dur = {}; this.gone = {}; this.flash = { body: 0 };
      for (const p of LIMBS) { this.dur[p] = C.DUR; this.gone[p] = false; this.flash[p] = 0; }
      this.armNext = 0; this.rng = rnd(1234 + slot * 777); this.remote = false;
      this.hip = this.calcHip();
      const bb = this.st.box.body; this.halfW = Math.max(0.3, Math.min(0.9, (bb ? (bb[2] - bb[0]) / 2 : 40) * S * 0.7));
      // 当たりの箱：描いた絵（頭と体・うで・あし）が入る大きさ。すき間ですり抜けないように
      let x0 = 1e9, x1 = -1e9, y0 = 1e9;
      for (const p of ['body', ...LIMBS]) for (const c of this.st.hurt[p]) { x0 = Math.min(x0, c[0]); x1 = Math.max(x1, c[0]); y0 = Math.min(y0, c[1]); }
      if (x0 > x1) { x0 = W / 2 - 40; x1 = W / 2 + 40; y0 = 100; }
      this.box = { x0, x1, y0 };
      this.kvx = 0; this.kvz = 0;
    }
    arms() { return ['armL', 'armR'].filter(p => !this.gone[p]); }
    legs() { return ['legL', 'legR'].filter(p => !this.gone[p]); }
    limbs() { return LIMBS.filter(p => !this.gone[p]); }
    calcHip() {
      const L = this.legs(); let h = 0.15;
      for (const p of L) h = Math.max(h, (this.st.legs[p].low - HIP[1]) * S);
      if (!L.length) h = Math.max(0.12, (this.st.bodyBottom - HIP[1]) * S);
      return h;
    }
    speed() {
      const L = this.legs(); if (!L.length) return 0;
      const h = L.reduce((n, p) => n + this.st.legs[p].h, 0) / L.length;
      const v = Math.max(1.2, Math.min(5.8, 1.15 + 3.3 * (h / 110)));
      return L.length === 1 ? v * 0.45 : v;
    }
    jumpV() {
      const L = this.legs(); if (!L.length) return 0;
      const h = L.reduce((n, p) => n + this.st.legs[p].h, 0) / L.length;
      let hh = 0.7 + 1.0 * Math.min(2.2, h / 110); if (L.length === 1) hh *= 0.5;
      return Math.sqrt(2 * C.G * hh);
    }
    legJoints() { return this.legs().reduce((n, p) => n + this.st.legs[p].joints, 0); }
    // キャンバスの点 → 世界の点（絵の板の上）
    wp(cx, cy) { return [this.x + this.ox + this.face * (cx - W / 2) * S, this.y + this.hip - (cy - HIP[1]) * S, this.z + this.oz]; }
    reach() { const A = this.arms(); return A.length ? Math.max(...A.map(p => this.st.arms[p].reach)) : 0.5; }
    nextArm() { const A = this.arms(); return A.length ? A[this.armNext % A.length] : null; }
  }

  class Match {
    constructor(chA, chB, opt = {}) {
      this.f = [new Fighter(chA, 0, -3), new Fighter(chB, 1, 3)];
      this.wallCur = C.WALL; this.noHit = 0;
      this.time = C.TIME; this.over = false; this.winner = null; this.events = []; this.online = !!opt.online;
    }
    emit(e) { this.events.push(e); }
    step(dt, inputs) {
      if (this.over) return;
      const before = this.time;
      this.time = Math.max(0, this.time - dt);
      if (before > C.SPURT && this.time <= C.SPURT) this.emit({ type: 'spurt' });
      // かべ：一度せまくなったら広がらない
      this.noHit += dt;
      const spurtW = this.time > C.SPURT ? C.WALL : C.WALL - (C.SPURT - this.time) / 22 * (C.WALL - C.WALL_MIN);
      let w = Math.min(this.wallCur, spurtW);
      if (this.noHit > C.STALE) { if (this.wallCur >= C.WALL) this.emit({ type: 'squeeze' }); w = Math.min(w, this.wallCur - C.SQUEEZE * dt); }
      this.wallCur = Math.max(C.WALL_MIN, w);
      for (let i = 0; i < 2; i++) if (!this.f[i].remote) this.stepF(this.f[i], this.f[1 - i], inputs[i] || {}, dt);
      // ぶつかったら押し合う
      const a = this.f[0], b = this.f[1], dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), need = a.halfW + b.halfW;
      if (d < need && Math.abs(a.y - b.y) < 1.2) {
        const k = (need - d) / 2 / (d || 1), sx = d ? dx * k : 0.3 * (a.x <= b.x ? 1 : -1), sz = d ? dz * k : 0;
        if (!a.remote) { a.x -= sx; a.z -= sz; } if (!b.remote) { b.x += sx; b.z += sz; }
        for (const f of [a, b]) this.wall(f);
      }
      if (!this.online) this.checkEnd();
    }
    // 見えないかべ：残り30秒から、25秒かけてせまくなる
    wallNow() { return this.wallCur; }
    // ラストスパート：残り30秒で1.5倍、そこから最後は3倍まで上がる
    dmgMul() { return this.time > C.SPURT ? 1 : C.SPURT_DMG + (C.SPURT - this.time) / C.SPURT * 1.5; }
    wall(f) { const w = this.wallNow(); f.x = Math.max(-w, Math.min(w, f.x)); f.z = Math.max(-w, Math.min(w, f.z)); }
    checkEnd() {
      for (const f of this.f) if (!f.limbs().length) return this.end(1 - f.slot, 'ko');
      if (this.time <= 0) this.end(EK.judge(this.f), 'time');
    }
    end(w, why) { if (this.over) return; this.over = true; this.winner = w; this.emit({ type: 'over', winner: w, why }); }

    stepF(f, o, inp, dt) {
      f.t += dt;
      for (const p in f.flash) f.flash[p] = Math.max(0, f.flash[p] - dt);
      f.cd = Math.max(0, f.cd - dt); f.stun = Math.max(0, f.stun - dt); f.hurtT = Math.max(0, f.hurtT - dt * 1.6);
      f.hip = f.calcHip();
      // 向き：いつも相手の方（攻撃中は変えない）。絵の左右は、相手が画面のどちらにいるかで決める
      // パンチは、出してから当たる少し前までは相手を追いかける（ホーミング）
      const homing = f.act && f.act.type === 'punch' && f.act.t < f.act.hit * 0.7;
      if (!f.act || homing) {
        const dx = o.x - f.x, dz = o.z - f.z, d = Math.hypot(dx, dz) || 1;
        if (homing) { const k = Math.min(1, dt * 10); f.dx += (dx / d - f.dx) * k; f.dz += (dz / d - f.dz) * k; const n = Math.hypot(f.dx, f.dz) || 1; f.dx /= n; f.dz /= n; }
        else { f.dx = dx / d; f.dz = dz / d; if (Math.abs(dx) > 0.15) f.face = dx > 0 ? 1 : -1; }
      }
      // 移動
      let mx = inp.mx || 0, mz = inp.mz || 0; const ml = Math.hypot(mx, mz); if (ml > 1) { mx /= ml; mz /= ml; }
      let sp = f.speed(); if (f.act && f.act.type === 'punch') sp *= 0.25; if (f.act && f.act.type === 'lag') sp = 0; if (f.stun > 0) sp = 0;
      // 関節が多い足はふらふら：進む向きがゆれる
      // ふらつきは、向きを少しだけ（最大15°くらい）ゆっくり曲げる
      const nj = f.legJoints(), wob = Math.min(0.32, 0.045 * nj);
      f.sway = Math.sin(f.t * 5.3 + f.slot) * 0.6 + Math.sin(f.t * 8.7) * 0.4;
      const drift = Math.sin(f.t * 1.7 + f.slot * 2) * 0.7 + Math.sin(f.t * 2.9) * 0.3;
      if (ml > 0.1 && wob > 0) { const a = drift * wob, c = Math.cos(a), s = Math.sin(a); const nx = mx * c - mz * s, nz = mx * s + mz * c; mx = nx; mz = nz; }
      if (false) { const a = f.sway * wob, c = Math.cos(a), s = Math.sin(a); const nx = mx * c - mz * s, nz = mx * s + mz * c; mx = nx; mz = nz; }
      f.ox = Math.sin(f.t * 3.1 + 1) * 0.022 * nj; f.oz = Math.cos(f.t * 2.3) * 0.03 * nj;
      if (f.act && f.act.type === 'slam') { const v = f.act.t < 0.28 ? 6.5 : 0; f.vx = f.dx * v; f.vz = f.dz * v; }
      else { f.vx = mx * sp; f.vz = mz * sp; }
      f.x += (f.vx + f.kvx) * dt; f.z += (f.vz + f.kvz) * dt; this.wall(f);
      const kd = Math.exp(-9 * dt); f.kvx *= kd; f.kvz *= kd;
      // ジャンプ
      if (inp.jump && f.y <= 0 && f.stun <= 0 && (!f.act || f.act.type === 'punch') && f.legs().length) {
        f.vy = f.jumpV(); f.y = 0.001; if (f.act && f.act.type === 'punch' && f.act.t < f.act.hit) f.act = null; this.emit({ type: 'jump', slot: f.slot });
      }
      if (f.y > 0 || f.vy > 0) {
        f.vy -= C.G * dt; f.y += f.vy * dt;
        if (f.y <= 0) {
          f.y = 0; f.vy = 0; this.emit({ type: 'land', slot: f.slot });
          if (f.act && (f.act.type === 'jatk' || f.act.type === 'drop')) f.act = { type: 'lag', t: 0, dur: C.LAG };
        }
      }
      // 攻撃
      if (inp.atk && !f.act && f.cd <= 0 && f.stun <= 0) this.attack(f, o);
      const a = f.act;
      if (a) {
        a.t += dt;
        if (a.type === 'punch') {
          if (!a.done && a.t >= a.hit) { a.done = true; this.punchHit(f, o, a); }
          if (a.t >= a.hit + a.rec) { f.act = null; f.cd = 0.06; }
        } else if (a.type === 'jatk' || a.type === 'drop') {
          if (!a.done && f.vy < 2) {
            const reachF = a.type === 'jatk' ? f.reach() * 0.5 + 0.25 : 0.15;
            const P = [f.x + f.ox + f.dx * reachF, f.y + (a.type === 'jatk' ? f.hip * 0.6 : 0.1), f.z + f.oz + f.dz * reachF];
            const h = this.contact(o, P, 0.42);
            if (h) { a.done = true; this.hit(f, o, h, a.type === 'jatk' ? C.JATK_DMG + 0.8 * this.avgJoints(f) : C.DROP_DMG, a.type); }
          }
        } else if (a.type === 'slam') {
          if (!a.done && a.t < 0.32) {
            const P = [f.x + f.ox + f.dx * 0.45, f.y + f.hip + 0.25, f.z + f.oz + f.dz * 0.45];
            const h = this.contact(o, P, 0.42);
            if (h) { a.done = true; this.hit(f, o, h, C.SLAM_DMG, 'slam'); f.act.t = Math.max(f.act.t, 0.28); }
          }
          if (a.t >= 0.6) { f.act = null; f.cd = 0.15; }
        } else if (a.type === 'lag') { if (a.t >= a.dur) f.act = null; }
      }
    }
    avgJoints(f) { const A = f.arms(); return A.length ? A.reduce((n, p) => n + f.st.arms[p].joints, 0) / A.length : 0; }
    attack(f, o) {
      const A = f.arms();
      if (f.y > 0.05) { f.act = { type: A.length ? 'jatk' : 'drop', t: 0, done: false }; this.emit({ type: 'jatk', slot: f.slot }); return; }
      if (!A.length) { f.act = { type: 'slam', t: 0, done: false }; this.emit({ type: 'slam', slot: f.slot }); return; }
      const arm = A[f.armNext % A.length]; f.armNext++;
      const s = f.st.arms[arm], one = A.length === 1;
      f.act = { type: 'punch', arm, t: 0, hit: s.hitTime, rec: (0.16 + s.hitTime * 0.45) * (one ? 1.9 : 1), done: false };
      if (o) f.act.aim = this.punchLine(f, arm, s.reach, o).aim;
      this.emit({ type: 'punch', slot: f.slot, arm });
    }
    // パンチの線：つなぎ目から、相手の方向（少し下）へ、骨の長さぶん
    punchLine(f, arm, len, o) {
      const r0 = f.st.arms[arm].root, sh = f.wp(r0[0], r0[1]);
      let aim = C.AIM;
      if (o) {   // 相手の胸の高さをねらう（上下 35° まで）
        const tg = o.wp(W / 2, (o.box.y0 + HIP[1]) / 2), hd = Math.hypot(tg[0] - sh[0], tg[2] - sh[2]) || 1;
        aim = Math.max(-0.6, Math.min(0.6, Math.atan2(sh[1] - tg[1], hd)));
      }
      const c = Math.cos(aim);
      return { sh, d: [f.dx * c, -Math.sin(aim), f.dz * c], len, aim };
    }
    // 届くかどうか（画面の表示用：当てずに調べるだけ）
    canHit(f, o, arm) {
      if (!arm) return false;
      const s = f.st.arms[arm], L = this.punchLine(f, arm, s.reach, o), n = Math.max(2, Math.ceil(s.reach / 0.12));
      for (let i = 1; i <= n; i++) { const k = s.reach * i / n; if (this.contact(o, [L.sh[0] + L.d[0] * k, L.sh[1] + L.d[1] * k, L.sh[2] + L.d[2] * k], i === n ? s.tipR : s.tipR * 0.55)) return true; }
      return false;
    }
    punchHit(f, o, a) {
      const s = f.st.arms[a.arm], L = this.punchLine(f, a.arm, s.reach, o), n = Math.max(2, Math.ceil(s.reach / 0.12));
      a.aim = L.aim;
      for (let i = 1; i <= n; i++) {
        const k = s.reach * i / n, P = [L.sh[0] + L.d[0] * k, L.sh[1] + L.d[1] * k, L.sh[2] + L.d[2] * k];
        const h = this.contact(o, P, i === n ? s.tipR : s.tipR * 0.55);
        if (h) { a.stop = Math.max(0.45, i / n); this.hit(f, o, h, s.dmg, 'punch'); return; }   // 腕は当たった所で止まる
      }
      this.emit({ type: 'whiff', slot: f.slot });
    }
    // 相手の当たり判定（世界の点の一覧）。のばしている腕は、のびた形になる
    hurtPts(o, p) {
      const a = o.act;
      if (a && a.type === 'punch' && a.arm === p) {
        const q = a.t < a.hit ? a.t / a.hit : Math.max(0, 1 - (a.t - a.hit) / a.rec);
        if (q >= 0.4) {
          const s = o.st.arms[p], L = this.punchLine(o, p, s.reach * q), out = [];
          for (let k = 0.08; k <= L.len; k += 0.09) out.push({ w: [L.sh[0] + L.d[0] * k, L.sh[1] + L.d[1] * k, L.sh[2] + L.d[2] * k], at: null, flat: false });
          return out;
        }
      }
      return o.st.hurt[p].map(c => ({ w: o.wp(c[0], c[1]), at: c, flat: true }));
    }
    // 点 P（半径 r）が、相手のどのパーツに当たるか
    contact(o, P, r) {
      let best = null, bd = r + R6;
      for (const p of ['armL', 'armR', 'legL', 'legR', 'body']) {
        if (p !== 'body' && o.gone[p]) continue;
        for (const h of this.hurtPts(o, p)) {
          const dx = h.w[0] - P[0], dy = h.w[1] - P[1], dz = h.flat ? Math.max(0, Math.abs(h.w[2] - P[2]) - C.THICK) : h.w[2] - P[2];
          const d = Math.hypot(dx, dy, dz) + (p === 'body' ? 0 : -0.005);
          if (d < bd) { bd = d; best = { part: p, at: h.at, w: h.w }; }
        }
      }
      if (best) return best;
      // 当たりの箱（体の左右のはば・高さ・板のまわり）に入っていれば当たり
      const [cx, cy] = [W / 2 + (P[0] - o.x - o.ox) * o.face / S, HIP[1] - (P[1] - o.y - o.hip) / S];
      const pad = r / S;
      if (cx < o.box.x0 - pad * 0.5 || cx > o.box.x1 + pad * 0.5 || cy < o.box.y0 - pad * 0.5 || P[1] < o.y - 0.05 || Math.abs(P[2] - o.z - o.oz) > 0.3 + r) return null;
      let bd2 = 1e9;
      for (const p of ['armL', 'armR', 'legL', 'legR', 'body']) {
        if (p !== 'body' && o.gone[p]) continue;
        for (const c of o.st.hurt[p]) { const d = Math.hypot(c[0] - cx, c[1] - cy); if (d < bd2) { bd2 = d; best = { part: p, at: c, w: o.wp(c[0], c[1]) }; } }
      }
      return best;
    }
    hit(f, o, h, dmg, kind) {
      let part = h.part, crit = false, stun = 0;
      if (part === 'body') {
        const alive = o.limbs(); if (!alive.length) return;
        if (h.at && h.at[1] < o.st.headLine) { crit = true; part = alive[Math.floor(f.rng() * alive.length)]; dmg *= C.CRIT; stun = C.STUN; }
        else { let bd = 1e9; for (const p of alive) { const q = o.ch.bones[p][0], d = h.at ? Math.hypot(q[0] - h.at[0], q[1] - h.at[1]) : 0; if (d < bd) { bd = d; part = p; } } }
      }
      dmg *= this.dmgMul();
      this.noHit = 0;
      dmg = Math.round(dmg);
      const k = crit ? 0.6 : 0.3;
      const ev = { type: 'hit', from: f.slot, to: o.slot, part, dmg, crit, kind, x: h.w[0], y: h.w[1], z: h.w[2], kx: f.dx * k, kz: f.dz * k, stun };
      if (o.remote) { this.emit(Object.assign({ net: true }, ev)); return; }
      this.applyHit(o, ev);
    }
    // ダメージを入れる（オンラインでは、受けた側の画面だけがこれをする）
    applyHit(o, ev) {
      if (o.gone[ev.part]) { const alive = o.limbs(); if (!alive.length) return; ev.part = alive[0]; }
      this.noHit = 0;
      o.dur[ev.part] = Math.max(0, o.dur[ev.part] - ev.dmg); o.flash[ev.part] = 0.22; o.flash.body = 0.12;
      o.hurtT = Math.max(o.hurtT, ev.crit ? 0.4 : 0.22); o.stun = Math.max(o.stun, ev.stun || 0);
      o.kvx += (ev.kx || 0) * 9; o.kvz += (ev.kz || 0) * 9;
      if (ev.crit && o.y <= 0 && o.legs().length) { o.vy = 3.2; o.y = 0.001; }   // クリティカルは少しうき上がる
      this.emit(Object.assign({}, ev, { net: false }));
      if (o.dur[ev.part] <= 0 && !o.gone[ev.part]) {
        o.gone[ev.part] = true; this.emit({ type: 'break', slot: o.slot, part: ev.part, dir: Math.sign(ev.kx || 1) });
        if (o.act && o.act.arm === ev.part) o.act = null;
      }
    }
  }
  // 時間切れの判定：残ったうで・あしの本数 → 同じなら残りの耐久の合計
  EK.judge = f => {
    const n = f.map(x => x.limbs().length), s = f.map(x => x.limbs().reduce((a, p) => a + x.dur[p], 0));
    return n[0] !== n[1] ? (n[0] > n[1] ? 0 : 1) : Math.abs(s[0] - s[1]) > 0.5 ? (s[0] > s[1] ? 0 : 1) : -1;
  };
  EK.Match = Match; EK.Fighter = Fighter;
})();
