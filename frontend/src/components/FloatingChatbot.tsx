'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquare, 
  X, 
  Send, 
  Loader2, 
  Bot, 
  User as UserIcon,
  Maximize2,
  Minimize2,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { financeApi } from '@/lib/api';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function FloatingChatbot() {
  const { user } = useAuth();
  const companyId = user?.company?.id;

  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hello ${user?.fullName?.split(' ')[0] || 'there'}! I'm your Flux AI assistant. How can I help you manage your enterprise risk today?`,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isTyping || !companyId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    try {
      // Use centralized financeApi as per CRITICAL RULES
      const response = await financeApi.chatWithDocuments(companyId, userMessage.content);
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.answer,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error('Chat Error:', error);
      toast.error('AI assistant is currently unavailable.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I apologize, but I encountered an error processing your request. Please try again in a moment.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="mb-4 w-[380px] sm:w-[420px] h-[580px] bg-white rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.15)] border border-slate-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-2xl flex items-center justify-center">
                  <Bot className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-sm tracking-tight">Flux AI Intelligence</h3>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Active System</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => setIsMinimized(true)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <Minimize2 className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50/30"
            >
              {messages.map((msg) => (
                <div 
                  key={msg.id}
                  className={cn(
                    "flex w-full mb-4",
                    msg.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "flex gap-3 max-w-[85%]",
                    msg.role === 'user' ? "flex-row-reverse" : "flex-row"
                  )}>
                    <div className={cn(
                      "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-1",
                      msg.role === 'user' 
                        ? "bg-white border-slate-200 text-slate-600" 
                        : "bg-indigo-600 border-indigo-500 text-white"
                    )}>
                      {msg.role === 'user' ? <UserIcon className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                    </div>
                    <div className={cn(
                      "p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                      msg.role === 'user' 
                        ? "bg-slate-900 text-white rounded-tr-none" 
                        : "bg-white border border-slate-100 text-slate-700 rounded-tl-none font-medium"
                    )}>
                      {msg.content}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start mb-4">
                  <div className="flex gap-3 max-w-[85%] flex-row">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border mt-1 bg-indigo-600 border-indigo-500 text-white">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                    <div className="bg-white border border-slate-100 text-slate-400 p-3.5 rounded-2xl rounded-tl-none text-[13px] flex items-center gap-1">
                      Thinking<span className="animate-pulse">...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <form 
              onSubmit={handleSend}
              className="p-4 bg-white border-t border-slate-100 flex items-center gap-3"
            >
              <input 
                type="text"
                placeholder="Ask Flux Intelligence..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Button / Minimized Bar */}
      <motion.button
        layout
        onClick={() => {
          if (isMinimized) setIsMinimized(false);
          else setIsOpen(!isOpen);
        }}
        className={cn(
          "bg-slate-900 text-white flex items-center gap-3 shadow-[0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_15px_40px_rgba(0,0,0,0.3)] transition-all active:scale-95 group overflow-hidden",
          isOpen && !isMinimized 
            ? "w-14 h-14 rounded-2xl bg-rose-500" 
            : isMinimized 
              ? "px-6 py-3 rounded-2xl border border-white/10"
              : "w-14 h-14 rounded-full"
        )}
      >
        <div className="flex items-center justify-center w-6 h-6 shrink-0 ml-auto mr-auto">
          {isOpen && !isMinimized ? (
            <X className="w-6 h-6" />
          ) : isMinimized ? (
            <Maximize2 className="w-5 h-5" />
          ) : (
            <MessageSquare className="w-6 h-6" />
          )}
        </div>
        {isMinimized && (
          <span className="text-sm font-black mr-2">Restore Chat</span>
        )}
        
        {!isOpen && (
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-30 blur-md group-hover:opacity-50 transition-opacity" />
        )}
      </motion.button>
    </div>
  );
}
