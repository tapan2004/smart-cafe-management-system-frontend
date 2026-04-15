import { useState, useEffect } from 'react';
import { UserCheck, UserX, Shield, ShieldAlert, X, Plus, Search, Activity, Users as UsersIcon, Lock, Mail, Phone, ArrowUpRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { userService } from '../services/apiCalls';

const AddUserModal = ({ isOpen, onClose, onSave }) => {
  const [formData, setFormData] = useState({ name: '', contactNumber: '', email: '', password: '', role: 'user' });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-coffee-950/40 backdrop-blur-xl">
      <motion.div 
         initial={{ opacity: 0, scale: 0.95, y: 30 }} 
         animate={{ opacity: 1, scale: 1, y: 0 }} 
         exit={{ opacity: 0, scale: 0.95, y: 30 }} 
         className="bg-white dark:bg-gray-950 w-full max-w-xl rounded-[3rem] shadow-2xl overflow-hidden border border-white/20 dark:border-gray-800/50"
      >
        <div className="premium-gradient p-12 text-white relative">
          <X onClick={onClose} className="absolute top-8 right-8 cursor-pointer opacity-50 hover:opacity-100 transition-opacity" size={24} />
          <h2 className="text-4xl font-black uppercase tracking-tighter italic">Register Personnel</h2>
          <p className="text-coffee-200 text-xs font-bold uppercase tracking-[0.3em] mt-3">Granting Authorization Credentials</p>
        </div>
        <form onSubmit={handleSubmit} className="p-12 space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Legal Identity</label>
            <div className="relative">
                <UsersIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" placeholder="Full Name" />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Communication Channel</label>
                <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" placeholder="Email Address" />
                </div>
            </div>
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Direct Contact</label>
                <div className="relative">
                    <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input required type="text" value={formData.contactNumber} onChange={e => setFormData({...formData, contactNumber: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" placeholder="Phone Number" />
                </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest pl-1">Access Passcode</label>
            <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full pl-14 pr-6 py-5 bg-gray-50 dark:bg-gray-900 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 dark:text-white font-bold transition-all border border-transparent focus:border-coffee-500/30" placeholder="Security Token" />
            </div>
          </div>
          <button type="submit" className="w-full premium-gradient text-white py-6 rounded-[2.5rem] font-black uppercase tracking-[0.3em] shadow-2xl shadow-coffee-950/40 active:scale-[0.97] transition-all mt-6 text-sm">
            Authorize Addition
          </button>
        </form>
      </motion.div>
    </div>
  );
};

const Users = () => {
  const [users, setUsers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [search, setSearch] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll();
      setUsers(res.data || []);
    } catch (e) {
      toast.error('Authority Failure: Data inaccessible');
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAddUser = async (data) => {
    try {
      await userService.signup(data);
      toast.success('Personnel Registered Successfully');
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Authorization Denied');
    }
  };

  const handleUpdateStatus = async (user) => {
      try {
          await userService.updateStatus({ id: user.id, status: !user.status });
          toast.success('Access Privileges Updated');
          fetchUsers();
      } catch (err) {
          toast.error('Protocol Error: Status update failed');
      }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = [
    { label: 'Total Personnel', value: users.length, icon: UsersIcon, color: 'text-coffee-600' },
    { label: 'Active Sessions', value: users.filter(u => u.status).length, icon: Activity, color: 'text-green-500' },
    { label: 'Privileged Nodes', value: users.filter(u => u.role === 'ROLE_ADMIN').length, icon: ShieldAlert, color: 'text-amber-500' }
  ];

  return (
    <div className="space-y-10">
      {/* Premium Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
           <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter italic">Personnel Directory</h1>
           <div className="flex items-center gap-3 mt-2">
              <span className="bg-coffee-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest">Master Control</span>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-widest">Managing Organizational Access Levels</p>
           </div>
        </div>
        
        <div className="flex items-center gap-4">
            <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-coffee-500 transition-colors" size={16} />
                <input 
                    type="text" 
                    placeholder="Identify personnel..." 
                    value={search} onChange={(e) => setSearch(e.target.value)}
                    className="pl-12 pr-6 py-4 glass-card bg-white/20 dark:bg-gray-900/40 rounded-2xl outline-none focus:ring-2 focus:ring-coffee-500/20 transition-all font-bold w-full sm:w-80"
                />
            </div>
            <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setIsModalOpen(true)}
                className="bg-coffee-600 hover:bg-coffee-700 text-white px-8 py-4 rounded-xl flex items-center gap-3 shadow-2xl shadow-coffee-600/20 font-black uppercase text-[10px] tracking-[0.2em]"
            >
                <Plus size={16} /> Register New
            </motion.button>
        </div>
      </div>

      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {stats.map((stat, idx) => (
           <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} key={idx} className="glass-card p-8 rounded-[2.5rem] flex items-center justify-between group hover:border-coffee-500/30 transition-all">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">{stat.label}</p>
                <h3 className="text-3xl font-black dark:text-white mt-1">{stat.value}</h3>
              </div>
              <div className={`p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl ${stat.color} group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
           </motion.div>
        ))}
      </div>

      {/* Modern User Table Container */}
      <div className="glass-card rounded-[3rem] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-gray-400 dark:text-gray-500 text-[10px] uppercase font-black tracking-[0.2em] border-b border-gray-100/50 dark:border-gray-800/50">
                <th className="px-10 py-8 text-center w-24">Identity</th>
                <th className="px-10 py-8">Vitals & Domain</th>
                <th className="px-10 py-8">Communication</th>
                <th className="px-10 py-8">Clearance</th>
                <th className="px-10 py-8 text-right">Status Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100/30 dark:divide-gray-800/30">
              <AnimatePresence mode="popLayout">
                {filteredUsers.map((user) => (
                  <motion.tr 
                    layout
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    key={user.id} className="group hover:bg-gray-50/50 dark:hover:bg-gray-800/20 transition-all"
                  >
                    <td className="px-10 py-8">
                       <div className="relative inline-block">
                          <div className={`h-16 w-16 rounded-[1.5rem] flex items-center justify-center text-xl font-black uppercase transition-all shadow-lg ${user.status ? 'bg-coffee-100 text-coffee-800 dark:bg-amber-900/20 dark:text-amber-400' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                            {user.name && user.name.charAt(0)}
                          </div>
                          {user.status && (
                             <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-green-500 rounded-full border-4 border-white dark:border-gray-900 animate-pulse" />
                          )}
                       </div>
                    </td>
                    <td className="px-10 py-8">
                        <div>
                          <p className="text-xl font-black dark:text-white uppercase tracking-tighter italic flex items-center gap-2">
                             {user.name}
                             <ArrowUpRight size={14} className="opacity-0 group-hover:opacity-100 text-coffee-600 transition-all" />
                          </p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Personnel ID: CF-{user.id}</p>
                        </div>
                    </td>
                    <td className="px-10 py-8">
                       <div className="space-y-1">
                          <p className="text-xs font-black dark:text-gray-300 uppercase tracking-tight">{user.email}</p>
                          <p className="text-[10px] font-bold text-gray-500 uppercase">{user.contactNumber}</p>
                       </div>
                    </td>
                    <td className="px-10 py-8">
                      <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${user.role === 'ROLE_ADMIN' ? 'bg-amber-100/50 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' : 'bg-blue-100/50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'}`}>
                        {user.role === 'ROLE_ADMIN' ? <ShieldAlert size={14} /> : <Shield size={14} />}
                        <span>{user.role ? user.role.replace('ROLE_', '') : 'STAFF'}</span>
                      </div>
                    </td>
                    <td className="px-10 py-8 text-right">
                      <button 
                        onClick={() => handleUpdateStatus(user)} 
                        className={`inline-flex items-center gap-2 px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all active:scale-90 border ${user.status === true ? 'bg-green-100/30 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800/40' : 'bg-red-100/30 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800/40'}`}
                      >
                          {user.status === true ? <><UserCheck size={14} /><span>Authorized</span></>  : <><UserX size={14} /><span>Restricted</span></>}
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        <AddUserModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleAddUser} />
      </AnimatePresence>
    </div>
  );
};

export default Users;
