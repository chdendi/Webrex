import { useCallback, useEffect, useRef, useState } from 'react';

declare global {
  interface Window {
    ai?: {
      canCreateTextSession: () => Promise<'readily' | 'after-download' | 'no'>;
      createTextSession: (options?: {
        temperature?: number;
        topK?: number;
        systemPrompt?: string;
      }) => Promise<AITextSession>;
    };
  }
}

interface AITextSession {
  prompt: (text: string) => Promise<string>;
  promptStreaming?: (text: string) => AsyncIterable<string>;
  destroy: () => void;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

type Mode = 'craft' | 'quick' | 'configure';

interface Props {
  lessonId: string;
  lessonTitle: string;
  stepType: string;
  stepTitle: string;
  lessonLevel: number;
  lessonSublevel: number;
}

const STEP_LABELS: Record<string, string> = {
  concept: 'Concept',
  practice: 'Practice',
  verify: 'Verify',
  'ask-ai': 'Ask AI',
};

function formatLessonContext(props: Props): string {
  const stepLabel = STEP_LABELS[props.stepType] ?? props.stepType;
  return `I'm working through Webrex lesson L${props.lessonLevel}.${props.lessonSublevel} "${props.lessonTitle}", currently on the "${stepLabel} — ${props.stepTitle}" step.`;
}

function craftPrompt(props: Props, question: string): string {
  const ctx = formatLessonContext(props);
  return `${ctx}

My question: ${question}

Please help me as a Webrex DevTools tutor. Don't give me the answer directly — guide me to find it myself using Chrome DevTools. If relevant, suggest which DevTools panel or tab I should look at, which filters to apply, or which experiment to run.`;
}

function genId() {
  return Math.random().toString(36).slice(2, 10);
}

function encode(value: string): string {
  return btoa(value);
}

function decode(value: string): string {
  try {
    return atob(value);
  } catch {
    return value;
  }
}

function storeApiKey(key: string) {
  localStorage.setItem('webrex_ai_key', encode(key));
}

function loadApiKey(): string {
  const raw = localStorage.getItem('webrex_ai_key');
  return raw ? decode(raw) : '';
}

function scrollToBottom(el: HTMLElement | null) {
  if (el) el.scrollTop = el.scrollHeight;
}

export default function AiChatPanel(props: Props) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('craft');
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [windowAiAvailable, setWindowAiAvailable] = useState(false);
  const [apiKey, setApiKey] = useState(() => loadApiKey());
  const [apiEndpoint, setApiEndpoint] = useState(
    () => localStorage.getItem('webrex_ai_endpoint') ?? 'https://api.openai.com/v1/chat/completions',
  );
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'ok' | 'fail'>('idle');
  const msgAreaRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const streamRef = useRef<AbortController | null>(null);

  const addMessage = useCallback((role: Message['role'], content: string) => {
    setMessages((prev) => [...prev, { id: genId(), role, content }]);
  }, []);

