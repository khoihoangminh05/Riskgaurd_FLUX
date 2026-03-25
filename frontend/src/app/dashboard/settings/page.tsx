'use client';

import React, { useState } from 'react';
import { 
    Building2, 
    Bell, 
    Blocks, 
    Copy, 
    Check,
    Key,
    Save,
    CreditCard,
    Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';

const TABS = [
    { id: 'profile', label: 'Profile & Company', icon: Building2 },
    { id: 'notifications', label: 'Notification Preferences', icon: Bell },
    { id: 'api', label: 'API & Integrations', icon: Blocks },
];

export default function SettingsPage() {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-12 p-4 lg:p-8">
            {/* Page Header */}
            <div className="animate-in fade-in slide-in-from-top-2 duration-500">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Workspace Settings</h1>
                <p className="text-slate-500 text-base mt-1">Manage your enterprise workspace, preferences, and secure integrations.</p>
            </div>

            <div className="flex flex-col md:flex-row gap-8">
                {/* Vertical Sidebar */}
                <div className="w-full md:w-64 shrink-0 space-y-1">
                    {TABS.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={cn(
                                "w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold rounded-xl transition-all text-left",
                                activeTab === tab.id 
                                    ? "bg-indigo-50 text-indigo-700 shadow-sm shadow-indigo-100" 
                                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                            )}
                        >
                            <tab.icon className={cn("w-4 h-4", activeTab === tab.id ? "text-indigo-600" : "text-slate-400")} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === 'profile' && <ProfileTab />}
                    {activeTab === 'notifications' && <NotificationsTab />}
                    {activeTab === 'api' && <ApiIntegrationsTab />}
                </div>
            </div>
        </div>
    );
}

