// =============================================
//  キャラをつくる画面：ペン・ぬりつぶし・けしゴム・図形・スタンプ・骨
//  2本指（PCはホイール）で拡大・移動できる
// =============================================
(function () {
  const { W, H, PX, PARTS, LIMBS, BONED, EXS, COLORS, MAX_JOINTS } = EK.CH;
  const PAIR = { armL: 'armR', armR: 'armL', legL: 'legR', legR: 'legL', ex1: 'ex2', ex2: 'ex1', ex3: 'ex4', ex4: 'ex3' };
  const STAMPS = [['eyes', '👀 目'], ['tsuri', '😠 つり目'], ['kira', '✨ キラ目'], ['smile', '🙂 口'], ['gao', '😮 大口'], ['kiba', '🦷 キバ'], ['blush', '☺ ほっぺ'], ['star', '⭐ 星'], ['heart', '❤ ハート']];
  const $ = id => document.getElementById(id);
  const cv = $('ed-canvas'), g = cv.getContext('2d');
  let ch = null, part = 'body', tool = 'pen', color = COLORS[0], size = 8, dpr = 1;
  let shape = 'line', shapeFill = false, stamp = 'eyes';
  let dirty = false, raku = null;   // dirty：開いてから何か変えたか（変えたら新しいIDになる）／raku：らくがきバトル中
  let undo = [], drawing = null, boneDrag = null, rootDrag = null, shapeDrag = null, onDone = null;
  // 表示：z＝拡大率（キャンバス1 → 画面 z px）、vx/vy＝ずらし（画面 px）
  let z = 1, z0 = 1, vx = 0, vy = 0, cw = 0, chh = 0;

  function layout() {
    const wrap = $('ed-wrap'); cw = wrap.clientWidth; chh = wrap.clientHeight;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.width = Math.round(cw * dpr); cv.height = Math.round(chh * dpr); cv.style.width = cw + 'px'; cv.style.height = chh + 'px';
    z0 = Math.min(cw / W, chh / H) * 0.98; fit();
  }
  function fit() { z = z0; vx = (cw - W * z) / 2; vy = (chh - H * z) / 2; draw(); }
  function clampView() {
    z = Math.max(z0, Math.min(z0 * 5, z));
    const minX = Math.min(0, cw - W * z) - 40, maxX = Math.max(0, cw - W * z) + 40, minY = Math.min(0, chh - H * z) - 40, maxY = Math.max(0, chh - H * z) + 40;
    vx = Math.max(minX, Math.min(maxX, vx)); vy = Math.max(minY, Math.min(maxY, vy));
  }
  function zoomAt(k, sx, sy) { const cx = (sx - vx) / z, cy = (sy - vy) / z; z *= k; clampView(); vx = sx - cx * z; vy = sy - cy * z; clampView(); draw(); }
  window.addEventListener('resize', () => { if (ch && $('editor').classList.contains('active')) layout(); });

  // ---------- 表示 ----------
  function draw() {
    if (!ch) return;
    g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, cv.width, cv.height);
    g.setTransform(dpr * z, 0, 0, dpr * z, dpr * vx, dpr * vy);
    // 紙とマス目
    g.fillStyle = '#fff'; g.fillRect(0, 0, W, H);
    g.strokeStyle = '#eef2f6'; g.lineWidth = 1 / z;
    for (let x = 0; x <= W; x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, H); g.stroke(); }
    for (let y = 0; y <= H; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
    g.strokeStyle = '#2b2a35'; g.lineWidth = 2 / z; g.strokeRect(0, 0, W, H);
    // 重ねて表示（選んでいないパーツはうすく）
    for (const p of EK.drawOrder(ch)) { g.globalAlpha = p === part ? 1 : 0.3; if (LIMBS.includes(p)) EK.drawBoneLine(g, ch.bones[p]); g.drawImage(ch.layers[p], 0, 0, W, H); }
    g.globalAlpha = 1;
    // 図形のプレビュー
    if (shapeDrag) { g.save(); shapePath(g, shapeDrag.a, shapeDrag.b); if (shapeFill && shape !== 'line') { g.fillStyle = color; g.fill(); } g.strokeStyle = color; g.lineWidth = size; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); g.restore(); }
    if (part === 'body') { g.fillStyle = 'rgba(59,42,32,.45)'; g.font = `900 ${12}px "M PLUS Rounded 1c", sans-serif`; g.textAlign = 'center'; g.fillText('●＝うで・あし・かざりがつく場所（「骨」で動かせる）', W / 2, H - 12); }
    // 骨
    const boneMode = tool === 'bone', u = 1 / Math.max(1, z / z0);   // 拡大しても点は大きくなりすぎない
    for (const p of BONED) {
      if (p !== part && !(part === 'body')) continue;
      if (p !== part && p[0] === 'e' && !EK.alphaGrid(ch.layers[p]).any) continue;
      const b = ch.bones[p], on = p === part;
      g.globalAlpha = on ? (boneMode ? 1 : 0.55) : (boneMode ? 0.6 : 0.3);
      g.strokeStyle = '#7c5cff'; g.lineWidth = (boneMode && on ? 5 : 3) * u; g.lineCap = 'round'; g.lineJoin = 'round';
      g.beginPath(); b.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); g.stroke();
      b.forEach((q, i) => {
        g.beginPath();
        if (i === 0) { g.fillStyle = '#f5b800'; g.arc(q[0], q[1], (boneMode ? 10 : 7) * u, 0, 7); g.fill(); g.strokeStyle = '#2b1d14'; g.lineWidth = 2 * u; g.stroke(); }
        else if (i === b.length - 1) { g.fillStyle = '#7c5cff'; g.arc(q[0], q[1], (boneMode && on ? 8 : 4) * u, 0, 7); g.fill(); g.strokeStyle = '#2b1d14'; g.lineWidth = 2 * u; g.stroke(); }
        else { g.fillStyle = '#fff'; g.arc(q[0], q[1], (boneMode && on ? 8 : 4) * u, 0, 7); g.fill(); g.strokeStyle = '#7c5cff'; g.lineWidth = 3 * u; g.stroke(); }
      });
      g.globalAlpha = 1;
    }
    hud();
  }
  function sub() {
    // 道具ごとの、くわしい設定（説明の行に出す）
    const el = $('ed-bone-tip');
    el.classList.toggle('text', tool === 'bone');
    if (tool === 'bone') el.innerHTML = part !== 'body' ? '<b>骨をタップ</b>：関節を足す／<b>関節</b>：ドラッグで曲げる・タップで消す（' + (ch.bones[part].length - 2) + '/' + MAX_JOINTS + '）／<b>黄色の●</b>：つく場所を動かす' : '<b>黄色の●</b>をドラッグすると、うで・あし・かざりのつく場所を動かせます';
    else if (tool === 'shape') el.innerHTML = [['line', '／ 直線'], ['circle', '○ 丸'], ['rect', '□ 四角']].map(([k, t]) => `<button data-shape="${k}" class="${shape === k ? 'on' : ''}">${t}</button>`).join('') + `<button data-sfill="1" class="${shapeFill ? 'on' : ''}">中もぬる</button>`;
    else if (tool === 'stamp') el.innerHTML = STAMPS.map(([k, t]) => `<button data-stamp="${k}" class="${stamp === k ? 'on' : ''}">${t}</button>`).join('');
    else if (part[0] === 'e') el.innerHTML = `<button data-front="1" class="${ch.front[part] ? 'on' : ''}">${ch.front[part] ? '体の前に出ている' : '体の後ろにある'}（タップで切りかえ）</button>`;
    else el.innerHTML = '';
  }
  let lastTab = null;
  function hud() {
    sub();
    const isLimb = part !== 'body', st = $('ed-stat');
    if (isLimb) {
      const b = ch.bones[part], len = EK.boneLen(b), j = b.length - 2;
      if (part[0] === 'e') st.innerHTML = 'かざり：当たり判定なし・ゆらゆらゆれる';
      else if (part[0] === 'a') { const hit = 0.11 + 0.25 * (len / 100 / 1.2) + 0.05 * j; st.innerHTML = `とどく長さ <b>${Math.round(len)}</b>　当たるまで <b>${hit.toFixed(2)}秒</b>　関節 <b>${j}</b>`; }
      else { const low = Math.max(...b.map(q => q[1])); st.innerHTML = `足の長さ <b>${Math.round(Math.max(20, low - b[0][1]))}</b>（長い＝速い・当たりやすい）　関節 <b>${j}</b>`; }
    } else st.innerHTML = '上のほうが<b>頭</b>（当たるとクリティカル）';
    document.querySelectorAll('#ed-tabs button').forEach(b => { const on = b.dataset.part === part; b.classList.toggle('on', on); if (on && b !== lastTab) { lastTab = b; const t = $('ed-tabs'); t.scrollTo({ left: b.offsetLeft - (t.clientWidth - b.offsetWidth) / 2, behavior: 'smooth' }); } });
    document.querySelectorAll('#ed-tools button[data-tool]').forEach(b => b.classList.toggle('on', b.dataset.tool === tool));
    document.querySelectorAll('#ed-colors button[data-c]').forEach(b => b.classList.toggle('on', b.dataset.c === color));
    const cb = $('ed-color-free'); cb.classList.toggle('on', !COLORS.includes(color)); if (!COLORS.includes(color)) cb.style.background = color;
    $('ed-size').value = size; $('ed-size-n').textContent = size; $('ed-size-dot').style.width = $('ed-size-dot').style.height = Math.max(3, Math.min(28, size * z)) + 'px';
    $('ed-size-dot').style.background = tool === 'erase' ? '#fff' : color;
    $('ed-undo').disabled = !undo.length;
    $('ed-mirror').disabled = !PAIR[part];
    $('ed-mirror').textContent = PAIR[part] ? EK.CH.NAMES[PAIR[part]] + 'へコピー' : '左右コピー';
  }
  $('ed-bone-tip').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.shape) shape = b.dataset.shape;
    if (b.dataset.sfill) shapeFill = !shapeFill;
    if (b.dataset.stamp) stamp = b.dataset.stamp;
    if (b.dataset.front) ch.front[part] = !ch.front[part];
    draw();
  });

  // ---------- やりなおし ----------
  // やりなおし用に、描いてある所だけを切り取って覚える（スマホのメモリを使いすぎない）
  const UNDO_MAX = 25, UNDO_BYTES = 48e6;
  function crop(L) {
    const x = L.getContext('2d'), w = L.width, h = L.height, d = new Uint32Array(x.getImageData(0, 0, w, h).data.buffer);
    let x0 = w, y0 = h, x1 = -1, y1 = -1;
    for (let y = 0; y < h; y++) { const r = y * w; let a = -1, b = -1; for (let i = 0; i < w; i++) if (d[r + i]) { a = i; break; } if (a < 0) continue; for (let i = w - 1; i >= a; i--) if (d[r + i]) { b = i; break; } if (a < x0) x0 = a; if (b > x1) x1 = b; if (y < y0) y0 = y; y1 = y; }
    if (x1 < 0) return null;
    return { x: x0, y: y0, img: x.getImageData(x0, y0, x1 - x0 + 1, y1 - y0 + 1) };
  }
  function copyCanvas(L) { const c = document.createElement('canvas'); c.width = L.width; c.height = L.height; c.getContext('2d').drawImage(L, 0, 0); return c; }
  const dropCanvas = c => { if (c) { c.width = 1; c.height = 1; } };
  function snap(pp = part) {
    dirty = true;
    undo.push({ part: pp, img: crop(ch.layers[pp]), bones: ch.bones[pp] ? ch.bones[pp].map(q => q.slice()) : null });
    let bytes = 0; for (const u of undo) bytes += u.img ? u.img.img.data.length : 0;
    while (undo.length > 1 && (undo.length > UNDO_MAX || bytes > UNDO_BYTES)) { const u = undo.shift(); bytes -= u.img ? u.img.img.data.length : 0; }
  }
  function restore(u) { const x = ch.layers[u.part].getContext('2d'); x.clearRect(0, 0, W * PX, H * PX); if (u.img) x.putImageData(u.img.img, u.img.x, u.img.y); if (u.bones) ch.bones[u.part] = u.bones; }
  $('ed-undo').onclick = () => { const u = undo.pop(); if (!u) return; restore(u); part = u.part; draw(); };
  $('ed-clear').onclick = () => {
    snap(); ch.layers[part].getContext('2d').clearRect(0, 0, W * PX, H * PX);
    if (ch.bones[part]) ch.bones[part] = EK.CH.DEF_BONE[part].map(q => q.slice());
    draw();
  };

  // ---------- 描く ----------
  const lctx = () => ch.layers[part].getContext('2d');
  function line(ctx, a, b, w, col, erase) {
    ctx.save(); ctx.scale(PX, PX); ctx.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    ctx.strokeStyle = col; ctx.lineWidth = w; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0] + 0.01, b[1]); ctx.stroke(); ctx.restore();
  }
  function shapePath(x, a, b) {
    x.beginPath();
    if (shape === 'line') { x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); }
    else if (shape === 'rect') x.rect(Math.min(a[0], b[0]), Math.min(a[1], b[1]), Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]));
    else x.ellipse((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, Math.abs(b[0] - a[0]) / 2 + 0.01, Math.abs(b[1] - a[1]) / 2 + 0.01, 0, 0, 7);
  }
  function commitShape(a, b) {
    const x = lctx(); x.save(); x.scale(PX, PX); shapePath(x, a, b);
    if (shapeFill && shape !== 'line') { x.fillStyle = color; x.fill(); }
    x.strokeStyle = color; x.lineWidth = size; x.lineCap = 'round'; x.lineJoin = 'round'; x.stroke(); x.restore();
  }
  // スタンプ：大きさは「ふとさ」で変わる
  function putStamp(p) {
    const x = lctx(), s = 10 + size * 1.6, ink = '#2b1d14';
    x.save(); x.scale(PX, PX); x.translate(p[0], p[1]); x.lineCap = 'round'; x.lineJoin = 'round'; x.lineWidth = Math.max(2, s * 0.12); x.strokeStyle = ink;
    const eye = (ex, r, pr, look) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(ex, 0, r, 0, 7); x.fill(); x.stroke(); x.fillStyle = ink; x.beginPath(); x.arc(ex + look, r * 0.1, pr, 0, 7); x.fill(); };
    if (stamp === 'eyes') { eye(-s * 0.55, s * 0.42, s * 0.2, s * 0.06); eye(s * 0.55, s * 0.42, s * 0.2, s * 0.06); }
    else if (stamp === 'tsuri') {
      for (const d of [-1, 1]) { x.fillStyle = '#fff'; x.beginPath(); x.moveTo(d * s * 0.15, -s * 0.05); x.lineTo(d * s * 0.95, -s * 0.35); x.lineTo(d * s * 0.85, s * 0.3); x.lineTo(d * s * 0.2, s * 0.3); x.closePath(); x.fill(); x.stroke(); x.fillStyle = ink; x.beginPath(); x.arc(d * s * 0.5, s * 0.1, s * 0.13, 0, 7); x.fill(); }
    } else if (stamp === 'kira') {
      for (const d of [-1, 1]) { x.fillStyle = ink; x.beginPath(); x.ellipse(d * s * 0.55, 0, s * 0.36, s * 0.46, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(d * s * 0.55 - s * 0.12, -s * 0.15, s * 0.13, 0, 7); x.arc(d * s * 0.55 + s * 0.12, s * 0.16, s * 0.06, 0, 7); x.fill(); }
    } else if (stamp === 'smile') { x.lineWidth = Math.max(2, s * 0.14); x.beginPath(); x.arc(0, -s * 0.2, s * 0.6, 0.25, Math.PI - 0.25); x.stroke(); }
    else if (stamp === 'gao') { x.fillStyle = '#e5484d'; x.beginPath(); x.moveTo(-s * 0.7, -s * 0.15); x.quadraticCurveTo(0, -s * 0.35, s * 0.7, -s * 0.15); x.quadraticCurveTo(s * 0.5, s * 0.75, 0, s * 0.75); x.quadraticCurveTo(-s * 0.5, s * 0.75, -s * 0.7, -s * 0.15); x.fill(); x.stroke(); }
    else if (stamp === 'kiba') { x.beginPath(); x.moveTo(-s * 0.8, 0); x.lineTo(s * 0.8, 0); x.stroke(); x.fillStyle = '#fff'; for (const d of [-0.45, 0.45]) { x.beginPath(); x.moveTo(d * s - s * 0.15, 0); x.lineTo(d * s, s * 0.45); x.lineTo(d * s + s * 0.15, 0); x.closePath(); x.fill(); x.stroke(); } }
    else if (stamp === 'blush') { x.fillStyle = 'rgba(244,114,182,.7)'; for (const d of [-1, 1]) { x.beginPath(); x.ellipse(d * s * 0.8, 0, s * 0.32, s * 0.2, 0, 0, 7); x.fill(); } }
    else if (stamp === 'star') { x.fillStyle = color; x.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? s * 0.38 : s * 0.85; x.lineTo(Math.cos(a) * r, Math.sin(a) * r); } x.closePath(); x.fill(); x.stroke(); }
    else if (stamp === 'heart') { x.fillStyle = color; x.beginPath(); x.moveTo(0, s * 0.7); x.bezierCurveTo(-s * 1.1, -s * 0.1, -s * 0.5, -s * 0.9, 0, -s * 0.3); x.bezierCurveTo(s * 0.5, -s * 0.9, s * 1.1, -s * 0.1, 0, s * 0.7); x.fill(); x.stroke(); }
    x.restore();
  }
  function fill(p) {
    const L = ch.layers[part], ctx = L.getContext('2d'), w = L.width, h = L.height;
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    const sx = Math.floor(p[0] * PX), sy = Math.floor(p[1] * PX); if (sx < 0 || sy < 0 || sx >= w || sy >= h) return;
    const i0 = (sy * w + sx) * 4, t = [d[i0], d[i0 + 1], d[i0 + 2], d[i0 + 3]];
    const nc = [parseInt(color.slice(1, 3), 16), parseInt(color.slice(3, 5), 16), parseInt(color.slice(5, 7), 16), 255];
    const same = i => t[3] < 40 ? d[i + 3] < 40 : Math.abs(d[i] - t[0]) + Math.abs(d[i + 1] - t[1]) + Math.abs(d[i + 2] - t[2]) < 60 && d[i + 3] > 100;
    if (t[3] > 40 && Math.abs(t[0] - nc[0]) + Math.abs(t[1] - nc[1]) + Math.abs(t[2] - nc[2]) < 6) return;
    // 何もない所をぬるときは、キャンバスのはしまで広がったらやめる（全部ぬれるのを防ぐ）
    const seen = new Uint8Array(w * h), st = [sx + sy * w], list = []; let edge = false;
    seen[st[0]] = 1;
    while (st.length) {
      const q = st.pop(), x = q % w, y = (q - x) / w; list.push(q);
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1) edge = true;
      for (const n of [q - 1, q + 1, q - w, q + w]) { if (n < 0 || n >= w * h || seen[n]) continue; if ((n % w === 0 && x === w - 1) || (x === 0 && n % w === w - 1)) continue; seen[n] = 1; if (same(n * 4)) st.push(n); }
      if (list.length > w * h * 0.6) break;
    }
    if (t[3] < 40 && edge) { EK.toast && EK.toast('線でかこまれた所をぬってね'); return; }
    snap();
    for (const q of list) { const i = q * 4; d[i] = nc[0]; d[i + 1] = nc[1]; d[i + 2] = nc[2]; d[i + 3] = 255; }
    ctx.putImageData(img, 0, 0);
    draw();
  }
  const near = () => 16 / z;
  function nearJoint(p, b) { let best = -1, bd = near(); for (let i = 1; i < b.length; i++) { const d = Math.hypot(b[i][0] - p[0], b[i][1] - p[1]); if (d < bd) { bd = d; best = i; } } return best; }
  function nearSeg(p, b) {
    let best = -1, bd = near() * 0.9, at = null;
    for (let i = 1; i < b.length; i++) {
      const [ax, ay] = b[i - 1], [bx, by] = b[i], dx = bx - ax, dy = by - ay, L2 = dx * dx + dy * dy;
      const t = Math.max(0.08, Math.min(0.92, ((p[0] - ax) * dx + (p[1] - ay) * dy) / L2));
      const q = [ax + dx * t, ay + dy * t], d = Math.hypot(q[0] - p[0], q[1] - p[1]);
      if (d < bd) { bd = d; best = i; at = q; }
    }
    return best < 0 ? null : { i: best, at };
  }

  // ---------- 指の操作 ----------
  const ptrs = new Map(); let pinch = null;
  function pt(e) { const r = cv.getBoundingClientRect(); return [(e.clientX - r.left - vx) / z, (e.clientY - r.top - vy) / z]; }
  function cancelAction() {
    // 2本目の指が来たら、1本目で始めた描き込みは取り消す
    if (drawing || shapeDrag || boneDrag || rootDrag) { const u = undo.pop(); if (u && drawing) restore(u); else if (u) restore(u); }
    if (rootDrag) dropCanvas(rootDrag.img);
    drawing = shapeDrag = boneDrag = rootDrag = null;
  }
  cv.addEventListener('pointerdown', e => {
    if (!ch) return; e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (er) {}
    const r = cv.getBoundingClientRect(); ptrs.set(e.pointerId, [e.clientX - r.left, e.clientY - r.top]);
    if (ptrs.size === 2) { cancelAction(); const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, z, m: [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2], vx, vy }; draw(); return; }
    if (ptrs.size > 2 || pinch) return;
    const p = pt(e);
    if (tool === 'bone') {
      // 黄色の●（つなぎ目）：つく場所ごと動かす（描いた絵もいっしょに動く）
      for (const q of (part === 'body' ? BONED : [part])) {
        const r0 = ch.bones[q][0];
        if (Math.hypot(r0[0] - p[0], r0[1] - p[1]) < near()) { snap(q); rootDrag = { p: q, start: p, bones: ch.bones[q].map(v => v.slice()), img: copyCanvas(ch.layers[q]) }; return; }
      }
      if (part === 'body') { EK.toast && EK.toast('黄色の●をドラッグすると、つく場所を動かせます'); return; }
      const b = ch.bones[part], j = nearJoint(p, b);
      if (j > 0) { snap(); boneDrag = { i: j, start: p, moved: false }; return; }
      const s = nearSeg(p, b);
      if (s) {
        if (b.length - 2 >= MAX_JOINTS) { EK.toast && EK.toast('関節は' + MAX_JOINTS + 'こまで'); return; }
        const nb = b.slice(); nb.splice(s.i, 0, s.at.map(v => Math.round(v)));
        if (EK.boneOk(nb)) { snap(); ch.bones[part] = nb; boneDrag = { i: s.i, start: p, moved: true }; draw(); }
      }
      return;
    }
    if (tool === 'fill') { fill(p); return; }
    if (tool === 'stamp') { snap(); putStamp(p); draw(); return; }
    if (tool === 'shape') { snap(); shapeDrag = { a: p, b: p }; draw(); return; }
    snap(); drawing = { last: p };
    line(lctx(), p, p, tool === 'erase' ? size * 1.8 : size, color, tool === 'erase'); draw();
  });
  cv.addEventListener('pointermove', e => {
    if (!ch) return;
    const r = cv.getBoundingClientRect();
    if (ptrs.has(e.pointerId)) ptrs.set(e.pointerId, [e.clientX - r.left, e.clientY - r.top]);
    if (pinch) {
      if (ptrs.size < 2) return;
      const [a, b] = [...ptrs.values()], d = Math.hypot(a[0] - b[0], a[1] - b[1]) || 1, m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      const cx = (pinch.m[0] - pinch.vx) / pinch.z, cy = (pinch.m[1] - pinch.vy) / pinch.z;
      z = pinch.z * d / pinch.d; clampView(); vx = m[0] - cx * z; vy = m[1] - cy * z; clampView(); draw(); return;
    }
    const p = pt(e);
    if (rootDrag) {
      const dx = Math.round(p[0] - rootDrag.start[0]), dy = Math.round(p[1] - rootDrag.start[1]);
      const nb = rootDrag.bones.map(q => [q[0] + dx, q[1] + dy]);
      if (EK.boneOk(nb)) { ch.bones[rootDrag.p] = nb; const x = ch.layers[rootDrag.p].getContext('2d'); x.clearRect(0, 0, W * PX, H * PX); x.drawImage(rootDrag.img, dx * PX, dy * PX); draw(); }
      return;
    }
    if (boneDrag) {
      const b = ch.bones[part]; if (Math.hypot(p[0] - boneDrag.start[0], p[1] - boneDrag.start[1]) > 4 / z * z0) boneDrag.moved = true;
      if (!boneDrag.moved) return;
      const nb = b.map(q => q.slice()); nb[boneDrag.i] = [Math.round(p[0]), Math.round(p[1])];
      if (EK.boneOk(nb)) { ch.bones[part] = nb; draw(); }
      return;
    }
    if (shapeDrag) { shapeDrag.b = p; draw(); return; }
    if (drawing) { line(lctx(), drawing.last, p, tool === 'erase' ? size * 1.8 : size, color, tool === 'erase'); drawing.last = p; draw(); }
  });
  const up = e => {
    ptrs.delete(e.pointerId);
    if (pinch) { if (ptrs.size === 0) pinch = null; return; }
    if (rootDrag) { const b = ch.bones[rootDrag.p]; if (b[0][0] === rootDrag.bones[0][0] && b[0][1] === rootDrag.bones[0][1]) undo.pop(); dropCanvas(rootDrag.img); rootDrag = null; draw(); }
    if (boneDrag) {
      const b = ch.bones[part];
      if (!boneDrag.moved && boneDrag.i < b.length - 1) { const nb = b.slice(); nb.splice(boneDrag.i, 1); if (EK.boneOk(nb)) ch.bones[part] = nb; else EK.toast && EK.toast('その関節を消すと骨が重なります'); }
      else if (!boneDrag.moved) undo.pop();
      boneDrag = null; draw();
    }
    if (shapeDrag) { const { a, b } = shapeDrag; shapeDrag = null; if (Math.hypot(b[0] - a[0], b[1] - a[1]) > 3) commitShape(a, b); else undo.pop(); draw(); }
    drawing = null;
  };
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { e.preventDefault(); const r = cv.getBoundingClientRect(); zoomAt(e.deltaY < 0 ? 1.15 : 1 / 1.15, e.clientX - r.left, e.clientY - r.top); }, { passive: false });
  $('ed-zin').onclick = () => zoomAt(1.4, cw / 2, chh / 2);
  $('ed-zout').onclick = () => zoomAt(1 / 1.4, cw / 2, chh / 2);
  $('ed-zfit').onclick = fit;

  // ---------- ボタン ----------
  $('ed-tabs').innerHTML = PARTS.map(p => `<button data-part="${p}">${EK.CH.NAMES[p]}</button>`).join('');
  $('ed-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; part = b.dataset.part; draw(); };
  document.querySelectorAll('#ed-tools button[data-tool]').forEach(b => b.onclick = () => { tool = b.dataset.tool; draw(); });
  // パーツを ‹ › で切りかえ（タブは横にスライドもできる）
  const stepPart = d => { const i = PARTS.indexOf(part); part = PARTS[(i + d + PARTS.length) % PARTS.length]; closePops(); draw(); };
  $('ed-prev').onclick = () => stepPart(-1); $('ed-next').onclick = () => stepPart(1);
  // 「…」メニューと、ふとさのポップアップ
  function closePops() { $('ed-menu').hidden = true; $('ed-size-pop').hidden = true; $('ed-size-btn').classList.remove('on'); }
  $('ed-more').onclick = e => { e.stopPropagation(); const h = $('ed-menu').hidden; closePops(); $('ed-menu').hidden = !h; };
  $('ed-menu').addEventListener('click', () => setTimeout(closePops, 0));
  $('ed-size-btn').onclick = e => { e.stopPropagation(); const h = $('ed-size-pop').hidden; closePops(); $('ed-size-pop').hidden = !h; $('ed-size-btn').classList.toggle('on', h); };
  $('ed-size-pop').addEventListener('pointerdown', e => e.stopPropagation());
  document.addEventListener('pointerdown', e => { if (!e.target.closest('#ed-menu, #ed-more, #ed-size-pop, #ed-size-btn')) closePops(); }, true);
  $('ed-colors').innerHTML = COLORS.map(c => `<button data-c="${c}" style="background:${c}"></button>`).join('') + '<button id="ed-color-free" class="free" title="じゆうな色">🎨</button><input type="color" id="ed-color-in" value="#7c5cff">';
  $('ed-colors').onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.id === 'ed-color-free') { $('ed-color-in').click(); return; }
    color = b.dataset.c; if (tool === 'erase' || tool === 'bone') tool = 'pen'; draw();
  };
  $('ed-color-in').addEventListener('input', e => { color = e.target.value; if (tool === 'erase' || tool === 'bone') tool = 'pen'; draw(); });
  $('ed-size').addEventListener('input', e => { size = +e.target.value; if (tool === 'bone') tool = 'pen'; draw(); });
  // 左右コピー：いまのパーツを、反対がわに左右反転してうつす（体のまん中で折り返す）
  $('ed-mirror').onclick = () => {
    const q = PAIR[part]; if (!q) return;
    const bb = EK.alphaGrid(ch.layers.body).box, ax = bb ? (bb[0] + bb[2]) / 2 : W / 2;
    const nb = ch.bones[part].map(v => [Math.round(2 * ax - v[0]), v[1]]);
    if (!EK.boneOk(nb)) { EK.toast && EK.toast('反対がわがキャンバスからはみ出すのでコピーできません'); return; }
    snap(q);
    ch.bones[q] = nb; if (part[0] === 'e') ch.front[q] = ch.front[part];
    const x = ch.layers[q].getContext('2d'); x.clearRect(0, 0, W * PX, H * PX);
    x.save(); x.translate(2 * ax * PX, 0); x.scale(-1, 1); x.drawImage(ch.layers[part], 0, 0); x.restore();
    EK.toast && EK.toast(EK.CH.NAMES[q] + 'にコピーしました');
    draw();
  };
  function finish() {
    ch.name = ($('ed-name').value || '').trim().slice(0, 8);
    if (raku) { const r = raku; endRaku(); if (onDone) onDone(ch, { dirty: true }); return; }
    EK.saveChar(ch); if (EK.alphaGrid(ch.layers.body).any) EK.Pool.add(ch, 'self');
    if (onDone) onDone(ch, { dirty });
  }
  $('ed-done').onclick = () => {
    if (raku) return finish();
    const empty = ['body'].filter(p => !EK.alphaGrid(ch.layers[p]).any);
    if (empty.length && !$('ed-done').dataset.warned) { $('ed-done').dataset.warned = '1'; EK.toast && EK.toast(empty.map(p => EK.CH.NAMES[p]).join('・') + ' がまだ空っぽ。もう一度押すとそのまま進む'); return; }
    delete $('ed-done').dataset.warned;
    finish();
  };
  $('ed-name').addEventListener('input', () => { dirty = true; });
  // らくがきバトル：時間が来たら、そのまま出す
  function endRaku() { if (!raku) return; clearInterval(raku.tm); raku = null; $('editor').classList.remove('raku'); $('ed-done').textContent = '完成！'; $('ed-timer').hidden = true; }
  function rakuTick() {
    if (!raku) return;
    const left = Math.max(0, Math.ceil((raku.until - EK.now()) / 1000));
    const el = $('ed-timer'); el.textContent = Math.min(60, left); el.classList.toggle('hurry', left <= 10);   // はじまりの少しの待ち時間は見せない
    if (left <= 0) finish();
  }
  $('ed-sample').onclick = () => {
    const keys = ['easy', 'normal', 'hard'];
    EK._sampleI = ((EK._sampleI == null ? -1 : EK._sampleI) + 1) % 3;
    undo = []; dirty = true; EK.freeChar(ch); ch = EK.sampleChars(keys[EK._sampleI])[keys[EK._sampleI]]; $('ed-name').value = ch.name; draw();
  };

  // ---------- はじめてのガイド ----------
  const COACH = [
    ['#ed-tabs', 'ここで描くパーツをえらびます。<b>頭と体・うで・あし・かざり</b>を、それぞれ描きます。', () => { part = 'body'; tool = 'pen'; }],
    ['#ed-tools', '<b>ペン</b>で描く、<b>ぬる</b>でぬりつぶす、<b>図形</b>・<b>スタンプ</b>も使えます。', null],
    ['#ed-canvas', 'うで・あしには、はじめから<b>黒い骨の線</b>があります。上から好きな色でぬれます（ぬらなければ黒い線のまま）。', () => { part = 'armR'; tool = 'pen'; }],
    ['#ed-tools button[data-tool=bone]', '<b>骨</b>を押すと、骨を動かせます。', () => { tool = 'bone'; }],
    ['#ed-canvas', '<b>骨をタップ</b>→関節がふえる<br><b>関節をドラッグ</b>→曲がる<br><b>黄色の●をドラッグ</b>→つく場所が動く', null],
    ['#ed-stat', '腕は<b>長いほど遠くまで届く</b>けれど、<b>当たるまで時間がかかる</b>。関節が多いと当たる範囲が広い。ここに目安が出ます。', null],
    ['#ed-more', '「…」には<b>おてほん</b>・<b>左右コピー</b>（反対の腕・足にうつす）・<b>全部消す</b>があります。', () => { part = 'body'; tool = 'pen'; }],
    ['#ed-done', '2本指で拡大もできます。パーツは ‹ › か、タブを横にスライドして切りかえ。できたら<b>完成！</b>', null]
  ];
  let coachI = -1;
  function coachShow() {
    const st = COACH[coachI]; if (!st) return coachEnd();
    if (st[2]) st[2](); draw();
    const el = document.querySelector(st[0]), r = el.getBoundingClientRect(), ring = $('coach-ring'), box = $('coach-box');
    ring.style.left = (r.left - 6) + 'px'; ring.style.top = (r.top - 6) + 'px'; ring.style.width = (r.width + 12) + 'px'; ring.style.height = (r.height + 12) + 'px';
    $('coach-text').innerHTML = st[1]; $('coach-n').textContent = (coachI + 1) + ' / ' + COACH.length;
    $('coach-next').textContent = coachI === COACH.length - 1 ? 'はじめる' : 'つぎへ';
    const below = r.top + r.height / 2 < innerHeight / 2, bh = 130;
    box.style.top = (below ? Math.min(innerHeight - bh - 10, r.bottom + 14) : Math.max(10, r.top - bh - 14)) + 'px';
  }
  function coachStart() { coachI = 0; $('coach').hidden = false; coachShow(); }
  function coachEnd() { $('coach').hidden = true; coachI = -1; try { localStorage.setItem('ek_tut', '1'); } catch (e) {} draw(); }
  $('coach-next').onclick = () => { coachI++; coachShow(); };
  $('coach-skip').onclick = coachEnd;
  $('ed-help').onclick = coachStart;

  EK.Editor = {
    // opt.until があれば、らくがきバトル（その時刻になったら自動で完成）
    open(c, done, opt = {}) {
      if (ch && ch !== c) EK.freeChar(ch);
      endRaku();
      ch = c ? EK.cloneChar(c) : EK.emptyChar(); onDone = done; undo = []; part = 'body'; tool = 'pen'; dirty = false;
      $('ed-name').value = ch.name || '';
      delete $('ed-done').dataset.warned; $('ed-menu').hidden = true;
      if (opt.until) {
        raku = { until: opt.until, tm: setInterval(rakuTick, 250) };
        $('editor').classList.add('raku'); $('ed-done').textContent = 'できた！'; $('ed-timer').hidden = false; rakuTick();
      }
      requestAnimationFrame(() => { layout(); let seen = false; try { seen = !!localStorage.getItem('ek_tut'); } catch (e) {} if (!seen && !opt.until) setTimeout(coachStart, 250); });
    },
    stop() { endRaku(); },
    get dirty() { return dirty; },
    get ch() { return ch; }, get state() { return { part, tool, undo: undo.length, z, vx, vy }; },
    set(p, t) { if (p) part = p; if (t) tool = t; draw(); },
    toCanvas: (cx, cy) => { const r = cv.getBoundingClientRect(); return [r.left + vx + cx * z, r.top + vy + cy * z]; }
  };
})();
