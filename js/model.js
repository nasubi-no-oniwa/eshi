// =============================================
//  描いた絵 → 厚みのある立体。うで・あしは骨（スキン）で曲げて動かす
//  キャンバス座標 (cx, cy) → キャラの中の座標：x=(cx-W/2)*S, y=-(cy-HIP)*S
//  体はいつもカメラの方を向く。うで・あしは、つなぎ目を中心に相手の方へ向きを変えて飛び出す
// =============================================
(function () {
  const { W, H, PX, PARTS, LIMBS, HIP } = EK.CH;
  const S = EK.SCALE, T = 7 * S;              // 厚みの半分
  const CELL = 5;                              // メッシュのマス（キャンバス単位）
  const SLICES = [-1, -0.34, 0.34, 1];           // 厚みを作る重ね枚数（スマホで軽いように少なめ）
  const TEX = 0.6;                             // 戦うときの絵の大きさ（元の6割。軽くするため）
  const Z = { body: 0, armL: 0.18, armR: 0.2, legL: -0.14, legR: -0.12, ex1: -0.26, ex2: -0.24, ex3: -0.22, ex4: -0.2 };
  const zOf = (ch, p) => p[0] === 'e' && ch.front && ch.front[p] ? 0.3 + (+p[2]) * 0.02 : Z[p];
  const toX = cx => (cx - W / 2) * S, toY = cy => -(cy - HIP[1]) * S;
  EK.toLocal = (cx, cy) => [toX(cx), toY(cy)];

  // 色がぬってあるマスだけで、厚みのある板を作る
  function buildGeo(cv, bones) {
    const ctx = cv.getContext('2d'), d = ctx.getImageData(0, 0, cv.width, cv.height).data, K = cv.width / W, CW = cv.width;
    const gw = W / CELL, gh = H / CELL, on = new Uint8Array(gw * gh);
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      let hit = false;
      for (let y = Math.floor(gy * CELL * K); y < (gy + 1) * CELL * K && !hit; y += 1) for (let x = Math.floor(gx * CELL * K); x < (gx + 1) * CELL * K; x += 1) if (d[(y * CW + x) * 4 + 3] > 30) { hit = true; break; }
      on[gy * gw + gx] = hit ? 1 : 0;
    }
    const pos = [], uv = [], col = [], idx = [], skI = [], skW = [];
    const segs = bones ? bones.slice(1).map((b, i) => [bones[i], b]) : null;
    const weights = (cx, cy) => {
      if (!segs) return null;
      const ds = segs.map(([a, b]) => { const dx = b[0] - a[0], dy = b[1] - a[1], L2 = dx * dx + dy * dy || 1; const t = Math.max(0, Math.min(1, ((cx - a[0]) * dx + (cy - a[1]) * dy) / L2)); return Math.hypot(a[0] + dx * t - cx, a[1] + dy * t - cy); });
      const ord = ds.map((v, i) => [v, i]).sort((p, q) => p[0] - q[0]).slice(0, 2);
      if (ord.length < 2) return [ord[0][1], 0, 1, 0];
      // 関節の近くは2本の骨のあいだで少しずつ曲がる
      const [d0, i0] = ord[0], [d1, i1] = ord[1];
      const near = Math.abs(i0 - i1) === 1 ? Math.max(0, 1 - (d1 - d0) / 16) : 0;
      const w1 = 0.5 * near;
      return [i0, i1, 1 - w1, w1];
    };
    const vmap = new Map();
    for (let si = 0; si < SLICES.length; si++) {
      const z = SLICES[si] * T, shade = Math.abs(SLICES[si]) === 1 ? 1 : 0.62;
      vmap.clear();
      const V = (gx, gy) => {
        const k = gy * (gw + 1) + gx; if (vmap.has(k)) return vmap.get(k);
        const cx = gx * CELL, cy = gy * CELL, n = pos.length / 3;
        pos.push(toX(cx), toY(cy), z); uv.push(cx / W, 1 - cy / H); col.push(shade, shade, shade);
        const w = weights(cx, cy); if (w) { skI.push(w[0], w[1], 0, 0); skW.push(w[2], w[3], 0, 0); }
        vmap.set(k, n); return n;
      };
      for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) if (on[gy * gw + gx]) {
        const a = V(gx, gy), b = V(gx + 1, gy), c = V(gx + 1, gy + 1), e = V(gx, gy + 1);
        idx.push(a, e, b, b, e, c);
      }
    }
    if (!idx.length) return null;
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    if (segs) { geo.setAttribute('skinIndex', new THREE.Uint16BufferAttribute(skI, 4)); geo.setAttribute('skinWeight', new THREE.Float32BufferAttribute(skW, 4)); }
    geo.setIndex(idx); geo.computeVertexNormals(); geo.computeBoundingSphere();
    return geo;
  }

  // 骨の向き（キャンバス上の角度。y下向きなので世界では符号が逆）
  const angs = b => b.slice(1).map((q, i) => Math.atan2(q[1] - b[i][1], q[0] - b[i][0]));
  const lens = b => b.slice(1).map((q, i) => Math.hypot(q[0] - b[i][0], q[1] - b[i][1]));

  // キャラ1体ぶんの立体
  EK.buildModel = function (ch) {
    const st = EK.stats(ch);
    const root = new THREE.Group();      // 地面の位置
    const rig = new THREE.Group();       // 腰の高さ・向き（左右反転）・ゆれ
    root.add(rig);
    const parts = {};
    for (const p of PARTS) {
      const comp = EK.compLayer(ch, p, TEX);
      const tex = new THREE.CanvasTexture(comp); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 4;
      const mat = new THREE.MeshLambertMaterial({ map: tex, transparent: false, alphaTest: 0.35, side: THREE.DoubleSide, vertexColors: true });
      mat.emissive = new THREE.Color(0, 0, 0);
      const bones = ch.bones[p] || null;
      const geo = buildGeo(comp, bones);
      // holder：つなぎ目が中心（ここを回すと、うでが相手の方を向く）
      const holder = new THREE.Group(), inner = new THREE.Group(); holder.add(inner); rig.add(holder);
      if (bones) { holder.position.set(toX(bones[0][0]), toY(bones[0][1]), zOf(ch, p)); inner.position.set(-toX(bones[0][0]), -toY(bones[0][1]), 0); }
      else holder.position.z = zOf(ch, p);
      const info = { holder, inner, mat, tex, mesh: null, bones: null, rest: null, lens: bones ? lens(bones) : null, root: bones ? bones[0] : null, hp: 1, flash: 0, yaw: 0 };
      if (geo && bones) {
        // 骨：根元から順に親子でつなぐ。それぞれの骨の x 軸が、その骨の向き
        const A = angs(bones), L = info.lens, bs = [];
        for (let i = 0; i < A.length; i++) {
          const bn = new THREE.Bone();
          if (i === 0) { bn.position.set(toX(bones[0][0]), toY(bones[0][1]), 0); bn.rotation.z = -A[0]; }
          else { bn.position.set(L[i - 1] * S, 0, 0); bn.rotation.z = -(A[i] - A[i - 1]); }
          if (i) bs[i - 1].add(bn); bs.push(bn);
        }
        // 先っぽ用の骨（いちばん先の位置を知るため）
        const tip = new THREE.Bone(); tip.position.set(L[L.length - 1] * S, 0, 0); bs[bs.length - 1].add(tip);
        const mesh = new THREE.SkinnedMesh(geo, mat);
        mesh.add(bs[0]); inner.add(mesh);
        mesh.updateMatrixWorld(true);
        mesh.bind(new THREE.Skeleton(bs.concat([tip])));
        mesh.frustumCulled = false;
        info.mesh = mesh; info.bones = bs; info.tip = tip; info.rest = A;
      } else if (geo) {
        const mesh = new THREE.Mesh(geo, mat); inner.add(mesh); info.mesh = mesh;
      }
      parts[p] = info;
    }
    const m = { root, rig, parts, st, ch, hipH: Math.max(0.15, (st.foot - HIP[1]) * S), walk: 0, prevAct: null };
    return m;
  };

  // ---------- 動き ----------
  const lerpA = (a, b, t) => { let d = b - a; d = Math.atan2(Math.sin(d), Math.cos(d)); return a + d * t; };
  const ease = t => t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t);
  // 骨の向きを「キャンバス上の絶対角度」の配列で決める
  function pose(info, abs) {
    if (!info.bones) return;
    for (let i = 0; i < info.bones.length; i++) info.bones[i].rotation.z = -(i ? abs[i] - abs[i - 1] : abs[0]);
  }
  // パンチ：根元から順に、ねらう方向へまっすぐのびる（q=0〜1）
  function reach(rest, aim, q) {
    const n = rest.length;
    return rest.map((a, i) => lerpA(a, aim, ease(q * (1 + 0.5 * (n - 1) / n) - 0.5 * i / Math.max(1, n))));
  }
  // しなる揺れ：根元が動き、先は少しおくれてついてくる
  function swing(rest, amp, ph, lag = 0.55) { return rest.map((a, i) => a + amp * Math.sin(ph - i * lag) * (1 + i * 0.12)); }

  // f：戦いの中のキャラのようす（sim.js の Fighter）
  EK.animate = function (m, f, dt, now) {
    const P = m.parts, face = f.face;
    // 向き（左右反転）
    m.rig.scale.x += (face - m.rig.scale.x) * Math.min(1, dt * 18);
    // 腰の高さ（足がもげると下がる）
    const legsAlive = ['legL', 'legR'].filter(p => !f.gone[p]);
    let hip = 0.15;
    for (const p of legsAlive) hip = Math.max(hip, (m.st.legs[p].low - HIP[1]) * S);
    if (!legsAlive.length) hip = Math.max(0.12, (m.st.bodyBottom - HIP[1]) * S);
    m.hipH += (hip - m.hipH) * Math.min(1, dt * 6);
    // 歩き
    const sp = Math.hypot(f.vx, f.vz), moving = sp > 0.2 && f.y <= 0.001;
    m.walk += dt * (moving ? 7 + sp * 1.5 : 0);
    let bob = 0, tilt = 0;
    if (legsAlive.length === 1 && moving) bob = Math.abs(Math.sin(m.walk)) * 0.18;          // けんけん
    else if (moving) bob = Math.abs(Math.sin(m.walk)) * 0.05;
    else bob = Math.sin(now * 2.2) * 0.012;
    if (f.stun > 0) tilt = -0.25 * Math.sin(f.stun * 30) * Math.min(1, f.stun * 3);
    if (f.hurtT > 0) tilt -= f.hurtT * 0.9;
    tilt += f.sway * 0.4;
    m.rig.position.set(0, m.hipH + f.y + bob, 0);
    m.rig.rotation.z += (tilt - m.rig.rotation.z) * Math.min(1, dt * 14);
    m.rig.rotation.x = -0.3;      // カメラの方へ倒して、絵を見やすく
    // 相手の方向（キャラの中の向き）：holder を y で回すと、うでの x 軸がこの向きになる
    const aimYaw = Math.atan2(-(f.dz || 0), (f.dx || 1) * face);
    const moveYaw = moving ? Math.max(-1.1, Math.min(1.1, Math.atan2(-f.vz, Math.abs(f.vx) + 0.001))) * 0.6 : 0;
    const turn = (I, want) => { I.yaw += (want - I.yaw) * Math.min(1, dt * 16); I.holder.rotation.y = I.yaw; };
    m.root.position.set(f.x + f.ox, 0, f.z + f.oz);

    // 足
    for (const p of ['legL', 'legR']) {
      const I = P[p]; if (!I.bones || f.gone[p]) continue;
      const side = p === 'legL' ? 0 : Math.PI;
      let abs = I.rest;
      if (f.y > 0.02) abs = swing(I.rest, 0.35, side + 1.2, 0.3);                 // 空中：ひざを曲げる
      else if (moving) abs = swing(I.rest, legsAlive.length === 1 ? 0.15 : 0.5, m.walk + side);
      else abs = swing(I.rest, 0.03, now * 2 + side);
      pose(I, abs); turn(I, moveYaw);
    }
    // かざり：ゆらゆら
    for (const p of EK.CH.EXS) {
      const I = P[p]; if (!I.bones) continue;
      pose(I, swing(I.rest, 0.16 + Math.min(0.25, sp * 0.06) + f.hurtT * 0.6, now * (3.2 + sp) + (+p[2]) * 1.7, 0.8));
    }
    // うで
    const act = f.act;
    for (const p of ['armL', 'armR']) {
      const I = P[p]; if (!I.bones || f.gone[p]) continue;
      let abs = swing(I.rest, moving ? 0.22 : 0.05, (moving ? m.walk : now * 2) + (p === 'armL' ? 0 : Math.PI));
      let yw = 0;
      if (act && act.type === 'punch' && act.arm === p) {
        // 当たる時間までに、のびきる。そのあともどる
        let q = act.t < act.hit ? act.t / act.hit : Math.max(0, 1 - (act.t - act.hit) / act.rec);
        q = Math.min(q, act.stop || 1);   // 当たった所で止まる
        // ねらう方向：正面（キャンバスの右＝0）で、少し下
        abs = reach(I.rest, act.aim != null ? act.aim : 0.12, q); yw = aimYaw * Math.min(1, q * 2.5);
      } else if (act && (act.type === 'jatk')) {
        const q = Math.min(1, act.t / 0.18);
        abs = I.rest.map((a, i) => lerpA(a, lerpA(-1.4, 0.9, q), 0.85 - i * 0.03)); yw = aimYaw;
      } else if (act && act.type === 'slam') {
        abs = I.rest.map(a => lerpA(a, 1.6, 0.6));
      }
      pose(I, abs); turn(I, yw);
    }
    // ダメージで色が濃くなる・当たった瞬間は白く光る
    for (const p of PARTS) {
      const I = P[p]; if (!I.mesh) continue;
      const hp = p === 'body' || p[0] === 'e' ? 1 : Math.max(0, f.dur[p] / EK.CONFIG.DUR);
      const k = 0.5 + 0.5 * hp, warm = 1 - hp;
      I.mat.color.setRGB(k, k * (1 - warm * 0.08), k * (1 - warm * 0.12));
      if (f.flash[p] > 0) { I.mat.emissive.setScalar(Math.min(0.8, f.flash[p] * 4)); } else I.mat.emissive.setScalar(0);
    }
  };
  // パンチの先の世界の位置（表示用）
  EK.tipWorld = function (m, p, out) { const I = m.parts[p]; if (!I || !I.tip) return null; I.tip.updateWorldMatrix(true, false); return (out || new THREE.Vector3()).setFromMatrixPosition(I.tip.matrixWorld); };

  // もげたパーツを、体から切りはなして飛ばす
  EK.detach = function (m, p, scene, dir) {
    const I = m.parts[p]; if (!I.mesh || I.flying) return null;
    I.holder.updateWorldMatrix(true, true); scene.updateWorldMatrix(true, false);
    const wpos = new THREE.Vector3(), wq = new THREE.Quaternion(), ws = new THREE.Vector3();
    new THREE.Matrix4().copy(scene.matrixWorld).invert().multiply(I.holder.matrixWorld).decompose(wpos, wq, ws);
    // つなぎ目を中心に、くるくる回りながら飛んでいく
    const g = new THREE.Group(); g.position.copy(wpos); g.quaternion.copy(wq); g.scale.copy(ws);
    scene.add(g); g.add(I.holder); I.holder.position.set(0, 0, 0); I.holder.rotation.set(0, 0, 0); I.holder.scale.set(1, 1, 1);
    const fly = { g, base: g.scale.clone(), vx: dir * (2.5 + Math.random() * 1.5), vy: 4 + Math.random() * 2, vz: (Math.random() - 0.5) * 2, spin: (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 6), life: 0, I };
    I.flying = fly; I.mat.color.setRGB(0.55, 0.5, 0.48);
    return fly;
  };
  EK.stepFly = function (fl, dt) {
    fl.life += dt; const g = fl.g;
    fl.vy -= 14 * dt; g.position.x += fl.vx * dt; g.position.y += fl.vy * dt; g.position.z += fl.vz * dt;
    g.rotation.z += fl.spin * dt;
    if (g.position.y < 0.12) { g.position.y = 0.12; fl.vy = Math.abs(fl.vy) * 0.35; fl.vx *= 0.6; fl.vz *= 0.6; fl.spin *= 0.6; if (Math.abs(fl.vy) < 0.6) fl.vy = 0; }
    if (fl.life > 4) { const a = Math.max(0.001, 1 - (fl.life - 4)); g.scale.copy(fl.base).multiplyScalar(a); }
    return fl.life < 5;
  };
  EK.disposeModel = function (m) {
    const objs = [m.root];
    for (const p of PARTS) { const I = m.parts[p]; if (I.flying) objs.push(I.flying.g); }
    // 骨の動きのデータ（GPUの中）も消す
    for (const r of objs) r.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.isSkinnedMesh && o.skeleton) o.skeleton.dispose(); });
    for (const p of PARTS) { const im = m.parts[p].tex && m.parts[p].tex.image; if (im && im.width) { im.width = 1; im.height = 1; } }
    for (const p of PARTS) { const I = m.parts[p]; I.mat.dispose(); I.tex.dispose(); if (I.flying && I.flying.g.parent) I.flying.g.parent.remove(I.flying.g); }
  };
})();
