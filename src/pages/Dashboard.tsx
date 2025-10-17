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
  Layers
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { gameConfigs } from '../lib/gameConfig'

const Dashboard: React.FC = () => {
  const { user, signOut, isAdmin } = useAuth()

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
    BookOpen, Brain, Shuffle, Eye, Zap, Volume2, Search
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
  const gamesByCategory = {
    reading: games.filter(g => g.category === 'reading'),
    visual: games.filter(g => g.category === 'visual'),
    auditory: games.filter(g => g.category === 'auditory'),
    cognitive: games.filter(g => g.category === 'cognitive')
  }

  const categoryInfo = {
    reading: { title: '📚 Reading & Language', color: 'from-blue-500 to-purple-600', emoji: '📖' },
    visual: { title: '👁️ Visual Processing', color: 'from-orange-500 to-red-600', emoji: '🔍' },
    auditory: { title: '🎧 Auditory Skills', color: 'from-indigo-500 to-blue-600', emoji: '🎵' },
    cognitive: { title: '🧠 Cognitive Skills', color: 'from-green-500 to-teal-600', emoji: '⚡' }
  }

  const howItWorks = [
    {
      step: '1',
      title: 'Choose Your Game',
      description: 'Select from our three scientifically designed assessment games',
      icon: Target
    },
    {
      step: '2',
      title: 'Complete Assessment',
      description: 'Play through 10 rounds at your own pace with immediate feedback',
      icon: Star
    },
    {
      step: '3',
      title: 'View Results',
      description: 'Get detailed analysis and personalized recommendations',
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
              <span className="text-xl font-bold text-gray-900">DysLexia Support</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600 hidden sm:block">Welcome, {user?.email}</span>
              {isAdmin && (
                <Link to="/admin" className="btn btn-outline btn-sm">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Admin
                </Link>
              )}
              <Link to="/profile" className="btn btn-ghost btn-sm">
                <User className="w-4 h-4 mr-2" />
                Profile
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
            🎮 Choose Your Assessment Adventure!
          </motion.h1>
          <motion.p 
            className="text-xl text-gray-600 max-w-4xl mx-auto mb-8 leading-relaxed"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Discover your learning strengths through our scientifically-designed interactive games. 
            Each assessment is crafted to be engaging, informative, and tailored to your skill level.
          </motion.p>
          <motion.div 
            className="flex flex-wrap justify-center gap-4 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 rounded-full text-sm font-medium">
              ✨ Instant Feedback
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded-full text-sm font-medium">
              📊 Detailed Analytics
            </div>
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full text-sm font-medium">
              🎯 Multiple Difficulty Levels
            </div>
          </motion.div>
        </motion.div>

        {/* Games by Category */}
        <div className="space-y-12 mb-16">
          {Object.entries(gamesByCategory).map(([category, categoryGames], categoryIndex) => {
            if (categoryGames.length === 0) return null
            const info = categoryInfo[category as keyof typeof categoryInfo]
            
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
                      <p className="text-gray-600">{categoryGames.length} assessment{categoryGames.length > 1 ? 's' : ''} available</p>
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
                          Start Assessment
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
            How Assessment Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center group">
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300">
                  <step.icon className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {step.step}
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
              🎯 Scientifically Validated
            </h3>
            <p className="text-gray-600">
              Our assessments are based on proven research and validated methodologies 
              used by educational professionals worldwide.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              📊 Detailed Analytics
            </h3>
            <p className="text-gray-600">
              Get comprehensive reports with personalized recommendations and 
              insights into reading patterns and potential areas for improvement.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🎮 Engaging Experience
            </h3>
            <p className="text-gray-600">
              Interactive games make assessment enjoyable while maintaining 
              scientific accuracy and reliability.
            </p>
          </div>
          
          <div className="card p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              🔒 Privacy Protected
            </h3>
            <p className="text-gray-600">
              Your data is secure and private. We follow strict privacy guidelines 
              and never share personal information.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard