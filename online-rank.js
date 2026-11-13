(function(){
  const API_READY = () => window.FHACOnline && typeof FHACOnline.loadLeaderboard === 'function';
  let period = 'week';
  let order = 'desc';
  let expanded = false;
  let loading = false;
  let timer = null;

  const T = {
    de: {
      title: 'ONLINE-RANGLISTE', week: 'WOCHE', quarter: 'QUARTAL', all: 'GESAMT',
      most: 'MEISTE SCHÄDEN', least: 'WENIGSTE SCHÄDEN',
      expand: 'ALLE ANZEIGEN', collapse: 'NUR TOP 3',
      empty: 'Noch keine Online-Runs.', error: 'Online-Rangliste nicht erreichbar.',
      player: 'Spieler', damage: 'Schaden', runs: 'Runs'
    },
    en: {
      title: 'ONLINE RANKING', week: 'WEEK', quarter: 'QUARTER', all: 'ALL TIME',
      most: 'MOST DAMAGE', least: 'LEAST DAMAGE',
      expand: 'SHOW ALL', collapse: 'ONLY TOP 3',
      empty: 'No online runs yet.', error: 'Online ranking unavailable.',
      player: 'Player', damage: 'Damage', runs: 'Runs'
    },
    zh: {
      title: '在线排行榜', week: '本周', quarter: '本季度', all: '全部',
      most: '伤害最高', least: '伤害最低',
      expand: '显示全部', collapse: '只看前 3',
      empty: '暂无在线记录。', error: '在线排行榜暂时不可用。',
      player: '玩家', damage: '伤害', runs: '局数'
    }
  };
  const lang = () => {
    const l = window.CAMPUS?.state?.lang;
    return l === 'zh' ? 'zh' : l === 'en' ? 'en' : 'de';
  };
  const t = () => T[lang()];
  const fmt = (n) => new Intl.NumberFormat(lang() === 'de' ? 'de-DE' : lang() === 'zh' ? 'zh-CN' : 'en-US').format(Math.max(0, Math.round(Number(n) || 0)));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function ensurePanel(){
    if (document.getElementById('online-rank')) return document.getElementById('online-rank');
    const box = document.querySelector('.cb-rank');
    if (!box) return null;
    // Hide the local campus HP ranking, keep the panel container.
    const style = document.createElement('style');
    style.textContent = `
      .cb-rank .cb-head,
      .cb-rank #rank-count,
      .cb-rank #rank-sort,
      .cb-rank #rank-list,
      .cb-rank #rank-expand { display:none !important; }
      #online-rank { padding: 2px 0 0; }
      .or-head { display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:8px; }
      .or-title { font:700 11px/1.2 "Arial Narrow",Arial,sans-serif; letter-spacing:.18em; color:#f2b23e; }
      .or-sub { color:#8e9aa5; font-size:10px; }
      .or-tabs, .or-tools { display:flex; gap:4px; flex-wrap:wrap; margin-bottom:7px; }
      .or-btn { appearance:none; border:1px solid #33414d; background:#111820; color:#aab7c2; border-radius:3px; padding:4px 6px; font:600 9px/1.1 Arial,sans-serif; letter-spacing:.06em; cursor:pointer; }
      .or-btn:hover { border-color:#f2b23e; color:#fff; }
      .or-btn.active { border-color:#f2b23e; color:#111820; background:#f2b23e; }
      .or-list { list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:4px; }
      .or-row { display:grid; grid-template-columns:16px minmax(0,1fr) auto; gap:6px; align-items:center; padding:6px 7px; background:#151d25; border:1px solid #26333e; border-radius:3px; }
      .or-rank { color:#f2b23e; font:700 10px/1 Arial,sans-serif; }
      .or-name { color:#e8eef4; font:600 10px/1.2 Arial,sans-serif; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
      .or-meta { color:#7f8e9b; font:500 8px/1.2 Arial,sans-serif; margin-top:2px; }
      .or-dmg { color:#ffcf6a; font:700 10px/1 Arial,sans-serif; text-align:right; white-space:nowrap; }
      .or-empty { color:#8e9aa5; font:500 10px/1.4 Arial,sans-serif; padding:8px 2px; }
      .or-foot { display:flex; justify-content:space-between; gap:8px; margin-top:7px; }
      #or-expand { padding:5px 7px; }
    `;
    document.head.appendChild(style);
    const panel = document.createElement('div');
    panel.id = 'online-rank';
    panel.innerHTML = `
      <div class="or-head"><span class="or-title" id="or-title"></span><span class="or-sub" id="or-sub"></span></div>
      <div class="or-tabs">
        <button class="or-btn" data-period="week" id="or-week"></button>
        <button class="or-btn" data-period="quarter" id="or-quarter"></button>
        <button class="or-btn" data-period="all" id="or-all"></button>
      </div>
      <div class="or-tools"><button class="or-btn" id="or-sort"></button></div>
      <ol class="or-list" id="or-list"></ol>
      <div class="or-empty" id="or-empty" style="display:none"></div>
      <div class="or-foot"><button class="or-btn" id="or-expand"></button></div>
    `;
    box.appendChild(panel);
    panel.querySelectorAll('[data-period]').forEach(btn => {
      btn.addEventListener('click', () => { period = btn.dataset.period; expanded = false; refresh(); });
    });
    document.getElementById('or-sort').addEventListener('click', () => {
      order = order === 'desc' ? 'asc' : 'desc'; expanded = false; refresh();
    });
    document.getElementById('or-expand').addEventListener('click', () => { expanded = !expanded; refresh(); });
    return panel;
  }

  function renderLabels(){
    const el = document.getElementById('online-rank');
    if (!el) return;
    const d = t();
    el.querySelector('#or-title').textContent = d.title;
    el.querySelector('#or-sub').textContent = period === 'week' ? d.week : period === 'quarter' ? d.quarter : d.all;
    el.querySelector('#or-week').textContent = d.week;
    el.querySelector('#or-quarter').textContent = d.quarter;
    el.querySelector('#or-all').textContent = d.all;
    el.querySelector('#or-sort').textContent = order === 'desc' ? d.most : d.least;
    el.querySelector('#or-expand').textContent = expanded ? d.collapse : d.expand;
    el.querySelectorAll('[data-period]').forEach(b => b.classList.toggle('active', b.dataset.period === period));
  }

  async function refresh(){
    ensurePanel();
    if (!ensurePanel() || !API_READY()) return;
    if (loading) return;
    loading = true;
    renderLabels();
    const list = document.getElementById('or-list');
    const empty = document.getElementById('or-empty');
    empty.style.display = 'none';
    list.innerHTML = `<li class="or-empty">…</li>`;
    try {
      const data = await FHACOnline.loadLeaderboard(period, order, expanded ? 50 : 3);
      const rows = data.entries || [];
      if (!rows.length) {
        list.innerHTML = '';
        empty.textContent = t().empty;
        empty.style.display = 'block';
        return;
      }
      list.innerHTML = rows.map((row) => `
        <li class="or-row">
          <span class="or-rank">${row.rank}</span>
          <span><div class="or-name">${esc(row.publicName || 'Anonym')}</div><div class="or-meta">${row.runs || 0} ${esc(t().runs)}</div></span>
          <span class="or-dmg">${fmt(row.totalDamage)}</span>
        </li>
      `).join('');
    } catch (error) {
      list.innerHTML = '';
      empty.textContent = t().error;
      empty.style.display = 'block';
    } finally {
      loading = false;
      renderLabels();
    }
  }

  function boot(){
    const panel = ensurePanel();
    if (!panel) { setTimeout(boot, 400); return; }
    renderLabels();
    refresh();
    if (timer) clearInterval(timer);
    timer = setInterval(refresh, 30000);
    ['reset', 'end-reset'].forEach(id => {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => setTimeout(refresh, 900), true);
    });
    setInterval(renderLabels, 1000);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
