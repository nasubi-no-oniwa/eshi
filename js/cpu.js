// =============================================
//  CPU：よわい・ふつう・つよい
// =============================================
(function () {
  const LV = {
    easy:   { react: 0.55, dodge: 0.08, atk: 0.45, jatk: 0.0, keep: 0.55, wander: 0.5 },
    normal: { react: 0.28, dodge: 0.4,  atk: 0.75, jatk: 0.12, keep: 0.8, wander: 0.2 },
    hard:   { react: 0.12, dodge: 0.8,  atk: 0.95, jatk: 0.3, keep: 0.9, wander: 0.05 }
  };
  class Cpu {
    constructor(match, slot, level) { this.m = match; this.slot = slot; this.L = LV[level] || LV.normal; this.th = 0; this.inp = {}; this.seen = null; this.r = Math.random; this.wz = 0; this.air = 0; }
    reach(f) { const A = f.arms(); return A.length ? Math.max(...A.map(p => f.st.arms[p].reach)) : 0.5; }
    update(dt) {
      const me = this.m.f[this.slot], o = this.m.f[1 - this.slot], L = this.L;
      const out = { mx: this.inp.mx || 0, mz: this.inp.mz || 0, atk: false, jump: false };
      // 相手のパンチをジャンプでよける（1発につき1回だけ考える）
      if (o.act && o.act.type === 'punch' && this.seen !== o.act) {
        this.seen = o.act;
        const s = o.st.arms[o.act.arm], d = Math.hypot(o.x - me.x, o.z - me.z);
        if (s && d < s.reach + 0.6 && this.r() < L.dodge) this.dodgeAt = Math.max(0, o.act.hit - 0.22 - this.r() * 0.1);
      }
      if (this.dodgeAt != null) { this.dodgeAt -= dt; if (this.dodgeAt <= 0) { out.jump = true; this.dodgeAt = null; } }
      // 空中攻撃
      if (me.y > 0.4 && me.vy < 1 && this.air > 0) { out.atk = true; this.air = 0; }
      this.th -= dt;
      if (this.th <= 0) {
        this.th = L.react * (0.7 + this.r() * 0.6);
        const dx = o.x - me.x, dz = o.z - me.z, d = Math.hypot(dx, dz) || 1, ux = dx / d, uz = dz / d, R = this.reach(me), oR = this.reach(o);
        // 間合い：自分のうでが長ければ、相手の届かない所から
        let want = R * L.keep;
        if (R > oR + 0.3 && L.keep > 0.7) want = Math.max(want, Math.min(R * 0.9, oR + 0.35));
        let mv = 0;
        if (d > want + 0.15) mv = 1; else if (d < want - 0.35) mv = L.keep > 0.7 ? -1 : -0.4;
        // 横にまわりこむ
        if (this.r() < 0.35 + L.wander) this.side = (this.r() - 0.5) * 2 * (0.4 + L.wander);
        let mx = ux * mv - uz * (this.side || 0), mz = uz * mv + ux * (this.side || 0);
        if (!me.legs().length) { mx = 0; mz = 0; }
        this.inp = { mx, mz }; out.mx = mx; out.mz = mz;
        // 攻撃：届くときだけ（よわいは、届かなくても出す）
        const can = this.m.canHit(me, o, me.nextArm()) || (!me.arms().length && d < 1.1);
        const atkP = this.m.time < 30 ? Math.max(L.atk, 0.85) : L.atk;   // 最後の30秒は、よわいCPUも攻めてくる
        if (!me.act && (can || (L.atk < 0.5 && d < R + 0.6)) && this.r() < atkP) out.atk = true;
        // 飛びこみ
        else if (d < R + 1.4 && d > R * 0.6 && me.legs().length && this.r() < L.jatk) { out.jump = true; this.air = 1; out.mx = ux; out.mz = uz; }
      }
      return out;
    }
  }
  EK.Cpu = Cpu;
})();
