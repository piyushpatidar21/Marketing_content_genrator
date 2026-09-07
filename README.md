# OmniMarket AI — Production Marketing Content Generator SaaS

An enterprise-grade, full-stack **AI Marketing Content Generator SaaS** designed for digital marketers, content creators, growth agencies, and social media managers.

Users describe a campaign idea once; the platform generates **platform-native, structured marketing deliverables** (hooks, captions, full body copy, CTAs, targeted hashtags, numbered threads, video scripts, audio briefs, and image generation prompts) — customized independently across 9 digital channels.

---

## 🌟 Key Features

- 🎯 **Multi-Platform Native Optimization**: Tailors content specifically for **Instagram, Facebook, YouTube, LinkedIn, X (Twitter), WhatsApp, SMS, Email Newsletter, and SEO Blog Articles**.
- 🎬 **Multi-Media Prompt Engineering**: Generates visual prompts for Midjourney / DALL-E / Flux, scene-by-scene video production scripts, and voiceover audio briefs.
- 🛡️ **Brand Identity Profile & Regulatory Safety**: Stores brand voice, target audience, and forbidden words / illegal claims that are automatically injected into every prompt.
- 🔄 **Refinement & Regeneration**: Interactive in-place editing, one-click clipboard copying, and iterative regeneration with custom instructions.
- 🔐 **Secure Multi-Tenant Auth**: JWT Bearer authentication, bcrypt password hashing, and strict database ownership validation.
- 🤖 **Provider-Agnostic AI Architecture**: Swappable LLM engine supporting **Google Gemini (default)**, **OpenAI (GPT-4o)**, and a **Built-in Mock Provider** for offline local development and automated testing.
- 📊 **Executive Analytics Dashboard**: Aggregates total campaigns, total generations, favorites, top-performing channels, and recent activity.

---

## 🏗️ Architecture & Tech Stack

```
                                  ┌────────────────────────┐
                                  │   React 18 + Vite SPA  │
                                  │ Tailwind + TypeScript  │
                                  └───────────┬────────────┘
                                              │  Axios (JWT)
                                              ▼
                                  ┌────────────────────────┐
                                  │     FastAPI Backend    │
                                  │  Pydantic v2 + Security │
                                  └───────────┬────────────┘
                         ┌────────────────────┴────────────────────┐
                         ▼                                         ▼
              ┌─────────────────────┐                   ┌─────────────────────┐
              │  PostgreSQL / Alembic│                   │  AIProvider Engine  │
              │  SQLAlchemy 2.0 ORM │                   │  Gemini / OpenAI /  │
              └─────────────────────┘                   │  Mock Provider      │
                                                        └─────────────────────┘
```

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, React Router v6, Axios, Lucide Icons, Context API |
| **Backend** | Python 3.12, FastAPI, Pydantic v2, SQLAlchemy 2.0, Alembic, Passlib/Bcrypt, PyJWT |
| **Database** | PostgreSQL 16 (Production/Docker), SQLite (Zero-config local development) |
| **AI Layer** | Abstract `AIProvider` base class → `GeminiProvider` (JSON Mode) / `OpenAIProvider` / `MockProvider` |
| **DevOps** | Docker, Docker Compose, Multi-stage builds, Nginx SPA container |
| **Testing** | Pytest, FastAPI TestClient, in-memory transactional SQLite fixtures |

---

## 📁 Project Structure

