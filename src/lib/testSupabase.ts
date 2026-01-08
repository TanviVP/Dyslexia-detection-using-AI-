import { supabase } from './supabase'

export async function testSupabaseConnection() {
  try {
    // Test basic connection
    const { data, error } = await supabase.from('game_scores').select('count').limit(1)
    
    if (error) {
      console.error('Supabase connection error:', error)
      return false
    }
    
    console.log('Supabase connection successful')
    return true
  } catch (err) {
    console.error('Supabase test failed:', err)
    return false
  }
}

export async function createGameScoresTable() {
  try {
    // This will help us understand if the table exists
    const { data, error } = await supabase
      .from('game_scores')
      .select('*')
      .limit(1)
    
    if (error) {
      console.error('Table access error:', error)
      return false
    }
    
    console.log('game_scores table accessible')
    return true
  } catch (err) {
    console.error('Table test failed:', err)
    return false
  }
}