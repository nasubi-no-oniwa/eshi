// =============================================
//  絵私（えし）  画面と操作
// =============================================
(function () {
  const $ = id => document.getElementById(id);
  const C = EK.CONFIG, LIMBS = EK.CH.LIMBS;
  const LN = { armL: '左うで', armR: '右うで', legL: '左あし', legR: '右あし' };
  function show(id) { document.querySelectorAll('.screen').forEach(s => s.classList.toggle('active', s.id === id)); }
  EK.toast = t => { const el = $('toast'); el.textContent = t; el.classList.add('show'); clearTimeout(EK.toast.tm); EK.toast.tm = setTimeout(() => el.classList.remove('show'), 1800); };

  // ---------- 音 ----------
  let actx = null;
  function beep(f, d, type = 'triangle', v = 0.07, delay = 0, f2) {
    try {
      if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const t = actx.currentTime + delay, o = actx.createOscillator(), gn = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
      gn.gain.setValueAtTime(v, t); gn.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(gn); gn.connect(actx.destination); o.start(t); o.stop(t + d + 0.02);
    } catch (e) {}
  }
  function noise(d, v = 0.12, f = 800) {
    try {
      if (!actx) return; const n = Math.floor(actx.sampleRate * d), b = actx.createBuffer(1, n, actx.sampleRate), a = b.getChannelData(0);
      for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n) ** 2;
      const s = actx.createBufferSource(), fl = actx.createBiquadFilter(), gn = actx.createGain(); fl.type = 'lowpass'; fl.frequency.value = f; gn.gain.value = v;
      s.buffer = b; s.connect(fl); fl.connect(gn); gn.connect(actx.destination); s.start();
    } catch (e) {}
  }
  const snd = {
    punch: () => beep(260, 0.08, 'sawtooth', 0.03, 0, 520), hit: () => { noise(0.16, 0.3, 1800); beep(180, 0.16, 'square', 0.08, 0, 55); beep(90, 0.2, 'sine', 0.12, 0, 45); },
    crit: () => { noise(0.2, 0.22, 2400); [880, 1320].forEach((f, i) => beep(f, 0.12, 'square', 0.05, i * 0.06)); }, brk: () => { noise(0.4, 0.25, 900); beep(320, 0.4, 'sawtooth', 0.07, 0, 60); },
    jump: () => beep(330, 0.15, 'triangle', 0.05, 0, 700), land: () => beep(110, 0.06, 'sine', 0.06), whiff: () => noise(0.08, 0.05, 3000),
    win: () => [523, 659, 784, 1047].forEach((f, i) => beep(f, 0.22, 'triangle', 0.08, i * 0.11)), lose: () => [392, 330, 262].forEach((f, i) => beep(f, 0.3, 'triangle', 0.08, i * 0.16)),
    count: () => beep(660, 0.12, 'square', 0.05), go: () => beep(990, 0.3, 'square', 0.06)
  };

  // ---------- 自分のキャラ ----------
  let myChar = null, level = 'normal', pending = null;
  const preview = (ch, cv) => EK.drawPreview(ch, cv);
  function refreshTitle() {
    preview(myChar, $('t-preview'));
    $('t-name').textContent = myChar ? (myChar.name || 'なまえなし') : 'まだキャラがいません';
    $('btn-edit').textContent = myChar ? 'キャラをなおす' : 'キャラをつくる';
    const n = EK.Pool.list().length; $('t-pool').textContent = n ? 'ライバル帳 ' + n + '体（CPUの相手に出てきます）' : '';
    $('t-id').innerHTML = myChar && myChar.id ? 'ID：' + myChar.id + '<button id="t-id-copy">コピー</button>' : '';
    const cb = $('t-id-copy'); if (cb) cb.onclick = () => copyText(myChar.id, cb);
    if (myChar && myChar.id) checkMyId(myChar.id);
  }
  // 自分のキャラのIDが、まだ保管庫にあるか（消えていたら知らせて、もう一度IDをもらえるようにする）
  const idChecked = {};
  async function checkMyId(id) {
    if (!(id in idChecked)) idChecked[id] = await EK.Store.exists(id);
    if (idChecked[id] !== false || !myChar || myChar.id !== id) return;
    const msg = await EK.Store.goneMsg(id).catch(() => '');
    $('t-id').innerHTML = '<s>ID：' + id + '</s><br><span class="gone">' + esc(msg.replace(/（.*）/, '')) + '</span><button id="t-id-new">もう一度IDをもらう</button>';
    $('t-id-new').onclick = () => { myChar.par = ''; myChar.id = ''; EK.saveChar(myChar); openSave(myChar, { done: refreshTitle }); };
  }
  async function copyText(t, b) {
    try { await navigator.clipboard.writeText(t); if (b) { const o = b.textContent; b.textContent = 'コピーしました'; setTimeout(() => { b.textContent = o; }, 1500); } }
    catch (e) { EK.toast('ID：' + t); }
  }
  EK.loadChar().then(c => { myChar = c; refreshTitle(); });
  function openEditor(after) {
    show('editor');
    EK.Editor.open(myChar, (ch, info) => {
      const old = myChar; myChar = ch; if (old && old !== ch) EK.freeChar(old);
      const go = () => { refreshTitle(); if (after) after(); else show('title'); };
      // 変えたら新しいID（元のキャラはそのまま残る）。変えていなければ、そのまま
      if (info && !info.dirty && ch.id) return go();
      if (info && info.dirty && ch.id) { ch.par = ch.id; ch.id = ''; }
      refreshTitle(); openSave(ch, { done: go });
    });
  }
  $('btn-edit').onclick = () => openEditor();
  $('ed-back').onclick = () => { show('title'); };
  $('btn-howto').onclick = () => $('ov-howto').classList.add('show');
  $('btn-howto-close').onclick = () => $('ov-howto').classList.remove('show');
  document.querySelectorAll('.btn.lv').forEach(b => b.addEventListener('click', () => {
    beep(660, 0.05); level = b.dataset.level;
    if (!myChar) { EK.toast('まずはキャラを描こう！'); openEditor(() => startCpu()); return; }
    startCpu();
  }));

  // ---------- 3D ----------
  const cv = $('view');
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
  renderer.setPixelRatio(Math.min(1.5, window.devicePixelRatio || 1));   // スマホの高画素は重いので1.5まで
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const DESK = '#d8b98e';
  const scene = new THREE.Scene(); scene.background = new THREE.Color(DESK); scene.fog = new THREE.Fog(DESK, 26, 50);
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 120);
  scene.add(new THREE.HemisphereLight('#ffffff', '#c9a77a', 1.7));
  const sun = new THREE.DirectionalLight('#ffffff', 1.3); sun.position.set(-3, 9, 6); scene.add(sun);
  const world = new THREE.Group(); scene.add(world);     // 1番の人は、ここを左右反転して自分を左に見せる
  // ステージ：机の上の、方眼ノートの1ページ（はしには見えないかべ）
  (function stage() {
    const P = C.WALL + 1.0;
    const tc = document.createElement('canvas'); tc.width = tc.height = 1024; const x = tc.getContext('2d');
    x.fillStyle = '#fdfcf7'; x.fillRect(0, 0, 1024, 1024);
    x.strokeStyle = '#cfe0f0'; x.lineWidth = 2;
    for (let i = 0; i <= 1024; i += 32) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke(); }
    x.strokeStyle = '#a9c8e6'; x.lineWidth = 3;
    for (let i = 0; i <= 1024; i += 128) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 1024); x.stroke(); x.beginPath(); x.moveTo(0, i); x.lineTo(1024, i); x.stroke(); }
    x.strokeStyle = '#f19c9c'; x.lineWidth = 5; x.beginPath(); x.moveTo(96, 0); x.lineTo(96, 1024); x.stroke();
    // らくがき
    x.strokeStyle = 'rgba(80,80,90,.35)'; x.lineWidth = 4; x.lineCap = 'round';
    x.beginPath(); x.arc(880, 150, 40, 0.3, 5.8); x.stroke(); x.beginPath(); x.moveTo(850, 900); x.lineTo(930, 860); x.lineTo(900, 940); x.stroke();
    x.font = '900 46px "M PLUS Rounded 1c", sans-serif'; x.fillStyle = 'rgba(80,80,90,.28)'; x.fillText('VS', 140, 980);
    const tex = new THREE.CanvasTexture(tc); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const side = new THREE.MeshLambertMaterial({ color: '#efe9da' });
    const page = new THREE.Mesh(new THREE.BoxGeometry(P * 2, 0.35, P * 2), [side, side, new THREE.MeshLambertMaterial({ map: tex }), side, side, side]);
    page.position.y = -0.175; world.add(page);
    // 下の紙の重なり・表紙
    const cover = new THREE.Mesh(new THREE.BoxGeometry(P * 2 + 0.3, 0.12, P * 2 + 0.3), new THREE.MeshLambertMaterial({ color: '#3b6ea8' })); cover.position.y = -0.41; world.add(cover);
    // リング（ノートのとじ目）
    const ringMat = new THREE.MeshLambertMaterial({ color: '#9aa3ad' });
    for (let i = 0; i < 14; i++) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.05, 6, 18), ringMat); r.position.set(-P + 0.5 + i * (P * 2 - 1) / 13, 0.05, -P - 0.05); world.add(r); }
    // 机
    const desk = new THREE.Mesh(new THREE.PlaneGeometry(90, 90), new THREE.MeshLambertMaterial({ color: '#cfa978' })); desk.rotation.x = -Math.PI / 2; desk.position.y = -0.48; world.add(desk);
    // えんぴつ
    const pencil = new THREE.Group();
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 5, 6), new THREE.MeshLambertMaterial({ color: '#f5b800' })); body.rotation.z = Math.PI / 2; pencil.add(body);
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.6, 6), new THREE.MeshLambertMaterial({ color: '#f1d3a6' })); tip.rotation.z = Math.PI / 2; tip.position.x = 2.8; pencil.add(tip);
    const er = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.5, 6), new THREE.MeshLambertMaterial({ color: '#f39ab3' })); er.rotation.z = Math.PI / 2; er.position.x = -2.75; pencil.add(er);
    pencil.position.set(P + 1.6, -0.3, 2); pencil.rotation.y = 1.2; world.add(pencil);
  })();
  // 足もとの丸と向きの矢印・攻撃範囲
  function arrowTex(col) {
    const c = document.createElement('canvas'); c.width = 256; c.height = 256; const x = c.getContext('2d');
    x.strokeStyle = col; x.lineWidth = 12; x.setLineDash([22, 12]); x.beginPath(); x.arc(128, 128, 96, 0, 7); x.stroke(); x.setLineDash([]);
    x.fillStyle = col; x.globalAlpha = 0.18; x.beginPath(); x.arc(128, 128, 90, 0, 7); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  function laneTex() {
    const c = document.createElement('canvas'); c.width = 256; c.height = 64; const x = c.getContext('2d');
    x.fillStyle = 'rgba(255,255,255,.35)'; x.fillRect(0, 8, 230, 48);
    x.strokeStyle = '#fff'; x.lineWidth = 5; x.setLineDash([14, 8]); x.strokeRect(3, 8, 227, 48); x.setLineDash([]);
    x.fillStyle = '#fff'; x.beginPath(); x.moveTo(256, 32); x.lineTo(226, 2); x.lineTo(226, 62); x.closePath(); x.fill();
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  const LANE_TEX = laneTex();
  function makeMarker(col) {
    const g = new THREE.Group();
    const ring = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: arrowTex(col), transparent: true, depthWrite: false }));
    ring.rotation.x = -Math.PI / 2; g.add(ring); g.ring = ring;
    // 歩いている向きの矢印
    const ac = document.createElement('canvas'); ac.width = 128; ac.height = 64; const ax = ac.getContext('2d');
    ax.fillStyle = col; ax.strokeStyle = '#2b2a35'; ax.lineWidth = 5; ax.lineJoin = 'round';
    ax.beginPath(); ax.moveTo(124, 32); ax.lineTo(70, 4); ax.lineTo(70, 20); ax.lineTo(8, 20); ax.lineTo(8, 44); ax.lineTo(70, 44); ax.lineTo(70, 60); ax.closePath(); ax.fill(); ax.stroke();
    const at = new THREE.CanvasTexture(ac); at.colorSpace = THREE.SRGBColorSpace;
    const ag = new THREE.PlaneGeometry(1, 0.5); ag.translate(0.5, 0, 0);
    const arrow = new THREE.Mesh(ag, new THREE.MeshBasicMaterial({ map: at, transparent: true, depthWrite: false }));
    arrow.rotation.x = -Math.PI / 2; arrow.position.y = 0.01; g.add(arrow); g.arrow = arrow;
    // パンチが届く円
    const reach = new THREE.Mesh(new THREE.RingGeometry(0.965, 1, 72), new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.9, depthWrite: false }));
    reach.rotation.x = -Math.PI / 2; reach.position.y = 0.02; g.add(reach); g.reach = reach;
    const lg = new THREE.PlaneGeometry(1, 1); lg.translate(0.5, 0, 0);
    const lane = new THREE.Mesh(lg, new THREE.MeshBasicMaterial({ map: LANE_TEX, transparent: true, depthWrite: false, color: '#ffffff' }));
    lane.rotation.x = -Math.PI / 2; lane.position.y = 0.025; g.lane = lane; world.add(lane);
    g.position.y = 0.03; world.add(g); return g;
  }
  const shadowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d'); const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(50,35,20,.6)'); g.addColorStop(1, 'rgba(60,40,20,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
  function makeShadow() { const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false })); m.rotation.x = -Math.PI / 2; m.position.y = 0.02; world.add(m); return m; }
  function resize() { const w = innerWidth, h = innerHeight; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); }
  addEventListener('resize', resize); resize();

  // ---------- 試合 ----------
  let markers = [], matchChars = [];
  // せまくなるかべ（赤いえんぴつの点線）
  const wallLine = (() => {
    const g = new THREE.BufferGeometry().setFromPoints([[-1, -1], [1, -1], [1, 1], [-1, 1], [-1, -1]].map(([x, z]) => new THREE.Vector3(x, 0, z)));
    const l = new THREE.Line(g, new THREE.LineDashedMaterial({ color: '#e5484d', dashSize: 0.06, gapSize: 0.04, linewidth: 2 }));
    l.computeLineDistances(); l.position.y = 0.04; l.visible = false; world.add(l); return l;
  })();
  let match = null, models = [], shadows = [], flies = [], cpu = null, mode = 'cpu', mine = 0, acc = 0, goAt = 0, names = ['あなた', 'CPU'];
  let room = null, sendT = 0, lastNetTime = 0, resultShown = false, leftNote = '';
  const camPos = new THREE.Vector3(0, 6, 14), camLook = new THREE.Vector3(0, 1.5, 0);
  // 3Dの部品を、GPUのメモリからも消す（何回も遊ぶと重くならないように）
  function freeObj(o) {
    o.traverse(n => {
      if (n.geometry) n.geometry.dispose();
      for (const m of [].concat(n.material || [])) { if (m.map && m.map !== shadowTex) m.map.dispose(); m.dispose(); }
    });
  }
  function clearMatch() {
    for (const c of matchChars || []) if (c && c !== myChar) EK.freeChar(c);
    matchChars = [];
    for (const m of models) { world.remove(m.root); EK.disposeModel(m); }
    for (const s of shadows) { world.remove(s); freeObj(s); }
    for (const m of markers) { world.remove(m); world.remove(m.lane); freeObj(m); if (m.lane) freeObj(m.lane); }
    markers = [];
    for (const f of flies) { if (f.g.parent) f.g.parent.remove(f.g); freeObj(f.g); }
    models = []; shadows = []; flies = []; match = null; $('pops').innerHTML = '';
  }
  function setupMatch(chA, chB, opt) {
    clearMatch();
    match = new EK.Match(chA, chB, opt); matchChars = [chA, chB];
    models = [EK.buildModel(chA), EK.buildModel(chB)];
    for (const m of models) { world.add(m.root); shadows.push(makeShadow()); }
    markers = [makeMarker(mine === 0 ? '#3b82f6' : '#ef4444'), makeMarker(mine === 1 ? '#3b82f6' : '#ef4444')];
    world.scale.x = mine === 1 ? -1 : 1;
    buildBars(); resultShown = false; leftNote = '';
    $('ov-result').classList.remove('show'); $('ov-online').classList.remove('show');
    show('fight'); resize();
    acc = 0; camPos.set(0, 8, 13);
  }
  // CPUの相手：見本の3体＋ライバル帳（前に描いたキャラ・対戦した相手）からランダム
  async function startCpu(forced) {
    mode = 'cpu'; mine = 0; leaveRoom(); watchUi(false);
    const pool = EK.Pool.list();
    let s = forced || null;
    const k = Math.floor(Math.random() * (pool.length + 2));
    if (!s && k >= 2) { try { const c = await EK.unpackChar(pool[k - 2].s); c.name = c.name || (pool[k - 2].from === 'self' ? '前のキャラ' : 'ライバル'); s = c; } catch (e) {} }
    if (!s) { const key = k === 1 ? ['easy', 'normal', 'hard'][Math.floor(Math.random() * 3)] : level; s = EK.sampleChars(key)[key]; }
    names = [myChar.name || 'あなた', (s.name || 'ななし') + '（' + { easy: 'よわい', normal: 'ふつう', hard: 'つよい' }[level] + '）'];
    setupMatch(myChar, s, {});
    cpu = new EK.Cpu(match, 1, level);
    intro();
  }
  // 登場シーン：おたがいのキャラを見せてから始まる
  function intro() {
    goAt = performance.now() + 3200;
    const bm = $('big-msg');
    bm.innerHTML = `<small>${esc(names[0])}</small>VS<small>${esc(names[1])}</small>`; bm.classList.add('show');
    setTimeout(() => { bm.textContent = 'READY'; }, 1700);
    setTimeout(() => { bm.textContent = 'FIGHT!'; snd.go(); }, 3200);
    setTimeout(() => bm.classList.remove('show'), 3900);
    snd.count();
  }
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  // HUD：ふせんに、人形のアイコン（うで・あしごとに 緑→黄→赤）
  const DOLL = `<svg viewBox="0 0 64 72" class="doll"><circle cx="32" cy="13" r="10" class="hd"/><rect x="23" y="24" width="18" height="22" rx="5" class="bd"/>
    <path data-p="armL" d="M23 28 L8 42"/><path data-p="armR" d="M41 28 L56 42"/><path data-p="legL" d="M27 46 L21 68"/><path data-p="legR" d="M37 46 L43 68"/></svg>`;
  function buildBars() {
    for (const i of [0, 1]) {
      const slot = i === 0 ? mine : 1 - mine;
      $('nm' + i).textContent = names[slot] || '？';
      $('bars' + i).innerHTML = DOLL + '<div class="nums">' + LIMBS.map(p => `<span data-p="${p}">${LN[p]}<b>100</b></span>`).join('') + '</div>';
    }
  }
  const durCol = v => v <= 0 ? '#b8b2a7' : v > 60 ? '#22c55e' : v > 30 ? '#f5b800' : '#ef4444';
  function hud() {
    for (const i of [0, 1]) {
      const f = match.f[i === 0 ? mine : 1 - mine], el = $('bars' + i);
      el.querySelectorAll('path[data-p]').forEach(pth => { const p = pth.dataset.p, v = f.gone[p] ? 0 : f.dur[p] / C.DUR * 100; pth.style.stroke = durCol(v); pth.classList.toggle('gone', !!f.gone[p]); pth.classList.toggle('hit', f.flash[p] > 0); });
      el.querySelectorAll('.nums span').forEach(sp => { const p = sp.dataset.p, v = f.gone[p] ? 0 : Math.ceil(f.dur[p] / C.DUR * 100); sp.querySelector('b').textContent = f.gone[p] ? 'もげた' : v; sp.style.color = durCol(v); sp.classList.toggle('gone', !!f.gone[p]); });
    }
    const t = Math.ceil(match.time); $('timer').textContent = t; $('timer').classList.toggle('hurry', t <= 10);
  }
  // 世界の点 → 画面の位置に文字を出す
  const v3 = new THREE.Vector3();
  function popAt(x, y, z, text, cls) {
    v3.set(x, y, z); world.localToWorld(v3); v3.project(camera);
    const el = document.createElement('div'); el.className = 'pop ' + (cls || ''); el.textContent = text;
    el.style.left = ((v3.x + 1) / 2 * innerWidth) + 'px'; el.style.top = ((1 - v3.y) / 2 * innerHeight) + 'px';
    $('pops').appendChild(el); setTimeout(() => el.remove(), 850);
  }
  // 火花
  const sparks = [];
  const sparkGeo = new THREE.SphereGeometry(0.06, 6, 4);
  function burst(x, y, z, col, n) {
    for (let i = 0; i < n; i++) {
      const m = new THREE.Mesh(sparkGeo, new THREE.MeshBasicMaterial({ color: col })); m.position.set(x, y, z + 0.3);
      const a = Math.random() * 6.28, s = 2 + Math.random() * 4; sparks.push({ m, vx: Math.cos(a) * s, vy: Math.sin(a) * s + 2, t: 0.4 + Math.random() * 0.2 }); world.add(m);
    }
  }
  let shake = 0, stopT = 0;
  // 「バシッ」：手描きのギザギザ星と文字
  function bangTex(text, fill) {
    const c = document.createElement('canvas'); c.width = c.height = 256; const x = c.getContext('2d');
    x.translate(128, 128); x.beginPath();
    for (let i = 0; i < 24; i++) { const a = i / 24 * Math.PI * 2, r = i % 2 ? 62 + (i * 37 % 13) : 112 - (i * 53 % 17); x.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
    x.closePath(); x.fillStyle = fill; x.fill(); x.lineWidth = 9; x.strokeStyle = '#2b2a35'; x.lineJoin = 'round'; x.stroke();
    x.rotate(-0.15); x.font = '400 54px "Dela Gothic One", "M PLUS Rounded 1c", sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
    x.lineWidth = 10; x.strokeStyle = '#2b2a35'; x.strokeText(text, 0, 2); x.fillStyle = '#fff'; x.fillText(text, 0, 2);
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  }
  let BANG = null;
  const bangs = [];
  // 自分の攻撃は青、相手の攻撃は赤の「バシッ」
  function bang(x, y, z, crit, mineAtk) {
    if (!BANG) BANG = {
      me: [bangTex('バシッ', '#8ec5ff'), bangTex('ドカッ', '#8ec5ff'), bangTex('ボコッ', '#8ec5ff')], meC: bangTex('ガツン!', '#3b82f6'),
      op: [bangTex('バシッ', '#ff9a9a'), bangTex('ドカッ', '#ff9a9a'), bangTex('ボコッ', '#ff9a9a')], opC: bangTex('ガツン!', '#e5484d') };
    const tex = mineAtk ? (crit ? BANG.meC : BANG.me[Math.floor(Math.random() * 3)]) : (crit ? BANG.opC : BANG.op[Math.floor(Math.random() * 3)]);
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.position.set(x, y + 0.2, z + 0.3); sp.renderOrder = 10; world.add(sp);
    bangs.push({ sp, t: 0, big: crit ? 1.9 : 1.3 });
  }
  // ねらいマーク：パンチが届くとき、相手の胸に出る
  const reticle = (() => {
    const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
    x.strokeStyle = '#ff7a1a'; x.lineWidth = 9; x.beginPath(); x.arc(64, 64, 44, 0, 7); x.stroke();
    x.lineWidth = 7; for (const [a, b, cc, d] of [[64, 4, 64, 34], [64, 94, 64, 124], [4, 64, 34, 64], [94, 64, 124, 64]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(cc, d); x.stroke(); }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, transparent: true, depthTest: false, opacity: 0.9 })); sp.renderOrder = 9; sp.visible = false; world.add(sp); return sp;
  })();
  const buzz = ms => { try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} };
  function handle(e) {
    if (e.type === 'punch') { snd.punch(); }
    else if (e.type === 'jump') { if (e.slot === mine) snd.jump(); }
    else if (e.type === 'land') { }
    else if (e.type === 'whiff') { if (e.slot === mine) snd.whiff(); }
    else if (e.type === 'hit') {
      e.crit ? snd.crit() : snd.hit();
      const mineAtk = e.from === mine;
      bang(e.x, e.y, e.z, e.crit, mineAtk);
      // うけた側のふせんがゆれる。自分がうけたら、画面のふちが赤く光る
      const note = document.querySelector('.note.' + (e.to === mine ? 's0' : 's1')); if (note) { note.classList.remove('shake'); void note.offsetWidth; note.classList.add('shake'); }
      if (!mineAtk && mode !== 'watch') { const fl = $('hurt-flash'); fl.classList.remove('on'); void fl.offsetWidth; fl.classList.add('on'); }
      stopT = Math.max(stopT, e.crit ? 0.13 : 0.075);          // ヒットストップ
      if (mode !== 'watch') { if (e.to === mine) buzz(e.crit ? 90 : 45); else buzz(18); }
      burst(e.x, e.y, e.z, e.crit ? '#f5b800' : '#ffffff', e.crit ? 14 : 8);
      popAt(e.x, e.y + 0.4, e.z, (mode === 'watch' ? 'ヒット！' : mineAtk ? 'ヒット！' : 'いたっ！') + (e.crit ? 'クリティカル ' : '') + e.dmg, (mineAtk ? 'mine' : 'theirs') + (e.crit ? ' crit' : ''));
      shake = Math.max(shake, e.crit ? 0.35 : 0.15);
      if (e.net && room) room.sendHit({ to: e.to, part: e.part, dmg: e.dmg, crit: !!e.crit, stun: e.stun || 0, kx: e.kx || 0, kz: e.kz || 0, x: e.x, y: e.y, z: e.z });
    }
    else if (e.type === 'break') breakFx(e.slot, e.part, e.dir);
    else if (e.type === 'squeeze') { EK.toast('なかなか当たらないので、かべがせまくなってきた！'); }
    else if (e.type === 'spurt') {
      const bm = $('big-msg'); bm.innerHTML = 'ラストスパート！<small>ダメージがどんどん上がる・かべがせまくなる</small>'; bm.classList.add('show');
      [523, 659, 784, 1047, 1319].forEach((f, i) => beep(f, 0.12, 'square', 0.05, i * 0.07)); setTimeout(() => bm.classList.remove('show'), 1800);
    }
    else if (e.type === 'over') finish(e.winner, e.why);
  }
  function breakFx(slot, part, dir) {
    snd.brk(); shake = 0.5;
    const fl = EK.detach(models[slot], part, world, dir || 1); if (fl) flies.push(fl);
    const f = match.f[slot]; popAt(f.x, f.y + 2.4, f.z, LN[part] + 'がもげた！', 'break');
  }

  // ---------- 操作 ----------
  const keys = new Set(); let atkQ = false, jumpQ = false, stick = { x: 0, y: 0, id: null, ox: 0, oy: 0 };
  addEventListener('keydown', e => {
    if (e.repeat || !$('fight').classList.contains('active')) return; keys.add(e.code);
    if (e.code === 'KeyJ' || e.code === 'KeyZ' || e.code === 'Enter') atkQ = true;
    if (e.code === 'KeyK' || e.code === 'Space' || e.code === 'KeyX') { jumpQ = true; e.preventDefault(); }
  });
  addEventListener('keyup', e => keys.delete(e.code));
  const btn = (id, fn) => { const b = $(id); b.addEventListener('pointerdown', e => { e.preventDefault(); b.classList.add('on'); fn(); }); for (const ev of ['pointerup', 'pointercancel', 'pointerleave']) b.addEventListener(ev, () => b.classList.remove('on')); };
  btn('b-atk', () => { atkQ = true; }); btn('b-jump', () => { jumpQ = true; });
  // 左半分のどこを押してもスティックになる
  const stEl = $('stick'), knob = stEl.querySelector('i');
  cv.addEventListener('pointerdown', e => {
    if (e.clientX > innerWidth * 0.55 || stick.id != null) return;
    stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.x = stick.y = 0;
    stEl.style.left = (e.clientX - 60) + 'px'; stEl.style.top = (e.clientY - 60) + 'px'; stEl.style.bottom = 'auto';
    try { cv.setPointerCapture(e.pointerId); } catch (er) {}
  });
  cv.addEventListener('pointermove', e => {
    if (e.pointerId !== stick.id) return;
    let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy; const d = Math.hypot(dx, dy), R = 50;
    if (d > R) { dx *= R / d; dy *= R / d; }
    stick.x = dx / R; stick.y = dy / R; knob.style.transform = `translate(${dx}px,${dy}px)`;
  });
  const stickEnd = e => { if (e.pointerId !== stick.id) return; stick.id = null; stick.x = stick.y = 0; knob.style.transform = ''; stEl.style.left = ''; stEl.style.top = ''; stEl.style.bottom = ''; };
  cv.addEventListener('pointerup', stickEnd); cv.addEventListener('pointercancel', stickEnd);
  function readInput() {
    let mx = (keys.has('ArrowRight') || keys.has('KeyD') ? 1 : 0) - (keys.has('ArrowLeft') || keys.has('KeyA') ? 1 : 0);
    let mz = (keys.has('ArrowDown') || keys.has('KeyS') ? 1 : 0) - (keys.has('ArrowUp') || keys.has('KeyW') ? 1 : 0);
    if (Math.abs(stick.x) > 0.15 || Math.abs(stick.y) > 0.15) { mx = stick.x; mz = stick.y; }
    if (mine === 1) mx = -mx;   // 画面を左右反転しているので
    const r = { mx, mz, atk: atkQ, jump: jumpQ }; atkQ = jumpQ = false; return r;
  }

  // ---------- 決着 ----------
  function finish(w, why) {
    if (resultShown) return; resultShown = true;
    const meWin = w === mine, watch = mode === 'watch';
    const wtxt = w === -1 ? 'ひきわけ' : watch ? (names[w] || '？') + 'のかち！' : meWin ? 'かち！' : 'まけ…';
    const bm = $('big-msg'); bm.textContent = wtxt; bm.classList.add('show');
    meWin || watch ? snd.win() : snd.lose();
    setTimeout(() => {
      bm.classList.remove('show');
      const t = $('res-title'); t.textContent = wtxt; t.className = meWin || watch ? 'win' : 'lose'; t.classList.toggle('small', watch);
      const f = match ? match.f : null, cnt = s => f ? f[s].limbs().length : 0;
      const tie = why === 'time' && cnt(0) === cnt(1);
      $('res-sub').textContent = (why === 'time' ? '時間切れ' + (tie && w !== -1 ? '（本数が同じなので、残りの耐久で判定）' : '') : why === 'left' ? 'あいてが退室しました' : 'KO') + `\n残ったうで・あし　${names[mine]} ${cnt(mine)}本 － ${cnt(1 - mine)}本 ${names[1 - mine]}`;
      $('btn-again').hidden = (mode === 'online' && why === 'left') || watch; $('btn-again').disabled = false; $('again-msg').textContent = watch ? 'つぎの試合が始まると、自動で見られます' : '';
      $('btn-reedit').hidden = mode !== 'cpu';
      $('btn-savedraw').hidden = !(rakuChar && mode === 'online'); $('btn-savedraw').disabled = false;
      // おたがいの絵をならべて見る
      for (const i of [0, 1]) { const slot = i ? 1 - mine : mine; preview(matchChars[slot], $('g' + i)); $('gn' + i).textContent = names[slot] || '？'; }
      $('btn-keep').disabled = false; $('btn-keep').textContent = watch ? '2体ともライバル帳に入れる' : '相手のキャラをライバル帳に入れる';
      $('ov-result').classList.add('show');
    }, 1600);
  }
  $('btn-keep').onclick = () => {
    const c = matchChars[1 - mine]; if (!c) return;
    let ok = EK.Pool.add(c, 'rival');
    if (mode === 'watch' && matchChars[mine]) ok = EK.Pool.add(matchChars[mine], 'rival') && ok;
    $('btn-keep').disabled = true; $('btn-keep').textContent = ok ? 'ライバル帳に入れました（CPUの相手に出てきます）' : '保存できませんでした';
    refreshTitle();
  };
  $('btn-again').onclick = () => {
    if (mode === 'cpu') return startCpu();
    if (room) { room.rematch(); $('btn-again').disabled = true; $('again-msg').textContent = 'あいての「もう一回」を待っています…'; }
  };
  $('btn-reedit').onclick = () => { $('ov-result').classList.remove('show'); clearMatch(); openEditor(() => startCpu()); };
  function toTitle() {
    leaveRoom(); clearMatch(); mode = 'cpu'; watchUi(false); EK.Editor.stop(); clearInterval(dwTm); rakuChar = null;
    for (const o of ['ov-result', 'ov-drawwait', 'ov-reveal', 'ov-online']) $(o).classList.remove('show');
    show('title'); refreshTitle();
  }
  $('btn-title').onclick = toTitle; $('btn-quit').onclick = toTitle;

  // ---------- 毎フレーム ----------
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (!match) return;
    const going = now >= goAt;
    const frozen = stopT > 0; if (frozen) stopT -= dt;
    if (mode === 'watch') { if (!frozen) for (const f of match.f) EK.smoothRemote(f, dt); }
    else if (going && !match.over && !frozen) {
      acc += dt;
      while (acc >= 1 / 60) {
        acc -= 1 / 60;
        const inp = [{}, {}]; inp[mine] = readInput(); if (EK._auto) inp[mine] = EK._auto.update(1 / 60);
        if (mode === 'cpu' && cpu) inp[1] = cpu.update(1 / 60);
        match.step(1 / 60, inp);
        if (mode === 'online') EK.smoothRemote(match.f[1 - mine], 1 / 60);
      }
    } else { atkQ = jumpQ = false; }
    if (mode === 'online' && room && going) onlineTick(dt, now);
    const evs = match.events; match.events = [];
    for (const e of evs) handle(e);
    // 動き
    const t = now / 1000;
    for (let i = 0; i < 2; i++) {
      EK.animate(models[i], match.f[i], frozen ? 0 : dt, t);
      const f = match.f[i], sh = shadows[i], s = 1.4 - Math.min(0.6, f.y * 0.25);
      sh.position.set(f.x + f.ox, 0.02, f.z + f.oz); sh.scale.set(s * 1.5, s * 1.0, 1);
    }
    flies = flies.filter(f => { const alive = EK.stepFly(f, dt); if (!alive) world.remove(f.g); return alive; });
    for (let i = sparks.length - 1; i >= 0; i--) { const s = sparks[i]; s.t -= dt; s.vy -= 12 * dt; s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; if (s.t <= 0) { world.remove(s.m); s.m.material.dispose(); sparks.splice(i, 1); } }
    // 足もとの丸・向きの矢印・攻撃範囲
    for (let i = 0; i < 2; i++) {
      const f = match.f[i], mk = markers[i], s2 = Math.max(0.9, f.halfW * 2.4);
      if (f.remote) { const o = match.f[1 - i], dx = o.x - f.x, dz = o.z - f.z, d = Math.hypot(dx, dz) || 1; if (!f.act) { f.dx = dx / d; f.dz = dz / d; } }
      mk.position.set(f.x + f.ox, 0.03, f.z + f.oz); mk.ring.scale.set(s2, s2, 1);
      // 矢印：歩いている向き（止まっているときは出さない）
      const sp = Math.hypot(f.vx, f.vz); mk.arrow.visible = sp > 0.3 && i === mine && mode !== 'watch';
      if (mk.arrow.visible) { const ux = f.vx / sp, uz = f.vz / sp, r0 = s2 * 0.42; mk.arrow.position.set(ux * r0, 0.01, uz * r0); mk.arrow.scale.set(0.9, 0.9, 1); mk.arrow.rotation.z = Math.atan2(-f.vz, f.vx); }
      // パンチが届く円：自分は白（相手が入るとオレンジ）、相手はうすい赤（パンチのためのあいだは赤く光る）
      const me = i === mine && mode !== 'watch', o = match.f[1 - i], arms = f.arms();
      const R = arms.length ? Math.max(...arms.map(p => f.st.arms[p].reach)) + 0.35 : 0.8;
      mk.reach.visible = !match.over;
      mk.reach.scale.set(R, R, 1);
      if (me) { const arm = f.act && f.act.type === 'punch' ? f.act.arm : f.nextArm(), ok = arm && match.canHit(f, o, arm); mk.reach.material.color.set(ok ? '#ff7a1a' : '#ffffff'); mk.reach.material.opacity = ok ? 1 : 0.85; }
      else { const wind = f.act && f.act.type === 'punch' && f.act.t < f.act.hit; mk.reach.material.color.set('#ef4444'); mk.reach.material.opacity = wind ? 0.6 + 0.4 * Math.sin(now / 40) : 0.35; }
      mk.lane.visible = false;
    }
    { const w = match.wallNow(); wallLine.visible = w < C.WALL - 0.01; if (wallLine.visible) { const k = w + 0.35; wallLine.scale.set(k, 1, k); wallLine.material.dashSize = 0.25 / k; wallLine.material.gapSize = 0.15 / k; } }
    for (let i = bangs.length - 1; i >= 0; i--) {
      const b = bangs[i]; b.t += dt; const q = b.t / 0.45, sc = b.big * (q < 0.2 ? 0.5 + q / 0.2 * 0.6 : 1.1 + (q - 0.2) * 0.2);
      b.sp.scale.set(sc, sc, 1); b.sp.material.opacity = q < 0.6 ? 1 : Math.max(0, 1 - (q - 0.6) / 0.4);
      if (q >= 1) { world.remove(b.sp); b.sp.material.dispose(); bangs.splice(i, 1); }
    }
    {
      const me = match.f[mine], o = match.f[1 - mine], arm = me.act && me.act.type === 'punch' ? me.act.arm : me.nextArm();
      const lock = mode !== 'watch' && !match.over && going && arm && match.canHit(me, o, arm);
      reticle.visible = lock;
      if (lock) { const p = o.wp(EK.CH.W / 2, (o.box.y0 + EK.CH.HIP[1]) / 2); reticle.position.set(p[0], p[1], p[2] + 0.2); const k = 0.75 + Math.sin(now / 90) * 0.08; reticle.scale.set(k, k, 1); }
    }
    // カメラ：ななめ上から、2人が入るように
    const a = match.f[0], b = match.f[1], mx = (a.x + b.x) / 2 * world.scale.x, mz = (a.z + b.z) / 2;
    const tanH = Math.tan(camera.fov * Math.PI / 360), EL = 1.08;   // カメラはやや真上寄り（奥行きの距離が分かりやすい）
    const needW = Math.abs(a.x - b.x) / 2 + 2.9, needH = (Math.abs(a.z - b.z) * Math.sin(EL) + 5.0) / 2;
    const dist = Math.max(11, Math.min(28, Math.max(needW / (tanH * camera.aspect), needH / tanH)));
    const intro = !going ? Math.max(0, (goAt - now) / 3200) : 0, dd = dist * (1 - intro * 0.3);
    camPos.lerp(new THREE.Vector3(mx, 1.2 + dd * Math.sin(EL) * (1 - intro * 0.4), mz + dd * Math.cos(EL)), Math.min(1, dt * 3));
    camLook.lerp(new THREE.Vector3(mx, 1.3, mz - 0.3), Math.min(1, dt * 4));
    camera.position.copy(camPos);
    if (shake > 0) { camera.position.x += (Math.random() - 0.5) * shake * 0.5; camera.position.y += (Math.random() - 0.5) * shake * 0.5; shake = Math.max(0, shake - dt * 2); }
    camera.lookAt(camLook);
    renderer.render(scene, camera);
    hud();
  }
  requestAnimationFrame(frame);

  // ---------- あいことば対戦 ----------
  const getDb = () => EK.getDb();
  function leaveRoom() { if (room) { room.leave(); room = null; } $('watchers').hidden = true; }
  EK.now = () => (room ? room.now() : Date.now());
  const lobby = wait => { $('online-form').hidden = wait; $('online-wait').hidden = !wait; };
  let want = 'normal', rakuChar = null, dwTm = 0;
  $('mode-pick').onclick = e => { const b = e.target.closest('button'); if (!b) return; want = b.dataset.mode; $('mode-pick').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); };
  function openOnline(code) {
    lobby(false); $('online-err').textContent = '';
    try { $('in-name').value = localStorage.getItem('ek-name') || (myChar && myChar.name) || ''; } catch (e) {}
    if (code) $('in-code').value = code;
    $('ov-online').classList.add('show');
  }
  $('btn-online').onclick = () => { beep(660, 0.05); openOnline(); };
  $('btn-online-close').onclick = () => { leaveRoom(); $('ov-online').classList.remove('show'); };
  $('btn-copy').onclick = async () => {
    const url = location.origin + location.pathname + '?room=' + encodeURIComponent(room ? room.code : '');
    try { await navigator.clipboard.writeText(url); $('btn-copy').textContent = 'コピーしました！'; } catch (e) { prompt('このリンクを送ってください', url); }
    setTimeout(() => { $('btn-copy').textContent = 'さそうリンクをコピー'; }, 2000);
  };
  $('btn-join').onclick = joinOnline;
  $('in-code').addEventListener('keydown', e => { if (e.key === 'Enter') joinOnline(); });
  const NOCHAR = 'この部屋は「いまのキャラで」対戦です。先にキャラをつくるか、IDでよんでね';
  async function joinOnline() {
    const code = EK.cleanCode($('in-code').value), name = $('in-name').value.trim().slice(0, 8) || 'ななし';
    if (!code) { $('online-err').textContent = 'あいことばを入れてください（. # $ / [ ] は使えません）'; return; }
    try { localStorage.setItem('ek-name', name); } catch (e) {}
    $('online-err').textContent = ''; $('btn-join').disabled = true; $('btn-join').textContent = 'つないでいます…';
    try {
      const db = await getDb();
      leaveRoom();
      const r = new EK.OnlineRoom(db, code, name, myChar ? EK.packChar(myChar, 0.5) : null, {
        onPeople: p => {
          if (room !== r) return;
          if (r.watching) { if (!p.names[0] && !p.names[1]) EK.toast('対戦している人がいなくなりました'); return; }
          if (!p.names[1 - r.slot]) { $('wait-msg').textContent = 'あいてを待っています…'; if (resultShown && mode === 'online') { $('btn-again').hidden = true; $('again-msg').textContent = 'あいてが退室しました'; } }
        },
        onMode: m => { if (room !== r) return; showModeMsg(r); if (m === 'normal' && !myChar) { leaveRoom(); lobby(false); $('online-err').textContent = NOCHAR; } },
        onWatchers: n => { if (room !== r) return; $('watchers').hidden = !n; $('watchers').textContent = '👀 ' + n + '人'; },
        onDraw: g => { if (room === r) startDraw(g); },
        onStart: g => { if (room === r) (g.watching ? watchStart(g) : onlineStart(g)); },
        onState: (st, k) => {
          if (room !== r || !match || (mode !== 'online' && mode !== 'watch')) return;
          const f = match.f[k], before = LIMBS.map(p => f.dur[p]);
          const res = EK.applyState(f, st); if (!res) return;
          for (const p of res.broke) breakFx(k, p, k === 0 ? 1 : -1);
          if (mode === 'watch') { if (k === 0) match.time = res.time; watchDamage(k, before); }
        },
        onWatchHit: h => { if (room === r && mode === 'watch' && !h.dodge) watchHits.push(Object.assign({ at: performance.now() }, h)); },
        onHit: h => {
          if (room !== r || !match || mode !== 'online' || match.over) return;
          if (h.dodge) { popAt(h.x, h.y + 0.5, h.z, 'よけられた！', 'theirs'); return; }
          // 受けた側の画面でも、本当に当たる場所にいたか確かめる（通信のおくれで「よけたのに当たった」を防ぐ）
          const me = match.f[mine];
          if (!match.contact(me, [h.x, h.y, h.z], 0.6)) { popAt(me.x, me.y + 2.2, me.z, 'よけた！', 'mine'); room.sendHit({ to: 1 - mine, part: 'none', dmg: 0, dodge: true, x: h.x, y: h.y, z: h.z }); return; }
          match.applyHit(me, { type: 'hit', from: 1 - mine, to: mine, part: h.part, dmg: h.dmg, crit: h.crit, stun: h.stun, kx: h.kx, kz: h.kz || 0, x: h.x, y: h.y, z: h.z });
        },
        onCheer: v => { if (room === r) cheerPop(v); },
        onEnd: v => { if (room === r && match && (mode === 'online' || mode === 'watch')) { match.over = true; finish(v.winner, v.why); } }
      }, want);
      room = r;
      const res = await r.join();
      if (!res.watching && res.mode === 'normal' && !myChar) { leaveRoom(); throw new Error(NOCHAR); }
      $('wait-code').textContent = r.code; lobby(true);
      $('wait-msg').textContent = res.watching ? '観戦で入りました。つぎの試合を待っています…' : 'あいてを待っています…';
      showModeMsg(r);
    } catch (e) { $('online-err').textContent = e.message || 'つながりませんでした'; leaveRoom(); }
    $('btn-join').disabled = false; $('btn-join').textContent = 'はいる';
  }
  function showModeMsg(r) { $('wait-code').textContent = r.code + '（' + (r.mode === 'raku' ? 'らくがきバトル' : 'いまのキャラで') + '）'; }

  // ---------- らくがきバトル：60秒で描く ----------
  function startDraw(g) {
    $('ov-online').classList.remove('show'); $('ov-result').classList.remove('show'); $('ov-reveal').classList.remove('show');
    clearMatch(); watchUi(false); rakuChar = null;
    if (g.slot < 0) { mode = 'watch'; drawWait(g.until, 'ふたりが描いています', '描きおわったら「せーの」で発表！', true); return; }
    mode = 'online';
    show('editor');
    EK.toast('60秒で描こう！ 時間になったら自動で完成');
    EK.Editor.open(null, ch => {
      const c = EK.cloneChar(ch); c.id = ''; c.name = c.name || (g.names[g.slot] || '');
      EK.stickBody(c);                  // 体を描けなかったら、黒い棒人間
      rakuChar = c;
      if (room) room.submitDraw(EK.packChar(c, 0.5));
      drawWait(g.until, 'できた！', 'あいてが描きおわるのを待っています…', false);
    }, { until: g.until });
  }
  function drawWait(until, title, msg, cheer) {
    $('dw-title').textContent = title; $('dw-msg').textContent = msg; $('dw-cheer').hidden = !cheer;
    $('ov-drawwait').classList.add('show');
    clearInterval(dwTm);
    const tick = () => { $('dw-timer').textContent = Math.min(60, Math.max(0, Math.ceil((until - EK.now()) / 1000))); };
    tick(); dwTm = setInterval(tick, 250);
  }
  $('dw-quit').onclick = toTitle;
  // せーの！ で、ふたりの絵を見せる
  function reveal(chs, nm, after) {
    $('ov-drawwait').classList.remove('show'); clearInterval(dwTm);
    const rv = document.querySelector('.reveal'); rv.classList.remove('open');
    for (const i of [0, 1]) { preview(chs[i], $('rv' + i)); $('rvn' + i).textContent = nm[i] || '？'; }
    $('rv-say').textContent = 'せーの…'; $('ov-reveal').classList.add('show'); snd.count();
    setTimeout(() => { rv.classList.add('open'); $('rv-say').textContent = 'ドン！'; snd.go(); }, 1300);
    setTimeout(() => { $('ov-reveal').classList.remove('show'); after(); }, 3700);
  }
  async function getChars(g) {
    const chs = await Promise.all(g.chars.map(s => (s ? EK.unpackChar(s) : Promise.resolve(null))));
    return chs.map((c, i) => { if (!c) { c = EK.emptyChar(); c.name = g.names[i] || ''; } EK.stickBody(c); return c; });
  }
  async function onlineStart(g) {
    EK.Editor.stop();
    const t0 = performance.now(), chs = await getChars(g);
    if (!room) return;
    mode = 'online'; mine = g.slot; cpu = null;
    names = g.names.map((n, i) => n || '？');
    if (!g.raku) { rakuChar = null; if (myChar && myChar.id) EK.Store.touch(myChar.id); }
    $('ov-drawwait').classList.remove('show'); clearInterval(dwTm);
    const go = () => {
      setupMatch(chs[0], chs[1], { online: true });
      match.f[1 - mine].remote = true;
      intro(); goAt = Math.max(performance.now() + 2500, t0 + g.wait - 400);
    };
    if (g.raku) reveal(chs, names, go); else go();
  }

  // ---------- 観戦 ----------
  let watchHits = [];
  function watchUi(on) {
    $('cheer-bar').hidden = !on; $('watch-tag').hidden = !on;
    document.querySelector('.pad').style.display = on ? 'none' : ''; $('stick').style.display = on ? 'none' : '';
  }
  async function watchStart(g) {
    const t0 = performance.now(), chs = await getChars(g);
    if (!room) return;
    mode = 'watch'; mine = 0; cpu = null; watchHits = [];
    names = g.names.map(n => n || '？');
    $('ov-online').classList.remove('show'); $('ov-drawwait').classList.remove('show'); clearInterval(dwTm);
    const go = () => {
      setupMatch(chs[0], chs[1], { online: true });
      match.f[0].remote = match.f[1].remote = true;
      watchUi(true);
      const left = t0 + g.wait - performance.now();
      if (left > 1500) { intro(); goAt = performance.now() + left; } else goAt = performance.now();
    };
    if (g.raku && g.wait > 4000) reveal(chs, names, go); else go();
  }
  // 観戦：うで・あしの耐久がへったときに、とどいていた「当てた」の場所で、バシッを出す
  function watchDamage(k, before) {
    const f = match.f[k], now = performance.now();
    watchHits = watchHits.filter(h => now - h.at < 900);
    LIMBS.forEach((p, i) => {
      if (f.dur[p] >= before[i] - 0.01) return;
      const j = watchHits.findIndex(h => h.to === k);
      const h = j >= 0 ? watchHits.splice(j, 1)[0] : null;
      const pos = h ? [h.x, h.y, h.z] : [f.x, f.y + 1.4, f.z];
      handle({ type: 'hit', from: 1 - k, to: k, part: p, dmg: Math.round(before[i] - f.dur[p]), crit: h ? !!h.crit : false, x: pos[0], y: pos[1], z: pos[2] });
    });
  }
  // 応援スタンプ
  const CHEER = ['👏', '🔥', '😂', '😱', '💪', '✨'];
  let cheerAt = 0;
  for (const bar of ['cheer-bar', 'dw-cheer']) $(bar).addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || !room) return;
    const now = performance.now(); if (now - cheerAt < 600) return; cheerAt = now;
    room.cheer(+b.dataset.e);
  });
  const cheerLayer = (() => { const d = document.createElement('div'); d.id = 'cheer-layer'; d.style.cssText = 'position:fixed;inset:0;pointer-events:none;overflow:hidden;z-index:40'; document.body.appendChild(d); return d; })();
  function cheerPop(v) {
    const el = document.createElement('div'); el.className = 'cheer-pop';
    el.innerHTML = '<span>' + (CHEER[v.e] || '👏') + '</span><small>' + esc(String(v.n || '').slice(0, 8)) + '</small>';
    el.style.left = (8 + Math.random() * 78) + '%'; cheerLayer.appendChild(el); setTimeout(() => el.remove(), 2300);
  }
  $('btn-savedraw').onclick = () => { if (rakuChar) openSave(rakuChar, { raku: true, done: () => { $('btn-savedraw').disabled = true; $('btn-savedraw').textContent = '保存しました'; } }); };

  function onlineTick(dt, now) {
    if (mode !== 'online') return;
    sendT -= dt;
    if (sendT <= 0) { sendT = 0.05; room.sendState(EK.packState(match.f[mine], match.time)); }
    if (match.over) return;
    // 自分のうで・あしが全部もげた → 負け
    if (!match.f[mine].limbs().length) room.endRound(1 - mine, 'ko');
    // 時間切れ：0番の人が判定する
    if (mine === 0 && match.time <= 0) {
      const f = match.f, n = f.map(x => x.limbs().length), s = f.map(x => x.limbs().reduce((a, p) => a + x.dur[p], 0));
      const w = n[0] !== n[1] ? (n[0] > n[1] ? 0 : 1) : Math.abs(s[0] - s[1]) > 0.5 ? (s[0] > s[1] ? 0 : 1) : -1;
      room.endRound(w, 'time');
    }
  }
  // ---------- キャラID：保存 ----------
  let saveCtx = null;
  function openSave(ch, opt) {
    saveCtx = { ch, opt: opt || {} };
    preview(ch, $('sv-prev'));
    $('sv-form').hidden = false; $('sv-done').hidden = true; $('sv-err').textContent = '';
    $('sv-author').value = EK.Store.author(); $('sv-pub').checked = false;
    $('sv-mine-l').hidden = !saveCtx.opt.raku; $('sv-mine').checked = true;
    $('sv-skip').textContent = saveCtx.opt.raku ? '保存しない' : 'IDなしで使う';
    $('sv-title').textContent = saveCtx.opt.raku ? '描いたキャラを保存' : 'キャラにIDをつける';
    $('ov-save').classList.add('show');
  }
  function closeSave() { $('ov-save').classList.remove('show'); const c = saveCtx; saveCtx = null; if (c && c.opt.done) c.opt.done(); }
  $('sv-skip').onclick = closeSave;
  $('sv-close').onclick = closeSave;
  $('sv-ok').onclick = async () => {
    if (!saveCtx) return;
    const { ch, opt } = saveCtx, author = $('sv-author').value.trim().slice(0, 8);
    EK.Store.setAuthor(author);
    $('sv-ok').disabled = true; $('sv-ok').textContent = '保存しています…'; $('sv-err').textContent = '';
    try {
      const id = await EK.Store.save(ch, { author, pub: $('sv-pub').checked, par: ch.par });
      ch.id = id; ch.author = author || 'ななし'; delete ch.par;
      if (opt.raku && $('sv-mine').checked) { const old = myChar; myChar = EK.cloneChar(ch); if (old) EK.freeChar(old); EK.Pool.add(myChar, 'self'); }
      if (myChar && (myChar === ch || myChar.id === id)) EK.saveChar(myChar);
      refreshTitle();
      $('sv-id').textContent = id; $('sv-form').hidden = true; $('sv-done').hidden = false;
    } catch (e) { $('sv-err').textContent = (e && e.message) || '保存できませんでした。通信を確認してね'; }
    $('sv-ok').disabled = false; $('sv-ok').textContent = '保存してIDをもらう';
  };
  $('sv-copy').onclick = () => copyText($('sv-id').textContent, $('sv-copy'));

  // ---------- IDでよぶ ----------
  $('btn-find').onclick = () => {
    $('find-err').textContent = ''; $('in-id').value = '';
    const L = EK.Store.mine();
    $('my-ids').innerHTML = L.length ? '<p>このスマホでつくったキャラ</p>' + L.slice(0, 8).map(e => `<button data-id="${e.id}"><span>${esc(e.name || 'なまえなし')}${e.pub ? '（公開）' : ''}</span><b>${e.id}</b></button>`).join('') : '';
    $('ov-find').classList.add('show'); markGone();
  };
  async function markGone() {
    for (const b of $('my-ids').querySelectorAll('button[data-id]')) {
      const ok = await EK.Store.exists(b.dataset.id);
      if (ok === false) { b.classList.add('gone'); b.querySelector('span').insertAdjacentHTML('beforeend', '<em>（削除ずみ）</em>'); }
    }
  }
  $('my-ids').onclick = e => { const b = e.target.closest('button[data-id]'); if (b) { $('in-id').value = b.dataset.id; findGo(); } };
  $('btn-find-close').onclick = () => $('ov-find').classList.remove('show');
  $('in-id').addEventListener('input', () => { const v = EK.cleanId($('in-id').value); if (v !== $('in-id').value) $('in-id').value = v; });
  $('in-id').addEventListener('keydown', e => { if (e.key === 'Enter') findGo(); });
  $('btn-find-go').onclick = findGo;
  async function findGo() {
    const id = EK.cleanId($('in-id').value);
    if (!EK.isId(id)) { $('find-err').textContent = 'IDは英数字8文字です（0・1・O・I・L は使われていません）'; return; }
    $('find-err').textContent = ''; $('btn-find-go').disabled = true; $('btn-find-go').textContent = '…';
    try { openChar(await EK.Store.load(id)); } catch (e) { $('find-err').textContent = e.message || '見つかりませんでした'; }
    $('btn-find-go').disabled = false; $('btn-find-go').textContent = 'よぶ';
  }
  // ---------- よんだキャラ：自分で使う・CPUの相手・ライバル帳 ----------
  let cur = null;
  function openChar(r) {
    if (cur && cur.ch !== myChar) EK.freeChar(cur.ch);
    cur = r; const m = r.meta;
    preview(r.ch, $('cd-prev'));
    $('cd-name').textContent = m.name || 'なまえなし';
    $('cd-meta').textContent = 'ID ' + m.id + '　作：' + (m.author || 'ななし') + '　使われた回数 ' + m.uses;
    $('cd-err').textContent = '';
    $('cd-keep').disabled = false; $('cd-keep').textContent = 'ライバル帳に入れる';
    const own = EK.Store.owns(m.id);
    $('cd-report').hidden = !m.pub || own; $('cd-report').disabled = EK.Store.reported(m.id); $('cd-report').textContent = EK.Store.reported(m.id) ? '通報ずみ' : '通報する';
    $('cd-del').hidden = !own; $('cd-del').textContent = 'このキャラを消す';
    $('ov-char').classList.add('show');
  }
  function closeChar(keep) { $('ov-char').classList.remove('show'); if (!keep && cur && cur.ch !== myChar) EK.freeChar(cur.ch); cur = null; }
  $('cd-close').onclick = () => closeChar();
  $('cd-use').onclick = () => {
    if (!cur) return;
    const old = myChar; myChar = cur.ch; if (old && old !== myChar) EK.freeChar(old);
    EK.saveChar(myChar); EK.Store.touch(cur.meta.id);
    closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show');
    refreshTitle(); EK.toast('「' + (myChar.name || 'なまえなし') + '」を自分のキャラにしました');
  };
  $('cd-lv').onclick = e => {
    const b = e.target.closest('button[data-level]'); if (!b || !cur) return;
    if (!myChar) { $('cd-err').textContent = '先に自分のキャラをつくるか、「自分のキャラにする」をえらんでね'; return; }
    level = b.dataset.level; const ch = cur.ch; EK.Store.touch(cur.meta.id);
    closeChar(true); for (const o of ['ov-find', 'ov-gal']) $(o).classList.remove('show');
    startCpu(ch);
  };
  $('cd-keep').onclick = () => { if (!cur) return; const ok = EK.Pool.add(cur.ch, 'rival'); $('cd-keep').disabled = true; $('cd-keep').textContent = ok ? 'ライバル帳に入れました' : '保存できませんでした'; refreshTitle(); };
  $('cd-copy').onclick = () => cur && copyText(cur.meta.id, $('cd-copy'));
  // 通報・消す は、2回押して決める（まちがい防止）
  $('cd-report').onclick = async () => {
    const b = $('cd-report'); if (!cur) return;
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'もう一度押すと通報'; setTimeout(() => { delete b.dataset.sure; if (!b.disabled) b.textContent = '通報する'; }, 3000); return; }
    delete b.dataset.sure;
    try { await EK.Store.report(cur.meta.id); b.disabled = true; b.textContent = '通報しました'; } catch (e) { $('cd-err').textContent = '通報できませんでした'; }
  };
  $('cd-del').onclick = async () => {
    const b = $('cd-del'); if (!cur) return;
    if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = 'もう一度押すと消えます'; setTimeout(() => { delete b.dataset.sure; b.textContent = 'このキャラを消す'; }, 3000); return; }
    delete b.dataset.sure;
    try {
      const id = cur.meta.id; await EK.Store.remove(id);
      if (myChar && myChar.id === id) { myChar.id = ''; EK.saveChar(myChar); }
      closeChar(); $('ov-find').classList.remove('show'); refreshTitle(); EK.toast('キャラを消しました');
      if ($('ov-gal').classList.contains('show')) galLoad(galSort);
    } catch (e) { $('cd-err').textContent = e.message || '消せませんでした'; }
  };

  // ---------- みんなのキャラ ----------
  let galSort = 't', galMore = null;
  $('btn-gal').onclick = () => { $('ov-gal').classList.add('show'); galLoad(galSort); };
  $('gal-close').onclick = () => $('ov-gal').classList.remove('show');
  $('gal-tabs').onclick = e => { const b = e.target.closest('button'); if (!b) return; $('gal-tabs').querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); galLoad(b.dataset.sort); };
  $('gal-more').onclick = () => galLoad(galSort, true);
  async function galLoad(sort, more) {
    galSort = sort;
    if (!more) { $('gal-grid').innerHTML = ''; galMore = null; }
    $('gal-msg').textContent = '読みこんでいます…'; $('gal-more').hidden = true;
    try {
      const r = await EK.Store.list(sort, more ? galMore : null);
      if (galSort !== sort) return;
      galMore = r.more;
      $('gal-grid').insertAdjacentHTML('beforeend', r.items.map(e => `<button data-id="${e.id}"><img alt="" src="${/^data:image\/(jpeg|png|webp);base64,/.test(e.th) ? e.th : ''}"><b>${esc(e.n || 'なまえなし')}</b><small>作：${esc(e.a || 'ななし')}</small><small>使われた ${e.uses}回</small></button>`).join(''));
      $('gal-msg').textContent = $('gal-grid').children.length ? '' : 'まだ公開されたキャラがいません。キャラを完成させるときに「公開する」をえらぶと、ここにのります';
      $('gal-more').hidden = !galMore;
    } catch (e) { $('gal-msg').textContent = e.message || '読みこめませんでした'; }
  }
  $('gal-grid').onclick = async e => {
    const b = e.target.closest('button[data-id]'); if (!b || b.disabled) return;
    b.disabled = true;
    try { openChar(await EK.Store.load(b.dataset.id)); } catch (er) { $('gal-msg').textContent = er.message || '読みこめませんでした'; }
    b.disabled = false;
  };

  try { const rc = new URLSearchParams(location.search).get('room'); if (rc) setTimeout(() => openOnline(EK.cleanCode(rc)), 300); } catch (e) {}
  EK._debug = { get match() { return match; }, get models() { return models; }, get myChar() { return myChar; }, set myChar(c) { myChar = c; refreshTitle(); }, startCpu: (lv, ch) => { level = lv || level; startCpu(ch); }, get room() { return room; }, get mine() { return mine; }, scene, camera, renderer, world };
})();
