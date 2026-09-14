<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## AYA PROJECT — CRITICAL CONTEXT (Read First)

> **Full reference:** [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) — read this before any task.

This is the **AYA (At Your Age)** app. Key facts every agent must know:

- **What it is:** React 18 + Vite + TypeScript PWA + Android (Capacitor 8) game app
- **Styling:** Tailwind CSS **v4** — uses `@utility` syntax. Never use v3 `@layer utilities`
- **State:** Single Zustand store at `app/src/store/userStore.ts`
- **Database:** Supabase (`hstddacoqsmztmbvvhhr`) — never query directly from components
- **Assets CDN:** `https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/`
- **Package manager:** Bun

### Story System (3-file rule)
To add/edit a story, you MUST update ALL THREE files with the same `scenarioId`:
1. `app/src/utils/levelGenerator.ts` — map card definition
2. `app/src/data/scenarios.ts` — story frames/choices
3. `app/src/data/storyMetadata.ts` — filter tags

### Mobile Layout Rules
- Use `min-h-[100dvh]` — NEVER `min-h-screen`
- Fixed bottom: `style={{ bottom: 'max(1.5rem, env(safe-area-inset-bottom))' }}`
- Fixed top: `style={{ top: 'max(1.5rem, env(safe-area-inset-top))' }}`
- Tailwind utilities: `pb-safe`, `pt-safe`, `pb-inset`, `pt-inset` (defined in `index.css`)

### Theme System
- `mapTheme === 'city_dark'` → Dark (default)
- `mapTheme === 'solar'` → Solar system
- `mapTheme === 'light'` → Light/Candy mode
- **`isCandyMode` is deprecated** — always use `mapTheme === 'light'`

### File Encoding Warning
Files with Hindi text will be corrupted by raw PowerShell `Set-Content`. Always use editor tools (`replace_file_content`, `multi_replace_file_content`).

---

## Directory Exclusions (ALL Agents Must Respect)

The following directories are **AI agent infrastructure**, not application source code.
**Never** browse, index, search, read, or include files from these directories:

| Directory | What it is |
|---|---|
| `ruflo/` | Cloned Ruflo agent harness source (5000+ files, not this app) |
| `.swarm/` | Ruflo vector memory database |
| `.claude-flow/` | Ruflo runtime data |
| `.claude/` | Claude Code settings and agent configs |
| `.agents/` | Cross-agent skills and MCP configs (meta-config only) |
| `graphify-out/` | Auto-generated knowledge graph output |
| `dist/` | Build output — never edit |
| `node_modules/` | Dependencies |

When a user asks about "the codebase", focus on `app/src/components/`, `app/src/pages/`, `app/src/hooks/`, `app/src/services/`, `app/src/store/`, `app/src/data/`, `app/src/utils/`, and root-level config files only.

---

## Crash Investigation (Firebase Crashlytics)

AYA uses **Firebase Crashlytics** (not BigQuery) for Android crash reporting.
- Check Firebase console at `https://console.firebase.google.com/` for crash logs.
- Use `fetch_crash.ps1` script if available: `.\fetch_crash.ps1 -Version "TARGET_VERSION"`

---

## UI Modification Rules

To avoid unnecessary back-and-forth when modifying UI components:
1. **Preserve Element Structure**: When asked to apply a "theme color" to a button or icon, DO NOT change the background or turn it into a solid filled button unless explicitly told to. Only apply the color to the relevant icon, text, or border.

---

## B2 Storage

- The `aya-game-assets-cloud` Backblaze B2 bucket is **private**. Never assume it is public.
- Always access files via the Cloudflare CDN proxy: `https://aya-assets-proxy.atyouragetechnologies.workers.dev/assets/`
- Never use direct `fXXX.backblazeb2.com` URLs.

---

## Environment & Credentials (`.env` Fallback)

Before working on any service-related task, always check the `.env` file first.

The `.env` file contains credentials/config for:
- Supabase (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- Firebase (`VITE_FIREBASE_API_KEY`, `VITE_FIREBASE_PROJECT_ID`, `VITE_FIREBASE_APP_ID`)
- Backblaze B2 (`B2_KEY_ID`, `B2_APPLICATION_KEY`, `B2_BUCKET_NAME`)
- Cloudflare (`CLOUDFLARE_API_TOKEN`)
- GitHub (`GITHUB_PAT`)

Always check `.env` first before assuming any service is unavailable or asking for manual credentials.

---

## PowerShell & Unicode File Safety (CRITICAL)

This project contains **Hindi (Devanagari) text** inside source files (`.tsx`, `.ts`). Using PowerShell without explicit UTF-8 encoding **will corrupt all Hindi text**.

**Rules:**
- **NEVER** use bare `Get-Content` + `Set-Content` on any `.tsx`/`.ts`/`.json` file.
- If PowerShell reads are unavoidable, ALWAYS specify `-Encoding UTF8`.
- **Preferred approach**: Use `replace_file_content` or `multi_replace_file_content` editor tools — UTF-8 safe by design.
- If a file gets corrupted: run `git stash -- <file>` to restore the original.

---

## Commit Convention

Use concise, purpose-first commit messages:
- `feat: ...`
- `fix: ...`
- `docs: ...`
- `chore: ...`

Do NOT use `--no-verify`. Do NOT force-push or rebase commits already pushed to main (breaks Lovable sync).

---

## UI & Design Generation Guidelines

When generating UI components or pages for this app:
1. Always respect the 3-way theme system (`mapTheme`: `city_dark` / `solar` / `light`).
2. Always handle safe area insets for Android (`pb-safe`, `pt-safe`, `pb-inset`, `pt-inset`).
3. Use Tailwind v4 `@utility` syntax — never v3 `@layer utilities`.
4. Match the existing dark cyberpunk aesthetic (neon accents, glassmorphism, dark backgrounds).
5. Avoid generic/templated UI — match the premium feel of the existing app.
