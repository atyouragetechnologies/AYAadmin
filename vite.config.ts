// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

// Same package.json version used for OTA/game versioning (see app/vite.config.ts) —
// this is the single source of truth for the whole app.
const pkg = JSON.parse(readFileSync(fileURLToPath(new URL("./package.json", import.meta.url)), "utf-8"));
const APP_VERSION = pkg.version || "1.0.0";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    define: {
      "import.meta.env.VITE_APP_VERSION": JSON.stringify(APP_VERSION),
    },
    server: {
      watch: {
        ignored: [
          '**/node_modules/**', 
          '**/dist/**', 
          '**/.git/**', 
          '**/public/**', 
          '**/.agents/**', 
          '**/android/**',
          '**/app/dist/**',
          '**/.output/**'
        ]
      }
    },
    optimizeDeps: {
      entries: ['app/index.html', 'app/router.tsx', 'src/**/*.{ts,tsx}']
    },
    build: {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  }
});
