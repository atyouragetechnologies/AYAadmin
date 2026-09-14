# Android Google Sign-In release checklist

AYA uses native Google Sign-In to obtain an ID token, then exchanges that token for a Supabase session. The Android OAuth client must therefore be registered in the Google Cloud project that owns the Google client configured in Supabase Auth.

## App identity

- Package name: `com.aya.app`
- Release SHA-1: `C8:2E:8D:34:B1:D1:B6:40:98:07:71:3A:EA:09:59:D9:9F:2E:EC:00`
- Debug SHA-1: `70:0F:1C:0C:4A:1C:12:B2:35:1F:EA:F8:41:A7:B6:1D:AB:F6:01:98`

## Before sharing an APK or AAB

1. In Google Cloud Console, open the project that owns the Google OAuth client configured in Supabase Auth.
2. Ensure it has an **Android** OAuth 2.0 client for `com.aya.app` and the release SHA-1 above.
3. Keep a second Android OAuth client for the debug SHA-1, so locally built test APKs work too.
4. Download a fresh `google-services.json` from the Firebase project after changing Firebase Android settings, replace `android/app/google-services.json`, and rebuild.
5. When Play App Signing is enabled, add the Play app-signing SHA-1 as an additional Android OAuth client before distributing the first testing build.
6. Test Google login from a freshly installed release APK, then test username/phone login as a separate fallback.

`[16] Account reauth failed` is a Google Play Services/OAuth app-verification failure, not a Supabase password-login failure. It is normally caused by a missing or incorrect package-name/SHA-1 registration.
