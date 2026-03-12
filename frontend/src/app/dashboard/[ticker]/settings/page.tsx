'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { financeApi, Company, RiskProfile } from '@/lib/api';
import { Save, AlertTriangle, Plus, X, Settings } from 'lucide-react';

export default function SettingsPage() {
    const { ticker } = useParams<{ ticker: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [profile, setProfile] = useState<RiskProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [keywords, setKeywords] = useState<string[]>([]);
    const [competitors, setCompetitors] = useState<string[]>([]);
    const [riskThreshold, setRiskThreshold] = useState<number>(70);
    const [frequency, setFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');
    const [emailRecipients, setEmailRecipients] = useState<string[]>([]);

    // Input States for Tags
    const [keywordInput, setKeywordInput] = useState('');
    const [competitorInput, setCompetitorInput] = useState('');
    const [emailInput, setEmailInput] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Get Company
                const dashboardData = await financeApi.getDashboard(ticker);
                setCompany(dashboardData.company);

                // 2. Get Profile
                const profileData = await financeApi.getRiskProfile(dashboardData.company.id);
                setProfile(profileData);

                // Initialize Form
                if (profileData) {
                    setKeywords(profileData.keywords || []);
                    setCompetitors(profileData.competitors || []);
                    setRiskThreshold(profileData.riskThreshold || 70);
                    setFrequency(profileData.monitoringFrequency || 'DAILY');
                    setEmailRecipients(profileData.emailRecipients || []);
                }
            } catch (error) {
                console.error('Failed to load settings', error);
            } finally {
                setLoading(false);
            }
        };

        if (ticker) {
            loadData();
        }
    }, [ticker]);

    const handleSave = async () => {
        if (!company) return;
        setSaving(true);
        try {
            console.log(keywords);
            console.log(competitors);
            console.log(riskThreshold);
            console.log(frequency);
            console.log(emailRecipients);
            await financeApi.saveRiskProfile(company.id, {
                keywords,
                competitors,
                riskThreshold,
                monitoringFrequency: frequency,
                emailRecipients
            });
            alert('Settings saved successfully!');
        } catch (error) {
            console.error('Failed to save settings', error);
            alert('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    // Tag Input Handlers
    const addTag = (
        input: string,
        setInput: (v: string) => void,
        list: string[],
        setList: (v: string[]) => void
    ) => {
        if (input.trim() && !list.includes(input.trim())) {
            setList([...list, input.trim()]);
            setInput('');
        }
    };

    const removeTag = (tag: string, list: string[], setList: (v: string[]) => void) => {
        setList(list.filter(t => t !== tag));
    };

    const handleKeyDown = (
        e: React.KeyboardEvent,
        input: string,
        setInput: (v: string) => void,
        list: string[],
        setList: (v: string[]) => void
    ) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addTag(input, setInput, list, setList);
        }
    };

    if (loading) {
        return (
            <div className="p-8 w-full max-w-4xl mx-auto space-y-8 animate-pulse">
                <div className="h-8 bg-zinc-800 rounded w-1/3"></div>
                <div className="space-y-4">
                    <div className="h-32 bg-zinc-900 rounded-xl border border-zinc-800"></div>
                    <div className="h-32 bg-zinc-900 rounded-xl border border-zinc-800"></div>
                </div>
            </div>
        );
    }

    if (!company) return <div className="p-8 text-red-500">Company not found</div>;

    return (
        <div className="p-8 w-full max-w-4xl mx-auto space-y-8 pb-20">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent flex items-center gap-3">
                        <Settings className="w-8 h-8 text-blue-400" />
                        Risk Configuration
                    </h1>
                    <p className="text-zinc-400 mt-2">Configure monitoring parameters for {company.name}</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
                >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="grid grid-cols-1 gap-6">

                {/* 1. Monitoring Scope */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 space-y-6">
                    <h2 className="text-xl font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-400" />
                        Monitoring Scope
                    </h2>

                    {/* Keywords */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">Target Keywords</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-zinc-800 rounded-lg min-h-[50px] focus-within:border-blue-500/50 transition-colors">
                            {keywords.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-sm">
                                    {tag}
                                    <button onClick={() => removeTag(tag, keywords, setKeywords)} className="hover:text-blue-300"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={keywordInput}
                                onChange={e => setKeywordInput(e.target.value)}
                                onKeyDown={e => handleKeyDown(e, keywordInput, setKeywordInput, keywords, setKeywords)}
                                placeholder="Type keyword & hit Enter..."
                                className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder-zinc-600 min-w-[200px]"
                            />
                        </div>
                        <p className="text-xs text-zinc-500">Topics to prioritize in news analysis (e.g., "Inflation", "Strikes", "Regulations")</p>
                    </div>

                    {/* Competitors */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-zinc-300">Competitors</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-zinc-800 rounded-lg min-h-[50px] focus-within:border-purple-500/50 transition-colors">
                            {competitors.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-full text-sm">
                                    {tag}
                                    <button onClick={() => removeTag(tag, competitors, setCompetitors)} className="hover:text-purple-300"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={competitorInput}
                                onChange={e => setCompetitorInput(e.target.value)}
                                onKeyDown={e => handleKeyDown(e, competitorInput, setCompetitorInput, competitors, setCompetitors)}
                                placeholder="Type competitor name & hit Enter..."
                                className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder-zinc-600 min-w-[200px]"
                            />
                        </div>
                    </div>
                </div>

                {/* 2. Sensitivity & Alerts */}
                <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-xl p-6 space-y-8">
                    <h2 className="text-xl font-semibold">Sensitivity & Alerts</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Risk Threshold */}
                        <div className="space-y-4">
                            <div className="flex justify-between">
                                <label className="text-sm font-medium text-zinc-300">Risk Score Threshold</label>
                                <span className={`text-sm font-bold ${riskThreshold > 80 ? 'text-red-400' : riskThreshold > 50 ? 'text-yellow-400' : 'text-green-400'}`}>
                                    {riskThreshold}/100
                                </span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="100"
                                value={riskThreshold}
                                onChange={e => setRiskThreshold(Number(e.target.value))}
                                className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                            />
                            <p className="text-xs text-zinc-500">Minimum risk score required to trigger a high-priority alert.</p>
                        </div>

                        {/* Frequency */}
                        <div className="space-y-3">
                            <label className="text-sm font-medium text-zinc-300">Monitoring Frequency</label>
                            <div className="flex gap-4">
                                <button
                                    onClick={() => setFrequency('DAILY')}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${frequency === 'DAILY'
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                        }`}
                                >
                                    Daily
                                </button>
                                <button
                                    onClick={() => setFrequency('WEEKLY')}
                                    className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${frequency === 'WEEKLY'
                                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-400'
                                        : 'bg-zinc-900 border-zinc-700 text-zinc-500 hover:border-zinc-600'
                                        }`}
                                >
                                    Weekly
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Email Recipients */}
                    <div className="space-y-3 border-t border-zinc-800 pt-6">
                        <label className="text-sm font-medium text-zinc-300">Email Recipients</label>
                        <div className="flex flex-wrap gap-2 p-3 bg-black/40 border border-zinc-800 rounded-lg min-h-[50px] focus-within:border-green-500/50 transition-colors">
                            {emailRecipients.map(tag => (
                                <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded-full text-sm">
                                    {tag}
                                    <button onClick={() => removeTag(tag, emailRecipients, setEmailRecipients)} className="hover:text-green-300"><X className="w-3 h-3" /></button>
                                </span>
                            ))}
                            <input
                                type="text"
                                value={emailInput}
                                onChange={e => setEmailInput(e.target.value)}
                                onKeyDown={e => handleKeyDown(e, emailInput, setEmailInput, emailRecipients, setEmailRecipients)}
                                placeholder="Add email & hit Enter..."
                                className="flex-1 bg-transparent border-none outline-none text-zinc-300 placeholder-zinc-600 min-w-[200px]"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
