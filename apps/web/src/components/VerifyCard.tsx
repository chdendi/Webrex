import { useEffect, useRef, useState } from 'react';

type Tier = 'hard' | 'soft' | 'self';
type Confidence = 'high' | 'mid' | 'low' | null;

interface Props {
  tier: Tier;
  prompt?: string;
  promptHtml?: string;
  labEndpoint?: string;
  expectedRegex?: string;
  onConfidence?: (tier: string, confidence: string) => void;
}

export default function VerifyCard({ tier, prompt, promptHtml, labEndpoint, expectedRegex, onConfidence }: Props) {
  const [value, setValue] = useState('');
  const [confidence, setConfidence] = useState<Confidence>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [labStatus, setLabStatus] = useState<'idle' | 'waiting' | 'ok' | 'fail'>('idle');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState<'ok' | 'warn' | null>(null);
  const [aiFeedback, setAiFeedback] = useState<string | null>(null);
  const [showAiPanel, setShowAiPanel] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [reflection, setReflection] = useState('');
  const [animating, setAnimating] = useState(false);
  const prevConfidence = useRef(confidence);
  const hasChromeAI = typeof window !== 'undefined' && (window as any).ai?.createTextSession;

  useEffect(() => {
    if (confidence && confidence !== prevConfidence.current) {
      setAnimating(true);
      const t = setTimeout(() => setAnimating(false), 500);
      prevConfidence.current = confidence;
      return () => clearTimeout(t);
    }
  }, [confidence]);

  const emitConfidence = (conf: string) => onConfidence?.(tier, conf);

  const checkSoft = () => {
    if (!value.trim()) {
      setFeedback('Paste something first.');
      setConfidence(null);
      return;
    }
    setShowAiPanel(false);
    setAiResult(null);
    setAiFeedback(null);
    if (expectedRegex) {
      const re = new RegExp(expectedRegex, 'i');
      if (re.test(value)) {
        setConfidence('high');
        setFeedback('✅ Matched — looks like the real thing.');
        emitConfidence('high');
        return;
      }
      setConfidence('mid');
      setFeedback('🟡 Partially matched — got something, but not exactly what we expected. Re-attempt to upgrade.');
      emitConfidence('mid');
      return;
    }
    // No regex => accept any non-trivial paste with mid confidence
    const conf = value.length > 20 ? 'mid' : 'low';
    setConfidence(conf as Confidence);
    setFeedback(
      value.length > 20
        ? '🟡 Accepted with mid confidence.'
        : '🟠 Accepted with low confidence — paste more for stronger verification.',
    );
    emitConfidence(conf);
  };

  const askAI = async () => {
    setAiLoading(true);
    setShowAiPanel(true);
    setAiResult(null);
    setAiFeedback(null);
    setCopiedPrompt(false);

    const question = prompt || promptHtml?.replace(/<[^>]*>/g, '') || '';
    const aiText = `Question: ${question}\nUser's answer:\n${value}\nExpected pattern (regex): ${expectedRegex || 'none'}\n\nDoes the user's answer correctly answer the question? Reply YES or NO and briefly explain.`;

    if (hasChromeAI) {
      try {
        const session = await (window as any).ai.createTextSession();
        const result: string = await session.prompt(aiText);
        const isYes = /^\s*yes/i.test(result.slice(0, 20));
        setAiResult(isYes ? 'ok' : 'warn');
        setAiFeedback(result);
        setConfidence(isYes ? 'high' : 'mid');
        emitConfidence(isYes ? 'high' : 'mid');
      } catch {
        setAiFeedback('Chrome AI failed. Try the copy-prompt option below.');
        setAiResult(null);
      }
      setAiLoading(false);
      return;
    }

    setAiFeedback(aiText);
    setAiLoading(false);
  };

  const copyPrompt = async () => {
    if (aiFeedback) {
      await navigator.clipboard.writeText(aiFeedback);
      setCopiedPrompt(true);
      setTimeout(() => setCopiedPrompt(false), 2000);
    }
  };

  const checkHard = async () => {
    if (!labEndpoint) {
      setFeedback('Lab endpoint not configured for this lesson.');
      return;
    }
    setLabStatus('waiting');
    setFeedback('⏳ Asking the lab…');
    try {
      const res = await fetch(labEndpoint);
      const data = await res.json();
      if (data.ok) {
        setLabStatus('ok');
        setConfidence('high');
        setFeedback(`✅ Confirmed by lab: ${data.message ?? 'verified'}`);
        emitConfidence('high');
      } else {
        setLabStatus('fail');
        setFeedback(`❌ Lab says no: ${data.message ?? 'try again'}`);
        emitConfidence('low');
      }
    } catch (e) {
      setLabStatus('fail');
      setFeedback(`❌ Couldn't reach lab. Is it running on the expected port?`);
      emitConfidence('low');
    }
  };

  const acceptSelf = () => {
    setConfidence('low');
    setFeedback('Marked as self-attested (low confidence). You can re-attempt later.');
    emitConfidence('low');
  };

  const ConfidencePill = () =>
    confidence ? (
      <span
        className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium ${
          animating ? 'confidence-pop' : ''
        }`}
        style={{
          background:
            confidence === 'high'
              ? 'color-mix(in srgb, var(--color-success) 20%, transparent)'
              : confidence === 'mid'
                ? 'color-mix(in srgb, var(--color-warning) 20%, transparent)'
                : 'color-mix(in srgb, var(--color-text-faint) 20%, transparent)',
          color:
            confidence === 'high'
              ? 'var(--color-success)'
              : confidence === 'mid'
                ? 'var(--color-warning)'
                : 'var(--color-text-muted)',
        }}
      >
        {confidence === 'high' ? 'high confidence' : confidence === 'mid' ? 'mid confidence' : 'low confidence'}
      </span>
    ) : null;

  return (
    <div
      className="rounded-2xl border p-6 flex flex-col gap-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
        boxShadow: 'var(--shadow-card)',
      }}
    >
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono" style={{ color: 'var(--color-text-faint)' }}>
            ③
          </span>
          <h2 className="text-lg font-semibold" style={{ color: 'var(--color-text)' }}>
            Verify
          </h2>
          <span
            className="text-xs px-2 py-0.5 rounded border"
            style={{
              borderColor: 'var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            {tier === 'hard' ? 'hard verify' : tier === 'soft' ? 'soft verify' : 'self-check'}
          </span>
        </div>
        <ConfidencePill />
      </header>

      {promptHtml ? (
        <div
          className="prose-step text-[0.95rem] leading-relaxed"
          style={{ color: 'var(--color-text-muted)' }}
          // biome-ignore lint/security/noDangerouslySetInnerHtml: promptHtml is sanitized by marked() before rendering
          dangerouslySetInnerHTML={{ __html: promptHtml }}
        />
      ) : prompt ? (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {prompt}
        </p>
      ) : null}

      {tier === 'soft' && (
        <>
          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste your finding here…"
            className="w-full min-h-[100px] rounded-md border p-3 font-mono text-[13px] focus:outline-none focus:ring-2 transition-all resize-y"
            style={{
              background: 'var(--color-surface-muted)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              // @ts-expect-error
              '--tw-ring-color': 'var(--color-accent)',
            }}
          />
          <div className="flex justify-end gap-2 flex-wrap">
            {confidence && confidence !== 'high' && (
              <button
                type="button"
                onClick={askAI}
                disabled={aiLoading}
                className="px-4 py-2 rounded-md text-sm font-medium border transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              >
                🤖 Ask AI to verify
              </button>
            )}
            <button
              type="button"
              onClick={checkSoft}
              className="px-4 py-2 rounded-md text-sm font-medium text-white transition-colors"
              style={{ background: 'var(--color-accent)' }}
            >
              Check answer
            </button>
          </div>

          {showAiPanel && (
            <div
              className="rounded-md border p-4 flex flex-col gap-3"
              style={{
                background: 'var(--color-surface-muted)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div className="flex items-center gap-2 text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                🤖 AI Check
              </div>
              {aiLoading && (
                <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  ⏳ Asking AI…
                </p>
              )}
              {aiResult === 'ok' && (
                <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--color-success)' }}>
                  ✅ AI confirms your answer
                </div>
              )}
              {aiResult === 'warn' && (
                <div className="flex flex-col gap-1">
                  <span className="text-sm" style={{ color: 'var(--color-warning)' }}>
                    ⚠️ AI is uncertain
                  </span>
                  {aiFeedback && (
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {aiFeedback}
                    </p>
                  )}
                </div>
              )}
              {!aiLoading && !aiResult && aiFeedback && !hasChromeAI && (
                <>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    No built-in AI detected. Copy this prompt and paste into your AI:
                  </p>
                  <pre
                    className="text-xs p-2 rounded border overflow-auto max-h-32"
                    style={{
                      background: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {aiFeedback}
                  </pre>
                  <button
                    type="button"
                    onClick={copyPrompt}
                    className="px-3 py-1.5 rounded-md text-xs border self-start transition-colors"
                    style={{
                      borderColor: 'var(--color-border)',
                      color: 'var(--color-text)',
                    }}
                  >
                    {copiedPrompt ? '✓ Copied' : 'Copy & Check'}
                  </button>
                </>
              )}
            </div>
          )}
        </>
      )}

      {tier === 'hard' && (
        <>
          <div className="flex items-center gap-3 flex-wrap">
            <span
              className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${
                labStatus === 'waiting' ? 'animate-pulse' : ''
              }`}
              style={{
                background:
                  labStatus === 'ok'
                    ? 'color-mix(in srgb, var(--color-success) 20%, transparent)'
                    : labStatus === 'fail'
                      ? 'color-mix(in srgb, var(--color-danger) 20%, transparent)'
                      : 'var(--color-surface-muted)',
                color:
                  labStatus === 'ok'
                    ? 'var(--color-success)'
                    : labStatus === 'fail'
                      ? 'var(--color-danger)'
                      : 'var(--color-text-muted)',
              }}
            >
              {labStatus === 'idle' && '🟦 ready'}
              {labStatus === 'waiting' && '⏳ waiting for lab…'}
              {labStatus === 'ok' && '✅ confirmed by lab'}
              {labStatus === 'fail' && '❌ lab not satisfied'}
            </span>
            <button
              type="button"
              onClick={checkHard}
              className="px-3 py-1.5 rounded-md text-sm border transition-colors"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text)',
              }}
            >
              Check with lab
            </button>
            {labStatus === 'fail' && (
              <button
                type="button"
                onClick={checkHard}
                className="px-3 py-1.5 rounded-md text-sm border transition-colors"
                style={{
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-accent)',
                }}
              >
                Retry
              </button>
            )}
          </div>
        </>
      )}

      {tier === 'self' && (
        <>
          <label className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: 'var(--color-text)' }}>
            <input
              type="checkbox"
              onChange={(e) => (e.target.checked ? acceptSelf() : setConfidence(null))}
              className="w-4 h-4 rounded"
            />
            I observed this — mark as done (counts as low confidence)
          </label>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What did you observe? (optional)"
            className="w-full min-h-[60px] rounded-md border p-2.5 text-sm focus:outline-none focus:ring-2 transition-all resize-y"
            style={{
              background: 'var(--color-surface-muted)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              // @ts-expect-error
              '--tw-ring-color': 'var(--color-accent)',
            }}
          />
        </>
      )}

      {feedback && (
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {feedback}
        </p>
      )}
    </div>
  );
}
