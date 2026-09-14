# Mobile Overhaul Diagnosis and Implementation Plan

## Diagnosis Report
I ran a browser subagent simulating an iPhone SE (375x667) to load the login page and test for visual, console, and network issues. Here are the findings:

### 1. Visual & Layout Issues
- **Vertical Density & Scrolling**: The "Years" age dial takes up a massive portion of the vertical space. Users are forced to scroll down to interact with the "Access Code (Mobile)" input and the primary "START MY JOURNEY" button.
- **Button Cutoff & Bottom Proximity**: The "START MY JOURNEY" button sits extremely close to the bottom of the viewport, which interferes with iOS gesture navigation (home bar).
- **Overlapping Elements**: A floating menu icon on the right edge overlaps with the Access Code input area on narrow screens.
- **Intrusive Modal Block**: An initial "NEVER MISS YOUR DAILY STREAK" modal blocks the onboarding flow for new users, requiring dismissal before they can even log in.

### 2. Console Errors & Warnings
- **Critical Hydration Error**: `ReferenceError: Cannot access 'ye' before initialization` in the JS bundle. This points to a circular dependency or initialization order issue, likely causing React hydration failures.
- **Deprecation Warning**: `<meta name="apple-mobile-web-app-capable" content="yes">` is deprecated. Chrome/Safari suggests using `<meta name="mobile-web-app-capable" content="yes">` instead.

### 3. Large Network Assets
- **Massive Audio Payload**: 11 Background Music (BGM) tracks load simultaneously during the initial onboarding/login phase (`onboarding`, `mystery`, `tension`, `joy`, `hope`, `calm`, `neon-map`, `love`, `grief`, `triumph`, `quiz`). This severely impacts the initial Time To Interactive (TTI) and consumes excessive mobile bandwidth.

---

## Implementation Plan

### Phase 1: Problem 1 — Login Page Nuclear Rewrite
- **`OnboardingWizard.tsx`**: Fully rewrite the component using the provided mobile-first structure. Replace the Age Dial with a native `<input type="number">` to save vertical space.
- **`index.html`**: Update the viewport meta tag to `width=device-width, initial-scale=1.0, viewport-fit=cover` and add the required iOS meta tags.
- **`index.css`**: Inject the hardcoded `.login-root`, `.login-header`, `.login-form` CSS and apply `min-height: -webkit-fill-available` to the `body` and `html`. Remove the old `login-container` fixes since the nuclear rewrite supersedes them.

### Phase 2: Problem 2 — Audio System Rewrite
- **Cleanup**: Grep the entire `src/` directory to hunt down and delete any `new AudioContext()`, `audioContextRef`, or old audio helpers.
- **`audioManager.ts`**: Replace the existing file with the provided robust `AudioManager` class that properly handles Safari's gesture unlock using the silent buffer trick. Export a single `audio` instance.
- **`MoodWheel.tsx`**: Replace the current spin logic with `audio.unlock()` at the top of the gesture handler. Wire `audio.tick()` to the Framer Motion `onUpdate` callback and `audio.win()` to `onAnimationComplete`.
- **Global Click Sounds**: Replace `audioSynth.playClick()` usages with `audio.click()` throughout the app (especially the Back button).

### Phase 3: Problem 3 — Mobile Performance Optimizations
- **Framer Motion Tweaks**: Add the `isMobile` detector. Reduce wheel spin duration from 4.5s to 3.5s on mobile. Ensure all animations use `transform` properties (`x`, `y`, `rotate`, `scale`) instead of layout properties (`top`, `left`).
- **CSS GPU Acceleration**: Add `will-change: transform` and `translateZ(0)` to the `.wheel-container` in `index.css`.
- **Particle & Confetti Reduction**: Cut star particles to 6 (down from 15) and confetti to 15 (down from 30) for mobile users.
- **Glassmorphism Fallback**: Add a media query to disable `backdrop-filter` on screens `< 768px` and use a solid fallback background to prevent severe rendering lag on low-end devices.
- **Image Lazy Loading**: Add `loading="lazy"` to all `<img />` tags, specifically the personality portraits on the map.

### Phase 4: Final Testing & Merge
- Verify zero TypeScript compilation errors via `npx tsc --noEmit`.
- Commit and push to `dev`.
- Merge `dev` into `master` and push to origin.

## User Review Required
Please review the diagnosis and the proposed implementation plan. If you approve, I will proceed with executing all three problem fixes.
