import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyService {
    constructor(
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
    ) {}

    async updateCompany(id: string, updateData: Partial<Company>): Promise<Company> {
        const company = await this.companyRepo.findOne({ where: { id } });
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }

        // Merge update data
        Object.assign(company, updateData);

        return await this.companyRepo.save(company);
    }

    async getCompanyById(id: string): Promise<Company> {
        const company = await this.companyRepo.findOne({ where: { id } });
        if (!company) {
            throw new NotFoundException(`Company with ID ${id} not found`);
        }
        return company;
    }
}
