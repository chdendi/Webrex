import { Hono } from 'hono';

const app = new Hono();

// ===========================================================================
// ① COMPREHENSIVE DEMO — replaces react.dev for most lessons
// ===========================================================================
app.get('/lessons/webrex-demo', (c) => {
  c.res.headers.set('Set-Cookie', 'webrex_session=demo123; Path=/; SameSite=Lax; HttpOnly; Max-Age=3600');
  c.res.headers.set('Set-Cookie', 'webrex_theme=dark; Path=/; SameSite=Lax; Max-Age=86400');

  const show = c.req.query('show');
  const allowed = show && show !== 'all' ? new Set(show.split(',').map((s) => s.trim())) : null;

  const sections: Record<string, string[]> = {
    hero: ['<section class="hero" data-testid="hero-section">'],
    search: [
      '<div class="search-bar" data-testid="search-section">',
      '<h2 class="section-title" data-testid="features-title">',
    ],
    cards: ['<div class="cards" id="cards" data-testid="cards-grid">'],
    table: [
      '<h2 class="section-title" data-testid="data-title">',
      '<div class="data-table" data-testid="data-table-section">',
    ],
    form: [
      '<h2 class="section-title" data-testid="form-title">',
      '<div class="form-section" data-testid="form-section">',
    ],
    banner: ['<div class="animated-banner" data-testid="animated-banner">'],
  };

  let html = `<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Webrex Demo — DevTools Practice</title>
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🧪</text></svg>" />
  <style>
    :root {
      --bg: #f8fafc; --card-bg: #fff; --text: #1e293b; --muted: #64748b;
      --primary: #3B82F6; --border: #e2e8f0; --accent: #f59e0b;
    }
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: system-ui, -apple-system, sans-serif;
      background: var(--bg); color: var(--text); line-height: 1.6;
    }

    /* ── Navigation ── */
    header {
      background: var(--card-bg); border-bottom: 1px solid var(--border);
      padding: 0 1.5rem; position: sticky; top: 0; z-index: 100;
      display: flex; align-items: center; justify-content: space-between;
      height: 56px; backdrop-filter: blur(8px);
    }
    .logo { font-weight: 700; font-size: 1.1rem; color: var(--primary); }
    nav { display: flex; gap: 0.25rem; }
    nav a {
      padding: 0.4rem 0.75rem; border-radius: 6px; text-decoration: none;
      color: var(--muted); font-size: 0.875rem; font-weight: 500; cursor: pointer;
      transition: background 0.15s, color 0.15s;
    }
    nav a:hover { background: #f1f5f9; color: var(--text); }
    nav a:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }

    /* ── Mobile menu button ── */
    .menu-btn {
      display: none; background: none; border: none; font-size: 1.5rem;
      cursor: pointer; padding: 0.25rem; color: var(--text);
    }

    /* ── Hero ── */
    .hero {
      max-width: 840px; margin: 3rem auto 2rem; padding: 0 1.5rem;
    }
    .hero h1 {
      font-size: 2.25rem; font-weight: 700; letter-spacing: -0.03em;
      margin-bottom: 0.75rem; color: var(--text);
    }
    .hero p { color: var(--muted); font-size: 1.1rem; max-width: 600px; margin-bottom: 1.5rem; }
    .hero-btns { display: flex; gap: 0.75rem; flex-wrap: wrap; }
    .btn {
      display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.6rem 1.2rem;
      border-radius: 8px; font: inherit; font-weight: 500; font-size: 0.9rem;
      cursor: pointer; text-decoration: none; border: 1px solid transparent;
      transition: all 0.15s;
    }
    .btn-primary { background: var(--primary); color: #fff; }
    .btn-primary:hover { filter: brightness(1.1); }
    .btn-secondary { background: var(--card-bg); color: var(--text); border-color: var(--border); }
    .btn-secondary:hover { background: #f1f5f9; }
    .btn-accent { background: var(--accent); color: #fff; }
    .btn-accent:hover { filter: brightness(1.1); }

    /* ── Search ── */
    .search-bar {
      max-width: 840px; margin: 0 auto 2rem; padding: 0 1.5rem;
    }
    .search-input {
      width: 100%; padding: 0.75rem 1rem; border-radius: 8px;
      border: 1px solid var(--border); font: inherit; font-size: 1rem;
      background: var(--card-bg); transition: border-color 0.15s;
    }
    .search-input:focus { outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.15); }
    #search-results {
      margin-top: 0.5rem; background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 8px; min-height: 40px; padding: 0.75rem;
      display: none; font-size: 0.9rem; color: var(--muted);
    }

    /* ── Cards Grid ── */
    .section-title {
      max-width: 840px; margin: 2rem auto 1rem; padding: 0 1.5rem;
      font-size: 1.25rem; font-weight: 600;
    }
    .cards {
      max-width: 840px; margin: 0 auto 2rem; padding: 0 1.5rem;
      display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
      gap: 1rem;
    }
    .card {
      background: var(--card-bg); border: 1px solid var(--border);
      border-radius: 10px; padding: 1.25rem; transition: box-shadow 0.15s, transform 0.15s;
    }
    .card:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.08); transform: translateY(-1px); }
    .card h3 { font-size: 0.95rem; font-weight: 600; margin-bottom: 0.4rem; }
    .card p { font-size: 0.85rem; color: var(--muted); }
    .card .icon { font-size: 1.5rem; margin-bottom: 0.5rem; }

    /* ── Table ── */
    .data-table {
      max-width: 840px; margin: 0 auto 2rem; padding: 0 1.5rem;
    }
    .data-table table {
      width: 100%; border-collapse: collapse; background: var(--card-bg);
      border: 1px solid var(--border); border-radius: 8px; overflow: hidden;
    }
    .data-table th {
      text-align: left; padding: 0.6rem 1rem; background: #f8fafc;
      font-size: 0.8rem; text-transform: uppercase; letter-spacing: 0.05em; color: var(--muted);
      border-bottom: 1px solid var(--border);
    }
    .data-table td {
      padding: 0.6rem 1rem; font-size: 0.875rem; border-bottom: 1px solid var(--border);
    }
    .data-table tr:last-child td { border-bottom: none; }

    /* ── Form ── */
    .form-section {
      max-width: 840px; margin: 0 auto 2rem; padding: 0 1.5rem;
    }
    .form-group { margin-bottom: 1rem; }
    .form-group label { display: block; font-size: 0.85rem; font-weight: 500; margin-bottom: 0.25rem; }
    .form-group input, .form-group textarea {
      width: 100%; padding: 0.5rem 0.75rem; border: 1px solid var(--border);
      border-radius: 6px; font: inherit; font-size: 0.9rem;
    }
    .form-group input:focus, .form-group textarea:focus {
      outline: none; border-color: var(--primary); box-shadow: 0 0 0 3px rgba(59,130,246,0.15);
    }

    /* ── Banner (for LCL paint) ── */
    .animated-banner {
      max-width: 840px; margin: 0 auto 2rem; padding: 0 1.5rem;
    }
    .banner {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: #fff; padding: 1.5rem; border-radius: 10px; text-align: center;
      animation: pulse 2s ease-in-out infinite;
    }
    @keyframes pulse {
      0%, 100% { transform: scale(1); opacity: 1; }
      50% { transform: scale(1.02); opacity: 0.9; }
    }

    /* ── Footer ── */
    footer {
      max-width: 840px; margin: 3rem auto; padding: 0 1.5rem 2rem;
      text-align: center; color: var(--muted); font-size: 0.8rem;
      border-top: 1px solid var(--border); padding-top: 2rem;
    }

    /* ── Responsive breakpoints ── */
    @media (max-width: 1024px) {
      .cards { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .cards { grid-template-columns: 1fr; }
      .hero h1 { font-size: 1.6rem; }
      nav a { display: none; }
      .menu-btn { display: block; }
      .hero-btns { flex-direction: column; }
    }
    @media (max-width: 480px) {
      .hero h1 { font-size: 1.3rem; }
      .hero p { font-size: 0.95rem; }
    }

    /* ── Hover-only desktop ── */
    @media (hover: hover) {
      .card:hover { box-shadow: 0 6px 20px rgba(0,0,0,0.1); }
    }
  </style>
</head>
<body>
  <header>
    <span class="logo" data-testid="webrex-logo">🧪 Webrex Demo</span>
    <nav>
      <a data-testid="nav-home" href="#home">首页</a>
      <a data-testid="nav-docs" href="#docs">文档</a>
      <a data-testid="nav-api" href="#api">API</a>
      <a data-testid="nav-about" href="#about">关于</a>
    </nav>
    <button class="menu-btn" aria-label="菜单" data-testid="menu-button" onclick="alert('Menu clicked')">☰</button>
  </header>

  <section class="hero" data-testid="hero-section">
    <h1 data-testid="hero-title">Practice Chrome DevTools Here</h1>
    <p data-testid="hero-subtitle">
      A self-contained playground built for the Webrex curriculum.
      Inspect elements, check console logs, trace network requests, and debug JavaScript — all on one page.
    </p>
    <div class="hero-btns">
      <a class="btn btn-primary" href="#cards" data-testid="cta-primary" onclick="handleCTAClick()">Get Started</a>
      <button class="btn btn-secondary" data-testid="cta-secondary" onclick="handleSecondaryClick()">Learn More</button>
      <button class="btn btn-accent" data-testid="search-button" onclick="openSearch()">🔍 Search</button>
    </div>
  </section>

  <div class="search-bar" data-testid="search-section">
    <input class="search-input" id="search-input" type="text" placeholder="Search documentation... (try 'debug' or 'network')" data-testid="search-field" />
    <div id="search-results" data-testid="search-results-area"></div>
  </div>

  <h2 class="section-title" data-testid="features-title">📦 Feature Cards</h2>
  <div class="cards" id="cards" data-testid="cards-grid">
    <div class="card" data-testid="card-elements">
      <div class="icon">🧱</div>
      <h3>Elements Panel</h3>
      <p>Inspect and modify DOM nodes and CSS styles in real time. Try right-click → Inspect on this card.</p>
    </div>
    <div class="card" data-testid="card-console">
      <div class="icon">💬</div>
      <h3>Console Panel</h3>
      <p>View errors, warnings, and log output. Open Console to see the diagnostic messages this page generates.</p>
    </div>
    <div class="card" data-testid="card-sources">
      <div class="icon">📜</div>
      <h3>Sources Panel</h3>
      <p>Set breakpoints, step through code, and inspect call stacks. Try Cmd+O to search loaded JS files.</p>
    </div>
    <div class="card" data-testid="card-network">
      <div class="icon">🌐</div>
      <h3>Network Panel</h3>
      <p>Monitor all HTTP requests. This page fetches data from multiple API endpoints — check the Network tab.</p>
    </div>
    <div class="card" data-testid="card-application">
      <div class="icon">📦</div>
      <h3>Application Panel</h3>
      <p>Inspect Cookies, localStorage, sessionStorage, IndexedDB, and Service Workers.</p>
    </div>
    <div class="card" data-testid="card-performance">
      <div class="icon">⚡</div>
      <h3>Performance Panel</h3>
      <p>Record runtime performance traces. The animated banner below is intentionally CPU-heavy to give you something to profile.</p>
    </div>
  </div>

  <h2 class="section-title" data-testid="data-title">📊 Sample Data Table</h2>
  <div class="data-table" data-testid="data-table-section">
    <table>
      <thead>
        <tr><th>Name</th><th>Role</th><th>Status</th><th>Last Active</th></tr>
      </thead>
      <tbody>
        <tr data-testid="row-alice"><td>Alice</td><td>Frontend</td><td>🟢 Online</td><td>2 min ago</td></tr>
        <tr data-testid="row-bob"><td>Bob</td><td>Backend</td><td>🟡 Away</td><td>35 min ago</td></tr>
        <tr data-testid="row-carol"><td>Carol</td><td>QA</td><td>🔴 Offline</td><td>3 hr ago</td></tr>
        <tr data-testid="row-dave"><td>Dave</td><td>DevOps</td><td>🟢 Online</td><td>just now</td></tr>
        <tr data-testid="row-eve"><td>Eve</td><td>Design</td><td>🟢 Online</td><td>5 min ago</td></tr>
      </tbody>
    </table>
  </div>

  <h2 class="section-title" data-testid="form-title">📝 Contact Form</h2>
  <div class="form-section" data-testid="form-section">
    <div class="form-group">
      <label for="name">Name</label>
      <input id="name" type="text" placeholder="Your name" data-testid="input-name" />
    </div>
    <div class="form-group">
      <label for="email">Email</label>
      <input id="email" type="email" placeholder="you@example.com" data-testid="input-email" />
    </div>
    <div class="form-group">
      <label for="message">Message</label>
      <textarea id="message" rows="3" placeholder="Your message..." data-testid="input-message"></textarea>
    </div>
    <button class="btn btn-primary" data-testid="submit-button" onclick="handleSubmit()">Send Message</button>
  </div>

  <div class="animated-banner" data-testid="animated-banner">
    <div class="banner">
      <strong>🎬 Animated Banner</strong>
      <p style="margin-top:0.25rem;font-size:0.85rem;opacity:0.9">This element continuously repaints — open the Performance panel and record a trace to see it in the flame graph.</p>
    </div>
  </div>

  <footer data-testid="footer">
    <p>Webrex Demo Lab · Built for Chrome DevTools training · <span id="footer-year"></span></p>
  </footer>

  <!-- ═══════════════════════════════════════════════════════
       JavaScript: Multiple sections for Sources panel practice
       ═══════════════════════════════════════════════════════ -->

  <!-- block 1: utility functions (for Cmd+O / filename search) -->
  <script>
    // utils.js — Utility helpers
    // Try: Sources → Cmd+O → type "utils" to see this file
    window.__webrexUtils = {
      formatDate: function formatDate(date) {
        var d = new Date(date);
        return d.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
      },
      truncate: function truncate(str, maxLen) {
        if (!str) return '';
        return str.length > maxLen ? str.slice(0, maxLen) + '…' : str;
      },
      generateId: function generateId() {
        return 'id_' + Math.random().toString(36).slice(2, 10);
      }
    };
    console.info('[demo] Utils loaded — formatDate, truncate, generateId available');
  </script>

  <!-- block 2: component-like functions (for breakpoints / call stack practice) -->
  <script>
    // components.js — Component rendering helpers
    // Set a breakpoint on any line below and click "Search" to trigger
    window.__webrexComponents = {
      renderCard: function renderCard(cardData) {
        var container = document.createElement('div');
        container.className = 'card';
        var h3 = document.createElement('h3');
        h3.textContent = cardData.title;
        container.appendChild(h3);
        var p = document.createElement('p');
        p.textContent = cardData.description;
        container.appendChild(p);
        return container;
      },

      searchItems: function searchItems(query, items) {
        if (!query) return items;
        var q = query.toLowerCase();
        return items.filter(function(item) {
          return item.title.toLowerCase().indexOf(q) !== -1 ||
                 item.description.toLowerCase().indexOf(q) !== -1;
        });
      },

      handleUserAction: function handleUserAction(actionType, payload) {
        // Try setting a conditional breakpoint here: actionType === 'search'
        console.log('[demo] Action:', actionType, payload);
        if (actionType === 'search') {
          var results = window.__webrexComponents.searchItems(
            payload,
            window.__webrexData || []
          );
          window.__webrexComponents.displayResults(results);
        }
        if (actionType === 'submit') {
          alert('Form submitted: ' + JSON.stringify(payload));
        }
        return { success: true, actionType: actionType };
      },

      displayResults: function displayResults(results) {
        var el = document.getElementById('search-results');
        if (!el) return;
        if (results.length === 0) {
          el.style.display = 'block';
          el.textContent = 'No results found.';
          return;
        }
        el.style.display = 'block';
        el.innerHTML = results.map(function(r, i) {
          return '<div style="margin-bottom:0.5rem"><strong>' + (i+1) + '. ' + r.title + '</strong><br><span style="font-size:0.8rem;color:#64748b">' + r.description + '</span></div>';
        }).join('');
      }
    };
    console.info('[demo] Components loaded — renderCard, searchItems, handleUserAction available');
  </script>

  <!-- block 3: data layer -->
  <script>
    // data.js — Sample data store
    window.__webrexData = [
      { id: 1, title: 'How to Debug JavaScript', description: 'Learn breakpoints, watch expressions, and call stack navigation.' },
      { id: 2, title: 'Network Request Analysis', description: 'Understand HTTP headers, status codes, and waterfall timing.' },
      { id: 3, title: 'CSS Layout Debugging', description: 'Use the Elements panel to inspect and modify styles on the fly.' },
      { id: 4, title: 'Performance Profiling', description: 'Record runtime traces and analyze flame graphs to find bottlenecks.' },
      { id: 5, title: 'Storage & Cookies', description: 'Inspect localStorage, sessionStorage, IndexedDB, and cookies in Application panel.' },
      { id: 6, title: 'Responsive Design Testing', description: 'Use Device Toolbar to simulate mobile viewports and test breakpoints.' },
      { id: 7, title: 'Security Headers', description: 'Check CSP, CORS, and Mixed Content issues in the Console and Network panels.' }
    ];

    // IndexedDB setup
    (function initIndexedDB() {
      var request = indexedDB.open('webrex_demo_db', 1);
      request.onupgradeneeded = function(e) {
        var db = e.target.result;
        if (!db.objectStoreNames.contains('samples')) {
          var store = db.createObjectStore('samples', { keyPath: 'id', autoIncrement: true });
          store.createIndex('type', 'type', { unique: false });
        }
      };
      request.onsuccess = function(e) {
        var db = e.target.result;
        var tx = db.transaction('samples', 'readwrite');
        var store = tx.objectStore('samples');
        store.put({ id: 1, type: 'config', data: { theme: 'dark', fontSize: 14 } });
        store.put({ id: 2, type: 'log', data: { event: 'page_load', timestamp: Date.now() } });
        store.put({ id: 3, type: 'cache', data: { key: 'search_history', value: ['debug', 'network', 'css'] } });
        tx.oncomplete = function() {
          console.info('[demo] IndexedDB initialized — 3 records in webrex_demo_db.samples');
        };
      };
      request.onerror = function() {
        console.warn('[demo] IndexedDB not available (maybe in private browsing?)');
      };
    })();

    // Session + Local storage
    localStorage.setItem('webrex_prefs', JSON.stringify({ theme: 'auto', lang: 'zh-CN', fontSize: 14 }));
    sessionStorage.setItem('webrex_temp', JSON.stringify({ tabOpened: Date.now(), referrer: document.referrer || 'direct' }));
  </script>

  <!-- block 4: main app logic (triggers network requests on load) -->
  <script>
    // app.js — Main application bootstrap
    (function bootstrap() {
      console.info('[demo] App bootstrapping…');

      // Trigger network requests for Network panel practice
      fetch('/api/products')
        .then(function(r) { return r.json(); })
        .then(function(d) { console.log('[demo] Products loaded:', d.length, 'items'); })
        .catch(function(e) { console.error('[demo] Products fetch failed:', e.message); });

      fetch('/api/users')
        .then(function(r) { return r.json(); })
        .then(function(d) { console.log('[demo] Users loaded:', d.length, 'users'); })
        .catch(function(e) { console.error('[demo] Users fetch failed:', e.message); });

      fetch('/api/config')
        .then(function(r) { return r.json(); })
        .then(function(d) { console.log('[demo] Config loaded:', d); })
        .catch(function(e) { console.warn('[demo] Config fetch failed (expected?):', e.message); });

      fetch('/api/not-found')
        .then(function(r) { console.warn('[demo] 404 endpoint returned status:', r.status); })
        .catch(function(e) { console.warn('[demo] 404 fetch error:', e.message); });

      fetch('/api/slow')
        .then(function(r) { return r.json(); })
        .then(function(d) { console.log('[demo] Slow response received:', d); })
        .catch(function(e) { console.error('[demo] Slow fetch failed:', e.message); });

      // Set footer year
      var yearEl = document.getElementById('footer-year');
      if (yearEl) yearEl.textContent = new Date().getFullYear();

      // Register Service Worker
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(function(reg) { console.info('[demo] Service Worker registered:', reg.scope); })
          .catch(function(err) { console.warn('[demo] SW registration failed:', err.message); });
      }

      // Log some diagnostic data
      console.info('[demo] Page ready — open DevTools panels to explore');
      console.info('[demo] Try: $0 in Console after selecting an element in Elements');
      console.info('[demo] Try: copy(window.__webrexData) to copy the data array');
    })();

    // Global action handlers
    function handleCTAClick() {
      console.log('[demo] CTA primary clicked');
      window.__webrexComponents.handleUserAction('cta', { source: 'hero-primary' });
    }
    function handleSecondaryClick() {
      console.log('[demo] CTA secondary clicked');
      window.__webrexComponents.handleUserAction('cta', { source: 'hero-secondary' });
    }
    function handleSubmit() {
      var name = document.getElementById('name').value;
      var email = document.getElementById('email').value;
      var message = document.getElementById('message').value;
      console.log('[demo] Form submit:', { name: name, email: email, message: message });
      window.__webrexComponents.handleUserAction('submit', { name: name, email: email, message: message });
    }
    function openSearch() {
      var input = document.getElementById('search-input');
      input.focus();
      var query = input.value || 'debug';
      console.log('[demo] Search triggered with query:', query);
      window.__webrexComponents.handleUserAction('search', query);
    }

    // Search input: trigger on Enter
    document.getElementById('search-input').addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
        console.log('[demo] Search Enter pressed');
        window.__webrexComponents.handleUserAction('search', e.target.value);
      }
    });
  </script>
</body>
</html>`;

  // Server-side section visibility: add display:none to excluded sections
  if (allowed) {
    for (const [key, markers] of Object.entries(sections)) {
      if (allowed.has(key)) continue;
      for (const marker of markers) {
        html = html.replace(marker, marker.replace('">', '" style="display:none">'));
      }
    }
  }

  return c.html(html);
});

