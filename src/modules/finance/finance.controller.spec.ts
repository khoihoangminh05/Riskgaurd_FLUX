import { Test, TestingModule } from '@nestjs/testing';
import { FinanceController } from './finance.controller';
import { RiskEngineService } from './services/risk-engine.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { FinancialStatement } from './entities/financial-statement.entity';
import { RiskScore } from './entities/risk-score.entity';
import { Alert } from './entities/alert.entity';
import { IngestFinancialDataDto } from './dto/ingest-financial-data.dto';
import Decimal from 'decimal.js';

describe('FinanceController', () => {
    let controller: FinanceController;
    let riskEngine: RiskEngineService;
    let companyRepo: any;
    let statementRepo: any;
    let riskScoreRepo: any;
    let alertRepo: any;

    beforeEach(async () => {
        const mockCompanyRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };
        const mockStatementRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };
        const mockRiskScoreRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };
        const mockAlertRepo = {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
        };

        const mockRiskEngine = {
            assessRisk: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            controllers: [FinanceController],
            providers: [
                { provide: RiskEngineService, useValue: mockRiskEngine },
                { provide: getRepositoryToken(Company), useValue: mockCompanyRepo },
                { provide: getRepositoryToken(FinancialStatement), useValue: mockStatementRepo },
                { provide: getRepositoryToken(RiskScore), useValue: mockRiskScoreRepo },
                { provide: getRepositoryToken(Alert), useValue: mockAlertRepo },
            ],
        }).compile();

        controller = module.get<FinanceController>(FinanceController);
        riskEngine = module.get<RiskEngineService>(RiskEngineService);
        companyRepo = module.get(getRepositoryToken(Company));
        statementRepo = module.get(getRepositoryToken(FinancialStatement));
        riskScoreRepo = module.get(getRepositoryToken(RiskScore));
        alertRepo = module.get(getRepositoryToken(Alert));
    });

    it('should define controller', () => {
        expect(controller).toBeDefined();
    });

    describe('ingestData', () => {
        it('should ingest data, create company/statement and assess risk', async () => {
            const dto: IngestFinancialDataDto = {
                ticker: 'TEST',
                period: '2023-Q4',
                companyName: 'Test Corp',
                revenue: '1000',
                netIncome: '100',
                equity: '500',
                totalAssets: '1000',
                currentAssets: '200',
                totalLiabilities: '500',
                currentLiabilities: '100',
                cashFlowOperating: '100',
                industry: 'Tech',
                sector: 'Software',
            };

            const mockCompany = { id: 'uuid-1', ticker: 'TEST' };
            const mockStatement = { id: 'uuid-s1' };
            const mockRiskScore = { totalScore: new Decimal(85) };

            companyRepo.findOne.mockResolvedValue(null); // Company not found initially
            companyRepo.create.mockReturnValue(mockCompany);
            companyRepo.save.mockResolvedValue(mockCompany);

            statementRepo.findOne.mockResolvedValue(null); // Statement not found
            statementRepo.create.mockReturnValue(mockStatement);
            statementRepo.save.mockResolvedValue(mockStatement);

            riskEngine.assessRisk.mockResolvedValue(mockRiskScore);

            const result = await controller.ingestData(dto);

            expect(companyRepo.create).toHaveBeenCalledWith(expect.objectContaining({ ticker: 'TEST' }));
            expect(statementRepo.create).toHaveBeenCalled();
            expect(riskEngine.assessRisk).toHaveBeenCalledWith('uuid-1', '2023-Q4');
            expect(result).toBe(mockRiskScore);
        });
    });
});
