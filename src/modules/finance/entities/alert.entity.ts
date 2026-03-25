import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn
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

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @Column()
    message: string;

    @Column({ name: 'is_resolved', default: false })
    isResolved: boolean;

    @Column({ name: 'is_important', default: false })
    isImportant: boolean;
}
