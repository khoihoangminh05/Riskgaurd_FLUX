from typing import List, Dict, Any
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from app.core.config import get_settings
from app.services.rag_service import RAGService

settings = get_settings()

class RiskAnalystAgent:
    def __init__(self):
        self.llm = ChatGoogleGenerativeAI(
            model="gemini-2.5-flash",
            google_api_key=settings.GOOGLE_API_KEY,
            temperature=0.2 # Low temperature for factual answers
        )
        
        self.prompt = ChatPromptTemplate.from_template(
            """You are a Risk Analyst Expert for a financial institution. 
            Answer the user query based ONLY on the following internal context from company documents.
            
            Context:
            {context}
            
            User Query: {query}
            
            Instructions:
            1. If the information is found in the context, provide a concise and professional answer.
            2. Cite the source document (filename/page) if available in the metadata.
            3. If the information is NOT in the context, clearly state "No relevant data found in the internal documents." Do not hallucinate or use outside knowledge.
            
            Answer:"""
        )

    async def answer_query(self, company_id: str, query: str) -> Dict[str, Any]:
        # 1. Retrieve Context
        try:
            docs = await RAGService.search_documents(company_id, query)
            
        except Exception as e:
            return {"answer": "Error retrieving documents.", "sources": []}
        
        if not docs:
            return {
                "answer": "No internal documents found for this company to answer the query.",
                "sources": []
            }
            
        # 2. Format Context
        context_parts = []
        sources = []
        for i, doc in enumerate(docs):
            meta = doc['metadata']
            source_info = f"Source {i+1}: {meta.get('source', 'Unknown File')} (Page {meta.get('page', 'N/A')})"
            context_parts.append(f"[{source_info}]\n{doc['content']}")
            sources.append(meta)  
        full_context = "\n\n".join(context_parts)
        # print(context_parts)
        print(self.prompt.input_variables)

        # 3. Generate Answer
        chain = self.prompt | self.llm
        response = await chain.ainvoke({"context": full_context, "query": query})
        # print(response)
        return {
            "answer": response.content,
            "sources": sources,
            "context_used": full_context # Optional: for debugging
        }

risk_analyst_agent = RiskAnalystAgent()
