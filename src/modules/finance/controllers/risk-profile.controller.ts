import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { RiskProfileService } from '../services/risk-profile.service';
import { UpdateRiskProfileDto } from '../dto/update-risk-profile.dto';

@Controller('finance/:companyId/risk-profile')
export class RiskProfileController {
    constructor(private readonly riskProfileService: RiskProfileService) { }

    @Get()
    async getProfile(@Param('companyId', ParseUUIDPipe) companyId: string) {
        return this.riskProfileService.getProfile(companyId);
    }

    @Post()
    async upsertProfile(
        @Param('companyId', ParseUUIDPipe) companyId: string,
        @Body() dto: UpdateRiskProfileDto,
    ) {
        return this.riskProfileService.upsertProfile(companyId, dto);
    }
}
