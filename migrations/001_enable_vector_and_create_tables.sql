-- Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Create CompanyDocument table
CREATE TABLE IF NOT EXISTS company_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL,
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT NOT NULL, -- 'pdf', 'xlsx', etc.
    upload_date TIMESTAMPTZ DEFAULT NOW(),
    status TEXT DEFAULT 'PENDING', -- 'PENDING', 'PROCESSED', 'ERROR'
    CONSTRAINT fk_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

-- Create DocumentEmbedding table
CREATE TABLE IF NOT EXISTS document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL, -- For multi-tenancy isolation and faster filtering
    document_id UUID NOT NULL,
    content TEXT NOT NULL, -- The chunk text
    embedding vector(768), -- Gemini 1.5 embedding dimension
    metadata JSONB DEFAULT '{}', -- Page number, section, etc.
    CONSTRAINT fk_document
        FOREIGN KEY (document_id)
        REFERENCES company_documents(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_embedding_company
        FOREIGN KEY (company_id)
        REFERENCES companies(id)
        ON DELETE CASCADE
);

-- Create HNSW index for faster similarity search
CREATE INDEX IF NOT EXISTS document_embeddings_embedding_idx 
ON document_embeddings 
USING hnsw (embedding vector_cosine_ops);
