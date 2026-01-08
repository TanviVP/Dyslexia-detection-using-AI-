const API_BASE = 'http://localhost:5000/api'

export async function getAdaptiveDifficulty(game: string, userId?: string) {
  try {
    const params = userId ? `?user_id=${userId}` : ''
    const response = await fetch(`${API_BASE}/adaptive/difficulty/${game}${params}`)
    if (!response.ok) return { difficulty: 'beginner', reason: 'Default level' }
    return await response.json()
  } catch (error) {
    console.error('Failed to get adaptive difficulty:', error)
    return { difficulty: 'beginner', reason: 'Error occurred' }
  }
}

export async function getNextLevel(gameResult: {
  score: number
  timeTaken: number
  errors: any
  currentDifficulty: string
  game: string
}) {
  try {
    const response = await fetch(`${API_BASE}/adaptive/next-level`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(gameResult)
    })
    if (!response.ok) return { nextLevel: 'beginner', reason: 'Default', confidence: 0.5 }
    return await response.json()
  } catch (error) {
    console.error('Failed to get next level:', error)
    return { nextLevel: 'beginner', reason: 'Error occurred', confidence: 0.5 }
  }
}

export function getNextDifficulty(score: {
  accuracy: number,
  avgResponseTime: number,
  errors: any
}) {
  const { accuracy, avgResponseTime } = score;

  if (accuracy < 50 || avgResponseTime > 3500) {
    return { next: 'easy', reason: 'Low accuracy or slow response time' };
  }
  if (accuracy >= 50 && accuracy < 80) {
    return { next: 'medium', reason: 'Performance is stable' };
  }
  if (accuracy >= 80 && avgResponseTime < 2500) {
    return { next: 'hard', reason: 'High accuracy and fast response' };
  }
  return { next: 'medium', reason: 'Default' };
}