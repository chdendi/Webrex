import { type RedactCategory, type ReplacementStyle, redact } from '@webrex/redact';
import { useEffect, useMemo, useState } from 'react';

const ALL: RedactCategory[] = ['cookie', 'authorization', 'bearer', 'email', 'phone', 'ip', 'internalUrl'];

export default function RedactionPanel() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [enabled, setEnabled] = useState<Record<RedactCategory, boolean>>(
    () => Object.fromEntries(ALL.map((c) => [c, true])) as Record<RedactCategory, boolean>,
  );
  const [style, setStyle] = useState<ReplacementStyle>('tag');

  const result = useMemo(
    () => redact(text, { enabledCategories: enabled, replacement: style }),
    [text, enabled, style],
  );

  useEffect(() => {
    const onTrigger = () => setOpen(true);
    document.getElementById('redact-trigger')?.addEventListener('click', onTrigger);
    return () => document.getElementById('redact-trigger')?.removeEventListener('click', onTrigger);
  }, []);

  if (!open) return null;

  // Render redacted output with highlights for replaced spans
  const highlighted = (() => {
    if (result.matches.length === 0) return result.redacted;
    const parts: React.ReactNode[] = [];
    let lastEnd = 0;
    let outCursor = 0;
    for (const m of result.matches) {
      const plainLen = m.start - lastEnd;
      parts.push(result.redacted.slice(outCursor, outCursor + plainLen));
      outCursor += plainLen;
      parts.push(
        <mark
          key={`${m.start}-${m.end}`}
          style={{
            background: 'var(--color-redact-bg)',
            color: 'var(--color-redact-text)',
            border: '1px solid var(--color-redact-border)',
            padding: '0 4px',
            borderRadius: '4px',
            fontWeight: 500,
          }}
        >
          {m.replacement}
        </mark>,
      );
      outCursor += m.replacement.length;
      lastEnd = m.end;
    }
    parts.push(result.redacted.slice(outCursor));
    return parts;
  })();

  const copyRedacted = () => navigator.clipboard.writeText(result.redacted);
  const copyOriginal = () => {
    if (confirm('This may contain sensitive data. Continue?')) {
      navigator.clipboard.writeText(text);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50"
        style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)' }}
        onClick={() => setOpen(false)}
      />
      {/* Panel */}
      <aside
        className="fixed top-0 right-0 bottom-0 w-[480px] z-50 flex flex-col border-l shadow-2xl"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <header
          className="flex items-center justify-between px-5 py-4 border-b"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: 'var(--color-text)' }}>
            🛡 Redact before sharing with AI
          </h2>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="text-xl leading-none"
            style={{ color: 'var(--color-text-muted)' }}
            aria-label="Close"
          >
            ×
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
          {/* Original */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Paste original
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Paste the raw output (cURL, headers, console error, JSON...) here"
              className="min-h-[140px] rounded-md border p-3 font-mono text-[13px] leading-relaxed resize-y"
              style={{
                background: 'var(--color-surface-muted)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          {/* Detection chips */}
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--color-text-muted)' }}>
              Detection summary
            </span>
            <div className="flex flex-wrap gap-2">
              {result.summary.map((s) => {
                const active = enabled[s.category] && s.count > 0;
                return (
                  <button
                    type="button"
                    key={s.category}
                    onClick={() =>
                      setEnabled((p) => ({
                        ...p,
                        [s.category]: !p[s.category],
                      }))
                    }
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs transition-all"
                    style={{
                      background: active ? 'var(--color-accent-soft)' : 'var(--color-surface-muted)',
                      borderColor: active ? 'var(--color-accent)' : 'var(--color-border)',
                      color: active ? 'var(--color-accent)' : 'var(--color-text-muted)',
                      opacity: s.count === 0 ? 0.5 : 1,
                    }}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                    <span className="font-semibold">· {s.count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Replacement style */}
          <div className="flex items-center gap-3 text-sm" style={{ color: 'var(--color-text)' }}>
            <label
              htmlFor="rep-style"
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Replace with
            </label>
            <select
              id="rep-style"
              value={style}
              onChange={(e) => setStyle(e.target.value as ReplacementStyle)}
              className="rounded-md border px-2 py-1 text-sm"
              style={{
                background: 'var(--color-surface-muted)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              <option value="tag">&lt;REDACTED_*&gt;</option>
              <option value="asterisks">***</option>
              <option value="label">[category]</option>
            </select>
          </div>

          {/* Redacted */}
          <div className="flex flex-col gap-2">
            <label
              className="text-xs font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Redacted output
            </label>
            <div
              className="rounded-md border p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap"
              style={{
                background: 'var(--color-surface-muted)',
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
                minHeight: '140px',
              }}
            >
              {text ? highlighted : <span style={{ color: 'var(--color-text-faint)' }}>Output will appear here…</span>}
            </div>
          </div>
        </div>

        <footer className="border-t p-4 flex flex-col gap-2" style={{ borderColor: 'var(--color-border)' }}>
          <button
            type="button"
            onClick={copyRedacted}
            disabled={!text}
            className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
            style={{ background: 'var(--color-accent)' }}
          >
            Copy redacted
          </button>
          <button
            type="button"
            onClick={copyOriginal}
            disabled={!text}
            className="w-full px-4 py-2 rounded-md text-sm border transition-colors disabled:opacity-50"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            Copy original anyway
          </button>
        </footer>
      </aside>
    </>
  );
}
