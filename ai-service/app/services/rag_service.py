import os
from typing import List
from langchain_community.document_loaders import PyPDFLoader, UnstructuredExcelLoader, UnstructuredPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_postgres import PGVector
from sqlalchemy import create_engine
from app.core.config import get_settings

settings = get_settings()

# Initialize Embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="gemini-embedding-001",
    google_api_key=settings.GOOGLE_API_KEY
)

# Initialize Vector Store
# connection_string = settings.DATABASE_URL
# vector_store = PGVector(
#     embeddings=embeddings,
#     collection_name="document_embeddings",
#     connection=connection_string,
#     use_jsonb=True,
# )

class RAGService:
    @staticmethod
    async def ingest_document(file_path: str, company_id: str, document_id: str):
        # 1. Load Document
        if file_path.endswith(".pdf"):
            loader = UnstructuredPDFLoader(file_path)
        elif file_path.endswith(".xlsx") or file_path.endswith(".xls"):
            loader = UnstructuredExcelLoader(file_path)
        else:
            raise ValueError(f"Unsupported file type: {file_path}")
        
        docs = loader.load()
        print("Docs length:", len(docs))

        for i, d in enumerate(docs):
            print(f"Doc {i} length:", len(d.page_content))
            print("Preview:", d.page_content[:200])
        
        # 2. Split Text
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=100
        )
        splits = text_splitter.split_documents(docs)
        print("------")
        print(len(splits))
        
        # 3. Add Metadata
        for split in splits:
            split.metadata["company_id"] = company_id
            split.metadata["document_id"] = document_id
            
        # 4. Store in Vector DB
        # We need to ensure the collection and connection are set up correctly.
        # Langchain-postgres PGVector specific setup
        
        # Note: We are using a single table `document_embeddings` created manually.
        # The standard PGVector might try to create its own tables (langchain_pg_collection, langchain_pg_embedding).
        # To map to our custom table, we might need a custom implementation or use the standard one and adapt our schema.
        # However, for simplicity and speed in this phase, let's use the standard langchain PGVector if possible, 
        # OR better, since we defined our own schema, let's just insert manually using SQL to have full control 
        # over `company_id` column which is crucial for multi-tenancy. 
        # Standard PGVector stores metadata in JSON, not top-level columns usually.
        # BUT, we really want `company_id` as a top-level column for RLS or simple indexing/filtering efficiency.
        
        # Let's use raw SQL + helper for embedding to respect our schema.
        
        import psycopg2
        import psycopg2.extras
        
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()
        # cursor.execute("SELECT current_database();")
        # print(cursor.fetchone())
        
        try:
            for split in splits:
                content = split.page_content
                print("Content length:", len(content))
                # Generate embedding
                vector = embeddings.embed_query(content)
                print("Vector length:", len(vector))
                print("First 5 dims:", vector[:5])
                # Metadata
                metadata = split.metadata
                
                cursor.execute(
                    """
                    INSERT INTO document_embeddings (company_id, document_id, content, embedding, metadata)
                    VALUES (%s, %s, %s, %s, %s)
                    """,
                    (company_id, document_id, content, vector, psycopg2.extras.Json(metadata))
                )
            
            conn.commit()
        except Exception as e:
            conn.rollback()
            raise e
        finally:
            cursor.close()
            conn.close()

        return {"status": "success", "chunks": len(splits)}

    @staticmethod
    async def search_documents(company_id: str, query: str, limit: int = 5):
        print(company_id + " " + query );
        import psycopg2
        
        # 1. Embed Query
        query_vector = embeddings.embed_query(query)
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"
        
        conn = psycopg2.connect(settings.DATABASE_URL)
        cursor = conn.cursor()
        
        results = []
        try:
            # 2. Vector Search with Company Filter
            # Using <=> operator for Cosine Distance (requires vector extension)
            cursor.execute(
                """
                SELECT content, metadata
                FROM document_embeddings
                WHERE company_id = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (company_id, vector_str, limit)
            )
            
            rows = cursor.fetchall()
            for row in rows:
                results.append({
                    "content": row[0],
                    "metadata": row[1]
                })
                
        except Exception as e:
            print(f"Search failed: {e}")
            raise e
        finally:
            cursor.close()
            conn.close()
            
        return results
