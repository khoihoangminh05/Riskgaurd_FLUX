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
    isSetupComplete?: boolean;
    cashRunway?: number;
    burnRate?: number;
    quickRatio?: number;
    debtEquityRatio?: number;
    interestCoverageRatio?: number;
    grossProfitMargin?: number;
    inventoryTurnover?: number;
    operatingCashFlow?: number;
}

export interface FinancialMetrics {
    cashRunway?: number;
    burnRate?: number;
    quickRatio?: number;
    debtEquityRatio?: number;
    interestCoverageRatio?: number;
    grossProfitMargin?: number;
    inventoryTurnover?: number;
    operatingCashFlow?: number;
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
    createdAt: string;
}

export interface Alert {
    id: string;
    companyId: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    message: string;
    isResolved: boolean;
    createdAt: string;
}

export interface RiskEvent {
    id: string;
    companyId: string;
    title: string;
    summary: string;
    sentiment: 'Bullish' | 'Bearish' | 'Neutral';
    riskScoreValue: number;
    sourceUrl: string;
    tags: string[];
    publishedAt: string;
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

    getDashboardMetrics: async (companyId: string) => {
        const response = await apiInstance.get<DashboardData>(`/finance/${companyId}/dashboard-metrics`);
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
    },

    // 9. Get Alerts (Dedicated Alert Controller)
    getAlerts: async (companyId: string) => {
        const response = await apiInstance.get<Alert[]>(`/alerts/${companyId}`);
        return response.data;
    },

    // 10. Create Mock Alert (Hackathon Simulation)
    createMockAlert: async (companyId: string, severity: string, message: string) => {
        const response = await apiInstance.post<Alert>('/alerts/mock', { companyId, severity, message });
        return response.data;
    },

    // --- New Alert Management Methods ---
    triggerFullAnalysis: async (companyId: string) => {
        const response = await apiInstance.post(`/alerts/trigger-analysis/${companyId}`);
        return response.data;
    },

    deleteAlert: async (alertId: string) => {
        const response = await apiInstance.delete(`/alerts/${alertId}`);
        return response.data;
    },

    toggleAlertImportance: async (alertId: string) => {
        const response = await apiInstance.patch<Alert>(`/alerts/${alertId}/important`);
        return response.data;
    },

    // 11. Get Market Intelligence (Historical Risk Events)
    getMarketIntelligence: async (companyId: string) => {
        const response = await apiInstance.get<RiskEvent[]>(`/finance/${companyId}/market-intelligence`);
        return response.data;
    },

    // 12. Get Competitors (Rich Objects)
    getCompetitors: async (companyId: string) => {
        const response = await apiInstance.get<any[]>(`/finance/${companyId}/competitors`);
        return response.data;
    },

    // 13. Get Predictions / Forecasting
    getPredictions: async (companyId: string) => {
        const response = await apiInstance.get<any>(`/finance/${companyId}/predictions`);
        return response.data;
    },

    updateCompanyDetails: async (companyId: string, data: { 
        name?: string; 
        ticker?: string; 
        industry?: string; 
        sector?: string;
        cashRunway?: number;
        burnRate?: number;
        quickRatio?: number;
        debtEquityRatio?: number;
        interestCoverageRatio?: number;
        grossProfitMargin?: number;
        inventoryTurnover?: number;
        operatingCashFlow?: number;
    }) => {
        const response = await apiInstance.patch<Company>(`/companies/${companyId}`, data);
        return response.data;
    },

    // 15. Get Dynamic Risk Score
    getDynamicRiskScore: async (companyId: string) => {
        const response = await apiInstance.get<{ currentScore: number; baseScore: number; alertPenalty: number }>(`/companies/${companyId}/risk-score`);
        return response.data;
    },

    // 16. Get Financial Metrics
    getFinancialMetrics: async (companyId: string) => {
        const response = await apiInstance.get<FinancialMetrics>(`/companies/${companyId}/metrics`);
        return response.data;
    },

    // 17. Update Financial Metrics
    updateFinancialMetrics: async (companyId: string, data: FinancialMetrics) => {
        const response = await apiInstance.patch<Company>(`/companies/${companyId}/metrics`, data);
        return response.data;
    },

    // 18. Trigger AI Auto-Extract
    triggerAIExtraction: async (companyId: string) => {
        const response = await apiInstance.post(`/finance/extract/${companyId}`);
        return response.data;
    },

    // 19. Get Risk Chart History
    getRiskChartHistory: async (companyId: string) => {
        const response = await apiInstance.get<DashboardData>(`/finance/${companyId}/dashboard-metrics`);
        return response.data.history_charts || [];
    }
};

export default financeApi;
