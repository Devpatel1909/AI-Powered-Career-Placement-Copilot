import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Database, Sparkles, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';

export default function ChatbotView() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Placement & Career Copilot. Ask me anything about resume tips, placement interview prep, learning paths, or technical questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [useRag, setUseRag] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input.trim() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      // Build history payload (excluding current query)
      const historyPayload = messages.map(m => ({ role: m.role, content: m.content }));
      const res = await apiService.sendChatMessage(userMsg.content, historyPayload, useRag);

      if (res.success) {
        setMessages([
          ...updatedMessages,
          {
            role: 'assistant',
            content: res.data.reply,
            citations: res.data.citations
          }
        ]);
      }
    } catch (err) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'Sorry, I encountered an error communicating with the AI service. Please verify server endpoints.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-2xl font-bold text-gray-100 flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-blue-400" /> Module 6: Conversational AI Career Chatbot
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Contextual memory, windowing management, and optional RAG vector citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-900/80 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
            <input 
              type="checkbox" 
              checked={useRag} 
              onChange={(e) => setUseRag(e.target.checked)}
              className="accent-blue-500 rounded" 
            />
            <Database className="w-3.5 h-3.5 text-amber-400" /> Enable ChromaDB RAG Citations
          </label>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="glass-card flex-1 p-6 rounded-2xl border border-gray-800 overflow-y-auto space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4 text-blue-400" />
              </div>
            )}

            <div className={`max-w-2xl p-4 rounded-2xl text-xs space-y-2 leading-relaxed ${
              msg.role === 'user'
                ? 'bg-blue-600 text-white rounded-br-none shadow-lg shadow-blue-600/20'
                : 'bg-gray-900/90 text-gray-200 border border-gray-800 rounded-bl-none'
            }`}>
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-gray-800/80 space-y-1">
                  <p className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Knowledge Base Citations
                  </p>
                  {msg.citations.map((c, cIdx) => (
                    <div key={cIdx} className="p-2 bg-gray-950/60 rounded border border-gray-800 text-[11px] text-gray-400">
                      <span className="font-semibold text-gray-300">[{c.source}]:</span> {c.snippet}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center shrink-0">
                <User className="w-4 h-4 text-purple-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 items-center text-xs text-gray-400 animate-pulse">
            <Bot className="w-4 h-4 text-blue-400" /> DeepSeek is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="shrink-0 flex gap-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask placement questions, e.g. 'How do I explain microservices in an interview?'"
          className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-xl text-sm text-gray-100 focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-2"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
