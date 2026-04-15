import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, User, Sparkles, Coffee, Terminal, Zap } from 'lucide-react';
import { aiService } from '../services/apiCalls';

const FloatingAiChat = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [chat, setChat] = useState([
        { role: 'assistant', content: 'Operational Hello! I am your CafeFlow Neural Concierge. How can I assist with your tactical operations today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef(null);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [chat, isOpen]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!message.trim()) return;

        const userMsg = message.trim();
        setMessage('');
        setChat(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const res = await aiService.chat(userMsg);
            const aiMsg = res.data?.answer || "NEURAL LINK STABLE. SYSTEM OPERATIONAL.";
            setChat(prev => [...prev, { role: 'assistant', content: aiMsg }]);
        } catch (err) {
            setChat(prev => [...prev, { role: 'assistant', content: "Neural Interface Error. Re-broadcasting..." }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed bottom-10 right-10 z-[100]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
                        animate={{ opacity: 1, scale: 1, y: 0, filter: 'blur(0px)' }}
                        exit={{ opacity: 0, scale: 0.9, y: 50, filter: 'blur(10px)' }}
                        className="absolute bottom-24 right-0 w-[400px] h-[600px] glass-card rounded-[3rem] flex flex-col overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border-white/10"
                    >
                        {/* Chat Header */}
                        <div className="p-8 bg-gradient-to-br from-coffee-600 to-coffee-800 text-white flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md">
                                    <Bot size={24} className="text-amber-400" />
                                </div>
                                <div>
                                    <h3 className="font-black uppercase tracking-tighter italic text-lg leading-tight">Neural Concierge</h3>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase tracking-widest text-coffee-200">System: Operational Agent</span>
                                    </div>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div 
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide bg-gray-50/50 dark:bg-black/20"
                        >
                            {chat.map((msg, i) => (
                                <motion.div
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    key={i}
                                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`max-w-[85%] p-5 rounded-[2rem] text-sm leading-relaxed shadow-sm ${
                                        msg.role === 'user' 
                                        ? 'bg-coffee-600 text-white rounded-tr-none' 
                                        : 'bg-white dark:bg-gray-900 dark:text-gray-200 border border-white/40 dark:border-white/5 rounded-tl-none'
                                    }`}>
                                        <p className="font-medium tracking-tight">{msg.content}</p>
                                    </div>
                                </motion.div>
                            ))}
                            {isLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-white dark:bg-gray-900 p-5 rounded-[2rem] rounded-tl-none border border-white/40 dark:border-white/5">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-coffee-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-coffee-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-coffee-500 rounded-full animate-bounce" />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <form 
                            onSubmit={handleSend}
                            className="p-8 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-white/5"
                        >
                            <div className="relative group">
                                <input 
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Execute query..."
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-white/5 rounded-2xl px-6 py-4 pr-16 text-sm outline-none focus:border-coffee-500 transition-all dark:text-gray-200"
                                />
                                <button 
                                    type="submit"
                                    disabled={isLoading}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-coffee-600 text-white rounded-xl hover:bg-coffee-700 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Button */}
            <motion.button
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className={`h-20 w-20 rounded-[2rem] flex items-center justify-center shadow-2xl relative group overflow-hidden ${
                    isOpen ? 'bg-black text-white' : 'bg-coffee-600 text-white'
                }`}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
                {isOpen ? <X size={32} /> : <MessageSquare size={32} className="relative z-10" />}
                
                {!isOpen && (
                    <motion.div 
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full border-4 border-white dark:border-black flex items-center justify-center"
                    >
                        <Sparkles size={8} className="text-white" />
                    </motion.div>
                )}
                
                <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            </motion.button>
        </div>
    );
};

export default FloatingAiChat;
