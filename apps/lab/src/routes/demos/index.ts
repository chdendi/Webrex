import { Hono } from 'hono';

const app = new Hono();

const page = (title: string, body: string) => `<!doctype html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} — Webrex</title>
<style>*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}body{font-family:system-ui,-apple-system,sans-serif;background:#f8fafc;color:#1e293b;line-height:1.5;padding:24px}</style>
</head>
<body>${body}<script>parent.postMessage({webrexDemoHeight:document.documentElement.scrollHeight},'*')</script></body>
</html>`;

// ── L1 ─────────────────────────────────────
app.get('/demos/l1-1', (c) =>
  c.html(
    page(
      'Webrex · HTML/CSS/JS',
      `
<h1 data-testid="hero-title" style="font-size:24px;font-weight:700;letter-spacing:-0.02em;margin-bottom:8px">Practice Chrome DevTools Here</h1>
<p data-testid="hero-subtitle" style="color:#64748b;font-size:14px;margin-bottom:16px">A self-contained playground for learning DevTools.</p>
<button data-testid="search-button" onclick="alert('🔍 Search')" style="padding:8px 20px;border-radius:8px;font:inherit;font-weight:500;font-size:14px;cursor:pointer;background:#f59e0b;color:#fff;border:none">🔍 Search</button>
`,
    ),
  ),
);

app.get('/demos/l4-5', (c) =>
  c.html(
    page(
      'Webrex · Network Timing',
      `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Network Timing Demo</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:8px">This page sends a slow request when you click the button. Open Network panel first.</p>
<button id="trigger-btn" style="padding:8px 16px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer;margin-bottom:12px">Send Slow Request</button>
<div id="s" style="padding:12px;background:#e5e7eb;border-radius:8px;font-size:13px">Waiting for request…</div>
<script>
document.getElementById('trigger-btn').onclick=function(){
  document.getElementById('s').textContent='Loading slow request…';
  fetch('/api/slow').then(r=>r.json()).then(d=>{document.getElementById('s').textContent='Done: '+JSON.stringify(d)});
};
</script>
`,
    ),
  ),
);

app.get('/demos/l1-3', (c) => {
  c.res.headers.set('Set-Cookie', 'webrex_demo=panel_test; Path=/; SameSite=Lax');
  return c.html(
    page(
      'Webrex · 5 Panels',
      `
<h1 style="font-size:22px;font-weight:700;margin-bottom:8px">5 Panel Explorer</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:12px">Open each DevTools panel and find one number.</p>
<ul style="margin-bottom:12px;padding-left:20px;font-size:13px;color:#1e293b">
<li><strong>Elements</strong>: &lt;body&gt; direct children count</li>
<li><strong>Console</strong>: errors/warnings count</li>
<li><strong>Sources</strong>: .js files under this domain</li>
<li><strong>Network</strong>: total requests after refresh</li>
<li><strong>Application</strong>: cookie rows count</li>
</ul>
<div id="s" style="padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">Ready — open DevTools!</div>
<script>console.warn('[demo] Sample warning for Console practice');fetch('/api/products').then(r=>r.json());fetch('/api/users').then(r=>r.json());</script>
`,
    ),
  );
});

app.get('/demos/l1-4', (c) =>
  c.html(
    page(
      'Webrex · Shortcuts',
      `
<h1 style="font-size:22px;font-weight:700;margin-bottom:12px">Shortcut Practice</h1>
<table style="width:100%;border-collapse:collapse;font-size:13px">
<tr style="border-bottom:1px solid #e2e8f0"><th style="text-align:left;padding:8px;color:#64748b">Scenario</th><th style="text-align:left;padding:8px;color:#64748b">Mac</th><th style="text-align:left;padding:8px;color:#64748b">Win</th><th style="text-align:left;padding:8px;color:#64748b">Opens</th></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px">See errors</td><td style="padding:8px"><code>⌘+⌥+J</code></td><td style="padding:8px"><code>Ctrl+Shift+J</code></td><td style="padding:8px">Console</td></tr>
<tr style="border-bottom:1px solid #e2e8f0"><td style="padding:8px">Inspect</td><td style="padding:8px"><code>⌘+⇧+C</code></td><td style="padding:8px"><code>Ctrl+Shift+C</code></td><td style="padding:8px">Elements</td></tr>
<tr><td style="padding:8px">Mobile</td><td style="padding:8px"><code>⌘+⇧+M</code></td><td style="padding:8px"><code>Ctrl+Shift+M</code></td><td style="padding:8px">Device Toolbar</td></tr>
</table>
<p style="color:#64748b;font-size:13px;margin-top:14px">Press each shortcut now. Device Toolbar → iPhone SE = 375×667.</p>
`,
    ),
  ),
);

