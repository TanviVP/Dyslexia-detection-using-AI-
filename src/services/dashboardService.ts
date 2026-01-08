import { supabase } from '../lib/supabase'

export interface DashboardStats {
  totalGamesPlayed: number
  averageScore: number
  bestScore: number
  totalTimeMinutes: number
  recentScores: any[]
  gamesPlayedToday: number
  improvementTrend: number
}

export async function getDashboardStats(userId: string): Promise<DashboardStats> {
  try {
    // Fetch recent scores from Supabase
    const { data: scores, error } = await supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.warn('Supabase error, falling back to localStorage:', error)
      throw error
    }

    const recentScores = scores || []
    
    // Calculate statistics
    const totalGamesPlayed = recentScores.length
    const averageScore = recentScores.length > 0 
      ? recentScores.reduce((sum, s) => sum + (s.accuracy * 100 || 0), 0) / recentScores.length 
      : 0
    const bestScore = recentScores.length > 0 
      ? Math.max(...recentScores.map(s => s.accuracy * 100 || 0)) 
      : 0
    const totalTimeMinutes = Math.round(
      recentScores.reduce((sum, s) => sum + (s.avg_response_time || 0), 0) / 60000
    )

    // Games played today
    const today = new Date().toISOString().split('T')[0]
    const gamesPlayedToday = recentScores.filter(s => 
      s.created_at?.startsWith(today)
    ).length

    // Improvement trend (compare last 5 vs previous 5 games)
    let improvementTrend = 0
    if (recentScores.length >= 10) {
      const recent5 = recentScores.slice(0, 5)
      const previous5 = recentScores.slice(5, 10)
      const recentAvg = recent5.reduce((sum, s) => sum + (s.accuracy * 100 || 0), 0) / 5
      const previousAvg = previous5.reduce((sum, s) => sum + (s.accuracy * 100 || 0), 0) / 5
      improvementTrend = recentAvg - previousAvg
    }

    return {
      totalGamesPlayed,
      averageScore,
      bestScore,
      totalTimeMinutes,
      recentScores: recentScores.slice(0, 10),
      gamesPlayedToday,
      improvementTrend
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return {
      totalGamesPlayed: 0,
      averageScore: 0,
      bestScore: 0,
      totalTimeMinutes: 0,
      recentScores: [],
      gamesPlayedToday: 0,
      improvementTrend: 0
    }
  }
}

export async function getGameProgress(userId: string, gameType?: string) {
  try {
    const query = supabase
      .from('game_scores')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })

    if (gameType) {
      query.eq('game_name', gameType)
    }

    const { data: scores, error } = await query

    if (error) throw error

    return scores || []
  } catch (error) {
    console.error('Error fetching game progress:', error)
    return []
  }
}