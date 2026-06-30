# Community Hero — Hyperlocal Problem Solver

A civic engagement platform that enables citizens to **identify, report, validate, track, and resolve** community issues through collaboration, data, and intelligent automation.

![Community Hero](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4-38bdf8?style=flat-square&logo=tailwindcss)

## Problem

Communities face potholes, water leakages, damaged streetlights, waste management concerns, and public infrastructure challenges. Reporting is often fragmented, hard to track, and lacks transparency.

## Solution

Community Hero brings transparency, accountability, and participation to hyperlocal civic issue management.

### Features

| Feature | Description |
|---------|-------------|
| **Image & Video Reporting** | Upload photo/video evidence with every report |
| **AI Categorization** | Automatic issue classification, priority scoring, and tag extraction |
| **Geo-location & Mapping** | Interactive OpenStreetMap with color-coded issue markers |
| **Community Verification** | Citizens confirm reports; auto-escalation after 2 verifications |
| **Real-time Tracking** | Visual status timeline from reported → verified → in progress → resolved |
| **Impact Dashboard** | Category breakdown, weekly trends, resolution metrics |
| **Predictive Insights** | AI trend analysis with proactive municipal recommendations |
| **Gamification** | Points, levels, badges, and community leaderboard |

## Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

The app auto-seeds with sample community issues on first load.

## Optional: OpenAI Integration

Set `OPENAI_API_KEY` in `.env.local` to enable GPT-powered issue categorization instead of the built-in rule-based engine:

```env
OPENAI_API_KEY=sk-your-key-here
```

## Architecture

```
src/
├── app/                  # Next.js App Router pages & API routes
│   ├── api/
│   │   ├── issues/       # CRUD + verify + status updates
│   │   ├── ai/           # AI categorization endpoint
│   │   ├── analytics/    # Dashboard metrics & predictions
│   │   └── users/        # Gamification & leaderboard
│   ├── dashboard/        # Impact dashboard
│   ├── report/           # Issue reporting form
│   └── leaderboard/      # Community heroes
├── components/           # React UI components
└── lib/
    ├── ai-categorizer.ts # Rule-based + OpenAI categorization
    ├── gamification.ts   # Points, levels, badges
    ├── predictions.ts    # Analytics & predictive insights
    └── store.ts          # JSON file persistence
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/issues` | List all issues |
| `POST` | `/api/issues` | Create new issue |
| `GET` | `/api/issues/:id` | Get issue details |
| `POST` | `/api/issues/:id/verify` | Community verify |
| `POST` | `/api/issues/:id/status` | Update status |
| `POST` | `/api/ai/categorize` | AI categorization preview |
| `GET` | `/api/analytics` | Dashboard analytics |
| `GET` | `/api/users` | Leaderboard data |

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Maps:** Leaflet + OpenStreetMap
- **Charts:** Recharts
- **Storage:** JSON file (easily swappable for PostgreSQL/MongoDB)

## License

MIT
