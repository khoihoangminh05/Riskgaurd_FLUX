import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../finance/entities/company.entity';

export enum UserRole {
    ADMIN = 'ADMIN',
    VIEWER = 'VIEWER',
}

@Entity('users')
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column()
    fullName: string;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.VIEWER,
    })
    role: UserRole;

    @ManyToOne(() => Company, (company) => company.users)
    company: Company;

    @Column()
    companyId: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
