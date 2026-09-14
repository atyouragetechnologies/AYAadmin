# AYA (At Your Age) — Architecture & Developer Reference
> **Last Updated:** September 2026
> **Purpose:** Ground truth for all AI agents, team members, and new developers. Read this BEFORE touching any code.

---

## 1. What Is This Project?

**AYA** is an interactive decision-simulation game app. Users enter the life of a famous person **at the same age they are right now**, make the choices that person actually faced, and receive a personality/DNA profile based on their decisions.

- **Primary audience:** Students aged 15–22
- **Stage:** Active development. Android APK + PWA deployed.
- **App URL (PWA):** `https://atyourage.app/game`
- **Company:** AtYourAge Technologies Private Limited / NayiDisha Technologies

---

## 2. Tech Stack (Exact Versions)

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 6 |
| Language | TypeScript |
| Styling | Tailwind CSS v4 (uses `@utility` syntax — NOT v3 `@layer utilities`) |
| UI Primitives | Radix UI + shadcn/ui |
| State Management | Zustand (single store: `userStore.ts`) |
| Backend/DB | Supabase (PostgreSQL) — project ID: `hstddacoqsmztmbvvhhr` |
| Auth | Supabase Auth + Firebase Google OAuth via `@capacitor-firebase/authentication` |
| Native App | Capacitor 8 (Android only, `appId: com.aya.app`) |
| OTA Updates | Capgo (`@capgo/capacitor-updater`) — manual mode via `useOtaUpdater` hook |
| File Storage | Backblaze B2 (private bucket) via Cloudflare CDN proxy |
| CDN / Assets | `https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/` |
| Analytics | Google Analytics 4 (`G-30ZXCBJXSQ`) |
| Animation | Framer Motion |
| Package Manager | Bun (NOT npm/yarn for installs) |

---

## 3. Project Directory Structure

```
AYA-admin/
├── app/src/
│   ├── App.tsx                  ← Router + ALL routes defined here
│   ├── main.tsx                 ← Entry point
│   ├── index.css                ← Global styles, Tailwind v4, safe-area utilities
│   ├── components/game/         ← ALL game UI screens
│   ├── components/admin/        ← Admin dashboard components
│   ├── components/ui/           ← Shared reusable UI
│   ├── pages/                   ← Route-level pages
│   ├── data/
│   │   ├── scenarios.ts         ← STORY CONTENT frames/choices (~9500 lines, 587 KB)
│   │   ├── storyMetadata.ts     ← Filter tags per story (~5200 lines, 150 KB)
│   │   ├── idolMindsets.ts      ← DNA/personality match data
│   │   └── storySources.ts      ← Citations per story
│   ├── utils/
│   │   ├── levelGenerator.ts    ← ALL level/story cards for the map (~1366 lines)
│   │   ├── levelSystem.ts       ← XP thresholds, level title calculation
│   │   ├── supabase.ts          ← Supabase client init
│   │   ├── audioManager.ts      ← SFX: playClick(), playHover(), playBack()
│   │   └── bgmManager.ts        ← Background music manager
│   ├── store/
│   │   └── userStore.ts         ← SINGLE Zustand store for ALL app state (~790 lines)
│   ├── services/
│   │   ├── authService.ts       ← All auth logic (sign up/in/out, Google OAuth)
│   │   ├── dnaService.ts        ← DNA profile calculation & Supabase sync
│   │   ├── recommendationEngine.ts
│   │   └── insightService.ts    ← AI insights via Cloudflare Worker
│   ├── hooks/
│   │   ├── useNativeFeatures.ts ← Capacitor back button, status bar, isNativeApp
│   │   ├── useOtaUpdater.ts     ← Capgo OTA update check
│   │   └── useSubscription.ts   ← Subscription/access level logic
│   └── types/
│       ├── gameTypes.ts         ← Core types: UserProfile, Level, PersonalityTraits
│       └── ayaTypes.ts
├── android/                     ← Native Android project (Capacitor managed, do not edit directly)
├── capacitor.config.ts          ← Capacitor plugins, appId, webDir
├── package.json                 ← Root scripts
├── AGENTS.md                    ← AI agent rules
└── docs/ARCHITECTURE.md         ← This file
```

---

## 4. Key Game Components

