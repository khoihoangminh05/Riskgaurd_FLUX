import { Test, TestingModule } from '@nestjs/testing';
import { FinancialCalculatorService } from './financial-calculator.service';
import { FinancialStatement } from '../entities/financial-statement.entity';
import Decimal from 'decimal.js';

describe('FinancialCalculatorService', () => {
    let service: FinancialCalculatorService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [FinancialCalculatorService],
        }).compile();

        service = module.get<FinancialCalculatorService>(FinancialCalculatorService);
    });

    it('should calculate metrics correctly for a healthy company', () => {
        const stmt = new FinancialStatement();
        stmt.currentAssets = new Decimal(200);
        stmt.currentLiabilities = new Decimal(100); // CR = 2.0
        stmt.totalLiabilities = new Decimal(500);
        stmt.equity = new Decimal(500); // D/E = 1.0
        stmt.netIncome = new Decimal(50); // ROE = 0.1
        stmt.totalAssets = new Decimal(1000);
        stmt.revenue = new Decimal(1000); // Not used in formula currently but good to have
        stmt.cashFlowOperating = new Decimal(100);

        const metrics = service.calculateMetrics(stmt);

        expect(metrics.current_ratio.toNumber()).toBe(2.0);
        expect(metrics.debt_equity.toNumber()).toBe(1.0);
        expect(metrics.roe.toNumber()).toBe(0.1);
        expect(metrics.is_insolvent).toBe(false);
    });

    it('should handle insolvency (negative equity)', () => {
        const stmt = new FinancialStatement();
        stmt.equity = new Decimal(-100);
        stmt.currentAssets = new Decimal(100);
        stmt.currentLiabilities = new Decimal(100);
        stmt.totalLiabilities = new Decimal(500);
        stmt.netIncome = new Decimal(-50);
        stmt.totalAssets = new Decimal(400);

        const metrics = service.calculateMetrics(stmt);

        expect(metrics.is_insolvent).toBe(true);
        expect(metrics.roe.toNumber()).toBe(-999);
    });

    it('should handle safe division (divide by zero)', () => {
        const result = service.safeDiv(new Decimal(100), new Decimal(0));
        expect(result.toNumber()).toBe(0);
    });
});
