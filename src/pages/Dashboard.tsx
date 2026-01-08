import React from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  BookOpen, 
  Shuffle, 
  Target, 
  Star, 
  Trophy, 
  Play,
  User,
  LogOut,
  BarChart3,
  Eye,
  Volume2,
  Zap,
  Puzzle,
  Search,
  Layers,
  GraduationCap,
  Users,
  Moon,
  Sun,
  RefreshCw
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { gameConfigs } from '../lib/gameConfig'
import { getAssessment } from '../services/assessmentService'
import { getDashboardStats, type DashboardStats } from '../services/dashboardService'
import { subscribeToNewScores } from '../lib/realtime'
import { testSupabaseConnection } from '../lib/testSupabase'
import { subscribeToGameResults } from '../lib/localStorageEvents'

const Dashboard: React.FC = () => {
  const { user, signOut, isAdmin, isTeacher, isParent } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [hasAssessment, setHasAssessment] = React.useState(false)
  const [dashboardStats, setDashboardStats] = React.useState<DashboardStats | null>(null)
  const [statsLoading, setStatsLoading] = React.useState(true)

  React.useEffect(() => {
    if (user?.id) {
      // Load assessment data
      getAssessment(user.id).then(assessment => {
        setHasAssessment(!!assessment && assessment.totalAssessments > 0)
      })
      
      // Load dashboard statistics
      const loadStats = async () => {
        setStatsLoading(true)
        try {
          // Test Supabase connection first
          const isConnected = await testSupabaseConnection()
          
          if (isConnected) {
            const stats = await getDashboardStats(user.id)
            setDashboardStats(stats)
          } else {
            // Fallback to localStorage data
            const localResults = JSON.parse(localStorage.getItem('gameResults') || '[]')
            const userResults = localResults.filter((r: any) => r.userId === user.id)
            
            const fallbackStats: DashboardStats = {
              totalGamesPlayed: userResults.length,
              averageScore: userResults.length > 0 ? userResults.reduce((sum: number, r: any) => sum + (r.score / r.totalQuestions * 100), 0) / userResults.length : 0,
              bestScore: userResults.length > 0 ? Math.max(...userResults.map((r: any) => r.score / r.totalQuestions * 100)) : 0,
              totalTimeMinutes: Math.round(userResults.reduce((sum: number, r: any) => sum + (r.durationSeconds || 0), 0) / 60),
              recentScores: userResults.slice(-10).map((r: any) => ({
                id: r.id,
                game_name: r.gameType,
                difficulty_level: r.difficulty,
                accuracy: r.score / r.totalQuestions,
                created_at: r.completedAt
              })),
              gamesPlayedToday: userResults.filter((r: any) => new Date(r.completedAt).toDateString() === new Date().toDateString()).length,
              improvementTrend: 0
            }
            
            setDashboardStats(fallbackStats)
            console.log('Using localStorage fallback data')
          }
        } catch (error) {
          console.error('Failed to load dashboard stats:', error)
        } finally {
          setStatsLoading(false)
        }
      }
      
      loadStats()
      
      // Subscribe to real-time score updates
      let unsubscribe: (() => void) | null = null
      
      try {
        unsubscribe = subscribeToNewScores((newScore) => {
          if (newScore.user_id === user.id) {
            loadStats()
          }
        })
      } catch (error) {
        console.log('Real-time subscription failed, using localStorage polling')
        
        const pollInterval = setInterval(() => {
          const currentResults = JSON.parse(localStorage.getItem('gameResults') || '[]')
          const userResults = currentResults.filter((r: any) => r.userId === user.id)
          
          if (userResults.length !== (dashboardStats?.totalGamesPlayed || 0)) {
            loadStats()
          }
        }, 2000)
        
        unsubscribe = () => clearInterval(pollInterval)
      }
      
      // Also subscribe to localStorage events
      const localStorageUnsubscribe = subscribeToGameResults(() => {
        loadStats()
      })
      
      const originalUnsubscribe = unsubscribe
      unsubscribe = () => {
        if (originalUnsubscribe) originalUnsubscribe()
        localStorageUnsubscribe()
      }
      
      return () => {
        if (unsubscribe) unsubscribe()
      }
    }
  }, [user?.id])

  // Redirect admin users to admin dashboard
  React.useEffect(() => {
    if (isAdmin) {
      window.location.href = '/admin'
    }
  }, [isAdmin])

  // Don't render games for admin users
  if (isAdmin) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center">
        <div className="card p-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Admin Access</h2>
          <p className="text-gray-600 mb-6">Admins cannot play games. Redirecting to admin dashboard...</p>
          <Link to="/admin" className="btn btn-primary">
            Go to Admin Dashboard
          </Link>
        </div>
      </div>
    )
  }



  const iconMap = {
    BookOpen, Brain, Shuffle, Eye, Zap, Volume2, Search, GraduationCap
  }

  const games = Object.values(gameConfigs).map(config => ({
    ...config,
    icon: iconMap[config.icon as keyof typeof iconMap] || BookOpen,
    difficulty: `${config.levels[0].difficulty} to ${config.levels[config.levels.length - 1].difficulty}`,
    duration: config.estimatedDuration,
    color: config.levels[0].color,
    bgColor: config.levels[0].bgColor,
    levelCount: config.levels.length
  }))

  // Organize games by category for better visual layout
  const gamesByCategory = games.reduce((acc, game) => {
    if (!acc[game.category]) {
      acc[game.category] = []
    }
    acc[game.category].push(game)
    return acc
  }, {} as Record<string, typeof games>)

  const categoryInfo = {
    learning: { title: '🎓 Learning Games', color: 'from-emerald-500 to-teal-600', emoji: '📚' },
    reading: { title: '📖 Reading & Language', color: 'from-blue-500 to-indigo-600', emoji: '📖' },
    visual: { title: '👁️ Visual Processing', color: 'from-purple-500 to-pink-600', emoji: '👁️' },
    auditory: { title: '🔊 Auditory Skills', color: 'from-green-500 to-teal-600', emoji: '🔊' },
    cognitive: { title: '🧠 Cognitive Skills', color: 'from-orange-500 to-red-600', emoji: '🧠' }
  }

  const howItWorks = [
    {
      step: '1',
      title: 'Choose Your Activity',
      description: 'Select from our adaptive learning games designed to build skills',
      icon: Target
    },
    {
      step: '2',
      title: 'Practice & Learn',
      description: 'Play at your own pace with hints, voice support, and encouragement',
      icon: Star
    },
    {
      step: '3',
      title: 'Track Progress',
      description: 'See your improvement and unlock achievements as you learn',
      icon: Trophy
    }
  ]

  return (
    <div className="min-h-screen gradient-bg">
      {/* Navigation */}
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Dyslyze</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">Welcome, {user?.email?.split(/[.@]/)[0]}</span>
              <button onClick={toggleTheme} className="btn btn-ghost btn-sm">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
              {(isTeacher || isAdmin) && (
                <Link to="/teacher" className="btn btn-outline btn-sm">
                  <Users className="w-4 h-4 mr-2" />
                  Teacher
                </Link>
              )}
              {(isParent || isAdmin) && (
                <Link to="/parent" className="btn btn-outline btn-sm">
                  <User className="w-4 h-4 mr-2" />
                  Parent
                </Link>
              )}
              <Link to="/profile" className="btn btn-ghost btn-sm relative">
                <User className="w-4 h-4 mr-2" />
                Profile
                {hasAssessment && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full flex items-center justify-center">
                    <Brain className="w-2 h-2 text-white" />
                  </div>
                )}
              </Link>

              <button onClick={signOut} className="btn btn-ghost btn-sm">
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
          >
            🎓 Start Your Learning Journey!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Build reading confidence through personalized learning games that adapt to your pace. 
            Each activity provides supportive practice with hints, voice guidance, and encouraging feedback.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-medium">
              🎯 Adaptive Learning
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
              🔊 Voice Support
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
              💡 Helpful Hints
            </div>
          </motion.div>
        </motion.div>

        {/* Dashboard Statistics */}
        {statsLoading ? (
          <motion.div 
            className="mb-16 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-white rounded-lg shadow-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
              <span className="text-gray-600">Loading your progress...</span>
            </div>
          </motion.div>
        ) : dashboardStats && dashboardStats.totalGamesPlayed > 0 && (
          <motion.div 
            className="mb-16"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-4 mb-2">
                <h2 className="text-3xl font-bold text-gray-900">📊 Your Progress</h2>
                <button 
                  onClick={() => window.location.reload()}
                  className="btn btn-ghost btn-sm"
                  title="Refresh Data"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
              <p className="text-gray-600">Track your learning journey with real-time statistics</p>
            </div>
            
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-0"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Games Played</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalGamesPlayed}</p>
                    {dashboardStats.gamesPlayedToday > 0 && (
                      <p className="text-xs text-blue-600">+{dashboardStats.gamesPlayedToday} today</p>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-0"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(dashboardStats.averageScore)}%</p>
                    {dashboardStats.improvementTrend !== 0 && (
                      <p className={`text-xs ${
                        dashboardStats.improvementTrend > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {dashboardStats.improvementTrend > 0 ? '+' : ''}{Math.round(dashboardStats.improvementTrend)}% trend
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50 border-0"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(dashboardStats.bestScore)}%</p>
                    <p className="text-xs text-yellow-600">Personal best</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-0"
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center mr-4 shadow-lg">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 font-medium">Time Played</p>
                    <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalTimeMinutes}m</p>
                    <p className="text-xs text-purple-600">Total practice</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Recent Activity */}
            {dashboardStats.recentScores.length > 0 && (
              <motion.div 
                className="card p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dashboardStats.recentScores.slice(0, 6).map((score, index) => (
                    <div key={score.id || index} className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-medium text-gray-900 capitalize">
                          {score.game_name?.replace(/_/g, ' ') || 'Game'}
                        </div>
                        <div className={`text-sm font-semibold ${
                          (score.accuracy * 100) >= 80 ? 'text-green-600' :
                          (score.accuracy * 100) >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {Math.round(score.accuracy * 100)}%
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {score.difficulty_level} • {new Date(score.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </motion.div>
        )}

        {/* Games by Category */}
        <div className="space-y-12 mb-16">
          {Object.entries(gamesByCategory).map(([category, categoryGames], categoryIndex) => {
            if (categoryGames.length === 0) return null
            const info = categoryInfo[category as keyof typeof categoryInfo] || {
              title: `${category.charAt(0).toUpperCase() + category.slice(1)} Games`,
              color: 'from-gray-500 to-gray-600',
              emoji: '🎮'
            }
            
            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
              >
                <div className="mb-8">
                  <motion.div 
                    className="flex items-center mb-4"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: categoryIndex * 0.2 + 0.3 }}
                  >
                    <div className={`w-12 h-12 bg-gradient-to-r ${info.color} rounded-xl flex items-center justify-center mr-4 shadow-lg`}>
                      <span className="text-2xl">{info.emoji}</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">{info.title}</h2>
                      <p className="text-gray-600">{categoryGames.length} learning game{categoryGames.length > 1 ? 's' : ''} available</p>
                    </div>
                  </motion.div>
                </div>
                
                <div className={`grid gap-6 ${
                  categoryGames.length === 1 ? 'md:grid-cols-1 max-w-md mx-auto' :
                  categoryGames.length === 2 ? 'md:grid-cols-2 max-w-4xl mx-auto' :
                  categoryGames.length === 3 ? 'md:grid-cols-2 lg:grid-cols-3' :
                  'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'
                }`}>
                  {categoryGames.map((game, gameIndex) => (
                    <motion.div
                      key={game.id}
                      className={`card card-hover p-6 bg-gradient-to-br ${game.bgColor} border-0 relative overflow-hidden group h-full`}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ 
                        duration: 0.5, 
                        delay: categoryIndex * 0.2 + gameIndex * 0.1 + 0.4,
                        type: "spring",
                        stiffness: 100
                      }}
                      whileHover={{ y: -8, scale: 1.02 }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      <div className="relative z-10 flex flex-col h-full">
                        <div className={`w-16 h-16 bg-gradient-to-r ${game.color} rounded-2xl mb-4 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                          <game.icon className="w-8 h-8 text-white" />
                        </div>
                        
                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                          {game.title}
                        </h3>
                        
                        <p className="text-gray-600 mb-4 leading-relaxed text-sm flex-grow">
                          {game.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center text-xs text-gray-500">
                            <Target className="w-3 h-3 mr-2" />
                            {game.difficulty}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Star className="w-3 h-3 mr-2" />
                            {game.duration}
                          </div>
                          <div className="flex items-center text-xs text-gray-500">
                            <Layers className="w-3 h-3 mr-2" />
                            {game.levelCount} Levels
                          </div>
                        </div>
                        
                        <Link 
                          to={`/game/${game.id}`}
                          className={`btn w-full bg-gradient-to-r ${game.color} text-white hover:shadow-lg transform transition-all duration-300 group-hover:scale-105 border-0 mt-auto`}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Start Learning
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* How It Works Section */}
        <motion.div 
          className="card p-8 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h2 className="text-3xl font-bold text-center mb-8 gradient-text">
            How Learning Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group relative">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 relative">
                  <step.icon className="w-8 h-8 text-white" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="font-semibold text-lg mb-2 text-gray-800">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div 
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🎯 Personalized Learning
            </h3>
            <p className="text-gray-600">
              Our games adapt to your skill level, providing the right challenge 
              and support to help you build confidence and improve reading skills.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📈 Progress Tracking
            </h3>
            <p className="text-gray-600">
              Watch your skills grow with progress tracking, achievement badges, 
              and encouraging feedback that celebrates every step forward.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🎮 Fun & Supportive
            </h3>
            <p className="text-gray-600">
              Learning feels like play with engaging games, helpful hints, 
              and voice guidance that makes practice enjoyable and stress-free.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔒 Safe Learning Space
            </h3>
            <p className="text-gray-600">
              Practice in a judgment-free environment where mistakes are part of learning. 
              Your progress is private and secure.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard