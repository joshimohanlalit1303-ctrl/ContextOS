'use client';

import { useChat } from 'ai/react';
import { Send, Bot, User } from 'lucide-react';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto p-4 sm:p-6 bg-white text-gray-900">
      <header className="py-4 border-b border-gray-100 flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Libro Chat Starter</h1>
          <p className="text-sm text-gray-500">A chatbot with infinite memory using the Libro SDK.</p>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto space-y-6 py-4 pr-2 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-400 mt-20">
            <Bot className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Say hello! Tell the bot your name or your favorite color.</p>
            <p className="text-xs mt-2">Libro will seamlessly extract and remember it.</p>
          </div>
        )}
        
        {messages.map(m => (
          <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {m.role === 'assistant' && (
              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div className={`px-4 py-3 rounded-2xl max-w-[85%] ${m.role === 'user' ? 'bg-black text-white rounded-br-none' : 'bg-gray-100 text-gray-900 rounded-bl-none'}`}>
              {m.content}
            </div>
            {m.role === 'user' && (
              <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 justify-start">
             <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                <Bot size={16} />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-gray-100 text-gray-500 rounded-bl-none animate-pulse">
                Thinking...
              </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="pt-4 border-t border-gray-100">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <input
            className="w-full px-5 py-4 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-black/5 pr-14"
            value={input}
            placeholder="Type a message..."
            onChange={handleInputChange}
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !input.trim()}
            className="absolute right-2 p-2 bg-black text-white rounded-full hover:bg-gray-800 disabled:opacity-50 transition-colors"
          >
            <Send size={18} />
          </button>
        </form>
      </footer>
    </div>
  );
}
