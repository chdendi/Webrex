import { useEffect } from 'react';
import { readAttempts, readCompletions, removeAttempts, removeCompletions } from '~/lib/progress/local-store';

declare global {
  interface Window {
    __webrexUser?: { id: string };
    __webrexProgressSyncRan?: boolean;
  }
}

/**
 * Mounted with `client:idle` from LessonLayout. If a user is signed in and
 * the local store has any queued progress, POST it to /api/progress/sync.
 * On 200, remove only the acknowledged snapshot; on any failure, leave the
 * local data intact so we can retry on the next page view.
 *
 * Renders nothing.
 */
export default function ProgressSync() {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.__webrexProgressSyncRan) return;
    if (!window.__webrexUser) return;

    const attempts = readAttempts();
    const completions = readCompletions();
    if (attempts.length === 0 && completions.length === 0) return;

    window.__webrexProgressSyncRan = true;

    fetch('/api/progress/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ attempts, completions }),
    })
      .then((r) => {
        if (r.ok) {
          removeAttempts(attempts.map((attempt) => attempt.eventId));
          removeCompletions(completions);
          window.dispatchEvent(new CustomEvent('webrex:progress-synced'));
        }
      })
      .catch(() => {
        // Silent — local data preserved for retry on next mount.
      });
  }, []);

  return null;
}