// ── L2 — Elements ─────────────────────────
const l2Demo = ({ withOverlay = false }: { withOverlay?: boolean } = {}) =>
  page(
    'Webrex · Elements',
    `
<h1 data-testid="main-heading" style="font-size:28px;font-weight:700;color:#1F2937;margin-bottom:6px">Elements Practice Page</h1>
<p data-testid="subtitle" style="color:#6b7280;font-size:14px;margin-bottom:20px">Use Elements panel to inspect and modify this page.</p>
<div style="display:flex;gap:10px;flex-wrap:wrap;margin-bottom:20px">
<button data-testid="primary-btn" style="padding:10px 20px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer">Primary</button>
<button data-testid="secondary-btn" style="padding:10px 20px;background:#e5e7eb;color:#1f2937;border:1px solid #d1d5db;border-radius:8px;font:inherit;font-size:14px;cursor:pointer">Secondary</button>
<button data-testid="danger-btn" style="padding:10px 20px;background:#EF4444;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer">Danger</button>
</div>
<div data-testid="card-1" style="background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:16px;margin-bottom:12px">
<h3 style="font-size:15px;font-weight:600;margin-bottom:4px">Card Title</h3>
<p style="font-size:13px;color:#64748b">Try double-clicking the title text to edit it inline, or modify styles in the Styles panel.</p>
</div>
${
  withOverlay
    ? `
<div style="position:relative;padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">
Tip: Press <strong>H</strong> in Elements to toggle visibility. Try it on the overlay below.
</div>
<div data-testid="ghost-overlay" style="position:fixed;inset:0;z-index:999;background:rgba(0,0,0,0.002);pointer-events:all"></div>
`
    : ''
}
`,
  );

app.get('/demos/l2', (c) => c.html(l2Demo()));
app.get('/demos/l2-1', (c) => c.html(l2Demo()));
app.get('/demos/l2-2', (c) => c.html(l2Demo()));
app.get('/demos/l2-3', (c) => c.html(l2Demo({ withOverlay: true })));
app.get('/demos/l2-4', (c) => c.html(l2Demo()));

// ── L3 — Console ──────────────────────────
const l3Demo = () =>
  page(
    'Webrex · Console',
    `
<h1 data-testid="main-heading" style="font-size:24px;font-weight:700;margin-bottom:8px">Console Practice</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Console (⌘+⌥+J) to see the diagnostic output. Try <code>$0</code> after selecting an element.</p>
<button data-testid="action-btn" onclick="handleClick()" style="padding:8px 18px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer;margin-right:8px">Click Me</button>
<button data-testid="copy-btn" onclick="copyData()" style="padding:8px 18px;background:#10B981;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer">Copy Data</button>
<div id="output" style="margin-top:16px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;min-height:40px"></div>
<script>
console.error('[lab] TypeError: Cannot read properties of undefined (reading "name")');
console.error('[lab] Failed to load resource: net::ERR_CONNECTION_REFUSED');
console.warn('[lab] Deprecation: Synchronous XHR is deprecated');
console.warn('[lab] Each child in a list should have a unique "key" prop');
console.info('[lab] App initialized in 234ms');
console.info('[lab] Service Worker registered');
window.webrexData = {user:'demo@webrex.dev',token:'eyJhbG...redacted',prefs:{theme:'dark'}};
localStorage.setItem('webrex_sample',JSON.stringify(window.webrexData));
function handleClick(){document.getElementById('output').textContent='Clicked at '+new Date().toLocaleTimeString();console.log('[demo] Button clicked');}
function copyData(){console.log('[demo] Try: copy(window.webrexData) in Console to copy this object');document.getElementById('output').textContent='Data object is in window.webrexData — see Console';}
</script>
`,
  );

app.get('/demos/l3', (c) => c.html(l3Demo()));
app.get('/demos/l3-1', (c) => c.html(l3Demo()));
app.get('/demos/l3-2', (c) => c.html(l3Demo()));
app.get('/demos/l3-3', (c) => c.html(l3Demo()));
app.get('/demos/l3-4', (c) => c.html(l3Demo()));
app.get('/demos/l3-5', (c) => c.html(l3Demo()));

