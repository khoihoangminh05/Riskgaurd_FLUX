'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Filter, 
  ShieldAlert,
  TerminalSquare,
  Globe,
  Truck,
  Database,
  Loader2,
  AlertOctagon,
  Zap,
  Sparkles,
  History,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Info,
  Trash2,
  Star,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { toast } from 'sonner';

type Severity = 'HIGH' | 'MEDIUM' | 'LOW';

interface RiskAlert {
  id: string;
  timestamp: string;
  severity: Severity;
  source: string;
  sourceType: 'ai' | 'system' | 'market' | 'supply_chain' | 'financial';
  summary: string;
  isImportant: boolean;
}

export default function RiskAlertsPage() {
  const { user, loading: authLoading } = useAuth();
  const company = user?.company;

  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState<'ALL' | Severity>('ALL');
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    if (company?.id) {
      fetchAlerts();
    }
  }, [company?.id]);

  const fetchAlerts = async () => {
    if (!company?.id) return;
    try {
      setIsLoading(true);
      const data = await api.getAlerts(company.id);
      
      const mappedAlerts: RiskAlert[] = data.map((a: any) => ({
        id: a.id,
        timestamp: new Date(a.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        severity: a.severity as Severity,
        source: 'AI Risk Engine',
        sourceType: 'ai',
        summary: a.message,
        isImportant: a.isImportant || false
      }));
      
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logic 1 (Force AI Scan)
  const handleForceScan = async () => {
    if (!company?.id) {
      toast.error('Company ID not found. Please complete setup.');
      return;
    }
    try {
      setIsAnalyzing(true);
      toast.info('Agents are analyzing market & internal data...', {
          description: 'This usually takes 10-30 seconds.'
      });
      
      await api.triggerFullAnalysis(company.id);
      
      toast.success('AI Analysis Completed', {
        description: 'New risks have been identified and logged.',
      });
      await fetchAlerts();
    } catch (error: any) {
      console.error('Error triggering analysis:', error);
      const errorMsg = error.response?.data?.message || 'AI agents are currently busy. Try again soon.';
      toast.error(`Analysis failed: ${errorMsg}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Logic 2 (Delete Alert)
  const handleDelete = async (alertId: string) => {
    if (!confirm('Are you sure you want to delete this alert?')) return;
    
    try {
      // Optimistic update
      setAlerts(prev => prev.filter(a => a.id !== alertId));
      await api.deleteAlert(alertId);
      toast.success('Alert deleted');
    } catch (error) {
      console.error('Error deleting alert:', error);
      toast.error('Failed to delete alert');
      // Rollback if needed, but for simplicity we'll just re-fetch
      await fetchAlerts();
    }
  };

  // Logic 3 (Toggle Important)
  const handleToggleImportant = async (alertId: string, currentStatus: boolean) => {
    try {
      // Optimistic update
      setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, isImportant: !currentStatus } : a));
      await api.toggleAlertImportance(alertId);
      toast.info(!currentStatus ? 'Marked as important' : 'Removed from importance');
    } catch (error) {
      console.error('Error toggling importance:', error);
      toast.error('Failed to update alert');
      await fetchAlerts();
    }
  };

  const filteredAlerts = useMemo(() => {
    return alerts.filter(alert => {
      const matchesSearch = 
        alert.summary.toLowerCase().includes(searchTerm.toLowerCase()) || 
        alert.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSeverity = severityFilter === 'ALL' || alert.severity === severityFilter;
      
      return matchesSearch && matchesSeverity;
    });
  }, [searchTerm, severityFilter, alerts]);

  const getSourceIcon = (type: string) => {
    switch(type) {
      case 'system': return <TerminalSquare className="w-4 h-4" />;
      case 'ai': return <Zap className="w-4 h-4 text-indigo-400" />;
      case 'market': return <Globe className="w-4 h-4" />;
      case 'supply_chain': return <Truck className="w-4 h-4" />;
      case 'financial': return <Database className="w-4 h-4" />;
      default: return <Info className="w-4 h-4" />;
    }
  };

  if (authLoading || (isLoading && company?.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
      </div>
    );
  }

  if (!company?.id) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8 bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl max-w-md">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-slate-400">Please complete your company setup to view the Risk Incident Log.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 pb-12 p-4 lg:p-8 overflow-hidden relative text-slate-200">
      {/* Background Effects */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-rose-500/5 pointer-events-none rounded-full blur-[120px]" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 pointer-events-none rounded-full blur-[120px]" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/20">
                <ShieldAlert className="w-6 h-6 text-rose-500" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-white uppercase italic">Risk Incident Log</h1>
            </div>
            <p className="text-slate-400 max-w-2xl text-lg font-light">
              Full AI-powered market monitoring for {company.name}.
            </p>
          </div>

          <button
            onClick={handleForceScan}
            disabled={isAnalyzing}
            className="flex items-center gap-2 px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-rose-900/20 disabled:opacity-70 border border-rose-400/20 overflow-hidden relative group"
          >
            {isAnalyzing ? (
              <>
                <RefreshCw className="w-5 h-5 animate-spin" />
                <span>Agents Analyzing...</span>
                <motion.div 
                  initial={{ x: '-100%' }}
                  animate={{ x: '100%' }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                />
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Cảnh báo lập tức</span>
              </>
            )}
          </button>
        </div>

        {/* Filters Bar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-8 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
          <div className="md:col-span-8 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
            <input 
              type="text"
              placeholder="Search incidents, sources, or IDs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 outline-none transition-all text-white placeholder:text-slate-600"
            />
          </div>
          <div className="md:col-span-4 flex gap-2">
            <Filter className="w-5 h-5 text-slate-500 mt-3 ml-2 shrink-0 md:hidden lg:block" />
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value as any)}
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500/50 outline-none transition-all text-white"
            >
              <option value="ALL">All Severities</option>
              <option value="HIGH">High Severity</option>
              <option value="MEDIUM">Medium Severity</option>
              <option value="LOW">Low Severity</option>
            </select>
          </div>
        </div>

        {/* Alerts List */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-sm shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/80">
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest w-10"></th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Timestamp</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Severity</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest whitespace-nowrap">Source</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest">Summary</th>
                  <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <AnimatePresence mode="popLayout">
                  {filteredAlerts.length > 0 ? (
                    filteredAlerts.map((alert) => (
                      <motion.tr 
                        key={alert.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={cn(
                          "group hover:bg-slate-800/50 transition-colors relative",
                          alert.severity === 'HIGH' && "bg-rose-500/[0.02]",
                          alert.isImportant && "bg-amber-500/[0.03]"
                        )}
                      >
                        <td className="px-4 py-5">
                          <button 
                            onClick={() => handleToggleImportant(alert.id, alert.isImportant)}
                            className={cn(
                              "transition-all duration-300 transform hover:scale-125",
                              alert.isImportant ? "text-amber-500 fill-amber-500" : "text-slate-600 hover:text-amber-400"
                            )}
                          >
                            <Star className="w-5 h-5" />
                          </button>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-slate-400">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-mono">{alert.timestamp}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase border",
                            alert.severity === 'HIGH' && "bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-[0_0_12px_rgba(244,63,94,0.2)]",
                            alert.severity === 'MEDIUM' && "bg-amber-500/10 text-amber-500 border-amber-500/20",
                            alert.severity === 'LOW' && "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          )}>
                            {alert.severity}
                          </span>
                        </td>
                        <td className="px-6 py-5 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <div className={cn(
                                "p-1.5 rounded-md border",
                                alert.severity === 'HIGH' ? "border-rose-500/20 bg-rose-500/5" : "border-slate-700 bg-slate-800/50"
                            )}>
                              {getSourceIcon(alert.sourceType)}
                            </div>
                            <span className="text-sm font-bold text-slate-300">{alert.source}</span>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <p className={cn(
                            "text-sm leading-relaxed max-w-xl",
                            alert.severity === 'HIGH' ? "text-slate-100 font-medium" : "text-slate-400",
                            alert.isImportant && "text-slate-200"
                          )}>
                            {alert.summary}
                          </p>
                        </td>
                        <td className="px-6 py-5 text-right whitespace-nowrap">
                          <button 
                            onClick={() => handleDelete(alert.id)}
                            className="p-2 text-slate-600 hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all transform hover:rotate-12"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                    >
                      <td colSpan={6} className="px-6 py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <CheckCircle2 className="w-12 h-12 text-slate-800" />
                          <p className="text-slate-500 text-lg">Your risk horizon is clear.</p>
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
