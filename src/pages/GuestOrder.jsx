import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Plus, Minus, Coffee, Zap, Send, Table as TableIcon } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productService, categoryService, billService } from '../services/apiCalls';

const GuestOrder = () => {
    const [searchParams] = useSearchParams();
    const tableNumber = searchParams.get('table') || 'GUEST';
    
    const [categories, setCategories] = useState([]);
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [cart, setCart] = useState([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', contactNumber: '' });

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const catRes = await categoryService.getAll();
                setCategories(catRes.data || []);
                if (catRes.data?.[0]) {
                    fetchProducts(catRes.data[0].id);
                    setSelectedCategory(catRes.data[0]);
                }
            } catch (error) {
                toast.error('Neural Link Failed: Could not fetch menu');
            }
        };
        fetchMenu();
    }, []);

    const fetchProducts = async (categoryId) => {
        try {
            const prodRes = await productService.getByCategory(categoryId);
            setProducts(prodRes.data || []);
        } catch (error) {
            toast.error('Data Corruption: Product fetch failed');
        }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const existing = prev.find(item => item.productId === product.id);
            if (existing) {
                return prev.map(item => 
                    item.productId === product.id 
                    ? { ...item, quantity: item.quantity + 1 } 
                    : item
                );
            }
            return [...prev, { productId: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
        toast.success(`Synthesized: ${product.name} added`);
    };

    const updateQuantity = (productId, delta) => {
        setCart(prev => prev.map(item => 
            item.productId === productId 
            ? { ...item, quantity: Math.max(0, item.quantity + delta) } 
            : item
        ).filter(item => item.quantity > 0));
    };

    const totalPrice = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    const handlePlaceOrder = async (e) => {
        e.preventDefault();
        if (cart.length === 0) return toast.error('Selection Void: Cart is empty');
        
        const payload = {
            ...customerInfo,
            tableNumber,
            orderSource: 'SCAN_ORDER',
            items: cart.map(item => ({ productId: item.productId, quantity: item.quantity }))
        };

        try {
            const res = await billService.placePublicOrder(payload);
            toast.success('TRANS MISSION SUCCESSFUL: Order routed to kitchen');
            setCart([]);
            setIsCartOpen(false);
        } catch (error) {
            toast.error('Routing Error: Operational Failure');
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-coffee-500/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-coffee-900/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-amber-900/10 blur-[120px] rounded-full" />
            </div>

            {/* Header */}
            <header className="sticky top-0 z-50 backdrop-blur-md border-b border-white/5 px-6 py-6 bg-black/40">
                <div className="max-w-7xl mx-auto flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-coffee-600 rounded-xl shadow-lg shadow-coffee-600/20">
                            <Coffee size={24} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black uppercase tracking-tighter italic leading-none">CafeFlow</h1>
                            <span className="text-[10px] font-bold text-coffee-500 uppercase tracking-widest mt-1 block">Tactical Menu Hub</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                            <TableIcon size={14} className="text-coffee-500" />
                            <span className="text-xs font-black uppercase tracking-widest">Table {tableNumber}</span>
                        </div>
                        <motion.button 
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsCartOpen(true)}
                            className="relative p-3 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all"
                        >
                            <ShoppingCart size={20} />
                            {cart.length > 0 && (
                                <span className="absolute -top-1 -right-1 bg-coffee-600 text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#0a0a0a]">
                                    {cart.reduce((a, b) => a + b.quantity, 0)}
                                </span>
                            )}
                        </motion.button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-12 relative z-10">
                {/* Hero Section */}
                <div className="mb-16">
                    <h2 className="text-6xl md:text-8xl font-black uppercase tracking-tighter mb-4 italic leading-none">
                        Neural <span className="text-coffee-500">Cuisine</span>
                    </h2>
                    <p className="text-gray-400 font-bold uppercase tracking-[0.2em] text-xs max-w-lg">
                        High-performance nourishment synthesized for optimal operational efficiency. Welcome to terminal {tableNumber}.
                    </p>
                </div>

                {/* Categories */}
                <div className="flex overflow-x-auto gap-4 pb-6 scrollbar-hide mb-12">
                    {categories.map(cat => (
                        <button 
                            key={cat.id}
                            onClick={() => { setSelectedCategory(cat); fetchProducts(cat.id); }}
                            className={`whitespace-nowrap px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                                selectedCategory?.id === cat.id 
                                ? 'bg-coffee-600 text-white border-coffee-500 shadow-xl shadow-coffee-600/20' 
                                : 'bg-white/5 text-gray-500 border-white/5 hover:border-white/20'
                            }`}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map(product => (
                        <motion.div 
                            layout
                            key={product.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group bg-white/5 rounded-[2.5rem] border border-white/5 p-8 hover:bg-white/10 transition-all duration-500 relative overflow-hidden"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-4 bg-coffee-600/20 rounded-2xl text-coffee-500 group-hover:bg-coffee-600 group-hover:text-white transition-all duration-500">
                                    <Zap size={24} />
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter">₹{product.price}</span>
                            </div>

                            <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{product.name}</h3>
                            <p className="text-xs text-gray-500 font-bold uppercase tracking-widest leading-relaxed mb-8">
                                {product.description || "Synthesized flavor profile pending technical documentation."}
                            </p>

                            <motion.button 
                                whileTap={{ scale: 0.98 }}
                                onClick={() => addToCart(product)}
                                className="w-full py-4 bg-coffee-600 hover:bg-coffee-700 text-white rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] shadow-lg shadow-coffee-600/20 transition-all flex items-center justify-center gap-2"
                            >
                                <Plus size={16} /> Execute Synthesis
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            </main>

            {/* Cart Sidebar */}
            <AnimatePresence>
                {isCartOpen && (
                    <div className="fixed inset-0 z-[100] flex justify-end">
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsCartOpen(false)}
                            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
                        />
                        <motion.div 
                            initial={{ x: '100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="relative w-full max-w-md bg-[#0a0a0a] border-l border-white/10 h-full shadow-2xl flex flex-col p-8"
                        >
                            <div className="flex justify-between items-center mb-10">
                                <h3 className="text-3xl font-black italic uppercase tracking-tighter">Mission <span className="text-coffee-500">Cart</span></h3>
                                <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white text-xs font-black uppercase">Abort</button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 mb-10 scrollbar-hide">
                                {cart.length === 0 ? (
                                    <div className="text-center py-20 opacity-20">
                                        <ShoppingCart size={64} className="mx-auto mb-4" />
                                        <p className="font-black uppercase tracking-widest text-xs italic">Cart Null: Awaiting Command</p>
                                    </div>
                                ) : (
                                    cart.map(item => (
                                        <div key={item.productId} className="flex justify-between items-center bg-white/5 p-6 rounded-3xl border border-white/5">
                                            <div>
                                                <h4 className="font-black uppercase tracking-tighter">{item.name}</h4>
                                                <p className="text-[10px] font-bold text-coffee-500">₹{item.price} UNIT</p>
                                            </div>
                                            <div className="flex items-center gap-4 bg-black/40 rounded-xl p-1 border border-white/10">
                                                <button onClick={() => updateQuantity(item.productId, -1)} className="p-1 hover:text-coffee-500 transition-colors"><Minus size={14} /></button>
                                                <span className="text-xs font-black w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.productId, 1)} className="p-1 hover:text-coffee-500 transition-colors"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>

                            {cart.length > 0 && (
                                <form onSubmit={handlePlaceOrder} className="space-y-4">
                                    <div className="space-y-4 mb-6">
                                        <input required type="text" placeholder="OPERATOR NAME" value={customerInfo.name} onChange={e => setCustomerInfo({...customerInfo, name: e.target.value})} className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-coffee-500 font-bold text-xs uppercase tracking-widest transition-all" />
                                        <input required type="email" placeholder="NEURAL ADDRESS (EMAIL)" value={customerInfo.email} onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})} className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-coffee-500 font-bold text-xs uppercase tracking-widest transition-all" />
                                        <input required type="tel" placeholder="COMM CHANNEL (PHONE)" value={customerInfo.contactNumber} onChange={e => setCustomerInfo({...customerInfo, contactNumber: e.target.value})} className="w-full bg-white/5 border border-white/10 px-6 py-4 rounded-2xl outline-none focus:border-coffee-500 font-bold text-xs uppercase tracking-widest transition-all" />
                                    </div>

                                    <div className="flex justify-between items-center mb-6 px-4">
                                        <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em]">Total Payload</span>
                                        <span className="text-3xl font-black italic tracking-tighter">₹{totalPrice}</span>
                                    </div>

                                    <button type="submit" className="w-full py-6 bg-coffee-600 text-white rounded-[2rem] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-coffee-600/20 active:scale-95 transition-all text-sm">
                                        Initialize Routing <Send size={20} />
                                    </button>
                                </form>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GuestOrder;
