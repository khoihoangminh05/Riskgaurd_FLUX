import { Controller, Patch, Param, Body, UseGuards, Get } from '@nestjs/common';
import { CompanyService } from '../services/company.service';
import { RiskEngineService } from '../services/risk-engine.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('companies')
@UseGuards(JwtAuthGuard)
export class CompanyController {
    constructor(
        private readonly companyService: CompanyService,
        private readonly riskEngine: RiskEngineService
    ) {}

    @Get(':id')
    async getCompany(@Param('id') id: string) {
        return this.companyService.getCompanyById(id);
    }

    @Patch(':id')
    async updateCompany(
        @Param('id') id: string,
        @Body() updateData: { name?: string; ticker?: string; industry?: string; sector?: string },
    ) {
        return this.companyService.updateCompany(id, updateData);
    }

    @Get(':id/risk-score')
    async getRiskScore(@Param('id') id: string) {
        return this.riskEngine.calculateDynamicRiskScore(id);
    }

    @Get(':id/metrics')
    async getMetrics(@Param('id') id: string) {
        const company = await this.companyService.getCompanyById(id);
        const {
            cashRunway, burnRate, quickRatio, debtEquityRatio,
            interestCoverageRatio, grossProfitMargin, inventoryTurnover, operatingCashFlow
        } = company;
        return {
            cashRunway, burnRate, quickRatio, debtEquityRatio,
            interestCoverageRatio, grossProfitMargin, inventoryTurnover, operatingCashFlow
        };
    }

    @Patch(':id/metrics')
    async updateMetrics(
        @Param('id') id: string,
        @Body() metricsData: any
    ) {
        return this.companyService.updateCompany(id, metricsData);
    }
}
