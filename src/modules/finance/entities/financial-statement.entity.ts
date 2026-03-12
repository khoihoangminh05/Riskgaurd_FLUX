import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { ColumnNumericTransformer } from '../transformers/column-numeric.transformer';
import Decimal from 'decimal.js';

@Entity('financial_statements')
export class FinancialStatement {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company, (company) => company.financialStatements)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column()
    period: string; // e.g., '2023-Q4'

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
    })
    revenue: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'net_income',
    })
    netIncome: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
    })
    equity: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'total_assets',
    })
    totalAssets: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'current_assets',
    })
    currentAssets: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'total_liabilities',
    })
    totalLiabilities: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'current_liabilities',
    })
    currentLiabilities: Decimal;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        transformer: new ColumnNumericTransformer(),
        name: 'cash_flow_operating',
    })
    cashFlowOperating: Decimal;

    @Column({ type: 'jsonb', nullable: true, name: 'raw_data' })
    rawData: any;
}
