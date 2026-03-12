import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';

export enum AlertSeverity {
    LOW = 'LOW',
    MEDIUM = 'MEDIUM',
    HIGH = 'HIGH',
}

@Entity('alerts')
export class Alert {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({
        type: 'enum',
        enum: AlertSeverity,
    })
    severity: AlertSeverity;

    @Column()
    message: string;

    @Column({ name: 'is_resolved', default: false })
    isResolved: boolean;
}
