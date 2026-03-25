'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  ReferenceLine 
} from 'recharts';
import { 
  TrendingUp, 
  AlertTriangle, 
  Activity, 
  BarChart3, 
  Zap, 
  ShieldAlert
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { financeApi } from '@/lib/api';
import { Loader2, AlertOctagon } from 'lucide-react';

type Scenario = 'normal' | 'supply_shock' | 'rate_hike';

// Base mock data for past actuals and predicted future
const baseData = [
  { month: 'Jan', actualRevenue: 4000 },
  { month: 'Feb', actualRevenue: 4250 },
  { month: 'Mar', actualRevenue: 3800 },
  { month: 'Apr', actualRevenue: 4500 },
  { month: 'May', actualRevenue: 4750 },
  { month: 'Jun', actualRevenue: 4600 },
  { month: 'Jul', actualRevenue: 5100 }, // TODAY
  { month: 'Aug' },
  { month: 'Sep' },
  { month: 'Oct' },
  { month: 'Nov' },
  { month: 'Dec' },
];

const scenarios = {
  normal: {
    predicted: [5100, 5400, 5800, 6200, 6600, 7100],
    risk: null, // No risk scenario line
  },
  supply_shock: {
    predicted: [5100, 5400, 5800, 6200, 6600, 7100],
    risk: [5100, 4800, 4300, 3900, 3400, 3100],
  },
  rate_hike: {
    predicted: [5100, 5400, 5800, 6200, 6600, 7100],
    risk: [5100, 5000, 4800, 4500, 4200, 4000],
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 backdrop-blur-md border border-slate-200 p-4 rounded-2xl shadow-xl shadow-slate-900/5">
        <p className="font-extrabold text-slate-900 mb-2">{label} 2026</p>
        {payload.map((entry: any, index: number) => {
          let name = entry.name;
          if (name === 'actualRevenue') name = 'Actual Revenue';
          if (name === 'predictedRevenue') name = 'Predicted (AI Ideal)';
          if (name === 'riskScenario') name = 'Stress Scenario';

          return (
            <div key={index} className="flex items-center gap-3 mb-1.5 last:mb-0">
              <div 
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  entry.name === 'actualRevenue' && "bg-emerald-500",
                  entry.name === 'predictedRevenue' && "bg-emerald-400",
                  entry.name === 'riskScenario' && "bg-rose-500"
                )} 
              />
              <span className="text-[13px] font-bold text-slate-600 w-32">{name}:</span>
              <span className="text-[13px] font-black text-slate-900">
                ${entry.value.toLocaleString()}k
              </span>
            </div>
          );
        })}
      </div>
    );
  }
  return null;
};

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

