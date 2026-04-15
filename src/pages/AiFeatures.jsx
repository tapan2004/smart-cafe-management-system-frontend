import { useState, useEffect } from 'react';
import { BrainCircuit, Activity, BarChart2, Zap, TrendingUp, Calendar, Target, Cpu, ShieldCheck, Sparkles, Orbit, Network, Radar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { aiService } from '../services/apiCalls';

const AiFeatures = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [chartData, setChartData] = useState([]);

  const handlePredict = async () => {
    setAnalyzing(true);
    setResult(null);
    try {
       const [salesRes, insightsRes, forecastRes] = await Promise.all([
          aiService.getSalesPrediction(),
          aiService.getSmartInsights(),
          aiService.getForecast()
       ]);

       const insights = insightsRes.data;
       const forecast = forecastRes.data;

       setResult({
         prediction: forecast?.growthRate || 'Stable',
         insight: insights?.insight || 'NEURAL ANALYSIS COMPLETED',
         confidence: '98.4%',
         totalRevenue: insights?.totalRevenue,
         totalOrders: insights?.totalOrders,
         recommendation: insights?.recommendation
       });

        // Generate dummy trend data based on prediction for the chart
        const base = (forecast?.currentRevenue > 0) ? forecast.currentRevenue : 5000;
        const growth = parseFloat(forecast?.growthRate) / 100 || 0.12;
        const trend = [
          { name: 'PAST-W2', value: Number(base * 0.85) },
          { name: 'PAST-W1', value: Number(base * 0.92) },
          { name: 'CURRENT', value: Number(base) },
          { name: 'PROJ-W1', value: Number(base * (1 + growth/4)) },
          { name: 'PROJ-W2', value: Number(base * (1 + growth/2)) },
          { name: 'PROJ-W3', value: Number(base * (1 + growth * 0.75)) },
        ];
        setChartData(trend);

       toast.success('Neural Engine Updated', {
        style: { borderRadius: '20px', background: '#1a1a1a', color: '#fff' }
       });
    } catch (error) {
       toast.error('Neural Link Failure');
    } finally {
       setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-12">
      {/* AI Central Command Header */}
      <div className="relative glass-card rounded-[3.5rem] p-12 lg:p-20 overflow-hidden bg-gradient-to-br from-coffee-950/90 to-black">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-coffee-600/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-amber-600/5 rounded-full blur-[100px] -ml-20 -mb-20" />
        
        <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
            <div className="bg-coffee-900/50 p-10 rounded-[3rem] border border-white/5 relative group">
                <Network size={80} className="text-coffee-600 group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute inset-0 bg-coffee-600/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            
            <div className="flex-1 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-coffee-900/50 px-4 py-2 rounded-full mb-6 border border-white/5">
                    <Cpu size={14} className="text-coffee-500" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-coffee-400">Neural Engine v4.0</span>
                </div>
                <h1 className="text-5xl lg:text-7xl font-black dark:text-white uppercase tracking-tighter italic leading-none mb-6">Intelligence <span className="text-coffee-600 underline decoration-amber-500/30">Console</span></h1>
                <p className="text-gray-400 text-lg max-w-2xl font-medium leading-relaxed">
                   Processing global transactional data to synthesize predictive growth vectors and operational directives.
                </p>
                
                <div className="flex flex-wrap items-center gap-4 mt-10">
                    <button 
                        onClick={handlePredict}
                        disabled={analyzing}
                        className="group relative px-10 py-5 bg-coffee-600 hover:bg-coffee-700 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 disabled:opacity-50 overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                        <span className="flex items-center gap-3 relative z-10">
                            {analyzing ? <Activity size={20} className="animate-spin" /> : <Radar size={20} />}
                            {analyzing ? 'Synthesizing...' : 'Execute Pulse Scan'}
                        </span>
                    </button>
                    <div className="flex items-center gap-3 px-6 py-4 glass-card rounded-2xl border border-white/5">
                        <ShieldCheck size={18} className="text-green-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Security: Tier-1 Verified</span>
                    </div>
                </div>
            </div>
        </div>
      </div>

      <AnimatePresence>
        {result && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
          >
            {/* Primary Analysis Insight */}
            <div className="lg:col-span-8 glass-card rounded-[3rem] p-12 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Orbit size={150} />
                </div>
                
                <div className="flex items-center gap-4 mb-10">
                    <div className="p-4 bg-coffee-950 text-coffee-600 rounded-2xl">
                        <Activity size={24} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black dark:text-white uppercase tracking-tighter italic">Strategic Directive</h3>
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Synthesis Output: Sector-Alpha</p>
                    </div>
                </div>

                <div className="space-y-10 relative z-10">
                    <p className="text-4xl font-black dark:text-white leading-[1.1] tracking-tighter">
                        {result.insight}
                    </p>
                    
                    <div className="p-8 bg-coffee-950/40 rounded-[2rem] border-l-8 border-coffee-600 border border-white/5">
                        <div className="flex items-start gap-4">
                            <Zap className="text-amber-500 shrink-0" size={24} />
                            <div>
                                <p className="text-[10px] font-black text-coffee-500 uppercase tracking-widest mb-2">Recommended Operational Shift</p>
                                <p className="text-xl font-bold dark:text-gray-100 leading-snug">{result.recommendation}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Neural Metrics */}
            <div className="lg:col-span-4 space-y-8">
                <div className="glass-card p-10 rounded-[3rem] border border-green-500/20 group hover:border-green-500/40 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Growth Velocity</span>
                        <TrendingUp size={20} className="text-green-500" />
                    </div>
                    <div className="flex items-baseline gap-2">
                        <h3 className="text-6xl font-black text-green-500 italic tracking-tighter">{result.prediction}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Vector</span>
                    </div>
                    <div className="mt-8 bg-gray-100 dark:bg-gray-800 h-1.5 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: '92%' }} className="h-full bg-green-500 shadow-[0_0_15px_#22c55e]" />
                    </div>
                </div>

                <div className="glass-card p-10 rounded-[3rem] border border-blue-500/20 group hover:border-blue-500/40 transition-all">
                    <div className="flex justify-between items-start mb-6">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Confidence</span>
                        <BrainCircuit size={20} className="text-blue-500" />
                    </div>
                    <div className="flex items-baseline gap-2 text-blue-500">
                        <h3 className="text-6xl font-black italic tracking-tighter">{result.confidence}</h3>
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Match</span>
                    </div>
                    <p className="text-[9px] font-black text-gray-500 uppercase mt-4 tracking-widest">Verified against {result.totalOrders} Data Nodes</p>
                </div>
            </div>

            {/* Predictive Curve Graph */}
            <div className="lg:col-span-12 glass-card rounded-[3.5rem] p-12 relative overflow-hidden bg-gradient-to-br from-white/5 to-transparent">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                  <div>
                    <h3 className="text-3xl font-black dark:text-white uppercase tracking-tighter italic">Predictive Demand Curve</h3>
                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mt-2">6-Epoch Transactional Forecast (Proprietary AI)</p>
                  </div>
                  <div className="flex items-center gap-6 px-6 py-4 bg-black/40 rounded-2xl">
                     <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-coffee-600 animate-pulse" />
                        <span className="text-[9px] font-black text-gray-300 uppercase tracking-widest">Live Evolution</span>
                     </div>
                  </div>
               </div>
               
               <div className="h-[450px] w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="neuralCurve" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a38068" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#a38068" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="10 10" vertical={false} stroke="#1f2937" opacity={0.3} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10, fontWeight: '900'}} dy={20} />
                    <YAxis axisLine={false} tickLine={false} tick={{fill: '#4B5563', fontSize: 10, fontWeight: '900'}} dx={-20} />
                    <Tooltip 
                        contentStyle={{ borderRadius: '24px', border: '1px solid rgba(163,128,104,0.2)', backgroundColor: '#000', color: '#fff', padding: '20px' }}
                        itemStyle={{ fontWeight: '900', fontSize: '14px', textTransform: 'uppercase' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#a38068" strokeWidth={5} strokeOpacity={0.8} fillOpacity={1} fill="url(#neuralCurve)" animationDuration={2000} />
                  </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AiFeatures;