| Component | File | Role |
|---|---|---|
| LevelMap | `components/game/LevelMap.tsx` | Main game map. Story nodes, FAB check-in button |
| SolarMap | `components/game/SolarMap.tsx` | Alternative solar-system themed map |
| ScenarioGame | `components/game/ScenarioGame.tsx` | Story player: frames, choices, narration (~1700 lines) |
| PersonalityIntro | `components/game/PersonalityIntro.tsx` | Pre-story intro card |
| MatchReport | `components/game/MatchReport.tsx` | Post-story DNA match % screen |
| DnaProfile | `components/game/DnaProfile.tsx` | Full DNA/personality profile viewer |
| ProfileDashboard | `components/game/ProfileDashboard.tsx` | User profile editor |
| SideMenu | `components/game/SideMenu.tsx` | Slide-out navigation menu |
| OnboardingWizard | `components/game/OnboardingWizard.tsx` | Multi-step onboarding for new users |
| CinematicOnboarding | `components/game/CinematicOnboarding.tsx` | Slide-based onboarding (3 slides) |
| AdminPanelPage | `pages/AdminPanelPage.tsx` | Admin dashboard (requires `isAdmin: true`) |
| PwaHeader | `components/ui/PwaHeader.tsx` | Top sticky header: XP, logo, install button |

---

## 5. App Routes

```
/                        → HomePage
/signup                  → SignupPage
/signin                  → SigninPage
/signup/complete         → SignupCompletePage
/payment/verify          → PaymentVerify
/game/                   → LevelMap or SolarMap (based on mapTheme)
/game/welcome            → OnboardingWizard
/game/onboarding/:step   → CinematicOnboarding (steps 1–3)
/game/assessment/:step   → PersonalityAssessment
/game/intro/:id          → PersonalityIntro
/game/play/:id           → ScenarioGame (the story)
/game/report/:id         → MatchReport
/game/dna                → DnaProfile
/game/profile            → ProfileDashboard
/game/settings           → SettingsPage
/game/journal            → JournalPage
/game/theme              → ThemeSwitcherPage
/game/social             → SocialPage
/game/admin              → AdminPanelPage
/game/admin/feedback     → FeedbackDashboard
```

---

## 6. State Management — `userStore.ts`

One Zustand store, persisted to `localStorage`, synced to Supabase.

| Slice | Type | Description |
|---|---|---|
| `profile` | `UserProfile \| null` | Full user profile from Supabase |
| `levels` | `Level[]` | Generated by `generateLevels()` from `levelGenerator.ts` |
| `xp` | `number` | Global Wisdom XP |
| `mapTheme` | `'city_dark' \| 'solar' \| 'light'` | Current map theme |
| `isCandyMode` | `boolean` | **DEPRECATED** — use `mapTheme === 'light'` |
| `collectedLessons` | `Lesson[]` | Journal entries |
| `musicVolume / sfxVolume` | `number` | 0.0–1.0 |
| `appLanguage` | `'en' \| 'hi'` | UI language |

---

## 7. Story Data Flow — MOST IMPORTANT

Stories are spread across 3 files linked by `scenarioId`:

```
levelGenerator.ts → Level card on the map (title, age, avatarUrl, scenarioId, idolTraits)
                                                     |
                                              [scenarioId]
                                            /           \
                                 scenarios.ts          storyMetadata.ts
                           (story frames/choices)      (filter tags)
```

**The `scenarioId` in `levelGenerator.ts` MUST exactly match:**
- The key in `STORY_DATABASE` object in `scenarios.ts`
- The `storyId` field in `STORY_METADATA[]` array in `storyMetadata.ts`

### Adding a New Story — Steps

1. **`utils/levelGenerator.ts`** — Add entry to `levels[]` array with all required fields including `scenarioId`
2. **`data/scenarios.ts`** — Add key = `scenarioId`, value = story object with `frames[]`
3. **`data/storyMetadata.ts`** — Add entry to `STORY_METADATA[]` with `storyId` = `scenarioId`

### Story Frame Structure

```ts
'lvl_age_XX_name': {
  background: 'https://CDN_URL/image.webp',
  characterRight: 'https://CDN_URL/avatar.webp',
  emotion: 'joy' | 'fear' | 'neutral' | 'anger' | 'sadness',
  frames: [
    {
      id: 'intro',              // First frame must be 'intro'
      bg: 'https://...image.webp',
      speaker: 'Narrator',
      text: 'Story text...',
      emotion: 'joy',
      choices: [
        { text: 'Choice A', next: 'choice_a', score: 1, feedbackTitle: '...', feedbackText: '...' },
        { text: 'Choice B', next: 'choice_b', score: 1, feedbackTitle: '...', feedbackText: '...' },
      ]
    },
    { id: 'choice_a', bg: '...', speaker: 'Narrator', text: '...', emotion: 'joy',
      choices: [{ text: 'Next', next: 'lesson', score: 0 }] },
    { id: 'lesson', bg: '...', speaker: 'Narrator', text: 'LESSON: ...',
      choices: [{ text: 'Complete Level', next: 'COMPLETE', score: 10, feedbackTitle: 'Mission Accomplished' }] }
  ]
}
```

