import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Coffee, Lock, Mail, ArrowRight, ShieldCheck, Zap, Key } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.post('http://localhost:8080/user/login', {
        email,
        password
      });
      const data = response.data;
      if (data && data.token) {
        localStorage.setItem('token', data.token);
      } else if (typeof data === 'string' && data !== 'Bad Credentials') {
        localStorage.setItem('token', data);
      }
      toast.success('Clearance Granted: Welcome to CafeFlow');
      navigate('/');
    } catch (err) {
      toast.error('Identity Conflict: Authorization Denied');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Immersive Background Elements */}
      <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_20%_30%,_rgba(163,128,104,0.15)_0%,_transparent_50%)]" />
          <div className="absolute bottom-0 right-0 w-full h-full bg-[radial-gradient(circle_at_80%_70%,_rgba(163,128,104,0.1)_0%,_transparent_50%)]" />
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-[1200px] grid grid-cols-1 lg:grid-cols-2 glass-card rounded-[4rem] overflow-hidden shadow-[0_50px_100px_rgba(0,0,0,0.5)] border border-white/5 relative z-10"
      >
        {/* Visual Brand Side */}
        <div className="hidden lg:flex flex-col justify-between p-20 bg-gradient-to-br from-coffee-600 to-coffee-900 text-white relative">
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
            
            <div className="relative z-10">
                <div className="flex items-center gap-3 mb-12">
                   <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Coffee size={28} />
                   </div>
                   <span className="text-xl font-black uppercase tracking-[0.4em] italic text-coffee-100">CafeFlow</span>
                </div>
                
                <h1 className="text-8xl font-black uppercase tracking-tighter italic leading-[0.85] mb-8">
                    Tactical <br /> <span className="text-amber-400">Hub</span>
                </h1>
                <p className="text-coffee-200 text-lg max-w-md font-medium leading-relaxed opacity-80">
                    The epicenter of your operational ecosystem. High-performance retail management synthesized into a single interface.
                </p>
            </div>

            <div className="relative z-10 flex items-center gap-8">
                <div className="flex -space-x-4">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-4 border-coffee-800 bg-coffee-100/20 backdrop-blur-sm flex items-center justify-center font-black text-xs">
                            {String.fromCharCode(64+i)}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest text-coffee-300">Over 40 Active Terminals Deployed</p>
            </div>
        </div>

        {/* Authorization Form Side */}
        <div className="p-12 lg:p-24 bg-white/5 dark:bg-black/40 backdrop-blur-3xl flex flex-col justify-center">
            <div className="mb-12">
                <div className="inline-flex items-center gap-2 bg-coffee-600/10 px-4 py-2 rounded-full mb-6 border border-coffee-500/20">
                    <Zap size={14} className="text-coffee-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-coffee-500">System Gateway</span>
                </div>
                <h2 className="text-4xl font-black dark:text-white uppercase tracking-tighter italic mb-4">Authorize <span className="text-coffee-500">Access</span></h2>
                <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">Verify personnel credentials to enter hub</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-8">
                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-2">Security Identifier (Email)</label>
                    <div className="relative group">
                        <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-coffee-500 transition-colors" size={20} />
                        <input
                            type="email"
                            required
                            className="w-full pl-16 pr-8 py-5 glass-card bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-black transition-all border border-transparent focus:border-coffee-500/30"
                            placeholder="OPERATOR@CAFEFLOW.COM"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] pl-2">Access Token (Password)</label>
                    <div className="relative group">
                        <Key className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-coffee-500 transition-colors" size={20} />
                        <input
                            type="password"
                            required
                            className="w-full pl-16 pr-8 py-5 glass-card bg-gray-50 dark:bg-gray-900/40 rounded-[2.5rem] outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-black transition-all border border-transparent focus:border-coffee-500/30"
                            placeholder="••••••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="group w-full premium-gradient text-white py-6 rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-coffee-900/40 active:scale-[0.98] transition-all disabled:opacity-50 relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        <span className="flex items-center justify-center gap-4 relative z-10 text-sm">
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-t-white border-white/20 rounded-full animate-spin"></div>
                            ) : (
                                <>
                                    <span>Enter Terminal</span>
                                    <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
                                </>
                            )}
                        </span>
                    </button>
                    
                    <div className="mt-8 flex items-center justify-center gap-3 text-gray-500">
                        <ShieldCheck size={16} />
                        <span className="text-[8px] font-black uppercase tracking-[0.3em]">End-to-End Encryption Protocol Active</span>
                    </div>
                </div>
            </form>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
