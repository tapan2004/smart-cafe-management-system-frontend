import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Edit2, Trash2, X, Coffee, Tag, LayoutGrid, List as ListIcon, PieChart, Soup, Pizza, Utensils, IceCream, Beer, ArrowRight, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { productService, categoryService } from '../services/apiCalls';

const CATEGORY_ICONS = {
  'beverages': Coffee,
  'coffee': Coffee,
  'pizza': Pizza,
  'chinese': Soup,
  'dessert': IceCream,
  'drinks': Beer,
  'main course': Utensils,
  'bakery': PieChart,
  'default': Tag
};

const getCategoryIcon = (name) => {
  const norm = name.toLowerCase();
  for (const [key, icon] of Object.entries(CATEGORY_ICONS)) {
    if (norm.includes(key)) return icon;
  }
  return CATEGORY_ICONS.default;
};

const Menu = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [search, setSearch] = useState('');
  
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  
  const [isCategoryModalOpen, setCategoryModalOpen] = useState(false);
  const [isProductModalOpen, setProductModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const [formData, setFormData] = useState({ name: '', price: '', categoryId: '', status: true, description: '' });

  const fetchData = async () => {
    try {
      const [catRes, prodRes] = await Promise.all([
        categoryService.getAll(),
        productService.getAll()
      ]);
      setCategories(catRes.data || []);
      setProducts(prodRes.data || []);
    } catch (error) {
      toast.error('Failed to load menu data');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (tab, item = null) => {
    setEditingItem(item);
    if (tab === 'categories') {
      setFormData(item ? { name: item.name } : { name: '' });
      setCategoryModalOpen(true);
    } else {
      setFormData(item ? { 
        name: item.name, 
        price: item.price, 
        categoryId: item.category?.id || item.categoryId || '', 
        status: item.status === 'true' || item.status === true,
        description: item.description || ''
      } : { name: '', price: '', categoryId: '', status: true, description: '' });
      setProductModalOpen(true);
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await categoryService.update({ id: editingItem.id, name: formData.name });
        toast.success('System: Category Revised');
      } else {
        await categoryService.add({ name: formData.name });
        toast.success('System: Category Registered');
      }
      setCategoryModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction Interrupted');
    }
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        categoryId: parseInt(formData.categoryId),
        price: parseFloat(formData.price),
        status: formData.status,
        description: formData.description
      };

      if (editingItem) {
         payload.id = editingItem.id;
         await productService.update(payload);
         toast.success('System: Product Updated');
      } else {
         await productService.add(payload);
         toast.success('System: Product Deployed');
      }
      setProductModalOpen(false);
      fetchData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transaction Interrupted');
    }
  };

  const handleDeleteItem = async (type, id) => {
    const message = type === 'products' ? 'Eradicate this product?' : 'Dissolve this category?';
    if(window.confirm(message)) {
      try {
        if (type === 'products') await productService.delete(id);
        else await categoryService.delete(id);
        toast.success('Action Confirmed');
        fetchData();
      } catch (err) {
        toast.error('Authority Denied: Active dependencies found');
      }
    }
  };

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      await productService.updateStatus({ id, status: (!currentStatus).toString() });
      toast.success('Availability Phase Shifted');
      fetchData();
    } catch (err) {
      toast.error('System Integrity Failure');
    }
  };

  const filteredItems = activeTab === 'products' 
    ? products.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()))
    : categories.filter(c => c.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-10">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter italic">Operational Hub</h1>
           <div className="flex items-center gap-3 mt-2">
              <span className="bg-coffee-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Active Inventory</span>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Global Catalog Management</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-coffee-500 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder={`Filter ${activeTab}...`} 
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-4 glass-card bg-white/20 dark:bg-gray-900/40 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 transition-all font-bold w-full sm:w-80"
                />
            </div>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleOpenModal(activeTab)}
                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-4 rounded-2xl flex items-center gap-3 shadow-2xl shadow-coffee-600/20 font-black uppercase text-[10px] tracking-[0.2em]"
            >
                <Plus size={16} /> Deploy {activeTab === 'products' ? 'Product' : 'Category'}
            </motion.button>
        </div>
      </div>

      {/* Modern Control Bar */}
      <div className="flex glass-card p-2 rounded-[2rem] w-fit">
        <button 
            onClick={() => setActiveTab('products')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'products' ? 'bg-coffee-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
            <LayoutGrid size={16} /> Catalog
        </button>
        <button 
            onClick={() => setActiveTab('categories')}
            className={`flex items-center gap-3 px-10 py-4 rounded-[1.5rem] text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'categories' ? 'bg-coffee-600 text-white shadow-xl' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-200'}`}
        >
            <ListIcon size={16} /> Divisions
        </button>
      </div>

      {/* Main Content Area */}
      <div className="min-h-[500px]">
        {activeTab === 'categories' ? (
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              <AnimatePresence mode="popLayout">
                {filteredItems.map((cat, idx) => {
                  const Icon = getCategoryIcon(cat.name);
                  const productCount = products.filter(p => p.category?.id === cat.id).length;
                  return (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      key={cat.id} 
                      className="glass-card group p-10 rounded-[3rem] relative overflow-hidden flex flex-col justify-between hover:border-coffee-500/30 transition-all cursor-default h-[300px]"
                    >
                       <div className="absolute -right-10 -top-10 bg-coffee-100 dark:bg-amber-900/10 w-40 h-40 rounded-full blur-3xl group-hover:bg-coffee-500/20 transition-all" />
                       
                       <div className="flex justify-between items-start relative z-10">
                          <div className="p-5 bg-coffee-100 dark:bg-amber-900/20 rounded-[2rem] group-hover:bg-coffee-600 group-hover:text-white transition-all duration-500">
                             <Icon size={32} />
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0">
                             <button onClick={() => handleOpenModal('categories', cat)} className="p-2 text-coffee-600 hover:bg-white dark:hover:bg-gray-800 rounded-lg"><Edit2 size={16} /></button>
                             <button onClick={() => handleDeleteItem('categories', cat.id)} className="p-2 text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-lg"><Trash2 size={16} /></button>
                          </div>
                       </div>

                       <div className="relative z-10">
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Sector ID: CMS-{cat.id}</p>
                          <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter group-hover:text-coffee-600 transition-colors truncate">{cat.name}</h3>
                          <div className="flex items-center gap-2 mt-4 text-green-500 text-[10px] font-black uppercase tracking-[0.2em]">
                             <Package size={14} /> {productCount} Deployed SKU{productCount !== 1 ? 's' : ''}
                          </div>
                       </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
           </div>
        ) : (
          <div className="space-y-12">
            {categories.map(category => {
              const categoryProducts = filteredItems.filter(p => (p.categoryId || p.category?.id) === category.id);
              if (categoryProducts.length === 0 && search) return null;
              if (categoryProducts.length === 0 && !search) return null;

              const Icon = getCategoryIcon(category.name);
              
              return (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={category.id} 
                  className="space-y-6"
                >
                  <div className="flex items-center gap-4 pl-4 border-l-4 border-coffee-600">
                    <div className="p-3 bg-coffee-100 dark:bg-amber-900/20 rounded-2xl text-coffee-700 dark:text-amber-400">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-black dark:text-white uppercase tracking-tighter">{category.name}</h2>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{categoryProducts.length} Items in this Division</p>
                    </div>
                  </div>

                  <div className="glass-card rounded-[3rem] overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                          <thead>
                              <tr className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100/50 dark:border-gray-800/50">
                                  <th className="px-10 py-6">SKU Identity</th>
                                  <th className="px-10 py-6">Capital Value</th>
                                  <th className="px-10 py-6">Status</th>
                                  <th className="px-10 py-6 text-right">Authority</th>
                              </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-100/30 dark:divide-gray-800/30">
                              <AnimatePresence mode="popLayout">
                                  {categoryProducts.map((p) => (
                                      <motion.tr 
                                          layout
                                          initial={{ opacity: 0 }}
                                          animate={{ opacity: 1 }}
                                          exit={{ opacity: 0 }}
                                          key={p.id} 
                                          className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all"
                                      >
                                          <td className="px-10 py-6">
                                              <div className="flex items-center gap-4">
                                                  <div className="w-12 h-12 bg-coffee-50 dark:bg-amber-900/10 rounded-2xl flex items-center justify-center font-black text-coffee-600 dark:text-amber-500 shadow-sm border border-coffee-100 dark:border-amber-900/30">
                                                      {p.name.charAt(0)}
                                                  </div>
                                                  <div>
                                                      <span className="dark:text-white block font-black uppercase text-lg tracking-tighter">{p.name}</span>
                                                      <span className="text-[9px] text-gray-500 font-bold uppercase tracking-widest mt-1 block max-w-xs truncate">
                                                         {p.description || "NO PRODUCT DESCRIPTION LOGGED"}
                                                      </span>
                                                  </div>
                                              </div>
                                          </td>
                                          <td className="px-10 py-6">
                                              <div className="flex flex-col">
                                                <span className="text-xl font-black dark:text-white tracking-tighter">₹{p.price}</span>
                                                <span className="text-[9px] text-gray-400 font-bold uppercase">Standard Rate</span>
                                              </div>
                                          </td>
                                          <td className="px-10 py-6">
                                              <button 
                                                  onClick={() => handleToggleStatus(p.id, p.status === true || p.status === 'true')}
                                                  className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 border ${
                                                      (p.status === true || p.status === 'true') 
                                                          ? 'bg-green-100/30 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40' 
                                                          : 'bg-red-100/30 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'
                                                  }`}
                                              >
                                                  {(p.status === true || p.status === 'true') ? 'In Service' : 'Decommissioned'}
                                              </button>
                                          </td>
                                          <td className="px-10 py-6 text-right">
                                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-all">
                                                  <button onClick={() => handleOpenModal('products', p)} className="p-3 text-coffee-600 hover:bg-white dark:hover:bg-gray-800 rounded-2xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all"><Edit2 size={16} /></button>
                                                  <button onClick={() => handleDeleteItem('products', p.id)} className="p-3 text-red-500 hover:bg-white dark:hover:bg-gray-800 rounded-2xl shadow-sm border border-transparent hover:border-gray-100 dark:hover:border-gray-700 transition-all"><Trash2 size={16} /></button>
                                              </div>
                                          </td>
                                      </motion.tr>
                                  ))}
                              </AnimatePresence>
                          </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Premium Modals */}
      <AnimatePresence>
        {(isCategoryModalOpen || isProductModalOpen) && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-coffee-950/40 backdrop-blur-xl">
            <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 30 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               exit={{ opacity: 0, scale: 0.95, y: 30 }}
               className="bg-white dark:bg-gray-950 w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800/50 shadow-black/50"
            >
              <div className="premium-gradient p-14 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 p-1 bg-white/10 rounded-bl-[2rem] hover:bg-white/20 transition-all">
                    <X onClick={() => { setCategoryModalOpen(false); setProductModalOpen(false); }} className="cursor-pointer m-4" size={24} />
                </div>
                <h3 className="text-4xl font-black uppercase tracking-tighter italic">
                   {editingItem ? 'Revise' : 'Deploiy'} {isCategoryModalOpen ? 'Division' : 'SKU'}
                </h3>
                <p className="text-coffee-200 text-xs font-bold uppercase tracking-[0.3em] mt-3">Advanced Cataloging Interface</p>
              </div>

              <div className="p-14">
                <form onSubmit={isCategoryModalOpen ? handleSaveCategory : handleSaveProduct} className="space-y-8">
                   <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Label Designation</label>
                      <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 rounded-3xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-black text-lg transition-all border border-transparent focus:border-coffee-500/30" placeholder="e.g. Signature Dark Roast" />
                   </div>

                   {!isCategoryModalOpen && (
                      <>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Monetary Point (₹)</label>
                             <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 rounded-3xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-black text-lg transition-all border border-transparent focus:border-coffee-500/30" />
                           </div>
                           <div className="space-y-3">
                             <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Department</label>
                             <div className="relative">
                                <select required value={formData.categoryId} onChange={e => setFormData({...formData, categoryId: e.target.value})} className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 rounded-3xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all cursor-pointer appearance-none border border-transparent focus:border-coffee-500/30">
                                    <option value="">Select Sector...</option>
                                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                <ArrowRight className="absolute right-6 top-1/2 -translate-y-1/2 text-gray-400 group-hover:text-coffee-500" size={18} />
                             </div>
                           </div>
                        </div>
                        <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">System Meta Data (Description)</label>
                          <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-8 py-5 bg-gray-50 dark:bg-gray-900 rounded-3xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all h-32 resize-none border border-transparent focus:border-coffee-500/30" placeholder="Technical specifications, flavor profiles..." />
                        </div>
                      </>
                   )}

                   <button type="submit" className="w-full premium-gradient text-white py-6 rounded-[3rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-coffee-950/40 active:scale-[0.97] transition-all mt-6 text-sm flex items-center justify-center gap-4">
                     Confirm Mission <ArrowRight size={20} />
                   </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Menu;
