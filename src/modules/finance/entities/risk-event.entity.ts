import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { RiskScore } from './risk-score.entity';

export enum Sentiment {
    POSITIVE = 'POSITIVE',
    NEUTRAL = 'NEUTRAL',
    NEGATIVE = 'NEGATIVE',
}

@Entity('risk_events')
export class RiskEvent {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => RiskScore, (riskScore) => riskScore.riskEvents, { nullable: true })
    @JoinColumn({ name: 'risk_score_id' })
    riskScore: RiskScore;

    @Column({ name: 'risk_score_id', nullable: true })
    riskScoreId: string;

    @Column()
    title: string;

    @Column({ name: 'source_url' })
    sourceUrl: string;

    @Column({ name: 'published_at' })
    publishedAt: Date;

    @Column({
        type: 'enum',
        enum: Sentiment,
        default: Sentiment.NEUTRAL,
    })
    sentiment: Sentiment;

    @Column({ name: 'risk_score', type: 'int' })
    riskScoreValue: number; // 0-100

    @Column({ type: 'text' })
    summary: string;

    @Column({ type: 'jsonb', nullable: true })
    tags: string[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
