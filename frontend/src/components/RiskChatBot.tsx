'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, FileText } from 'lucide-react';
import { financeApi } from '@/lib/api';

interface Message {
    id: string;
    role: 'user' | 'agent';
    content: string;
    sources?: any[];
}

interface RiskChatBotProps {
    companyId: string;
    companyName: string;
}

export default function RiskChatBot({ companyId, companyName }: RiskChatBotProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'agent',
            content: `Hello! I am your Risk Assistant for ${companyName}. I have access to the internal documents you've uploaded. Ask me anything about ${companyName}'s risks, financials, or strategy.`
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;

        const userMsg: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input
        };

        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const response = await financeApi.chatWithDocuments(companyId, userMsg.content);
            const agentMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: response.answer,
                sources: response.sources
            };
            setMessages(prev => [...prev, agentMsg]);
        } catch (error) {
            console.error(error);
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: 'agent',
                content: "I'm sorry, I encountered an error while analyzing the documents. Please try again."
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex flex-col h-[600px] bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="bg-zinc-950 p-4 border-b border-zinc-800 flex items-center gap-3">
                <div className="bg-blue-600/20 p-2 rounded-lg">
                    <Bot className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                    <h3 className="font-semibold text-white text-sm">Risk Assistant</h3>
                    <p className="text-xs text-zinc-400">Powered by RAG & Gemini</p>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                    >
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-zinc-700' : 'bg-blue-600/20'}`}>
                            {msg.role === 'user' ? <User className="w-4 h-4 text-zinc-300" /> : <Bot className="w-4 h-4 text-blue-400" />}
                        </div>

                        <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                            <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${msg.role === 'user'
                                    ? 'bg-blue-600 text-white rounded-br-none'
                                    : 'bg-zinc-800 text-zinc-200 rounded-bl-none border border-zinc-700'
                                }`}>
                                {msg.content}
                            </div>

                            {/* Sources */}
                            {msg.sources && msg.sources.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {msg.sources.map((src, idx) => (
                                        <div key={idx} className="flex items-center gap-1 text-[10px] bg-zinc-950 border border-zinc-800 text-zinc-400 px-2 py-1 rounded-md">
                                            <FileText className="w-3 h-3" />
                                            <span className="max-w-[150px] truncate" title={src.source}>
                                                {src.source?.split('/').pop()}
                                            </span>
                                            {src.page && <span>(Pg {src.page})</span>}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/20 flex items-center justify-center shrink-0">
                            <Bot className="w-4 h-4 text-blue-400" />
                        </div>
                        <div className="bg-zinc-800 border border-zinc-700 px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
                            <span className="text-xs text-zinc-400">Reading documents...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-zinc-950 border-t border-zinc-800">
                <div className="flex gap-2 relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask about risks, metrics, or financial data..."
                        className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all placeholder:text-zinc-600"
                        disabled={loading}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-1.5 p-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
                <div className="text-center mt-2">
                    <p className="text-[10px] text-zinc-600">
                        AI can make mistakes. Please verify important information from the original documents.
                    </p>
                </div>
            </div>
        </div>
    );
}
