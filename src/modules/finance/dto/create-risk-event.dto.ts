import { IsString, IsUrl, IsDateString, IsEnum, IsInt, Min, Max, IsArray, IsOptional, IsUUID } from 'class-validator';
import { Sentiment } from '../entities/risk-event.entity';

export class CreateRiskEventDto {
    @IsUUID()
    companyId: string;

    @IsString()
    title: string;

    @IsUrl()
    sourceUrl: string;

    @IsDateString()
    publishedAt: string;

    @IsEnum(Sentiment)
    sentiment: Sentiment;

    @IsInt()
    @Min(0)
    @Max(100)
    riskScoreValue: number;

    @IsString()
    summary: string;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tags?: string[];

    @IsUUID()
    @IsOptional()
    riskScoreId?: string;
}
