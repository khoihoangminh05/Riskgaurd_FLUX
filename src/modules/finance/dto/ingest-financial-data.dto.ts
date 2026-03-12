import { IsString, IsNotEmpty, IsNumberString, IsOptional } from 'class-validator';

export class IngestFinancialDataDto {
    @IsString()
    @IsNotEmpty()
    ticker: string;

    @IsString()
    @IsNotEmpty()
    period: string; // e.g., '2023-Q4'

    @IsString()
    @IsNotEmpty()
    companyName: string;

    @IsString()
    @IsOptional()
    industry: string;

    @IsString()
    @IsOptional()
    sector: string;

    // Financial Fields - Receiving as strings to preserve precision before Decimal conversion
    @IsNumberString()
    @IsNotEmpty()
    revenue: string;

    @IsNumberString()
    @IsNotEmpty()
    netIncome: string;

    @IsNumberString()
    @IsNotEmpty()
    equity: string;

    @IsNumberString()
    @IsNotEmpty()
    totalAssets: string;

    @IsNumberString()
    @IsNotEmpty()
    currentAssets: string;

    @IsNumberString()
    @IsNotEmpty()
    totalLiabilities: string;

    @IsNumberString()
    @IsNotEmpty()
    currentLiabilities: string;

    @IsNumberString()
    @IsNotEmpty()
    cashFlowOperating: string;
}