```
Marketing_planner_genrator/
├── backend/
│   ├── app/
│   │   ├── main.py                  # FastAPI entrypoint, middleware, exception handlers
│   │   ├── api/
│   │   │   ├── dependencies.py      # JWT authentication and DB dependencies
│   │   │   └── routes/              # Auth, Users, Campaigns, Generations, Brand, Platforms, Health
│   │   ├── core/
│   │   │   ├── config.py            # Pydantic Settings & environment loader
│   │   │   ├── security.py          # Bcrypt hashing & JWT signing
│   │   │   ├── exceptions.py        # Custom application exceptions
│   │   │   └── logging.py           # Structured JSON logging
│   │   ├── db/
│   │   │   ├── database.py          # SQLAlchemy engine & session factory
│   │   │   └── base.py              # Declarative base & model registry
│   │   ├── models/                  # User, Campaign, Generation, ContentVariation, BrandProfile
│   │   ├── schemas/                 # Pydantic request/response validation schemas
│   │   ├── services/                # AuthService, CampaignService, GenerationService, BrandService
│   │   ├── ai/
│   │   │   ├── base.py              # AIProvider abstract base class & AIResponse
│   │   │   ├── provider.py          # Provider factory with fallback logic
│   │   │   └── providers/           # GeminiProvider, OpenAIProvider, MockProvider
│   │   ├── prompts/                 # ContentPrompt, ImagePrompt, VideoPrompt, AudioPrompt, PlatformRules
│   │   └── utils/helpers.py
│   ├── alembic/                     # Database migration environment and version files
│   ├── tests/                       # Pytest test suite (16 comprehensive tests)
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/              # Buttons, Inputs, Modals, Badges, Skeletons, StepProgress
│   │   ├── context/                 # AuthContext, ToastContext, ThemeContext
│   │   ├── layouts/                 # AppLayout (Sidebar + Navbar), AuthLayout
│   │   ├── pages/                   # Login, Register, Dashboard, Campaigns, Generator, History, Brand, Settings
│   │   ├── services/                # Axios API client & endpoints
│   │   ├── types/                   # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── nginx.conf
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables Reference

Copy `.env.example` to `.env` in the project root:

| Variable | Default | Description |
|---|---|---|
| `ENVIRONMENT` | `development` | Environment mode (`development`, `production`, `test`) |
| `DEBUG` | `True` | FastAPI debug mode |
| `DATABASE_URL` | `sqlite:///./marketing_planner.db` | PostgreSQL connection string or SQLite path |
| `JWT_SECRET` | `super_secret_jwt_key...` | Cryptographic secret for signing JWT tokens |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `10080` | Token expiration duration (7 days) |
| `AI_PROVIDER` | `gemini` | AI Provider (`gemini`, `openai`, `mock`) |
| `AI_API_KEY` | `""` | Gemini or OpenAI API Key (Auto-falls back to `mock` if empty) |
| `AI_MODEL` | `gemini-1.5-flash` | LLM model identifier |
| `FRONTEND_URL` | `http://localhost:5173` | Allowed CORS frontend origin |
| `BACKEND_URL` | `http://localhost:8000` | Backend API URL |

---

## 🚀 Quick Start (Local Development)

### 1. Backend Setup

```bash
# 1. Activate Python virtual environment
# Windows:
.venv\Scripts\Activate.ps1
# macOS/Linux:
# source .venv/bin/activate

# 2. Install dependencies
pip install -r backend/requirements.txt

# 3. Run database migrations
cd backend
alembic upgrade head
cd ..

# 4. Start FastAPI server
uvicorn app.main:app --app-dir backend --reload --port 8000
```
API Documentation will be live at: `http://localhost:8000/docs`

---

### 2. Frontend Setup

```bash
# 1. Navigate to frontend
cd frontend

# 2. Install npm dependencies
npm install

# 3. Start Vite dev server
npm run dev
```
Frontend Web App will be live at: `http://localhost:5173`

---

## 🐳 Docker Deployment

To launch the full stack (PostgreSQL + FastAPI + Nginx React Frontend) in isolated Docker containers:

```bash
# Build and start all services
docker compose up --build -d

# View service logs
docker compose logs -f

# Run migrations inside the backend container
docker compose exec backend alembic upgrade head

# Tear down containers and volumes
docker compose down
```

Access:
- **Frontend App**: `http://localhost:3000`
- **Backend API**: `http://localhost:8000/api/v1`
- **Swagger Docs**: `http://localhost:8000/docs`
- **PostgreSQL**: `localhost:5432`

---

## 🧪 Testing Commands

The backend includes a comprehensive test suite covering Authentication, Campaign CRUD, Ownership Isolation, Multi-platform Generation, Brand Profile lifecycle, and Prompt composition:

```bash
# Run all backend tests with Pytest
.venv\Scripts\pytest.exe backend/tests -v

# Run frontend production build check
cd frontend
npm run build
```

---

## 📡 API Documentation & Endpoints

### Authentication
- `POST /api/v1/auth/register` — Register new user account
- `POST /api/v1/auth/login` — Authenticate and obtain JWT Bearer token
- `GET  /api/v1/auth/me` — Get current user profile

### Campaigns
- `POST   /api/v1/campaigns` — Create new marketing campaign
- `GET    /api/v1/campaigns` — List user campaigns with pagination & search
- `GET    /api/v1/campaigns/{id}` — Get single campaign details
- `PUT    /api/v1/campaigns/{id}` — Update campaign parameters
- `DELETE /api/v1/campaigns/{id}` — Delete campaign & cascade delete generations

