import { useState, useEffect } from 'react';
import { ShoppingCart, Search, Receipt, Plus, Minus, Trash2, Printer, Zap, Sparkles, User, Phone, Mail, ArrowRight, CreditCard, Wallet, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { productService, billService, categoryService } from '../services/apiCalls';

const Billing = () => {
  const [menu, setMenu] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    Promise.all([productService.getAll(), categoryService.getAll()])
      .then(([prodRes, catRes]) => {
        const available = prodRes.data.filter(p => p.status === 'true' || p.status === true);
        setMenu(available);
        setCategories(['All', ...catRes.data.map(c => c.name)]);
      })
      .catch(() => toast.error('POS System Error: Data Sync Failure'));
  }, []);

  const addToCart = async (product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
    
    setIsAiLoading(true);
    try {
        const res = await aiService.getRecommendations(product.name);
        setSuggestions(res.data?.recommendations || []);
    } catch (e) {
        console.warn("AI Engine initializing pairing data...");
    } finally {
        setIsAiLoading(false);
    }
    
    toast.success(`${product.name} deployed to cart`, { duration: 1000, position: 'bottom-center' });
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : item;
        }
        return item;
      })
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const tax = subtotal * 0.05; // 5% Special Service Tax
  const total = subtotal + tax;

  const handleCheckout = async () => {
    if (cart.length === 0) return toast.error('Terminal Error: No items detected');
    if (!customerInfo.name || !customerInfo.phone) {
      return toast.error('Authority Required: Personnel details missing');
    }
    
    setIsProcessing(true);
    try {
      const payload = {
        name: customerInfo.name.trim(),
        email: (customerInfo.email || 'guest@cafeflow.com').trim(),
        contactNumber: customerInfo.phone.trim(),
        paymentMethod: paymentMethod,
        isGenerate: true,
        items: cart.map(c => ({
          productId: c.id,
          name: c.name,
          price: c.price,
          quantity: c.quantity,
          total: c.quantity * c.price
        }))
      };
      
      const response = await billService.generateReport(payload);
      const message = response.data?.message || "";
      const entryId = message.split('ID :')[1]?.trim();
      
      toast.success('Transaction Finalized', {
        style: { borderRadius: '20px', background: '#1a1a1a', color: '#fff', border: '1px solid #a38068' }
      });
      
      if (entryId) downloadPdf(entryId);
      
      setCart([]);
      setCustomerInfo({ name: '', email: '', phone: '' });
      setPaymentMethod('Cash');
    } catch (err) {
      toast.error('System Failure: Transaction aborted');
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadPdf = async (uuid) => {
    try {
      const res = await billService.getPdf(uuid);
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Receipt_${uuid}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (e) {
      toast.error('Receipt Retrieval Failed');
    }
  };

  const filteredMenu = menu.filter((item) => {
    const matchesSearch = item.name?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.categoryName === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="flex flex-col xl:flex-row gap-8 h-full xl:h-[calc(100vh-10rem)] overflow-y-auto xl:overflow-hidden pb-10 xl:pb-0">
      {/* Transaction Deployment Zone (Left) */}
      <div className="flex-1 flex flex-col space-y-8 overflow-hidden">
        {/* Advanced Top Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="relative group flex-1">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-coffee-600 transition-colors" size={20} />
                <input
                  type="text"
                  placeholder="Identify item code or label..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-5 glass-card bg-white/20 dark:bg-gray-900/40 rounded-[2rem] outline-none focus:ring-2 focus:ring-coffee-500/20 transition-all font-black"
                />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none px-1">
                 {categories.map(cat => (
                   <button
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap transition-all ${
                       selectedCategory === cat 
                       ? 'bg-coffee-600 text-white shadow-xl shadow-coffee-600/30' 
                       : 'glass-card bg-white/40 dark:bg-gray-900/40 text-gray-500 hover:text-coffee-600 dark:hover:text-amber-400'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
            </div>
        </div>

        {/* Global Catalog Grid */}
        <div className="flex-1 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-coffee-200">
           <AnimatePresence mode="popLayout">
              <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
                {filteredMenu.map((product) => (
                  <motion.div
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    whileHover={{ y: -8 }}
                    key={product.id}
                    onClick={() => addToCart(product)}
                    className="glass-card group p-8 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between hover:border-coffee-500/40 transition-all cursor-pointer h-[240px]"
                  >
                    <div className="absolute -right-6 -top-6 bg-coffee-500/5 group-hover:bg-coffee-500/10 w-24 h-24 rounded-full blur-2xl transition-all" />
                    
                    <div className="flex justify-between items-start relative z-10">
                        <div className="p-3 bg-coffee-100 dark:bg-amber-900/20 rounded-2xl text-coffee-700 dark:text-amber-400">
                           <Zap size={20} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">
                            ID/A-0{product.id}
                        </span>
                    </div>

                    <div className="relative z-10 mt-6">
                        <h3 className="text-xl font-black dark:text-white uppercase tracking-tighter leading-none mb-1 group-hover:text-coffee-600 transition-colors">{product.name}</h3>
                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest truncate">{product.categoryName || 'General Dept'}</p>
                    </div>

                    <div className="pt-6 flex items-center justify-between relative z-10">
                        <div className="flex flex-col">
                            <span className="text-2xl font-black dark:text-white tracking-tighter">₹{product.price}</span>
                            <span className="text-[8px] font-black text-green-500 uppercase tracking-widest">In Inventory</span>
                        </div>
                        <div className="p-3 bg-coffee-600 text-white rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all">
                            <Plus size={16} />
                        </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
           </AnimatePresence>
        </div>
      </div>

      {/* Operational Terminal Sidebar (Right) */}
      <div className="w-full xl:w-[450px] flex flex-col gap-6 h-full xl:h-full overflow-hidden">
        {/* Personnel Identification */}
        <div className="glass-card rounded-[3rem] p-10 space-y-8 relative overflow-hidden bg-gradient-to-br from-white/80 to-coffee-50/10 dark:from-gray-900/50 dark:to-gray-950/20">
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-4 bg-coffee-600 text-white rounded-[1.5rem] shadow-xl shadow-coffee-600/20">
              <User size={24} />
            </div>
            <div>
                <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic">Personnel Detail</h2>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Required for receipt generation</p>
            </div>
          </div>

          <div className="space-y-6 relative z-10">
             <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Full Name</label>
                    <input type="text" placeholder="John Doe" className="w-full px-6 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" value={customerInfo.name} onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Direct Line</label>
                    <input type="text" placeholder="+91..." className="w-full px-6 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" value={customerInfo.phone} onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})} />
                </div>
             </div>
             <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-[0.2em] pl-1">Electronic Mail (Optional)</label>
                <input type="email" placeholder="client@domain.com" className="w-full px-6 py-4 bg-white/50 dark:bg-gray-800/50 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" value={customerInfo.email} onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})} />
             </div>
          </div>
        </div>

        {/* Dynamic Cart Ledger */}
        <div className="flex-1 glass-card rounded-[3rem] p-8 flex flex-col overflow-hidden relative border-t-4 border-coffee-600/20">
           <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-3">
                <ShoppingCart className="text-coffee-600" size={28} /> Ledger <span className="text-gray-400">/ Stream</span>
              </h3>
              <div className="flex items-center gap-2 bg-coffee-100 dark:bg-amber-900/20 px-4 py-2 rounded-xl">
                 <Clock size={14} className="text-coffee-600" />
                <span className="text-[10px] font-black text-coffee-600 uppercase tracking-widest">{cart.length} SKUs</span>
              </div>
           </div>

           {/* Move AI suggestions here to avoid bloating the bottom area */}
           <AnimatePresence>
              {suggestions.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                  className="mb-6 overflow-hidden"
                >
                  <div className="p-6 bg-amber-500/5 rounded-3xl border border-amber-500/10">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles size={12} className="text-amber-500" />
                      <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Smart Pairing Suggestion</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.map((s, i) => (
                        <button 
                          key={i}
                          onClick={() => {
                            const p = menu.find(item => item.name.toLowerCase().includes(s.toLowerCase()));
                            if (p) addToCart(p);
                          }}
                          className="px-3 py-1.5 bg-white dark:bg-gray-900 border border-amber-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-coffee-600 hover:text-white transition-all shadow-sm"
                        >
                          + {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>

           <div className="flex-1 overflow-y-auto pr-3 space-y-3 custom-scrollbar relative">
              <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 5px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(163, 128, 104, 0.3); border-radius: 10px; }
              `}</style>
              <AnimatePresence mode="popLayout">
                {cart.length === 0 ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex flex-col items-center justify-center opacity-30 mt-20">
                    <Sparkles size={48} className="mb-4 text-coffee-600 animate-pulse" />
                    <p className="text-[10px] font-black uppercase tracking-[0.4em]">Protocol Idle</p>
                  </motion.div>
                ) : (
                  <div className="pb-32 space-y-3">
                    {cart.map((item) => (
                      <motion.div 
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        key={item.id} 
                        className="group p-4 bg-white/40 dark:bg-gray-800/20 rounded-2xl border border-transparent hover:border-coffee-500/20 transition-all flex items-center justify-between mb-2"
                      >
                      <div className="flex-1">
                        <h4 className="font-black text-gray-800 dark:text-white text-[12px] uppercase tracking-tighter line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-coffee-600 text-[9px] font-black uppercase tracking-widest">₹{item.price}</span>
                            <div className="w-0.5 h-0.5 bg-gray-400 rounded-full" />
                            <span className="text-gray-500 text-[9px] font-bold uppercase tracking-widest">₹{item.price * item.quantity}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 bg-white/60 dark:bg-gray-800/40 p-1.5 rounded-xl">
                        <button onClick={() => updateQuantity(item.id, -1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-coffee-600 transition-all">
                          <Minus size={12} />
                        </button>
                        <span className="w-3 text-center text-[12px] font-black dark:text-white">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="p-1.5 hover:bg-white dark:hover:bg-gray-700 rounded-lg text-gray-400 hover:text-coffee-600 transition-all">
                          <Plus size={12} />
                        </button>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="ml-3 p-2 bg-red-500/5 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-all">
                        <Trash2 size={16} />
                      </button>
                    </motion.div>
                  ))}
                  </div>
                )}
              </AnimatePresence>
           </div>

           {/* Economic Protocol Calculation */}
           <div className="mt-auto pt-8 border-t border-gray-100 dark:border-gray-800 space-y-6 bg-white dark:bg-[#0c0c0c] z-10 sticky bottom-0">
              <div className="space-y-2">
                <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Gross Value</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-400 text-[10px] font-black uppercase tracking-widest">
                  <span>Special Service Tax (5%)</span>
                  <span>₹{tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-900 dark:text-white text-4xl font-black pt-4 tracking-tighter italic">
                  <span>Net Capital</span>
                  <span className="text-coffee-600">₹{total.toFixed(2)}</span>
                </div>
              </div>


              <div className="grid grid-cols-2 gap-4 pt-2">
                 <button 
                    onClick={() => setPaymentMethod('Cash')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      paymentMethod === 'Cash' 
                      ? 'bg-coffee-600 text-white shadow-lg shadow-coffee-600/30' 
                      : 'bg-white/40 dark:bg-gray-800/40 text-gray-400 hover:bg-coffee-50 dark:hover:bg-gray-700'
                    }`}
                 >
                    <Wallet size={16} /> Cash
                 </button>
                 <button 
                    onClick={() => setPaymentMethod('Digital')}
                    className={`flex items-center justify-center gap-2 p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
                      paymentMethod === 'Digital' 
                      ? 'bg-coffee-600 text-white shadow-lg shadow-coffee-600/30' 
                      : 'bg-white/40 dark:bg-gray-800/40 text-gray-400 hover:bg-coffee-50 dark:hover:bg-gray-700'
                    }`}
                 >
                    <CreditCard size={16} /> Digital
                 </button>
              </div>

              <button 
                disabled={cart.length === 0 || isProcessing}
                onClick={handleCheckout}
                className="w-full premium-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.2em] shadow-[0_20px_50px_rgba(163,128,104,0.4)] active:scale-95 disabled:opacity-30 relative overflow-hidden flex items-center justify-center gap-4 group"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                {isProcessing ? (
                   <div className="w-6 h-6 border-4 border-t-white border-white/20 rounded-full animate-spin" />
                ) : (
                  <>
                    <Printer size={22} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-sm">Authorize & Print Receipt</span>
                  </>
                )}
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Billing;
