# behuddle

A collaboration platform that connects people who have ideas with people who have skills.

---

## What is this

**Builder** — has an idea or project, but lacks the skills or hands to execute it.  
**Contributor** — doesn't have a starting idea, but wants to build something real and contribute.

The killer feature is **The Spark** — an AI-generated, person-specific explanation of why two particular people could build something meaningful together. Not a generic "you have overlapping skills" message, but a concrete sentence about what exactly they could create.

---

## Current state (April 2026)

### Built

| Area | What's done |
|---|---|
| Auth | Magic link (OTP) + Google OAuth PKCE. No passwords. Emails sent via Resend with branded template. Service role key used for `admin.generateLink`. |
| Onboarding | 4-step flow: role → skills → motivation → status |
| Dashboard layout | Sidebar nav (desktop) + bottom nav (mobile) |
| Ideas tab | Project CRUD, slide-over form, likes, soft delete |
| People tab | User catalog, role filter, status dots, ProfileCard popup |
| Community tab | Posts (question / find / case), linked to a project |
| Matchmaking | SQL scoring: skills 50% + domain 25% + availability 15% + activity 10%. +15% bonus for verified users. |
| Spark | Claude API (`claude-sonnet-4-20250514`) generates the match explanation text. |
| Matches UI | Connected / New / Waiting / Deferred groups, swipe actions |
| Realtime chat | Supabase Realtime, optimistic messages, telegram-style message grouping |
| Settings | 5 tabs: Profile / Preview / Appearance / Plan / Account |
| Globe tab | Interactive 3D WebGL globe (`globe.gl` v2.45.3), dark political map, country polygons, state/province borders, user markers as HTML elements |
| Unread badges | Red dot on Messages icon, updates in real time via Supabase Realtime |
| Toast notifications | New matches and new messages trigger in-app toasts via `sonner` |
| Email digest | Weekly summary of top 3 matches via Resend. Opt-in/out toggle in Settings. Cron endpoint at `/api/cron/send-digest`. |
| Legal pages | `/privacy`, `/terms`, `/cookies`, `/legal` under `(legal)` route group |
| Cookie consent | Stored in `localStorage['bh_cookie_consent']`. Accept TTL = 1 year, Decline = 90 days. |

### Not yet built

| Area | Notes |
|---|---|
| Geocoding | Nominatim (city → lat/lng) so real user dots appear on globe |
| `map_users` SQL view | Coordinates rounded to ~10km for privacy |
| GitHub verify | `is_verified` flag, spotlight project of the week, weekly question feature |

---

## Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router) |
| Database | Supabase (Postgres + RLS + Realtime) |
| Auth | Supabase Auth — magic link + Google OAuth |
| AI | Anthropic SDK (`claude-sonnet-4-20250514`) |
| Email | Resend + `@react-email/render` |
| Map | `globe.gl` v2.45.3 (WebGL, no Mapbox) |
| Animations | Framer Motion |
| Styles | Tailwind CSS |
| Language | TypeScript throughout |
| Hosting | Vercel (planned) |

---

## Project structure

```
src/
├── app/
│   ├── (auth)/           — login, register, onboarding
│   ├── (legal)/          — privacy, terms, cookies, legal
│   ├── (dashboard)/      — all authenticated pages
│   │   ├── layout.tsx    — nav sidebar
│   │   ├── page.tsx      — home tab
│   │   ├── matches/
│   │   ├── people/
│   │   ├── ideas/
│   │   ├── map/
│   │   ├── community/
│   │   └── messages/
│   ├── api/
│   │   ├── auth/         — magic link generation
│   │   ├── match/        — Spark text generation
│   │   └── cron/         — weekly email digest
│   └── layout.tsx
├── components/
│   ├── landing/          — landing page sections
│   ├── dashboard/        — dashboard-specific components
│   ├── map/              — GlobeView, GlobeLoader
│   ├── providers/        — context providers
│   └── ui/               — shared primitives
├── lib/
│   ├── supabase/         — client.ts, server.ts, middleware.ts
│   ├── claude/           — spark.ts (Spark prompt + API call)
│   └── utils.ts
└── middleware.ts
```

---

## Environment variables

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # required for magic link generation and cron

# Site
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# AI
ANTHROPIC_API_KEY=               # required for Spark text

# Email
RESEND_API_KEY=                  # required for magic links + weekly digest

# Optional
CRON_SECRET=                     # bearer token to protect /api/cron/send-digest
```

Copy `.env.local.example` to `.env.local` and fill in the values.

---

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For the full feature set (Spark generation, magic links, email digest) you need a Supabase project with all migrations applied, an Anthropic API key, and a Resend API key.

---

## Matchmaking algorithm

Scoring runs in the Supabase Edge Function `match-engine` (triggered on profile update, project create/update, and every 6h via cron):

```
score = skills_overlap * 0.50
      + domain_match   * 0.25
      + availability   * 0.15
      + activity_score * 0.10

bonus: +15% if is_verified = true
```

Once two users both accept a match, a conversation is created automatically via a Postgres trigger.

---

## Design

- **Fonts:** Bricolage Grotesque (headings) + Inter (body) + Instrument Serif (italic accents)
- **Background:** `#f6f5f4` warm off-white
- **Foreground:** `#1A1918` soft near-black
- **Accent:** sage `#8a9a86`
- **Both light and dark themes** are first-class — dark mode is not an afterthought
- **Aesthetic references:** Notion (editorial whitespace), Linear (precision craft)
- **Anti-references:** generic SaaS dashboards, teal/purple gradient sites