  const updateLastAssistant = useCallback((content: string) => {
    setMessages((prev) => {
      const next = [...prev];
      const last = next[next.length - 1];
      if (last?.role === 'assistant') {
        next[next.length - 1] = { ...last, content };
      } else {
        next.push({ id: genId(), role: 'assistant', content });
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (msgAreaRef.current) scrollToBottom(msgAreaRef.current);
  }, [messages]);

  useEffect(() => {
    window.ai
      ?.canCreateTextSession()
      .then((s) => {
        setWindowAiAvailable(s === 'readily' || s === 'after-download');
      })
      .catch(() => {});
  }, []);

  const handleSendCraft = async () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');
    addMessage('user', q);
    const prompt = craftPrompt(props, q);
    addMessage('assistant', prompt);
  };

  const handleSendQuick = async () => {
    const q = input.trim();
    if (!q || streaming) return;
    setInput('');
    addMessage('user', q);
    const ctx = formatLessonContext(props);

    try {
      const session = await window.ai!.createTextSession();
      const fullPrompt = `${ctx}\n\nQuestion: ${q}`;

      if (session.promptStreaming) {
        setStreaming(true);
        const abort = new AbortController();
        streamRef.current = abort;
        let aggregated = '';
        for await (const chunk of session.promptStreaming(fullPrompt)) {
          if (abort.signal.aborted) break;
          aggregated += chunk;
          updateLastAssistant(aggregated);
        }
        setStreaming(false);
        streamRef.current = null;
      } else {
        setStreaming(true);
        const response = await session.prompt(fullPrompt);
        addMessage('assistant', response);
        setStreaming(false);
      }
      session.destroy();
    } catch (e: any) {
      addMessage('assistant', `Error: ${e.message ?? 'Failed to get AI response'}`);
      setStreaming(false);
    }
  };

  const handleStop = () => {
    streamRef.current?.abort();
    setStreaming(false);
  };

  const handleSend = () => {
    if (mode === 'craft') handleSendCraft();
    else if (mode === 'quick') handleSendQuick();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const copyAndOpen = async (provider: 'claude' | 'chatgpt' | 'copilot') => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    const text = lastAssistant.content;
    try {
      const { redact } = await import('@webrex/redact');
      const result = redact(text);
      await navigator.clipboard.writeText(result.redacted);
    } catch {
      await navigator.clipboard.writeText(text);
    }
    const urls: Record<string, string> = {
      claude: 'https://claude.ai/new',
      chatgpt: 'https://chat.openai.com/',
      copilot: 'https://github.com/copilot',
    };
    window.open(urls[provider], '_blank', 'noopener');
  };

  const handleCopyRaw = async () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    await navigator.clipboard.writeText(lastAssistant.content);
  };

  const handleRedactCopy = async () => {
    const lastAssistant = [...messages].reverse().find((m) => m.role === 'assistant');
    if (!lastAssistant) return;
    try {
      const { redact } = await import('@webrex/redact');
      const result = redact(lastAssistant.content);
      await navigator.clipboard.writeText(result.redacted);
    } catch {
      await navigator.clipboard.writeText(lastAssistant.content);
    }
  };

  const testApiConnection = async () => {
    if (!apiKey || !apiEndpoint) return;
    setApiStatus('testing');
    try {
      const res = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [{ role: 'user', content: 'ping' }],
          max_tokens: 5,
        }),
      });
      if (res.ok) {
        setApiStatus('ok');
      } else {
        const body = await res.text();
        setApiStatus('fail');
        addMessage('assistant', `API test failed: ${res.status} ${body.slice(0, 200)}`);
      }
    } catch (e: any) {
      setApiStatus('fail');
      addMessage('assistant', `Connection error: ${e.message ?? 'Unknown error'}`);
    }
  };

  const saveApiConfig = () => {
    storeApiKey(apiKey);
    localStorage.setItem('webrex_ai_endpoint', apiEndpoint);
    testApiConnection();
  };

  const clearMessages = () => setMessages([]);

  if (!open) {
    return (
      <button type="button"
        onClick={() => setOpen(true)}
        className="fixed bottom-20 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-lg border text-sm font-medium transition-all hover:scale-105 active:scale-95"
        style={{
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
          color: 'var(--color-text)',
          boxShadow: 'var(--shadow-pop)',
          animation: 'webrex-pulse 2s ease-in-out infinite',
        }}
      >
        <style>{`
          @keyframes webrex-pulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
            50% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
          }
        `}</style>
        <span className="text-lg">🤖</span>
        <span>Ask AI</span>
      </button>
    );
  }

  return (
    <>
      <div className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.2)' }} onClick={() => setOpen(false)} />

      <aside
        className="fixed bottom-20 right-6 z-50 flex flex-col rounded-xl border shadow-2xl overflow-hidden animate-slide-up"
        style={{
          width: 400,
          height: 500,
          background: 'var(--color-surface)',
          borderColor: 'var(--color-border)',
        }}
      >
        <style>{`
          @keyframes webrex-slide-up {
            from { opacity: 0; transform: translateY(16px) scale(0.96); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-slide-up {
            animation: webrex-slide-up 0.2s ease-out;
          }
        `}</style>

        {/* Header */}
        <header
          className="flex items-center justify-between px-4 py-3 border-b shrink-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-base">🤖</span>
            <span className="text-sm font-semibold truncate" style={{ color: 'var(--color-text)' }}>
              AI Assistant
            </span>
            <span
              className="text-[11px] px-1.5 py-0.5 rounded-full truncate max-w-[140px]"
              style={{
                background: 'var(--color-accent-soft)',
                color: 'var(--color-accent)',
              }}
            >
              L{props.lessonLevel}.{props.lessonSublevel}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <button type="button"
              onClick={clearMessages}
              className="text-sm px-2 py-1 rounded"
              style={{ color: 'var(--color-text-muted)' }}
              title="Clear chat"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-label="Clear chat"
              >
                <title>Clear chat</title>
                <path d="M3 6h18" />
                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
            <button type="button"
              onClick={() => setOpen(false)}
              className="text-xl px-1 leading-none"
              style={{ color: 'var(--color-text-muted)' }}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </header>

        {/* Mode tabs */}
        <div className="flex border-b shrink-0" style={{ borderColor: 'var(--color-border)' }}>
          {(['craft', 'quick', 'configure'] as Mode[]).map((m) => {
            const disabled = m === 'quick' && !windowAiAvailable;
            const label = m === 'craft' ? 'Craft Prompt' : m === 'quick' ? 'Quick Answer' : 'Configure API';
            return (
              <button type="button"
                key={m}
                onClick={() => {
                  if (!disabled) setMode(m);
                }}
                disabled={disabled}
                className="flex-1 text-xs font-medium py-2.5 transition-colors border-b-2 disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  color: mode === m ? 'var(--color-accent)' : 'var(--color-text-muted)',
                  borderColor: mode === m ? 'var(--color-accent)' : 'transparent',
                }}
                title={disabled ? 'Requires Chrome Canary with AI features enabled' : undefined}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Body */}
        {mode === 'configure' ? (
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Store your API key locally to use OpenAI-compatible endpoints. Keys are saved only in your browser.
            </p>
            <label className="flex flex-col gap-1.5">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                API Key
              </span>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                className="rounded-md border px-3 py-2 text-sm font-mono"
                style={{
                  background: 'var(--color-surface-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span
                className="text-[11px] font-semibold uppercase tracking-wider"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Endpoint URL
              </span>
              <input
                type="text"
                value={apiEndpoint}
                onChange={(e) => setApiEndpoint(e.target.value)}
                placeholder="https://api.openai.com/v1/chat/completions"
                className="rounded-md border px-3 py-2 text-sm font-mono"
                style={{
                  background: 'var(--color-surface-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
              />
            </label>
            <button type="button"
              onClick={saveApiConfig}
              disabled={apiStatus === 'testing' || !apiKey}
              className="w-full px-4 py-2.5 rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: 'var(--color-accent)' }}
            >
              {apiStatus === 'testing' ? 'Testing...' : 'Save & Test Connection'}
            </button>
            {apiStatus === 'ok' && (
              <p className="text-xs" style={{ color: 'var(--color-success)' }}>
                Connection successful
              </p>
            )}
            {apiStatus === 'fail' && (
              <p className="text-xs" style={{ color: 'var(--color-danger)' }}>
                Connection failed — check your key and endpoint
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Messages */}
            <div ref={msgAreaRef} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {messages.length === 0 && (
                <div className="flex-1 flex items-center justify-center">
                  <p className="text-sm text-center leading-relaxed" style={{ color: 'var(--color-text-faint)' }}>
                    {mode === 'craft'
                      ? "Ask a question about this lesson and I'll craft a prompt you can send to ChatGPT, Claude, or Copilot."
                      : "Ask a question and I'll answer using Chrome's built-in AI."}
                  </p>
                </div>
              )}
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className="max-w-[85%] rounded-lg px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words"
                    style={{
                      background: msg.role === 'user' ? 'var(--color-accent-soft)' : 'var(--color-surface-muted)',
                      color: 'var(--color-text)',
                      border: msg.role === 'user' ? '1px solid var(--color-accent)' : '1px solid var(--color-border)',
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}
              {messages.length > 0 &&
                mode === 'craft' &&
                [...messages].reverse().find((m) => m.role === 'assistant')?.content &&
                [...messages].reverse().find((m) => m.role === 'assistant')!.content.length > 0 && (
                  <div
                    className="flex flex-col gap-2 mt-2 pt-2 border-t"
                    style={{ borderColor: 'var(--color-border)' }}
                  >
                    <span
                      className="text-[11px] font-semibold uppercase tracking-wider"
                      style={{ color: 'var(--color-text-muted)' }}
                    >
                      Actions
                    </span>
                    <div className="flex flex-wrap gap-2">
                      <button type="button"
                        onClick={() => copyAndOpen('claude')}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        🛡 Open Claude
                      </button>
                      <button type="button"
                        onClick={() => copyAndOpen('chatgpt')}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        🛡 Open ChatGPT
                      </button>
                      <button type="button"
                        onClick={() => copyAndOpen('copilot')}
                        className="px-2.5 py-1.5 rounded-md text-xs font-medium text-white transition-colors"
                        style={{ background: 'var(--color-accent)' }}
                      >
                        🛡 Open Copilot
                      </button>
                    </div>
                    <div className="flex gap-2">
                      <button type="button"
                        onClick={handleRedactCopy}
                        className="px-2.5 py-1.5 rounded-md text-xs border transition-colors"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        🛡 Redact & Copy
                      </button>
                      <button type="button"
                        onClick={handleCopyRaw}
                        className="px-2.5 py-1.5 rounded-md text-xs border transition-colors"
                        style={{
                          borderColor: 'var(--color-border)',
                          color: 'var(--color-text-faint)',
                        }}
                        title="May contain sensitive data"
                      >
                        Copy raw
                      </button>
                    </div>
                  </div>
                )}
            </div>

            {/* Input */}
            <div className="border-t p-3 flex flex-col gap-2 shrink-0" style={{ borderColor: 'var(--color-border)' }}>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  mode === 'craft' ? "Ask a question — I'll craft a prompt..." : 'Ask a question about this lesson...'
                }
                rows={2}
                className="w-full resize-none rounded-md border px-3 py-2 text-sm leading-relaxed"
                style={{
                  background: 'var(--color-surface-muted)',
                  borderColor: 'var(--color-border)',
                  color: 'var(--color-text)',
                }}
                disabled={streaming}
              />
              <div className="flex items-center justify-between">
                <span className="text-[11px]" style={{ color: 'var(--color-text-faint)' }}>
                  {mode === 'craft' ? 'No API key needed' : 'Chrome built-in AI'}
                </span>
                <div className="flex gap-2">
                  {streaming && (
                    <button type="button"
                      onClick={handleStop}
                      className="px-3 py-1.5 rounded-md text-xs font-semibold border transition-colors"
                      style={{
                        borderColor: 'var(--color-border)',
                        color: 'var(--color-text-muted)',
                      }}
                    >
                      Stop
                    </button>
                  )}
                  <button type="button"
                    onClick={handleSend}
                    disabled={!input.trim() || streaming}
                    className="px-4 py-1.5 rounded-md text-xs font-semibold text-white transition-colors disabled:opacity-50"
                    style={{ background: 'var(--color-accent)' }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
