import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { ColumnNumericTransformer } from '../transformers/column-numeric.transformer';
import Decimal from 'decimal.js';

@Entity('risk_score_history')
export class RiskScoreHistory {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'base_financial_score',
    })
    baseFinancialScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'ai_penalty_score',
    })
    aiPenaltyScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'total_dynamic_score',
    })
    totalDynamicScore: Decimal;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
