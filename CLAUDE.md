# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start development server at http://localhost:3000
npm run build    # Production build
npm start        # Serve production build
npm run lint     # Run ESLint
```

No test framework is configured yet.

## Architecture

**Team-Up** is a Next.js App Router application (TypeScript + Tailwind CSS) for matching entrepreneurs with developers/designers.

### Pages & Routing

- `/` — Landing page ([src/app/page.tsx](src/app/page.tsx)): composes ~9 section components sequentially
- `/login` — Auth page ([src/app/login/page.tsx](src/app/login/page.tsx)): login/signup toggle, GitHub OAuth button (currently dummy), redirects to `/dashboard`
- `/dashboard` — User dashboard ([src/app/dashboard/page.tsx](src/app/dashboard/page.tsx)): sidebar nav + stats + empty state; no real auth guard yet

### Component Model

All components live in [src/components/](src/components/) and use `"use client"`. Framer Motion (`motion.div` with `whileInView`) drives all scroll-triggered animations. Stagger delays are done manually with `delay: i * 0.1`.

No backend or API routes exist yet — forms redirect to `/dashboard` as stubs.

### Design System

Custom Tailwind theme ([tailwind.config.ts](tailwind.config.ts)):
- `primary`: `#8B5CF6` (Electric Violet)
- `secondary`: `#22D3EE` (Soft Cyan)
- `background`: `#050505`, `foreground`: `#f2f2f2`

Recurring UI patterns:
- Glassmorphism: `bg-white/5 border border-white/10 backdrop-blur-md`
- Gradient text: `text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary`
- Glow shadow: `shadow-[0_0_20px_rgba(139,92,246,0.4)]`

Global custom classes (`.bg-texture`, `.aura-glow`) are defined in [src/app/globals.css](src/app/globals.css).

### Utility

`cn()` in [src/lib/utils.ts](src/lib/utils.ts) combines `clsx` + `tailwind-merge` for conditional class merging — use it for all dynamic className composition.

### Path Alias

`@/*` maps to `./src/*` (configured in [tsconfig.json](tsconfig.json)).
