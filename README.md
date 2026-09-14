# AYA — At Your Age

**Interactive decision-simulation game app.** Users enter the life of a famous person at their exact age, make real decisions, and receive a personality DNA profile.

> **For AI agents & new developers:** Read [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) first.  
> **For product/business context:** Read [`AYA_Knowledge_Transfer_Document.md`](./AYA_Knowledge_Transfer_Document.md).

---

## Tech Stack

- **React 18 + Vite 6** (TypeScript)
- **Tailwind CSS v4** (NOT v3)
- **Zustand** — single global store
- **Supabase** — database & auth
- **Capacitor 8** — Android native wrapper
- **Capgo** — OTA updates

## Development

```sh
# Install (use bun, not npm)
bun install

# Dev server
bun run dev

# Build for Android APK
npm run build:android
npm run sync:android

# Deploy to Cloudflare (web)
npm run deploy:web

# OTA push to Capgo (Android)
npm run ota:push
```

## Project Structure

```
app/src/
├── components/game/   ← All game screens
├── data/              ← Story content (scenarios.ts, storyMetadata.ts)
├── utils/levelGenerator.ts  ← Story map card definitions
├── store/userStore.ts ← Global Zustand state
├── services/          ← Auth, DNA, recommendations
└── hooks/             ← Capacitor, OTA, subscriptions
```

## Adding a New Story

Edit **3 files** with the same `scenarioId`:
1. `app/src/utils/levelGenerator.ts` — map card
2. `app/src/data/scenarios.ts` — story frames & choices
3. `app/src/data/storyMetadata.ts` — filter tags

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md#7-story-data-flow--most-important) for full details.

---

*Connected to [Lovable](https://lovable.dev). Do not force-push or rebase pushed commits.*