// ============================================
// PROFILE & COMPANY TAB
// ============================================
function ProfileTab() {
    const { user, updateCompany } = useAuth();
    const company = user?.company;

    const [formData, setFormData] = useState({
        name: company?.name || '',
        ticker: company?.ticker || '',
        industry: company?.industry || 'Information Technology',
    });
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!company?.id) return;
        
        try {
            setIsSaving(true);
            const updated = await api.updateCompanyDetails(company.id, {
                name: formData.name,
                ticker: formData.ticker,
                industry: formData.industry
            });
            
            // Critical: Update global context
            updateCompany(updated);
            
            toast.success('Workspace updated successfully', {
                description: 'Your changes are now live across the platform.'
            });
        } catch (error: any) {
            console.error('Error updating company:', error);
            toast.error('Failed to update settings', {
                description: error.response?.data?.message || 'Please try again later.'
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="px-8 py-6 border-b border-slate-100">
                <h2 className="text-xl font-bold text-slate-900">Company Information</h2>
                <p className="text-slate-500 text-sm mt-1">Update your official business details for automated reporting.</p>
            </div>
            
            <div className="p-8 space-y-8">
                {/* Form Group */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Company Name</label>
                        <input 
                            type="text" 
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Flux Enterprise"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium placeholder:text-slate-400"
                        />
                    </div>
                    <div className="space-y-2.5">
                        <label className="text-sm font-bold text-slate-700 ml-1">Stock Ticker / Identifier</label>
                        <input 
                            type="text" 
                            value={formData.ticker}
                            onChange={(e) => setFormData(prev => ({ ...prev, ticker: e.target.value }))}
                            placeholder="e.g. FLX"
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-mono font-bold uppercase placeholder:text-slate-400"
                        />
                    </div>
                    <div className="space-y-2.5 md:col-span-2">
                        <label className="text-sm font-bold text-slate-700 ml-1">Industry Sector</label>
                        <div className="relative">
                            <select 
                                value={formData.industry}
                                onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all font-medium appearance-none cursor-pointer"
                            >
                                <option>Information Technology</option>
                                <option>Finance & Banking</option>
                                <option>Manufacturing & Supply Chain</option>
                                <option>Healthcare</option>
                                <option>Energy & Utilities</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" /></svg>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-8 py-5 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-70 text-white px-8 py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-200 transition-all transform active:scale-95 border border-indigo-400/20"
                >
                    {isSaving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        <>
                            <Save className="w-4 h-4" />
                            Save Changes
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}

// ============================================
// NOTIFICATIONS TAB
// ============================================
function NotificationsTab() {
    return (
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="px-6 py-5 border-b border-slate-100">
                <h2 className="text-lg font-bold text-slate-900">Notification Preferences</h2>
                <p className="text-slate-500 text-sm">Control exactly how and when you receive critical risk alerts.</p>
            </div>
            
            <div className="divide-y divide-slate-100">
                <ToggleRow 
                    title="Email Alerts" 
                    description="Receive emails for HIGH and CRITICAL risk severity events."
                    defaultChecked={true}
                />
                <ToggleRow 
                    title="WebSocket Push Notifications" 
                    description="Real-time browser push notifications. Required for live dashboard updates."
                    defaultChecked={true}
                />
                <ToggleRow 
                    title="Daily Digest Reports" 
                    description="A consolidated morning briefing of your macro-economic changes."
                    defaultChecked={false}
                />
            </div>
        </div>
    );
}

function ToggleRow({ title, description, defaultChecked }: { title: string, description: string, defaultChecked: boolean }) {
    const [checked, setChecked] = useState(defaultChecked);
    return (
        <div className="flex items-center justify-between px-6 py-5 group">
            <div className="pr-8">
                <p className="text-sm font-semibold text-slate-900 mb-0.5">{title}</p>
                <p className="text-sm text-slate-500">{description}</p>
            </div>
            <button 
                onClick={() => setChecked(!checked)}
                className={cn(
                    "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:ring-offset-2",
                    checked ? "bg-indigo-600" : "bg-slate-200"
                )}
            >
                <span 
                    className={cn(
                        "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out",
                        checked ? "translate-x-5" : "translate-x-0"
                    )}
                />
            </button>
        </div>
    );
}

// ============================================
// API & INTEGRATIONS TAB
// ============================================
function ApiIntegrationsTab() {
    const [copied, setCopied] = useState(false);
    const mockApiKey = "sk-live-51NxABCDEF1234567890UVWXYZabcdef123";
    
    const handleCopy = () => {
        navigator.clipboard.writeText(mockApiKey);
        setCopied(true);
        toast.success("API Key copied to clipboard.");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {/* API Keys */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">API Keys</h2>
                        <p className="text-slate-500 text-sm">Tokens for authenticating autonomous programmatic requests.</p>
                    </div>
                    <Key className="w-5 h-5 text-indigo-400" />
                </div>
                
                <div className="p-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest block mb-2">Production Secret Key</label>
                    <div className="flex items-center gap-3">
                        <div className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between font-mono text-sm text-slate-900 shadow-inner">
                            <span>sk-live-••••••••••••••••••••••••••••</span>
                            <span className="text-xs font-semibold text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">Active</span>
                        </div>
                        <button 
                            onClick={handleCopy}
                            className="p-3 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm focus:ring-2 focus:ring-indigo-500/20 focus:outline-none"
                            title="Copy to clipboard"
                        >
                            {copied ? <Check className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>
                    <p className="text-xs text-rose-500 mt-3 font-medium bg-rose-50 p-2 rounded border border-rose-100 inline-block">
                        Never share your secret key. If compromised, roll it immediately.
                    </p>
                </div>
            </div>

            {/* Enterprise Integrations */}
            <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                    <h2 className="text-lg font-bold text-slate-900">Enterprise Integrations</h2>
                    <p className="text-slate-500 text-sm">Manage data sync logic between Flux and your existing ERP systems.</p>
                </div>
                
                <div className="divide-y divide-slate-100">
                    <IntegrationRow name="SAP S/4HANA" status="Connected" lastSync="10 mins ago" logo="SAP" />
                    <IntegrationRow name="Oracle NetSuite" status="Disconnected" lastSync="Never" logo="ORCL" />
                    <IntegrationRow name="MISA SME.NET" status="Available" lastSync="-" logo="MISA" />
                </div>
            </div>
        </div>
    );
}

function IntegrationRow({ name, status, lastSync, logo }: { name: string, status: string, lastSync: string, logo: string }) {
    const isConnected = status === 'Connected';
    return (
        <div className="flex items-center justify-between p-6 hover:bg-slate-50 transition-colors">
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-center font-black text-slate-800 tracking-tighter text-sm">
                    {logo}
                </div>
                <div>
                    <h3 className="text-sm font-bold text-slate-900">{name}</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                        <span className={cn(
                            "w-2 h-2 rounded-full",
                            isConnected ? "bg-emerald-500" : status === 'Available' ? "bg-indigo-500" : "bg-slate-300"
                        )} />
                        <span className="text-xs text-slate-500 font-medium">{status}</span>
                        {isConnected && (
                            <>
                                <span className="text-slate-300">•</span>
                                <span className="text-xs text-slate-400">Sync: {lastSync}</span>
                            </>
                        )}
                    </div>
                </div>
            </div>
            
            <button 
                className={cn(
                    "px-4 py-2 text-xs font-bold rounded-lg border transition-all",
                    isConnected 
                        ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50" 
                        : "bg-slate-900 border-transparent text-white hover:bg-slate-800"
                )}
            >
                {isConnected ? 'Manage' : 'Connect'}
            </button>
        </div>
    );
}
