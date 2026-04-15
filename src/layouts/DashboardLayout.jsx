import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Coffee, LayoutDashboard, Utensils, ReceiptText, BrainCircuit, LogOut, Menu as MenuIcon, X, Users, Sun, Moon, ChefHat, Package, ChevronRight, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'react-hot-toast';
import FloatingAiChat from '../components/FloatingAiChat';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={18} /> },
    { name: 'Menu & Categories', path: '/menu', icon: <Utensils size={18} /> },
    { name: 'Billing / POS', path: '/billing', icon: <ReceiptText size={18} /> },
    { name: 'Inventory', path: '/inventory', icon: <Package size={18} /> },
    { name: 'Users', path: '/users', icon: <Users size={18} /> },
    { name: 'Kitchen Display', path: '/kitchen', icon: <ChefHat size={18} /> },
    { name: 'AI Features', path: '/ai', icon: <BrainCircuit size={18} /> },
    { name: 'Audit Trail', path: '/audit', icon: <ShieldCheck size={18} /> },
  ];

  const userInitial = localStorage.getItem('username')?.charAt(0).toUpperCase() || 'A';

  return (
    <div className="flex h-screen bg-[#faf9f6] dark:bg-[#050505] font-sans selection:bg-coffee-500/30 overflow-hidden">
      <Toaster position="top-right" />
      
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-[70] w-72 bg-coffee-950/95 border-r border-white/5 backdrop-blur-2xl transform transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo Section */}
          <div className="h-24 flex items-center px-8">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-3 group cursor-pointer"
            >
              <div className="p-2.5 bg-gradient-to-br from-coffee-400 to-coffee-600 rounded-2xl shadow-xl shadow-coffee-900/40">
                <Coffee className="text-white" size={24} />
              </div>
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">CafeFlow</span>
            </motion.div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide space-y-8">
            <div className="space-y-1.5">
              <p className="px-5 text-[10px] font-black uppercase tracking-[0.3em] text-coffee-500 mb-4">Core Management</p>
              {navItems.map((item) => {
                const isActive = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/');
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`group relative flex items-center justify-between px-5 py-3.5 rounded-2xl transition-all duration-300 ${
                      isActive 
                        ? 'bg-gradient-to-r from-coffee-600 to-coffee-700 text-white shadow-lg shadow-coffee-900/60 font-bold' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center space-x-4">
                      <span className={`${isActive ? 'text-white' : 'text-coffee-600 group-hover:text-coffee-400'} transition-colors`}>{item.icon}</span>
                      <span className="text-sm tracking-tight">{item.name}</span>
                    </div>
                    {isActive && (
                      <motion.div layoutId="activeInd" className="w-1 h-5 bg-coffee-400 rounded-full" />
                    )}
                  </Link>
                )
              })}
            </div>
          </div>

          {/* User Section Bottom */}
          <div className="p-6">
            <div className="bg-white/5 rounded-3xl p-6 border border-white/5">
                <button 
                onClick={handleLogout}
                className="flex items-center space-x-3 w-full group py-1"
                >
                    <div className="p-2 bg-red-900/20 rounded-xl text-red-400 group-hover:bg-red-900 group-hover:text-white transition-all">
                        <LogOut size={18} />
                    </div>
                    <span className="text-sm font-bold text-gray-400 group-hover:text-white transition-colors">Terminate Session</span>
                </button>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden relative">
        {/* Top Navbar */}
        <header className="h-24 flex items-center justify-between px-10 relative z-50">
          <div className="flex items-center gap-6">
            <button 
              className="lg:hidden p-3 bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 text-gray-500"
              onClick={() => setSidebarOpen(true)}
            >
              <MenuIcon size={24} />
            </button>
            <div className="hidden lg:block">
               <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">Operational Console</p>
               <h2 className="text-lg font-bold dark:text-white tracking-tight capitalize">
                 {location.pathname === '/' ? 'Global Analytics' : location.pathname.split('/')[1]?.replace('-', ' ')}
               </h2>
            </div>
          </div>

          <div className="flex items-center space-x-8">
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-3.5 rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 text-gray-500 dark:text-gray-300 hover:text-coffee-500 transition-all shadow-sm"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </motion.button>
            
            <div className="flex items-center space-x-4 pl-4 border-l border-gray-200 dark:border-gray-800">
               <div className="text-right hidden sm:block">
                  <p className="text-xs font-black dark:text-white uppercase tracking-wider">Admin User</p>
                  <p className="text-[10px] text-coffee-600 font-bold uppercase tracking-widest">Active System</p>
               </div>
               <motion.div 
                 whileHover={{ scale: 1.1 }}
                 className="h-14 w-14 rounded-2xl bg-gradient-to-br from-coffee-400 to-coffee-700 flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-coffee-500/20 cursor-pointer"
               >
                 {userInitial}
               </motion.div>
            </div>
          </div>
        </header>

        {/* Page Content Backdrop Fix */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-coffee-500/5 blur-[120px] rounded-full pointer-events-none" />

        {/* Page Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-scroll p-10 relative z-10 scrollbar-hide">
          <Outlet />
        </main>
        
        {/* Global AI Assistant */}
        <FloatingAiChat />
      </div>
    </div>
  );
};

export default DashboardLayout;
