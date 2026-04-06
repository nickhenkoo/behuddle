# CLAUDE.md — behuddle.com

Read this file before any action. This is the single source of truth for the project.

---

## What this product is

A collaboration platform connecting two types of people:

- **Builder** — has an idea or project, lacks skills or hands
- **Contributor** — has no idea or struggles to start from scratch, but wants to contribute and be part of something new

Killer feature — **The Spark**: AI-generated explanation of the potential between two specific people. Not "you're similar" but "here's exactly what you could build together and why you two specifically."

---

## Current project state

```
src/
├── app/
│   ├── dashboard/
│   │   └── page.tsx          ← initial dashboard layout exists, needs full implementation
│   ├── login/
│   │   ├── page.tsx          ← initial login page exists, needs full implementation
│   │   └── globals.css
│   ├── layout.tsx
│   ├── page.tsx              ← landing page root
│   ├── icon.png
│   └── logo.png
├── components/               ← landing page components (all exist)
│   ├── CallToAction.tsx
│   ├── ConsoleEgg.tsx
│   ├── Footer.tsx
│   ├── Hero.tsx
│   ├── HowItWorks.tsx
│   ├── Manifesto.tsx
│   ├── Navbar.tsx
│   ├── TwoDoors.tsx
├── lib/
│   └── utils.ts
├── CLAUDE.md
├── next.config.mjs
├── tailwind.config.ts
└── tsconfig.json
```

**What exists:**
- [x] Landing page with all sections
- [x] Login page
- [x] Dashboard layout (shell)
- [x] CLAUDE.md in root

**What needs to be built:**
- [ ] Supabase project created
- [ ] Registration page (`/register`)
- [ ] Onboarding flow (role → skills → motivation → status)
- [ ] Dashboard — all tabs implemented
- [ ] DB schema migrated
- [ ] Matchmaking edge function
- [ ] Realtime chat
- [ ] Map tab
- [ ] Community tab

---

## Target structure to build toward

```
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx          ← initial version already exists, move here
│   │   ├── register/page.tsx       ← to build
│   │   └── onboarding/page.tsx     ← to build
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← nav sidebar
│   │   ├── page.tsx                ← home tab
│   │   ├── matches/page.tsx        ← swipe + list
│   │   ├── people/page.tsx         ← people catalog
│   │   ├── ideas/page.tsx          ← projects & ideas
│   │   ├── map/page.tsx            ← user map
│   │   ├── community/page.tsx      ← posts
│   │   └── messages/
│   │       ├── page.tsx
│   │       └── [conversationId]/page.tsx
│   ├── api/
│   │   ├── match/route.ts
│   │   └── geocode/route.ts
│   └── layout.tsx
├── components/
│   ├── landing/                    ← move all current components here
│   │   ├── CallToAction.tsx
│   │   ├── ConsoleEgg.tsx
│   │   ├── Footer.tsx
│   │   ├── Hero.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── Manifesto.tsx
│   │   ├── Navbar.tsx
│   │   ├── TwoDoors.tsx
│   ├── dashboard/
│   │   ├── Nav.tsx
│   │   ├── SparkCard.tsx
│   │   ├── UrgentDialog.tsx
│   │   ├── StatusBar.tsx
│   │   ├── WeeklyQuestion.tsx
│   │   ├── NearbyPeople.tsx
│   │   ├── ProjectUpdates.tsx
│   │   └── SpotlightProject.tsx
│   ├── matches/
│   │   ├── SwipeStack.tsx
│   │   └── MatchCard.tsx
│   ├── map/
│   │   └── MapView.tsx
│   └── ui/
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── matching/
│   │   └── score.ts
│   ├── claude/
│   │   └── spark.ts
│   └── utils.ts
├── supabase/
│   ├── migrations/
│   └── functions/
│       └── match-engine/
│           └── index.ts
└── middleware.ts
```

---

## Stack

| Layer | Technology | Reason |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Already set up |
| Database | Supabase (Postgres) | Auth, Realtime, Storage, Edge Functions |
| Auth | Supabase Auth | Email/password + Google OAuth |
| AI | Claude API (claude-sonnet-4-20250514) | Spark text generation |
| Email | Resend | Weekly digest, notifications |
| Map | Mapbox GL JS | Interactive user map |
| Geocoding | Nominatim (free) | City name → lat/lng on registration |
| Hosting | Vercel | Edge runtime, deploy from GitHub |
| Styles | Tailwind CSS | Already configured |
| Language | TypeScript | Everywhere including Edge Functions |