// ── L4 — Network ──────────────────────────
const l4Demo = () =>
  page(
    'Webrex · Network',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Network Practice</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Network panel (⌘+⌥+N), refresh, inspect requests.</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
<button onclick="fetch('/api/products').then(r=>r.json()).then(d=>log('Products: '+d.length+' items'))" style="padding:8px 14px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">GET /api/products</button>
<button onclick="fetch('/api/users').then(r=>r.json()).then(d=>log('Users: '+d.length+' users'))" style="padding:8px 14px;background:#10B981;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">GET /api/users</button>
<button onclick="fetch('/api/not-found').then(r=>log('404: '+r.status)).catch(e=>log('Error: '+e.message))" style="padding:8px 14px;background:#EF4444;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">GET /api/not-found</button>
<button onclick="fetch('/api/slow').then(r=>r.json()).then(d=>log('Slow: '+JSON.stringify(d)))" style="padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">Slow API</button>
</div>
<div id="log" style="padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;min-height:60px;white-space:pre-wrap">Click buttons to send requests...</div>
<script>function log(m){var e=document.getElementById('log');e.textContent+=(e.textContent?'\\n':'')+m;}</script>
`,
  );

app.get('/demos/l4', (c) => c.html(l4Demo()));
app.get('/demos/l4-1', (c) => c.html(l4Demo()));
app.get('/demos/l4-2', (c) => c.html(l4Demo()));
app.get('/demos/l4-3', (c) => c.html(l4Demo()));
app.get('/demos/l4-4', (c) => c.html(l4Demo()));

// ── L5 — Sources ──────────────────────────
const l5Demo = () =>
  page(
    'Webrex · Sources',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Sources Practice</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Sources panel. Try Cmd+O (filename search) and Cmd+Shift+F (global search). Set breakpoints on the functions below.</p>
<button data-testid="trigger-bp" onclick="step1()" style="padding:8px 18px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer;margin-right:8px">Trigger Breakpoint</button>
<button data-testid="trigger-callstack" onclick="deepCall()" style="padding:8px 18px;background:#10B981;color:#fff;border:none;border-radius:8px;font:inherit;font-size:14px;cursor:pointer">Deep Call Stack</button>
<div id="out" style="margin-top:16px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;min-height:40px"></div>
<script>
function formatDate(d){return new Date(d).toLocaleDateString('zh-CN');}
function truncate(s,n){return s&&s.length>n?s.slice(0,n)+'…':s||'';}
function deepClone(o){if(!o||typeof o!=='object')return o;if(Array.isArray(o))return o.map(deepClone);var c={};for(var k in o)o.hasOwnProperty(k)&&(c[k]=deepClone(o[k]));return c;}
function deepNested(level,data){if(level<=0)return deepClone(data);return deepNested(level-1,Object.assign({},data,{level:level}));}
function step1(){var d=formatDate('2026-05-09');document.getElementById('out').textContent='formatDate result: '+d;}
function deepCall(){var r=deepNested(5,{name:'test',items:[1,2,3]});document.getElementById('out').textContent='deepNested(5) done. Set breakpoints on deepNested or deepClone to see call stack.';}
console.log('[sources] Functions available: formatDate, truncate, deepClone, deepNested. Try Cmd+O to find this file.');
</script>
`,
  );

app.get('/demos/l5', (c) => c.html(l5Demo()));
app.get('/demos/l5-1', (c) => c.html(l5Demo()));
app.get('/demos/l5-2', (c) => c.html(l5Demo()));
app.get('/demos/l5-3', (c) => c.html(l5Demo()));
app.get('/demos/l5-4', (c) => c.html(l5Demo()));
app.get('/demos/l5-5', (c) => c.html(l5Demo()));
app.get('/demos/l5-6', (c) => c.html(l5Demo()));

