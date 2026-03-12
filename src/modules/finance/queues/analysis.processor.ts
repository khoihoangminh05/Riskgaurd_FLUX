
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import type { Job } from 'bull';
import { RiskEngineService } from '../services/risk-engine.service';

@Processor('risk-analysis-queue')
export class AnalysisProcessor {
    private readonly logger = new Logger(AnalysisProcessor.name);

    constructor(private readonly riskEngineService: RiskEngineService) { }

    @Process('daily_scan')
    async handleDailyScan(job: Job<{ companyId: string }>) {
        const { companyId } = job.data;
        this.logger.log(`Starting daily risk analysis for company ${companyId}...`);

        try {
            await this.riskEngineService.analyzeNews(companyId);
            this.logger.log(`Daily risk analysis for company ${companyId} completed.`);
        } catch (error) {
            this.logger.error(`Daily risk analysis for company ${companyId} failed: ${error.message}`);
            // BullMQ will handle retries if configured
            throw error;
        }
    }
}