// ===========================================================================
// L1.1 — Source vs DOM
// ===========================================================================
app.get('/lessons/l1-1', (c) =>
  c.html(`<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L1.1 Source vs DOM</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      #app { padding: 1rem; border: 1px dashed #9ca3af; border-radius: 8px; min-height: 80px; }
      code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>Source vs DOM (Lab L1.1)</h1>
    <p>The block below starts <strong>empty in View Source</strong> — JavaScript fills it after load.</p>
    <p>Open Inspect to see how many DOM nodes appeared inside <code>#app</code>.</p>
    <div id="app"></div>
    <script>
      const app = document.getElementById('app');
      const items = ['Console', 'Network', 'Elements', 'Sources', 'Application', 'Performance', 'Application'];
      const list = document.createElement('ul');
      items.forEach((name, i) => {
        const li = document.createElement('li');
        li.textContent = (i + 1) + '. ' + name;
        list.appendChild(li);
      });
      const heading = document.createElement('h2');
      heading.textContent = 'JavaScript-rendered list:';
      app.appendChild(heading);
      app.appendChild(list);
      const note = document.createElement('p');
      note.innerHTML = '<em>None of this exists in View Source.</em>';
      app.appendChild(note);
    </script>
  </body>
</html>`),
);

app.get('/lessons/l1-1/check', (c) =>
  c.json({ ok: true, message: 'Lab is reachable; soft verify happens client-side.' }),
);

