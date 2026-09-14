# Supabase Migration Guide

We need to connect your new `AYA-admin` codebase and your Cloudflare deployment to the new Supabase project.

Follow these steps carefully:

## 1. Set Up the Database Schema
I have combined all of our database tables, policies, and RPC functions into a single file.
1. Open your new Supabase project dashboard.
2. Go to the **SQL Editor** (the `</>` icon on the left).
3. Click **New Query**.
4. Open the file `c:\{YOUR_SYSTEM_DRIVE}\Users\{YOUR_USERNAME}\OneDrive\Desktop\AYA-admin\app\full_schema.sql` on your computer, copy **all** of its contents, and paste it into the SQL Editor.
5. Click **Run** to execute it. This will instantly create all the necessary tables!

## 2. Connect Your Local Code
1. In your Supabase dashboard, go to **Settings** (gear icon) -> **API**.
2. Copy the **Project URL** and the **anon (public)** key.
3. Open `c:\Users\damod\OneDrive\Desktop\AYA-admin\.env` (or create a `.env.local` file).
4. Update the values to match your new project:
   ```env
   VITE_SUPABASE_URL=your_new_project_url
   VITE_SUPABASE_ANON_KEY=your_new_anon_key
   ```

## 3. Re-Enable Google Login (Important!)
Since this is a new project, you have to enable Google Auth again.
1. Go to **Authentication** -> **Providers** -> **Google**.
2. Turn it on.
3. You will need your Google Client ID and Google Client Secret (you can copy these from your old Supabase project's settings if you still have them, or from Google Cloud Console).
4. **CRITICAL STEP**: Open Google Cloud Console -> APIs & Services -> Credentials. Edit your OAuth 2.0 Client ID. 
5. Under "Authorized redirect URIs", add your NEW Supabase callback URL: `https://[YOUR_NEW_PROJECT_REF].supabase.co/auth/v1/callback`. (If you don't do this, Google login will fail with a redirect_uri mismatch error).
6. Save the settings in both Google Cloud and Supabase.

## 4. Update Cloudflare
Your live website is currently still talking to the old Supabase project!
1. Go to your **Cloudflare Dashboard**.
2. Select your `AYA-admin` Pages/Workers project.
3. Go to **Settings** -> **Environment Variables**.
4. Edit `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to match the new project keys.
5. Go to **Deployments** and click **Retry deployment** on the latest deployment so it picks up the new keys.