**App language: English** — international product from day one.

---

## Database schema

### `profiles`
```sql
create table profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  role               text not null check (role in ('builder', 'contributor')),
  full_name          text,
  avatar_url         text,
  bio                text,
  motivation         text,
  location           text,
  lat                float8,
  lng                float8,
  status             text default 'open'
                     check (status in ('open','busy','looking_for_designer','away')),
  availability_hours int,
  is_open_to_match   boolean default true,
  is_verified        boolean default false,
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
```

### `skills`
```sql
create table skills (
  id       serial primary key,
  name     text unique not null,
  category text check (category in ('design','engineering','marketing','business','other'))
);

create table profile_skills (
  profile_id uuid references profiles(id) on delete cascade,
  skill_id   int  references skills(id),
  level      text check (level in ('learning', 'mid', 'strong')),
  primary key (profile_id, skill_id)
);
```

### `projects`
```sql
create table projects (
  id              uuid default gen_random_uuid() primary key,
  owner_id        uuid references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  stage           text check (stage in ('idea','prototype','building','launched')),
  domain          text,
  what_exists     text,
  what_needed     text,
  is_active       boolean default true,
  is_paused       boolean default false,
  is_spotlight    boolean default false,
  spotlight_week  int,
  last_updated_at timestamptz default now(),
  created_at      timestamptz default now()
);

create table project_skill_needs (
  project_id   uuid references projects(id) on delete cascade,
  skill_id     int  references skills(id),
  is_must_have boolean default false,
  primary key (project_id, skill_id)
);

create table project_likes (
  profile_id uuid references profiles(id) on delete cascade,
  project_id uuid references projects(id) on delete cascade,
  created_at timestamptz default now(),
  primary key (profile_id, project_id)
);
```

### `matches`
```sql
create table matches (
  id         uuid default gen_random_uuid() primary key,
  profile_a  uuid references profiles(id),
  profile_b  uuid references profiles(id),
  project_id uuid references projects(id),
  score      numeric(5,2),
  spark_text text,
  source     text check (source in ('ai','map','browse')),
  status_a   text default 'pending'
             check (status_a in ('pending','yes','no','deferred')),
  status_b   text default 'pending'
             check (status_b in ('pending','yes','no','deferred')),
  created_at timestamptz default now()
);
```

### Chat
```sql
create table conversations (
  id         uuid default gen_random_uuid() primary key,
  match_id   uuid references matches(id),
  context    text,
  created_at timestamptz default now()
);

create table messages (
  id              uuid default gen_random_uuid() primary key,
  conversation_id uuid references conversations(id) on delete cascade,
  sender_id       uuid references profiles(id),
  content         text not null,
  created_at      timestamptz default now()
);

create index on messages(conversation_id, created_at desc);
```

### Community
```sql
create table posts (
  id         uuid default gen_random_uuid() primary key,
  author_id  uuid references profiles(id),
  project_id uuid references projects(id),
  type       text check (type in ('question','find','case')),
  title      text not null,
  body       text,
  upvotes    int default 0,
  created_at timestamptz default now()
);

create table comments (
  id         uuid default gen_random_uuid() primary key,
  post_id    uuid references posts(id) on delete cascade,
  author_id  uuid references profiles(id),
  body       text not null,
  created_at timestamptz default now()
);
```

### Weekly questions
```sql
create table weekly_questions (
  id          serial primary key,
  question    text not null,
  week_number int not null,
  year        int not null
);

create table weekly_question_answers (
  profile_id  uuid references profiles(id),
  question_id int  references weekly_questions(id),
  answer      text,
  created_at  timestamptz default now(),
  primary key (profile_id, question_id)
);
```

---

## RLS policies

```sql
alter table profiles enable row level security;
create policy "profiles public read" on profiles for select using (true);
create policy "profiles own update" on profiles for update using (id = auth.uid());

alter table matches enable row level security;
create policy "matches own read" on matches for select
  using (profile_a = auth.uid() or profile_b = auth.uid());

alter table messages enable row level security;
create policy "messages conversation read" on messages for select
  using (
    exists (
      select 1 from conversations c
      join matches m on m.id = c.match_id
      where c.id = conversation_id
        and (m.profile_a = auth.uid() or m.profile_b = auth.uid())
    )
  );

alter table projects enable row level security;
create policy "projects public read" on projects for select using (true);
create policy "projects own write" on projects for all using (owner_id = auth.uid());
```

