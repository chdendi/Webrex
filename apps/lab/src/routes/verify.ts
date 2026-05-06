import { Hono } from 'hono';
import { hitCounts, sessions } from '../middleware.js';

const app = new Hono();

// L4.7 — CORS verification
app.get('/lessons/l4-7/check', (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const visited = sessions.get(sessionId) || new Set();
  const visitedBlocked = visited.has('/api/cors/blocked');
  const visitedAllowed = visited.has('/api/cors/allowed');
  const ok = visitedBlocked && visitedAllowed;
  return c.json({
    ok,
    message: ok
      ? 'Both CORS endpoints accessed — CORS demo completed'
      : `Missing:${!visitedBlocked ? ' /api/cors/blocked' : ''}${!visitedAllowed ? ' /api/cors/allowed' : ''}`,
  });
});

// L4.8 — Cache verification
app.get('/lessons/l4-8/check', (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const counts = hitCounts.get(sessionId) || new Map();
  const hits = counts.get('/api/cache/long.json') || 0;
  return c.json({
    ok: hits >= 2,
    message:
      hits >= 2
        ? 'Cache demo active — long.json was requested at least twice'
        : 'Visit the cache page and refresh to check long.json caching behavior',
  });
});

// L10-CSP — CSP verification
app.get('/lessons/l10-csp/check', (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const visited = sessions.get(sessionId) || new Set();
  const visitedCsp = visited.has('/lessons/l10-csp');
  return c.json({
    ok: visitedCsp,
    message: visitedCsp
      ? 'CSP page loaded — check Console for CSP violation errors and Network tab for headers'
      : 'Visit the CSP page first to see CSP in action',
  });
});

// L10-XSS — XSS verification
app.get('/lessons/l10-xss/check', (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const visited = sessions.get(sessionId) || new Set();
  const xssTriggered = visited.has('/lessons/l10-xss/verify');
  return c.json({
    ok: xssTriggered,
    message: xssTriggered
      ? 'XSS payload submitted — check if the browser executed the injected script'
      : 'Submit an XSS payload on the XSS page to trigger verification',
  });
});

app.post('/lessons/l10-xss/verify', async (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  if (!sessions.has(sessionId)) sessions.set(sessionId, new Set());
  sessions.get(sessionId)!.add('/lessons/l10-xss/verify');
  return c.json({ ok: true, message: 'XSS payload recorded' });
});

// L12-SPA — SPA routing verification
app.get('/lessons/l12-spa/check', (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const visited = sessions.get(sessionId) || new Set();
  const visitedHome = visited.has('/lessons/l12-spa');
  const visitedAbout = visited.has('/lessons/l12-spa/about');
  const ok = visitedHome && visitedAbout;
  return c.json({
    ok,
    message: ok
      ? 'Both SPA routes visited — routing demo completed'
      : `Navigate to:${!visitedHome ? ' /lessons/l12-spa' : ''}${!visitedAbout ? ' /lessons/l12-spa/about' : ''}`,
  });
});

app.post('/lessons/l12-spa/track', async (c) => {
  const sessionId = c.req.header('x-webrex-session') || 'default';
  const body = await c.req.text();
  if (!sessions.has(sessionId)) sessions.set(sessionId, new Set());
  sessions.get(sessionId)!.add(body);
  return c.json({ ok: true });
});

export default app;
