import { IsArray, IsEnum, IsInt, IsOptional, IsString, Min, Max, IsEmail } from 'class-validator';
import { MonitoringFrequency } from '../entities/risk-profile.entity';

export class UpdateRiskProfileDto {
    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    keywords?: string[];

    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    competitors?: string[];

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    riskThreshold?: number;

    @IsOptional()
    @IsEnum(MonitoringFrequency)
    monitoringFrequency?: MonitoringFrequency;

    @IsOptional()
    @IsArray()
    @IsEmail({}, { each: true })
    emailRecipients?: string[];
}
