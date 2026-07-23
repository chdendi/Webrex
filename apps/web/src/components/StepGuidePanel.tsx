import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    documentPictureInPicture?: {
      requestWindow(options: { width: number; height: number }): Promise<Window>;
    };
    __webrexOpenGuide?: boolean;
    __webrexOpenGuideFn?: () => void;
    __webrexPiPWindow?: Window;
  }
}

interface Props {
  steps: string[];
  stepTitle: string;
  lessonId: string;
  stepSlug: string;
  externalSite?: string;
  nextStepHref?: string;
}

function getStorageKey(lessonId: string, stepSlug: string): string {
  return `webrex_guide_${lessonId}_${stepSlug}`;
}

function loadCompleted(lessonId: string, stepSlug: string): Set<number> {
  try {
    const raw = localStorage.getItem(getStorageKey(lessonId, stepSlug));
    if (raw) return new Set(JSON.parse(raw));
  } catch {
    /* ignore */
  }
  return new Set();
}

function saveCompleted(lessonId: string, stepSlug: string, completed: Set<number>) {
  localStorage.setItem(getStorageKey(lessonId, stepSlug), JSON.stringify([...completed]));
}

function stripInlineMarkdown(text: string): string {
  const escaped = text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return escaped
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/__([^_]+)__/g, '<strong>$1</strong>');
}

function renderMarkdown(text: string): string {
  const blocks: string[] = [];
  const lines = text.split('\n');
  let i = 0;

  while (i < lines.length) {
    // Detect table: lines start with |
    if (lines[i].startsWith('|') && i + 1 < lines.length && /^\|[\s\-:]+(\|[\s\-:]+)*\|$/.test(lines[i + 1])) {
      const headerLine = lines[i];
      i++; // skip separator
      i++; // move to first data row
      const bodyLines: string[] = [];
      while (i < lines.length && lines[i].startsWith('|')) {
        bodyLines.push(lines[i]);
        i++;
      }

      const headers = headerLine
        .split('|')
        .filter((c) => c.trim())
        .map((c) => `<th>${stripInlineMarkdown(c.trim())}</th>`)
        .join('');
      const rows = bodyLines
        .map(
          (row) =>
            `<tr>${row
              .split('|')
              .filter((c) => c.trim())
              .map((c) => `<td>${stripInlineMarkdown(c.trim())}</td>`)
              .join('')}</tr>`,
        )
        .join('');

      blocks.push(`<table class="md-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`);
    } else {
      if (lines[i]) {
        blocks.push(stripInlineMarkdown(lines[i]));
      } else {
        blocks.push('');
      }
      i++;
    }
  }

  return blocks.join('<br>');
}

function findCurrentIndex(steps: string[], completed: Set<number>): number {
  for (let i = 0; i < steps.length; i++) {
    if (!completed.has(i)) return i;
  }
  return steps.length;
}

