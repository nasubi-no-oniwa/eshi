// =============================================
//  キャラのデータ（絵・骨）と、そこから決まる強さ
//  キャンバスは 540×720（実際の画素は1.5倍）。y は下向き
//  パーツ：body（頭と体）・armL・armR・legL・legR（左右は画面で見たときの左右）・ex1〜ex4（かざり：しっぽ・羽など）
//  うで・あし・かざりには骨がある。骨の根元（つなぎ目）は自由に動かせる
// =============================================
window.EK = window.EK || {};
(function () {
  const W = 540, H = 720, PX = 1.5, K = 1.2;   // K：最初の版（300×400）からの大きさ
  const OX = 90, OY = 120;                      // 2番目の版（360×480）を、まん中に置くためのずれ
  const EXS = ['ex1', 'ex2', 'ex3', 'ex4'];
  const PARTS = ['body', 'armL', 'armR', 'legL', 'legR', ...EXS];
  const LIMBS = ['armL', 'armR', 'legL', 'legR'];
  const BONED = [...LIMBS, ...EXS];
  const NAMES = {}; for (const p of PARTS) Object.defineProperty(NAMES, p, { get: () => I18N.t('p_' + p), enumerable: true });
  // 最初の版の座標 → 今の座標
  const sc = pts => pts.map(q => [Math.round(q[0] * K + OX), Math.round(q[1] * K + OY)]);
  // 最初のつなぎ目の場所（あとで自由に動かせる）
  const DEF_BONE = { armL: sc([[118, 150], [48, 150]]), armR: sc([[182, 150], [252, 150]]), legL: sc([[132, 245], [132, 360]]), legR: sc([[168, 245], [168, 360]]),
    ex1: sc([[170, 230], [230, 270]]), ex2: sc([[150, 60], [150, 20]]), ex3: sc([[130, 230], [70, 270]]), ex4: sc([[150, 140], [150, 190]]) };
  const ROOT = {}; for (const p in DEF_BONE) ROOT[p] = DEF_BONE[p][0];
  const HIP = [270, 414];
  const MAX_JOINTS = 8, MIN_SEG = 10;
  const COLORS = ['#2b1d14', '#ffffff', '#ef4444', '#f97316', '#f5b800', '#22c55e', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899'];
  EK.CH = { W, H, PX, PARTS, LIMBS, BONED, EXS, NAMES, ROOT, DEF_BONE, HIP, MAX_JOINTS, MIN_SEG, COLORS };

  const mk = () => { const c = document.createElement('canvas'); c.width = W * PX; c.height = H * PX; c.getContext('2d', { willReadFrequently: true }); return c; };
  EK.newCanvas = mk;
  // うで・あしの骨は、はじめから黒い線で描かれている（上から色をぬれる。ぬらなければ黒い線のまま）
  const BONE_W = 7;
  EK.drawBoneLine = (x, b, k = 1) => {
    x.save(); x.strokeStyle = '#2b1d14'; x.lineWidth = BONE_W * k; x.lineCap = 'round'; x.lineJoin = 'round';
    x.beginPath(); b.forEach((q, i) => i ? x.lineTo(q[0] * k, q[1] * k) : x.moveTo(q[0] * k, q[1] * k)); x.stroke(); x.restore();
  };
  // 骨の線と、描いた絵を重ねたもの（戦うとき・当たり判定・見本の表示に使う）。scale で小さくできる
  EK.compLayer = (ch, p, scale = 1) => {
    const c = document.createElement('canvas'); c.width = Math.round(W * PX * scale); c.height = Math.round(H * PX * scale);
    const x = c.getContext('2d', { willReadFrequently: true });
    if (LIMBS.includes(p) && ch.bones[p]) EK.drawBoneLine(x, ch.bones[p], PX * scale);
    x.drawImage(ch.layers[p], 0, 0, c.width, c.height);
    return c;
  };
  // 重ねる順番（かざりは「体の前」にしたものだけ前）
  EK.drawOrder = ch => [...EXS.filter(p => !(ch.front && ch.front[p])), 'legL', 'legR', 'body', 'armL', 'armR', ...EXS.filter(p => ch.front && ch.front[p])];
  // 空のキャラ
  EK.emptyChar = () => {
    const c = { layers: {}, bones: {}, front: {} };
    for (const p of PARTS) c.layers[p] = mk();
    for (const p of BONED) c.bones[p] = DEF_BONE[p].map(q => q.slice());
    return c;
  };
  // 使い終わったキャラの絵をすぐ手放す（スマホはキャンバスのメモリが少ない）
  EK.freeChar = ch => { if (!ch || !ch.layers) return; for (const p in ch.layers) { const c = ch.layers[p]; if (c) { c.width = 1; c.height = 1; } } ch.layers = null; };
  EK.cloneChar = ch => {
    const c = { layers: {}, bones: {}, name: ch.name, id: ch.id || '', author: ch.author || '', front: Object.assign({}, ch.front || {}) };
    for (const p of PARTS) { c.layers[p] = mk(); c.layers[p].getContext('2d').drawImage(ch.layers[p], 0, 0); }
    for (const p of BONED) c.bones[p] = (ch.bones[p] || DEF_BONE[p]).map(q => q.slice());
    return c;
  };

  // ---------- 骨のチェック ----------
  const segX = (a, b, c, d) => { // 線分 ab と cd が交わる
    const o = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
    return o(a, b, c) * o(a, b, d) < 0 && o(c, d, a) * o(c, d, b) < 0;
  };
  EK.boneOk = pts => {
    if (pts.length < 2 || pts.length > MAX_JOINTS + 2) return false;
    for (let i = 0; i < pts.length; i++) {
      const [x, y] = pts[i];
      if (!i) { if (x < 0 || x > W || y < 0 || y > H) return false; continue; }
      if (x < 2 || x > W - 2 || y < 2 || y > H - 2) return false;
      if (Math.hypot(x - pts[i - 1][0], y - pts[i - 1][1]) < MIN_SEG) return false;
    }
    // 骨どうしが重ならない
    for (let i = 0; i < pts.length - 1; i++) for (let j = i + 2; j < pts.length - 1; j++) if (segX(pts[i], pts[i + 1], pts[j], pts[j + 1])) return false;
    // うずまき禁止：曲がった角度の合計が1周（360°）に届かない
    let turn = 0;
    for (let i = 1; i < pts.length - 1; i++) {
      const a1 = Math.atan2(pts[i][1] - pts[i - 1][1], pts[i][0] - pts[i - 1][0]), a2 = Math.atan2(pts[i + 1][1] - pts[i][1], pts[i + 1][0] - pts[i][0]);
      let d = a2 - a1; d = Math.atan2(Math.sin(d), Math.cos(d));
      // 1か所でほぼ折り返す（170°以上）のもだめ
      if (Math.abs(d) > Math.PI * 0.95) return false;
      turn += d;
      if (Math.abs(turn) >= Math.PI * 2 - 0.05) return false;
    }
    return true;
  };
  EK.boneLen = pts => { let n = 0; for (let i = 1; i < pts.length; i++) n += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]); return n; };

  // ---------- 絵の形（色がぬってある所）----------
  // 12×12 のマスごとに「ぬってあるか」を調べる → 当たり判定の円
  const CELL = 10;
  function alphaGrid(cv) {
    const ctx = cv.getContext('2d'), d = ctx.getImageData(0, 0, cv.width, cv.height).data;
    const gw = Math.ceil(W / CELL), gh = Math.ceil(H / CELL), g = new Uint8Array(gw * gh);
    let any = false, x0 = W, y0 = H, x1 = 0, y1 = 0;
    for (let gy = 0; gy < gh; gy++) for (let gx = 0; gx < gw; gx++) {
      let n = 0;
      for (let y = gy * CELL * PX; y < Math.min(H * PX, (gy + 1) * CELL * PX); y += 3) for (let x = gx * CELL * PX; x < Math.min(W * PX, (gx + 1) * CELL * PX); x += 3) if (d[(y * W * PX + x) * 4 + 3] > 60) n++;
      if (n >= 3) { g[gy * gw + gx] = 1; any = true; x0 = Math.min(x0, gx * CELL); y0 = Math.min(y0, gy * CELL); x1 = Math.max(x1, (gx + 1) * CELL); y1 = Math.max(y1, (gy + 1) * CELL); }
    }
    return { g, gw, gh, any, box: any ? [x0, y0, x1, y1] : null };
  }
  EK.alphaGrid = alphaGrid;

  // ---------- 強さ（骨と絵から決まる）----------
  // 骨の長さ（キャンバスの単位）→ 世界の長さ
  const S = EK.SCALE = 1 / 108;
  EK.stats = function (ch) {
    const st = { arms: {}, legs: {}, hurt: {}, box: {} };
    for (const p of PARTS) {
      const a = alphaGrid(EK.compLayer(ch, p)); st.box[p] = a.box;
      if (p[0] === 'e') { st.hurt[p] = []; continue; }   // かざりは当たり判定なし
      const circ = [];
      for (let gy = 0; gy < a.gh; gy++) for (let gx = 0; gx < a.gw; gx++) if (a.g[gy * a.gw + gx]) circ.push([(gx + 0.5) * CELL, (gy + 0.5) * CELL]);
      // 何も描いていない腕・足は、骨そのものを細い当たり判定にする
      if (!circ.length && ch.bones[p]) { const b = ch.bones[p]; for (let i = 1; i < b.length; i++) for (let t = 0; t <= 1; t += 0.2) circ.push([b[i - 1][0] + (b[i][0] - b[i - 1][0]) * t, b[i - 1][1] + (b[i][1] - b[i - 1][1]) * t]); }
      st.hurt[p] = circ;
    }
    for (const p of ['armL', 'armR']) {
      const b = ch.bones[p], len = EK.boneLen(b), j = b.length - 2;
      st.arms[p] = {
        len, joints: j, reach: len * S,
        root: b[0],
        hitTime: 0.11 + 0.25 * (len / 100 / K) + 0.05 * j,     // 攻撃ボタン → 当たるまで（秒）
        tipR: 0.2 + 0.07 * j,                            // 当たる範囲（関節が多いほど広い）
        dmg: 9.5 + 2.2 * j                                // ダメージ（関節が多いほど少し大きい）
      };
    }
    // 足：縦の長さ＝体の高さ。長いほど速い・高くとぶ
    let foot = HIP[1];
    for (const p of ['legL', 'legR']) {
      const b = ch.bones[p]; let low = Math.max(...b.map(q => q[1]));
      const bx = st.box[p]; if (bx) low = Math.max(low, bx[3] - 4);
      const h = Math.max(20, low - Math.min(HIP[1], b[0][1])) / K;
      st.legs[p] = { len: EK.boneLen(b), h, low, joints: b.length - 2 };
      foot = Math.max(foot, low);
    }
    st.foot = foot;
    const bb = st.box.body;
    st.bodyBottom = bb ? bb[3] : HIP[1];
    st.bodyTop = bb ? bb[1] : 80;
    st.headLine = st.bodyTop + ((bb ? bb[3] : HIP[1]) - st.bodyTop) * 0.4;   // これより上は「頭」＝急所
    st.bodyMidX = bb ? (bb[0] + bb[2]) / 2 : W / 2;
    return st;
  };

  // 描いた所だけを切り出して、大きく見せる（タイトル・試合後・一覧の小さい絵）
  EK.drawPreview = (ch, cv, keep) => {
    const x = cv.getContext('2d'); if (!keep) x.clearRect(0, 0, cv.width, cv.height);
    if (!ch || !ch.layers) { x.fillStyle = 'rgba(43,29,20,.3)'; x.font = '900 40px sans-serif'; x.textAlign = 'center'; x.fillText('？', cv.width / 2, cv.height / 2 + 14); return; }
    const t = document.createElement('canvas'); t.width = Math.round(W * PX * 0.3); t.height = Math.round(H * PX * 0.3);
    const tx = t.getContext('2d', { willReadFrequently: true });
    for (const p of EK.drawOrder(ch)) { const l = EK.compLayer(ch, p, 0.3); tx.drawImage(l, 0, 0); l.width = 1; }
    const d = tx.getImageData(0, 0, t.width, t.height).data; let x0 = t.width, y0 = t.height, x1 = 0, y1 = 0;
    for (let y = 0; y < t.height; y += 2) for (let xx = 0; xx < t.width; xx += 2) if (d[(y * t.width + xx) * 4 + 3] > 20) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 <= x0) { x0 = 0; y0 = 0; x1 = t.width; y1 = t.height; }
    const pad = 6, bw = x1 - x0 + pad * 2, bh = y1 - y0 + pad * 2, k = Math.min(cv.width / bw, cv.height / bh);
    x.drawImage(t, x0 - pad, y0 - pad, bw, bh, (cv.width - bw * k) / 2, (cv.height - bh * k) / 2, bw * k, bh * k);
    t.width = 1;
  };

  // らくがきバトルで体を描けなかったとき：黒い棒人間の頭と体
  EK.stickBody = ch => {
    if (EK.alphaGrid(ch.layers.body).any) return false;
    const x = ch.layers.body.getContext('2d'); x.save(); x.scale(PX, PX);
    x.strokeStyle = '#2b1d14'; x.fillStyle = '#ffffff'; x.lineWidth = 9; x.lineCap = 'round';
    x.beginPath(); x.arc(270, 250, 52, 0, 7); x.fill(); x.stroke();
    x.beginPath(); x.moveTo(270, 302); x.lineTo(270, 420); x.stroke();
    x.fillStyle = '#2b1d14'; for (const dx of [-18, 18]) { x.beginPath(); x.arc(270 + dx, 245, 6, 0, 7); x.fill(); }
    x.restore(); return true;
  };
  // ---------- 保存 ----------
  EK.saveChar = (ch, key = 'ek_char') => {
    try {
      const o = { v: 3, name: ch.name || '', id: ch.id || '', author: ch.author || '', layers: {}, bones: ch.bones, front: ch.front || {} };
      for (const p of PARTS) o.layers[p] = ch.layers[p].toDataURL('image/png');
      localStorage.setItem(key, JSON.stringify(o)); return true;
    } catch (e) { return false; }
  };
  EK.packChar = (ch, scale = 1) => {
    const o = { v: 3, name: ch.name || '', id: ch.id || '', author: ch.author || '', layers: {}, bones: ch.bones, front: ch.front || {} };
    for (const p of PARTS) {
      let c = ch.layers[p];
      if (scale !== 1) { const t = document.createElement('canvas'); t.width = W * PX * scale; t.height = H * PX * scale; t.getContext('2d').drawImage(c, 0, 0, t.width, t.height); c = t; }
      o.layers[p] = c.toDataURL('image/png');
    }
    return JSON.stringify(o);
  };
  EK.unpackChar = str => new Promise((res, rej) => {
    let o; try { o = typeof str === 'string' ? JSON.parse(str) : str; } catch (e) { return rej(e); }
    const ch = EK.emptyChar(); ch.name = o.name || ''; ch.id = /^[A-Z0-9]{8}$/.test(o.id || '') ? o.id : ''; ch.author = String(o.author || '').slice(0, 8);
    // 前の版のキャラは、大きさと場所を合わせる（体の大きさは変えない）
    const v = o.v || 1, k = v >= 2 ? 1 : K, ox = v >= 3 ? 0 : OX, oy = v >= 3 ? 0 : OY;
    for (const p of BONED) if (o.bones && Array.isArray(o.bones[p])) { const b = o.bones[p].map(q => [Math.round(+q[0] * k + ox), Math.round(+q[1] * k + oy)]); if (EK.boneOk(b)) ch.bones[p] = b; }
    ch.front = Object.assign({}, o.front || {});
    let n = 0;
    for (const p of PARTS) {
      const im = new Image();
      im.onload = () => { const x = ch.layers[p].getContext('2d'); if (v >= 3) x.drawImage(im, 0, 0, W * PX, H * PX); else x.drawImage(im, OX * PX, OY * PX, 360 * PX, 480 * PX); if (++n === PARTS.length) res(ch); };
      im.onerror = () => { if (++n === PARTS.length) res(ch); };
      if (o.layers && o.layers[p]) im.src = o.layers[p]; else { if (++n === PARTS.length) res(ch); }
    }
  });
  // ライバル帳：自分が前に描いたキャラ・対戦相手のキャラ（CPUの相手として出てくる）。8体まで
  EK.Pool = {
    MAX: 8,
    list() { try { return JSON.parse(localStorage.getItem('ek_pool') || '[]'); } catch (e) { return []; } },
    add(ch, from) {
      const L = this.list().filter(e => !(e.from === from && e.name === (ch.name || '') && from === 'self'));
      L.unshift({ from, name: ch.name || '', s: EK.packChar(ch, 0.5), t: Date.now() });
      while (L.length > this.MAX) L.pop();
      for (let n = L.length; n > 0; n--) { try { localStorage.setItem('ek_pool', JSON.stringify(L.slice(0, n))); return true; } catch (e) {} }
      return false;
    },
    clear() { try { localStorage.removeItem('ek_pool'); } catch (e) {} }
  };
  EK.loadChar = (key = 'ek_char') => { try { const s = localStorage.getItem(key); return s ? EK.unpackChar(s) : Promise.resolve(null); } catch (e) { return Promise.resolve(null); } };

  // ---------- CPUのキャラ（コードで描く）----------
  function pen(ch, part, fn) { const x = ch.layers[part].getContext('2d'); x.save(); x.scale(PX, PX); x.translate(OX, OY); x.scale(K, K); x.lineCap = 'round'; x.lineJoin = 'round'; fn(x); x.restore(); }
  const INK = '#2b1d14';
  function limbAlong(x, pts, w, fill, ink = INK) {
    for (const [ww, col] of [[w + 6, ink], [w, fill]]) { x.strokeStyle = col; x.lineWidth = ww; x.beginPath(); pts.forEach((p, i) => i ? x.lineTo(p[0], p[1]) : x.moveTo(p[0], p[1])); x.stroke(); }
  }
  function blob(x, cx, cy, r, fill) { x.fillStyle = fill; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.arc(cx, cy, r, 0, 7); x.fill(); x.stroke(); }
  function face(x, cx, cy, s, mouth = 'smile') {
    x.fillStyle = '#fff'; x.strokeStyle = INK; x.lineWidth = 3;
    for (const dx of [-1, 1]) { x.beginPath(); x.arc(cx + dx * 13 * s, cy, 9 * s, 0, 7); x.fill(); x.stroke(); x.fillStyle = INK; x.beginPath(); x.arc(cx + dx * 13 * s + 2, cy + 1, 4 * s, 0, 7); x.fill(); x.fillStyle = '#fff'; }
    x.strokeStyle = INK; x.lineWidth = 4; x.beginPath();
    if (mouth === 'smile') x.arc(cx, cy + 14 * s, 10 * s, 0.2, Math.PI - 0.2); else { x.moveTo(cx - 12 * s, cy + 20 * s); x.lineTo(cx + 12 * s, cy + 20 * s); }
    x.stroke();
  }
  EK.sampleChars = function (only) {
    const out = {}; let c;
    // よわい：ぼうにんげん（短い手足・関節なし）
    if (!only || only === 'easy') {
    c = EK.emptyChar(); c.name = I18N.t('smp_easy');
    pen(c, 'body', x => { blob(x, 150, 100, 46, '#fde68a'); face(x, 150, 96, 1); limbAlong(x, [[150, 146], [150, 248]], 10, INK); });
    c.bones.armL = [[118, 150], [70, 185]]; c.bones.armR = [[182, 150], [230, 185]];
    c.bones.legL = [[132, 245], [118, 335]]; c.bones.legR = [[168, 245], [182, 335]];
    for (const p of ['armL', 'armR']) pen(c, p, x => { limbAlong(x, c.bones[p], 8, INK); blob(x, ...c.bones[p][1], 10, '#fde68a'); });
    for (const p of ['legL', 'legR']) pen(c, p, x => { limbAlong(x, c.bones[p], 9, INK); x.fillStyle = INK; x.beginPath(); x.ellipse(c.bones[p][1][0] + (p === 'legL' ? -6 : 6), c.bones[p][1][1], 14, 7, 0, 0, 7); x.fill(); });
    out.easy = c; }
    // ふつう：ロボット（ひじ・ひざ1つずつ）
    if (!only || only === 'normal') {
    c = EK.emptyChar(); c.name = I18N.t('smp_normal');
    pen(c, 'body', x => {
      x.fillStyle = '#94a3b8'; x.strokeStyle = INK; x.lineWidth = 5;
      x.beginPath(); x.roundRect(108, 40, 84, 78, 14); x.fill(); x.stroke();
      x.fillStyle = '#ef4444'; x.beginPath(); x.roundRect(106, 128, 88, 124, 16); x.fill(); x.stroke();
      x.fillStyle = '#f5b800'; x.beginPath(); x.arc(150, 180, 16, 0, 7); x.fill(); x.stroke();
      x.fillStyle = '#7dd3fc'; x.beginPath(); x.roundRect(118, 64, 64, 26, 8); x.fill(); x.stroke();
      x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.moveTo(150, 40); x.lineTo(150, 22); x.stroke(); blob(x, 150, 18, 7, '#f5b800');
    });
    c.bones.armL = [[118, 150], [80, 196], [52, 160]]; c.bones.armR = [[182, 150], [220, 196], [248, 160]];
    c.bones.legL = [[132, 245], [128, 305], [126, 362]]; c.bones.legR = [[168, 245], [172, 305], [174, 362]];
    for (const p of ['armL', 'armR']) pen(c, p, x => { limbAlong(x, c.bones[p], 20, '#3b82f6'); blob(x, ...c.bones[p][1], 11, '#94a3b8'); const t = c.bones[p][2]; x.fillStyle = '#f5b800'; x.strokeStyle = INK; x.lineWidth = 4; x.beginPath(); x.roundRect(t[0] - 14, t[1] - 14, 28, 28, 7); x.fill(); x.stroke(); });
    for (const p of ['legL', 'legR']) pen(c, p, x => { limbAlong(x, c.bones[p], 24, '#3b82f6'); blob(x, ...c.bones[p][1], 12, '#94a3b8'); const t = c.bones[p][2]; x.fillStyle = INK; x.beginPath(); x.roundRect(t[0] - 20 + (p === 'legL' ? -6 : 6), t[1] - 6, 40, 16, 6); x.fill(); });
    out.normal = c; }
    // つよい：たこ（長いうで・関節たくさん）
    if (!only || only === 'hard') {
    c = EK.emptyChar(); c.name = I18N.t('smp_hard');
    pen(c, 'body', x => {
      x.fillStyle = '#ec4899'; x.strokeStyle = INK; x.lineWidth = 5; x.beginPath(); x.ellipse(150, 120, 62, 74, 0, 0, 7); x.fill(); x.stroke();
      x.beginPath(); x.ellipse(150, 222, 40, 34, 0, 0, 7); x.fill(); x.stroke();
      face(x, 150, 120, 1.15, 'line');
      x.fillStyle = 'rgba(255,255,255,.45)'; for (const [a, b, r] of [[118, 80, 9], [180, 92, 6], [128, 158, 5]]) { x.beginPath(); x.arc(a, b, r, 0, 7); x.fill(); }
    });
    const wave = (r0, dir, n, L, amp) => { const pts = [r0.slice()]; for (let i = 1; i <= n; i++) pts.push([r0[0] + dir * L * i / n, r0[1] + Math.sin(i * 1.1) * amp]); return pts; };
    c.bones.armL = wave([118, 150], -1, 6, 104, 14); c.bones.armR = wave([182, 150], 1, 6, 104, 14);
    c.bones.legL = [[132, 245], [120, 280], [128, 316], [116, 352]]; c.bones.legR = [[168, 245], [180, 280], [172, 316], [184, 352]];
    for (const p of LIMBS) pen(c, p, x => {
      limbAlong(x, c.bones[p], p[0] === 'a' ? 16 : 18, '#ec4899');
      x.fillStyle = '#fbcfe8'; x.strokeStyle = INK; x.lineWidth = 2;
      const b = c.bones[p]; for (let i = 1; i < b.length; i++) { const m = [(b[i][0] + b[i - 1][0]) / 2, (b[i][1] + b[i - 1][1]) / 2]; x.beginPath(); x.arc(m[0], m[1] + 3, 4, 0, 7); x.fill(); x.stroke(); }
    });
    out.hard = c; }
    // 骨は前の版の座標で書いたので、大きさを合わせる（絵は pen で合わせている）
    for (const k in out) for (const p of LIMBS) out[k].bones[p] = sc(out[k].bones[p]);
    for (const k in out) for (const p of LIMBS) if (!EK.boneOk(out[k].bones[p])) console.warn('sample bone bad', k, p);
    return out;
  };
})();
