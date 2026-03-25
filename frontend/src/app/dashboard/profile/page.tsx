'use client';

import React, { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import {
  Settings2,
  Save,
  Mail,
  Target,
  Tag,
  X,
  Plus,
  AlertOctagon,
  Building2,
  Clock,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { financeApi } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

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

export default function RiskProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const companyId = user?.company?.id;

  // State Management matching backend Entity
  const [emailRecipients, setEmailRecipients] = useState<string[]>([]);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [competitors, setCompetitors] = useState<string[]>([]);
  const [riskThreshold, setRiskThreshold] = useState<number>(70);
  const [monitoringFrequency, setMonitoringFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  // UI States
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Input states for arrays
  const [newEmail, setNewEmail] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [newCompetitor, setNewCompetitor] = useState('');

  // 1. Fetch exactly on Mount
  useEffect(() => {
    if (companyId) {
      fetchProfile();
    }
  }, [companyId]);

  const fetchProfile = async () => {
    if (!companyId) return;
    try {
      setIsLoading(true);
      
      const data = await financeApi.getRiskProfile(companyId);
      
      if (data) {
        setEmailRecipients(data.emailRecipients || []);
        setKeywords(data.keywords || []);
        setCompetitors(data.competitors || []);
        setRiskThreshold(data.riskThreshold ?? 70);
        setMonitoringFrequency(data.monitoringFrequency || 'DAILY');
      }
    } catch (error: any) {
      console.error('Error fetching risk profile:', error);
      if (error.response?.status !== 404) {
        toast.error('Failed to load risk profile');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Save Function
  const handleSave = async () => {
    if (!companyId) {
      toast.error('Authentication error: No company ID found');
      return;
    }
    try {
      setIsSaving(true);
      
      const payload = {
        emailRecipients,
        keywords,
        competitors,
        riskThreshold,
        monitoringFrequency
      };

      await financeApi.saveRiskProfile(companyId, payload);
      toast.success('Risk profile fully synced with backend!');
    } catch (error: any) {
      console.error('Error saving risk profile:', error);
      toast.error(error.response?.data?.message || 'Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  // Reusable Array Handlers
  const handleAddItem = (
    e: React.FormEvent,
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    array: string[],
    clearInput: () => void
  ) => {
    e.preventDefault();
    const cleanVal = value.trim();
    if (cleanVal && !array.includes(cleanVal)) {
      setter([...array, cleanVal]);
      clearInput();
    }
  };

  const handleRemoveItem = (
    itemToRemove: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    array: string[]
  ) => {
    setter(array.filter(item => item !== itemToRemove));
  };


  if (authLoading || (isLoading && companyId)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (!companyId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50/50">
        <div className="text-center p-8 bg-white rounded-3xl border border-slate-200 shadow-sm max-w-md">
          <AlertOctagon className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">Please complete your company setup or log in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 p-4 lg:p-8 overflow-hidden relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-indigo-100/40 via-sky-50/20 to-transparent pointer-events-none rounded-full blur-3xl mix-blend-multiply" />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-8 relative z-10"
      >
        {/* Page Header */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white/70 backdrop-blur-xl p-8 rounded-[2rem] border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] ring-1 ring-slate-900/5">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
              <Settings2 className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
                Risk Profile Configuration
              </h1>
              <p className="text-slate-500 text-base font-medium mt-1">
                Define your monitoring keywords, key competitors, and alert thresholds.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Section 1: Contact & Thresholds */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Mail className="w-5 h-5" />
            </div>
            <h2 className="text-xl font-extrabold text-slate-900">Contact & Thresholds</h2>
          </div>

          <div className="space-y-8 max-w-2xl">
            {/* Alert Notification Email */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-2">Alert Recipients (Emails)</label>

              <form onSubmit={(e) => handleAddItem(e, newEmail, setEmailRecipients, emailRecipients, () => setNewEmail(''))} className="flex gap-3 mb-4 relative">
                <input
                  type="email"
                  placeholder="e.g. c-suite@company.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-sm"
                />
                <button
                  type="submit"
                  disabled={!newEmail.trim()}
                  className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" /> Add
                </button>
              </form>

              <div className="flex flex-wrap gap-2.5">
                {emailRecipients.map(email => (
                  <span key={email} className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 bg-indigo-50 border border-indigo-200 text-indigo-800 text-[13px] font-bold tracking-tight rounded-full shadow-sm">
                    {email}
                    <button onClick={() => handleRemoveItem(email, setEmailRecipients, emailRecipients)} className="w-5 h-5 rounded-full hover:bg-indigo-200 flex items-center justify-center transition-colors text-indigo-600">
                      <X className="w-3.5 h-3.5 stroke-[3]" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Risk Score Threshold */}
            <div>
              <div className="flex justify-between items-end mb-3">
                <label className="text-sm font-bold text-slate-700">Risk Score Threshold for Alerts</label>
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-lg">
                  <AlertOctagon className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-black text-indigo-700">{riskThreshold} / 100</span>
                </div>
              </div>
              <input
                type="range"
                min="1"
                max="100"
                value={riskThreshold}
                onChange={(e) => setRiskThreshold(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-100 rounded-full appearance-none cursor-pointer accent-indigo-600 hover:accent-indigo-700"
              />
            </div>

            {/* Monitoring Frequency */}
            <div>
              <label className="text-sm font-bold text-slate-700 block mb-3">Monitoring Frequency</label>
              <div className="flex gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl w-full sm:w-fit">
                {['DAILY', 'WEEKLY'].map((freq) => (
                  <button
                    key={freq}
                    onClick={() => setMonitoringFrequency(freq as 'DAILY' | 'WEEKLY')}
                    className={cn(
                      "px-6 py-2 rounded-lg text-sm font-bold transition-all duration-200 flex items-center gap-2",
                      monitoringFrequency === freq
                        ? "bg-white text-indigo-700 shadow-sm border border-slate-200/50"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    )}
                  >
                    <Clock className="w-3 h-3" />
                    {freq}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </motion.div>

        {/* Section 2: Monitored Keywords */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Monitored Keywords</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">Industry terms and strict topics the AI evaluates.</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <form onSubmit={(e) => handleAddItem(e, newKeyword, setKeywords, keywords, () => setNewKeyword(''))} className="flex gap-3 mb-6 relative">
              <input
                type="text"
                placeholder="Add keyword (e.g. 'Supply Chain', 'Raw Materials')"
                value={newKeyword}
                onChange={(e) => setNewKeyword(e.target.value)}
                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!newKeyword.trim()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 min-h-[100px]">
              {keywords.map(kw => (
                <span
                  key={kw}
                  className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 bg-white border border-emerald-200 text-emerald-800 text-[13px] font-bold tracking-tight rounded-full shadow-sm"
                >
                  {kw}
                  <button onClick={() => handleRemoveItem(kw, setKeywords, keywords)} className="w-5 h-5 rounded-full hover:bg-emerald-100 flex items-center justify-center transition-colors text-emerald-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </span>
              ))}
              {keywords.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-sm font-medium text-slate-400 italic">No keywords assigned.</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Section 3: Competitor Watchlist */}
        <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-6 lg:p-8 relative overflow-hidden group">
          <div className="absolute top-0 left-0 w-1.5 h-full bg-rose-500" />
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-slate-900">Competitor Watchlist</h2>
              <p className="text-[13px] text-slate-500 font-medium mt-0.5">Rival companies for the AI to track aggressively.</p>
            </div>
          </div>

          <div className="max-w-2xl">
            <form onSubmit={(e) => handleAddItem(e, newCompetitor, setCompetitors, competitors, () => setNewCompetitor(''))} className="flex gap-3 mb-6 relative">
              <input
                type="text"
                placeholder="Add competitor (e.g. 'TechCorp')"
                value={newCompetitor}
                onChange={(e) => setNewCompetitor(e.target.value)}
                className="flex-1 px-5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all shadow-sm"
              />
              <button
                type="submit"
                disabled={!newCompetitor.trim()}
                className="px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all disabled:opacity-50 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add
              </button>
            </form>

            <div className="flex flex-wrap gap-2.5 bg-slate-50/50 p-5 rounded-2xl border border-slate-100 min-h-[100px]">
              {competitors.map(comp => (
                <span
                  key={comp}
                  className="inline-flex items-center gap-2 pl-3.5 pr-1.5 py-1.5 bg-white border border-rose-200 text-rose-800 text-[13px] font-bold tracking-tight rounded-full shadow-sm"
                >
                  <Target className="w-3.5 h-3.5 text-rose-400" />
                  {comp}
                  <button onClick={() => handleRemoveItem(comp, setCompetitors, competitors)} className="w-5 h-5 rounded-full hover:bg-rose-100 flex items-center justify-center transition-colors text-rose-600">
                    <X className="w-3.5 h-3.5 stroke-[3]" />
                  </button>
                </span>
              ))}
              {competitors.length === 0 && (
                <div className="flex items-center justify-center w-full h-full text-sm font-medium text-slate-400 italic">No competitors assigned.</div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Footer Action */}
        <motion.div variants={itemVariants} className="flex justify-end pt-2 pb-8">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2.5 px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-extrabold shadow-lg shadow-indigo-600/30 transition-all hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-75 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
            {isSaving ? 'Saving...' : 'Save Configuration'}
          </button>
        </motion.div>

      </motion.div>
    </div>
  );
}
