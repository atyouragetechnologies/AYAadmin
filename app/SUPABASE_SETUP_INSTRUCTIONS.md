# AYA Feedback System - Supabase Setup Instructions

Please follow these steps to set up the new feedback system in your Supabase project.

## Step 1: Run the Database Migrations

I have created a SQL file with all the necessary tables, indexes, and Row Level Security (RLS) policies.

1. Open your [Supabase Dashboard](https://app.supabase.com/)
2. Navigate to the **SQL Editor** (the terminal icon on the left sidebar)
3. Click **New Query**
4. Copy the entire contents of `c:\AYA-master\supabase_feedback_tables.sql` (or just open the file in your IDE and copy it)
5. Paste it into the SQL Editor and click **Run** (or press Cmd/Ctrl + Enter)

This will create 10 new tables:
- `journey_events`
- `journey_feedback`
- `feature_usage`
- `unmatched_searches`
- `personality_wishlist`
- `story_difficulty_feedback`
- `user_topic_preferences`
- `journey_completions`
- `survey_responses`
- `admin_feedback_cache`

## Step 2: Verify Setup

After running the SQL script, you can verify the tables exist:
1. Go to the **Table Editor** (the grid icon)
2. You should see all the new tables listed
3. The app is now ready to send analytics data to these tables!

## Step 3: View the Analytics

Once users start generating data, you can view the insights in two ways:
1. **In App:** Visit the new admin dashboard at `http://localhost:5173/game/admin/feedback` (requires admin privileges)
2. **In Supabase:** Write custom queries in the SQL Editor to analyze raw data.

**All frontend code has been integrated and tested.**
