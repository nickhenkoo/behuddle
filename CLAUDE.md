# CLAUDE.md — Behuddle.com

Этот файл содержит полный контекст проекта. Читай его перед любым действием.

---

## Что это за продукт

Платформа для коллаборации между двумя типами людей:

- **Builder** — есть идея или проект, не хватает скила или рук
- **Contributor** — нет идеи или трудно начать с нуля, но хочет вносить вклад и быть частью чего-то нового

Киллер-фича — **Искра**: AI-generated объяснение потенциала конкретной пары людей. Не просто "вы похожи", а "вот что именно вы можете построить вместе и почему именно вы двое".

---

## Стек

| Слой | Технология | Причина |
|---|---|---|
| Frontend | Next.js 14 (App Router) | Server Components + Client Components, SEO |
| Backend / БД | Supabase (Postgres) | Auth, Realtime, Storage, Edge Functions в одном |
| Auth | Supabase Auth | Email/password + Google OAuth из коробки |
| AI | Claude API (claude-sonnet-4-20250514) | Генерация spark_text для мэтчей |
| Email | Resend | Недельный дайджест, уведомления |
| Карта | Mapbox GL JS | Интерактивная карта пользователей |
| Геокодинг | Nominatim (бесплатно) | City name → lat/lng при регистрации |
| Хостинг | Vercel | Edge runtime, деплой из GitHub |
| Стили | Tailwind CSS | Утилитарный подход, быстро |
| Язык | TypeScript | Везде, включая Edge Functions |

---

## Архитектура БД

### Таблица `profiles`
Расширение `auth.users`. Создаётся автоматически через trigger при регистрации.

```sql
create table profiles (
  id                 uuid references auth.users(id) on delete cascade primary key,
  role               text not null check (role in ('builder', 'contributor')),
  full_name          text,
  avatar_url         text,
  bio                text,                  -- кто ты и зачем пришёл
  motivation         text,                  -- что хочешь получить
  location           text,                  -- название города
  lat                float8,               -- координаты (округлены до ~10км)
  lng                float8,
  status             text default 'open'   -- open | busy | looking_for_designer | away
                     check (status in ('open','busy','looking_for_designer','away')),
  availability_hours int,                   -- часов в неделю
  is_open_to_match   boolean default true,
  is_verified        boolean default false, -- подтверждён через GitHub/LinkedIn
  created_at         timestamptz default now(),
  updated_at         timestamptz default now()
);
```

### Таблица `skills`
```sql
create table skills (
  id       serial primary key,
  name     text unique not null,
  category text  -- 'design' | 'engineering' | 'marketing' | 'business' | 'other'
);

create table profile_skills (
  profile_id uuid references profiles(id) on delete cascade,
  skill_id   int  references skills(id),
  level      text check (level in ('learning', 'mid', 'strong')),
  primary key (profile_id, skill_id)
);
```

