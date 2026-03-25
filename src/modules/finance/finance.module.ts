import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { FinancialStatement } from './entities/financial-statement.entity';
import { RiskScore } from './entities/risk-score.entity';
import { RiskScoreHistory } from './entities/risk-score-history.entity';
import { Alert } from './entities/alert.entity';
import { RiskEvent } from './entities/risk-event.entity';
import { CompanyDocument } from './entities/company-document.entity';
import { HttpModule } from '@nestjs/axios';
import { MulterModule } from '@nestjs/platform-express';
import { FinancialCalculatorService } from './services/financial-calculator.service';
import { RiskEngineService } from './services/risk-engine.service';
import { RiskProfileService } from './services/risk-profile.service';
import { RiskProfile } from './entities/risk-profile.entity';
import { FinanceController } from './finance.controller';
import { RiskProfileController } from './controllers/risk-profile.controller';
import { AlertController } from './controllers/alert.controller';
import { AlertService } from './services/alert.service';
import { BullModule } from '@nestjs/bull';
import { AnalysisProcessor } from './queues/analysis.processor';
import { SchedulerService } from './services/scheduler.service';
import { RiskGateway } from './gateways/risk.gateway';
import { CompanyService } from './services/company.service';
import { CompanyController } from './controllers/company.controller';

@Module({
    imports: [
        HttpModule,
        MulterModule.register({
            dest: './uploads',
        }),
        TypeOrmModule.forFeature([
            Company,
            FinancialStatement,
            RiskScore,
            RiskScoreHistory,
            Alert,
            RiskEvent,
            CompanyDocument,
            RiskProfile,
        ]),
        BullModule.forRootAsync({
            imports: [ConfigModule],
            useFactory: async (configService: ConfigService) => ({
                redis: {
                    host: configService.get('REDIS_HOST', 'localhost'),
                    port: configService.get('REDIS_PORT', 6379),
                },
            }),
            inject: [ConfigService],
        }),
        BullModule.registerQueue({
            name: 'risk-analysis-queue',
        }),
    ],
    controllers: [FinanceController, RiskProfileController, AlertController, CompanyController],
    providers: [
        FinancialCalculatorService, 
        RiskEngineService, 
        RiskProfileService, 
        AlertService,
        AnalysisProcessor, 
        SchedulerService,
        RiskGateway,
        CompanyService
    ],
    exports: [TypeOrmModule, FinancialCalculatorService, RiskEngineService, RiskProfileService, AlertService, CompanyService, BullModule], // Export BullModule if other modules need queue
})
export class FinanceModule { }
