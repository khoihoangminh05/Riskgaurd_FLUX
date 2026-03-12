import axios from 'axios';
import Cookies from 'js-cookie';

const API_BASE_URL = 'http://localhost:3000'; // NestJS Backend URL

// Create a centralized axios instance
const apiInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Attach JWT token to every request
apiInstance.interceptors.request.use(
    (config) => {
        const token = Cookies.get('access_token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Handle global 401 errors
apiInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Log out user and redirect to login
            Cookies.remove('access_token');
            localStorage.removeItem('user');
            if (typeof window !== 'undefined') {
                window.location.href = '/login';
            }
        }
        return Promise.reject(error);
    }
);

export interface Company {
    id: string;
    ticker: string;
    name: string;
    sector: string;
    industry: string;
}

export interface FinancialStatement {
    id: string;
    period: string;
    revenue: string;
    netIncome: string;
    equity: string;
    companyId: string;
}

export interface RiskScore {
    id: string;
    period: string;
    liquidityScore: string;
    leverageScore: string;
    profitabilityScore: string;
    zScore: string;
    totalScore: string;
    details: {
        metrics: {
            current_ratio: string;
            debt_equity: string;
            roe: string;
            z_score: string;
            is_insolvent: boolean;
        };
        is_insolvent: boolean;
    };
    companyId: string;
}

export interface Alert {
    id: string;
    companyId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    isResolved: boolean;
    createdAt: string;
}

export interface DashboardData {
    company: Company;
    latest_score: RiskScore;
    history_charts: RiskScore[];
    alerts: Alert[];
}

export interface IngestFinancialDataDto {
    ticker: string;
    companyName: string;
    period: string;
    revenue: number | string;
    netIncome: number | string;
    equity: number | string;
    totalAssets: number | string;
    currentAssets: number | string;
    totalLiabilities: number | string;
    currentLiabilities: number | string;
    cashFlowOperating: number | string;
    industry?: string;
    sector?: string;
}

// --- RAG Interfaces ---
export interface CompanyDocument {
    id: string;
    companyId: string;
    filename: string;
    filePath: string;
    fileType: string;
    uploadDate: string;
    status: 'PENDING' | 'PROCESSED' | 'ERROR';
}

export interface ChatResponse {
    answer: string;
    sources: any[];
    context_used?: string;
}

export interface RiskProfile {
    id: string;
    companyId: string;
    keywords: string[];
    competitors: string[];
    riskThreshold: number;
    monitoringFrequency: 'DAILY' | 'WEEKLY';
    emailRecipients: string[];
}

export interface UpdateRiskProfileDto {
    keywords?: string[];
    competitors?: string[];
    riskThreshold?: number;
    monitoringFrequency?: 'DAILY' | 'WEEKLY';
    emailRecipients?: string[];
}

export const financeApi = {
    // 1. Ingest Data
    ingest: async (data: IngestFinancialDataDto) => {
        const response = await apiInstance.post('/finance/ingest', data);
        return response.data;
    },

    // 2. Get Dashboard
    getDashboard: async (ticker: string) => {
        const response = await apiInstance.get<DashboardData>(`/finance/${ticker}/dashboard`);
        return response.data;
    },

    // 3. Analyze News
    analyzeNews: async (ticker: string, companyName: string) => {
        const response = await apiInstance.post('/finance/analyze-news', { ticker, companyName });
        return response.data;
    },

    // --- RAG Methods ---

    // 4. Upload Document
    uploadDocument: async (companyId: string, file: File) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await apiInstance.post(`/finance/${companyId}/upload-doc`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // { message, documentId }
    },

    // 5. Get Documents
    getDocuments: async (companyId: string) => {
        const response = await apiInstance.get<CompanyDocument[]>(`/finance/${companyId}/documents`);
        return response.data;
    },

    // 6. Chat with Documents
    chatWithDocuments: async (companyId: string, query: string) => {
        const response = await apiInstance.post<ChatResponse>(`/finance/${companyId}/chat`, { query });
        return response.data;
    },

    // 7. Delete Document
    deleteDocument: async (companyId: string, documentId: string) => {
        const response = await apiInstance.delete(`/finance/${companyId}/documents/${documentId}`);
        return response.data;
    },

    // 8. Risk Profile
    getRiskProfile: async (companyId: string) => {
        const response = await apiInstance.get<RiskProfile>(`/finance/${companyId}/risk-profile`);
        return response.data;
    },

    saveRiskProfile: async (companyId: string, data: UpdateRiskProfileDto) => {
        const response = await apiInstance.post<RiskProfile>(`/finance/${companyId}/risk-profile`, data);
        return response.data;
    }
};
