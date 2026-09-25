(function () {
  var CLASSES = [
    'Warrior', 'Paladin', 'Hunter', 'Rogue', 'Priest',
    'Shaman', 'Mage', 'Warlock', 'Druid'
  ];
  var LOCAL_KEY = 'intel-interest-local';
  var RATE_KEY = 'intel-interest-rate';
  var RATE_MS = 30000;
  var TABLE = 'interest_signups';

  var form = document.getElementById('interest-form');
  var statusEl = document.getElementById('interest-status');
  var rosterEl = document.getElementById('interest-roster');
  var countEl = document.getElementById('interest-count');
  var bannerEl = document.getElementById('interest-offline-banner');
  var submitBtn = document.getElementById('interest-submit');

  if (!form || !rosterEl || !countEl) return;

  var cfg = (window.INTEL_SUPABASE && typeof window.INTEL_SUPABASE === 'object')
    ? window.INTEL_SUPABASE
    : {};
  var url = (cfg.url || '').trim();
  var anonKey = (cfg.anonKey || '').trim();
  var live = !!(url && anonKey && window.supabase && typeof window.supabase.createClient === 'function');
  var client = null;
  var channel = null;

  function setStatus(msg, kind) {
    if (!statusEl) return;
    statusEl.textContent = msg || '';
    statusEl.className = 'interest-status' + (kind ? ' interest-status--' + kind : '');
  }

  function escapeText(s) {
    // Display via textContent only — never assign to innerHTML for user names.
    return String(s == null ? '' : s);
  }

  function relativeTime(iso) {
    var t = Date.parse(iso);
    if (isNaN(t)) return 'just now';
    var sec = Math.round((Date.now() - t) / 1000);
    if (sec < 5) return 'just now';
    if (sec < 60) return sec + 's ago';
    var min = Math.round(sec / 60);
    if (min < 60) return min + 'm ago';
    var hr = Math.round(min / 60);
    if (hr < 48) return hr + 'h ago';
    var day = Math.round(hr / 24);
    return day + 'd ago';
  }

  function loadLocal() {
    try {
      var raw = localStorage.getItem(LOCAL_KEY);
      var arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch (e) {
      return [];
    }
  }

  function saveLocal(rows) {
    try {
      localStorage.setItem(LOCAL_KEY, JSON.stringify(rows));
    } catch (e) { /* ignore quota */ }
  }

  function renderRoster(rows) {
    var list = Array.isArray(rows) ? rows.slice() : [];
    countEl.textContent = String(list.length);
    rosterEl.textContent = '';

    if (!list.length) {
      var empty = document.createElement('p');
      empty.className = 'interest-empty';
      empty.textContent = 'No interest yet — be the first on the starter roster.';
      rosterEl.appendChild(empty);
      return;
    }

    var ul = document.createElement('ul');
    ul.className = 'interest-roster-list';
    list.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'interest-roster-item';

      var name = document.createElement('span');
      name.className = 'interest-roster-name';
      name.textContent = escapeText(row.character_name);

      var cls = document.createElement('span');
      cls.className = 'interest-roster-class hud-chip';
      cls.textContent = escapeText(row.class);

      var meta = document.createElement('span');
      meta.className = 'interest-roster-meta';
      var when = relativeTime(row.created_at);
      meta.textContent = row._local ? when + ' · local preview (not shared)' : when;

      li.appendChild(name);
      li.appendChild(cls);
      li.appendChild(meta);
      ul.appendChild(li);
    });
    rosterEl.appendChild(ul);
  }

  function normalizeRow(row, local) {
    return {
      id: row.id,
      character_name: row.character_name,
      class: row.class,
      created_at: row.created_at || new Date().toISOString(),
      _local: !!local
    };
  }

  function rateLimited() {
    try {
      var last = parseInt(sessionStorage.getItem(RATE_KEY) || '0', 10);
      if (!last) return false;
      return Date.now() - last < RATE_MS;
    } catch (e) {
      return false;
    }
  }

  function markSubmitted() {
    try {
      sessionStorage.setItem(RATE_KEY, String(Date.now()));
    } catch (e) { /* ignore */ }
  }

  function rateRemainingSec() {
    try {
      var last = parseInt(sessionStorage.getItem(RATE_KEY) || '0', 10);
      var left = Math.ceil((RATE_MS - (Date.now() - last)) / 1000);
      return left > 0 ? left : 0;
    } catch (e) {
      return 0;
    }
  }

  async function fetchLive() {
    var res = await client
      .from(TABLE)
      .select('id, character_name, class, created_at')
      .eq('is_hidden', false)
      .order('created_at', { ascending: false });
    if (res.error) throw res.error;
    return (res.data || []).map(function (r) { return normalizeRow(r, false); });
  }

  function subscribeLive() {
    channel = client
      .channel('interest_signups_live')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: TABLE },
        function () { refresh(); }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: TABLE },
        function () { refresh(); }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: TABLE },
        function () { refresh(); }
      )
      .subscribe();
  }

  async function refresh() {
    try {
      if (live) {
        var rows = await fetchLive();
        renderRoster(rows);
      } else {
        renderRoster(loadLocal().map(function (r) { return normalizeRow(r, true); }));
      }
    } catch (err) {
      setStatus('Could not load roster. Try refreshing.', 'error');
      console.warn('[interest]', err);
    }
  }

  async function submitLive(name, cls) {
    var res = await client.from(TABLE).insert({
      character_name: name,
      class: cls
    });
    if (res.error) throw res.error;
  }

  function submitLocal(name, cls) {
    var rows = loadLocal();
    rows.unshift({
      id: 'local-' + Date.now(),
      character_name: name,
      class: cls,
      created_at: new Date().toISOString()
    });
    saveLocal(rows);
    renderRoster(rows.map(function (r) { return normalizeRow(r, true); }));
  }

  form.addEventListener('submit', async function (ev) {
    ev.preventDefault();
    setStatus('');

    var honeypot = form.querySelector('[name="website"]');
    if (honeypot && honeypot.value) {
      // Silent ignore for bots
      setStatus('Thanks — interest recorded.', 'ok');
      form.reset();
      return;
    }

    var nameInput = form.querySelector('[name="character_name"]');
    var classInput = form.querySelector('[name="class"]');
    var name = (nameInput && nameInput.value ? nameInput.value : '').trim();
    var cls = (classInput && classInput.value ? classInput.value : '').trim();

    if (!name || name.length > 24) {
      setStatus('Character name required (1–24 characters).', 'error');
      return;
    }
    if (CLASSES.indexOf(cls) === -1) {
      setStatus('Pick a valid class.', 'error');
      return;
    }
    if (rateLimited()) {
      setStatus('Slow down — try again in ' + rateRemainingSec() + 's.', 'error');
      return;
    }

    if (submitBtn) submitBtn.disabled = true;
    try {
      if (live) {
        await submitLive(name, cls);
        markSubmitted();
        setStatus('Interest recorded. You are on the live roster.', 'ok');
        form.reset();
        await refresh();
      } else {
        submitLocal(name, cls);
        markSubmitted();
        setStatus('Saved locally (offline preview — not shared).', 'ok');
        form.reset();
      }
    } catch (err) {
      var msg = (err && err.message) ? err.message : 'Submit failed.';
      setStatus(msg, 'error');
      console.warn('[interest] submit', err);
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });

  var cachedRows = [];

  var _renderRoster = renderRoster;
  renderRoster = function (rows) {
    cachedRows = Array.isArray(rows) ? rows.slice() : [];
    _renderRoster(cachedRows);
  };

  // Boot
  if (!live) {
    if (bannerEl) {
      bannerEl.hidden = false;
      if (!(url && anonKey)) {
        bannerEl.innerHTML =
          '<strong>Offline / local preview.</strong> ' +
          'Supabase config is empty, so submissions stay in this browser only ' +
          '(<code>intel-interest-local</code>) and are labeled ' +
          '<em>local preview (not shared)</em>. Fill <code>js/supabase-config.js</code> to go live.';
      } else {
        bannerEl.innerHTML =
          '<strong>Supabase client unavailable.</strong> ' +
          'Config is set but the CDN client did not load. Using local preview ' +
          '(<code>intel-interest-local</code>).';
      }
    }
    renderRoster(loadLocal().map(function (r) { return normalizeRow(r, true); }));
  } else {
    if (bannerEl) bannerEl.hidden = true;
    client = window.supabase.createClient(url, anonKey);
    refresh();
    subscribeLive();
  }

  // Refresh relative times periodically (no network)
  setInterval(function () {
    if (cachedRows.length) _renderRoster(cachedRows);
  }, 60000);
})();
