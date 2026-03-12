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

    @OneToMany(() => FinancialStatement, (statement) => statement.company)
    financialStatements: FinancialStatement[];

    @OneToOne('RiskProfile', (profile: any) => profile.company)
    riskProfile: any;

    @OneToMany(() => User, (user) => user.company)
    users: User[];
}
