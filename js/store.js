// =============================================
//  キャラID：描いたキャラをサーバーに保存して、8文字のIDで誰でもよび出せる
//
//  データの形（Firebase）
//    eshi_c/{ID}   : { d: キャラ, n: 名前, a: 作者, t: 作った時刻, u: 最後に使われた時刻, uses: 使われた回数, pub: 公開, par: 元にしたID }
//    eshi_pub/{ID} : 公開したキャラの一覧用 { n, a, t, u, uses, th: 小さい絵, rp: { 通報した人: true } }
//    eshi_u/{ID}   : 最後に使われた時刻（いっぱいになったら、使われていない順に消すため）
//    eshi_k/{ID}   : 消すためのかぎ（作ったスマホだけが知っている。だれも読めない）
//    eshi_meta/n   : 保存されている数
// =============================================
(function () {
  const ABC = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';     // 0とO・1とI・L はまぎらわしいので使わない
  const LIMIT = 4000;                                 // これより多くなったら使われていない順に消す（1体 約0.2MB × 4000 ＝ 約0.8GB）
  const KEEP_DAYS = 3;                                // 作ってすぐのキャラは消さない
  const TS = { '.sv': 'timestamp' };
  const rnd = (n, abc = ABC) => { const a = new Uint32Array(n); (window.crypto || {}).getRandomValues ? crypto.getRandomValues(a) : a.forEach((_, i) => { a[i] = Math.random() * 1e9; }); return Array.from(a, v => abc[v % abc.length]).join(''); };
  const ls = { get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }, set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} } };
  EK.cleanId = s => String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);
  EK.isId = s => /^[A-Z0-9]{8}$/.test(s) && [...s].every(c => ABC.includes(c));
  // Firebase（あいことば対戦と同じ場所）
  function loadScript(src) { return new Promise((res, rej) => { const el = document.createElement('script'); el.src = src; el.onload = res; el.onerror = () => rej(new Error(I18N.t('err_net'))); document.head.appendChild(el); }); }
  EK.getDb = async () => {
    if (EK._db) return EK._db;
    if (!EK.FIREBASE_CONFIG) throw new Error(I18N.t('err_prep'));
    const v = '10.12.2';
    if (!window.firebase || !firebase.database) {
      await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-app-compat.js');
      await loadScript('https://www.gstatic.com/firebasejs/' + v + '/firebase-database-compat.js');
    }
    if (!firebase.apps.length) firebase.initializeApp(EK.FIREBASE_CONFIG);
    return EK._db = firebase.database();
  };
  EK.deviceId = () => { let d = ls.get('ek_dev', null); if (!d) { d = rnd(12); ls.set('ek_dev', d); } return d; };

  // 一覧用の小さい絵（白い紙の上に、描いた所を切り出して）
  function thumb(ch) {
    const c = document.createElement('canvas'); c.width = 96; c.height = 128;
    const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, 96, 128);
    EK.drawPreview(ch, c, true);
    const s = c.toDataURL('image/jpeg', 0.72); c.width = c.height = 1; return s;
  }

  EK.Store = {
    db: null,
    async getDb() { if (!this.db) this.db = await EK.getDb(); return this.db; },
    mine() { return ls.get('ek_mine', []); },                       // このスマホで作ったキャラ
    owns(id) { return !!ls.get('ek_own', {})[id]; },
    author() { return ls.get('ek_author', '') || (function () { try { return localStorage.getItem('ek-name') || ''; } catch (e) { return ''; } })(); },
    setAuthor(a) { ls.set('ek_author', String(a || '').trim().slice(0, 8)); },

    // 保存してIDをもらう
    async save(ch, opt = {}) {
      const db = await this.getDb();
      let d = EK.packChar(ch, 0.75);
      if (d.length > 440000) d = EK.packChar(ch, 0.5);      // 色が多くて大きいときは少し小さくして保存
      if (d.length > 440000) throw new Error(I18N.t('err_big'));
      const name = String(ch.name || '').slice(0, 8), a = String(opt.author || '').trim().slice(0, 8) || I18N.t('noname');
      const key = rnd(24);
      // キャラ・かぎ・一覧・数を、1回でまとめて書く（数は「本当に増えたとき」しか増やせないルール）
      for (let tries = 0; tries < 8; tries++) {
        const id = rnd(8);
        const [ex, gone, meta] = await Promise.all(['eshi_c/' + id + '/t', 'eshi_gone/' + id, 'eshi_meta'].map(p => db.ref(p).once('value').then(x => x.val())));
        if (ex || gone) continue;                       // 一度使われたIDは、二度と使わない
        const rec = { d, n: name, a, t: TS, u: TS, uses: 0, pub: !!opt.pub };
        if (opt.par && EK.isId(opt.par)) rec.par = opt.par;
        const up = {};
        up['eshi_c/' + id] = rec; up['eshi_k/' + id] = key; up['eshi_u/' + id] = TS;
        if (opt.pub) up['eshi_pub/' + id] = { n: name, a, t: TS, u: TS, uses: 0, th: thumb(ch) };
        up['eshi_meta'] = { n: ((meta && meta.n) || 0) + 1, last: id };
        try { await db.ref().update(up); } catch (er) { continue; }   // 同時に保存した人がいたら、やりなおし
        const own = ls.get('ek_own', {}); own[id] = key; ls.set('ek_own', own);
        const mine = this.mine().filter(x => x.id !== id); mine.unshift({ id, name, t: Date.now(), pub: !!opt.pub }); ls.set('ek_mine', mine.slice(0, 50));
        this.tidy().catch(() => {});
        return id;
      }
      throw new Error(I18N.t('err_noid'));
    },
    // 消す（キャラ・一覧・かぎを消して、「消えた理由」を残す。数も1へらす）
    async drop(id, why) {
      const db = await this.getDb();
      for (let tries = 0; tries < 5; tries++) {
        const meta = (await db.ref('eshi_meta').once('value')).val() || { n: 1 };
        const up = {}; for (const p of ['eshi_c/', 'eshi_pub/', 'eshi_u/', 'eshi_k/']) up[p + id] = null;
        up['eshi_gone/' + id] = { w: why, t: TS };
        up['eshi_meta'] = { n: Math.max(0, (meta.n || 1) - 1), last: id };
        try { await db.ref().update(up); return true; } catch (e) {}
      }
      return false;
    },
    // 消えたIDのわけ
    async goneMsg(id) {
      const db = await this.getDb();
      const g = (await db.ref('eshi_gone/' + id).once('value')).val();
      if (g && g.w === 'full') return I18N.t('gone_full');
      if (g && g.w === 'del') return I18N.t('gone_del');
      return I18N.t('gone_nf');
    },
    // まだあるか（タイトルや自分のID一覧で使う）
    async exists(id) { try { const db = await this.getDb(); return !!(await db.ref('eshi_c/' + id + '/t').once('value')).val(); } catch (e) { return null; } },
    // IDでよぶ
    async load(id) {
      id = EK.cleanId(id); if (!EK.isId(id)) throw new Error(I18N.t('id_bad'));
      const db = await this.getDb();
      const s = await db.ref('eshi_c/' + id).once('value'), v = s.val();
      if (!v || !v.d) throw new Error(await this.goneMsg(id));
      const ch = await EK.unpackChar(v.d);
      ch.id = id; ch.author = v.a || ''; ch.name = v.n || ch.name || '';
      return { ch, meta: { id, name: v.n || '', author: v.a || '', uses: v.uses || 0, pub: !!v.pub, t: v.t || 0 } };
    },
    // 使われた（一覧の人気順と、消す順番のため）
    async touch(id) {
      if (!EK.isId(id || '')) return;
      const now = Date.now(); this._t = this._t || {};
      if (this._t[id] && now - this._t[id] < 10 * 60e3) return;     // 同じキャラは10分に1回だけ数える
      this._t[id] = now;
      try {
        const db = await this.getDb();
        const ex = (await db.ref('eshi_c/' + id + '/t').once('value')).val(); if (!ex) return;
        const up = {}; up['eshi_c/' + id + '/u'] = TS; up['eshi_u/' + id] = TS;
        const pub = (await db.ref('eshi_pub/' + id + '/t').once('value')).val(); if (pub) up['eshi_pub/' + id + '/u'] = TS;
        await db.ref().update(up);
        await db.ref('eshi_c/' + id + '/uses').transaction(n => (n || 0) + 1);
        if (pub) await db.ref('eshi_pub/' + id + '/uses').transaction(n => (n || 0) + 1);
      } catch (e) {}
    },
    // みんなのキャラ：sort は 't'（新しい順）か 'uses'（人気順）
    async list(sort, after) {
      const db = await this.getDb();
      let q = db.ref('eshi_pub').orderByChild(sort);
      if (after) q = q.endBefore(after.v, after.id);
      const s = await q.limitToLast(30).once('value'), out = [];
      s.forEach(c => { const v = c.val(); out.push({ id: c.key, n: v.n || '', a: v.a || '', uses: v.uses || 0, t: v.t || 0, th: v.th || '', rp: v.rp ? Object.keys(v.rp).length : 0, v: v[sort] || 0 }); });
      out.reverse();
      const last = out[out.length - 1];
      return { items: out.filter(e => e.rp < 3), more: out.length >= 30 ? { v: last.v, id: last.id } : null };
    },
    async report(id) {
      const db = await this.getDb();
      await db.ref('eshi_pub/' + id + '/rp/' + EK.deviceId()).set(true);
      const r = ls.get('ek_rep', []); r.push(id); ls.set('ek_rep', r.slice(-100));
    },
    reported(id) { return ls.get('ek_rep', []).includes(id); },
    // 作ったスマホから消す
    async remove(id) {
      const key = ls.get('ek_own', {})[id]; if (!key) throw new Error(I18N.t('del_own'));
      const db = await this.getDb();
      await db.ref('eshi_del/' + id).set(key);
      const ok = await this.drop(id, 'del');
      await db.ref('eshi_del/' + id).remove();
      if (!ok) throw new Error(I18N.t('del_net'));
      const own = ls.get('ek_own', {}); delete own[id]; ls.set('ek_own', own);
      ls.set('ek_mine', this.mine().filter(e => e.id !== id));
    },
    // 保管庫がいっぱいになったら、最後に使われたのがいちばん古いキャラから消す
    async tidy() {
      const db = await this.getDb();
      const n = ((await db.ref('eshi_meta').once('value')).val() || {}).n || 0;
      if (n <= LIMIT) return 0;
      const s = await db.ref('eshi_u').orderByValue().limitToFirst(Math.min(5, n - LIMIT)).once('value');
      const old = []; s.forEach(c => { if (c.val() < Date.now() - KEEP_DAYS * 864e5) old.push(c.key); });
      let k = 0;
      for (const id of old) if (await this.drop(id, 'full')) k++;
      return k;
    },
    LIMIT
  };
})();
