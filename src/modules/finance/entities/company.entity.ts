import { Entity, PrimaryGeneratedColumn, Column, OneToMany, OneToOne } from 'typeorm';
import { FinancialStatement } from './financial-statement.entity';
import { User } from '../../auth/entities/user.entity';

@Entity('companies')
export class Company {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    ticker: string;

    @Column()
    name: string;

    @Column()
    industry: string;

    @Column()
    sector: string;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'cash_runway',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    cashRunway: number;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        nullable: true,
        name: 'burn_rate',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    burnRate: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'quick_ratio',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    quickRatio: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'debt_equity_ratio',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    debtEquityRatio: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'interest_coverage_ratio',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    interestCoverageRatio: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'gross_profit_margin',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    grossProfitMargin: number;

    @Column({
        type: 'decimal',
        precision: 10,
        scale: 2,
        nullable: true,
        name: 'inventory_turnover',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    inventoryTurnover: number;

    @Column({
        type: 'decimal',
        precision: 20,
        scale: 2,
        nullable: true,
        name: 'operating_cash_flow',
        transformer: {
            to: (value: any) => value,
            from: (value: any) => value ? parseFloat(value) : null
        }
    })
    operatingCashFlow: number;

    @OneToMany(() => FinancialStatement, (statement) => statement.company)
    financialStatements: FinancialStatement[];

    @OneToOne('RiskProfile', (profile: any) => profile.company)
    riskProfile: any;

    @OneToMany(() => User, (user) => user.company)
    users: User[];
}
