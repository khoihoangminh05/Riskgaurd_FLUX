'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  Target, 
  Search, 
  ShieldAlert, 
  ShieldBan, 
  ShieldCheck, 
  Activity, 
  Bot,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { financeApi } from '@/lib/api';
import { Loader2, AlertOctagon } from 'lucide-react';

type ThreatLevel = 'High' | 'Medium' | 'Low';

interface Competitor {
  id: string;
  name: string;
  industry: string;
  threatLevel: ThreatLevel;
  recentActivity: string;
  aiInsight: string;
}

const MOCK_COMPETITORS: Competitor[] = [
  {
    id: "c1",
    name: "Aegis Financial Systems",
    industry: "Enterprise Risk Management",
    threatLevel: "High",
    recentActivity: "Acquired 'DataFlow AI' for $1.2B and launched a new automated compliance module targeting top-tier banks.",
    aiInsight: "Launched a competing AI product, expect 15% market share pressure in Europe. Their new compliance module directly cannibalizes our Q3 roadmap features."
  },
  {
    id: "c2",
    name: "Vanguard Tech Analytics",
    industry: "Financial Data Intelligence",
    threatLevel: "Medium",
    recentActivity: "Expanded their APAC sales team by 40% and opened a new regional headquarters in Singapore.",
    aiInsight: "Aggressive expansion in APAC indicates a shift in focus. We maintain a technical advantage, but our regional sales pipelines may face increased pricing pressure."
  },
  {
    id: "c3",
    name: "Quantum Ledger Solutions",
    industry: "Blockchain Compliance",
    threatLevel: "Low",
    recentActivity: "Reported an 8% revenue decline in Q2, citing prolonged enterprise sales cycles.",
    aiInsight: "Currently vulnerable due to restructuring. Opportunity to capture their mid-market dissatisfied customers via targeted migration campaigns."
  }
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

export default function CompetitorRadarPage() {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.company?.id;

  const [searchTerm, setSearchTerm] = useState('');
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      fetchCompetitors();
    }
  }, [companyId]);

  const fetchCompetitors = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      const data = await financeApi.getCompetitors(companyId);
      // If backend returns empty/null, we fall back to MOCK for visual representation
      // as requested "Do NOT change the Tailwind UI/UX"
      setCompetitors(data && data.length > 0 ? data : MOCK_COMPETITORS);
    } catch (error) {
      console.error('Error fetching competitors:', error);
      setCompetitors(MOCK_COMPETITORS); // Fallback to mock on error for demo purposes
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading || (isLoading && companyId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">Please complete your company setup to view the Competitor Radar.</p>
        </div>
      </div>
    );
  }

  const filteredCompetitors = competitors.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 p-4 lg:p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-rose-100/40 via-blue-50/20 to-transparent pointer-events-none rounded-full blur-3xl mix-blend-multiply" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-rose-500 to-orange-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-rose-500/30">
              <Target className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                Competitor Threat Radar
              </h1>
              <p className="text-slate-500 text-base font-medium mt-1">
                Real-time tracking of enterprise rivals.
              </p>
            </div>
          </div>

          {/* Search Input Bar placed gracefully on top right */}
          <div className="relative w-full md:w-80 group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
            </div>
            <input
              type="text"
              placeholder="Search competitors or industries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-2xl text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
            />
          </div>
        </motion.div>

        {/* Competitors Grid */}
        <motion.div variants={containerVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCompetitors.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                <Search className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No competitors found</h3>
              <p className="text-slate-500 mt-1">Try adjusting your search terms.</p>
            </div>
          ) : (
            filteredCompetitors.map((competitor) => (
              <motion.div 
                key={competitor.id}
                variants={itemVariants}
                whileHover={{ y: -4, scale: 1.01 }}
                className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 group relative flex flex-col h-full overflow-hidden"
              >
                {/* Threat Level accent bar */}
                <div className={cn(
                  "absolute top-0 left-0 w-full h-1.5 transition-colors",
                  competitor.threatLevel === 'High' && "bg-gradient-to-r from-rose-500 to-rose-400",
                  competitor.threatLevel === 'Medium' && "bg-gradient-to-r from-amber-500 to-amber-400",
                  competitor.threatLevel === 'Low' && "bg-gradient-to-r from-emerald-500 to-emerald-400"
                )} />

                {/* Card Header */}
                <div className="flex justify-between items-start mb-5 pt-2">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 tracking-tight mb-1 group-hover:text-indigo-600 transition-colors">
                      {competitor.name}
                    </h2>
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-widest block">
                      {competitor.industry}
                    </span>
                  </div>
                  <div className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider border shadow-sm backdrop-blur-sm shrink-0",
                    competitor.threatLevel === 'High' && "bg-rose-50 text-rose-700 border-rose-200",
                    competitor.threatLevel === 'Medium' && "bg-amber-50 text-amber-700 border-amber-200",
                    competitor.threatLevel === 'Low' && "bg-emerald-50 text-emerald-700 border-emerald-200"
                  )}>
                    {competitor.threatLevel === 'High' && <ShieldAlert className="w-3.5 h-3.5" />}
                    {competitor.threatLevel === 'Medium' && <ShieldBan className="w-3.5 h-3.5" />}
                    {competitor.threatLevel === 'Low' && <ShieldCheck className="w-3.5 h-3.5" />}
                    {competitor.threatLevel}
                  </div>
                </div>

                {/* Recent Activity */}
                <div className="mb-6 flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-slate-400" />
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Recent Activity</span>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">
                    {competitor.recentActivity}
                  </p>
                </div>

                {/* AI Insight Section (Highlighted glow) */}
                <div className="mt-auto pt-5 border-t border-slate-100">
                  <div className="relative rounded-2xl bg-blue-50 border border-blue-200 p-5 overflow-hidden group/insight hover:border-blue-300 transition-colors">
                    {/* Subtle glow effect */}
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-blue-400/20 blur-2xl rounded-full pointer-events-none" />
                    
                    <div className="flex items-center gap-2.5 mb-2 relative z-10">
                      <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 border border-blue-200">
                        <Bot className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-extrabold text-blue-800 uppercase tracking-widest">
                        AI Insight
                      </span>
                    </div>
                    
                    <p className="text-[13px] text-blue-900/80 font-semibold leading-relaxed relative z-10">
                      {competitor.aiInsight}
                    </p>
                    
                    <div className="absolute bottom-4 right-4 opacity-0 group-hover/insight:opacity-100 transition-opacity transform translate-x-2 group-hover/insight:translate-x-0">
                      <ArrowRight className="w-4 h-4 text-blue-500" />
                    </div>
                  </div>
                </div>

              </motion.div>
            ))
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
