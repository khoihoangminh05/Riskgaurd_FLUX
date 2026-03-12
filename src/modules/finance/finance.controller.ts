import { Controller, Post, Body, Get, Param, NotFoundException, UseInterceptors, UploadedFile, Delete } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CompanyDocument, DocumentStatus } from './entities/company-document.entity';
import { IngestFinancialDataDto } from './dto/ingest-financial-data.dto';
import { RiskEngineService } from './services/risk-engine.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { Repository } from 'typeorm';
import { FinancialStatement } from './entities/financial-statement.entity';
import Decimal from 'decimal.js';
import { RiskScore } from './entities/risk-score.entity';
import { Alert } from './entities/alert.entity';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { resolve } from 'path';
import { UpdateRiskProfileDto } from './dto/update-risk-profile.dto';

@Controller('finance')
export class FinanceController {
    constructor(
        private readonly riskEngine: RiskEngineService,
        @InjectRepository(Company)
        private readonly companyRepo: Repository<Company>,
        @InjectRepository(FinancialStatement)
        private readonly statementRepo: Repository<FinancialStatement>,
        @InjectRepository(RiskScore)
        private readonly riskScoreRepo: Repository<RiskScore>,
        @InjectRepository(Alert)
        private readonly alertRepo: Repository<Alert>,
        @InjectRepository(CompanyDocument)
        private readonly documentRepo: Repository<CompanyDocument>,
    ) { }

    @Post('ingest')
    async ingestData(@Body() dto: IngestFinancialDataDto) {
        // 1. Find or Create Company
        let company = await this.companyRepo.findOne({ where: { ticker: dto.ticker } });
        if (!company) {
            company = this.companyRepo.create({
                ticker: dto.ticker,
                name: dto.companyName,
                industry: dto.industry || 'Unknown',
                sector: dto.sector || 'Unknown',
            });
            await this.companyRepo.save(company);
        }

        // 2. Save Financial Statement
        // Check if exists to update or create new
        let statement = await this.statementRepo.findOne({
            where: { companyId: company.id, period: dto.period },
        });

        if (!statement) {
            statement = this.statementRepo.create({
                companyId: company.id,
                period: dto.period,
                revenue: new Decimal(dto.revenue),
                netIncome: new Decimal(dto.netIncome),
                equity: new Decimal(dto.equity),
                totalAssets: new Decimal(dto.totalAssets),
                currentAssets: new Decimal(dto.currentAssets),
                totalLiabilities: new Decimal(dto.totalLiabilities),
                currentLiabilities: new Decimal(dto.currentLiabilities),
                cashFlowOperating: new Decimal(dto.cashFlowOperating),
            });
        } else {
            // Update existing
            statement.revenue = new Decimal(dto.revenue);
            statement.netIncome = new Decimal(dto.netIncome);
            statement.equity = new Decimal(dto.equity);
            statement.totalAssets = new Decimal(dto.totalAssets);
            statement.currentAssets = new Decimal(dto.currentAssets);
            statement.totalLiabilities = new Decimal(dto.totalLiabilities);
            statement.currentLiabilities = new Decimal(dto.currentLiabilities);
            statement.cashFlowOperating = new Decimal(dto.cashFlowOperating);
        }

        await this.statementRepo.save(statement);

        // 3. Trigger Risk Assessment
        const riskScore = await this.riskEngine.assessRisk(company.id, dto.period);

        return riskScore;
    }

    @Get(':ticker/dashboard')
    async getDashboard(@Param('ticker') ticker: string) {
        const company = await this.companyRepo.findOne({ where: { ticker } });
        if (!company) {
            throw new NotFoundException(`Company with ticker ${ticker} not found`);
        }

        // Latest Score
        const latestScore = await this.riskScoreRepo.findOne({
            where: { companyId: company.id },
            order: { period: 'DESC' }, // Assuming string period sorts lexically correct for now, or just latest inserted
        });

        // History Charts (All scores)
        const history = await this.riskScoreRepo.find({
            where: { companyId: company.id },
            order: { period: 'ASC' },
        });

        // Alerts
        const alerts = await this.alertRepo.find({
            where: { companyId: company.id },
            order: { isResolved: 'ASC', severity: 'DESC' }, // Unresolved first, then High severity
        });

        return {
            company,
            latest_score: latestScore,
            history_charts: history,
            alerts,
        };
    }

    @Post('analyze-news')
    async analyzeNews(@Body() body: { ticker: string; companyName: string }) {
        // 1. Tái sử dụng logic: Tìm hoặc Tạo công ty (Giống hệt hàm ingest)
        let company = await this.companyRepo.findOne({ where: { ticker: body.ticker } });

        if (!company) {
            company = this.companyRepo.create({
                ticker: body.ticker,
                name: body.companyName,
                industry: 'Unknown', // Mặc định vì tin tức chưa chắc có info này
                sector: 'Unknown',
            });
            await this.companyRepo.save(company);
        }

        // 2. Có ID rồi thì mới gọi Service để phân tích
        return this.riskEngine.analyzeNews(company.id);
    }

    @Post(':companyId/upload-doc')
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: './uploads',
                filename: (req, file, cb) => {
                    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `${unique}${ext}`);
                },
            }),
        }),
    )
    async uploadDoc(
        @Param('companyId') companyId: string,
        @UploadedFile() file: Express.Multer.File,
    ) {
        if (!file) {
            throw new NotFoundException('No file uploaded');
        }

        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException(`Company ${companyId} not found`);
        }

        // 1. Create Document Record
        const doc = this.documentRepo.create({
            companyId,
            filename: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            status: DocumentStatus.PENDING,
        });
        await this.documentRepo.save(doc);

        // 2. Trigger Async Ingestion (Fire & Forget or Await?)
        // For MVP, we can await to ensure it starts, but maybe not wait for full completion if long.
        // But our ingestFile awaits the Python API which awaits the whole process? 
        // Python API `ingest_document` is async but might be long running.
        // Let's await it for now to give immediate feedback on error.
        const absolutePath = resolve(file.path);
        await this.riskEngine.ingestFile(companyId, doc.id, absolutePath);

        return { message: 'File uploaded and ingestion started', documentId: doc.id };
    }

    @Get(':companyId/documents')
    async getDocuments(@Param('companyId') companyId: string) {
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException(`Company ${companyId} not found`);
        }
        return this.riskEngine.getDocuments(companyId);
    }

    @Post(':companyId/chat')
    async chatWithDocuments(
        @Param('companyId') companyId: string,
        @Body() body: { query: string },
    ) {
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException(`Company ${companyId} not found`);
        }
        return this.riskEngine.chatWithDocuments(companyId, body.query);
    }

    @Delete(':companyId/documents/:id')
    async deleteDocument(
        @Param('companyId') companyId: string,
        @Param('id') documentId: string,
    ) {
        const company = await this.companyRepo.findOne({ where: { id: companyId } });
        if (!company) {
            throw new NotFoundException(`Company ${companyId} not found`);
        }
        await this.riskEngine.deleteDocument(companyId, documentId);
        return { message: 'Document and associated knowledge deleted successfully' };
    }
}