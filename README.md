<div align="center">

# 🌊 FLUX
### Enterprise AI Risk Management & Virtual CFO

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Status](https://img.shields.io/badge/Status-Hackathon_Ready-success.svg)]()

</div>

---

## 🚀 The Problem & Solution (Elevator Pitch)

**>80% of startups fail due to poor cash flow management and unforeseen market risks.** Traditional CFOs are expensive, and retrospective financial dashboards only tell you what went wrong *after* the fact.

**FLUX** is the solution: A proactive, autonomous Virtual CFO ecosystem fueled by a LangGraph multi-agent architecture. FLUX delivers real-time, 24/7 proactive risk forecasting, macro-economic threat detection, and dynamic financial health monitoring at a fraction of the cost. FLUX bridges the gap between historical enterprise data and forward-looking AI intelligence.

---

## ✨ Core Features

*   🤖 **Multi-Agent Risk Analysis:** An orchestrated LangGraph pipeline utilizing specialized agents (Search, RAG, and Analysis) to autonomously scrape the web, evaluate macro-economic shifts, and contextualize them against your specific business sector.
*   📄 **Human-in-the-loop AI Extraction:** Seamlessly drag-and-drop complex internal financial PDFs. FLUX automatically parses and extracts 8 key financial health metrics (Cash Runway, Burn Rate, Debt-to-Equity, etc.), presenting them for human verification before syncing.
*   ⚡ **Dynamic Risk Scoring:** Say goodbye to static numbers. FLUX dynamically recalculates your enterprise risk score in real-time, instantly penalizing scores based on verified external macro-news alerts or decaying financial health.
*   📊 **Interactive Command Center:** A premium, Silicon Valley-grade dashboard featuring zoomable time-series trajectory charts perfectly synchronized via WebSockets. The UI dynamically adapts to your current risk threshold.

---

## 🏗️ Architecture & Tech Stack

FLUX is built for enterprise-scale reliability, heavily utilizing modern reactive paradigms and advanced vector-based knowledge retrieval.

### Frontend
*   **Next.js (App Router):** Server-side rendering, highly optimized routing, and aggressive caching.
*   **Tailwind CSS & Lucide:** Premium, rapid, responsive, and highly aesthetic UI design system.
*   **Recharts:** Performant, zoomable, and synchronized data visualization.
*   **Context API & Socket.io-client:** Real-time state management and live-metric updates.

### Backend
*   **NestJS:** A scalable, highly-structured Node.js framework utilizing strict TypeScript paradigms.
*   **TypeORM & PostgreSQL:** Relational data integrity perfectly mapping complex entity relationships.
*   **pgvector:** High-dimensional vector storage enabling lightning-fast similarity search for our Hybrid RAG system.
*   **WebSockets (Socket.io):** Real-time, bi-directional event emission triggering live dashboard updates.

### AI & Pipeline
*   **LangGraph & LangChain:** Stateful, multi-actor LLM orchestration to handle cyclical reasoning and decision-making.
*   **Python (FastAPI):** High-performance AI microservice isolating the heavy analytical workloads.

---

## ⚙️ Local Setup & Installation

Follow these steps to deploy the entire FLUX ecosystem locally.

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/flux-risk-management.git
cd flux-risk-management
```

### 2. Database Setup (PostgreSQL + pgvector)
Ensure PostgreSQL is running. Run the migration script to enable the vector extension:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 3. Backend (NestJS API)
```bash
# Navigate to the backend directory
cd src/ 

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env and supply your DB URL, JWT secrets, etc.
# DATABASE_URL="postgresql://user:password@localhost:5432/fluxdb"

# Start the NestJS server
npm run start:dev
```

### 4. AI Microservice (Python FastAPI)
```bash
# Navigate to the AI service
cd ai-service/

# Create a virtual environment and install requirements
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Configure AI API Keys
cp .env.example .env
# Add your LLM keys:
# OPENAI_API_KEY="sk-..."
# GEMINI_API_KEY="AIza..."

# Start the Python server
uvicorn main:app --reload --port 8000
```

### 5. Frontend (Next.js)
```bash
# Navigate to the frontend directory
cd frontend/

# Install dependencies
npm install

# Start the Next.js development server
npm run dev
```

The FLUX command center will now be accessible at `http://localhost:3001` (or whatever your dev port binds to).

---

## 🔌 API Structure (Brief Overview)

FLUX exposes a robust, RESTful API backend architecture:

*   `POST /api/alerts/trigger-analysis/:companyId`
    *   Triggers the LangGraph orchestrator to run a full sweep of news and market conditions, instantly saving new alerts and dynamically penalizing the overall risk score.
*   `POST /api/finance/extract/:companyId`
    *   Intercepts a recently uploaded financial document and streams it to the AI microservice to extract and serialize 8 critical financial metrics back into the database.
*   `GET /api/companies/:id/risk-score`
    *   Retrieves the real-time, unified `currentScore`, `baseScore`, and accumulated `alertPenalty` for the synchronized dashboard UI.

---

<div align="center">
<b>Built with ambition. Ready to protect the next generation of unicorns.</b><br>
<i>FLUX Engineering Team © 2026</i>
</div>
