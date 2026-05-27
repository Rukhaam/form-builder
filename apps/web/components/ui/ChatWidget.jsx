'use client';

import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, User, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', text: 'Hi! I am the FormBuilder AI. How can I help you design your form today?', isStreaming: false }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);


  useEffect(() => {
    if (!isOpen) return;

    const chatUrl = process.env.NEXT_PUBLIC_CHAT_URL ;
    const newSocket = io(chatUrl);

    newSocket.on('connect', () => {
      newSocket.emit('chat:join', { roomId: newSocket.id }); 
    });

    newSocket.on('chat:assistant_chunk', (data) => {
      setIsTyping(false);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant' && lastMsg.isStreaming) {
          return [
            ...prev.slice(0, -1),
            { ...lastMsg, text: lastMsg.text + data.chunk }
          ];
        } else {
          // Otherwise, start a new streaming message
          return [
            ...prev,
            { id: Date.now(), role: 'assistant', text: data.chunk, isStreaming: true }
          ];
        }
      });
    });

    newSocket.on('chat:assistant_done', () => {
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        if (lastMsg && lastMsg.role === 'assistant') {
          return [...prev.slice(0, -1), { ...lastMsg, isStreaming: false }];
        }
        return prev;
      });
    });

    newSocket.on('chat:error', (data) => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), role: 'assistant', text: `Error: ${data.error}`, isStreaming: false }
      ]);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [isOpen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputValue.trim() || !socket) return;

    const newMsg = { id: Date.now(), role: 'user', text: inputValue, isStreaming: false };
    setMessages((prev) => [...prev, newMsg]);
    setInputValue('');
    setIsTyping(true);

    socket.emit('chat:user_message', { message: newMsg.text });
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-violet-600 text-white shadow-lg shadow-violet-600/30 transition-transform hover:scale-105 hover:bg-violet-700",
          isOpen ? "hidden" : "flex"
        )}
      >
        <MessageSquare className="size-6" />
      </button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[350px] flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/70 shadow-2xl shadow-slate-200/50 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/50 bg-white/50 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-2">
                <div className="flex size-8 items-center justify-center rounded-full bg-violet-100 text-violet-600">
                  <Sparkles className="size-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">FormBuilder AI</h3>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-500">Online</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="flex size-8 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-900"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
              {messages.map((msg, idx) => (
                <div
                  key={msg.id || idx}
                  className={cn(
                    "flex w-full",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex max-w-[85%] gap-2 rounded-2xl px-4 py-3 text-sm font-medium shadow-sm",
                    msg.role === 'user' 
                      ? "bg-slate-900 text-white rounded-br-sm" 
                      : "bg-white border border-slate-100 text-slate-800 rounded-bl-sm"
                  )}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex w-full justify-start">
                  <div className="flex max-w-[85%] items-center gap-2 rounded-2xl rounded-bl-sm border border-slate-100 bg-white px-4 py-3 shadow-sm">
                    <Loader2 className="size-4 animate-spin text-violet-500" />
                    <span className="text-xs font-semibold text-slate-500">Thinking...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-white/50 bg-white/50 p-4 backdrop-blur-md">
              <form onSubmit={handleSend} className="relative flex items-center">
                <input
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ask anything..."
                  className="h-12 w-full rounded-xl border border-white/80 bg-white/80 pl-4 pr-12 text-sm font-medium text-slate-900 outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
                />
                <button
                  type="submit"
                  disabled={!inputValue.trim() || isTyping}
                  className="absolute right-2 flex size-8 items-center justify-center rounded-lg bg-violet-600 text-white transition-colors hover:bg-violet-700 disabled:opacity-50"
                >
                  <Send className="size-4" />
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}