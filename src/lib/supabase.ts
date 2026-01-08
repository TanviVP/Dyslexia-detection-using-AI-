import { createClient } from '@supabase/supabase-js'

// Use valid placeholder URLs for development mode
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://hnxvsblukmkjnfobngfk.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhueHZzYmx1a21ram5mb2JuZ2ZrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyOTI4ODgsImV4cCI6MjA3ODg2ODg4OH0._87Wrhyt0XkaLwwtTL2MorTer_FxGYl7aIwCIMW41qc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
