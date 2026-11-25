# tuftly

(Product name is always lowercase. It comes from the little tuft on top of Bobbin's head. The companion bird is Bobbin. Earlier names dropped: "Pip" (`pip install`), "fledge" (an existing interview-prep startup with the same name). Not yet trademark-cleared; the preferred short URL idea is tuft.ly.)

A free-first, gentle practice space for web-dev interviews: short lessons, game-like drills, and a friendly AI interviewer that gives forward-looking feedback.

## Decisions so far
- **Audience:** all levels, including people returning after time away. Starts with JavaScript, then TypeScript; backend and system design later.
- **Freemium, free-first.** AI interviews are capped at **2 per day** (`src/lib/config.ts`).
- **One companion character** for v1: **Bobbin, a little round bird** (hatch, grow, fledge as skills level up). Bobbin is **pixel art only** (decided): AI-generated with Canva from one approved concept, saved as 200×200 transparent PNGs in `public/bobbin/pixel/<season>/<mood>.png`; sparkly eyes are the default. The earlier smooth SVG and code-generated sprite versions were removed. AI concept art lives in `design/`. Logo exploration is at `/logo`. **Seasonal outfits** follow the device date (`src/lib/season.ts`; winter scarf Nov–Feb, spring flower crown, summer sun hat, autumn beret; `HEMISPHERE` and `SEASON_OVERRIDE` in config), previewed at `/seasons`. Every season has all 8 pixel-art expressions (`public/bobbin/pixel/<season>/`). No picking or customization yet. Before launch: get a trademark attorney to check "tuftly" (nearby TUFT/TUFTCON filings exist) and "Bobbin", and register the domain (tuftly.app / .io / .dev looked free; tuft.ly is a risky `.ly` domain, best used only as a redirect) and handles.
- **No leaderboards.** Streaks have a grace period and rest days.
- **Feedback:** scores per topic plus targeted drills. No replay of weak moments.
- **Scoring is rubric-based**, not free-form LLM judgment, so it stays honest and cheaper.
- **Out of scope:** anything that helps hide AI use during a live interview.

## UI (layout A, "Quest Map")
Built from the Figma file "tuftly: layout explorations" (layout A). Pixel look: Pixelify Sans headings, Nunito body, 3px brown outlines with hard shadows, palette tokens in `src/app/globals.css`.
- `/` landing page (`src/components/Landing.tsx`)
- `/home` quest map: lessons as a path, today's quests, week strip with rest days (`QuestHome.tsx`)
- `/review` practice, `/lessons/[id]` lesson flow (restyled)
- `/interview` practice round: questions come from the drill bank and you tick key points yourself. Includes a tea break, pressure levels and a round map. The AI interviewer, voice and real scoring are not built yet.
- Not built from the design: XP, levels, gems and the closet (the data model has none of them), and mobile-specific layouts beyond basic stacking.

## How learning is designed to stick
Based on the Dunlosky et al. (2013) review of study techniques, which rated practice testing and distributed practice highest, plus worked-example research.
- **Guess first** (lesson step 1): predicting before seeing the answer. Errors are framed as normal.
- **Worked example, then a faded "your turn"**: novices learn better from studied examples than from cold problems.
- **Retrieval practice**: drills make you answer from memory, and "say why" is optional but encouraged.
- **Spaced repetition** (`src/lib/scheduler.ts`): Leitner boxes with expanding gaps (1, 2, 4, 8, 16, 32, 64 days). "Not yet" resets to box 0 and re-queues once in the session.
- **Interleaving** (`src/lib/queue.ts`): practice sessions mix topics instead of blocking them.
- **Honest self-assessment**: a rubric of key points the learner ticks, instead of an AI that might be wrong.
- Known gaps: evidence for these techniques in beginner programmers is thinner than in general education research. The scheduler is simple (FSRS could replace it later).

## Content workflow
Lessons and drills in `src/content/` are AI-drafted and human-reviewed. The first 3 lessons and 9 drills were reviewed and marked `reviewed: true`. New AI-drafted content starts with `reviewed: false`. Drafts are visible in development only; set `reviewed: true` after you check every claim and the production build will include them.

## Stack
Next.js + TypeScript + Tailwind, Supabase (later), Claude API (later), in-browser sandboxed code execution (later). Needs Node 22 (`nvm use`).

## Run
```bash
nvm use
npm run dev
```

## Component docs (Storybook)

A reference for the colours, type, pixel-art pieces and screens. Run it with `npm run storybook` (http://localhost:6006); `npm run build-storybook` makes a static site in `storybook-static/` (git-ignored).

- Stories live next to their component as `ComponentName.stories.tsx`. Foundations (palette, type, boxes and buttons) are in `src/stories/`.
- Screens read progress, the profile and the pitch from `localStorage`. A story sets them with `parameters: { tuftly: { account, progress, pitch } }`; sample states are in `src/stories/seeds.ts`. Anything not given is cleared, so every story starts clean.
- Like the live site, a static build hides lessons and drills marked `reviewed: false`. The dev server shows everything.
- Tailwind runs through Turbopack in the app, so Storybook uses the Vite plugin (`@tailwindcss/vite`) against the same `src/app/globals.css`.

## Accounts and saved progress (Supabase, optional)
Everything works on this device without it. With Supabase set up, people can sign in with an emailed link (no passwords) and their progress follows them across devices. The app stays local-first: it reads and writes this device, then merges with the saved copy and syncs a moment later (`src/lib/merge.ts` has the rules and tests).
1. Create a project at supabase.com.
2. SQL editor: run `supabase/migrations/0001_user_data.sql` (one table, row level security so people only see their own row).
3. Authentication > URL Configuration: set the Site URL to your live address and add redirect URLs `http://localhost:3000/auth/callback` and `https://YOUR-DOMAIN/auth/callback` (plus your Vercel preview pattern if you want previews to sign in).
4. Copy `.env.local.example` to `.env.local` and fill in the project URL and publishable key (Project Settings > API). Add the same two variables in Vercel.
5. Restart the dev server.
Next: Google sign-in, and a server-side counter for the 2 interviews a day cap.

## Deploy
The GitHub repo is `vickyadebona/tuftly` (private) and Vercel builds it. Pushes to `main` go live; other branches get preview links. Node 22 is pinned in `package.json`.

## Milestones
1. Foundation (this scaffold) 2. Content pipeline 3. Lessons + drills + streaks 4. Skill map + optional placement quiz 5. Text AI interview 6. Voice mode 7. Later: backend, system design, human-interview prep
