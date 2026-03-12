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
import { Alert, AlertSeverity } from '../entities/alert.entity';
import { Company } from '../entities/company.entity';
import { RiskProfileService } from './risk-profile.service';
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
        @InjectRepository(CompanyDocument)
        private readonly documentRepo: Repository<CompanyDocument>,
        private readonly httpService: HttpService,
        private readonly riskProfileService: RiskProfileService,
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

    private async createAlert(companyId: string, severity: AlertSeverity, message: string) {
        const alert = this.alertRepo.create({
            companyId,
            severity,
            message,
            isResolved: false
        });
        await this.alertRepo.save(alert);
    }

    async analyzeNews(companyId: string): Promise<RiskEvent> {
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

            // 4. Trigger Alert if High Risk
            if (riskEvent.riskScoreValue > 70) {
                await this.createAlert(
                    companyId,
                    AlertSeverity.HIGH,
                    `AI Risk Alert: ${riskEvent.summary} (Score: ${riskEvent.riskScoreValue})`
                );
            }

            return riskEvent;

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

}
