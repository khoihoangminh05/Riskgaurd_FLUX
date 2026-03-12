'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { financeApi, Company, CompanyDocument } from '@/lib/api';
import { Upload, FileText, CheckCircle, AlertCircle, Clock, RefreshCw, Trash2 } from 'lucide-react';

export default function DocumentManager() {
    const { ticker } = useParams<{ ticker: string }>();
    const [company, setCompany] = useState<Company | null>(null);
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch Initial Data
    useEffect(() => {
        if (ticker) {
            loadData();
        }
    }, [ticker]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get Company Info using Dashboard API (reusing existing logic to get company ID)
            // Ideally we'd have a direct getCompanyByTicker, but getDashboard works
            const dashboardData = await financeApi.getDashboard(ticker);
            setCompany(dashboardData.company);

            // 2. Get Documents
            const docs = await financeApi.getDocuments(dashboardData.company.id);
            setDocuments(docs);
        } catch (error) {
            console.error("Failed to load data", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        if (!company) return;
        setLoading(true);
        try {
            const docs = await financeApi.getDocuments(company.id);
            setDocuments(docs);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this document? This action cannot be undone.')) return;
        if (!company) return;

        // Optimistic Update
        setDocuments(prev => prev.filter(doc => doc.id !== id));

        try {
            await financeApi.deleteDocument(company.id, id);
            alert('Document deleted successfully');
        } catch (error) {
            console.error('Failed to delete document', error);
            alert('Failed to delete document');
            // Revert on error
            handleRefresh();
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0 || !company) return;

        const file = e.target.files[0];
        setUploading(true);
        try {
            await financeApi.uploadDocument(company.id, file);
            // Refresh list after upload
            const docs = await financeApi.getDocuments(company.id);
            setDocuments(docs);
            alert("File uploaded successfully! Processing started.");
        } catch (error) {
            console.error("Upload failed", error);
            alert("Failed to upload file.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PROCESSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800"><CheckCircle className="w-3 h-3 mr-1" /> Processed</span>;
            case 'ERROR':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" /> Error</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" /> Pending</span>;
        }
    };

    if (loading && !company) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Loading...</div>;
    if (!company) return <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">Company not found</div>;

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 p-8">
            <header className="mb-8 border-b border-zinc-800 pb-6">
                <h1 className="text-3xl font-bold text-white mb-2">Internal Knowledge Base</h1>
                <p className="text-zinc-400">Manage documents for {company.name} ({company.ticker})</p>
            </header>

            {/* Upload Section */}
            <div className="mb-12">
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center border-dashed border-2 hover:border-blue-500/50 transition-colors">
                    <Upload className="w-12 h-12 text-zinc-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">Upload Financial Documents</h3>
                    <p className="text-zinc-400 mb-6 text-sm">Support for PDF, Excel (.xlsx). Files will be securely processed and vectorized.</p>

                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleUpload}
                        accept=".pdf,.xlsx,.xls"
                        className="hidden"
                    />

                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                        {uploading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                        {uploading ? 'Uploading...' : 'Select File'}
                    </button>
                </div>
            </div>

            {/* Document List */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
                    <h3 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="w-5 h-5 text-zinc-400" />
                        Uploaded Documents
                    </h3>
                    <button
                        onClick={handleRefresh}
                        className="p-2 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
                        title="Refresh List"
                    >
                        <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-zinc-950/50 text-zinc-400 text-xs uppercase font-medium">
                            <tr>
                                <th className="px-6 py-4">Filename</th>
                                <th className="px-6 py-4">Upload Date</th>
                                <th className="px-6 py-4">Type</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {documents.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-6 py-8 text-center text-zinc-500 text-sm">
                                        No documents uploaded yet.
                                    </td>
                                </tr>
                            ) : (
                                documents.map((doc) => (
                                    <tr key={doc.id} className="hover:bg-zinc-800/30 transition-colors">
                                        <td className="px-6 py-4 font-medium text-zinc-200">{doc.filename}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm">{new Date(doc.uploadDate).toLocaleString()}</td>
                                        <td className="px-6 py-4 text-zinc-400 text-sm uppercase">{doc.fileType.split('/')[1] || 'FILE'}</td>
                                        <td className="px-6 py-4">{getStatusBadge(doc.status)}</td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => handleDelete(doc.id)}
                                                className="p-2 hover:bg-red-500/20 text-zinc-500 hover:text-red-400 rounded-lg transition-colors"
                                                title="Delete Document"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
