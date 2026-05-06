import type { Context, Next } from 'hono';
import { cors } from 'hono/cors';

export const sessions = new Map<string, Set<string>>();
export const hitCounts = new Map<string, Map<string, number>>();

export function sessionTracker(c: Context, next: Next) {
  const path = c.req.path;
  const sessionId = c.req.header('x-webrex-session') || 'default';
  if (!sessions.has(sessionId)) sessions.set(sessionId, new Set());
  sessions.get(sessionId)!.add(path);
  if (!hitCounts.has(sessionId)) hitCounts.set(sessionId, new Map());
  const counts = hitCounts.get(sessionId)!;
  counts.set(path, (counts.get(path) || 0) + 1);
  return next();
}

export async function corsMiddleware(c: Context, next: Next) {
  if (c.req.path === '/api/cors/blocked') return next();
  return cors({
    origin: (origin) => {
      if (!origin) return '*';
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
      return null;
    },
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    credentials: false,
  })(c, next);
}
