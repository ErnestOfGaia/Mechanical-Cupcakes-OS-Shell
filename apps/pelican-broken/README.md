# ⚓ Project Pellito: The Digital Deckhand

> Role-based kitchen intelligence for high-pressure, multilingual restaurant environments.

## The Problem

- **Knowledge Silos**: Technical recipes, plating guides, and marketing "lore" are often scattered across binders, PDFs, and photo libraries.
- **Language Barriers**: Quality training for Spanish or Russian-speaking staff requires a bilingual manager's time.
- **Consistency Gaps**: New hires lack a quick-check tool for garnishes and allergens during a busy service.

## The Solution: Pellito

Pellito is an AI-powered agent integrated into a Dockerized web app. He interprets questions based on *who is asking* and *what role they're in*.

### Role-Based Intelligence

| Role | Focus |
|------|-------|
| Prep Team | Precise weights, measurements, and bulk yields |
| Line Cooks | Fire times, assembly order, and internal temperatures |
| Servers | Marketing lore, beer pairings, and allergen info |

### Features

- **Native multilingual support** — English, Spanish, and Russian
- **Vision-to-Menu ingestion** — Upload a photo of a handwritten recipe; Pellito parses it into the database
- **Verbal shift quizzes** — Gamified 3-question training quizzes, results logged anonymously by role
- **Anonymous analytics dashboard** — Session counts, quiz performance, recipe inventory (no personal data stored)

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16.2.1 |
| AI Engine | OpenRouter → Gemini Flash 1.5 (default, swappable) |
| Database | PostgreSQL 15 + Prisma ORM |
| Deployment | Docker + docker-compose |

---

## Setup

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- An [OpenRouter](https://openrouter.ai) API key

### Local Development

```bash
git clone https://github.com/ErnestOfGaia/Pelican-Recipe-Book.git
cd Pelican-Recipe-Book

cp .env.example .env
# Fill in OPENROUTER_API_KEY, DB_PASSWORD, and SESSION_SECRET in .env

npm install
npx prisma generate
docker compose up db -d      # start the database only
npx prisma migrate deploy    # apply schema
npm run dev
```

App will be available at `http://localhost:3000`.

### Login credentials (local / staging)

| Station | Username | Password |
|---------|----------|----------|
| Prep Cook | prepcook | prepcook |
| Line Cook | cook | cook |
| Server | server | server |
| Admin | deckhand | deckhand |

### Production Deployment

```bash
docker compose up -d --build
```

The app runs on port 3000, bound to `127.0.0.1`. Point your reverse proxy (Nginx Proxy Manager) to `localhost:3000`.

---

*"Pellito isn't just a recipe book — he's a digital deckhand making sure every plate is perfect."*
