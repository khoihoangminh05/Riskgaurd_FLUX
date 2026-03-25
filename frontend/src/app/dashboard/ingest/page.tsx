'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import api, { CompanyDocument } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import { 
  CloudUpload as CloudArrowUpIcon, 
  FileText as DocumentIcon, 
  CheckCircle2 as CheckCircleIcon, 
  RefreshCw as ArrowPathIcon, 
  AlertCircle as ExclamationCircleIcon,
  Copy as DocumentDuplicateIcon
} from 'lucide-react';

export default function IngestPage() {
    const { user, loading: authLoading } = useAuth();
    const company = user?.company;
    const [isUploading, setIsUploading] = useState(false);
    const [documents, setDocuments] = useState<CompanyDocument[]>([]);
    const [isLoadingDocs, setIsLoadingDocs] = useState(true);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (company?.id) {
            fetchDocuments();
        }
    }, [company?.id]);

    const fetchDocuments = async () => {
        if (!company?.id) return;
        setIsLoadingDocs(true);
        try {
            const data = await api.getDocuments(company.id);
            setDocuments(data);
        } catch (error) {
            console.error('Failed to fetch documents:', error);
            // Non-critical error, toast only if it seems severe
        } finally {
            setIsLoadingDocs(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile || !company?.id) return;

        setIsUploading(true);
        try {
            // The API expects a File object
            await api.uploadDocument(company.id, selectedFile);
            toast.success('Document uploaded and queued for vectorization!');
            setSelectedFile(null);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchDocuments();
        } catch (error: any) {
            console.error('Upload failed:', error);
            toast.error(error.response?.data?.message || 'Failed to upload document.');
        } finally {
            setIsUploading(false);
        }
    };

    const getStatusBadge = (status: CompanyDocument['status']) => {
        switch (status) {
            case 'PROCESSED':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircleIcon className="h-3 w-3" />
                        Indexed
                    </span>
                );
            case 'PENDING':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        <ArrowPathIcon className="h-3 w-3 animate-spin" />
                        Processing
                    </span>
                );
            case 'ERROR':
                return (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        <ExclamationCircleIcon className="h-3 w-3" />
                        Error
                    </span>
                );
            default:
                return null;
        }
    };

    if (authLoading || !company) return <LoadingSpinner />;

    return (
        <div className="max-w-6xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-10 text-center sm:text-left">
                <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
                    Enterprise Data Ingestion
                </h1>
                <p className="mt-3 text-lg text-slate-400 max-w-3xl">
                    Securely upload internal financial reports for RAG vectorization. 
                    Data is strictly isolated via metadata filtering to ensure enterprise-grade privacy.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Section 1: The Upload Zone */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl sticky top-8">
                        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <CloudArrowUpIcon className="h-5 w-5 text-emerald-500" />
                            Upload Center
                        </h2>
                        
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`
                                group relative cursor-pointer
                                border-dashed border-2 rounded-xl p-8
                                flex flex-col items-center justify-center text-center
                                transition-all duration-300
                                ${selectedFile 
                                    ? 'border-emerald-500/50 bg-emerald-500/5' 
                                    : 'border-slate-700 hover:border-emerald-500/50 hover:bg-slate-800/50'
                                }
                            `}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                accept=".pdf,.docx,.txt"
                                className="hidden" 
                            />
                            
                            {selectedFile ? (
                                <div className="space-y-3">
                                    <div className="mx-auto h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
                                        <DocumentIcon className="h-6 w-6 text-emerald-500" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium text-white truncate max-w-[200px]">
                                            {selectedFile.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedFile(null);
                                        }}
                                        className="text-xs text-rose-500 hover:text-rose-400 underline"
                                    >
                                        Remove file
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="mx-auto h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center mb-4 group-hover:bg-emerald-500/10 transition-colors">
                                        <CloudArrowUpIcon className="h-6 w-6 text-slate-400 group-hover:text-emerald-500 transition-colors" />
                                    </div>
                                    <p className="text-sm font-medium text-slate-300">
                                        Click or drag to upload
                                    </p>
                                    <p className="mt-1 text-xs text-slate-500">
                                        PDF, DOCX, or TXT up to 20MB
                                    </p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={handleUpload}
                            disabled={!selectedFile || isUploading}
                            className={`
                                w-full mt-6 py-3 px-4 rounded-xl font-semibold text-sm
                                flex items-center justify-center gap-2 transition-all
                                ${!selectedFile || isUploading
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20'
                                }
                            `}
                        >
                            {isUploading ? (
                                <>
                                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                                    Vectorizing...
                                </>
                            ) : (
                                'Upload & Vectorize'
                            )}
                        </button>
                        
                        <div className="mt-6 flex items-start gap-3 p-3 rounded-lg bg-indigo-500/5 border border-indigo-500/10">
                            <ExclamationCircleIcon className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                            <p className="text-[11px] text-slate-400 leading-relaxed">
                                Documents are processed through our proprietary LLM pipeline to extract risk factors and financial entities.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2: Document Knowledge Base */}
                <div className="lg:col-span-2">
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
                        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                                <DocumentDuplicateIcon className="h-5 w-5 text-emerald-500" />
                                Document Knowledge Base
                            </h2>
                            <button 
                                onClick={fetchDocuments}
                                className="text-xs text-slate-400 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <ArrowPathIcon className={`h-3 w-3 ${isLoadingDocs ? 'animate-spin' : ''}`} />
                                Refresh
                            </button>
                        </div>

                        <div className="overflow-x-auto">
                            {isLoadingDocs && documents.length === 0 ? (
                                <div className="py-20 text-center">
                                    <ArrowPathIcon className="h-8 w-8 text-slate-700 animate-spin mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">Loading knowledge base...</p>
                                </div>
                            ) : documents.length === 0 ? (
                                <div className="py-32 text-center px-4">
                                    <DocumentIcon className="h-12 w-12 text-slate-800 mx-auto mb-4" />
                                    <h3 className="text-slate-300 font-medium italic">No documents found</h3>
                                    <p className="text-slate-600 text-xs mt-1">Upload your first report to start building your RAG context.</p>
                                </div>
                            ) : (
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-800/50">
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">File Name</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">Upload Date</th>
                                            <th className="px-6 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wider text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-800/50">
                                        {documents.map((doc) => (
                                            <tr key={doc.id} className="hover:bg-slate-800/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded bg-slate-800 flex items-center justify-center shrink-0">
                                                            <DocumentIcon className="h-4 w-4 text-slate-400" />
                                                        </div>
                                                        <span className="text-sm font-medium text-slate-200 truncate max-w-[200px] sm:max-w-xs" title={doc.filename}>
                                                            {doc.filename}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-xs text-slate-500 whitespace-nowrap">
                                                        {new Date(doc.uploadDate).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric'
                                                        })}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    {getStatusBadge(doc.status)}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        
                        <div className="px-6 py-4 bg-slate-800/30 border-t border-slate-800">
                            <p className="text-[10px] text-slate-500 text-center">
                                All data is encrypted at rest and in transit. Document isolation is enforced at the database level.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
