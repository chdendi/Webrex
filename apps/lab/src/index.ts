import { Hono } from 'hono';
import { corsMiddleware, sessionTracker } from './middleware.js';
import apiRoutes from './routes/api.js';
import demoRoutes from './routes/demos/index.js';
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
      '/demos/l1-1',
      '/lessons/webrex-demo',
      '/lessons/l1-1',
      '/lessons/l1-1/check',
      '/lessons/l1-2',
      '/lessons/l2-1',
      '/lessons/l2-3',
      '/lessons/l2-4',
      '/lessons/l3-1',
      '/lessons/l3-3',
      '/lessons/l4-7',
      '/lessons/l4-8',
      '/lessons/l10-csp',
      '/lessons/l10-csp-lax',
      '/lessons/l10-cookie',
      '/lessons/l10-xss',
      '/lessons/l10-mixed',
      '/lessons/l12-spa',
      '/lessons/l12-spa/about',
      '/lessons/l12-ssr',
      '/lessons/l12-hash',
      '/lessons/l13-har',
      '/lessons/l13-protocols',
      '/api/cors/blocked',
      '/api/cors/allowed',
      '/api/cache/long.json',
      '/api/cache/short.json',
      '/api/cache/none.json',
      '/api/echo',
      '/api/echo-graphql',
      '/api/sse',
      '/api/ws',
      '/api/products',
      '/api/users',
      '/api/config',
      '/api/slow',
      '/api/mixed-image',
      '/js/utils.a3f8b2.js',
      '/js/app.min.js',
      '/js/app.min.js.map',
      '/sw.js',
    ],
  }),
);

app.route('/', lessonsRoutes);
app.route('/', apiRoutes);
app.route('/', demoRoutes);
app.route('/', verifyRoutes);

export default app;
