(function(){
  let order = 'desc';
  let expanded = false;
  let loading = false;
  let lastLang = null;
  let resetting = false;

  const T = {
    de: {
      title: 'RANGLISTE', sub: 'online · nach Schaden',
      top: 'TOP 3', all: 'ALLE',
      most: 'SORTIERUNG: MEISTE SCHÄDEN', least: 'SORTIERUNG: WENIGSTE SCHÄDEN',
      expand: 'ALLE UNIVERSITÄTEN ANZEIGEN', collapse: 'NUR TOP 3',
      empty: 'Noch keine Universität beschädigt.', error: 'Online-Rangliste nicht erreichbar.',
      runs: 'Runs', dmg: 'DMG',
      maps: 'CAMPUS-KARTEN', campuses: '19 CAMPUS',
      foot: 'Etagen = interaktive Gebäudeebenen · HP = 1.000.000 + Etagen × 1.200'
    },
    en: {
      title: 'RANKING', sub: 'online · by damage',
      top: 'TOP 3', all: 'ALL',
      most: 'SORTING: MOST DAMAGE', least: 'SORTING: LEAST DAMAGE',
      expand: 'SHOW ALL UNIVERSITIES', collapse: 'ONLY TOP 3',
      empty: 'No university damaged yet.', error: 'Online ranking unavailable.',
      runs: 'Runs', dmg: 'DMG',
      maps: 'CAMPUS MAPS', campuses: '19 CAMPUSES',
      foot: 'Floors = destructible building levels · HP = 1,000,000 + floors × 1,200'
    },
    zh: {
      title: '排行榜', sub: '在线 · 按伤害',
      top: '前 3', all: '全部',
      most: '排序：伤害最高', least: '排序：伤害最低',
      expand: '显示全部大学', collapse: '只看前 3',
      empty: '暂无大学受损记录。', error: '在线排行榜暂时不可用。',
      runs: '局', dmg: '伤害',
      maps: '哒学地图', campuses: '19 所哒学',
      foot: '层数 = 可破坏楼层 · 总血量 = 1,000,000 + 层数 × 1,200'
    }
  };
  const lang = () => {
    const l = window.CAMPUS?.state?.lang;
    return l === 'zh' ? 'zh' : l === 'en' ? 'en' : 'de';
  };
  const t = () => T[lang()] || T.de;
  const fmt = (n) => new Intl.NumberFormat(lang() === 'zh' ? 'zh-CN' : lang() === 'de' ? 'de-DE' : 'en-US').format(Math.max(0, Math.round(Number(n) || 0)));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));

  function ensureEmptyCss(){
    if (document.getElementById('or-empty-css')) return;
    const st = document.createElement('style');
    st.id = 'or-empty-css';
    st.textContent = '.rank-empty{padding:14px 8px;color:#8e9aa5;font:500 11px/1.4 system-ui,sans-serif}';
    document.head.appendChild(st);
  }

  function bindButtons(){
    const sort = document.getElementById('rank-sort');
    if (sort && sort.dataset.online !== '1') {
      const b = sort.cloneNode(true);
      b.dataset.online = '1';
      sort.replaceWith(b);
      b.addEventListener('click', () => { order = order === 'desc' ? 'asc' : 'desc'; loading = false; refresh(); });
    }
    const exp = document.getElementById('rank-expand');
    if (exp && exp.dataset.online !== '1') {
      const b = exp.cloneNode(true);
      b.dataset.online = '1';
      exp.replaceWith(b);
      b.addEventListener('click', () => { expanded = !expanded; loading = false; refresh(); });
    }
  }

  function applyLabels(){
    const d = t();
    const setText = (el, text) => { if (el && el.textContent !== text) el.textContent = text; };
    setText(document.querySelector('.cb-head b'), d.title);
    setText(document.querySelector('.cb-head small'), d.sub);
    const total = (window.__onlineRows || []).length;
    setText(document.getElementById('rank-count'), expanded ? `${d.all} ${total}` : d.top);
    const sort = document.getElementById('rank-sort');
    if (sort) { setText(sort, order === 'desc' ? d.most : d.least); sort.title = order === 'desc' ? d.most : d.least; }
    setText(document.getElementById('rank-expand'), expanded ? d.collapse : d.expand);
    setText(document.querySelector('.cb-list-head b'), d.maps);
    setText(document.getElementById('campus-count'), d.campuses);
    setText(document.querySelector('.cb-foot'), d.foot);
    const list = document.getElementById('rank-list');
    if (window.__onlineRows && list && (!list.querySelector('.online-row,.rank-empty') || window.__renderedLang !== lang())) render();
  }

  function openCampus(id) {
    try {
      localStorage.setItem('ca-campus', id);
      const url = new URL(location.href);
      url.searchParams.delete('v');
      url.searchParams.delete('play');
      url.searchParams.set('campus', id);
      url.searchParams.set('play', '1');
      location.href = url.toString();
    } catch (e) {}
  }

  function render(){
    if (!window.__onlineRows) return;
    const d = t();
    const list = document.getElementById('rank-list');
    window.__renderedLang = lang();
    if (!list) return;
    list.dataset.online = '1';
    list.classList.add('rank-ready');
    list.classList.toggle('bengda-all', expanded);
    list.innerHTML = '';
    const rows = window.__onlineRows || [];
    const expBtn = document.getElementById('rank-expand');
    if (expBtn) expBtn.style.display = rows.length > 3 ? '' : 'none';
    if (!rows.length) {
      list.innerHTML = `<div class="rank-empty">${esc(window.__onlineError ? d.error : d.empty)}</div>`;
      return;
    }
    const max = Math.max(1, ...rows.map(r => Number(r.totalDamage) || 0));
    for (let rowIndex = 0; rowIndex < rows.length; rowIndex++) {
      const row = rows[rowIndex];
      const name = (window.__bengdaCampusName && window.__bengdaCampusName(row.campusId)) || row.name || row.campusId;
      const pct = Math.max(0, Math.min(100, (Number(row.totalDamage) || 0) / max * 100));
      const sub = `${row.runs || 0} ${d.runs}${row.city ? ' · ' + row.city : ''}`;
      const el = document.createElement('div');
      el.className = 'rank-row online-row';
      el.style.cursor = 'pointer';
      el.dataset.campusId = row.campusId;
      el.title = name;
      el.addEventListener('click', () => openCampus(row.campusId));
      el.innerHTML = `<div class="rank-no">${rowIndex + 1}</div>
        <div class="rank-main">
          <div class="rank-name">${esc(name)}</div>
          <div class="rank-sub">${esc(sub)}</div>
          <div class="rank-bar"><i style="width:${pct.toFixed(1)}%"></i></div>
        </div>
        <div class="rank-hp">${fmt(row.totalDamage)}<small> ${esc(d.dmg)}</small></div>`;
      list.appendChild(el);
    }
  }

  async function refresh(){
    if (loading || !window.FHACOnline || typeof FHACOnline.loadLeaderboard !== 'function') return;
    loading = true;
    window.__onlineError = false;
    try {
      const data = await FHACOnline.loadCampusLeaderboard('all', order, 200);
      const entries = data.entries || [];
      const byId = new Map(entries.map((e) => [e.campusId, e]));
      const campuses = (window.CAMPUS && window.CAMPUS.campuses) || [];
      let rows = campuses.map((c) => {
        const e = byId.get(c.id) || {};
        return {
          campusId: c.id,
          name: c.name,
          city: c.city || '',
          totalDamage: Number(e.totalDamage || 0),
          runs: Number(e.runs || 0),
        };
      });
      if (!rows.length) rows = entries;
      const dir = order === 'asc' ? 1 : -1;
      rows.sort((a, b) => {
        const d = ((Number(a.totalDamage) || 0) - (Number(b.totalDamage) || 0)) * dir;
        if (d) return d;
        return String(a.campusId).localeCompare(String(b.campusId));
      });
      window.__onlineRows = rows;
      window.__onlineOrder = order;
      window.__onlineError = false;
    } catch (error) {
      window.__onlineRows = [];
      window.__onlineError = true;
    } finally {
      loading = false;
      bindButtons();
      render();
      applyLabels();
    }
  }

  function boot(){
    ensureEmptyCss();
    bindButtons();
    applyLabels();
    refresh();
    setInterval(() => {
      bindButtons();
      lastLang = lang();
      applyLabels();
    }, 800);
    const labelTargets = [document.querySelector('.cb-head'), document.getElementById('rank-count'), document.getElementById('rank-expand'), document.querySelector('.cb-list-head'), document.getElementById('campus-count'), document.querySelector('.cb-foot')].filter(Boolean);
    const labelObs = new MutationObserver(() => { bindButtons(); applyLabels(); });
    for (const el of labelTargets) labelObs.observe(el, { childList: true, subtree: true, characterData: true });
    setInterval(refresh, 30000);
    for (const id of ['reset', 'end-reset']) {
      const b = document.getElementById(id);
      if (b) b.addEventListener('click', () => { setTimeout(refresh, 900); }, true);
    }
    window.addEventListener('fhac-online-report', () => { setTimeout(refresh, 150); });
    const list = document.getElementById('rank-list');
    if (list) {
      new MutationObserver(() => {
        if (!list.querySelector('.online-row,.rank-empty')) {
          setTimeout(refresh, 60);
        }
      }).observe(list, { childList: true });
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
