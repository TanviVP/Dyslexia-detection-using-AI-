import { supabase } from '../lib/supabase'

const API_BASE = 'http://localhost:5000/api'

export async function saveGameScore(score: {
  userId: string;
  gameName: string;
  difficulty: string | number;
  accuracy: number;
  avgResponseTime: number;
  errors?: Record<string, any>;
}) {
  try {
    // Save to Supabase for real-time updates
    const { data, error } = await supabase
      .from('game_scores')
      .insert({
        user_id: score.userId,
        game_name: score.gameName,
        difficulty_level: String(score.difficulty),
        accuracy: score.accuracy,
        avg_response_time: score.avgResponseTime,
        errors: score.errors ?? {}
      })
      .select()
      .single()

    if (error) throw error

    // Also save to backend API as backup
    try {
      const token = localStorage.getItem('authToken')
      await fetch(`${API_BASE}/scores`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          game_name: score.gameName,
          difficulty_level: String(score.difficulty),
          accuracy: score.accuracy,
          avg_response_time: score.avgResponseTime,
          errors: score.errors ?? {}
        })
      })
    } catch (apiError) {
      console.warn('Backend API save failed, but Supabase save succeeded:', apiError)
    }

    return data
  } catch (error) {
    console.error('Failed to save score:', error)
    throw error
  }
}

export async function getRecentScores(limit = 20, userId?: string) {
  try {
    // Fetch from Supabase for real-time data
    let query = supabase
      .from('game_scores')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Failed to fetch scores from Supabase:', error)
    
    // Fallback to API
    try {
      const params = new URLSearchParams({ limit: limit.toString() })
      if (userId) params.append('user_id', userId)
      
      const response = await fetch(`${API_BASE}/scores?${params}`)
      if (!response.ok) return []
      return await response.json()
    } catch (apiError) {
      console.error('Failed to fetch scores from API:', apiError)
      return []
    }
  }
}