---

## Key triggers

### Auto-create profile on registration
```sql
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
```

### Mutual match → create conversation
```sql
create or replace function check_mutual_match()
returns trigger as $$
begin
  if NEW.status_a = 'yes' and NEW.status_b = 'yes' then
    insert into conversations (match_id, context)
    values (
      NEW.id,
      (select 'via Spark · ' || p.title from projects p where p.id = NEW.project_id)
    );
  end if;
  return NEW;
end;
$$ language plpgsql;

create trigger on_mutual_match
  after update on matches
  for each row execute procedure check_mutual_match();
```

---

## Matchmaking algorithm

Edge Function: `supabase/functions/match-engine/index.ts`

**Triggers:** profile update, project create/update, cron every 6h

**Scoring:**
```
score = skills_overlap * 0.50
      + domain_match   * 0.25
      + availability   * 0.15
      + activity_score * 0.10

bonus: +15% if is_verified = true
```

**Spark prompt (lib/claude/spark.ts):**
```typescript
const prompt = {
  system: `You help people find collaborators for their projects.
Write in English, warm and specific. No filler.
One or two sentences. Explain WHY exactly these two people
could build something meaningful together.`,
  user: `Builder: ${builder.bio}
Project: ${project.title} — ${project.what_needed}
Contributor: ${contributor.bio}
Skills: ${skills.join(', ')}
Motivation: ${contributor.motivation}
Write the Spark text.`
}
```

---

## Dashboard home tab — blocks in order

| Block | Data source | Cache |
|---|---|---|
| Status bar | profiles.status (own record) | none |
| Urgent dialog | messages WHERE sender != me, unread, sorted by age | none |
| Spark of the day | matches WHERE status='pending' ORDER BY score DESC LIMIT 1 | 6h |
| Project updates | project_likes JOIN projects WHERE updated_at > last_visit | 15min |
| Nearby people | profiles WHERE city = me.city AND is_open = true LIMIT 3 | 1h |
| Weekly question | weekly_questions WHERE NOT answered by me | 24h |
| Spotlight project | projects WHERE is_spotlight = true AND spotlight_week = current | 24h |

---

## Map privacy

Coordinates rounded to 2 decimal places (~10km) before sending to client.

```sql
create view map_users as
  select
    id, full_name, role, status,
    round(lat::numeric, 2)::float8 as lat,
    round(lng::numeric, 2)::float8 as lng,
    is_verified
  from profiles
  where is_open_to_match = true and lat is not null;
```

---

## Environment variables (.env.local)

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

ANTHROPIC_API_KEY=sk-ant-...

RESEND_API_KEY=re_...

NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

---

## Implementation order

| Week | Task |
|------|------|
| 1–2 | Supabase project, DB schema, Auth wired to login page, onboarding flow |
| 3–4 | Projects CRUD, people catalog, basic matchmaking (SQL only, no AI yet) |
| 5 | Claude API → Spark, swipe UI, match statuses |
| 6–7 | Realtime chat, conversation context, in-app notifications |
| 8 | Map tab, geocoding, coordinate rounding |
| 9–10 | Community tab, posts linked to projects |
| 11–12 | Email digest (Resend), GitHub Verify, load testing |

---

## Decisions already made — do not revisit

- **Community** — no abstract feed. Every post must be linked to a project. Keeps content structured at small scale.
- **Home tab** — no vanity stats ("12 new projects"). One specific urgent CTA instead.
- **3D globe** — not doing. Flat map with dots for now, Mapbox on second iteration.
- **AI matchmaking** — SQL only for first 2 weeks. Claude API added at week 5.
- **Chat** — minimal. No channels, threads, reactions. Just dialogue.
- **Coordinates** — rounded to ~10km. No exact address stored ever.
- **`deferred` status** — "later" is not a rejection. Revisited after a week or on project update.
- **Language** — English only. International from day one.
- **Components** — current landing components stay as-is, get moved to `components/landing/` subfolder.

---

## Immediate next steps

1. Create Supabase project → supabase.com/dashboard
2. Share project ID → apply all migrations via connector
3. Install Supabase packages: `npm install @supabase/supabase-js @supabase/ssr`
4. Wire Auth to existing `/login` page
5. Build `/register` and `/onboarding`
6. Move components to `components/landing/`