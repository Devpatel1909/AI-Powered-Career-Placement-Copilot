import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Bot, User, Database, Sparkles, BookOpen } from 'lucide-react';
import { apiService } from '../services/api';
import { usePersistedState } from '../utils/persistedState';

export default function ChatbotView() {
  const [messages, setMessages] = usePersistedState('career_app_chat_messages', [
    {
      role: 'assistant',
      content: 'Hello! I am your AI Placement & Career Copilot. Ask me anything about resume tips, placement interview prep, learning paths, or technical questions!'
    }
  ]);
  const [input, setInput] = useState('');
  const [useRag, setUseRag] = usePersistedState('career_app_chat_use_rag', false);
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
          <h2 className="flex items-center gap-2 text-2xl font-bold text-white-400">
            <MessageSquare className="w-6 h-6 text-blue-400" /> Module 6: Conversational AI Career Chatbot
          </h2>
          <p className="mt-1 text-xs text-white-400">
            Contextual memory, windowing management, and optional RAG vector citations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 cursor-pointer bg-gray-900/80 px-3 py-1.5 rounded-xl border border-gray-800 text-xs">
            <input 
              type="checkbox" 
              checked={useRag} 
              onChange={(e) => setUseRag(e.target.checked)}
              className="rounded accent-blue-500" 
            />
            <Database className="w-3.5 h-3.5 text-amber-400" /> Enable ChromaDB RAG Citations
          </label>
        </div>
      </div>

      {/* Chat Conversation Box */}
      <div className="flex-1 p-6 space-y-4 overflow-y-auto border border-gray-800 glass-card rounded-2xl">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && (
              <div className="flex items-center justify-center w-8 h-8 border rounded-xl bg-blue-600/20 border-blue-500/30 shrink-0">
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
                <div className="pt-2 space-y-1 border-t border-gray-800/80">
                  <p className="text-[10px] font-bold text-amber-400 uppercase flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Knowledge Base Citations
                  </p>
                  {msg.citations.map((c, cIdx) => (
                    <div key={cIdx} className="p-2 bg-gray-950/60 rounded border border-gray-800 text-[11px] text-white-400">
                      <span className="font-semibold text-gray-300">[{c.source}]:</span> {c.snippet}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {msg.role === 'user' && (
              <div className="flex items-center justify-center w-8 h-8 border rounded-xl bg-purple-600/20 border-purple-500/30 shrink-0">
                <User className="w-4 h-4 text-purple-400" />
              </div>
            )}
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-3 text-xs text-white-400animate-pulse">
            <Bot className="w-4 h-4 text-blue-400" /> DeepSeek is thinking...
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="flex gap-3 shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask placement questions, e.g. 'How do I explain microservices in an interview?'"
          className="flex-1 px-4 py-3 text-sm bordeblatext-white-400-gray-700 bg-grblay-900 text- rounded-xl focus:outline-none focus:border-blue-500"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white transition-all bg-blue-600 shadow-lg hover:bg-blue-500 rounded-xl shadow-blue-600/30"
        >
          <Send className="w-4 h-4" /> Send
        </button>
      </form>
    </div>
  );
}
