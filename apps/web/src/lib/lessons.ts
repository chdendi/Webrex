import type { CollectionEntry } from 'astro:content';
import { getCollection } from 'astro:content';

type LessonEntry = CollectionEntry<'lessons'>;

/**
 * Lesson content is bundled at build time and immutable per deploy, so we can
 * safely cache the sorted collection at module scope. Cloudflare Workers reuse
 * module state within an isolate, which means subsequent requests served by the
 * same isolate skip the (otherwise repeated) sort over ~60 entries.
 */
let cached: LessonEntry[] | null = null;

export async function getAllLessonsSorted(): Promise<LessonEntry[]> {
  if (cached) return cached;
  const lessons = await getCollection('lessons');
  lessons.sort((a, b) => a.data.level - b.data.level || a.data.sublevel - b.data.sublevel);
  cached = lessons;
  return cached;
}

export interface LessonNavContext {
  lesson: LessonEntry;
  allLessons: LessonEntry[];
  lessonIdx: number;
  index: number;
  total: number;
  prevId: string | undefined;
  nextId: string | undefined;
}

/**
 * Look up a lesson by id and pre-compute the sidebar/footer nav context
 * (1-based index, total, prev/next ids). Returns null when not found so
 * callers can render a 404.
 */
export async function getLessonNavContext(id: string): Promise<LessonNavContext | null> {
  const allLessons = await getAllLessonsSorted();
  const lessonIdx = allLessons.findIndex((l) => l.id === id);
  if (lessonIdx === -1) return null;
  return {
    lesson: allLessons[lessonIdx],
    allLessons,
    lessonIdx,
    index: lessonIdx + 1,
    total: allLessons.length,
    prevId: lessonIdx > 0 ? allLessons[lessonIdx - 1].id : undefined,
    nextId: lessonIdx < allLessons.length - 1 ? allLessons[lessonIdx + 1].id : undefined,
  };
}
