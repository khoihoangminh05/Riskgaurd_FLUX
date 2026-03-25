import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { RiskEvent } from './risk-event.entity';
import { ColumnNumericTransformer } from '../transformers/column-numeric.transformer';
import Decimal from 'decimal.js';

@Entity('risk_scores')
export class RiskScore {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @OneToMany(() => RiskEvent, (event) => event.riskScore)
    riskEvents: RiskEvent[];

    @Column()
    period: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'liquidity_score',
    })
    liquidityScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'leverage_score',
    })
    leverageScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'profitability_score',
    })
    profitabilityScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'z_score',
    })
    zScore: Decimal;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 4,
        transformer: new ColumnNumericTransformer(),
        name: 'total_score',
    })
    totalScore: Decimal;

    @Column({ type: 'jsonb', nullable: true })
    details: any;
}
