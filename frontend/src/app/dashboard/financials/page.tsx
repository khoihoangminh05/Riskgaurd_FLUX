'use client';

import React, { useState, useEffect } from 'react';
import { 
    Calculator, 
    Sparkles, 
    TrendingDown, 
    Clock, 
    CheckCircle2, 
    Loader2,
    Save,
    Info,
    ArrowUpRight,
    ShieldCheck,
    BarChart3,
    Activity,
    Coins,
    Building2,
    Package
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

interface ConfidenceBadgeProps {
    confidence: number;
}

const ConfidenceBadge = ({ confidence }: ConfidenceBadgeProps) => (
    <div className={cn(
        "text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border flex items-center gap-1 shrink-0",
        confidence >= 90 
            ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
            : "text-amber-600 bg-amber-50 border-amber-100"
    )}>
        <Sparkles className="w-2.5 h-2.5" />
        AI Confidence: {confidence}%
    </div>
);

export default function FinancialHealthPage() {
    const { user, updateCompany } = useAuth();
    const company = user?.company;

    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isExtracting, setIsExtracting] = useState(false);
    const [formData, setFormData] = useState({
        cashRunway: '',
        burnRate: '',
        quickRatio: '',
        debtEquityRatio: '',
        interestCoverageRatio: '',
        grossProfitMargin: '',
        inventoryTurnover: '',
        operatingCashFlow: '',
    });

    // Initialize with real metrics from API
    useEffect(() => {
        if (company?.id) {
            setIsLoading(true);
            api.getFinancialMetrics(company.id)
                .then(metrics => {
                    if (metrics) {
                        setFormData({
                            cashRunway: metrics.cashRunway?.toString() || '',
                            burnRate: metrics.burnRate?.toString() || '',
                            quickRatio: metrics.quickRatio?.toString() || '',
                            debtEquityRatio: metrics.debtEquityRatio?.toString() || '',
                            interestCoverageRatio: metrics.interestCoverageRatio?.toString() || '',
                            grossProfitMargin: metrics.grossProfitMargin?.toString() || '',
                            inventoryTurnover: metrics.inventoryTurnover?.toString() || '',
                            operatingCashFlow: metrics.operatingCashFlow?.toString() || '',
                        });
                    }
                })
                .catch(console.error)
                .finally(() => setIsLoading(false));
        }
    }, [company?.id]);

    const handleSave = async () => {
        if (!company?.id) return;

        try {
            setIsSaving(true);
            const updated = await api.updateFinancialMetrics(company.id, {
                cashRunway: formData.cashRunway ? Number(formData.cashRunway) : undefined,
                burnRate: formData.burnRate ? Number(formData.burnRate) : undefined,
                quickRatio: formData.quickRatio ? Number(formData.quickRatio) : undefined,
                debtEquityRatio: formData.debtEquityRatio ? Number(formData.debtEquityRatio) : undefined,
                interestCoverageRatio: formData.interestCoverageRatio ? Number(formData.interestCoverageRatio) : undefined,
                grossProfitMargin: formData.grossProfitMargin ? Number(formData.grossProfitMargin) : undefined,
                inventoryTurnover: formData.inventoryTurnover ? Number(formData.inventoryTurnover) : undefined,
                operatingCashFlow: formData.operatingCashFlow ? Number(formData.operatingCashFlow) : undefined,
            });
            
            updateCompany(updated);
            toast.success('Enterprise metrics verified and saved', {
                description: 'The risk trajectory has been recalibrated based on verified financial inputs.'
            });
        } catch (error: any) {
            console.error('Save error:', error);
            toast.error('Failed to save parameters');
        } finally {
            setIsSaving(false);
        }
    };

    const handleExtract = async () => {
        if (!company?.id) return;
        try {
            setIsExtracting(true);
            const extractedData = await api.triggerAIExtraction(company.id);
            setFormData({
                cashRunway: extractedData.cashRunway?.toString() || '',
                burnRate: extractedData.burnRate?.toString() || '',
                quickRatio: extractedData.quickRatio?.toString() || '',
                debtEquityRatio: extractedData.debtToEquity?.toString() || '',
                interestCoverageRatio: extractedData.interestCoverage?.toString() || '',
                grossProfitMargin: extractedData.grossMargin?.toString() || '',
                inventoryTurnover: extractedData.inventoryTurnover?.toString() || '',
                operatingCashFlow: extractedData.operatingCashFlow?.toString() || '',
            });
            toast.success('Data successfully extracted. Please review and save.');
        } catch (error) {
            console.error('Extraction error:', error);
            toast.error('Failed to extract data.');
        } finally {
            setIsExtracting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-10 w-10 text-slate-900 animate-spin" />
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Fetching Enterprise Intelligence...</p>
                </div>
            </div>
        );
    }

    const inputClasses = "w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 font-bold focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all";

    return (
        <div className="max-w-7xl mx-auto space-y-8 pb-12 p-4 lg:p-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in fade-in slide-in-from-top-2 duration-500">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-200">
                            <BarChart3 className="w-7 h-7" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Financial Health Parameters</h1>
                            <p className="text-slate-500 text-sm font-medium">Enterprise CFO Command Center & AI Extraction Review</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 text-sm font-bold shadow-sm self-start">
                    <ShieldCheck className="w-4 h-4" />
                    Human-in-the-loop Active
                </div>
            </div>

            {/* AI Extraction Banner */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 shadow-2xl shadow-slate-200">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-32 -mt-32" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -ml-32 -mb-32" />
                
                <div className="relative flex flex-col md:flex-row items-center gap-6 justify-between">
                    <div className="flex items-center gap-5">
                        <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white mb-1">AI Scan Complete</h2>
                            <p className="text-slate-400 text-sm font-medium">
                                Extracted <span className="text-indigo-400 font-bold">8 core metrics</span> from <span className="text-white underline underline-offset-4 cursor-pointer">Q3_Financial_Review.pdf</span>
                            </p>
                        </div>
                    </div>
                    <div className="text-center md:text-right">
                        <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-2">Sync Status</p>
                        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-4 py-2 rounded-xl border border-emerald-500/20 font-bold text-sm">
                            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                            Ready for Verification
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Auto-Extract Trigger */}
            <div className="flex justify-center w-full animate-in fade-in slide-in-from-bottom-2 duration-700">
                <button
                    onClick={handleExtract}
                    disabled={isExtracting}
                    className="w-full lg:w-3/4 flex items-center justify-center gap-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-500 text-white font-semibold py-4 rounded-2xl shadow-lg transition-all active:scale-[0.98]"
                >
                    {isExtracting ? (
                        <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Agent is reading document... (Please wait)
                        </>
                    ) : (
                        <>
                            <Sparkles className="w-5 h-5" />
                            🪄 Auto-Extract from Latest Report
                        </>
                    )}
                </button>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Category 1: Liquidity */}
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
                            <Coins className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Liquidity & Cash Flow</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Cash Runway (Months)</label>
                                <ConfidenceBadge confidence={98} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.cashRunway} 
                                onChange={e => setFormData(f => ({ ...f, cashRunway: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Burn Rate (USD)</label>
                                <ConfidenceBadge confidence={95} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.burnRate} 
                                onChange={e => setFormData(f => ({ ...f, burnRate: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Quick Ratio</label>
                                <ConfidenceBadge confidence={92} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.quickRatio} 
                                onChange={e => setFormData(f => ({ ...f, quickRatio: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>

                {/* Category 2: Solvency */}
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                            <Building2 className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Solvency & Leverage</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className={cn(
                                    "text-xs font-black uppercase tracking-wider",
                                    (formData.debtEquityRatio && Number(formData.debtEquityRatio) > 2.0) ? "text-rose-500" : "text-slate-400"
                                )}>Debt-to-Equity Ratio</label>
                                <ConfidenceBadge confidence={89} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.debtEquityRatio} 
                                onChange={e => setFormData(f => ({ ...f, debtEquityRatio: e.target.value }))}
                                className={cn(inputClasses, Number(formData.debtEquityRatio) > 2.0 && "border-rose-200 bg-rose-50/30 text-rose-700")}
                            />
                            {(formData.debtEquityRatio && Number(formData.debtEquityRatio) > 2.0) && (
                                <p className="text-[10px] text-rose-500 font-bold flex items-center gap-1">
                                    <TrendingDown className="w-3 h-3" />
                                    Indicator above sector average risk threshold (2.0)
                                </p>
                            )}
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Interest Coverage</label>
                                <ConfidenceBadge confidence={90} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.interestCoverageRatio} 
                                onChange={e => setFormData(f => ({ ...f, interestCoverageRatio: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>

                {/* Category 3: Efficiency */}
                <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm hover:shadow-md transition-shadow group">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                            <Activity className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-slate-800">Operational Efficiency</h3>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Gross Margin (%)</label>
                                <ConfidenceBadge confidence={96} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.grossProfitMargin} 
                                onChange={e => setFormData(f => ({ ...f, grossProfitMargin: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Inventory Turnover</label>
                                <ConfidenceBadge confidence={85} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.inventoryTurnover} 
                                onChange={e => setFormData(f => ({ ...f, inventoryTurnover: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <label className="text-xs font-black text-slate-400 uppercase tracking-wider">Operating Cash Flow</label>
                                <ConfidenceBadge confidence={94} />
                            </div>
                            <input 
                                type="number" 
                                step="any"
                                value={formData.operatingCashFlow} 
                                onChange={e => setFormData(f => ({ ...f, operatingCashFlow: e.target.value }))}
                                className={inputClasses}
                            />
                        </div>
                    </div>
                </div>

            </div>

            {/* Sticky Action Footer */}
            <div className="sticky bottom-8 z-30 flex items-center justify-center pt-8">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="group relative flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 disabled:opacity-70 text-white px-12 py-5 rounded-[2rem] text-lg font-black shadow-2xl transition-all active:scale-[0.98] overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                    {isSaving ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-400" />
                            Calibrating Risk Engine...
                        </>
                    ) : (
                        <>
                            <Save className="w-6 h-6 text-slate-400 group-hover:text-white transition-colors" />
                            Verify & Save All Metrics
                        </>
                    )}
                </button>
            </div>

            <div className="text-center">
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                    <Info className="w-3 h-3" />
                    Data changes will trigger immediate recalculation of the global risk index.
                </p>
            </div>
        </div>
    );
}
