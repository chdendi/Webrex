import { useEffect, useState } from 'react';
import { readCompletions } from '~/lib/progress/local-store';

interface Props {
  lessonId: string;
}

interface Payload {
  authenticated: boolean;
  beatPercent: number | null;
  completionRank: number | null;
  attemptRank: number | null;
  totalCompletions: number;
  totalAttempters: number;
  attemptsToPass: number | null;
}

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export default function AchievementCard({ lessonId }: Props) {
  const [data, setData] = useState<Payload | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasLocalCompletion, setHasLocalCompletion] = useState(false);

  useEffect(() => {
    let alive = true;
    setHasLocalCompletion(readCompletions().some((c) => c.lessonId === lessonId));
    fetch(`/api/achievement?lesson=${encodeURIComponent(lessonId)}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))))
      .then((json) => {
        if (alive) setData(json as Payload);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      });
    return () => {
      alive = false;
    };
  }, [lessonId]);

  if (error) {
    return null; // fail silently — achievement is non-critical
  }

  if (!data) {
    return (
      <div
        className="rounded-2xl border p-6 text-sm"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text-faint)',
        }}
      >
        Loading your achievement…
      </div>
    );
  }

  const lines: { icon: string; text: React.ReactNode }[] = [];

  if (data.authenticated && data.beatPercent != null) {
    lines.push({
      icon: '🎉',
      text: (
        <>
          You beat <strong>{data.beatPercent}%</strong> of learners on this lesson
          {data.attemptsToPass != null &&
            ` (passed in ${data.attemptsToPass} ${data.attemptsToPass === 1 ? 'try' : 'tries'})`}
          .
        </>
      ),
    });
  }
  if (data.authenticated && data.completionRank != null) {
    lines.push({
      icon: '🥇',
      text: (
        <>
          You are the <strong>{ordinal(data.completionRank)}</strong> learner to pass this lesson
          {data.totalCompletions > 0 && ` (out of ${data.totalCompletions} so far)`}.
        </>
      ),
    });
  }
  if (data.authenticated && data.attemptRank != null) {
    lines.push({
      icon: '👀',
      text: (
        <>
          You were the <strong>{ordinal(data.attemptRank)}</strong> learner to attempt it.
        </>
      ),
    });
  }

  if (lines.length === 0) {
    // Anonymous or first-ever passer
    lines.push({
      icon: '👥',
      text: (
        <>
          So far <strong>{data.totalCompletions}</strong> learner
          {data.totalCompletions === 1 ? '' : 's'} passed this lesson
          {data.totalAttempters > 0 && `, out of ${data.totalAttempters} who attempted`}.
        </>
      ),
    });
  }

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-3 animate-in"
      style={{
        background: 'color-mix(in srgb, var(--color-success) 6%, var(--color-surface))',
        borderColor: 'color-mix(in srgb, var(--color-success) 30%, var(--color-border))',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <header className="flex items-center gap-2">
        <span className="text-base font-semibold" style={{ color: 'var(--color-success)' }}>
          ✨ Achievement unlocked
        </span>
      </header>

      <ul className="flex flex-col gap-2 text-[15px]" style={{ color: 'var(--color-text)' }}>
        {lines.map((line, i) => (
          <li key={i} className="flex gap-2">
            <span aria-hidden>{line.icon}</span>
            <span>{line.text}</span>
          </li>
        ))}
      </ul>

      {!data.authenticated && hasLocalCompletion && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          📍 You've completed this lesson —{' '}
          <a href="/login" className="underline" style={{ color: 'var(--color-accent)' }}>
            sign in
          </a>{' '}
          to save it permanently.
        </p>
      )}

      {!data.authenticated && (
        <p className="text-sm pt-1" style={{ color: 'var(--color-text-muted)' }}>
          <a href="/login" className="underline" style={{ color: 'var(--color-accent)' }}>
            Sign in
          </a>{' '}
          to save your progress and see your personal rank.
        </p>
      )}
    </div>
  );
}
