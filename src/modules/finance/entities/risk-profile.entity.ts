import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Company } from './company.entity';

export enum MonitoringFrequency {
    DAILY = 'DAILY',
    WEEKLY = 'WEEKLY',
}

@Entity('risk_profiles')
export class RiskProfile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @OneToOne(() => Company, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'company_id' })
    companyId: string;

    @Column({ type: 'jsonb', default: [] })
    keywords: string[];

    @Column({ type: 'jsonb', default: [] })
    competitors: string[];

    @Column({ name: 'risk_threshold', default: 70 })
    riskThreshold: number;

    @Column({
        type: 'enum',
        enum: MonitoringFrequency,
        name: 'monitoring_frequency',
        default: MonitoringFrequency.DAILY
    })
    monitoringFrequency: MonitoringFrequency;

    @Column({ type: 'jsonb', name: 'email_recipients', default: [] })
    emailRecipients: string[];
}
