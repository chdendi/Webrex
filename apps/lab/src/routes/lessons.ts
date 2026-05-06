import { Hono } from 'hono';

const app = new Hono();

// ---------------------------------------------------------------------------
// L1.1
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L2.1 — Console
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L2.4 — localStorage with sensitive fields
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L3.1 / L3.2 — Elements practice
// ---------------------------------------------------------------------------
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
        <button data-testid="primary-button">原型按钮 一</button>
        <button data-testid="secondary-button">原型按钮 二</button>
        <button data-testid="tertiary-button">原型按钮 三</button>
      </div>
      <footer>由 Webrex 提供 · 仅用于练习</footer>
    </main>
  </body>
</html>`),
);

// ---------------------------------------------------------------------------
// L3.3 — transparent overlay
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L4.7 — CORS demonstration
// ---------------------------------------------------------------------------
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
          blockedEl.textContent = '\\u2713 BLOCKED 端点意外成功：' + JSON.stringify(data, null, 2);
        })
        .catch(err => {
          blockedEl.className = 'result error';
          blockedEl.textContent = '\\u2717 CORS 被拦截（预期行为）：' + err.message;
        });

      fetch('http://127.0.0.1:8787/api/cors/allowed')
        .then(r => r.json())
        .then(data => {
          allowedEl.className = 'result success';
          allowedEl.textContent = '\\u2713 ALLOWED 端点成功：' + JSON.stringify(data, null, 2);
        })
        .catch(err => {
          allowedEl.className = 'result error';
          allowedEl.textContent = '\\u2717 ALLOWED 端点意外失败：' + err.message;
        });
    </script>
  </body>
</html>`),
);

// ---------------------------------------------------------------------------
// L4.8 — HTTP caching demonstration
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L13.1 — HAR demo page
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L10.2 — CSP strict
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L10.3 — Third-party Cookie demo
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L10.4 — XSS demo
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// L12.1 — SPA routing demo
// ---------------------------------------------------------------------------
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

export default app;