---

## 8. Supabase DB

**Project:** `hstddacoqsmztmbvvhhr`
**URL:** `https://hstddacoqsmztmbvvhhr.supabase.co`

| Table | Purpose |
|---|---|
| `users` | Main user profile (UserProfile type) |
| `journeys` | Completed story sessions |
| `feedbacks` | Per-choice event logs for analytics |
| `story_metadata` | Server-side mirror of storyMetadata.ts |
| `wishlist` | User story requests |
| `follow` | Social follow graph |

---

## 9. Build & Deploy

```bash
bun run dev               # Dev server
npm run build:android     # Build with base="/" for Capacitor APK
npm run sync:android      # build:android + npx cap sync
npm run build:game        # React build → public/game/
npm run deploy:web        # Build + deploy to Cloudflare Pages
npm run ota:push          # Build + push OTA bundle to Capgo
npm run ota:push:only     # Push existing build to Capgo (skip rebuild)
```

---

## 10. Safe Area / Edge-to-Edge (Android)

Custom CSS utilities in `app/src/index.css`:

| Class | Value | Use Case |
|---|---|---|
| `pb-safe` | `max(1.2rem, env(safe-area-inset-bottom))` | Buttons, footers |
| `pt-safe` | `max(1.2rem, env(safe-area-inset-top))` | Headers, status bar |
| `mb-safe` | `max(1.2rem, env(safe-area-inset-bottom))` | Bottom margins |
| `mt-safe` | `max(1.2rem, env(safe-area-inset-top))` | Top margins |
| `pb-inset` | `env(safe-area-inset-bottom)` only | Fullscreen `fixed inset-0` wrappers |
| `pt-inset` | `env(safe-area-inset-top)` only | Fullscreen `fixed inset-0` wrappers |

Rules:
- Always `min-h-[100dvh]` — never `min-h-screen`
- Fixed bottom elements: `style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}`
- Fixed top elements: `style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}`

---

## 11. Theme System

| Display Name | `mapTheme` | Old `isCandyMode` |
|---|---|---|
| Dark Cyberpunk (default) | `'city_dark'` | `false` |
| Solar System | `'solar'` | `false` |
| Light / Candy | `'light'` | `true` |

In components: always check `mapTheme === 'light'`, NOT deprecated `isCandyMode`.

---

## 12. Access / Subscription System

`profile.access_type` values: `'free'` | `'jee15'` | `'neet15'` | `'paid'`

Hook: `useSubscription()` returns `{ isPaid, isTrialActive, hasTrialAvailable, daysRemaining }`

---

## 13. File Encoding Warning

Some files contain **Hindi (Devanagari) text** inline. PowerShell `Get-Content`/`Set-Content` without `-Encoding UTF8` corrupts them.

**ALWAYS use editor tools** (`replace_file_content`, `multi_replace_file_content`) — never raw PowerShell — for source file edits.

---

## 14. AI Agent Rules — What NOT to Do

1. Never browse `ruflo/`, `.swarm/`, `.claude-flow/`, `.claude/`, `graphify-out/`, `dist/`, `node_modules/`
2. Never use `min-h-screen` — always `min-h-[100dvh]`
3. Never use Tailwind v3 `@layer utilities` — this is Tailwind v4 (`@utility`)
4. Never assume B2 bucket is public — always use Cloudflare CDN proxy URL
5. Never hardcode API keys in source
6. Never use `isCandyMode` as a new pattern — use `mapTheme === 'light'`
7. Never edit `app/dist/` — generated output
8. Never force-push or rebase pushed commits (breaks Lovable sync)
9. Never bulk-edit `scenarios.ts` / `storyMetadata.ts` / `levelGenerator.ts` without a story-specific task
10. Never query Supabase/Firebase directly from UI components — use `userStore` or `services/`

---

## 15. AI Quick Reference

| Task | Files |
|---|---|
| Add new story | `levelGenerator.ts` + `scenarios.ts` + `storyMetadata.ts` |
| Edit story content | `data/scenarios.ts` |
| Add new route | `App.tsx` |
| Global state changes | `store/userStore.ts` |
| Auth logic | `services/authService.ts` |
| DNA/personality | `services/dnaService.ts` |
| New game screen | `components/game/` + route in `App.tsx` |
| Android safe area | `pb-safe`, `pt-safe`, `pb-inset`, `pt-inset` utilities |
| OTA update issues | `hooks/useOtaUpdater.ts` |
| XP/level system | `utils/levelSystem.ts` |
| Story recommendations | `services/recommendationEngine.ts` |

