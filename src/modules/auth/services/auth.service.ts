import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from '../entities/user.entity';
import { Company } from '../../finance/entities/company.entity';
import { FinancialStatement } from '../../finance/entities/financial-statement.entity';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Company)
        private companyRepository: Repository<Company>,
        @InjectRepository(FinancialStatement)
        private financialStatementRepository: Repository<FinancialStatement>,
        private jwtService: JwtService,
    ) { }

    async register(dto: any) {
        const { companyName, email, password, fullName } = dto;

        const existingUser = await this.userRepository.findOne({ where: { email } });
        if (existingUser) {
            throw new ConflictException('Email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create Company first (You might want to check if company ticker already exists, but here we use names)
        // For simplicity, let's assume ticker is derived or generated. 
        // The requirement says: Create Company FIRST, then Create User linked to that Company.

        const company = this.companyRepository.create({
            name: companyName,
            ticker: companyName.substring(0, 4).toUpperCase(), // Placeholder ticker logic
            industry: 'Default',
            sector: 'Default',
        });
        await this.companyRepository.save(company);

        const user = this.userRepository.create({
            email,
            password: hashedPassword,
            fullName,
            role: UserRole.ADMIN, // First user of a company is ADMIN
            company,
        });

        await this.userRepository.save(user);

        return { message: 'User and Company registered successfully' };
    }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.userRepository.findOne({
            where: { email },
            relations: ['company'],
        });

        if (user && await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = {
            email: user.email,
            sub: user.id,
            companyId: user.company?.id,
        };

        // EXPLICIT count query using relation for reliability
        const dataCount = await this.financialStatementRepository.count({
            where: { company: { id: user.company?.id } }
        });

        const isSetupComplete = dataCount > 0;

        console.log(`[DEBUG AUTH] User: ${user.email}, CompanyID: ${user.company?.id}, DataCount: ${dataCount}, isSetupComplete: ${isSetupComplete}`);

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                ...user,
                isSetupComplete: isSetupComplete
            }
        };
    }
}
