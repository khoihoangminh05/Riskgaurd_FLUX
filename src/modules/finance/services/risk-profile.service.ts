import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RiskProfile } from '../entities/risk-profile.entity';
import { Company } from '../entities/company.entity';
import { UpdateRiskProfileDto } from '../dto/update-risk-profile.dto';

@Injectable()
export class RiskProfileService {
    constructor(
        @InjectRepository(RiskProfile)
        private readonly profileRepo: Repository<RiskProfile>,
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
    ) { }

    async getProfile(companyId: string): Promise<RiskProfile> {
        let profile = await this.profileRepo.findOne({ where: { companyId } });

        // If not found, return default structure (not saved to DB yet)
        if (!profile) {
            profile = this.profileRepo.create({
                companyId,
                keywords: [],
                competitors: [],
                riskThreshold: 70,
                emailRecipients: []
            });
        }
        return profile;
    }

    async upsertProfile(companyId: string, dto: UpdateRiskProfileDto): Promise<RiskProfile> {
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException(`Company ${companyId} not found`);
        }

        let profile = await this.profileRepo.findOne({ where: { companyId } });

        if (!profile) {
            profile = this.profileRepo.create({
                companyId,
                ...dto
            });
        } else {
            Object.assign(profile, dto);
        }

        return this.profileRepo.save(profile);
    }
}
