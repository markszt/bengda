/**
 * FH Aachen online leaderboard client
 * No dependencies. Drop into the game page after CAMPUS exists.
 *
 * Usage:
 *   <script src="online.js"></script>
 *   <script>
 *     FHACOnline.configure({ apiBase: 'https://fh-aachen-leaderboard.xxx.workers.dev' });
 *     FHACOnline.attachToGame();
 *   </script>
 *
 * The server, not the client, decides the minimum duration and maximum damage.
 * This client sends state.damage delta, not score.
 */
(function () {
  const STORAGE_ID = 'fhac-player-id';
  const STORAGE_NAME = 'fhac-public-name';
  const state = {
    apiBase: '',
    run: null,
    playerId: null,
    publicName: null,
    lastError: null,
    autoTimer: null,
    busy: false,
    starting: false,
    submittedDamage: 0,
  };

  function uuid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    bytes[6] = (bytes[6] & 0x0f) | 0x40;
    bytes[8] = (bytes[8] & 0x3f) | 0x80;
    const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
  }

  function playerId() {
    if (state.playerId) return state.playerId;
    let id = null;
    try { id = localStorage.getItem(STORAGE_ID); } catch (e) {}
    if (!id) {
      id = uuid();
      try { localStorage.setItem(STORAGE_ID, id); } catch (e) {}
    }
    state.playerId = id;
    return id;
  }

  function publicName() {
    if (state.publicName !== null) return state.publicName;
    try { state.publicName = localStorage.getItem(STORAGE_NAME) || ''; } catch (e) { state.publicName = ''; }
    return state.publicName;
  }

  function api(path, options = {}) {
    if (!state.apiBase) return Promise.reject(new Error('FHACOnline: apiBase is not configured'));
    const url = state.apiBase.replace(/\/+$/, '') + path;
    const headers = { ...(options.headers || {}) };
    if (options.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    return fetch(url, {
      ...options,
      headers,
      credentials: 'omit',
      cache: 'no-store',
    }).then(async (res) => {
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const err = new Error(data.error || `HTTP ${res.status}`);
        err.status = res.status;
        err.data = data;
        throw err;
      }
      return data;
    });
  }

  function configure(options = {}) {
    if (typeof options.apiBase === 'string') state.apiBase = options.apiBase.trim();
    if (typeof options.publicName === 'string') {
      state.publicName = options.publicName.trim();
      try { localStorage.setItem(STORAGE_NAME, state.publicName); } catch (e) {}
    }
    return api('/api/players', {
      method: 'POST',
      body: JSON.stringify({ playerId: playerId(), publicName: publicName() || null }),
    }).catch((err) => { state.lastError = err; return null; });
  }

  function gameDamage() {
    try {
      return Math.max(0, Math.round(Number(window.CAMPUS?.state?.damage) || 0));
    } catch (e) {
      return 0;
    }
  }

  function currentCampusId() {
    try {
      if (window.CAMPUS && typeof window.CAMPUS.campusId === 'string' && window.CAMPUS.campusId) return window.CAMPUS.campusId;
      const fromUrl = new URL(location.href).searchParams.get('campus');
      if (fromUrl) return fromUrl;
      return localStorage.getItem('ca-campus') || 'aachen';
    } catch (e) {
      return 'aachen';
    }
  }

  async function startRun() {
    if (state.starting) return state.run;
    state.starting = true;
    try {
      const id = playerId();
      const res = await api('/api/runs/start', {
        method: 'POST',
        body: JSON.stringify({ playerId: id }),
      });
      state.run = {
        nonce: res.nonce,
        startedAt: res.startedAt || new Date().toISOString(),
        startDamage: gameDamage(),
        startClientTime: Date.now(),
        campusId: currentCampusId(),
        reported: false,
      };
      return state.run;
    } finally {
      state.starting = false;
    }
  }

  /**
   * Finish the current run and submit damage.
   * Call this from reset/end card, or on pagehide.
   * The server uses the nonce issue time as the run duration.
   */
  async function finishRun(reason = 'manual') {
    if (!state.run || state.run.reported) return null;
    const run = state.run;
    const damage = Math.max(0, gameDamage() - run.startDamage);
    const elapsedClient = Math.max(1, Math.round((Date.now() - run.startClientTime) / 1000));
    // Do not submit absurdly short runs; the server would reject them anyway.
    if (elapsedClient < 5) {
      state.run = null;
      return { skipped: true, reason: 'too-short' };
    }
    try {
      const res = await api('/api/runs', {
        method: 'POST',
        body: JSON.stringify({
          playerId: playerId(),
          nonce: run.nonce,
          damage,
          campusId: run.campusId || currentCampusId(),
          gameVersion: '2.05',
        }),
        keepalive: reason === 'pagehide' || reason === 'hidden',
      });
      run.reported = true;
      state.run = null;
      state.submittedDamage += damage;
      try {
        window.dispatchEvent(new CustomEvent('fhac-online-report', { detail: { damage, reason } }));
      } catch (e) {}
      return { ...res, reason, damage, elapsedClient };
    } catch (error) {
      state.lastError = error;
      // A failed report must not allow the same nonce to be retried forever;
      // clear it unless the server explicitly says the nonce is still fresh.
      if (error.status === 429) return { error: error.message, reason: 'rate-limited' };
      state.run = null;
      return { error: error.message, reason: 'failed' };
    }
  }

  function stopAuto() {
    if (state.autoTimer) {
      clearInterval(state.autoTimer);
      state.autoTimer = null;
    }
  }

  function startAuto() {
    stopAuto();
    state.autoTimer = setInterval(async () => {
      if (state.busy || !state.run) return;
      const game = window.CAMPUS && window.CAMPUS.state;
      if (!game || !game.started) return;
      if (game.ended) {
        state.busy = true;
        try { await finishRun('ended'); } catch (error) { state.lastError = error; }
        stopAuto();
        state.busy = false;
        return;
      }
      const damage = gameDamage() - state.run.startDamage;
      if (damage < 1) return;
      state.busy = true;
      try {
        const result = await finishRun('auto');
        if (result && !result.error && game.started && !game.ended) {
          await startRun();
        }
      } catch (error) {
        state.lastError = error;
      } finally {
        state.busy = false;
      }
    }, 6000);
  }

  async function deleteData() {
    const res = await api('/api/players', {
      method: 'DELETE',
      body: JSON.stringify({ playerId: playerId() }),
    });
    state.run = null;
    try { localStorage.removeItem(STORAGE_ID); localStorage.removeItem(STORAGE_NAME); } catch (e) {}
    state.playerId = null;
    return res;
  }

  async function loadStats(period = 'week') {
    return api(`/api/stats?period=${encodeURIComponent(period)}`);
  }

  async function loadLeaderboard(period = 'week', order = 'desc', limit = 50) {
    return api(`/api/leaderboard?period=${encodeURIComponent(period)}&order=${encodeURIComponent(order)}&limit=${Math.max(1, Math.min(100, limit))}`);
  }

  async function loadCampusLeaderboard(period = 'all', order = 'desc', limit = 100) {
    return api(`/api/campus-leaderboard?period=${encodeURIComponent(period)}&order=${encodeURIComponent(order)}&limit=${Math.max(1, Math.min(200, limit))}`);
  }

  function bindOnce() {
    if (window.__fhacOnlineBound) return;
    window.__fhacOnlineBound = true;
    window.addEventListener('pagehide', () => {
      stopAuto();
      if (state.run && !state.run.reported) finishRun('pagehide').catch(() => {});
    });
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden || !state.run || state.run.reported) return;
      stopAuto();
      finishRun('hidden').catch(() => {});
    });
  }

  /**
   * Optional game hooks:
   * - start when #play is clicked
   * - finish when reset / end-reset is clicked
   * It does not change gameplay state.
   */
  function attachToGame() {
    bindOnce();
    const play = document.getElementById('play');
    if (play) {
      play.addEventListener('click', () => {
        startRun().then(() => startAuto()).catch((err) => { state.lastError = err; });
      }, true);
    }
    // The game can auto-start from ?play=1 (campus cards / ranking rows).
    setTimeout(function watchAutoStart() {
      try {
        const game = window.CAMPUS && window.CAMPUS.state;
        if (game && game.started && !game.ended && !state.run && !state.starting && !state.busy) {
          startRun().then(() => startAuto()).catch((err) => { state.lastError = err; });
        }
      } catch (e) {}
      setTimeout(watchAutoStart, 700);
    }, 350);
    for (const id of ['reset', 'end-reset']) {
      const button = document.getElementById(id);
      if (button) {
        button.addEventListener('click', () => {
          stopAuto();
          finishRun(id).catch((err) => { state.lastError = err; });
        }, true);
      }
    }
  }

  window.FHACOnline = {
    configure,
    attachToGame,
    startRun,
    finishRun,
    loadStats,
    loadLeaderboard,
    loadCampusLeaderboard,
    deleteData,
    currentCampusId,
    startAuto,
    stopAuto,
    playerId,
    publicName,
    get run() { return state.run; },
    get submittedDamage() { return state.submittedDamage; },
    get lastError() { return state.lastError; },
  };
})();
