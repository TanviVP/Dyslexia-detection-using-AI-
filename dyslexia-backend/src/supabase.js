// src/supabase.js
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

export const supabase = createClient(
  process.env.SUPABASE_URL || "https://hnxvsblukmkjnfobngfk.supabase.co",
  process.env.SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueHZzYmx1a21ram5mb2JuZ2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTI4ODgsImV4cCI6MjA3ODg2ODg4OH0._87Wrhyt0XkaLwwtTL2MorTer_FxGYl7aIwCIMW41qc",
  {
    auth: { persistSession: false },
  }
);
