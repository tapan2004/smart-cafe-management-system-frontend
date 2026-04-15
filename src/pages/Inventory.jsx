import { useState, useEffect } from 'react';
import { Package, Plus, Trash2, Edit, ShoppingBasket, Save, X, Layers, ChevronRight, Activity } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { inventoryService, productService } from '../services/apiCalls';

const Inventory = () => {
  const [inventory, setInventory] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showBOMModal, setShowBOMModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [productIngredients, setProductIngredients] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    quantity: '',
    unit: '',
    threshold: ''
  });

  const [bomData, setBomData] = useState({
    inventoryId: '',
    quantity: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [invRes, prodRes] = await Promise.all([
        inventoryService.get(),
        productService.getAll()
      ]);
      setInventory(invRes.data);
      setProducts(prodRes.data);
    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Strip immutable fields to avoid Hibernate warnings
    const { createdAt, updatedAt, ...cleanData } = formData;
    const payload = editItem 
      ? { ...cleanData, id: editItem.id, lowStockThreshold: formData.threshold } 
      : { ...cleanData, lowStockThreshold: formData.threshold };

    try {
      if (editItem) {
        await inventoryService.update(payload);
        toast.success('Inventory state updated', {
          style: { borderRadius: '20px', background: '#1a1a1a', color: '#fff' }
        });
      } else {
        await inventoryService.add(payload);
        toast.success('New ingredient logged');
      }
      setShowModal(false);
      setEditItem(null);
      setFormData({ name: '', quantity: '', unit: '', threshold: '' });
      fetchData();
    } catch (error) {
      toast.error('Sync failed: Check protocol logs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this stock item?')) {
      try {
        await inventoryService.delete(id);
        toast.success('Deleted successfully');
        fetchData();
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const openBOM = async (product) => {
    setSelectedProduct(product);
    try {
      const res = await inventoryService.getIngredients(product.id);
      setProductIngredients(res.data);
      setShowBOMModal(true);
    } catch (error) {
      toast.error('Failed to load ingredients');
    }
  };

  const handleAddIngredient = async () => {
    if (!bomData.inventoryId || !bomData.quantity || bomData.quantity <= 0) {
      toast.error('Please select an ingredient and enter a valid quantity');
      return;
    }

    try {
      await inventoryService.addIngredient({
        productId: selectedProduct.id,
        ...bomData
      });
      toast.success('Ingredient linked');
      openBOM(selectedProduct);
      setBomData({ inventoryId: '', quantity: '' });
    } catch (error) {
      const msg = error.response?.data?.message || 'Add failed';
      toast.error(msg);
    }
  };

  const handleRemoveIngredient = async (id) => {
    try {
      await inventoryService.removeIngredient(id);
      toast.success('Removed');
      openBOM(selectedProduct);
    } catch (error) {
      toast.error('Remove failed');
    }
  };

  return (
    <div className="space-y-8 h-full max-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <h1 className="text-4xl font-black dark:text-white uppercase tracking-tighter">Inventory Hub</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">Precision supply chain and recipe management.</p>
        </motion.div>
        
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => { setEditItem(null); setShowModal(true); }}
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-4 rounded-[2rem] flex items-center gap-3 transition-all shadow-2xl shadow-coffee-600/20 font-bold uppercase text-xs tracking-widest"
        >
          <Plus size={18} /> Add Stock Item
        </motion.button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Inventory List */}
        <motion.div 
           initial={{ opacity: 0, y: 20 }}
           animate={{ opacity: 1, y: 0 }}
           transition={{ delay: 0.1 }}
           className="lg:col-span-3 space-y-4"
        >
          <div className="glass-card rounded-[2.5rem] overflow-hidden">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/30 dark:bg-gray-800/20">
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3">
                <Layers className="text-coffee-600" /> Current Stock
              </h2>
              <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                 <Activity size={14} className="text-green-500" /> Live Tracking
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em]">
                    <th className="px-8 py-6">Material Name</th>
                    <th className="px-8 py-6">Availability</th>
                    <th className="px-8 py-6">Safety Threshold</th>
                    <th className="px-8 py-6">Status</th>
                    <th className="px-8 py-6 text-right">Settings</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/50 dark:divide-gray-800/50">
                  {inventory.map((item) => {
                    const isLow = item.quantity <= item.lowStockThreshold;
                    return (
                      <tr key={item.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/30 transition-all">
                        <td className="px-8 py-6">
                           <div className="flex items-center gap-3">
                             <div className={`p-2 rounded-xl border ${isLow ? 'bg-red-50 border-red-100 text-red-600' : 'bg-coffee-50 border-coffee-100 text-coffee-600 dark:bg-amber-900/20 dark:border-amber-900/40 dark:text-amber-400'} transition-colors`}>
                               <Package size={18} />
                             </div>
                             <span className="font-bold dark:text-gray-100">{item.name}</span>
                           </div>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm font-black dark:text-white uppercase tracking-tight">{item.quantity}</span>
                           <span className="ml-1 text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase">{item.unit}</span>
                        </td>
                        <td className="px-8 py-6">
                           <span className="text-sm dark:text-gray-300 font-medium">{item.lowStockThreshold} {item.unit}</span>
                        </td>
                        <td className="px-8 py-6">
                          <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent ${
                            isLow 
                            ? 'bg-red-100/50 text-red-600 dark:bg-red-900/40 dark:text-red-300 dark:border-red-800/50' 
                            : 'bg-green-100/50 text-green-600 dark:bg-green-900/40 dark:text-green-300 dark:border-green-800/50'
                          }`}>
                            {isLow ? 'Critical Low' : 'In Stock'}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="flex justify-end gap-1 opacity-40 group-hover:opacity-100 transition-opacity">
                             <button onClick={() => { setEditItem(item); setFormData({ name: item.name, quantity: item.quantity, unit: item.unit, threshold: item.lowStockThreshold }); setShowModal(true); }} className="p-2 text-coffee-600 hover:bg-coffee-50 dark:text-amber-400 dark:hover:bg-amber-900/20 rounded-lg transition-all"><Edit size={16} /></button>
                             <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 rounded-lg transition-all"><Trash2 size={16} /></button>
                           </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Product BOM Sidebar */}
        <motion.div 
           initial={{ opacity: 0, x: 20 }}
           animate={{ opacity: 1, x: 0 }}
           transition={{ delay: 0.2 }}
           className="space-y-6"
        >
          <div className="glass-card rounded-[2.5rem] flex flex-col h-full bg-gradient-to-b from-white/70 to-gray-50/30 dark:from-gray-900/40 dark:to-gray-950/20">
            <div className="p-8 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold dark:text-white flex items-center gap-3 uppercase tracking-tighter">
                <ShoppingBasket className="text-amber-500" /> BOM Setup
              </h2>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">Configure item recipes</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[700px]">
              {products.map(product => (
                <button 
                  key={product.id}
                  onClick={() => openBOM(product)}
                  className="w-full text-left p-5 rounded-[1.5rem] hover:bg-white dark:hover:bg-gray-800 border border-transparent hover:border-gray-100 dark:hover:border-gray-700 hover:shadow-xl hover:shadow-black/5 group transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-bold dark:text-white group-hover:text-coffee-600 transition-colors text-sm">{product.name}</p>
                      <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{product.categoryName || 'Standard'}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 group-hover:text-coffee-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Modern Modals: Same as before but with consistent premium styling */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-coffee-950/40 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white dark:bg-gray-950 w-full max-w-md rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800/50"
            >
              <div className="premium-gradient p-10 text-white relative">
                <X onClick={() => setShowModal(false)} className="absolute top-6 right-6 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" size={24} />
                <h3 className="text-3xl font-black uppercase tracking-tighter">{editItem ? 'Update Stock' : 'New Ingredient'}</h3>
                <p className="text-coffee-200 text-xs font-bold uppercase tracking-widest mt-2">{editItem ? 'Modifying existing supply' : 'Adding to kitchen pantry'}</p>
              </div>
              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Item Label</label>
                  <input required value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent focus:border-coffee-500/50 dark:text-white outline-none transition-all font-bold" placeholder="e.g. Arabica Beans" />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Quantity</label>
                    <input required type="number" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent focus:border-coffee-500/50 dark:text-white outline-none transition-all font-bold" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Unit</label>
                    <input required value={formData.unit} onChange={(e) => setFormData({...formData, unit: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent focus:border-coffee-500/50 dark:text-white outline-none transition-all font-bold" placeholder="KG, LTR..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Safety Threshold</label>
                  <input required type="number" value={formData.threshold} onChange={(e) => setFormData({...formData, threshold: e.target.value})} className="w-full px-5 py-4 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent focus:border-coffee-500/50 dark:text-white outline-none transition-all font-bold" />
                </div>
                <button type="submit" className="w-full premium-gradient text-white py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-coffee-950/40 active:scale-95 transition-all mt-4 flex items-center justify-center gap-3">
                  <Save size={18} /> {editItem ? 'Save Updates' : 'Authorize Add'}
                </button>
              </form>
            </motion.div>
          </div>
        )}

        {showBOMModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-coffee-950/40 backdrop-blur-md">
            <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800/50"
            >
              <div className="premium-gradient p-10 text-white relative">
                <X onClick={() => setShowBOMModal(false)} className="absolute top-6 right-6 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" size={24} />
                <h3 className="text-3xl font-black uppercase tracking-tighter">Recipe Blueprint</h3>
                <p className="text-coffee-200 text-sm font-medium mt-1">Product: <span className="text-white font-bold">{selectedProduct.name}</span></p>
              </div>
              <div className="p-10">
                <div className="flex gap-4 mb-10 bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-[2rem] border border-gray-100 dark:border-gray-800">
                  <div className="flex-1 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Ingredient</label>
                    <select 
                      value={bomData.inventoryId}
                      onChange={(e) => setBomData({...bomData, inventoryId: e.target.value})}
                      className="w-full p-4 rounded-xl border-none bg-white dark:bg-gray-800 dark:text-white font-bold text-sm ring-1 ring-gray-100 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-coffee-500"
                    >
                      <option value="">Select Stock</option>
                      {inventory.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="w-32 space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Qty</label>
                    <input type="number" value={bomData.quantity} onChange={(e) => setBomData({...bomData, quantity: e.target.value})} className="w-full p-4 rounded-xl border-none bg-white dark:bg-gray-800 dark:text-white font-bold text-sm ring-1 ring-gray-100 dark:ring-gray-700 outline-none focus:ring-2 focus:ring-coffee-500" />
                  </div>
                  <div className="flex items-end">
                    <button onClick={handleAddIngredient} className="bg-coffee-600 text-white p-4 rounded-xl hover:bg-coffee-700 active:scale-95 shadow-lg shadow-coffee-600/20"><Plus size={20} /></button>
                  </div>
                </div>

                <div className="space-y-4 pr-1 max-h-60 overflow-y-auto">
                  <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1 mb-2">Active Components</h4>
                  <AnimatePresence>
                    {productIngredients.length === 0 ? (
                      <p className="text-gray-400 italic text-center py-6 text-sm">No components linked.</p>
                    ) : (
                      productIngredients.map(ing => (
                        <motion.div 
                          layout
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={ing.id} 
                          className="flex justify-between items-center p-5 bg-gray-50 dark:bg-gray-900 rounded-2xl border border-transparent hover:border-gray-100 dark:hover:border-gray-800 transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="p-3 bg-white dark:bg-gray-800 rounded-xl shadow-sm"><Package className="text-coffee-600" size={18} /></div>
                            <div>
                              <p className="font-bold dark:text-white text-sm">{ing.inventoryItem.name}</p>
                              <p className="text-[10px] font-bold text-gray-400 uppercase">{ing.quantityRequired} {ing.inventoryItem.unit} Required</p>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveIngredient(ing.id)} className="text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 p-2.5 rounded-xl transition-all"><Trash2 size={18} /></button>
                        </motion.div>
                      ))
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Inventory;