### AI Generations
- `POST   /api/v1/generations` — Trigger multi-platform AI generation pipeline
- `GET    /api/v1/generations` — List generation history with platform/media filters
- `GET    /api/v1/generations/{id}` — Get generation result with variations
- `POST   /api/v1/generations/{id}/regenerate` — Regenerate copy with custom modification instruction
- `POST   /api/v1/generations/{id}/favorite` — Toggle favorite status
- `DELETE /api/v1/generations/{id}` — Delete generation record
- `GET    /api/v1/dashboard/stats` — Aggregate metrics for user dashboard

### Brand Profile & Platforms
- `GET  /api/v1/brand-profile` — Fetch persistent user brand profile
- `POST /api/v1/brand-profile` — Upsert brand identity & forbidden words list
- `GET  /api/v1/platforms` — Get rules and capabilities for all 9 supported platforms
- `GET  /api/v1/media-types` — Get media generation specifications
- `GET  /health` — System health check & database ping

---

## 🧠 AI Generation Pipeline Flow

```
[ User Input (Campaign + Channels + Media) ]
                     │
                     ▼
[ Ownership & Validation Check (Pydantic) ]
                     │
                     ▼
[ Retrieve Reusable Brand Context & Forbidden Words ]
                     │
                     ▼
[ Loop Each Selected Platform × Media Pair ]
                     │
                     ▼
[ Compose Prompt: System + Brand + Campaign + Platform Rules + Media Specs + Safety Rules ]
                     │
                     ▼
[ LLM Generation (Gemini / OpenAI / Mock) with Structured JSON Mode ]
                     │
                     ▼
[ Validation & Normalization (StructuredContentResponse) ]
                     │
                     ▼
[ Persist Generation Record + Variations in Database ]
                     │
                     ▼
[ Deliver Multi-Channel Output to Frontend UI ]
```

---

## 🔌 How to Add Another AI Provider

The AI layer is completely decoupled through the `AIProvider` interface:

1. Create a new provider class in `backend/app/ai/providers/claude.py`:
   ```python
   from app.ai.base import AIProvider, AIResponse

   class ClaudeProvider(AIProvider):
       async def generate_structured(self, prompt: str, system_prompt: str = None, response_schema = None) -> AIResponse:
           # Call Anthropic API with JSON formatting
           # Return AIResponse(content=parsed_json, raw_text=..., model="claude-3-5-sonnet")
           pass
   ```
2. Register the provider in `backend/app/ai/provider.py`:
   ```python
   elif p_name == "claude":
       return ClaudeProvider(api_key=key, model=m or "claude-3-5-sonnet")
   ```
3. Set `AI_PROVIDER=claude` and `AI_API_KEY=your_key` in `.env`.

---

## 📱 How to Add Another Social Platform

Platforms are config-driven and never hardcoded:

1. Open `backend/app/prompts/platform_rules.py`
2. Add a new dictionary entry to `PLATFORM_RULES`:
   ```python
   "threads": {
       "id": "threads",
       "name": "Threads",
       "icon": "MessageSquare",
       "description": "Conversational microblogging connected to Instagram graph.",
       "char_limit": 500,
       "includes_hashtags": True,
       "recommended_hashtags_count": 3,
       "includes_emojis": True,
       "requires_visual": False,
       "supported_media": ["text", "image"],
       "content_style": "Casual, question-first hooks, relatable banter.",
       "best_practices": ["Start with open ended questions", "Engage with replies"],
       "output_requirements": "Hook, caption, CTA, hashtags."
   }
   ```
3. The platform automatically appears across all API endpoints, frontend multi-select chips, and AI prompt composition pipelines without any further code changes.

---

## 🔮 Production Roadmap & Future Improvements

- [ ] **Direct Generation APIs**: Connect downstream image generators (Flux.1 / Midjourney API) and text-to-speech engines (ElevenLabs).
- [ ] **Social Media Publishing**: OAuth 2.0 direct publishing to Instagram Graph API, LinkedIn Post API, and X API.
- [ ] **Vector Brand Knowledge Base**: RAG pipeline connecting PDF brand guidelines and past top-performing campaigns.
- [ ] **Automated Content Scheduling**: Visual drag-and-drop calendar for planning multi-week publishing schedules.
- [ ] **A/B Performance Analytics**: Track CTR and conversion rates back to each generated copy angle.

---

## 📄 License

MIT License. Engineered for production workloads.
