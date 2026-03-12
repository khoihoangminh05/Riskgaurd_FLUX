
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectQueue } from '@nestjs/bull';
import type { Queue } from 'bull';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class SchedulerService {
    private readonly logger = new Logger(SchedulerService.name);

    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        @InjectQueue('risk-analysis-queue') // Inject the queue
        private readonly riskQueue: Queue,
    ) { }

    // Run at 8 AM daily
    @Cron('0 8 * * *')
    async handleDailyCron() {
        this.logger.log('Running daily risk analysis scheduler...');

        const companies = await this.companyRepo.find();
        this.logger.log(`Found ${companies.length} companies to analyze.`);

        for (const company of companies) {
            // Add job to queue with a small delay to rate limit if needed (logic can be in processor or here)
            // For simple rate limiting, we can use `delay` option in Bull, but for now let's just queue them.
            // Bull processes them according to concurrency settings.

            await this.riskQueue.add('daily_scan', {
                companyId: company.id
            }, {
                removeOnComplete: true,
                attempts: 3,
                backoff: 5000
            });
        }
    }
}
