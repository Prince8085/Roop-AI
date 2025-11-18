
import React, { useState, useRef, useEffect } from 'react';
import { getChatResponse } from '../services/geminiService';
import { Button } from '../components/ui/Button';
import { Send, Bot, User, Sparkles, RefreshCw } from 'lucide-react';
import { ChatMessage } from '../types';

// Helper component to format text with basic markdown (bold, lists)
const FormattedText: React.FC<{ text: string }> = ({ text }) => {
    const parseBold = (str: string) => {
        const parts = str.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, idx) => {
            if (part.startsWith('**') && part.endsWith('**')) {
                return <strong key={idx} className="font-bold text-inherit">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    const sections = text.split(/\n\n+/);

    return (
        <div className="space-y-3">
            {sections.map((section, sIdx) => {
                // Handle Lists
                if (section.trim().startsWith('* ') || section.trim().startsWith('- ')) {
                    const items = section.split(/\n/).filter(line => line.trim().length > 0);
                    return (
                        <ul key={sIdx} className="list-disc list-inside space-y-1 pl-1">
                            {items.map((item, iIdx) => (
                                <li key={iIdx} className="leading-relaxed">
                                    {parseBold(item.replace(/^[\*\-]\s/, ''))}
                                </li>
                            ))}
                        </ul>
                    );
                }
                // Handle Regular Paragraphs
                return (
                    <p key={sIdx} className="leading-relaxed whitespace-pre-wrap">
                        {parseBold(section)}
                    </p>
                );
            })}
        </div>
    );
};

export const ChatBot: React.FC = () => {
    const [input, setInput] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([
        { 
            id: '1', 
            role: 'model', 
            text: "**Namaste!** 🙏 I am **RoopAI**, your personal stylist.\n\nI can help you with:\n* Trending wedding outfits 👰\n* Matching accessories 💍\n* Hair care tips 💇‍♀️\n\nWhat's on your mind today?", 
            timestamp: Date.now() 
        }
    ]);
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTo({
                top: scrollRef.current.scrollHeight,
                behavior: 'smooth'
            });
        }
    }, [messages, loading]);

    const handleSend = async () => {
        if (!input.trim()) return;
        
        const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: input, timestamp: Date.now() };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        try {
            const responseText = await getChatResponse(userMsg.text, history);
            const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: Date.now() };
            setMessages(prev => [...prev, modelMsg]);
        } catch (e) {
            console.error(e);
            const errorMsg: ChatMessage = { id: Date.now().toString(), role: 'model', text: "Oops! My connection is a bit weak right now. Please try again.", timestamp: Date.now() };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] sm:h-[600px] bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors">
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-4 flex items-center gap-3 sticky top-0 z-10 shadow-sm transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-white shadow-md">
                    <Bot size={20} />
                </div>
                <div>
                    <h2 className="font-heading font-bold text-neutral dark:text-white">AI Stylist</h2>
                    <p className="text-xs text-green-500 font-medium flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Online
                    </p>
                </div>
            </div>
            
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50/50 dark:bg-gray-900/50 scroll-smooth" ref={scrollRef}>
                {messages.map((msg) => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        
                        {/* Avatar for Model */}
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-primary dark:text-primary-300 shrink-0 shadow-sm mt-1">
                                <Sparkles size={14} />
                            </div>
                        )}

                        <div className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl shadow-sm text-sm ${
                            msg.role === 'user' 
                                ? 'bg-primary text-white rounded-tr-none shadow-primary/20' 
                                : 'bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 text-neutral dark:text-gray-100 rounded-tl-none'
                        }`}>
                            <FormattedText text={msg.text} />
                            <div className={`text-[10px] mt-2 font-medium opacity-70 text-right ${msg.role === 'user' ? 'text-white' : 'text-gray-400'}`}>
                                {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </div>
                        </div>

                        {/* Avatar for User */}
                        {msg.role === 'user' && (
                             <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-gray-500 dark:text-gray-400 shrink-0 shadow-sm mt-1">
                                <User size={14} />
                            </div>
                        )}
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-3 justify-start animate-fade-in">
                         <div className="w-8 h-8 rounded-full bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 flex items-center justify-center text-primary shrink-0 shadow-sm">
                             <RefreshCw size={14} className="animate-spin" />
                         </div>
                        <div className="bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 rounded-2xl rounded-tl-none px-4 py-3 flex gap-1 shadow-sm items-center">
                            <span className="text-xs text-gray-500 dark:text-gray-300 font-medium mr-2">Thinking</span>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}/>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}/>
                            <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}/>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 transition-colors">
                <div className="flex gap-2 relative">
                    <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for styling tips..."
                        className="flex-1 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-2xl px-5 py-3.5 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm text-neutral dark:text-white shadow-inner transition-all placeholder-gray-400"
                        disabled={loading}
                        autoFocus
                    />
                    <Button 
                        onClick={handleSend} 
                        disabled={loading || !input.trim()} 
                        className={`rounded-2xl w-12 p-0 flex items-center justify-center transition-all ${input.trim() ? 'bg-primary hover:bg-primary/90' : 'bg-gray-200 dark:bg-gray-700 text-gray-400'}`}
                    >
                        <Send size={20} className={input.trim() ? 'ml-0.5' : ''} />
                    </Button>
                </div>
                <div className="text-center mt-2">
                     <p className="text-[10px] text-gray-400 dark:text-gray-500">AI can make mistakes. Check important info.</p>
                </div>
            </div>
        </div>
    );
};
