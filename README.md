# Cumulant Research — Website

Official website for **Cumulant Research** — _Research beyond the norm._

Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript (strict)**, and **Tailwind CSS v4**. Deploys cleanly to Vercel.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

## Quality checks

```bash
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm run check      # all three
```

## Deploy

This is a standard Next.js App Router app — deploy to Vercel (or any Node host) with the default build (`next build`) and start (`next start`) commands. Point the production domain at `cumulant.org`.

## Structure

```
src/
  app/              # Routes (App Router). icon.svg + apple-icon.png = favicons.
  components/       # React components (Header, Hero, sections, ui/)
  content/          # Typed site content (copy, projects, systems, …)
  lib/              # site-data barrel, site-images registry, utils
public/
  fonts/            # Self-hosted Neue Haas Unica + Akkurat Mono
  images/blue/      # Curated imagery
  videos/           # Hero band video + poster
```

## Routes

`/` · `/research` · `/methods` · `/systems` · `/principles` · `/about` · `/collaborate`
plus `/research/[slug]` project pages and the transparency routes (`/ai-disclosure`, `/reproducibility`, `/corrections`).

## Brand

- Palette: white background, ink (`#000`), smoke (`#909090`), plus blue + magenta imagery.
- Fonts: Neue Haas Unica (sans), Akkurat Mono (mono), Times (serif).
- Logo: a distribution curve with a marked point in the tail — _beyond the norm_ (`src/components/icons.tsx → CumulantMark`; favicon at `src/app/icon.svg`).
