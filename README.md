# ⚡ DriveFlow — Lead Management for HSR Motors

A real-time lead management CRM built for the HSR Motors dealership team. DriveFlow replaces spreadsheet-based lead tracking with a collaborative, live-syncing web application featuring automated lead scoring, a drag-and-drop pipeline, and comprehensive analytics.

## 🚀 Live Demo

Deployed on Vercel: _[add your Vercel URL here after deployment]_

## ✨ Key Features

### Screens

| Screen | Description |
|---|---|
| **Dashboard** | KPI cards, lead volume trends, source mix chart, pipeline breakdown, team performance, and recent activity feed — all computed from live data |
| **Lead Listing** | Sortable, filterable table with search, pagination, status/source filters, and a slide-out detail drawer |
| **Lead Details** | Full lead profile with status management, rep assignment, follow-up scheduling, notes, and call/email CTAs. Available as both a drawer and a full page |
| **Lead Management (Pipeline)** | Kanban board with drag-and-drop — move leads between stages and changes sync instantly |
| **Reports & Analytics** | Revenue charts, source distribution pie, conversion funnel, and sales leaderboard — all computed from live lead data |

### Automation Features (Differentiators)

- **🧠 Lead Scoring** — Weighted algorithm that considers source platform, pipeline status, budget, intent signals (financing/trade-in), engagement recency, and follow-up compliance
- **🔥 Priority Banding** — Leads auto-classified as Hot (80+), Warm (60-79), or Cold (<60) based on computed score
- **💡 Next Action Suggestions** — System recommends Call, Email, or Test Drive based on lead's current status
- **⏰ Follow-up Overdue Detection** — Stale follow-ups flagged in red across all views
- **📊 Live Dashboard** — All metrics, charts, and reports compute from actual lead state — no stale data

### Real-Time Collaboration

DriveFlow solves the "spreadsheets can't collaborate" problem with two sync modes:

- **Supabase Realtime** (production) — Postgres changes broadcast to all connected clients via WebSocket
- **BroadcastChannel Fallback** (demo) — Cross-tab sync via the Web BroadcastChannel API when no backend is configured

## 🛠️ Tech Stack

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Inter (Google Fonts)
- **Charts**: Recharts
- **Icons**: Lucide React
- **UI Primitives**: Radix UI (used for shadcn/ui components)
- **Backend (optional)**: Supabase (Postgres + Realtime)
- **Deployment**: Vercel

## 📦 Run Locally

```bash
# 1. Install dependencies
npm install

# 2. Start dev server
npm run dev
```

### Optional: Supabase Realtime

```bash
# Copy environment template
cp .env.example .env

# Add your Supabase credentials to .env
# VITE_SUPABASE_URL=https://your-project.supabase.co
# VITE_SUPABASE_ANON_KEY=your-anon-key

# Apply schema to your Supabase project
# See supabase/schema.sql
```

If Supabase variables are not set, the app uses the local BroadcastChannel fallback for cross-tab sync.

## 🚢 Deploy to Vercel

```bash
# Build for production
npm run build

# Deploy (or connect your GitHub repo to Vercel)
npx vercel --prod
```

The included `vercel.json` handles SPA routing so direct links to `/leads/:id` work correctly.

## 📐 Architecture

```
src/
├── main.tsx                          # React entry point
├── styles/                           # CSS (Tailwind, fonts, theme)
└── app/
    ├── App.tsx                       # Router, layout, view switching
    ├── context/
    │   └── LeadsContext.tsx           # Global state provider
    ├── lib/
    │   ├── supabaseClient.ts         # Supabase connection
    │   └── leads/
    │       ├── types.ts              # TypeScript types & constants
    │       ├── automation.ts         # Lead scoring, priority, suggestions
    │       ├── service.ts            # Data layer (Supabase + local fallback)
    │       └── seed.ts              # 20 realistic seed leads
    └── components/
        ├── Dashboard.tsx             # Screen 1: KPIs & charts
        ├── LeadsView.tsx             # Screen 2: Lead listing table
        ├── LeadDetailsContent.tsx    # Screen 3: Lead detail (shared)
        ├── LeadDetailsPage.tsx       # Full-page lead detail wrapper
        ├── KanbanBoard.tsx           # Screen 4: Pipeline Kanban
        ├── ReportsView.tsx           # Screen 5: Reports & Analytics
        ├── Sidebar.tsx               # Navigation sidebar
        └── TopBar.tsx                # Header with search & create
```

## 👥 User Roles Addressed

| Role | How DriveFlow Helps |
|---|---|
| **Sales Team** | One-click call/email CTAs, status updates, notes, follow-up scheduling, automated next-action suggestions |
| **Business Manager** | Dashboard with KPIs, conversion funnel, source analysis, team leaderboard, and revenue trends |

## 📝 Product Name

**DriveFlow** — A play on *driving* (automotive) + *workflow* (lead management pipeline). The name captures both the dealership domain and the smooth, flowing experience of managing leads.
