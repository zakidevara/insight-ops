import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../api/chat';
import { getLlmSettings, setLlmProvider } from '../api/settings';

function BotAvatar() {
  return (
    <div className="shrink-0 w-6 h-6 rounded-md bg-gradient-to-br from-sky-400 to-violet-500 grid place-items-center mt-0.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-950">
        <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
      </svg>
    </div>
  );
}

function Message({ msg, onSuggest }) {
  if (msg.role === 'user') {
    return (
      <div className="flex justify-end">
        <div className="max-w-[80%] bg-sky-500/15 ring-1 ring-sky-500/25 text-zinc-100 text-[12.5px]
                        rounded-lg rounded-tr-sm px-3 py-2 leading-relaxed">
          {msg.content}
        </div>
      </div>
    );
  }
  return (
    <div className="flex items-start gap-2.5">
      <BotAvatar/>
      <div className="flex-1 min-w-0">
        <div className="bg-white/[0.04] rounded-lg rounded-tl-sm px-3 py-2.5 text-[12.5px] text-zinc-200 leading-relaxed whitespace-pre-wrap">
          {msg.content}
        </div>
        {msg.suggested && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {msg.suggested.map(s => (
              <button key={s} onClick={() => onSuggest(s)}
                className="text-[10.5px] px-2 h-6 rounded-full bg-white/[0.03] hover:bg-sky-500/15
                           ring-1 ring-white/[0.06] hover:ring-sky-500/30 text-zinc-300 hover:text-sky-200">
                {s}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const QUICK_CHIPS = [
  'What past incidents match this?',
  'Show service metrics',
  'Draft a Slack update',
];

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [provider, setProvider] = useState('OLLAMA');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    getLlmSettings().then(s => setProvider(s.provider)).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 60);
  }, [open]);

  const context = pathname === '/'
    ? 'incidents'
    : pathname.startsWith('/postmortems/')
      ? 'postmortem detail'
      : 'postmortems';

  const send = async (text) => {
    const t = (text ?? input).trim();
    if (!t || loading) return;
    const userMsg = { role: 'user', content: t };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);
    try {
      const content = await sendChatMessage(t, history);
      setHistory([...nextHistory, {
        role: 'assistant',
        content,
        suggested: ['Compare to similar postmortems', 'Pull latest metrics', 'Page on-call'],
      }]);
    } catch {
      setHistory([...nextHistory, { role: 'assistant', content: 'Sorry, I encountered an error. Please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleProviderChange = (p) => {
    setLlmProvider(p).then(() => setProvider(p)).catch(() => {});
  };

  const providerLabel = provider === 'GEMINI' ? 'Gemini · gemini-2.0-flash' : 'Ollama · qwen2.5:7b';

  return (
    <>
      {!open && (
        <button onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 pl-3 pr-3.5 h-12 rounded-full
                     bg-gradient-to-b from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500
                     text-white text-[13px] font-medium
                     shadow-[0_8px_30px_-8px_rgba(56,189,248,0.6),0_1px_0_0_rgba(255,255,255,0.2)_inset]
                     ring-1 ring-sky-400/40 transition-all">
          <span className="relative grid place-items-center w-7 h-7 rounded-full bg-white/15">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M5.6 18.4l2.8-2.8M15.6 8.4l2.8-2.8"/>
            </svg>
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-sky-600 animate-pulse"/>
          </span>
          Ask InsightOps
          <span className="text-[10px] font-mono opacity-70 ml-1">⌘ J</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-40 w-[400px] h-[560px] flex flex-col
                        rounded-xl bg-[#0c0d10] ring-1 ring-white/[0.08]
                        shadow-[0_24px_60px_-20px_rgba(0,0,0,0.8)] animate-slide-up">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 h-11 border-b border-white/[0.06] shrink-0">
            <BotAvatar/>
            <div className="leading-tight flex-1 min-w-0">
              <div className="text-[12.5px] font-medium text-zinc-100">InsightOps Copilot</div>
              <div className="text-[10px] text-zinc-500 font-mono flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"/>
                Live · grounded in {context}
              </div>
            </div>
            {/* Compact model selector */}
            <select
              value={provider}
              onChange={e => handleProviderChange(e.target.value)}
              className="h-6 px-1.5 text-[10.5px] font-mono bg-white/[0.03] ring-1 ring-white/[0.08] text-zinc-300 rounded-md outline-none"
            >
              <option value="OLLAMA">Ollama</option>
              <option value="GEMINI">Gemini</option>
            </select>
            <button onClick={() => setOpen(false)} className="text-zinc-500 hover:text-zinc-200 px-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 6l12 12M18 6L6 18"/>
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 min-h-0">
            {history.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-zinc-500 text-sm">Ask about incidents, postmortems, or metrics</p>
              </div>
            )}
            {history.map((m, i) => <Message key={i} msg={m} onSuggest={send}/>)}
            {loading && (
              <div className="flex items-start gap-2.5">
                <BotAvatar/>
                <div className="bg-white/[0.04] rounded-lg rounded-tl-sm px-3 py-2.5 flex items-center gap-2">
                  <div className="flex gap-1">
                    {[0, 0.15, 0.3].map(d => (
                      <span key={d} className="w-1.5 h-1.5 bg-sky-300 rounded-full animate-bounce" style={{ animationDelay: `${d}s` }}/>
                    ))}
                  </div>
                  <span className="text-[11.5px] text-zinc-500 font-mono">searching postmortems…</span>
                </div>
              </div>
            )}
            <div ref={bottomRef}/>
          </div>

          {/* Quick chips */}
          <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
            {QUICK_CHIPS.map(s => (
              <button key={s} onClick={() => send(s)}
                className="px-2.5 h-6 rounded-full bg-white/[0.03] hover:bg-white/[0.06] ring-1 ring-white/[0.06]
                           text-[11px] text-zinc-300 transition-colors">
                {s}
              </button>
            ))}
          </div>

          {/* Composer */}
          <form onSubmit={(e) => { e.preventDefault(); send(); }}
                className="p-3 pt-2 border-t border-white/[0.06] shrink-0">
            <div className="flex items-end gap-2 bg-white/[0.03] rounded-lg ring-1 ring-white/[0.06] focus-within:ring-sky-400/40 px-2 py-1.5">
              <textarea
                ref={inputRef}
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }}}
                placeholder="Ask about incidents, runbooks, metrics…"
                disabled={loading}
                className="flex-1 bg-transparent text-[12.5px] text-zinc-100 placeholder-zinc-500
                           outline-none resize-none px-1 py-1 leading-relaxed max-h-32 disabled:opacity-50"
              />
              <button type="submit" disabled={!input.trim() || loading}
                className="shrink-0 h-7 w-7 grid place-items-center rounded-md
                           bg-sky-500 hover:bg-sky-400 disabled:opacity-30 disabled:cursor-not-allowed text-white">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2 11 13"/><path d="M22 2l-7 20-4-9-9-4 20-7z"/>
                </svg>
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between text-[10px] text-zinc-600 font-mono px-1">
              <span>↵ send · ⇧↵ newline</span>
              <span>via {providerLabel}</span>
            </div>
          </form>
        </div>
      )}
    </>
  );
}
