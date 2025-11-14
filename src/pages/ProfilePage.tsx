import React, { useState, useEffect } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  ArrowLeft, 
  User, 
  Mail, 
  Calendar, 
  Award, 
  Trophy, 
  Target, 
  TrendingUp,
  BarChart3,
  Clock,
  Star,
  Flame,
  Activity,
  Moon,
  Sun
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getLearningProfile, getStreakBadge } from '../lib/learningProgress'
import { CircularProgress, BarChart, LineChart, ProgressBar } from '../components/ui/Charts'

interface GameResult {
  id: string
  userId: string
  username: string
  gameType: string
  gameName: string
  difficulty: string
  score: number
  totalQuestions: number
  hasDyslexia: boolean
  completedAt: string
}

interface UserStats {
  totalGames: number
  averageScore: number
  bestScore: number
  gamesPlayed: { [key: string]: number }
  difficultyStats: { [key: string]: number }
  recentGames: GameResult[]
  totalTime: number
  achievements: string[]
}

const ProfilePage: React.FC = () => {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  
  // Debug log
  console.log('ProfilePage - User email:', user?.email)
  
  // Redirect to appropriate dashboard based on user role
  if (user?.email) {
    if (user.email.startsWith('teacher@') || user.email.includes('.teacher@')) {
      console.log('Redirecting to teacher dashboard')
      return <Navigate to="/teacher" replace />
    }
    if (user.email.startsWith('parent@') || user.email.includes('.parent@')) {
      console.log('Redirecting to parent dashboard')
      return <Navigate to="/parent" replace />
    }
    if (user.email === 'admin@dyslexia.com') {
      console.log('Redirecting to admin dashboard')
      return <Navigate to="/admin" replace />
    }
  }
  
  console.log('Staying on profile page for student')
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    averageScore: 0,
    bestScore: 0,
    gamesPlayed: {},
    difficultyStats: {},
    recentGames: [],
    totalTime: 0,
    achievements: []
  })
  const [refreshKey, setRefreshKey] = useState(0)
  const [learningProfile, setLearningProfile] = useState<any>(null)

  useEffect(() => {
    const loadUserStats = () => {
      try {
        // Load learning profile for streak and badges
        if (user?.email) {
          const profile = getLearningProfile(user.email)
          setLearningProfile(profile)
        }
        
        const gameResults: GameResult[] = JSON.parse(localStorage.getItem('gameResults') || '[]')
        
        // Filter results for current user (for now, we'll show all since we don't have proper user IDs)
        const userResults = gameResults
        
        const totalGames = userResults.length
        const averageScore = totalGames > 0 
          ? Math.round(userResults.reduce((sum, result) => sum + (result.score / result.totalQuestions * 100), 0) / totalGames)
          : 0
        
        const bestScore = totalGames > 0
          ? Math.max(...userResults.map(result => (result.score / result.totalQuestions * 100)))
          : 0
        
        // Games played by type
        const gamesPlayed = userResults.reduce((acc, result) => {
          acc[result.gameName] = (acc[result.gameName] || 0) + 1
          return acc
        }, {} as { [key: string]: number })
        
        // Difficulty distribution
        const difficultyStats = userResults.reduce((acc, result) => {
          acc[result.difficulty] = (acc[result.difficulty] || 0) + 1
          return acc
        }, {} as { [key: string]: number })
        
        // Recent games (last 5)
        const recentGames = userResults
          .sort((a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime())
          .slice(0, 5)
        
        // Calculate achievements
        const achievements = []
        if (totalGames >= 1) achievements.push('First Steps')
        if (totalGames >= 5) achievements.push('Getting Started')
        if (totalGames >= 10) achievements.push('Dedicated Player')
        if (averageScore >= 80) achievements.push('High Achiever')
        if (bestScore === 100) achievements.push('Perfect Score')
        if (Object.keys(gamesPlayed).length === 3) achievements.push('Game Explorer')
        
        setStats({
          totalGames,
          averageScore,
          bestScore: Math.round(bestScore),
          gamesPlayed,
          difficultyStats,
          recentGames,
          totalTime: userResults.length * 15, // Estimate 15 minutes per game
          achievements
        })
      } catch (error) {
        console.error('Error loading user stats:', error)
      }
    }

    loadUserStats()
    
    // Refresh every 5 seconds to show new game completions
    const interval = setInterval(loadUserStats, 5000)
    
    return () => clearInterval(interval)
  }, [refreshKey])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const refreshStats = () => {
    setRefreshKey(prev => prev + 1)
  }

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Profile</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="btn btn-ghost btn-sm">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <button 
                onClick={refreshStats}
                className="btn btn-ghost btn-sm"
                title="Refresh Stats"
              >
                <BarChart3 className="w-4 h-4" />
              </button>
              <Link to="/games" className="btn btn-outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Link>
              <button onClick={signOut} className="btn btn-ghost">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Profile Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-24 h-24 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user?.email?.split('@')[0] || 'Player'}'s Profile
          </h1>
          <p className="text-gray-600">
            Track your progress and view your assessment history
          </p>
          <div className="mt-4 inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            Live Stats - Updates automatically
          </div>
        </motion.div>

        {/* Daily Streak Badge */}
        {learningProfile && (
          <motion.div 
            className="text-center mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className={`inline-flex items-center px-6 py-4 bg-gradient-to-r ${getStreakBadge(learningProfile.dailyStreak).color} rounded-2xl shadow-lg`}>
              <Flame className="w-6 h-6 text-white mr-3" />
              <div className="text-white">
                <div className="text-2xl font-bold">{learningProfile.dailyStreak} Day Streak</div>
                <div className="text-sm opacity-90">
                  {getStreakBadge(learningProfile.dailyStreak).emoji} {getStreakBadge(learningProfile.dailyStreak).name}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Overview with Charts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Games Played</h3>
              <Trophy className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalGames}</div>
              <ProgressBar value={stats.totalGames} max={50} color="bg-blue-500" />
            </div>
          </motion.div>

          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Average Score</h3>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
            <CircularProgress 
              value={stats.averageScore} 
              max={100} 
              color="#10B981" 
              label="Average"
              size={100}
            />
          </motion.div>

          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Best Score</h3>
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <CircularProgress 
              value={stats.bestScore} 
              max={100} 
              color="#8B5CF6" 
              label="Best"
              size={100}
            />
          </motion.div>

          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Time Played</h3>
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600 mb-2">
                {Math.floor(stats.totalTime / 60)}m
              </div>
              <div className="text-gray-600">Total Time</div>
              <ProgressBar value={stats.totalTime} max={300} color="bg-orange-500" />
            </div>
          </motion.div>
        </div>

        {/* Learning Progress Charts */}
        {learningProfile && (
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <h3 className="text-lg font-semibold mb-4">Learning Areas Progress</h3>
              <BarChart 
                data={[
                  { label: 'Word Recognition', value: learningProfile.wordRecognition.level, color: 'bg-blue-500' },
                  { label: 'Letter Sequencing', value: learningProfile.letterSequencing.level, color: 'bg-green-500' },
                  { label: 'Reading Comprehension', value: learningProfile.readingComprehension.level, color: 'bg-purple-500' }
                ]}
              />
            </motion.div>
            
            <motion.div 
              className="card p-6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <h3 className="text-lg font-semibold mb-4">Recent Performance</h3>
              <LineChart 
                data={learningProfile.wordRecognition.attempts.slice(-7).map((attempt: any, index: number) => ({
                  label: `${index + 1}`,
                  value: attempt.accuracy * 100
                }))}
                color="#3B82F6"
              />
            </motion.div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Account Information */}
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Account Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Email</div>
                  <div className="font-medium text-gray-900">{user?.email}</div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Member Since</div>
                  <div className="font-medium text-gray-900">
                    {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Award className="w-5 h-5 text-gray-400" />
                <div>
                  <div className="text-sm text-gray-500">Account Type</div>
                  <div className="font-medium text-gray-900">Standard User</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Game Statistics with Charts */}
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Game Statistics
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-700 mb-4">Games Played</h3>
                {Object.keys(stats.gamesPlayed).length > 0 ? (
                  <BarChart 
                    data={Object.entries(stats.gamesPlayed).map(([game, count]) => ({
                      label: game.substring(0, 8),
                      value: count as number,
                      color: 'bg-blue-500'
                    }))}
                    height={120}
                  />
                ) : (
                  <p className="text-gray-500 text-sm">No games played yet</p>
                )}
              </div>
              
              <div>
                <h3 className="font-medium text-gray-700 mb-4">Activity Overview</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <Activity className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <div className="font-semibold text-blue-600">{stats.totalGames}</div>
                    <div className="text-xs text-gray-600">Total Games</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <Star className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="font-semibold text-green-600">{stats.achievements.length}</div>
                    <div className="text-xs text-gray-600">Achievements</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Achievements & Streak Badges */}
          <motion.div 
            className="card p-6"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Achievements & Badges
            </h2>
            
            <div className="space-y-3">
              {/* Streak Badges */}
              {learningProfile && (
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Daily Streak Badges</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { days: 3, emoji: '⭐', name: 'Star' },
                      { days: 21, emoji: '🌟', name: 'Superstar' },
                      { days: 50, emoji: '🏆', name: 'Champion' },
                      { days: 100, emoji: '🏛️', name: 'Hall of Fame' },
                      { days: 150, emoji: '👑', name: 'Golden' }
                    ].map(badge => {
                      const earned = learningProfile.dailyStreak >= badge.days
                      return (
                        <div key={badge.days} className={`p-2 rounded-lg text-center text-sm ${
                          earned ? 'bg-yellow-50 text-yellow-800' : 'bg-gray-50 text-gray-400'
                        }`}>
                          <div className="text-lg mb-1">{badge.emoji}</div>
                          <div className="font-medium">{badge.name}</div>
                          <div className="text-xs">{badge.days} days</div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
              
              {/* Game Achievements */}
              {stats.achievements.length > 0 ? (
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Game Achievements</h3>
                  {stats.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg mb-2">
                      <Star className="w-5 h-5 text-blue-500" />
                      <span className="font-medium text-gray-900">{achievement}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <Award className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500">Play games to earn achievements!</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div 
          className="card p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Recent Activity
          </h2>
          
          {stats.recentGames.length > 0 ? (
            <div className="space-y-4">
              {stats.recentGames.map((game, index) => (
                <div key={game.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Brain className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{game.gameName}</div>
                      <div className="text-sm text-gray-600">{game.difficulty} • {formatDate(game.completedAt)}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-semibold ${getScoreColor((game.score / game.totalQuestions) * 100)}`}>
                      {game.score}/{game.totalQuestions}
                    </div>
                    <div className="text-sm text-gray-500">
                      {Math.round((game.score / game.totalQuestions) * 100)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No Games Played Yet
              </h3>
              <p className="text-gray-600 mb-6">
                Start playing games to see your activity here
              </p>
              <Link to="/games" className="btn btn-primary">
                Play Your First Game
              </Link>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}

export default ProfilePage