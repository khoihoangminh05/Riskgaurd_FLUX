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

# Initialize Vector Store Engine/Connection
connection_string = settings.DATABASE_URL
engine = create_engine(connection_string)

# We initialize PGVector to wrap the same embeddings and database
vector_store = PGVector(
    embeddings=embeddings,
    collection_name="document_embeddings",
    connection=engine,
    use_jsonb=True,
)

class RAGService:
    @staticmethod
    async def ingest_document(file_path: str, company_id: str, document_id: str):
        import datetime
        current_year = datetime.datetime.now().year
        
        # Determine doc_type
        doc_type = "unknown"
        if file_path.endswith(".pdf"):
            loader = UnstructuredPDFLoader(file_path)
            doc_type = "pdf"
        elif file_path.endswith(".xlsx") or file_path.endswith(".xls"):
            loader = UnstructuredExcelLoader(file_path)
            doc_type = "excel"
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
        # STRICT MULTI-TENANCY METADATA INJECTION
        for split in splits:
            split.metadata["company_id"] = company_id
            split.metadata["document_id"] = document_id
            split.metadata["year"] = current_year
            split.metadata["doc_type"] = doc_type
            
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
        print(f"Searching for company: {company_id} | Query: {query}")
        
        try:
            import psycopg2
            
            # Generate embedding for the query synchronously since we are in an async function
            # and want to ensure compatibility with synchronous psycopg2 execution
            # Or use aembed_query to be non-blocking with gemini API
            if hasattr(embeddings, 'aembed_query'):
                query_embedding = await embeddings.aembed_query(query)
            else:
                query_embedding = embeddings.embed_query(query)
            
            conn = psycopg2.connect(settings.DATABASE_URL)
            cursor = conn.cursor()
            
            # Use pgvector <=> operator for cosine distance
            cursor.execute(
                """
                SELECT content, metadata
                FROM document_embeddings
                WHERE company_id = %s
                ORDER BY embedding <=> %s::vector
                LIMIT %s
                """,
                (company_id, query_embedding, limit)
            )
            
            rows = cursor.fetchall()
            
            results = []
            for row in rows:
                results.append({
                    "content": row[0],
                    "metadata": row[1]
                })
                
            cursor.close()
            conn.close()
            
            return results
            
        except Exception as e:
            print(f"Search failed: {e}")
            raise e