// ── L6 — Application ──────────────────────
const l6Demo = () => {
  return (c: any) => {
    c.res.headers.set('Set-Cookie', 'webrex_session=demo; Path=/; SameSite=Lax; HttpOnly; Max-Age=3600');
    c.res.headers.set('Set-Cookie', 'webrex_theme=auto; Path=/; SameSite=Lax; Max-Age=86400');
    return c.html(
      page(
        'Webrex · Application',
        `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Application Practice</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Application panel to explore Cookies, localStorage, sessionStorage, and IndexedDB.</p>
<ul style="margin-bottom:16px;padding-left:20px;font-size:13px;color:#1e293b">
<li><strong>Cookies</strong>: 2 cookies set (webrex_session, webrex_theme)</li>
<li><strong>Local Storage</strong>: webrex_prefs key</li>
<li><strong>Session Storage</strong>: webrex_temp key</li>
<li><strong>IndexedDB</strong>: webrex_demo_db → samples store</li>
</ul>
<div id="s" style="padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e">Ready — open Application panel and explore each storage type.</div>
<script>
localStorage.setItem('webrex_prefs',JSON.stringify({theme:'auto',lang:'zh-CN'}));
sessionStorage.setItem('webrex_temp',JSON.stringify({opened:Date.now()}));
var r=indexedDB.open('webrex_demo_db',1);r.onupgradeneeded=function(e){e.target.result.createObjectStore('samples',{keyPath:'id',autoIncrement:true})};r.onsuccess=function(e){var t=e.target.result.transaction('samples','readwrite');t.objectStore('samples').put({id:1,type:'config',data:{theme:'dark'}});t.objectStore('samples').put({id:2,type:'log',data:{event:'load'}});};
</script>
`,
      ),
    );
  };
};

app.get('/demos/l6', l6Demo());
app.get('/demos/l6-1', l6Demo());
app.get('/demos/l6-2', l6Demo());
app.get('/demos/l6-3', l6Demo());
app.get('/demos/l6-4', l6Demo());

