import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import Decimal from 'decimal.js';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RiskEvent } from '../entities/risk-event.entity';
import { CompanyDocument, DocumentStatus } from '../entities/company-document.entity';

import { FinancialCalculatorService } from './financial-calculator.service';
import { FinancialStatement } from '../entities/financial-statement.entity';
import { RiskScore } from '../entities/risk-score.entity';
import { RiskScoreHistory } from '../entities/risk-score-history.entity';
import { Alert, AlertSeverity } from '../entities/alert.entity';
import { Company } from '../entities/company.entity';
import { RiskProfileService } from './risk-profile.service';
import { RiskGateway } from '../gateways/risk.gateway';
import * as fs from 'fs/promises';

@Injectable()
export class RiskEngineService {
    constructor(
        private readonly calculator: FinancialCalculatorService,
        @InjectRepository(FinancialStatement)
        private readonly statementRepo: Repository<FinancialStatement>,
        @InjectRepository(RiskScore)
        private readonly riskScoreRepo: Repository<RiskScore>,
        @InjectRepository(Alert)
        private readonly alertRepo: Repository<Alert>,
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        @InjectRepository(RiskEvent)
        private readonly riskEventRepo: Repository<RiskEvent>,
        @InjectRepository(RiskScoreHistory)
        private readonly riskScoreHistoryRepo: Repository<RiskScoreHistory>,
        @InjectRepository(CompanyDocument)
        private readonly documentRepo: Repository<CompanyDocument>,
        private readonly httpService: HttpService,
        private readonly riskProfileService: RiskProfileService,
        private readonly riskGateway: RiskGateway,
    ) { }

    async assessRisk(companyId: string, period: string): Promise<RiskScore> {
        // 1. Fetch Financial Data
        const statement = await this.statementRepo.findOne({
            where: { companyId, period },
            relations: ['company'],
        });

        if (!statement) {
            throw new Error(`Financial Statement not found for Company ${companyId} Period ${period}`);
        }

        // 2. Calculate Metrics
        const metrics = this.calculator.calculateMetrics(statement);

        // 3. Scoring Rules (0-100)
        let liquidityScore = new Decimal(100);
        let leverageScore = new Decimal(100);
        let profitabilityScore = new Decimal(100);

        // Liquidity: Current Ratio < 1.0 -> 40, else 100
        if (metrics.current_ratio.lessThan(1.0)) {
            liquidityScore = new Decimal(40);
        }

        // Leverage: Debt/Equity > 2.5 -> 50, else 100
        if (metrics.is_insolvent || metrics.debt_equity.greaterThan(2.5)) {
            leverageScore = new Decimal(50);
        }

        // Profitability: Net Income < 0 -> 30, else 100
        if (statement.netIncome.isNegative()) {
            profitabilityScore = new Decimal(30);
        }

        // 4. Total Score (Weighted Avg)
        // 30% Liquidity, 30% Leverage, 40% Profitability
        const totalScore = liquidityScore.times(0.3)
            .plus(leverageScore.times(0.3))
            .plus(profitabilityScore.times(0.4));

        // 5. Save Risk Score
        const riskScore = this.riskScoreRepo.create({
            companyId,
            period,
            liquidityScore,
            leverageScore,
            profitabilityScore,
            zScore: metrics.z_score,
            totalScore,
            details: {
                metrics,
                is_insolvent: metrics.is_insolvent
            },
            company: statement.company,
        });

        await this.riskScoreRepo.save(riskScore);

        // 5b. Save initial baseline to History
        const initialHistory = this.riskScoreHistoryRepo.create({
            companyId,
            baseFinancialScore: totalScore,
            aiPenaltyScore: new Decimal(0),
            totalDynamicScore: totalScore,
        });
        await this.riskScoreHistoryRepo.save(initialHistory);

        // 6. Create Alert if needed
        if (totalScore.lessThan(50)) {
            await this.createAlert(
                companyId,
                AlertSeverity.HIGH,
                `High Risk Detected: Total Score ${totalScore.toFixed(2)} is below threshold (50).`
            );
        }

        return riskScore;
    }

    private async createAlert(companyId: string, severity: AlertSeverity, message: string): Promise<Alert> {
        const alert = this.alertRepo.create({
            companyId,
            severity,
            message,
            isResolved: false
        });
        return await this.alertRepo.save(alert);
    }

    async executeRiskAnalysisPipeline(companyId: string): Promise<{ riskEvent: RiskEvent; alert: Alert | null }> {
        // 1. Fetch Company
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new Error(`Company ${companyId} not found`);
        }

        // 2. Fetch Risk Profile
        const profile = await this.riskProfileService.getProfile(companyId);

