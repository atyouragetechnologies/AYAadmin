# AYA DevLink — Master Project Context & Handover Document

> **Use this document to initialize the context of any new AI coding session or assistant chat for the `AYA-admin` project.**

---

## 1. Project Overview & Repositories

- **Project Name**: AYA (At Your Age) — DevLink
- **Local Directory**: `Depends on Team Member`
- **GitHub Repository**: [https://github.com/atyouragetechnologies/AYA-admin](https://github.com/atyouragetechnologies/AYA-admin) (`main` branch)
- **Production URL**: `https://atyourage.app`
- **Tech Stack**:
  - **Frontend**: React 19 / 18, TypeScript, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas-Confetti, Howler / Web Audio.
  - **State Management**: Zustand with `persist` middleware (`src/store/userStore.ts`).
  - **Backend**: Supabase (PostgreSQL, Supabase Auth, Row Level Security, RPC Functions).
  - **Hosting**: Cloudflare Workers/Pages (PWA enabled).

---

## 2. Active Supabase Backend Credentials

- **Project URL**: *(See `VITE_SUPABASE_URL` in `.env`)*
- **Anon Public Key**: *(See `VITE_SUPABASE_ANON_KEY` in `.env`)*
- **Database Schema**: Full unified database schema is stored in [`full_schema.sql`](file:///c:/Users/damod/OneDrive/Desktop/AYA-admin/app/full_schema.sql).
- **Key Tables**:
  - `public.users`: User accounts, XP, streak, levels, `auth_user_id`, `is_admin`, `onboarding_complete`.
  - `public.personality_profiles`: Psychometric trait vectors (`trait_risk_taker`, `trait_creative`, etc.), archetype, life traits.
  - `public.game_sessions`: Story history, match scores, choices log, stars.
  - `public.levels` & `public.scenarios`: Game scenarios and storyline content.
  - `public.admin_users`: List of authorized admin emails.
  - `public.journey_events` & `public.journey_feedback`: Analytics and user feedback events.
  - `public.follows` & `public.follow_requests`: Social follow system.

---

## 3. Core Architecture & Key File Map

| Component / System | Main Files | Description |
| :--- | :--- | :--- |
| **Routing & App Entry** | `src/App.tsx`<br>`src/pages/GameRoot.tsx` | Main routing, session hydration, and assessment gatekeepers. |
| **Authentication** | `src/services/authService.ts`<br>`src/pages/SigninPage.tsx`<br>`src/pages/SignupPage.tsx`<br>`src/pages/SignupCompletePage.tsx` | Hybrid authentication (Google OAuth, Phone + Password, Username + Password) with auto session sync. |
| **State Management** | `src/store/userStore.ts` | Zustand store with local persistence for user profile, scores, XP, themes, and audio. |
| **Scenario Game & DNA** | `src/components/game/ScenarioGame.tsx`<br>`src/services/dnaService.ts`<br>`src/components/game/GenomicReportCard.tsx` | Interactive branching story runner, live DNA trait updates, career suggestions. |
| **Admin System** | `src/utils/adminCheck.ts`<br>`src/pages/AdminPanelPage.tsx` | Secure database-backed admin verification via `is_admin_user()` RPC. |
| **Recommendation Engine** | `src/services/recommendationEngine.ts`<br>`src/components/game/ForYouCarousel.tsx` | Tag-based dynamic scenario recommendation. |
| **Supabase Client** | `src/utils/supabase.ts` | Configured with `detectSessionInUrl` for OAuth callback detection. |

---

## 4. Key Work Completed & Solutions In Place

1. **New Repository & Database Migration**:
   - Cleanly migrated from the legacy `AYA-master` repo into `AYA-admin` (`https://github.com/tanishksuede/AYA-admin.git`).
   - Initialized a brand new Supabase project with `full_schema.sql`.
2. **Google OAuth Token Flow Fix**:
   - `SigninPage.tsx` actively listens to `supabase.auth.onAuthStateChange` to immediately capture `#access_token` hashes and route authenticated users without getting stuck.
3. **Onboarding Gatekeeper Fix**:
   - `GameRoot.tsx` and `authService.ts` check `onboarding_complete` and `username` rather than just XP, ensuring existing users are never trapped in assessment loops.
4. **DNA Persistence Integrity**:
   - `ScenarioGame.tsx` cleanly commits story results atomically via `save_story_completion_dna` without redundant state overwrites.
5. **Database-Driven Admin Access**:
   - Admin access is managed via the `is_admin_user()` RPC and `admin_users` table, allowing admins (Anita, Rakshit, etc.) access dynamically.
6. **Vercel to Cloudflare API Migration (Sept 2026)**:
   - 11 legacy Vercel Serverless Functions (`app/api/*`) were successfully migrated to Cloudflare Workers via `src/api-router.ts` and `src/vercel-polyfill.ts`.
   - **Critical polyfill note**: Cloudflare Workers lack Node's `process` object. `src/vercel-polyfill.ts` universally injects `globalThis.process.env` to prevent legacy APIs from crashing with `ReferenceError: process is not defined`.
   - The root `api/` folder and `viteApiDevPlugin` in `vite.config.ts` were removed to unify local and production environments.
7. **Strict .env Database Enforcement (Sept 2026)**:
   - Purged all legacy hardcoded Supabase URLs (`hstddacoqsmztmbvvhhr`) from frontend components, scripts, and API files. The project strictly connects to the database via `.env`.
   - *Important*: You must run `npm run build:game` to ensure these removed secrets are purged from the compiled `public/game/assets/` JavaScript bundles.
8. **Google OAuth Redirect URI Mapping**:
   - When switching Supabase projects, the "Authorized redirect URIs" in Google Cloud Console must be updated to `https://[NEW_PROJECT].supabase.co/auth/v1/callback` to prevent redirect_uri mismatch errors.

---

## 5. Strict Development Rules for AI Agents

> [!IMPORTANT]
> **Zero-Mistake Policy**:
> 1. **Always verify builds locally**: Run `npm run build` or `npx tsc -b` before pushing any code. Never push code that fails compilation.
> 2. **Version Control**: Run `git pull --rebase` before starting modifications, and commit and push (`git add . ; git commit -m '...' ; git push`) after completing tasks.
> 3. **Dynamic Origins**: Never hardcode domains. Use `window.location.origin` for redirects with fallback to `https://atyourage.app`.
