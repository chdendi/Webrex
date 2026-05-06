import { Hono } from 'hono';
import { corsMiddleware, sessionTracker } from './middleware.js';
import apiRoutes from './routes/api.js';
import lessonsRoutes from './routes/lessons.js';
import verifyRoutes from './routes/verify.js';

const app = new Hono();

app.use('*', sessionTracker);
app.use('*', corsMiddleware);

app.get('/', (c) =>
  c.json({
    name: 'Webrex Demo Lab',
    status: 'ok',
    endpoints: [
      '/lessons/l1-1',
      '/lessons/l1-1/check',
      '/lessons/l2-1',
      '/lessons/l2-4',
      '/lessons/l3-1',
      '/lessons/l3-3',
      '/lessons/l4-7',
      '/api/cors/blocked',
      '/api/cors/allowed',
      '/lessons/l4-8',
      '/api/cache/long.json',
      '/api/cache/short.json',
      '/api/cache/none.json',
      '/lessons/l13-har',
      '/api/echo',
      '/api/echo-graphql',
      '/api/sse',
      '/api/ws',
      '/lessons/l10-csp',
      '/lessons/l10-csp-lax',
      '/lessons/l10-cookie',
      '/lessons/l10-xss',
      '/lessons/l12-spa',
      '/lessons/l12-spa/about',
      '/api/mixed-image',
    ],
  }),
);

app.route('/', lessonsRoutes);
app.route('/', apiRoutes);
app.route('/', verifyRoutes);

export default app;
