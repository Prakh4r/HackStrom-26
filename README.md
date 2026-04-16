# Freight Mind ⚡

**Freight Mind** is an AI-powered Predictive Delay & Risk Intelligence Agent for modern logistics and supply chain optimization. Designed natively as an event-driven microservices architecture, it predicts shipment delays, models financial risk, and provides generative mitigation strategies.

## Problem Statement
In the logistics and freight industry, unseen delays (caused by port congestion, extreme weather, and global events) cause sweeping downstream disruptions and ballooning costs. Predictability is hard because it requires synthesizing historic delivery metrics simultaneously with live external events.

**Freight Mind solves this by:**
1. Using an Event-Driven architecture to absorb heavy processing logic securely in the background.
2. Applying multi-modal Machine Learning (Random Forest & XGBoost) on historical logistics data.
3. Supplying Explainable AI (SHAP) so stakeholders understand exactly *why* a delay is flagged.
4. Implementing a LLM Generative Agent to output actionable mitigation steps to resolve the delay before it compounds.

---

## Architecture Overview

**Freight Mind** uses a scalable, distributed pattern to ensure heavy ML inference and LLM token generation don't block the backend application.

![Architecture Flow Placeholder](#)

### System Flow Diagram
1. **User Input**: A user inputs a natural language query in the React Dashboard via JWT-secured API points.
2. **Event Queue**: Express.js catches the request at `POST /predict-risk`, generates a unique `Trace ID` for observability, drops it immediately into **Redis** via BullMQ, and returns a JobID to the user.
3. **Background Worker Processing**:
   - Parses the query using Llama 4.
   - Reaches out to real-time APIs (OpenWeatherMap & NewsAPI).
   - Sends payload to the independent Python FastAPI Microservice for ML Inference.
   - Pings LLM for generating final mitigation text.
   - Consolidates and stores the payload in **PostgreSQL (Supabase)**.
4. **Data Security**: Before hitting the database, sensitive PII extracted from the user is injected into an AES-256 cipher mechanism and stored purely encrypted at rest.
5. **Real-time UX**: The Frontend polls `GET /job-status/:jobId` continuously to provide progressive feedback to the user on the asynchronous tasks.
6. **Observability**: Live metrics are sent to internal logs which format and ship directly to **Loki + Grafana** for centralized request tracing across the worker queue and Express backend.

---

## Tech Stack

This framework successfully fulfills Hackathon Evaluation specifications (Mandatory & Advantage levels).

| Category | Technologies Used |
| :--- | :--- |
| **Frontend** | React, Vite |
| **Backend API** | Node.js, Express.js |
| **Queue / Scale** | Redis, BullMQ (Event-Driven Workers) |
| **Database** | PostgreSQL (Supabase) |
| **Security** | Supabase Auth (JWT), AES-256 (Node Crypto), MFA OTP Simulation |
| **ML Service** | Python, FastAPI, XGBoost/RandomForest, SHAP Explainer |
| **AI Agent Layer** | OpenAI API (gpt-4o-mini) |
| **Observability** | Winston, Grafana, Loki Stack |
| **DevOps** | Docker, Docker Compose (Internal Network & Discoverability) |

---

## How to Run

Everything has been rigorously scaffolded inside `docker-compose`. 

Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine.

1. **Clone the repository** and navigate to the project root.
2. **Configure your Database (Supabase)**
   - Run the provided `supabase_setup.sql` script located in the codebase against your Supabase SQL Editor to create the `predictions` table structure.
3. **Configure Environment Variables**
   - We have provided `.env.example` files in the root and `server/` directory. 
   - Rename them to `.env` and add your API details (`SUPABASE_URL`, `SUPABASE_ANON_KEY`, `OPENAI_API_KEY`, etc.).
4. **Boot the Network**
   Open your terminal and run:
   ```bash
   docker compose up --build -d
   ```
5. **Access the Agent**
   - Head over to `http://localhost:5173` to launch the predictive dashboard.

---

## Screenshots

### 1. Predictive Landing Page
![Landing Page](./docs/screenshot1.png)

### 2. Secure MFA Authentication
![MFA Security](./docs/screenshot2.png)

🚀 Built by Team Hardcoders
