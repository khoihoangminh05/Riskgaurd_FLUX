import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
    CreateDateColumn,
} from 'typeorm';
import { Company } from './company.entity';

export enum DocumentStatus {
    PENDING = 'PENDING',
    PROCESSED = 'PROCESSED',
    ERROR = 'ERROR',
}

@Entity('company_documents')
export class CompanyDocument {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column()
    filename: string;

    @Column({ name: 'file_path' })
    filePath: string;

    @Column({ name: 'file_type' })
    fileType: string;

    @CreateDateColumn({ name: 'upload_date' })
    uploadDate: Date;

    @Column({
        type: 'enum',
        enum: DocumentStatus,
        default: DocumentStatus.PENDING,
    })
    status: DocumentStatus;
}