export default function PredictiveAnalyticsPage() {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.company?.id;

  const [activeScenario, setActiveScenario] = useState<Scenario>('normal');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (companyId) {
      // Logic would fetch prediction data from backend
      // For now we simulate with a 1s delay and keep the mock visuals
      const timer = setTimeout(() => setIsLoading(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [companyId]);

  if (authLoading || (isLoading && companyId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">Please complete your company setup to view AI Revenue Predictions.</p>
        </div>
      </div>
    );
  }

  // Generate full dataset dynamically based on active scenario
  const chartData = baseData.map((data, index) => {
    // Indices 0-6 are past months (Jan to Jul)
    // Indices 6-11 are future months (Jul to Dec), index 6 acts as connection point
    if (index > 6) {
      return {
        ...data,
        predictedRevenue: scenarios[activeScenario].predicted[index - 6],
        ...(scenarios[activeScenario].risk 
            ? { riskScenario: scenarios[activeScenario].risk![index - 6] } 
            : {})
      };
    } else if (index === 6) {
      // Connect points at "TODAY"
      return {
        ...data,
        predictedRevenue: data.actualRevenue,
        ...(scenarios[activeScenario].risk ? { riskScenario: data.actualRevenue } : {})
      };
    }
    return data; // Past data
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-12 p-4 lg:p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-indigo-100/40 via-emerald-50/20 to-transparent pointer-events-none rounded-full blur-3xl mix-blend-multiply" />
      
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-3xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/30">
              <BarChart3 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
                AI Predictive Forecasting
                <span className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider border border-emerald-100">
                  <Zap className="w-3.5 h-3.5" /> 94% Confidence
                </span>
              </h1>
              <p className="text-slate-500 text-base font-medium mt-1">
                Machine learning revenue forecasts & stress test modeling.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Main Chart Area */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/60 rounded-3xl p-6 lg:p-8 shadow-sm hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-emerald-400 to-emerald-500" />
          
          <div className="flex justify-between items-start mb-8 relative z-10">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">H2 Revenue Predictions</h2>
              <p className="text-sm font-medium text-slate-500">Projected trajectory vs active stress test scenarios</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 bg-slate-50 border border-slate-100 px-4 py-2 rounded-xl">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Actual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-400 border border-dashed border-emerald-600" />
                <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Predicted</span>
              </div>
              {activeScenario !== 'normal' && (
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-sm bg-rose-500 border border-dashed border-rose-700" />
                  <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Stress Risk</span>
                </div>
              )}
            </div>
          </div>

          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 13, fontWeight: 700 }}
                  tickFormatter={(value) => `$${value}k`}
                  dx={-10}
                />
                <Tooltip content={<CustomTooltip />} />
                
                {/* Reference line for TODAY */}
                <ReferenceLine 
                  x="Jul" 
                  stroke="#indigo-500" 
                  strokeDasharray="4 4" 
                  label={{ value: "TODAY", position: "insideTopLeft", fill: "#6366f1", fontSize: 12, fontWeight: 800 }} 
                />

                {/* Actual Revenue Line (Solid Green) */}
                <Line 
                  type="monotone" 
                  dataKey="actualRevenue" 
                  stroke="#10b981" 
                  strokeWidth={4} 
                  dot={{ r: 4, strokeWidth: 2, fill: '#fff', stroke: '#10b981' }} 
                  activeDot={{ r: 8, strokeWidth: 0, fill: '#10b981' }}
                  isAnimationActive={true}
                />

                {/* Predicted Revenue Line (Dashed Green) */}
                <Line 
                  type="monotone" 
                  dataKey="predictedRevenue" 
                  stroke="#34d399" 
                  strokeWidth={3} 
                  strokeDasharray="8 8" 
                  dot={false}
                  activeDot={{ r: 6, fill: '#34d399', stroke: '#fff', strokeWidth: 2 }}
                />

                {/* Risk Scenario Line (Dashed Red) */}
                {(activeScenario === 'supply_shock' || activeScenario === 'rate_hike') && (
                  <Line 
                    type="monotone" 
                    dataKey="riskScenario" 
                    stroke="#f43f5e" 
                    strokeWidth={3} 
                    strokeDasharray="8 8" 
                    dot={false}
                    activeDot={{ r: 6, fill: '#f43f5e', stroke: '#fff', strokeWidth: 2 }}
                    animationDuration={1500}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Scenario Toggles */}
        <motion.div variants={itemVariants} className="bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm">
          <h3 className="text-sm font-extrabold text-slate-800 uppercase tracking-widest mb-4 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Active Stress Test Scenarios
          </h3>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={() => setActiveScenario('normal')}
              className={cn(
                "flex-1 relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group",
                activeScenario === 'normal' 
                  ? "border-emerald-500 bg-emerald-50/50 shadow-md shadow-emerald-500/10" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <TrendingUp className={cn("w-6 h-6 mb-2 transition-colors", activeScenario === 'normal' ? "text-emerald-600" : "text-slate-400 group-hover:text-slate-600")} />
              <div className={cn("text-sm font-bold transition-colors", activeScenario === 'normal' ? "text-emerald-900" : "text-slate-700")}>Normal Operations</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">Ideal market trajectory</div>
              {activeScenario === 'normal' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
            </button>

            <button
              onClick={() => setActiveScenario('supply_shock')}
              className={cn(
                "flex-1 relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group",
                activeScenario === 'supply_shock' 
                  ? "border-rose-500 bg-rose-50/50 shadow-md shadow-rose-500/10" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <AlertTriangle className={cn("w-6 h-6 mb-2 transition-colors", activeScenario === 'supply_shock' ? "text-rose-600" : "text-slate-400 group-hover:text-slate-600")} />
              <div className={cn("text-sm font-bold transition-colors", activeScenario === 'supply_shock' ? "text-rose-900" : "text-slate-700")}>Supply Chain Shock</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">-18% Red Sea disruptions</div>
              {activeScenario === 'supply_shock' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />}
            </button>

            <button
              onClick={() => setActiveScenario('rate_hike')}
              className={cn(
                "flex-1 relative overflow-hidden flex flex-col items-center justify-center p-5 rounded-2xl border-2 transition-all duration-300 group",
                activeScenario === 'rate_hike' 
                  ? "border-amber-500 bg-amber-50/50 shadow-md shadow-amber-500/10" 
                  : "border-slate-100 bg-white hover:border-slate-300 hover:bg-slate-50"
              )}
            >
              <ShieldAlert className={cn("w-6 h-6 mb-2 transition-colors", activeScenario === 'rate_hike' ? "text-amber-600" : "text-slate-400 group-hover:text-slate-600")} />
              <div className={cn("text-sm font-bold transition-colors", activeScenario === 'rate_hike' ? "text-amber-900" : "text-slate-700")}>Interest Rate Hike</div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1">+0.50% Capital constraints</div>
              {activeScenario === 'rate_hike' && <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
            </button>
          </div>
        </motion.div>

      </motion.div>
    </div>
  );
}
