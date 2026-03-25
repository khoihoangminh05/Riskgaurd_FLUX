
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { RiskEngineService } from './risk-engine.service';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        @InjectQueue('risk-analysis-queue') // Inject the queue
        private readonly riskQueue: Queue,
        private readonly riskEngineService: RiskEngineService,
    ) { }

    // Run at 8 AM daily
    @Cron('0 8 * * *')
    async handleDailyCron() {
        this.logger.log('Running daily risk analysis scheduler...');
        const companies = await this.companyRepo.find();
        this.logger.log(`Found ${companies.length} companies to analyze.`);

        for (const company of companies) {
            // Standardizing the call across scheduler and manual trigger
            await this.executeRiskAnalysisPipeline(company.id);
        }
    }

    async executeRiskAnalysisPipeline(companyId: string) {
        this.logger.log(`Executing Risk Analysis Pipeline for company ${companyId}`);
        // Calling the core risk engine logic directly to ensure synchronous completion for manual triggers
        await this.riskEngineService.executeRiskAnalysisPipeline(companyId);
    }
}