// ===========================================================================
// L4.5 — Network timing demo (formerly L1.2)
// ===========================================================================
app.get('/lessons/l4-5', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L4.5 Network Timing</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      .log { background: #f4f4f5; padding: 0.75rem 1rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; margin: 1rem 0; min-height: 80px; }
      button { font: inherit; padding: 0.5rem 1rem; cursor: pointer; }
    </style>
  </head>
  <body>
    <h1>L4.5 Lab · Network Timing 练习</h1>
    <p>先打开 DevTools → <strong>Network</strong> 面板，勾选 <strong>Disable cache</strong>，然后点击下方按钮触发慢请求。</p>
    <p>请求发起后，点列表中 <code>/api/slow</code> 这一行 → <strong>Timing</strong> 标签 → 看 5 段色块拆分。</p>
    <button id="trigger-btn" onclick="sendSlow()">🔁 发起慢请求</button>
    <button onclick="location.reload()" style="margin-left:8px">刷新页面</button>
    <div class="log" id="log">✅ 页面已就绪。先打开 Network 面板，再点「发起慢请求」按钮。</div>
    <script>
      const log = document.getElementById('log');
      window.sendSlow = function() {
        log.textContent = '⏳ 请求中… 查看 Network 面板的 /api/slow → Timing 标签';
        fetch('/api/slow')
          .then(r => r.json())
          .then(d => { log.textContent += '\\n✅ /api/slow 完成: ' + JSON.stringify(d); })
          .catch(e => { log.textContent += '\\n❌ /api/slow 失败: ' + e.message; });
      };
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L1.3 / L1.4 — 5 panels / shortcuts — reuse webrex-demo
// ===========================================================================

// ===========================================================================
// L2.1 — Console
// ===========================================================================
app.get('/lessons/l2-1', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L2.1 Console 红黄蓝</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      .legend { background: #fef3c7; padding: 0.5rem 1rem; border-radius: 6px; border: 1px solid #fde68a; }
    </style>
  </head>
  <body>
    <h1>L2.1 Lab · Console 红黄蓝</h1>
    <p>这个页面在加载时会向 Console 打印 <strong>5 条 Error / 3 条 Warning / 2 条 Info</strong>。</p>
    <div class="legend">打开 DevTools → Console 面板看实际输出。所有日志都以 <code>[lab]</code> 开头便于识别。</div>
    <script>
      console.error('[lab] AbortError: The fetch to api/users/me was aborted');
      console.error('[lab] TypeError: Cannot read properties of undefined (reading "email") at UserCard.tsx:42:18');
      console.error('[lab] Failed to load resource: net::ERR_CONNECTION_REFUSED at https://api.webrex.dev/v1/products');
      console.error('[lab] Uncaught (in promise) Error: Session expired — please re-login');
      console.error('[lab] ReferenceError: gtag is not defined');
      console.warn('[lab] Deprecation: Synchronous XHR is deprecated and will be removed');
      console.warn('[lab] Mixed Content: image at http://cdn.example.com/logo.png loaded over insecure connection');
      console.warn('[lab] React: Each child in a list should have a unique "key" prop');
      console.info('[lab] Service Worker registered with scope: /');
      console.info('[lab] App initialized in 234ms');
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L2.3 — $0 practice
// ===========================================================================
app.get('/lessons/l2-3', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L2.3 $0 练习</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      button { font: inherit; padding: 0.5rem 1rem; margin: 0.5rem; border-radius: 6px; cursor: pointer; border: 1px solid #d1d5db; }
      .card { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
      input { font: inherit; padding: 0.4rem 0.6rem; border: 1px solid #d1d5db; border-radius: 6px; width: 260px; }
    </style>
  </head>
  <body>
    <h1>L2.3 Lab · $0 练习</h1>
    <p>在 Elements 里点选任意元素，然后切到 Console，输入 <code>$0</code> 回车。</p>
    <p>试试：<code>$0.tagName</code> / <code>$0.textContent</code> / <code>$0.style.background = 'red'</code></p>

    <div class="card" data-testid="card-1">
      <h2>卡片 A</h2>
      <p>这是一个示例卡片。</p>
    </div>

    <button data-testid="btn-primary" onclick="alert('Primary clicked')" style="background:#3B82F6;color:#fff">主要按钮</button>
    <button data-testid="btn-secondary" onclick="alert('Secondary clicked')">次要按钮</button>
    <button data-testid="btn-danger" onclick="alert('Danger clicked')" style="background:#EF4444;color:#fff">危险按钮</button>

    <div style="margin-top:1rem">
      <input data-testid="input-demo" placeholder="输入一些文字…" />
    </div>
  </body>
</html>`),
);

// ===========================================================================
// L2.4 — localStorage with sensitive fields
// ===========================================================================
app.get('/lessons/l2-4', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L2.4 copy() + 脱敏</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      pre { background: #f4f4f5; padding: 0.75rem 1rem; border-radius: 6px; overflow-x: auto; }
      code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>L2.4 Lab · copy() + 脱敏练习</h1>
    <p>这个页面在加载时往 <code>localStorage</code> 写入了一个固定 key：<code>webrex.sample</code>。</p>
    <p>它的内容大致是：</p>
    <pre id="preview">loading…</pre>
    <p>到 Console 输入：</p>
    <pre><code>copy(JSON.parse(localStorage.getItem('webrex.sample')))</code></pre>
    <p>然后到 Webrex 顶栏点 <strong>🛡 Redact</strong> 粘贴进去看脱敏效果。</p>
    <script>
      const sample = {
        user: 'demo@webrex.dev',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEyMzQ1NjcsIm5hbWUiOiJEZW1vIiwiaWF0IjoxNzAwMDAwMDAwfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
        preferences: { theme: 'dark', lang: 'zh-CN' },
        internalUrl: 'https://internal.webrex.dev/admin/dashboard'
      };
      localStorage.setItem('webrex.sample', JSON.stringify(sample));
      document.getElementById('preview').textContent = JSON.stringify(sample, null, 2);
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L3.1 / L3.2 — Elements practice
// ===========================================================================
app.get('/lessons/l3-1', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L3.1 Elements 演示</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #f5f5f4;
        margin: 0;
        min-height: 100vh;
        color: #1f2937;
      }
      main { max-width: 720px; margin: 4rem auto; padding: 0 1.5rem; }
      h1 {
        font-size: 32px;
        font-weight: 600;
        color: #1F2937;
        margin: 0 0 0.75rem;
        letter-spacing: -0.02em;
      }
      p { color: #6b7280; margin: 0 0 2rem; }
      .row { display: flex; gap: 0.75rem; flex-wrap: wrap; }
      button {
        font: inherit;
        padding: 0.6rem 1.2rem;
        border-radius: 6px;
        cursor: pointer;
        border: 1px solid transparent;
      }
      [data-testid="primary-button"] { background: #3B82F6; color: white; }
      [data-testid="secondary-button"] { background: #e5e7eb; color: #1f2937; }
      [data-testid="tertiary-button"] { background: transparent; color: #3B82F6; border-color: #3B82F6; }
      footer { margin-top: 4rem; color: #9ca3af; font-size: 0.875rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>欢迎来到 Webrex</h1>
      <p>Webrex L3 demo · 这里的元素和样式会保持稳定，便于你练习</p>
      <div class="row">
        <button data-testid="primary-button" onclick="alert('Primary')">原型按钮 一</button>
        <button data-testid="secondary-button" onclick="alert('Secondary')">原型按钮 二</button>
        <button data-testid="tertiary-button" onclick="alert('Tertiary')">原型按钮 三</button>
      </div>
      <footer>由 Webrex 提供 · 仅用于练习</footer>
    </main>
  </body>
</html>`),
);

// ===========================================================================
// L3.3 — transparent overlay
// ===========================================================================
app.get('/lessons/l3-3', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L3.3 透明遮罩演示</title>
    <style>
      body {
        font-family: system-ui, sans-serif;
        background: #f5f5f4;
        margin: 0;
        min-height: 100vh;
        color: #1f2937;
      }
      main { max-width: 600px; margin: 4rem auto; padding: 0 1.5rem; }
      h1 { font-size: 28px; font-weight: 600; }
      p { color: #6b7280; }
      [data-testid="hidden-target"] {
        font: inherit;
        padding: 0.8rem 1.6rem;
        border: none;
        border-radius: 6px;
        background: #10B981;
        color: white;
        font-size: 1.1rem;
        cursor: pointer;
        margin-top: 1.5rem;
      }
      [data-testid="ghost-overlay"] {
        position: fixed;
        inset: 0;
        z-index: 9999;
        background: rgba(0, 0, 0, 0.001);
      }
      .hint { display: none; }
      [data-testid="ghost-overlay"][style*="visibility: hidden"] ~ .hint,
      [data-testid="ghost-overlay"][style*="visibility:hidden"] ~ .hint {
        display: block;
      }
      .label {
        position: fixed;
        bottom: 1rem;
        right: 1rem;
        background: #fef3c7;
        border: 1px solid #fde68a;
        padding: 0.5rem 0.75rem;
        font-size: 0.8rem;
        color: #92400e;
        border-radius: 6px;
        max-width: 260px;
        z-index: 10000;
      }
    </style>
  </head>
  <body>
    <main>
      <h1>L3.3 遮罩演示</h1>
      <p>页面上有一个 <strong>解锁按钮</strong>，但它现在点不动 —— 因为有一个透明 div 盖在整页之上。</p>
      <p>用 Elements 找到 <code>data-testid="ghost-overlay"</code> 的 div，按 <strong>H</strong> 隐藏它，按钮就解锁了。</p>
      <button data-testid="hidden-target" onclick="alert('按钮被点击了')">解锁按钮</button>
    </main>
    <div data-testid="ghost-overlay"></div>
    <div class="label">透明遮罩在 DOM 里：<br/>找 <code>data-testid="ghost-overlay"</code> 按 <strong>H</strong> 隐藏</div>
  </body>
</html>`),
);

// ===========================================================================
// L4.7 — CORS demonstration
// ===========================================================================
app.get('/lessons/l4-7', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L4.7 CORS 演示</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      .result { margin: 1rem 0; padding: 0.75rem 1rem; border-radius: 6px; font-family: monospace; white-space: pre-wrap; word-break: break-all; }
      .pending { background: #e5e7eb; color: #6b7280; }
      .success { background: #d1fae5; color: #065f46; }
      .error { background: #fee2e2; color: #991b1b; }
      code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>L4.7 Lab · CORS 演示</h1>
    <p>这个页面从 <code>localhost:8787</code> 向 <code>127.0.0.1:8787</code> 发两个请求——浏览器认为这是<strong>不同 origin</strong>，CORS 检查会被触发。</p>
    <p>打开 DevTools → <strong>Console</strong> 面板看结果：</p>
    <div id="blocked-result" class="result pending">⏳ 等待 fetch('http://127.0.0.1:8787/api/cors/blocked')…</div>
    <div id="allowed-result" class="result pending">⏳ 等待 fetch('http://127.0.0.1:8787/api/cors/allowed')…</div>
    <p><strong>提示</strong>：一条会报红（CORS 被拦），一条会正常返回 JSON。</p>
    <script>
      const blockedEl = document.getElementById('blocked-result');
      const allowedEl = document.getElementById('allowed-result');
      fetch('http://127.0.0.1:8787/api/cors/blocked')
        .then(r => r.json())
        .then(data => {
          blockedEl.className = 'result success';
          blockedEl.textContent = '✓ BLOCKED 端点意外成功：' + JSON.stringify(data, null, 2);
        })
        .catch(err => {
          blockedEl.className = 'result error';
          blockedEl.textContent = '✗ CORS 被拦截（预期行为）：' + err.message;
        });
      fetch('http://127.0.0.1:8787/api/cors/allowed')
        .then(r => r.json())
        .then(data => {
          allowedEl.className = 'result success';
          allowedEl.textContent = '✓ ALLOWED 端点成功：' + JSON.stringify(data, null, 2);
        })
        .catch(err => {
          allowedEl.className = 'result error';
          allowedEl.textContent = '✗ ALLOWED 端点意外失败：' + err.message;
        });
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L4.8 — HTTP caching demonstration
// ===========================================================================
app.get('/lessons/l4-8', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L4.8 缓存演示</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      h2 { font-size: 1.1rem; margin-top: 2rem; }
      table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
      th, td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; }
      th { background: #f3f4f6; }
      code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
      .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.9rem; }
    </style>
  </head>
  <body>
    <h1>L4.8 Lab · HTTP 缓存演示</h1>
    <p>这个页面引用了三个 JSON 资源，每个设置了不同的 <code>Cache-Control</code> 头。</p>
    <table>
      <tr><th>资源</th><th>Cache-Control</th><th>预期行为</th></tr>
      <tr><td><code>/api/cache/long.json</code></td><td><code>public, max-age=31536000, immutable</code></td><td>一年不过期，刷新后走 disk/memory cache</td></tr>
      <tr><td><code>/api/cache/short.json</code></td><td><code>public, max-age=10</code></td><td>10 秒过期，过了走 304 或 200</td></tr>
      <tr><td><code>/api/cache/none.json</code></td><td><code>no-store</code></td><td>每次都重新请求，永远 200</td></tr>
    </table>
    <div class="note">
      <strong>实验步骤</strong>：<br>
      1. 打开 DevTools → <strong>Network</strong> 面板<br>
      2. <strong>刷新一次</strong>让三个资源加载<br>
      3. <strong>再刷新一次</strong>，看三个资源的 <strong>Size</strong> 列各显示什么<br>
      4. 重点关注 <code>/api/cache/long.json</code> 第二次刷新时 Size 列的值
    </div>
    <h2>加载结果</h2>
    <div id="long-result">⏳ 加载中…</div>
    <div id="short-result">⏳ 加载中…</div>
    <div id="none-result">⏳ 加载中…</div>
    <script>
      fetch('/api/cache/long.json').then(r => r.json()).then(d => {
        document.getElementById('long-result').textContent = 'long.json: ' + JSON.stringify(d);
      });
      fetch('/api/cache/short.json').then(r => r.json()).then(d => {
        document.getElementById('short-result').textContent = 'short.json: ' + JSON.stringify(d);
      });
      fetch('/api/cache/none.json').then(r => r.json()).then(d => {
        document.getElementById('none-result').textContent = 'none.json: ' + JSON.stringify(d);
      });
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L10.1 — Mixed Content demo
// ===========================================================================
app.get('/lessons/l10-mixed', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L10.1 Mixed Content</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.9rem; margin: 1rem 0; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    img { max-width: 200px; border: 1px solid #d1d5db; border-radius: 6px; }
  </style>
</head>
<body>
  <h1>L10.1 Lab · Mixed Content 演示</h1>
  <p>这个页面通过 HTTPS 加载，但引用了一个 HTTP 图片资源。</p>
  <p>打开 DevTools → <strong>Console</strong>，看 Mixed Content 警告。</p>
  <p>点击地址栏左侧 <strong>tune 图标</strong>，查看连接安全详情。</p>
  <div class="note">
    <strong>注意</strong>：如果是本地开发（localhost），Mixed Content 警告可能不出现（localhost 被浏览器视为安全上下文）。<br>
    部署到 HTTPS 环境后，下面的图片会触发被动 Mixed Content 警告。
  </div>
  <p><strong>被动 Mixed Content 示例（图片）：</strong></p>
  <img src="http://httpbin.org/image/png" alt="Mixed content image (may not load)" onerror="this.alt='Image blocked or unavailable'" />
  <p style="color:#6b7280;font-size:0.85rem">如果图片没有加载出来，看 Console 里是否有 Mixed Content 警告。被动内容（image）会被警告但不会被完全 block。</p>
  <script>
    // This would be active mixed content — blocked
    console.info('[lab] Page loaded. Check Console for Mixed Content warnings.');
    // Try active mixed content in Console: this inline script is fine but
    // if an external HTTP script was loaded, it would be blocked.
    // Try: var s = document.createElement('script'); s.src = 'http://example.com/test.js'; document.head.appendChild(s);
  </script>
</body>
</html>`),
);

// ===========================================================================
// L10.2 — CSP strict
// ===========================================================================
app.get('/lessons/l10-csp', (c) => {
  c.res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'",
  );
  return c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L10.2 CSP Strict</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    .result { padding: 0.75rem; border-radius: 6px; margin: 1rem 0; }
    .ok { background: #d1fae5; color: #065f46; }
    .err { background: #fee2e2; color: #991b1b; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>L10.2 Lab · CSP Strict</h1>
  <p>这个页面设置了严格的 CSP：<code>script-src 'self'</code>，禁止内联脚本。</p>
  <p>打开 DevTools → <strong>Console</strong>，看红色 CSP 报错。</p>
  <p>也看一下 Network → 主文档 → <strong>Response Headers</strong> 里的 <code>Content-Security-Policy</code>。</p>
  <div id="result" class="result">等待测试…</div>
  <script src="data:text/javascript,console.error('this external script was allowed by CSP')"></script>
  <script>
    document.getElementById('result').textContent = '如果看到这段文字，说明 CSP 没有生效。';
    document.getElementById('result').className = 'result err';
  </script>
  <p style="color:#6b7280;font-size:0.85rem">页面加载了外部脚本（应成功），但内联脚本被 CSP 阻止（见 Console 报错）。</p>
</body>
</html>`);
});

app.get('/lessons/l10-csp-lax', (c) => {
  c.res.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'",
  );
  return c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L10.2 CSP Lax</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    .result { padding: 0.75rem; border-radius: 6px; margin: 1rem 0; }
    .ok { background: #d1fae5; color: #065f46; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>L10.2 Lab · CSP Lax</h1>
  <p>这个页面设置了宽松 CSP：<code>script-src 'self' 'unsafe-inline'</code>，允许内联脚本。</p>
  <div class="result ok" id="result">等待测试…</div>
  <script>
    document.getElementById('result').textContent = '内联脚本执行成功——CSP 允许 unsafe-inline。';
  </script>
</body>
</html>`);
});

// ===========================================================================
// L10.3 — Third-party Cookie demo
// ===========================================================================
app.get('/lessons/l10-cookie', (c) => {
  c.res.headers.set('Set-Cookie', 'webrex_session=demo123; Path=/; SameSite=Lax; HttpOnly');
  return c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L10.3 Cookie 演示</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }
    th { background: #f3f4f6; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    iframe { width: 100%; height: 80px; border: 1px dashed #9ca3af; border-radius: 6px; margin: 1rem 0; }
  </style>
</head>
<body>
  <h1>L10.3 Lab · Cookie 演示</h1>
  <p>这个页面设置了一个 Cookie：<code>webrex_session=demo123; SameSite=Lax; HttpOnly</code>。</p>
  <p>打开 DevTools → <strong>Application</strong> → Cookies → <code>localhost</code> 查看。</p>
  <table>
    <tr><th>字段</th><th>值</th><th>含义</th></tr>
    <tr><td>Name</td><td><code>webrex_session</code></td><td>Cookie 名</td></tr>
    <tr><td>Value</td><td><code>demo123</code></td><td>会话标识</td></tr>
    <tr><td>HttpOnly</td><td>✓</td><td>JS 无法读取（<code>document.cookie</code> 里看不到）</td></tr>
    <tr><td>SameSite</td><td>Lax</td><td>跨站 GET 导航会带上，POST/iframe 不带</td></tr>
  </table>
  <p>试试在 Console 输入 <code>document.cookie</code> —— HttpOnly Cookie 不会出现。</p>
  <p>下面是一个跨域 iframe（加载 lab 自身子页面），查看它的 Cookie 状态：</p>
  <iframe src="/lessons/l10-csp-lax"></iframe>
</body>
</html>`);
});

// ===========================================================================
// L10.4 — XSS demo
// ===========================================================================
app.get('/lessons/l10-xss', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L10.4 XSS 演示</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.1rem; margin-top: 2rem; }
    .demo-box { border: 1px solid #d1d5db; border-radius: 6px; padding: 1rem; margin: 1rem 0; }
    .safe { background: #d1fae5; }
    .unsafe { background: #fee2e2; }
    input { font: inherit; padding: 0.4rem 0.6rem; width: 280px; margin-right: 0.5rem; }
    button { font: inherit; padding: 0.4rem 0.8rem; }
    .output { margin-top: 0.75rem; padding: 0.5rem; background: white; border-radius: 4px; min-height: 24px; border: 1px solid #e5e7eb; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>L10.4 Lab · XSS 演示</h1>
  <p>两个输入框，一个用 <code>textContent</code>（安全），一个用 <code>innerHTML</code>（危险）。</p>
  <div class="demo-box safe">
    <h2>安全的输出（textContent）</h2>
    <input id="safe-input" placeholder="输入任意内容..." />
    <button onclick="safeOut()">输出</button>
    <div class="output" id="safe-output"></div>
  </div>
  <div class="demo-box unsafe">
    <h2>危险的输出（innerHTML）</h2>
    <input id="unsafe-input" placeholder='输入任意内容，试试 &lt;img src=x onerror=alert(1)&gt;' />
    <button onclick="unsafeOut()">输出</button>
    <div class="output" id="unsafe-output"></div>
  </div>
  <p style="color:#6b7280;font-size:0.85rem">试试在「危险的输出」框里输入 <code>&lt;img src=x onerror=alert('XSS')&gt;</code> 看会不会弹窗。</p>
  <script>
    function safeOut() {
      document.getElementById('safe-output').textContent = document.getElementById('safe-input').value;
    }
    function unsafeOut() {
      document.getElementById('unsafe-output').innerHTML = document.getElementById('unsafe-input').value;
      fetch('/lessons/l10-xss/verify', { method: 'POST' });
    }
  </script>
</body>
</html>`),
);

// ===========================================================================
// L12.1 — SPA routing demo
// ===========================================================================
app.get('/lessons/l12-spa', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L12.1 SPA 路由演示</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 0; background: #f5f5f4; color: #1f2937; }
    header { background: #1f2937; color: white; padding: 1rem 2rem; }
    nav a { color: #93c5fd; margin-right: 1.5rem; text-decoration: none; cursor: pointer; }
    nav a:hover { text-decoration: underline; }
    main { max-width: 720px; margin: 2rem auto; padding: 0 1.5rem; }
    h1 { font-size: 1.5rem; }
    .card { background: white; border-radius: 8px; padding: 1.5rem; box-shadow: 0 1px 3px rgba(0,0,0,0.1); margin: 1rem 0; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; font-size: 0.9rem; }
  </style>
</head>
<body>
  <header>
    <nav>
      <a onclick="navigate('/lessons/l12-spa')">首页</a>
      <a onclick="navigate('/lessons/l12-spa/about')">关于</a>
      <a onclick="navigate('/lessons/l12-spa')" data-show="contact">联系我们</a>
    </nav>
  </header>
  <main id="app">
    <h1>首页</h1>
    <div class="card"><p>这是一个 SPA 路由演示页面。点击顶部导航链接——URL 变了但页面没有发起新的 document 请求。</p></div>
    <div class="note">打开 DevTools → <strong>Network</strong> 面板，然后点顶部导航。观察：Network 面板里没有新的 HTML 文档请求——这就是 SPA（单页应用）的核心特征。</div>
  </main>
  <script>
    const routes = {
      '/lessons/l12-spa': '<h1>首页</h1><div class="card"><p>这是首页。SPA 路由通过 JavaScript 拦截链接点击，用 History API 更新 URL，同时替换页面内容——全程不发网络请求。</p></div><div class="note">按 <code>⌘+R</code> / <code>F5</code> 刷新：页面正常加载。这是因为 lab 服务器对 /lessons/l12-spa 返回了完整 HTML（服务器端也处理了这个路由）。如果没有服务端 fallback，刷新会 404。</div>',
      '/lessons/l12-spa/about': '<h1>关于</h1><div class="card"><p>关于页面。URL 变成了 <code>/lessons/l12-spa/about</code>，但浏览器没有向服务器请求新页面——内容由 JavaScript 直接替换。这就是 <strong>History API</strong> 的 pushState 在起作用。</p></div>',
    };
    function navigate(path) {
      history.pushState({}, '', path);
      document.getElementById('app').innerHTML = routes[path] || '<h1>404</h1><p>页面未找到。</p>';
      fetch('/lessons/l12-spa/track', { method: 'POST', body: path }).catch(function(){});
    }
    window.onpopstate = () => {
      document.getElementById('app').innerHTML = routes[location.pathname] || '<h1>404</h1><p>页面未找到。</p>';
    };
  </script>
</body>
</html>`),
);

app.get('/lessons/l12-spa/about', (c) =>
  c.html(
    '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"/><title>About</title></head><body><h1>About (server fallback)</h1><p>这个页面由服务器直接返回，证明服务器端配置了 SPA fallback。</p></body></html>',
  ),
);

// ===========================================================================
// L12.2 — SSR vs CSR demo
// ===========================================================================
app.get('/lessons/l12-ssr', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L12.2 SSR/CSR</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    .section { border: 1px solid #e5e7eb; border-radius: 8px; padding: 1rem; margin: 1rem 0; }
    .ssr { background: #d1fae5; }
    .csr { background: #fef3c7; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
  </style>
</head>
<body>
  <h1>L12.2 Lab · SSR vs CSR</h1>
  <div class="section ssr">
    <h2>服务端渲染区域（SSR）</h2>
    <p>下面的内容在 <strong>View Source</strong> 中就能看到——它是服务端直接输出的 HTML。</p>
    <p>当前服务器时间：<span id="ssr-time">2026-05-09T12:00:00.000Z</span></p>
    <p>👆 查看页面源代码（右键 → View Page Source），搜索 "2026-05-09"——可以看到这个时间戳在 HTML 源码里。</p>
  </div>
  <div class="section csr">
    <h2>客户端渲染区域（CSR）</h2>
    <p>下面的内容在 <strong>View Source</strong> 中看不到——它是 JavaScript 在浏览器里渲染出来的。</p>
    <div id="csr-container">⏳ 等待 JS 渲染…</div>
    <p>👆 查看页面源代码，搜索 "JS-rendered"——源码里没有这段文字，它是浏览器跑 JS 之后才出现的。</p>
  </div>
  <div class="section">
    <h2>水合错误演示（Hydration Mismatch）</h2>
    <p>服务端和客户端渲染了不同的内容——打开 Console 看看有没有报错。</p>
    <div id="hydrate-demo">服务端渲染的内容</div>
  </div>
  <script>
    // CSR — client renders this
    document.getElementById('csr-container').innerHTML = '<strong>JS-rendered content:</strong> This text was rendered by JavaScript on the client. You won\'t find it in View Source.';
    // Simulate hydration mismatch
    document.getElementById('hydrate-demo').textContent = '客户端渲染的内容（和服务端不一致！）';
    if (document.getElementById('hydrate-demo').textContent !== '服务端渲染的内容') {
      console.warn('[lab] Hydration mismatch detected: server and client rendered different content');
    }
  </script>
</body>
</html>`),
);

// ===========================================================================
// L12.3 — Build hash demo
// ===========================================================================
app.get('/lessons/l12-hash', (c) => {
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L12.3 构建产物 Hash</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.9rem; margin: 1rem 0; }
    code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    table { border-collapse: collapse; width: 100%; margin: 1rem 0; }
    th, td { border: 1px solid #d1d5db; padding: 0.5rem 0.75rem; text-align: left; font-size: 0.9rem; }
    th { background: #f3f4f6; }
  </style>
</head>
<body>
  <h1>L12.3 Lab · 构建产物 Hash 与缓存</h1>
  <p>这个页面引用的 JavaScript 文件名中包含内容哈希（content hash）。</p>
  <div class="note">打开 DevTools → <strong>Network</strong> 面板，刷新页面。观察 JS 文件名的 hash 部分。<br>然后检查 <strong>Response Headers</strong> 里的 <code>Cache-Control</code>。</div>
  <table>
    <tr><th>策略</th><th>文件</th><th>缓存头</th><th>缓存多久</th></tr>
    <tr><td>内容哈希 + 长缓存</td><td>所有带 hash 的 JS/CSS</td><td><code>max-age=31536000, immutable</code></td><td>1 年（因为内容变了 hash 就变，URL 不同了）</td></tr>
    <tr><td>不缓存入口 HTML</td><td>index.html / 主页面</td><td><code>no-cache</code></td><td>每次都验证（确保用户拿到最新 hash 引用）</td></tr>
  </table>
  <p id="output">⏳ 加载资源…</p>
  <!-- These files have hash in URL — the hash changes when content changes -->
  <script src="/js/utils.a3f8b2.js" data-testid="hashed-js"></script>
  <script>
    document.getElementById('output').textContent = 'JS 文件已加载。观察 Network 面板：文件名中有 hash (a3f8b2)，Cache-Control 设为 immutable。';
  </script>
</body>
</html>`);
});

// ===========================================================================
// L13.1 — HAR demo page
// ===========================================================================
app.get('/lessons/l13-har', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · L13 HAR 请求集合</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      .log { background: #f4f4f5; padding: 0.75rem 1rem; border-radius: 6px; margin: 0.5rem 0; font-family: monospace; font-size: 0.85rem; min-height: 120px; }
      .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.9rem; }
      code { background: #f4f4f5; padding: 1px 4px; border-radius: 3px; }
    </style>
  </head>
  <body>
    <h1>L13 Lab · HAR 请求集合</h1>
    <p>这个页面在加载后会自动发出 6 种不同类型的请求，方便你练习导出 HAR 文件。</p>
    <p>打开 DevTools → <strong>Network</strong> 面板，等请求完成后右键任意请求 → <strong>Save all as HAR with content</strong>。</p>
    <div class="note">HAR 文件是一个 JSON，包含这次页面会话里所有请求的 URL、Headers、Body、Response。可以导入回 Network 面板复现，也可以喂给 AI 分析。</div>
    <div class="log" id="log">⏳ 发起请求中…</div>
    <script>
      const log = document.getElementById('log');
      const lines = [];
      async function addLine(text) {
        lines.push(text);
        log.textContent = lines.join('\\n');
      }
      fetch('/api/echo?msg=hello').then(r=>r.json()).then(d=>addLine('GET /api/echo: ' + JSON.stringify(d))).catch(e=>addLine('GET fail: ' + e.message));
      fetch('/api/echo', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'save',payload:'test'}) }).then(r=>r.json()).then(d=>addLine('POST /api/echo: ' + JSON.stringify(d))).catch(e=>addLine('POST fail: ' + e.message));
      fetch('/api/echo-graphql', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({query:'{ user(id:1) { name email } }'}) }).then(r=>r.json()).then(d=>addLine('POST /api/echo-graphql: ' + JSON.stringify(d))).catch(e=>addLine('GraphQL fail: ' + e.message));
      fetch('/api/not-found').then(r=>addLine('GET /api/not-found: ' + r.status + ' ' + r.statusText)).catch(e=>addLine('404 fail: ' + e.message));
      fetch('/api/echo?fail=1').then(r=>r.json()).then(d=>addLine('GET /api/echo?fail=1: ' + JSON.stringify(d))).catch(e=>addLine('500 fail: ' + e.message));
      fetch('/api/echo?slow=1').then(r=>r.json()).then(d=>addLine('GET /api/echo?slow=1: ' + JSON.stringify(d))).catch(e=>addLine('slow fail: ' + e.message));
    </script>
  </body>
</html>`),
);

// ===========================================================================
// L13.2 — REST / GraphQL / WS / SSE demo
// ===========================================================================
app.get('/lessons/l13-protocols', (c) =>
  c.html(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8" />
  <title>Webrex Lab · L13.2 接口协议演示</title>
  <style>
    body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
    h1 { font-size: 1.5rem; }
    h2 { font-size: 1.1rem; margin-top: 1.5rem; }
    .log { background: #f4f4f5; padding: 0.75rem 1rem; border-radius: 6px; font-family: monospace; font-size: 0.85rem; min-height: 60px; margin: 0.5rem 0; }
    button { font: inherit; padding: 0.4rem 0.8rem; margin: 0.25rem; cursor: pointer; border-radius: 6px; border: 1px solid #d1d5db; background: #fff; }
    button:hover { background: #f1f5f9; }
    .status { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 4px; }
    .connected { background: #10b981; }
    .disconnected { background: #ef4444; }
    .note { background: #fef3c7; padding: 0.75rem 1rem; border-radius: 6px; border: 1px solid #fde68a; font-size: 0.9rem; }
  </style>
</head>
<body>
  <h1>L13.2 Lab · 接口协议演示</h1>
  <div class="note">打开 DevTools → <strong>Network</strong> 面板。分别用过滤器按钮（Fetch/XHR、WS、EventStream）看不同协议的请求。</div>

  <h2>REST API (Fetch/XHR)</h2>
  <button onclick="testREST()">GET /api/products</button>
  <button onclick="testGraphQL()">POST /api/echo-graphql</button>
  <div class="log" id="rest-log">点击按钮发送 REST 请求…</div>

  <h2>Server-Sent Events (SSE / EventStream)</h2>
  <button onclick="testSSE()">连接 SSE</button>
  <div class="log" id="sse-log">未连接</div>

  <h2>WebSocket (WS)</h2>
  <p>状态：<span class="status disconnected" id="ws-dot"></span><span id="ws-text">未连接</span></p>
  <button onclick="testWS()">连接 WebSocket</button>
  <input id="ws-input" placeholder="输入消息…" style="font:inherit;padding:0.4rem 0.6rem;width:200px;margin:0 0.25rem" />
  <button onclick="sendWS()">发送</button>
  <div class="log" id="ws-log">未连接</div>

  <script>
    // REST
    function testREST() {
      const log = document.getElementById('rest-log');
      log.textContent = '⏳ 请求中…';
      fetch('/api/products')
        .then(r => r.json())
        .then(d => { log.textContent = '✓ REST 响应：' + JSON.stringify(d, null, 2); })
        .catch(e => { log.textContent = '✗ REST 失败：' + e.message; });
    }

    // GraphQL
    function testGraphQL() {
      const log = document.getElementById('rest-log');
      log.textContent = '⏳ GraphQL 请求中…';
      fetch('/api/echo-graphql', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({query: '{ products { id name price } }'})
      })
        .then(r => r.json())
        .then(d => { log.textContent = '✓ GraphQL 响应：' + JSON.stringify(d, null, 2); })
        .catch(e => { log.textContent = '✗ GraphQL 失败：' + e.message; });
    }

    // SSE
    let sseSource = null;
    function testSSE() {
      const log = document.getElementById('sse-log');
      if (sseSource) { sseSource.close(); sseSource = null; }
      log.textContent = '⏳ 连接 SSE…';
      sseSource = new EventSource('/api/sse');
      sseSource.onmessage = (e) => { log.textContent += '\\n↓ SSE: ' + e.data; };
      sseSource.addEventListener('done', (e) => {
        log.textContent += '\\n✓ SSE stream complete';
        sseSource.close();
        sseSource = null;
      });
      sseSource.onerror = () => {
        if (sseSource && sseSource.readyState === EventSource.CLOSED) {
          log.textContent += '\\nSSE 连接关闭';
        }
      };
    }

    // WebSocket
    let ws = null;
    function testWS() {
      const log = document.getElementById('ws-log');
      const dot = document.getElementById('ws-dot');
      const text = document.getElementById('ws-text');
      if (ws) { ws.close(); }

      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      ws = new WebSocket(proto + '://' + location.host + '/api/ws');
      log.textContent = '⏳ 连接 WebSocket…';

      ws.onopen = () => {
        dot.className = 'status connected';
        text.textContent = '已连接';
        log.textContent = '✓ WebSocket 已连接。打开 Network → WS 筛选 → Messages 面板查看帧。';
      };
      ws.onmessage = (e) => { log.textContent += '\\n↓ 收到: ' + e.data; };
      ws.onclose = () => {
        dot.className = 'status disconnected';
        text.textContent = '已断开';
        log.textContent += '\\nWebSocket 已断开';
      };
    }

    function sendWS() {
      const input = document.getElementById('ws-input');
      const msg = input.value || 'ping';
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(msg);
        document.getElementById('ws-log').textContent += '\\n↑ 发送: ' + msg;
      }
      input.value = '';
    }

    document.getElementById('ws-input').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendWS();
    });
  </script>
</body>
</html>`),
);

// ===========================================================================
// Static JS files for Sources panel practice
// ===========================================================================
app.get('/js/utils.a3f8b2.js', (c) => {
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  c.res.headers.set('Content-Type', 'application/javascript; charset=utf-8');
  return c.body(`/* utils.js — Utility functions for Sources panel practice */
(function() {
  'use strict';

  /**
   * Format a date string into locale format.
   * Set a breakpoint here and call formatDate from Console to trigger it.
   */
  function formatDate(dateStr) {
    var d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Invalid Date';
    return d.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Truncate a string to maxLen chars.
   * Set a conditional breakpoint: str.length > 100
   */
  function truncate(str, maxLen) {
    if (!str) return '';
    if (str.length <= maxLen) return str;
    return str.slice(0, maxLen) + '…';
  }

  /**
   * Generate a random ID.
   * Try: Logpoint here — right-click line number → "Add logpoint" → enter message
   */
  function generateId(prefix) {
    prefix = prefix || 'id';
    var randomPart = Math.random().toString(36).substring(2, 10);
    var id = prefix + '_' + randomPart;
    // Try adding a Logpoint here: "Generated ID: " + id
    return id;
  }

  /**
   * Deep clone an object (simple version).
   * Good for call stack practice — call this from deepNestedFunc
   */
  function deepClone(obj) {
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    var cloned = {};
    for (var key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  /**
   * Nested function call chain — set breakpoint anywhere to see Call Stack
   */
  function deepNestedFunc(level, data) {
    if (level <= 0) {
      return deepClone(data);
    }
    // Set a breakpoint here and observe the Call Stack panel
    // Each level adds a frame to the stack
    var modified = Object.assign({}, data, { level: level });
    return deepNestedFunc(level - 1, modified);
  }

  /**
   * Event handler — set breakpoint and click Search on the demo page
   */
  function handleSearchClick(event) {
    // Breakpoint here: watch the 'event' parameter
    var target = event.target;
    var tagName = target.tagName;
    console.log('[utils] Search clicked on:', tagName, target.textContent);
    return { tagName: tagName, text: target.textContent };
  }

  // Expose to global scope for Console access
  window.Utils = {
    formatDate: formatDate,
    truncate: truncate,
    generateId: generateId,
    deepClone: deepClone,
    deepNestedFunc: deepNestedFunc,
    handleSearchClick: handleSearchClick
  };

  console.log('[utils.js] Utilities loaded. Try in Console:');
  console.log('  Utils.formatDate("2026-05-09")');
  console.log('  Utils.truncate("Hello World", 5)');
  console.log('  Utils.generateId("user")');
  console.log('  Utils.deepNestedFunc(5, { name: "test" })');
})();
`);
});

app.get('/js/app.min.js', (c) => {
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  c.res.headers.set('Content-Type', 'application/javascript; charset=utf-8');
  // Intentionally minified for Pretty Print practice
  return c.body(`!function(){"use strict";function e(e){return new Date(e).toLocaleDateString("zh-CN",{year:"numeric",month:"long",day:"numeric"})}function t(e,t){return e&&e.length>t?e.slice(0,t)+"…":e||""}function n(e){e=e||"id";return e+"_"+Math.random().toString(36).substring(2,10)}function r(e){if(null===e||"object"!=typeof e)return e;if(Array.isArray(e))return e.map(r);var t={};for(var n in e)e.hasOwnProperty(n)&&(t[n]=r(e[n]));return t}function o(e,t){if(e<=0)return r(t);var n=Object.assign({},t,{level:e});return o(e-1,n)}window.MiniApp={formatDate:e,truncate:t,generateId:n,deepClone:r,deepNestedFunc:o},console.log("[miniapp] Minified utilities loaded. Click the {} button in Sources to pretty-print this file.")}();
//# sourceMappingURL=app.min.js.map`);
});

// Source map for app.min.js
app.get('/js/app.min.js.map', (c) => {
  c.res.headers.set('Content-Type', 'application/json');
  return c.body(
    JSON.stringify({
      version: 3,
      file: 'app.min.js',
      sourceRoot: '',
      sources: ['app.js'],
      sourcesContent: [
        'function formatDate(d){return new Date(d).toLocaleDateString("zh-CN")}function truncate(s,n){return s&&s.length>n?s.slice(0,n)+"…":s||""}function generateId(p){p=p||"id";return p+"_"+Math.random().toString(36).substring(2,10)}function deepClone(o){if(null===o||"object"!=typeof o)return o;if(Array.isArray(o))return o.map(deepClone);var c={};for(var k in o)o.hasOwnProperty(k)&&(c[k]=deepClone(o[k]));return c}function deepNestedFunc(l,d){if(l<=0)return deepClone(d);return deepNestedFunc(l-1,Object.assign({},d,{level:l}))}window.MiniApp={formatDate:formatDate,truncate:truncate,generateId:generateId,deepClone:deepClone,deepNestedFunc:deepNestedFunc};',
      ],
      names: [],
      mappings: 'AAAA',
    }),
  );
});

// ===========================================================================
// Service Worker for SW demos (L6.4)
// ===========================================================================
app.get('/sw.js', (c) => {
  c.res.headers.set('Content-Type', 'application/javascript; charset=utf-8');
  c.res.headers.set('Service-Worker-Allowed', '/');
  return c.body(`/* Webrex Demo Service Worker */
const CACHE_NAME = 'webrex-demo-v1';
const ASSETS = [
  '/lessons/webrex-demo',
  '/js/utils.a3f8b2.js'
];

self.addEventListener('install', (event) => {
  console.log('[SW] Installing…');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching assets:', ASSETS);
      return cache.addAll(ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  console.log('[SW] Activated');
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    })
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      return cached || fetch(event.request);
    })
  );
});

console.log('[SW] Service Worker script loaded');
`);
});

export default app;
