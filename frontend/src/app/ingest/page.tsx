'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { financeApi, IngestFinancialDataDto } from '@/lib/api';
import { toast } from 'sonner';
import Cookies from 'js-cookie';

export default function IngestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<IngestFinancialDataDto>({
        ticker: '',
        period: '',
        companyName: '',
        industry: '',
        sector: '',
        revenue: '',
        netIncome: '',
        equity: '',
        totalAssets: '',
        currentAssets: '',
        totalLiabilities: '',
        currentLiabilities: '',
        cashFlowOperating: '',
    });

    // Handle hydration mismatch if any (though 'use client' helps)
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        setMounted(true);
        console.log('IngestPage mounted');
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Handling submit...', formData);
        setLoading(true);
        try {
            const response = await financeApi.ingest(formData);
            console.log('Ingest success:', response);

            // Mark setup as complete for middleware
            Cookies.set('is_setup_complete', 'true');

            toast.success('Data ingested successfully!');
            router.push(`/dashboard/${formData.ticker}`);
        } catch (error: any) {
            console.error('Failed to ingest data:', error);
            const message = error.response?.data?.message || 'Failed to ingest data. Please check your inputs.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full p-2 border rounded-md bg-zinc-800 border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500";
    const labelClass = "block text-sm font-medium text-zinc-400 mb-1";

    if (!mounted) return null;

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-8">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-zinc-100">Ingest Financial Data</h1>
                <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900 p-6 rounded-xl border border-zinc-800">

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Ticker Symbol</label>
                            <input name="ticker" value={formData.ticker} onChange={handleChange} className={inputClass} required placeholder="e.g. AAPL" />
                        </div>
                        <div>
                            <label className={labelClass}>Period</label>
                            <input name="period" value={formData.period} onChange={handleChange} className={inputClass} required placeholder="e.g. 2023-Q4" />
                        </div>
                    </div>

                    <div>
                        <label className={labelClass}>Company Name</label>
                        <input name="companyName" value={formData.companyName} onChange={handleChange} className={inputClass} required placeholder="e.g. Apple Inc." />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className={labelClass}>Industry</label>
                            <input name="industry" value={formData.industry} onChange={handleChange} className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Sector</label>
                            <input name="sector" value={formData.sector} onChange={handleChange} className={inputClass} />
                        </div>
                    </div>

                    <div className="border-t border-zinc-800 pt-4">
                        <h3 className="text-lg font-semibold mb-4 text-zinc-300">Financial Metrics (USD)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Revenue</label>
                                <input type="number" name="revenue" value={formData.revenue} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Net Income</label>
                                <input type="number" name="netIncome" value={formData.netIncome} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Total Equity</label>
                                <input type="number" name="equity" value={formData.equity} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Total Assets</label>
                                <input type="number" name="totalAssets" value={formData.totalAssets} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Current Assets</label>
                                <input type="number" name="currentAssets" value={formData.currentAssets} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Total Liabilities</label>
                                <input type="number" name="totalLiabilities" value={formData.totalLiabilities} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Current Liabilities</label>
                                <input type="number" name="currentLiabilities" value={formData.currentLiabilities} onChange={handleChange} className={inputClass} required />
                            </div>
                            <div>
                                <label className={labelClass}>Operating Cash Flow</label>
                                <input type="number" name="cashFlowOperating" value={formData.cashFlowOperating} onChange={handleChange} className={inputClass} required />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading && (
                            <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        )}
                        {loading ? 'Processing...' : 'Submit Data'}
                    </button>
                </form>
            </div>
        </div>
    );
}