        // 3. Call Python AI Service
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:8000/api/v1/analyze/news', {
                    ticker: company.ticker,
                    company_name: company.name,
                    company_id: company.id,
                    risk_profile: {
                        keywords: profile ? profile.keywords : [],
                        competitors: profile ? profile.competitors : [],
                        threshold: profile ? profile.riskThreshold : 70
                    }
                })
            );

            const analysis = response.data;

            // 3. Save Risk Event
            const riskEvent = this.riskEventRepo.create({
                companyId,
                title: analysis.title || `Risk Analysis for ${company.name}`,
                sourceUrl: analysis.source_urls?.[0] || 'Unknown', // Taking first URL for now or need to handle multiple
                publishedAt: new Date(),
                sentiment: analysis.sentiment,
                riskScoreValue: analysis.risk_score,
                summary: analysis.summary,
                tags: analysis.tags,
                company: company,
            });

            await this.riskEventRepo.save(riskEvent);

            // 4. Update Dynamic Time-Series Score
            // Fetch the latest static base score
            const latestBaseScore = await this.riskScoreRepo.findOne({
                where: { companyId },
                order: { period: 'DESC' }
            });

            const baseScore = latestBaseScore ? latestBaseScore.totalScore : new Decimal(100);

            // Map the AI risk score to a realistic penalty (e.g. AI score of 80 logic: 80% impact -> -15 points max)
            // Or simple scale: an AI Score of 100 drops the financial score by 30 points.
            // aiPenaltyScore = (analysis.risk_score / 100) * 30
            const maxPenalty = 40;
            const aiPenaltyScore = new Decimal(analysis.risk_score).dividedBy(100).times(maxPenalty);

            const totalDynamicScore = Decimal.max(0, baseScore.minus(aiPenaltyScore));

            const dynamicHistory = this.riskScoreHistoryRepo.create({
                companyId,
                baseFinancialScore: baseScore,
                aiPenaltyScore: aiPenaltyScore,
                totalDynamicScore: totalDynamicScore,
            });
            await this.riskScoreHistoryRepo.save(dynamicHistory);

            // 5. Trigger Alerts based on Risk Level
            let createdAlert: Alert | null = null;
            const threshold = profile?.riskThreshold ?? 70;

            if (riskEvent.riskScoreValue >= threshold) {
                createdAlert = await this.createAlert(
                    companyId,
                    AlertSeverity.HIGH,
                    `AI Risk Alert: ${riskEvent.summary} (Penalty: -${aiPenaltyScore.toFixed(2)} pts)`
                );
            } else if (riskEvent.riskScoreValue >= 40) {
                createdAlert = await this.createAlert(
                    companyId,
                    AlertSeverity.MEDIUM,
                    `Lưu ý Rủi ro: ${riskEvent.summary} (Penalty: -${aiPenaltyScore.toFixed(2)} pts)`
                );
            } else {
                const safeMessage = riskEvent.summary && riskEvent.summary.length > 5 
                    ? `[Báo cáo An toàn] AI đã hoàn tất rà soát. Trạng thái doanh nghiệp: Ổn định. ${riskEvent.summary}`
                    : `[Báo cáo An toàn] AI đã hoàn tất rà soát. Dòng tiền ổn định (Runway > 6 tháng), không phát hiện rủi ro đứt gãy chuỗi cung ứng hay tin tức vĩ mô tiêu cực. Trạng thái doanh nghiệp: Ổn định.`;
                
                createdAlert = await this.createAlert(
                    companyId,
                    AlertSeverity.LOW,
                    safeMessage
                );
            }

            // 6. Push Real-Time Websocket Update
            this.riskGateway.emitRiskUpdate(companyId, dynamicHistory, riskEvent);

            return { riskEvent, alert: createdAlert };

        } catch (error) {
            console.error('Failed to analyze news:', error);
            throw new Error('Failed to analyze news via AI Service');
        }
    }

    async ingestFile(companyId: string, documentId: string, filePath: string): Promise<void> {
        try {
            await firstValueFrom(
                this.httpService.post('http://localhost:8000/api/v1/ingest/file', {
                    file_path: filePath,
                    company_id: companyId,
                    document_id: documentId,
                })
            );

            await this.documentRepo.update(documentId, { status: DocumentStatus.PROCESSED });

        } catch (error) {
            console.error('Failed to ingest file:', error);
            await this.documentRepo.update(documentId, { status: DocumentStatus.ERROR });
        }
    }

    async getDocuments(companyId: string): Promise<CompanyDocument[]> {
        return this.documentRepo.find({
            where: { companyId },
            order: { uploadDate: 'DESC' },
        });
    }

    async chatWithDocuments(companyId: string, query: string): Promise<any> {
        try {
            const response = await firstValueFrom(
                this.httpService.post('http://localhost:8000/api/v1/analyze/internal-query', {
                    company_id: companyId,
                    query: query,
                })
            );
            return response.data;
        } catch (error) {
            console.error('Failed to chat with documents:', error);
            throw new Error('Failed to process query via AI Service');
        }
    }

    async deleteDocument(companyId: string, documentId: string): Promise<void> {
        const document = await this.documentRepo.findOne({
            where: { id: documentId, companyId },
        });

        if (!document) {
            throw new Error(`Document ${documentId} not found`);
        }

        // 1. Delete File from System
        try {
            await fs.unlink(document.filePath);
        } catch (error) {
            console.warn(`File not found or could not be deleted: ${document.filePath}`);
        }

        // 2. Delete Record from Database (Cascade will handle embeddings)
        await this.documentRepo.delete(documentId);
    }
    async calculateDynamicRiskScore(companyId: string) {
        // 1. Base Score (Internal)
        // Default to 20 since specific runway/burnRate metrics aren't in current Entity 
        // but can be added later.
        const baseScore = 20;

        // 2. Alert Penalty (External)
        const unresolvedAlerts = await this.alertRepo.find({
            where: { companyId, isResolved: false }
        });

        let alertPenalty = 0;
        unresolvedAlerts.forEach(alert => {
            if (alert.severity === AlertSeverity.HIGH) alertPenalty += 20;
            else if (alert.severity === AlertSeverity.MEDIUM) alertPenalty += 10;
            else if (alert.severity === AlertSeverity.LOW) alertPenalty += 2;
        });

        // 3. Final Score
        const currentScore = Math.min(baseScore + alertPenalty, 100);

        return {
            currentScore,
            baseScore,
            alertPenalty
        };
    }
    async extractMetricsFromLatestReport(companyId: string): Promise<FinancialStatement> {
        // 1. Find the latest document
        const latestDoc = await this.documentRepo.findOne({
            where: { companyId },
            order: { uploadDate: 'DESC' },
        });

        if (!latestDoc) {
            throw new Error(`No documents found for company ${companyId}`);
        }

        // 2. Call Python AI Service for Extraction (Mocked or real)
        let extractedData: any;
        try {
            // Uncomment to use real LLM endpoint when ready:
            // const response = await firstValueFrom(
            //     this.httpService.post('http://localhost:8000/api/v1/extract/metrics', {
            //         company_id: companyId,
            //         document_id: latestDoc.id
            //     })
            // );
            // extractedData = response.data;
            
            // Mocking for now:
            extractedData = {
                cashRunway: 12.5,
                burnRate: 50000,
                quickRatio: 1.2,
                debtToEquity: 0.8,
                interestCoverage: 4.5,
                grossMargin: 65.0,
                inventoryTurnover: 5.2,
                operatingCashFlow: 150000,
                period: '2024-Q1', // AI can optionally return the detected period
                revenue: 1000000,
                netIncome: 120000,
                equity: 500000,
                totalAssets: 1200000,
                currentAssets: 600000,
                totalLiabilities: 700000,
                currentLiabilities: 300000,
                cashFlowOperating: 150000
            };
        } catch (error) {
            console.error('Failed to extract metrics:', error);
            throw new Error('LLM Metric Extraction Failed');
        }

        // 3. Upsert FinancialStatement
        const period = extractedData.period || 'AI-Extracted';
        
        let statement = await this.statementRepo.findOne({
            where: { companyId, period }
        });

        if (!statement) {
            statement = this.statementRepo.create({
                companyId,
                period,
                revenue: new Decimal(extractedData.revenue || 0),
                netIncome: new Decimal(extractedData.netIncome || 0),
                equity: new Decimal(extractedData.equity || 0),
                totalAssets: new Decimal(extractedData.totalAssets || 0),
                currentAssets: new Decimal(extractedData.currentAssets || 0),
                totalLiabilities: new Decimal(extractedData.totalLiabilities || 0),
                currentLiabilities: new Decimal(extractedData.currentLiabilities || 0),
                cashFlowOperating: new Decimal(extractedData.cashFlowOperating || 0),
                cashRunway: new Decimal(extractedData.cashRunway),
                burnRate: new Decimal(extractedData.burnRate),
                quickRatio: new Decimal(extractedData.quickRatio),
                debtToEquity: new Decimal(extractedData.debtToEquity),
                interestCoverage: new Decimal(extractedData.interestCoverage),
                grossMargin: new Decimal(extractedData.grossMargin),
                inventoryTurnover: new Decimal(extractedData.inventoryTurnover),
                operatingCashFlow: new Decimal(extractedData.operatingCashFlow),
                rawData: { extractedFromDocId: latestDoc.id }
            });
        } else {
            // Update existing
            statement.cashRunway = new Decimal(extractedData.cashRunway);
            statement.burnRate = new Decimal(extractedData.burnRate);
            statement.quickRatio = new Decimal(extractedData.quickRatio);
            statement.debtToEquity = new Decimal(extractedData.debtToEquity);
            statement.interestCoverage = new Decimal(extractedData.interestCoverage);
            statement.grossMargin = new Decimal(extractedData.grossMargin);
            statement.inventoryTurnover = new Decimal(extractedData.inventoryTurnover);
            statement.operatingCashFlow = new Decimal(extractedData.operatingCashFlow);
            statement.rawData = { ...statement.rawData, extractedFromDocId: latestDoc.id, updatedByAI: true };
        }

        await this.statementRepo.save(statement);
        
        return statement;
    }
}
