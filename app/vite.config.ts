// @ts-nocheck
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'
import fs from 'fs'

// Read version from root package.json (single source of truth for OTA versioning)
const rootPkg = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../package.json'), 'utf-8'));
const APP_VERSION = rootPkg.version || '1.0.0';

// Read the native Android shell version straight from build.gradle so the admin panel
// can show what's configured, independent of the OTA content version above.
function readAndroidVersion() {
  try {
    const gradle = fs.readFileSync(path.resolve(__dirname, '../android/app/build.gradle'), 'utf-8');
    const nameMatch = gradle.match(/versionName\s+"([^"]+)"/);
    const codeMatch = gradle.match(/versionCode\s+(\d+)/);
    return {
      name: nameMatch?.[1] || 'unknown',
      code: codeMatch?.[1] || 'unknown',
    };
  } catch {
    return { name: 'unknown', code: 'unknown' };
  }
}
const ANDROID_VERSION = readAndroidVersion();

// https://vite.dev/config/
export default defineConfig({
  base: '/game/',
  envDir: '../',
  define: {
    // Expose app version from package.json at build time
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(APP_VERSION),
    'import.meta.env.VITE_ANDROID_VERSION_NAME': JSON.stringify(ANDROID_VERSION.name),
    'import.meta.env.VITE_ANDROID_VERSION_CODE': JSON.stringify(ANDROID_VERSION.code),
  },
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: false,
      manifest: false,
      devOptions: { enabled: false },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,json}'],
        skipWaiting: true,
        clientsClaim: true,
        cleanupOutdatedCaches: true,
        // Exclude all CDN-served heavy assets — these are fetched on-demand
        // from Cloudflare Edge (aya-assets-proxy worker) with smart buffering,
        // so precaching them would bloat the SW install by 200+ MB for nothing.
        globIgnores: [
          '**/music/**',
          '**/*.mp3',
          '**/*.m4a',
          '**/*.mp4',
          '**/map_frames_solar/**',
          '**/map_frames_dark/**',
          '**/map_frames/**',
          '**/mascot_frames/**',
          '**/images/antigravity/**',
          '**/portraits/**',
        ],
        maximumFileSizeToCacheInBytes: 15 * 1024 * 1024, // 15MB — handles images and bundle
      },
    })
  ],
  server: {
    host: true, // Exposes the server to the network
    watch: {
      ignored: [
        '**/node_modules/**', 
        '**/dist/**', 
        '**/.git/**', 
        '**/public/**', 
        '**/.agents/**', 
        '**/android/**'
      ]
    }
  },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
              return 'react-vendor';
            }
            if (id.includes('framer-motion') || id.includes('lucide-react') || id.includes('styled-components') || id.includes('tailwindcss')) {
              return 'ui-vendor';
            }
            if (id.includes('@supabase/supabase-js')) {
              return 'db-vendor';
            }
            if (id.includes('@capacitor')) {
              return 'native-vendor';
            }
            return 'vendor'; // Fallback for other node_modules
          }
        }
      }
    }
  },
  optimizeDeps: {
    entries: ['index.html', 'src/**/*.{ts,tsx}'],
    include: []
  }
})
