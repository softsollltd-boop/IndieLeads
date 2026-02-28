import React, { useState } from 'react';
import {
  ShieldCheck, Globe, TrendingUp, Play, Zap, ChevronRight, Fingerprint
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const historyData = [
  { day: 'Mon', score: 85 }, { day: 'Tue', score: 82 }, { day: 'Wed', score: 88 }, { day: 'Thu', score: 92 },
  { day: 'Fri', score: 94 }, { day: 'Sat', score: 96 }, { day: 'Sun', score: 98 },
];

const DeliverabilityLabPage: React.FC = () => {
  const isEthereal = true;
  const [isTesting, setIsTesting] = useState(false);
  const primaryColor = '#10b981';

  return (
    <div className="space-y-8 fade-in pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black font-heading tracking-tight text-[#064e3b]">Deliverability Lab</h1>
          <p className="text-slate-600 font-medium">Protocol simulation, seed testing, and content fingerprinting.</p>
        </div>
        <button
          onClick={() => { setIsTesting(true); setTimeout(() => setIsTesting(false), 2000); }}
          className="btn-primary px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl active:scale-95 flex items-center"
        >
          {isTesting ? <Zap className="w-4 h-4 mr-3 animate-spin" /> : <Play className="w-4 h-4 mr-3" />}
          {isTesting ? 'Simulating Seed Flow...' : 'Launch Placement Audit'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="glass-surface rounded-[2.5rem] p-10 flex flex-col items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 blur-3xl opacity-10 -mr-16 -mt-16 bg-[#10b981]"></div>
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-10">Network Reputation</h3>
          <div className="relative w-48 h-48 flex items-center justify-center mb-8">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-slate-100" />
              <motion.circle
                cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="12" fill="transparent"
                strokeDasharray={502}
                initial={{ strokeDashoffset: 502 }}
                animate={{ strokeDashoffset: 502 - (502 * 0.98) }}
                transition={{ duration: 2, ease: "easeOut" }}
                style={{ stroke: primaryColor }}
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-5xl font-black font-heading text-[#064e3b]">98</span>
              <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Excellent</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 w-full">
            <div className="text-center">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Blacklists</p>
              <p className="text-lg font-black text-slate-700">0/120</p>
            </div>
            <div className="text-center border-l border-slate-500/10">
              <p className="text-[10px] font-black text-slate-500 uppercase mb-1">Risk Score</p>
              <p className="text-lg font-black text-emerald-500">0.02%</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 glass-surface rounded-[2.5rem] p-10">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-lg font-black font-heading flex items-center text-[#064e3b]">
              <TrendingUp className="w-5 h-5 mr-3 text-[#10b981]" /> Deliverability Pulse
            </h3>
            <div className="flex items-center space-x-2">
              <div className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></div>
              <span className="text-[10px] font-black text-slate-500 uppercase">System Integrity %</span>
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={historyData}>
                <defs>
                  <linearGradient id="colorLab" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={primaryColor} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={primaryColor} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" axisLine={false} tickLine={false} stroke="#94a3b8" fontSize={11} dy={10} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip contentStyle={{ backgroundColor: '#fff', border: 'none', borderRadius: '16px' }} />
                <Area type="monotone" dataKey="score" stroke={primaryColor} strokeWidth={4} fill="url(#colorLab)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="glass-surface rounded-[3rem] p-12 flex flex-col lg:row-span-1 lg:flex-row items-center gap-12 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 blur-[100px] opacity-10 -ml-32 -mt-32 bg-[#10b981]"></div>
        <div className="w-24 h-24 rounded-[2rem] flex items-center justify-center shrink-0 shadow-2xl relative z-10 bg-[#10b981]">
          <Fingerprint className="text-white" size={48} />
          <div className="absolute -top-3 -right-3 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-lg">
            <ShieldCheck size={16} className="text-white" />
          </div>
        </div>
        <div className="flex-1 relative z-10">
          <h4 className="text-2xl font-black font-heading mb-4 text-[#064e3b]">Advanced Content Fingerprinting</h4>
          <p className="text-slate-600 text-sm font-medium leading-relaxed max-w-2xl">
            Every campaign is analyzed across 50+ global ISP signal pools. We detect spam-trigger patterns, signature integrity, and HTML-to-text ratios before a single email is dispatched.
          </p>
        </div>
        <button className="px-10 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] border transition-all relative z-10 bg-white border-slate-100 text-[#064e3b] shadow-sm">
          Audit History <ChevronRight size={14} className="inline ml-3" />
        </button>
      </div>
    </div>
  );
};

export default DeliverabilityLabPage;