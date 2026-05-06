import { Hono } from 'hono';

const app = new Hono();

// ---------------------------------------------------------------------------
// CORS endpoints
// ---------------------------------------------------------------------------
app.get('/api/cors/blocked', (c) => c.json({ ok: true, data: 'this would be useful' }));

app.get('/api/cors/allowed', (c) => {
  c.res.headers.set('Access-Control-Allow-Origin', 'http://localhost:8787');
  return c.json({ ok: true, data: 'this request passed CORS' });
});

// ---------------------------------------------------------------------------
// Cache endpoints
// ---------------------------------------------------------------------------
app.get('/api/cache/long.json', (c) => {
  c.res.headers.set('Cache-Control', 'public, max-age=31536000, immutable');
  return c.json({ resource: 'long', cached: true, ttl: '1 year' });
});

app.get('/api/cache/short.json', (c) => {
  c.res.headers.set('Cache-Control', 'public, max-age=10');
  return c.json({ resource: 'short', cached: true, ttl: '10 seconds' });
});

app.get('/api/cache/none.json', (c) => {
  c.res.headers.set('Cache-Control', 'no-store');
  return c.json({ resource: 'none', cached: false, ttl: 'never' });
});

// ---------------------------------------------------------------------------
// Echo endpoints
// ---------------------------------------------------------------------------
app.get('/api/echo', (c) => {
  const fail = c.req.query('fail');
  if (fail === '1') return c.json({ error: 'Internal Server Error', code: 500 }, 500 as any);
  const slow = c.req.query('slow');
  if (slow === '1') {
    return new Promise<Response>((resolve) => {
      setTimeout(() => resolve(c.json({ echo: 'slow response', delay: '1500ms' }) as any), 1500);
    }) as any;
  }
  return c.json({ echo: 'ok', method: 'GET', query: c.req.query() });
});

app.post('/api/echo', async (c) => {
  const body = await c.req.json();
  return c.json({ echo: 'ok', method: 'POST', received: body });
});

// ---------------------------------------------------------------------------
// GraphQL mock
// ---------------------------------------------------------------------------
app.post('/api/echo-graphql', async (c) => {
  const body = await c.req.json();
  return c.json({
    data: { user: { id: 1, name: 'Demo User', email: 'demo@webrex.dev' } },
    extensions: { query: body.query },
  });
});

// ---------------------------------------------------------------------------
// SSE
// ---------------------------------------------------------------------------
app.get('/api/sse', (c) => {
  let id = 0;
  const stream = new ReadableStream({
    start(controller) {
      const interval = setInterval(() => {
        id++;
        const data = JSON.stringify({ id, time: new Date().toISOString(), value: Math.floor(Math.random() * 100) });
        controller.enqueue(new TextEncoder().encode(`id: ${id}\ndata: ${data}\n\n`));
        if (id >= 5) {
          clearInterval(interval);
          controller.enqueue(new TextEncoder().encode(`event: done\ndata: stream complete\n\n`));
          controller.close();
        }
      }, 1000);
    },
  });
  c.res.headers.set('Content-Type', 'text/event-stream');
  c.res.headers.set('Cache-Control', 'no-cache');
  c.res.headers.set('Connection', 'keep-alive');
  return c.body(stream);
});

// ---------------------------------------------------------------------------
// WebSocket
// ---------------------------------------------------------------------------
app.get('/api/ws', (c) => {
  const upgrade = c.req.header('Upgrade');
  if (upgrade !== 'websocket') {
    return c.html(`<!doctype html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <title>Webrex Lab · WebSocket Echo</title>
    <style>
      body { font-family: system-ui, sans-serif; margin: 2rem auto; max-width: 720px; color: #1f2937; }
      h1 { font-size: 1.5rem; }
      input, button { font: inherit; padding: 0.5rem 0.75rem; }
      input { width: 300px; }
      #messages { background: #f4f4f5; padding: 0.75rem; border-radius: 6px; min-height: 150px; margin: 1rem 0; font-family: monospace; font-size: 0.85rem; }
      .status { display: inline-block; width: 10px; height: 10px; border-radius: 50%; margin-right: 6px; }
      .connected { background: #10b981; }
      .disconnected { background: #ef4444; }
    </style>
  </head>
  <body>
    <h1>L13 Lab · WebSocket Echo</h1>
    <p>状态：<span class="status disconnected" id="status-dot"></span><span id="status-text">未连接</span></p>
    <p>打开 DevTools → <strong>Network</strong> → 筛选 <strong>WS</strong>，选中连接后切到 <strong>Messages</strong> 面板看帧。</p>
    <div>
      <input id="input" placeholder="输入消息..." />
      <button id="send">发送</button>
    </div>
    <div id="messages">等待连接…</div>
    <script>
      const proto = location.protocol === 'https:' ? 'wss' : 'ws';
      const ws = new WebSocket(proto + '://' + location.host + '/api/ws');
      const msgs = document.getElementById('messages');
      const input = document.getElementById('input');
      const dot = document.getElementById('status-dot');
      const statusText = document.getElementById('status-text');

      ws.onopen = () => {
        dot.className = 'status connected';
        statusText.textContent = '已连接';
        msgs.textContent = '';
        addMsg('↑', 'Connected to WebSocket echo server');
      };
      ws.onmessage = (e) => addMsg('↓', e.data);
      ws.onclose = () => {
        dot.className = 'status disconnected';
        statusText.textContent = '已断开';
      };

      function addMsg(dir, text) { msgs.textContent += dir + ' ' + text + '\\n'; }

      document.getElementById('send').onclick = () => {
        const msg = input.value || 'ping';
        ws.send(msg);
        addMsg('↑', msg);
        input.value = '';
      };
      input.onkeydown = (e) => { if (e.key === 'Enter') document.getElementById('send').click(); };
    </script>
  </body>
</html>`);
  }

  const WSPair = (globalThis as any).WebSocketPair;
  if (WSPair) {
    const pair = new WSPair() as { 0: any; 1: any };
    const [client, server] = [pair[0], pair[1]] as [any, any];
    server.accept();
    server.addEventListener('message', (e: any) => server.send(`Echo: ${e.data}`));
    return new Response(null, { status: 101, webSocket: client } as any);
  }
  return c.json({ error: 'WebSocket not supported in this environment' }, 501);
});

// ---------------------------------------------------------------------------
// Mixed content
// ---------------------------------------------------------------------------
app.get('/api/mixed-image', (c) => c.json({ src: 'mixed content resource', type: 'image' }));

export default app;
