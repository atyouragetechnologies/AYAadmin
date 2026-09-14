import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const oldUrl = 'https://hstddacoqsmztmbvvhhr.supabase.co';
const oldKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzdGRkYWNvcXNtenRtYnZ2aGhyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc5MjgxODYsImV4cCI6MjEwMzUwNDE4Nn0.EXwnivlEoOkZViWS6UnaWTbSNPdjBB068AOsHU7SVpI';

const newUrl = process.env.VITE_SUPABASE_URL;
const newKey = process.env.VITE_SUPABASE_ANON_KEY;

async function check() {
  const oldClient = createClient(oldUrl, oldKey);
  const newClient = createClient(newUrl, newKey);

  console.log("Checking OLD Supabase...");
  const { count: oldCount, error: oldErr } = await oldClient.from('users').select('*', { count: 'exact', head: true });
  if (oldErr) console.log("Old error:", oldErr);
  else console.log("Old Supabase Users Count:", oldCount);

  console.log("Checking NEW Supabase...");
  const { count: newCount, error: newErr } = await newClient.from('users').select('*', { count: 'exact', head: true });
  if (newErr) console.log("New error:", newErr);
  else console.log("New Supabase Users Count:", newCount);
}

check();