// ── L7 — Security ─────────────────────────
const l7Demo = () =>
  page(
    'Webrex · Security',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Security Practice</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Console and Network to inspect security headers and behaviors.</p>
<div style="margin-bottom:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
<p><strong>Test Mixed Content:</strong> <img src="http://localhost:8787/api/mixed-image" alt="mixed" style="display:none" onerror="this.nextSibling.textContent='Mixed content blocked by browser'"><span></span></p>
<p><strong>Check CSP:</strong> Open Console for CSP violation reports</p>
</div>
<div style="display:flex;gap:8px;margin-bottom:16px">
<button onclick="fetch('/api/cors-blocked').then(r=>r.text()).then(d=>log('BLOCKED: '+d)).catch(e=>log('CORS blocked: '+e.message))" style="padding:8px 14px;background:#EF4444;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">CORS Blocked</button>
<button onclick="fetch('/api/cors-allowed').then(r=>r.text()).then(d=>log('ALLOWED: '+d)).catch(e=>log('Error: '+e.message))" style="padding:8px 14px;background:#10B981;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">CORS Allowed</button>
</div>
<div id="log" style="padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;min-height:60px;white-space:pre-wrap">Click buttons to test CORS...</div>
<script>function log(m){var e=document.getElementById('log');e.textContent+=(e.textContent?'\\n':'')+m;}</script>
`,
  );

app.get('/demos/l7', (c) => c.html(l7Demo()));
app.get('/demos/l7-1', (c) => c.html(l7Demo()));
app.get('/demos/l7-2', (c) => c.html(l7Demo()));
app.get('/demos/l7-3', (c) => c.html(l7Demo()));
app.get('/demos/l7-4', (c) => c.html(l7Demo()));

// ── L8 — Responsive ───────────────────────
const l8Demo = () =>
  page(
    'Webrex · Responsive',
    `
<style>
.wrp{max-width:800px;margin:0 auto}
.nav{display:flex;gap:8px;margin-bottom:16px;flex-wrap:wrap}
.nav a{padding:6px 12px;border-radius:6px;text-decoration:none;color:#64748b;font-size:13px}
.nav a:hover{background:#f1f5f9}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}
.card{background:#fff;border:1px solid #e2e8f0;border-radius:10px;padding:14px}
.card h3{font-size:14px;margin-bottom:4px}.card p{font-size:12px;color:#64748b}
.menu-btn{display:none}
@media(max-width:768px){.grid{grid-template-columns:1fr}.nav a{display:none}.menu-btn{display:block}}
@media(max-width:480px){h1{font-size:18px!important}}
</style>
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Responsive Design Demo</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Press ⌘+⇧+M to open Device Toolbar. Drag the viewport to see breakpoints at 768px and 480px.</p>
<div class="nav"><a href="#">Home</a><a href="#">Docs</a><a href="#">API</a><a href="#">About</a><button class="menu-btn" style="font:inherit;font-size:20px;background:none;border:none;cursor:pointer">☰</button></div>
<div class="grid">
<div class="card"><h3>Card 1</h3><p>Resize the viewport to see this grid change from 3 columns to 1.</p></div>
<div class="card"><h3>Card 2</h3><p>The nav links disappear at 768px, replaced by a hamburger menu button.</p></div>
<div class="card"><h3>Card 3</h3><p>The heading shrinks at 480px. All controlled by CSS @media queries.</p></div>
</div>
`,
  );

app.get('/demos/l8', (c) => c.html(l8Demo()));
app.get('/demos/l8-1', (c) => c.html(l8Demo()));
app.get('/demos/l8-2', (c) => c.html(l8Demo()));
app.get('/demos/l8-3', (c) => c.html(l8Demo()));
app.get('/demos/l8-4', (c) => c.html(l8Demo()));
app.get('/demos/l8-5', (c) => c.html(l8Demo()));

// ── L9 — Compatibility ────────────────────
const l9Demo = () =>
  page(
    'Webrex · Compatibility',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Browser Compatibility</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">This page has features that behave differently across browsers.</p>
<div style="margin-bottom:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
<p><strong>Current UA:</strong> <code id="ua"></code></p>
<p><strong>Platform:</strong> <code id="plat"></code></p>
</div>
<p style="font-size:13px;color:#64748b;margin-bottom:16px">Try: DevTools → ⋮ → More tools → Network conditions → uncheck "Use browser default" → select a different UA → refresh.</p>
<div id="compat-test" style="padding:12px;background:#fef3c7;border-radius:8px;font-size:13px;color:#92400e"></div>
<script>
document.getElementById('ua').textContent=navigator.userAgent.substring(0,80)+'...';
document.getElementById('plat').textContent=navigator.platform;
try{var d=new Date('2026-05-09 10:00:00');document.getElementById('compat-test').textContent='Date parse OK: '+d.toISOString();}catch(e){document.getElementById('compat-test').textContent='Date parse FAILED (Safari bug): '+e.message;}
</script>
`,
  );

app.get('/demos/l9', (c) => c.html(l9Demo()));
app.get('/demos/l9-1', (c) => c.html(l9Demo()));
app.get('/demos/l9-2', (c) => c.html(l9Demo()));
app.get('/demos/l9-3', (c) => c.html(l9Demo()));
app.get('/demos/l9-4', (c) => c.html(l9Demo()));

// ── L10 — Architecture ────────────────────
const l10Demo = () =>
  page(
    'Webrex · Architecture',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Frontend Architecture</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">View Source vs Elements, build hashes, and environment checks.</p>
<div style="margin-bottom:12px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
<p><strong>View Source:</strong> Right-click → View Page Source. Compare with Elements panel.</p>
<p><strong>Content Hash:</strong> Check Network panel for file names with hashes (e.g., <code>utils.a3f8b2.js</code>).</p>
<p><strong>Cache-Control:</strong> Inspect response headers for <code>Cache-Control</code> headers.</p>
</div>
<div id="csr-content" style="padding:12px;background:#d1fae5;border-radius:8px;font-size:13px;margin-bottom:12px">This text is server-rendered (visible in View Source).</div>
<div id="csr-dynamic" style="padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">Loading dynamic content...</div>
<script>document.getElementById('csr-dynamic').textContent='This text is client-rendered (NOT in View Source). Rendered at: '+new Date().toISOString();</script>
`,
  );

app.get('/demos/l10', (c) => c.html(l10Demo()));
app.get('/demos/l10-1', (c) => c.html(l10Demo()));
app.get('/demos/l10-2', (c) => c.html(l10Demo()));
app.get('/demos/l10-3', (c) => c.html(l10Demo()));
app.get('/demos/l10-4', (c) => c.html(l10Demo()));

// ── L11 — Performance Metrics ──────────────
const l11Demo = () =>
  page(
    'Webrex · Performance Metrics',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Performance Metrics</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Open Lighthouse panel (or Performance panel) to analyze this page.</p>
<div style="margin-bottom:16px;padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px">
<p>This page has:</p><ul style="padding-left:20px;margin-top:4px">
<li>A large hero image (loaded programmatically)</li>
<li>Layout-shifting content</li>
<li>An animation that triggers repaints</li>
</ul>
</div>
<div id="hero-img" style="width:100%;height:120px;background:linear-gradient(135deg,#667eea,#764ba2);border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-size:20px;font-weight:700">LCP Element</div>
<div id="shifty" style="margin-top:16px;padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;animation:shift 1s ease-in-out infinite">⚠ This element shifts position (CLS demo)</div>
<style>@keyframes shift{0%,100%{margin-top:16px}50%{margin-top:24px}}</style>
<script>console.log('[perf] Page loaded. Run Lighthouse to analyze Core Web Vitals.');</script>
`,
  );

app.get('/demos/l11', (c) => c.html(l11Demo()));
app.get('/demos/l11-1', (c) => c.html(l11Demo()));
app.get('/demos/l11-2', (c) => c.html(l11Demo()));
app.get('/demos/l11-3', (c) => c.html(l11Demo()));

// ── L12 — SPA/SSR ─────────────────────────
const l12Demo = () =>
  page(
    'Webrex · Architecture',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">SPA / SSR / Build</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">Explore SPA routing, SSR vs CSR, and build artifacts.</p>
<div style="display:flex;gap:8px;margin-bottom:16px">
<button onclick="navigate('home')" style="padding:6px 14px;background:#3B82F6;color:#fff;border:none;border-radius:6px;font:inherit;font-size:13px;cursor:pointer">Home</button>
<button onclick="navigate('about')" style="padding:6px 14px;background:#e5e7eb;color:#1f2937;border:1px solid #d1d5db;border-radius:6px;font:inherit;font-size:13px;cursor:pointer">About</button>
</div>
<div id="spa-view" style="padding:16px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-size:13px;min-height:80px">SPA View — click buttons above. Notice: URL changes but no network request for new HTML.</div>
<p style="font-size:12px;color:#64748b;margin-top:8px">Open Network panel while clicking — no document request. This is SPA routing.</p>
<p style="font-size:12px;color:#64748b">View Source vs Elements: server-rendered content is in source; client-rendered is only in Elements.</p>
<script>
var views={home:'<strong>Home</strong><p style="margin-top:8px">This content was rendered by JavaScript (CSR). View Source won\'t show it.</p>',about:'<strong>About</strong><p style="margin-top:8px">URL changed to /about but no page reload. History API + client-side rendering.</p>'};
function navigate(page){history.pushState({},'',page==='home'?'/demos/l12':'/demos/l12/'+page);document.getElementById('spa-view').innerHTML=views[page];}
</script>
`,
  );

app.get('/demos/l12', (c) => c.html(l12Demo()));
app.get('/demos/l12-1', (c) => c.html(l12Demo()));
app.get('/demos/l12-2', (c) => c.html(l12Demo()));
app.get('/demos/l12-3', (c) => c.html(l12Demo()));
app.get('/demos/l12-4', (c) => c.html(l12Demo()));

// ── L13 — Protocols ───────────────────────
const l13Demo = () =>
  page(
    'Webrex · Protocols',
    `
<h1 style="font-size:24px;font-weight:700;margin-bottom:8px">Network Protocols</h1>
<p style="color:#64748b;font-size:14px;margin-bottom:16px">This page triggers REST, GraphQL, and SSE requests. Open Network panel and filter by type.</p>
<div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
<button onclick="fetch('/api/products').then(r=>r.json()).then(d=>log('REST: '+d.length+' products'))" style="padding:8px 14px;background:#3B82F6;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">REST (Fetch/XHR)</button>
<button onclick="fetch('/api/echo-graphql',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({query:'{user{name}}'})}).then(r=>r.json()).then(d=>log('GraphQL: '+JSON.stringify(d)))" style="padding:8px 14px;background:#10B981;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">GraphQL</button>
<button onclick="testSSE()" style="padding:8px 14px;background:#f59e0b;color:#fff;border:none;border-radius:8px;font:inherit;font-size:13px;cursor:pointer">SSE</button>
</div>
<div id="log" style="padding:12px;background:#fff;border:1px solid #e2e8f0;border-radius:8px;font-family:monospace;font-size:12px;min-height:80px;white-space:pre-wrap">Click buttons to send requests. Filter Network by type (Fetch/XHR, WS, EventStream).</div>
<script>
function log(m){var e=document.getElementById('log');e.textContent+=(e.textContent?'\\n':'')+m;}
var es;function testSSE(){if(es)es.close();es=new EventSource('/api/sse');es.onmessage=function(e){log('SSE: '+e.data)};es.addEventListener('done',function(){log('SSE done');es.close()});}
</script>
`,
  );

app.get('/demos/l13', (c) => c.html(l13Demo()));
app.get('/demos/l13-1', (c) => c.html(l13Demo()));
app.get('/demos/l13-2', (c) => c.html(l13Demo()));
app.get('/demos/l13-3', (c) => c.html(l13Demo()));

export default app;
