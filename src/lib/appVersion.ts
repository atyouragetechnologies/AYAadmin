/**
 * App version — baked in at build time from the root package.json (see vite.config.ts).
 * Same source of truth used for the game's OTA versioning (app/vite.config.ts, app/src/utils/version.ts).
 */
export const APP_VERSION = import.meta.env['VITE_APP_VERSION'] || '1.0.0';
