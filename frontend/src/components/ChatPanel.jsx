import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Loader2, Bot, User } from 'lucide-react';
import { sendChatMessage } from '../api/chat';

export default function ChatPanel() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = input.trim();
    if (!message || loading) return;

    const userMsg = { role: 'user', content: message };
    const nextHistory = [...history, userMsg];
    setHistory(nextHistory);
    setInput('');
    setLoading(true);

    try {
      const content = await sendChatMessage(message, history);
      setHistory([...nextHistory, { role: 'assistant', content }]);
    } catch {
      setHistory([...nextHistory, {
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.',
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      handleSubmit(e);
    }
  };

  return (
    <>
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 bg-blue-600 hover:bg-blue-500
                   text-white rounded-full w-14 h-14 flex items-center justify-center
                   shadow-lg transition-colors"
        aria-label="Open SRE Chat"
      >
        {open ? <X size={22} /> : <MessageSquare size={22} />}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-h-[70vh] flex flex-col
                        bg-gray-900 border border-gray-700 rounded-xl shadow-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-700 bg-gray-800">
            <Bot size={18} className="text-blue-400" />
            <div>
              <p className="text-sm font-semibold text-white">SRE Assistant</p>
              <p className="text-xs text-gray-400">Postmortems + Live Metrics</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
            {history.length === 0 && !loading && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">Ask me about past incidents</p>
                <p className="text-gray-600 text-xs mt-1">or request live metrics</p>
              </div>
            )}

            {history.map((msg, idx) => (
              <div key={idx} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bot size={12} className="text-blue-300" />
                  </div>
                )}
                <div className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-none'
                    : 'bg-gray-800 text-gray-200 rounded-bl-none'
                }`}>
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
                {msg.role === 'user' && (
                  <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <User size={12} className="text-gray-300" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-6 h-6 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                  <Bot size={12} className="text-blue-300" />
                </div>
                <div className="bg-gray-800 rounded-lg rounded-bl-none px-3 py-2">
                  <Loader2 size={16} className="text-blue-400 animate-spin" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 px-3 py-3 border-t border-gray-700 bg-gray-800">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about incidents or metrics…"
              rows={1}
              disabled={loading}
              className="flex-1 bg-gray-700 text-white text-sm rounded-lg px-3 py-2
                         placeholder-gray-500 border border-gray-600 focus:border-blue-500
                         focus:outline-none resize-none disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed
                         text-white rounded-lg px-3 py-2 transition-colors flex-shrink-0"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  );
}
