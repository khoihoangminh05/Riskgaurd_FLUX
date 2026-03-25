import json
from typing import TypedDict, List
from langchain_community.tools import DuckDuckGoSearchRun
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
from langgraph.graph import StateGraph, END
import newspaper
from newspaper import Article
from app.core.config import get_settings
from app.services.rag_service import RAGService

settings = get_settings()

# --- State ---
class AgentState(TypedDict):
    company_name: str
    company_id: str
    risk_profile: dict
    internal_context: List[str]
    urls: List[str]
    raw_news: List[dict]
    verified_news: List[dict]
    analysis: dict

# --- Tools ---
search_tool = DuckDuckGoSearchRun()

# --- Nodes ---

def search_node(state: AgentState):
    company = state["company_name"]
    risk_profile = state.get("risk_profile") or {}
    
    # Base query
    queries = [f"{company} finance lawsuit debt risk news"]
    
    # Add Keyword queries
    keywords = risk_profile.get("keywords", [])
    if keywords:
        for kw in keywords:
            queries.append(f"{company} {kw}")
            
    # Add Competitor queries
    competitors = risk_profile.get("competitors", [])
    if competitors:
        for comp in competitors:
            queries.append(f"{comp} business strategy")
            
    print(f"Executing {len(queries)} search queries...")
    
    all_urls = set()
    from ddgs import DDGS
    
    # Sequential execution to be polite to the API
    with DDGS() as ddgs:
        for query in queries:
            try:
                print(f"Searching: {query}")
                # Fetch 3 results per query
                results = list(ddgs.text(query, max_results=3))
                for r in results:
                    all_urls.add(r['href'])
            except Exception as e:
                print(f"Search failed for query '{query}': {e}")
    
    print(f"Found {len(all_urls)} unique URLs")
    return {"urls": list(all_urls)}

def scrape_node(state: AgentState):
    urls = state.get("urls", [])
    articles_data = []
    
    for url in urls:
        try:
            article = Article(url)
            article.download()
            article.parse()
            text = article.text[:2000] # Limit to 2000 chars
            articles_data.append({
                "url": url,
                "title": article.title,
                "text": text
            })
            print("Scraping:", url)
            print("Length:", len(article.text))
        except Exception as e:
            print(f"Failed to scrape {url}: {e}")
            continue

    print("Found URLs:", articles_data)
            
    return {"raw_news": articles_data}

def fact_check_node(state: AgentState):
    company = state.get("company_name", "")
    raw_news = state.get("raw_news", [])
    
    trusted_domains = [
        "reuters.com", "bloomberg.com", "wsj.com", "cnbc.com", 
        "ft.com", "marketwatch.com", "forbes.com", "finance.yahoo.com",
        "nytimes.com", "businesswire.com", "prnewswire.com", "sec.gov"
    ]
    
    verified_news = []
    
    # 1. Very fast LLM evaluation for non-trusted domains (optional, but requested for credibility)
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0
    )
    
    for article in raw_news:
        url = article.get("url", "").lower()
        title = article.get("title", "")
        
        # Fast domain check bypass
        if any(domain in url for domain in trusted_domains):
            print(f"Fact Checker: Auto-trusted {url}")
            verified_news.append(article)
            continue
            
        print(f"Fact Checker: Evaluating unknown source {url}")
        try:
            prompt = f"""
            You are a Financial News Fact Checker. Evaluate quickly if this article appears to be a credible and relevant news piece about '{company}'.
            Ignore spam, seo content, or entirely unrelated topics.
            URL: {url}
            Title: {title}
            Is this credible and relevant? Reply ONLY with 'YES' or 'NO'.
            """
            response = llm.invoke(prompt)
            if "YES" in response.content.upper():
                verified_news.append(article)
        except Exception as e:
            print(f"Fact check LLM failed for {url}: {e}")
            
    print(f"Fact Checker: Retained {len(verified_news)} out of {len(raw_news)} raw articles.")
    return {"verified_news": verified_news}

async def augment_node(state: AgentState):
    company_id = state.get("company_id")
    articles = state.get("verified_news", [])
    internal_context = []
    
    if not company_id:
        return {"internal_context": []}
        
    print(f"Retrieving context for {len(articles)} verified articles...")
    for article in articles:
        try:
            # Step 2: RAG Context Retrieval
            # Query Vector DB using article title
            results = await RAGService.search_documents(company_id, article["title"], limit=3)
            for res in results:
                internal_context.append(f"Internal Doc: {res['content'][:500]}...") 
        except Exception as e:
            print(f"RAG failed for article {article.get('title')}: {e}")
            
    return {"internal_context": internal_context}

def analyze_node(state: AgentState):
    company = state["company_name"]
    articles = state.get("verified_news", [])
    internal_context = state.get("internal_context", [])
    
    if not articles:
        return {"analysis": {"error": "No articles found"}}
    
    combined_text = "\n\n".join([f"Title: {a['title']}\nURL: {a['url']}\nContent: {a['text']}" for a in articles])
    context_text = "\n\n".join(internal_context)
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        google_api_key=settings.GOOGLE_API_KEY,
        temperature=0
    )
    
    # Define validation structure using Pydantic for structured output if needed, 
    # but the prompt asks for JSON return. We can enforce it via prompt or structured output.
    
    prompt_template = ChatPromptTemplate.from_template(
        """
        Analyze the following news articles for {company_name}. 
        Identify financial risks, lawsuits, or debt issues.
        
        Internal Strategic Context (Confidential):
        {internal_context}
        
        Articles:
        {articles}
        
        Instruction: Analyze the impact of this news on the company based on the internal context provided. 
        If the news contradicts or threatens the internal plans, flag it as HIGH RISK.
        
        Return a valid JSON object with the following structure:
        {{
            "sentiment": "POSITIVE" | "NEUTRAL" | "NEGATIVE",
            "risk_score": <integer between 0 and 100>,
            "summary": "<concise summary of risks>",
            "tags": ["<tag1>", "<tag2>"],
            "title": "<A headline for this risk report>"
        }}
        
        Constraint: Be strict. Only score > 70 if there is concrete evidence of risk (bankruptcy, lawsuit, default) 
        OR if the news directly threatens the Internal Strategic Context.
        If no relevant info found, return NEUTRAL, score 0.
        Ensure the output is pure JSON, no markdown.
        """
    )
    
    chain = prompt_template | llm
    
    try:
        response = chain.invoke({
            "company_name": company, 
            "articles": combined_text,
            "internal_context": context_text
        })
        content = response.content
        # Clean markdown if present
        if "```json" in content:
            content = content.replace("```json", "").replace("```", "")
        
        analysis = json.loads(content)
        # Add metadata source
        analysis["source_urls"] = [a['url'] for a in articles]
        return {"analysis": analysis}
    except Exception as e:
        print(f"Analysis failed: {e}")
        return {"analysis": {"error": str(e)}}

# --- Graph Construction ---
workflow = StateGraph(AgentState)

workflow.add_node("search", search_node)
workflow.add_node("scrape", scrape_node)
workflow.add_node("fact_check", fact_check_node)
workflow.add_node("augment", augment_node)
workflow.add_node("analyze", analyze_node)

workflow.set_entry_point("search")
workflow.add_edge("search", "scrape")
workflow.add_edge("scrape", "fact_check")
workflow.add_edge("fact_check", "augment")
workflow.add_edge("augment", "analyze")
workflow.add_edge("analyze", END)

news_agent = workflow.compile()
