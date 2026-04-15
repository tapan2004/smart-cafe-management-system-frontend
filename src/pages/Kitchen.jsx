import { useState, useEffect, useCallback, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { ChefHat, Clock, CheckCircle2, PlayCircle, UtensilsCrossed, Zap, Activity, AlertCircle, Timer, Award } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

const Kitchen = () => {
  const [orders, setOrders] = useState([]);
  const [stompClient, setStompClient] = useState(null);
  const [connected, setConnected] = useState(false);
  const [now, setNow] = useState(Date.now());
  const clientRef = useRef(null);

  // Update time for elapsed counters
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchActiveOrders = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:8080/bill/getActiveOrders', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Normalize orders from backend to include receivedAt if missing
        const normalized = response.data.map(o => ({ ...o, receivedAt: o.receivedAt || Date.now() }));
        setOrders(normalized);
      } catch (error) {
        toast.error('Protocol Failure: Live link inactive');
      }
    };

    fetchActiveOrders();

    const client = new Client({
      webSocketFactory: () => new SockJS('http://localhost:8080/ws-cafe'),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        client.subscribe('/topic/kitchen', (message) => {
          const newOrder = JSON.parse(message.body);
          setOrders((prev) => {
             if (prev.find(o => o.uuid === newOrder.uuid)) return prev;
             return [...prev, { ...newOrder, receivedAt: Date.now() }];
          });
          toast.success(`Priority Order: ${newOrder.customerName}`, {
            icon: '🔥',
            style: { borderRadius: '20px', background: '#1a1a1a', color: '#fff', border: '1px solid #a38068' }
          });
        });

        client.subscribe('/topic/order-updates', (message) => {
          const update = JSON.parse(message.body);
          setOrders((prev) =>
            prev.map((order) =>
              order.uuid === update.uuid ? { ...order, status: update.status } : order
            )
          );
        });
      },
      onDisconnect: () => setConnected(false),
      onStompError: (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
        console.error('Additional details: ' + frame.body);
      }
    });

    client.activate();
    clientRef.current = client;
    setStompClient(client);

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const updateStatus = (uuid, newStatus) => {
    if (stompClient && connected) {
      stompClient.publish({
        destination: '/app/update-status',
        body: JSON.stringify({ uuid, status: newStatus }),
      });
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PLACED': return { color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-blue-500/30 shadow-blue-500/5', label: 'In Queue' };
      case 'PREPARING': return { color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/40 shadow-amber-500/10', label: 'Processing' };
      case 'READY': return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/30 shadow-green-500/5', label: 'Finalized' };
      default: return { color: 'text-gray-400', bg: 'bg-gray-500/10', border: 'border-gray-500/20', label: 'Status Unknown' };
    }
  };

  const activeOrders = orders.filter(o => o.status !== 'COMPLETED');
  
  // Throughput Calculation (Simplified for UI)
  const throughput = ((orders.filter(o => o.status === 'COMPLETED').length / (orders.length || 1)) * 100).toFixed(0);

  return (
    <div className="space-y-10">
      <Toaster position="top-right" />
      
      {/* KDS Operations Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-8">
        <div className="flex items-center gap-6">
          <div className="p-6 premium-gradient text-white rounded-[2.5rem] shadow-2xl shadow-coffee-900/40">
            <ChefHat size={40} />
          </div>
          <div>
            <h1 className="text-5xl font-black dark:text-white uppercase tracking-tighter italic">Kitchen Monitor</h1>
            <div className="flex items-center gap-3 mt-2">
               <span className={`h-2 w-2 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
               <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">{connected ? 'Live Sync Active' : 'Protocol Disconnected'}</p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
                { label: 'Pending', value: activeOrders.filter(o => o.status === 'PLACED').length, color: 'text-blue-500' },
                { label: 'Preparing', value: activeOrders.filter(o => o.status === 'PREPARING').length, color: 'text-amber-500' },
                { label: 'SKU Load', value: activeOrders.reduce((sum, o) => sum + o.items.length, 0), color: 'text-red-500' },
                { label: 'Throughput', value: `${throughput}%`, color: 'text-coffee-600' }
            ].map((stat, i) => (
                <div key={i} className="glass-card px-6 py-4 rounded-3xl min-w-[120px]">
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                    <p className={`text-2xl font-black italic tracking-tighter ${stat.color}`}>{stat.value}</p>
                </div>
            ))}
        </div>
      </div>

      {/* Dynamic Order Array */}
      <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 3xl:grid-cols-4 gap-8">
        <AnimatePresence mode="popLayout">
          {activeOrders.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="col-span-full h-[400px] glass-card rounded-[3rem] border-2 border-dashed border-gray-100 dark:border-gray-800 flex flex-col items-center justify-center text-center p-10"
            >
              <div className="p-8 bg-gray-50 dark:bg-gray-900 rounded-full mb-6 opacity-40">
                <Award size={64} className="text-gray-400" />
              </div>
              <h2 className="text-3xl font-black text-gray-400 uppercase tracking-tighter italic">Mission Accomplished</h2>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mt-3">All Active Orders Dispatched From Tactical Kitchen Zone</p>
            </motion.div>
          ) : (
            activeOrders.map((order) => {
              const status = getStatusConfig(order.status);
              const elapsed = Math.floor((now - (order.receivedAt || Date.now())) / 1000);
              const min = Math.floor(elapsed / 60);
              const sec = elapsed % 60;
              
              return (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, x: -50 }}
                  key={order.uuid} 
                  className={`glass-card rounded-[3rem] overflow-hidden border transition-all duration-500 ${status.border} group`}
                >
                  {/* Top Identifier Bar */}
                  <div className={`p-8 border-b ${status.border} flex justify-between items-start ${status.bg} transition-colors duration-500`}>
                    <div>
                        <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter leading-none italic">{order.customerName}</h3>
                        <div className="flex items-center gap-2 mt-2">
                           <span className="text-[9px] font-bold text-gray-500 uppercase tracking-widest">ORDER ID: {order.uuid.slice(-6)}</span>
                        </div>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${status.border} ${status.color}`}>
                           {status.label}
                        </span>
                        <div className="flex items-center gap-1.5 text-gray-400">
                           <Timer size={12} className={elapsed > 300 ? 'text-red-500 animate-pulse' : ''} />
                           <span className={`text-xs font-black tabular-nums ${elapsed > 300 ? 'text-red-500' : ''}`}>
                              {min}:{sec.toString().padStart(2, '0')}
                           </span>
                        </div>
                    </div>
                  </div>

                  {/* Operational SKU List */}
                  <div className="p-8 space-y-4 min-h-[160px]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/40 rounded-2xl group-hover:bg-white dark:group-hover:bg-gray-800 transition-all duration-300">
                        <div className="flex items-center gap-4">
                           <div className="p-3 bg-coffee-100 dark:bg-amber-900/20 rounded-xl text-coffee-800 dark:text-amber-400 font-black italic text-sm">
                             {item.quantity}x
                           </div>
                           <p className="text-lg font-black dark:text-gray-100 uppercase tracking-tighter truncate max-w-[150px]">{item.productName}</p>
                        </div>
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest bg-gray-100 dark:bg-gray-950 px-3 py-1 rounded-lg">
                           {item.categoryName}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Command Interface */}
                  <div className="p-8 pt-0">
                    <div className="flex gap-4">
                      {order.status === 'PLACED' && (
                        <button
                          onClick={() => updateStatus(order.uuid, 'PREPARING')}
                          className="flex-1 premium-gradient text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                        >
                          <PlayCircle size={18} /> Begin Mission
                        </button>
                      )}
                      {order.status === 'PREPARING' && (
                        <button
                          onClick={() => updateStatus(order.uuid, 'READY')}
                          className="flex-1 bg-green-500 hover:bg-green-600 text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all"
                        >
                          <CheckCircle2 size={18} /> Signal Ready
                        </button>
                      )}
                      {order.status === 'READY' && (
                        <button
                          onClick={() => updateStatus(order.uuid, 'COMPLETED')}
                          className="flex-1 bg-gray-950 dark:bg-gray-800 hover:bg-black text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all border border-white/5"
                        >
                          Deliver To Target
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Technical Progress Indicator */}
                  <div className="h-2 w-full bg-gray-100 dark:bg-gray-900 overflow-hidden">
                    <motion.div 
                      layout
                      className={`h-full transition-all duration-1000 ${
                        order.status === 'PLACED' ? 'w-1/3 bg-blue-500/50 shadow-[0_0_15px_#3b82f6]' : 
                        order.status === 'PREPARING' ? 'w-2/3 bg-amber-500 animate-pulse shadow-[0_0_20px_#f59e0b]' : 
                        'w-full bg-green-500 shadow-[0_0_20px_#10b981]'
                      }`}
                    />
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Kitchen;
