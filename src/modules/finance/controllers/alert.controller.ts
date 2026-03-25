import { Controller, Get, Post, Body, Param, UseGuards, Delete, Patch } from '@nestjs/common';
import { AlertService } from '../services/alert.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AlertSeverity } from '../entities/alert.entity';
import { RiskEngineService } from '../services/risk-engine.service';
import { SchedulerService } from '../services/scheduler.service';

@Controller('alerts')
@UseGuards(JwtAuthGuard)
export class AlertController {
    constructor(
        private readonly alertService: AlertService,
        private readonly riskEngineService: RiskEngineService,
        private readonly schedulerService: SchedulerService,
    ) {}

    @Get(':companyId')
    async getAlerts(@Param('companyId') companyId: string) {
        return this.alertService.getAlerts(companyId);
    }

    @Post('mock')
    async createMockAlert(
        @Body() body: { companyId: string; severity: AlertSeverity; message: string }
    ) {
        return this.alertService.createAlert(body.companyId, body.severity, body.message);
    }

    @Post('trigger-analysis/:companyId')
    async triggerAnalysis(@Param('companyId') companyId: string) {
        const result = await this.schedulerService.executeRiskAnalysisPipeline(companyId);
        return { 
            status: 'success', 
            message: 'Agentic analysis completed',
            data: result
        };
    }

    @Delete(':id')
    async deleteAlert(@Param('id') id: string) {
        await this.alertService.deleteAlert(id);
        return { message: 'Alert deleted successfully' };
    }

    @Patch(':id/important')
    async toggleImportant(@Param('id') id: string) {
        return this.alertService.toggleImportant(id);
    }
}
