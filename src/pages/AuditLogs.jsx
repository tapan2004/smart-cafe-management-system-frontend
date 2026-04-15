import { useState, useEffect } from 'react';
import { ShieldCheck, History, User, Clock, Search, Activity, Terminal } from 'lucide-react';
import { motion } from 'framer-motion';
import { auditService } from '../services/apiCalls';
import { toast } from 'react-hot-toast';

const AuditLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        auditService.getAll()
            .then(res => {
                setLogs(res.data);
                setLoading(false);
            })
            .catch(() => {
                toast.error('Tactical Feed Offline');
                setLoading(false);
            });
    }, []);

    const filteredLogs = logs.filter(log => 
        log.action.toLowerCase().includes(search.toLowerCase()) ||
        log.performedBy.toLowerCase().includes(search.toLowerCase()) ||
        log.details.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center h-full gap-4">
            <Activity className="animate-spin text-coffee-600" size={48} />
            <p className="text-xs font-black uppercase tracking-[0.4em] text-gray-400">Syncing Audit Trail...</p>
        </div>
    );

    return (
        <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="p-6 premium-gradient text-white rounded-[2.5rem] shadow-2xl">
                        <ShieldCheck size={40} />
                    </div>
                    <div>
                        <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter italic">Operational Audit</h1>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2">Immutable System Activity Log</p>
                    </div>
                </div>

                <div className="relative w-full lg:w-96">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search trail protocols..."
                        className="w-full bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-3xl py-5 pl-16 pr-6 outline-none focus:border-coffee-500 transition-all font-bold dark:text-white"
                    />
                </div>
            </div>

            {/* Timeline Feed */}
            <div className="glass-card rounded-[3.5rem] p-10 lg:p-16">
                <div className="space-y-4">
                    {filteredLogs.map((log, idx) => (
                        <motion.div 
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            key={log.id} 
                            className="group flex flex-col md:flex-row md:items-center gap-6 p-8 bg-gray-50/50 dark:bg-black/20 hover:bg-white dark:hover:bg-gray-900 rounded-[2.5rem] border border-transparent hover:border-coffee-500/20 transition-all"
                        >
                            <div className={`p-4 rounded-2xl flex items-center justify-center ${
                                log.action.includes('DELETE') ? 'bg-red-500/10 text-red-500' : 'bg-green-500/10 text-green-500'
                            }`}>
                                <Terminal size={24} />
                            </div>

                            <div className="flex-1">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-2">
                                    <h3 className="text-lg font-black dark:text-white uppercase tracking-tighter">{log.action}</h3>
                                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-wider text-gray-500">
                                        <Clock size={12} />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                </div>
                                <p className="text-gray-400 font-medium text-sm leading-relaxed mb-4">
                                    {log.details}
                                </p>
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-lg bg-coffee-100 dark:bg-gray-800 flex items-center justify-center">
                                        <User size={14} className="text-coffee-600" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase text-coffee-600 tracking-widest">{log.performedBy}</span>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                    {filteredLogs.length === 0 && (
                        <div className="text-center py-20">
                            <History size={48} className="mx-auto text-gray-300 mb-6 opacity-20" />
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">No Trace Found</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogs;
