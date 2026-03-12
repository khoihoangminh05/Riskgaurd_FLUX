import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    JoinColumn,
} from 'typeorm';
import { Company } from './company.entity';
import { CompanyDocument } from './company-document.entity';

@Entity('document_embeddings')
export class DocumentEmbedding {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ name: 'company_id' })
    companyId: string;

    @ManyToOne(() => Company)
    @JoinColumn({ name: 'company_id' })
    company: Company;

    @Column({ name: 'document_id' })
    documentId: string;

    @ManyToOne(() => CompanyDocument, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'document_id' })
    document: CompanyDocument;

    @Column({ type: 'text' })
    content: string;

    @Column({ type: 'vector', length: 768 })
    // vector type from pgvector, assuming 768 dimensions for Gemini
    embedding: number[];

    @Column({ type: 'jsonb', default: {} })
    metadata: any;
}