function buildGuideDocument(
  steps: string[],
  completed: Set<number>,
  stepTitle: string,
  externalSite: string | undefined,
): string {
  const stepItems = steps
    .map((step, i) => {
      const isDone = completed.has(i);
      const isCurrent = findCurrentIndex(steps, completed) === i;
      let cls = 'si';
      if (isDone) cls += ' done';
      if (isCurrent) cls += ' cur';

      return `<div class="${cls}" id="step-${i}">
      <button class="sn" onclick="toggle(${i})">${isDone ? '✓' : i + 1}</button>
      <div class="st">${renderMarkdown(step)}</div>
    </div>`;
    })
    .join('');

  const currentIdx = findCurrentIndex(steps, completed);
  const allDone = completed.size >= steps.length;
  const progressPct = steps.length > 0 ? Math.round((completed.size / steps.length) * 100) : 0;

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1.0">
<title>Step Guide</title>
<style>
  :root { --bg:#F5F5F7;--surf:#FFFFFF;--smut:#F0F0F3;--bord:#E5E5EA;--txt:#1D1D1F;--tmut:#86868B;--tfnt:#AEAEB2;--acc:#0071E3;--asft:#E8F0FE;--ok:#34C759; }
  * { box-sizing:border-box;margin:0;padding:0; }
  body { font-family:-apple-system,BlinkMacSystemFont,"SF Pro Display","Inter",system-ui,sans-serif;background:var(--bg);color:var(--txt);font-size:14px;line-height:1.5;padding:14px 16px;-webkit-font-smoothing:antialiased;user-select:none; }
  .hd { display:flex;align-items:center;justify-content:space-between;margin-bottom:8px; }
  .hd h2 { font-size:15px;font-weight:600; }
  .badge { font-size:10px;padding:2px 8px;border-radius:10px;background:var(--asft);color:var(--acc); }
  .prog { display:flex;align-items:center;gap:8px;margin-bottom:10px; }
  .prog-bar { flex:1;height:4px;border-radius:2px;background:var(--smut);overflow:hidden; }
  .prog-fill { height:100%;border-radius:2px;background:var(--acc);transition:width .25s; }
  .prog-txt { font-size:11px;color:var(--tmut); }
  .list { display:flex;flex-direction:column;gap:6px;margin-bottom:12px;max-height:320px;overflow-y:auto; }
  .si { display:flex;align-items:flex-start;gap:8px;padding:9px 10px;border-radius:8px;border:1px solid var(--bord);background:var(--surf);transition:all .15s; }
  .si.done { opacity:.45;background:var(--smut); }
  .si.done .st { text-decoration:line-through; }
  .si.cur { border-color:var(--acc);background:var(--asft); }
  .sn { flex-shrink:0;width:22px;height:22px;border-radius:50%;border:1.5px solid var(--bord);display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:600;background:var(--surf);color:var(--tmut);cursor:pointer;transition:all .15s; }
  .si.cur .sn { border-color:var(--acc);color:var(--acc); }
  .si.done .sn { background:var(--ok);border-color:var(--ok);color:#fff; }
  .st { flex:1;font-size:12.5px;line-height:1.55;padding-top:1px; }
  .st code { font-size:11px;padding:1px 5px;border-radius:4px;background:var(--smut);color:var(--acc);font-family:monospace; }
  .st strong { font-weight:600; }
  .act { display:flex;gap:8px;align-items:center; }
  .btn { padding:7px 14px;border-radius:8px;font-size:12.5px;font-weight:500;border:1px solid var(--bord);background:var(--surf);color:var(--txt);cursor:pointer;transition:all .15s;font-family:inherit; }
  .btn:hover { background:var(--smut); }
  .btn:disabled { opacity:.3;cursor:default; }
  .btn.pri { background:var(--acc);color:#fff;border-color:var(--acc); }
  .btn.ok { background:var(--ok);color:#fff;border-color:var(--ok); }
  .sep { height:1px;background:var(--bord);margin:10px 0; }
  .tip { font-size:11px;color:var(--tfnt);text-align:center; }
  .md-table { width:100%;border-collapse:collapse;margin:4px 0 8px;font-size:11px; }
  .md-table th,.md-table td { padding:4px 6px;border:1px solid var(--bord);text-align:left;vertical-align:top; }
  .md-table th { background:var(--smut);font-weight:600;color:var(--tmut); }
  .md-table td { color:var(--txt); }
</style>
</head>
<body>
<div class="hd">
  <h2>📋 ${stepTitle.replace(/</g, '&lt;')}</h2>
  ${externalSite ? `<span class="badge">🌐 ${externalSite}</span>` : ''}
</div>
<div class="prog">
  <div class="prog-bar"><div class="prog-fill" style="width:${progressPct}%"></div></div>
  <span class="prog-txt">${completed.size}/${steps.length}</span>
</div>
<div class="list">${stepItems}</div>
${allDone ? '<div style="text-align:center;margin-bottom:12px;font-size:13px;color:var(--ok);font-weight:500;">🎉 All steps completed!</div>' : ''}
<div class="act">
  <button class="btn" onclick="prev()" ${currentIdx === 0 ? 'disabled' : ''}>← Prev</button>
  <div style="flex:1"></div>
  ${
    allDone
      ? '<button class="btn ok" onclick="closeWin()">Done</button>'
      : '<button class="btn pri" onclick="done()">I am done \u2192</button>'
  }
</div>
<div class="sep"></div>
<div class="tip">Press Esc or close window to return</div>
<script>
  var completed = new Set(${JSON.stringify([...completed])});
  var stepCount = ${steps.length};
  var ch = new BroadcastChannel('webrex-guide');

  function send(msg) {
    ch.postMessage(Object.assign({source:'webrex-popup-guide'}, msg));
  }

  function toggle(i) {
    if (completed.has(i)) { completed.delete(i); send({type:'step-uncomplete',index:i}); }
    else { completed.add(i); send({type:'step-complete',index:i}); }
    render();
  }

  function done() {
    var cur = findCurrent();
    if (cur < stepCount) { completed.add(cur); send({type:'step-complete',index:cur}); render(); }
  }

  function prev() {
    var cur = findCurrent();
    if (cur > 0 && completed.has(cur - 1)) { completed.delete(cur - 1); send({type:'step-uncomplete',index:cur - 1}); render(); }
  }

  function findCurrent() {
    for (var i = 0; i < stepCount; i++) { if (!completed.has(i)) return i; }
    return stepCount;
  }

  function closeWin() { send({type:'popup-closed'}); window.close(); }

  function render() {
    var cur = findCurrent();
    var pct = Math.round((completed.size / stepCount) * 100);
    var ad = completed.size >= stepCount;
    var el = document.querySelector('.list');
    var h = '';
    for (var i = 0; i < stepCount; i++) {
      var d = completed.has(i), u = i === cur, cl = 'si';
      if (d) cl += ' done';
      if (u) cl += ' cur';
      h += '<div class="' + cl + '" id="step-' + i + '"><button class="sn" onclick="toggle(' + i + ')">' + (d ? '✓' : (i + 1)) + '</button><div class="st">' + ${JSON.stringify(steps.map(renderMarkdown))}[i] + '</div></div>';
    }
    el.innerHTML = h;
    document.querySelector('.prog-fill').style.width = pct + '%';
    document.querySelector('.prog-txt').textContent = completed.size + '/' + stepCount;
    var al = ad ? '<button class="btn ok" onclick="closeWin()">Done</button>' : '<button class="btn pri" onclick="done()">I am done \u2192</button>';
    document.querySelector('.act').innerHTML = '<button class="btn" onclick="prev()" ' + (cur === 0 ? 'disabled' : '') + '>← Prev</button><div style="flex:1"></div>' + al;
  }

  window.addEventListener('pagehide', function() { send({type:'popup-closed'}); });
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') { send({type:'popup-closed'}); window.close(); }
  });
</script>
</body></html>`;
}

export default function StepGuidePanel({ steps, stepTitle, lessonId, stepSlug, externalSite, nextStepHref }: Props) {
  const [open, setOpen] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(() => loadCompleted(lessonId, stepSlug));
  const [guideActive, setGuideActive] = useState(false);
  const guideRef = useRef<Window | null>(null);
  const completedRef = useRef(completed);

  completedRef.current = completed;

  useEffect(() => {
    saveCompleted(lessonId, stepSlug, completed);
  }, [completed, lessonId, stepSlug]);

  // Two-way sync with popup/PiP windows via BroadcastChannel
  useEffect(() => {
    const ch = new BroadcastChannel('webrex-guide');
    const handler = (e: MessageEvent) => {
      if (e.data?.source !== 'webrex-popup-guide') return;
      if (e.data.type === 'step-complete') {
        setCompleted((prev) => new Set([...prev, e.data.index]));
      } else if (e.data.type === 'step-uncomplete') {
        setCompleted((prev) => {
          const next = new Set(prev);
          next.delete(e.data.index);
          return next;
        });
      } else if (e.data.type === 'popup-closed') {
        setGuideActive(false);
        guideRef.current = null;
        if (completedRef.current.size >= steps.length && nextStepHref) {
          window.location.href = nextStepHref;
        }
      }
    };
    ch.addEventListener('message', handler);
    return () => ch.close();
  }, [nextStepHref, steps.length]);

  const writeGuideContent = useCallback(
    (win: Window) => {
      const doc = buildGuideDocument(steps, completedRef.current, stepTitle, externalSite);
      win.document.write(doc);
      win.document.close();
      guideRef.current = win;
      setGuideActive(true);
      setOpen(false);
    },
    [steps, stepTitle, externalSite],
  );

  // Try PiP (Chrome 116+), fall back to popup window
  // If the button already created a PiP window (__webrexPiPWindow), populate it
  const openGuide = useCallback(() => {
    const prePiP = window.__webrexPiPWindow;
    if (prePiP && !prePiP.closed) {
      delete window.__webrexPiPWindow;
      writeGuideContent(prePiP);
      return;
    }

    const dpip = (window as any).documentPictureInPicture;
    if (dpip?.requestWindow) {
      dpip
        .requestWindow({ width: 380, height: 480 })
        .then((pipWin: Window) => {
          writeGuideContent(pipWin);
        })
        .catch((e: unknown) => {
          console.warn('PiP failed, using popup:', e);
          const popup = window.open(
            '',
            'webrex-guide',
            `width=400,height=500,left=${screen.width - 424},top=80,resizable=yes,scrollbars=yes`,
          );
          if (popup) writeGuideContent(popup);
          else setOpen(true);
        });
    } else {
      const popup = window.open(
        '',
        'webrex-guide',
        `width=400,height=500,left=${screen.width - 424},top=80,resizable=yes,scrollbars=yes`,
      );
      if (popup) writeGuideContent(popup);
      else setOpen(true);
    }
  }, [writeGuideContent]);

  // Expose openGuide for direct call from button click (preserves trusted gesture for PiP)
  useEffect(() => {
    window.__webrexOpenGuideFn = openGuide;
    const handler = () => openGuide();
    window.addEventListener('webrex:open-guide', handler);
    if (window.__webrexOpenGuide) {
      window.__webrexOpenGuide = false;
      openGuide();
    }
    return () => {
      delete window.__webrexOpenGuideFn;
      window.removeEventListener('webrex:open-guide', handler);
    };
  }, [openGuide]);

  const markDone = useCallback((index: number) => {
    setCompleted((prev) => new Set([...prev, index]));
  }, []);

  const unmarkDone = useCallback((index: number) => {
    setCompleted((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  }, []);

  const closeGuide = useCallback(() => {
    if (guideRef.current && !guideRef.current.closed) guideRef.current.close();
    setGuideActive(false);
    guideRef.current = null;
  }, []);

  // Guide is active → compact indicator
  if (guideActive) {
    return (
      <button
        type="button"
        onClick={closeGuide}
        className="fixed bottom-28 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'var(--color-accent)',
          borderColor: 'var(--color-accent)',
          color: '#fff',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <span className="text-lg">📋</span>
        <span>Guide ← close</span>
      </button>
    );
  }

  // Closed → floating button
  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-28 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-pop)',
        }}
      >
        <span className="text-lg">📋</span>
        <span>Steps</span>
        {completed.size > 0 && (
          <span
            className="text-[11px] px-1.5 py-0.5 rounded-full font-semibold"
            style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
          >
            {completed.size}/{steps.length}
          </span>
        )}
      </button>
    );
  }

  // Inline panel
  const currentIdx = findCurrentIndex(steps, completed);

  const stepItems = steps.map((step, i) => {
    const isDone = completed.has(i);
    const isCurrent = i === currentIdx;
    const html = renderMarkdown(step);
    return (
      <button
        key={step}
        type="button"
        onClick={() => (isDone ? unmarkDone(i) : markDone(i))}
        className={[
          'flex items-start gap-2.5 p-2.5 rounded-lg border text-left transition-all',
          isCurrent ? 'ring-1' : '',
        ].join(' ')}
        style={{
          opacity: isDone ? 0.4 : 1,
          borderColor: isCurrent ? 'var(--color-accent)' : 'var(--color-border)',
          background: isCurrent ? 'var(--color-accent-soft)' : 'transparent',
        }}
      >
        <span
          className="shrink-0 w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold transition-all border"
          style={{
            background: isDone ? 'var(--color-success)' : 'var(--color-surface)',
            borderColor: isDone ? 'var(--color-success)' : isCurrent ? 'var(--color-accent)' : 'var(--color-border)',
            color: isDone ? '#fff' : isCurrent ? 'var(--color-accent)' : 'var(--color-text-faint)',
          }}
        >
          {isDone ? '✓' : i + 1}
        </span>
        <span
          className="flex-1 text-[13px] leading-relaxed pt-px"
          style={{ color: 'var(--color-text)' }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: content is lesson data
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </button>
    );
  });

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-40 cursor-default"
        style={{ background: 'rgba(0,0,0,0.12)', border: 'none' }}
        onClick={() => setOpen(false)}
        onKeyDown={(e) => {
          if (e.key === 'Escape' || e.key === 'Enter') setOpen(false);
        }}
        aria-label="Close step guide"
      />

      <aside
        className="fixed bottom-28 right-6 z-50 flex flex-col rounded-xl border shadow-2xl overflow-hidden"
        style={{
          width: 380,
          maxHeight: 'calc(100vh - 200px)',
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <style>{`@keyframes wsg-slide-up { from { opacity:0;transform:translateY(12px)scale(0.96); } to { opacity:1;transform:translateY(0)scale(1); } } .wsg-animate-in { animation:wsg-slide-up 0.18s ease-out; }`}</style>
        <header
          className="wsg-animate-in flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-base shrink-0">📋</span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }} title={stepTitle}>
              {stepTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0 ml-2">
            {externalSite && (
              <span
                className="text-[10px] px-1.5 py-0.5 rounded-full hidden sm:inline-flex"
                style={{ background: 'var(--color-accent-soft)', color: 'var(--color-accent)' }}
              >
                {externalSite}
              </span>
            )}
            <button
              type="button"
              onClick={openGuide}
              className="text-xs px-2 py-1 rounded transition-colors hover:bg-[var(--color-surface-muted)]"
              style={{ color: 'var(--color-accent)' }}
              title="Pop out as floating window"
            >
              ↗ Pop out
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-lg px-1 leading-none transition-colors hover:text-[var(--color-accent)]"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>
        <div className="px-4 py-2.5 shrink-0 flex items-center gap-2.5">
          <div
            className="flex-1 h-1.5 rounded-full overflow-hidden"
            style={{ background: 'var(--color-surface-muted)' }}
          >
            <div
              className="h-full rounded-full transition-all duration-250"
              style={{
                width: `${steps.length > 0 ? (completed.size / steps.length) * 100 : 0}%`,
                background: completed.size === steps.length ? 'var(--color-success)' : 'var(--color-accent)',
              }}
            />
          </div>
          <span className="text-[11px] font-medium shrink-0" style={{ color: 'var(--color-text-muted)' }}>
            {completed.size}/{steps.length}
          </span>
        </div>
        <div className="flex-1 overflow-y-auto px-3 pb-1 flex flex-col gap-1.5">{stepItems}</div>
        <div
          className="border-t p-3 flex items-center justify-between shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <button
            type="button"
            onClick={() => currentIdx > 0 && unmarkDone(currentIdx - 1)}
            disabled={currentIdx === 0}
            className="px-3 py-1.5 rounded-md text-xs border transition-colors disabled:opacity-25 disabled:cursor-default hover:bg-[var(--color-surface-muted)]"
            style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
          >
            ← Prev
          </button>
          {currentIdx < steps.length ? (
            <button
              type="button"
              onClick={() => markDone(currentIdx)}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: 'var(--color-accent)' }}
            >
              I'm done →
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-colors hover:opacity-90"
              style={{ background: 'var(--color-success)' }}
            >
              🎉 All done
            </button>
          )}
        </div>
      </aside>
    </>
  );
}
