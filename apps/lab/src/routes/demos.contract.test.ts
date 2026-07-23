import { readdir, readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import app from '../index';

interface PracticeStep {
  type: string;
  externalSite?: string;
  labContract?: { bodyIncludes: string[] };
}

interface ContractPracticeStep extends PracticeStep {
  externalSite: string;
  labContract: { bodyIncludes: string[] };
}

interface LessonData {
  id: string;
  steps?: PracticeStep[];
}

const lessonsDir = resolve(dirname(fileURLToPath(import.meta.url)), '../../../web/src/data/lessons');

async function loadLessons(): Promise<LessonData[]> {
  const files = (await readdir(lessonsDir)).filter((file) => file.endsWith('.json'));
  return Promise.all(
    files.map(async (file) => JSON.parse(await readFile(resolve(lessonsDir, file), 'utf8')) as LessonData),
  );
}

describe('lesson and demo contracts', () => {
  it('serves every lesson demo path', async () => {
    const lessons = await loadLessons();
    const paths = lessons.flatMap((lesson) =>
      (lesson.steps ?? [])
        .filter((step) => step.type === 'practice' && step.externalSite?.startsWith('/'))
        .map((step) => ({ lesson: lesson.id, path: step.externalSite as string })),
    );

    for (const { lesson, path } of paths) {
      const response = await app.request(path);
      expect(response.status, `${lesson} -> ${path}`).toBe(200);
    }
  });

  it('keeps lesson-specific demo content aligned with the curriculum', async () => {
    const lessons = await loadLessons();
    const contracts = lessons.flatMap((lesson) =>
      (lesson.steps ?? [])
        .filter(
          (step): step is ContractPracticeStep =>
            step.type === 'practice' && typeof step.externalSite === 'string' && step.labContract !== undefined,
        )
        .map((step) => ({ lesson: lesson.id, path: step.externalSite, contract: step.labContract })),
    );

    for (const { lesson, path, contract } of contracts) {
      const body = await (await app.request(path)).text();
      for (const requiredText of contract.bodyIncludes) {
        expect(body, `${lesson} -> ${path}`).toContain(requiredText);
      }
    }
  });

  it('preserves the cache contract used by L4.2', async () => {
    const response = await app.request('/api/cache/short.json');
    expect(response.status).toBe(200);
    expect(response.headers.get('cache-control')).toBe('public, max-age=60');
  });
});