### Таблица `projects`
```sql
create table projects (
  id              uuid default gen_random_uuid() primary key,
  owner_id        uuid references profiles(id) on delete cascade,
  title           text not null,
  description     text,
  stage           text check (stage in ('idea','prototype','building','launched')),
  domain          text,                    -- 'medtech' | 'edtech' | 'climate' | ...
  what_exists     text,                    -- что уже сделано
  what_needed     text,                    -- чего не хватает
  is_active       boolean default true,
  is_paused       boolean default false,   -- скрыт из мэтчей, но не удалён
  is_spotlight    boolean default false,   -- "идея недели" на главной
  spotlight_week  int,                     -- номер недели года
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

### Таблица `matches`
```sql
create table matches (
  id         uuid default gen_random_uuid() primary key,
  profile_a  uuid references profiles(id),  -- тот, кому показывают
  profile_b  uuid references profiles(id),  -- кого показывают
  project_id uuid references projects(id),  -- к какому проекту мэтч
  score      numeric(5,2),                  -- 0-100
  spark_text text,                          -- AI-generated, генерируется асинхронно
  source     text check (source in ('ai','map','browse')),
  status_a   text default 'pending'
             check (status_a in ('pending','yes','no','deferred')),
  status_b   text default 'pending'
             check (status_b in ('pending','yes','no','deferred')),
  created_at timestamptz default now()
);
```

Когда оба `status = 'yes'` — trigger автоматически создаёт `conversation`.

### Таблицы чата
```sql
create table conversations (
  id         uuid default gen_random_uuid() primary key,
  match_id   uuid references matches(id),
  context    text,   -- 'через Искру · AI-дневник для терапии'
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

### Комьюнити
```sql
create table posts (
  id         uuid default gen_random_uuid() primary key,
  author_id  uuid references profiles(id),
  project_id uuid references projects(id),  -- nullable, привязка к проекту
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

### Вопросы недели (для главной)
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

## RLS политики

```sql
-- Профили: читают все, редактирует только владелец
alter table profiles enable row level security;
create policy "profiles public read" on profiles for select using (true);
create policy "profiles own update" on profiles for update using (id = auth.uid());

-- Мэтчи: видит только участник
alter table matches enable row level security;
create policy "matches own read" on matches for select
  using (profile_a = auth.uid() or profile_b = auth.uid());

-- Сообщения: только участники разговора
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

-- Проекты: читают все, редактирует владелец
alter table projects enable row level security;
create policy "projects public read" on projects for select using (true);
create policy "projects own write" on projects for all using (owner_id = auth.uid());
```

---

## Trigger: создание профиля при регистрации

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

---

## Trigger: mutual match → создать conversation

```sql
create or replace function check_mutual_match()
returns trigger as $$
begin
  if NEW.status_a = 'yes' and NEW.status_b = 'yes' then
    insert into conversations (match_id, context)
    values (
      NEW.id,
      (select 'через Искру · ' || p.title
       from projects p where p.id = NEW.project_id)
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

## Алгоритм мэтчмейкинга

Запускается через Supabase Edge Function `match-engine`.

**Триггеры запуска:**
- Обновление профиля пользователя
- Создание/обновление проекта
- Cron каждые 6 часов (`pg_cron`)

**Scoring формула:**
```
score = skills_overlap * 0.50
      + domain_match   * 0.25
      + availability   * 0.15
      + activity_score * 0.10

-- Бонус +15% если is_verified = true
```

**Флоу:**
1. Берём builder с активным проектом → смотрим `project_skill_needs`
2. Ищем contributors где skills пересекаются, статус `open`, не было мэтча раньше
3. Считаем score в Postgres (без сети, быстро)
4. Топ-5 пар → батч-запрос к Claude API для генерации `spark_text`
5. Записываем в `matches` → Supabase Realtime пушит уведомление

**Промпт для Искры:**
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

## Структура проекта (Next.js)

```
collab-io/
├── CLAUDE.md                        ← этот файл
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx              ← nav sidebar
│   │   ├── page.tsx                ← главная
│   │   ├── matches/page.tsx        ← свайп + список
│   │   ├── people/page.tsx         ← каталог людей
│   │   ├── ideas/page.tsx          ← проекты и идеи
│   │   ├── map/page.tsx            ← карта пользователей
│   │   ├── community/page.tsx      ← посты
│   │   └── messages/
│   │       ├── page.tsx
│   │       └── [conversationId]/page.tsx
│   ├── api/
│   │   ├── match/route.ts          ← webhook от edge function
│   │   └── geocode/route.ts        ← city → lat/lng
│   └── layout.tsx
├── components/
│   ├── dashboard/
│   │   ├── Nav.tsx
│   │   ├── SparkCard.tsx           ← Искра дня
│   │   ├── UrgentDialog.tsx        ← «Максим ждёт 3 дня»
│   │   ├── StatusBar.tsx           ← статус пользователя
│   │   ├── WeeklyQuestion.tsx
│   │   ├── NearbyPeople.tsx
│   │   ├── ProjectUpdates.tsx
│   │   └── SpotlightProject.tsx
│   ├── matches/
│   │   ├── SwipeStack.tsx          ← свайп-карточки
│   │   └── MatchCard.tsx
│   ├── map/
│   │   └── MapView.tsx             ← Mapbox GL
│   └── ui/                         ← переиспользуемые компоненты
├── lib/
│   ├── supabase/
│   │   ├── client.ts               ← browser client
│   │   ├── server.ts               ← server client (SSR)
│   │   └── middleware.ts
│   ├── matching/
│   │   └── score.ts                ← scoring логика
│   └── claude/
│       └── spark.ts                ← генерация Искры
├── supabase/
│   ├── migrations/                 ← все SQL миграции
│   └── functions/
│       └── match-engine/
│           └── index.ts            ← Edge Function
├── .env.local
└── middleware.ts                   ← auth guard
```

---

## Переменные окружения (.env.local)

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...   # только на сервере, никогда на клиенте

# Claude API
ANTHROPIC_API_KEY=sk-ant-...

# Email
RESEND_API_KEY=re_...

# Карта
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ...
```

---

## Dashboard — главная страница

Блоки в порядке отображения:

1. **Статус-бар** — переключатель состояния пользователя (open / busy / looking_for_designer / away). Влияет на видимость в мэтчах.

2. **Срочный блок** — «Максим ждёт ответа 3 дня». Запрос: messages WHERE sender != me AND created_at > last_read, сортировка по давности. Кеш: нет.

3. **Искра дня** — топ-1 матч из matches WHERE status = 'pending' ORDER BY score DESC. Кеш: 6 часов.

4. **Изменения в избранном** — project_likes JOIN projects WHERE updated_at > last_visit. Кеш: 15 минут.

5. **Рядом с тобой** — profiles WHERE city = me.city AND is_open = true ORDER BY random() LIMIT 3. Кеш: 1 час.

6. **Вопрос недели** — weekly_questions WHERE NOT answered by me. Раз в 7 дней. Ответ уточняет профиль для мэтчей.

7. **Идея недели** — projects WHERE is_spotlight = true AND spotlight_week = current_week. Кеш: 24 часа.

---

## Приватность координат на карте

Координаты пользователей **округляются до 2 знаков после запятой** (~10 км точность) перед отдачей клиенту. Точный адрес не хранится и не передаётся.

```sql
-- View для карты (никогда не отдаём точные координаты)
create view map_users as
  select
    id,
    full_name,
    role,
    status,
    round(lat::numeric, 2)::float8 as lat,
    round(lng::numeric, 2)::float8 as lng,
    is_verified
  from profiles
  where is_open_to_match = true
    and lat is not null;
```

---

## Verify — подтверждение профиля

1. Пользователь нажимает «Подтвердить через GitHub»
2. GitHub OAuth → проверяем: account age > 6 месяцев, публичные репо > 0
3. `is_verified = true` в profiles
4. Верифицированные профили получают +15% к score в мэтчах и приоритет в показе

---

## Порядок реализации (план по неделям)

| Неделя | Что делаем |
|--------|-----------|
| 1–2 | Supabase проект, схема БД, Auth, профиль, онбординг |
| 3–4 | Проекты, каталог людей, базовый мэтчмейкинг без AI |
| 5 | Claude API → Искра, свайп-интерфейс, статусы мэтча |
| 6–7 | Realtime чат, контекст диалога, уведомления |
| 8 | Карта, геокодинг, приватность координат |
| 9–10 | Комьюнити, посты, привязка к проектам |
| 11–12 | Email дайджест (Resend), Verify (GitHub OAuth), нагрузочное тестирование |

---

## Текущий статус

- [x] Продуктовая концепция готова
- [x] БД схема спроектирована
- [x] UI концепт готов (все вкладки)
- [x] Технический план готов
- [ ] Supabase проект создан ← **следующий шаг**
- [ ] Миграции накатаны
- [ ] Next.js проект инициализирован
- [ ] Онбординг

---

## Важные решения, которые уже приняты

**Комьюнити** — нет отдельного абстрактного фида. Каждый пост обязательно привязан к проекту или идее. Это структурирует дискуссию и не даёт скатиться в шум на старте с небольшой базой.

**Статистика на главной** — убрана. Вместо «12 новых проектов» — один живой призыв к действию (срочный блок с конкретным человеком).

**3D-глобус** — не делаем. SVG-карта с точками + Mapbox на второй итерации. Не нужна сложность на старте.

**Мэтчмейкинг без AI сначала** — первые 2 недели алгоритм работает на чистом SQL. Claude API подключается на неделе 5, когда уже есть реальные пары.

**Чат минималистичный** — никаких каналов, тредов, реакций. Только диалог. Платформа не должна конкурировать с Telegram.

**Координаты карты** — округляем до ~10 км. Точный адрес не храним.

**`deferred` статус в мэтчах** — «позже» это не отказ. Хранится отдельно, пересматривается через неделю или когда проект обновился.