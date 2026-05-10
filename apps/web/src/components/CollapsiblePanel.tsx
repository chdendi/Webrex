import { type ReactNode, useCallback, useEffect, useState } from 'react';
import { useClickOutside } from '~/lib/hooks/useClickOutside';

type PresentationMode = 'collapsed' | 'inline' | 'popup';

interface Props {
  /** Button label in collapsed mode. */
  label: string;
  /** Icon in collapsed mode. */
  icon?: string;
  /** Badge count shown on the collapsed button. */
  badge?: number;
  badgeTotal?: number;
  /** Title shown in the panel header. */
  title?: string;
  /** Children rendered inside the expanded panel. */
  children: ReactNode;
  /** Called when a pop-out action is triggered. Receives a callback to
   *  write content into the popup/PiP window. */
  onPopOut?: (writeContent: (win: Window) => void) => void;
  /** Called when the popup/PiP is opened externally (e.g. by a button click
   *  that sets __webrexOpenGuide). */
  onExternalOpen?: () => void;
  /** Position class for the floating button. */
  positionClass?: string;
  /** Initially open mode. */
  initialMode?: PresentationMode;
  /** Called when mode changes. */
  onModeChange?: (mode: PresentationMode) => void;
}

/**
 * Multi-mode presentation component.
 *
 * Three modes of progressive disclosure:
 * 1. **collapsed** — a floating button with label + optional badge
 * 2. **inline** — an overlay panel with backdrop (click-outside to close)
 * 3. **popup** — delegates content to an external popup/PiP window
 *
 * Generalizes StepGuidePanel's three-level expansion pattern.
 */
export default function CollapsiblePanel({
  label,
  icon = '📋',
  badge,
  badgeTotal,
  title,
  children,
  onPopOut,
  onExternalOpen,
  positionClass = 'fixed bottom-28 right-6 z-40',
  initialMode = 'collapsed',
  onModeChange,
}: Props) {
  const [mode, setMode] = useState<PresentationMode>(initialMode);

  const setAndNotify = useCallback(
    (next: PresentationMode) => {
      setMode(next);
      onModeChange?.(next);
    },
    [onModeChange],
  );

  const backdropRef = useClickOutside(() => setAndNotify('collapsed'), mode === 'inline');

  // Support external trigger (e.g. __webrexOpenGuide)
  useEffect(() => {
    if (onExternalOpen) {
      const handler = () => onExternalOpen();
      window.addEventListener('webrex:open-panel', handler);
      return () => window.removeEventListener('webrex:open-panel', handler);
    }
  }, [onExternalOpen]);

  const handlePopOut = () => {
    if (onPopOut) {
      setAndNotify('popup');
      onPopOut((_win: Window) => {
        // Default: caller is responsible for writing content
      });
    }
  };

  // Collapsed mode — floating button
  if (mode === 'collapsed') {
    return (
      <button
        type="button"
        onClick={() => setAndNotify('inline')}
        className={`${positionClass} flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95`}
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <span className="text-lg">{icon}</span>
        <span>{label}</span>
        {badge != null && badge > 0 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
          >
            {badge}
            {badgeTotal != null ? `/${badgeTotal}` : ''}
          </span>
        )}
      </button>
    );
  }

  // Inline mode — overlay panel
  return (
    <>
      {/* Backdrop */}
      <button
        type="button"
        ref={backdropRef as React.RefObject<HTMLButtonElement>}
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: 'rgba(0,0,0,0.12)', border: 'none' }}
        onClick={() => setAndNotify('collapsed')}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') setAndNotify('collapsed');
        }}
        aria-label="Close panel"
      />

      {/* Panel */}
      <aside
        className={`${positionClass} z-50 flex flex-col rounded-xl border shadow-2xl overflow-hidden`}
        style={{
          width: 380,
          maxHeight: 'calc(100vh - 200px)',
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <style>{`@keyframes wcp-slide-up { from { opacity:0;transform:translateY(12px)scale(0.96); } to { opacity:1;transform:translateY(0)scale(1); } } .wcp-animate-in { animation:wcp-slide-up 0.18s ease-out; }`}</style>
        <header
          className="wcp-animate-in flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base shrink-0">{icon}</span>
            {title && (
              <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }} title={title}>
                {title}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {onPopOut && (
              <button
                type="button"
                onClick={handlePopOut}
                className="text-xs px-2 py-1 rounded transition-colors hover:bg-[var(--color-surface-muted)]"
                style={{ color: 'var(--color-accent)' }}
                title="Pop out as floating window"
              >
                ↗ Pop out
              </button>
            )}
            <button
              type="button"
              onClick={() => setAndNotify('collapsed')}
              className="text-lg px-1 leading-none transition-colors hover:text-[var(--color-accent)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </aside>
    </>
  );
}
