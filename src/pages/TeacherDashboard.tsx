import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Brain, ArrowLeft, Users, TrendingUp, Clock, Star, Trophy, Target, Search, Filter, BarChart3, PieChart, Moon, Sun } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import { getLearningProfile, getStreakBadge } from '../lib/learningProgress'
import { CircularProgress, BarChart, DonutChart, LineChart } from '../components/ui/Charts'

interface Student {
  email: string
  name: string
  progress: any
  lastActive: string
  totalGames: number
  averageAccuracy: number
  currentLevel: number
  streak: number
  riskLevel: 'low' | 'medium' | 'high'
}

const TeacherDashboard: React.FC = () => {
  const { user, signOut } = useAuth()
  const { isDark, toggleTheme } = useTheme()
  const [students, setStudents] = useState<Student[]>([])
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'level' | 'accuracy' | 'risk'>('name')
  const [filterBy, setFilterBy] = useState<'all' | 'active' | 'struggling' | 'excellent'>('all')
  const [showStudentDetail, setShowStudentDetail] = useState(false)

  useEffect(() => {
    loadAllStudents()
  }, [])

  useEffect(() => {
    filterAndSortStudents()
  }, [students, searchTerm, sortBy, filterBy])

  const loadAllStudents = () => {
    const allProfiles: Student[] = []
    
    // Get all learning profiles from localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key?.startsWith('learning_profile_') && !key.includes('teacher@') && !key.includes('parent@') && !key.includes('admin@')) {
        const email = key.replace('learning_profile_', '')
        const profile = getLearningProfile(email)
        
        const totalGames = profile.wordRecognition.totalAttempts + profile.letterSequencing.totalAttempts + profile.readingComprehension.totalAttempts
        const averageAccuracy = (profile.wordRecognition.averageAccuracy + profile.letterSequencing.averageAccuracy + profile.readingComprehension.averageAccuracy) / 3
        const currentLevel = Math.max(profile.wordRecognition.level, profile.letterSequencing.level, profile.readingComprehension.level)
        
        // Determine risk level
        let riskLevel: 'low' | 'medium' | 'high' = 'low'
        if (averageAccuracy < 0.5 || profile.dailyStreak === 0) riskLevel = 'high'
        else if (averageAccuracy < 0.7 || profile.dailyStreak < 3) riskLevel = 'medium'
        
        allProfiles.push({
          email,
          name: email.split('@')[0],
          progress: profile,
          lastActive: new Date(profile.lastLoginDate).toLocaleDateString(),
          totalGames,
          averageAccuracy,
          currentLevel,
          streak: profile.dailyStreak,
          riskLevel
        })
      }
    }
    
    setStudents(allProfiles)
  }

  const filterAndSortStudents = () => {
    let filtered = students.filter(student => {
      const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           student.email.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesFilter = (() => {
        switch (filterBy) {
          case 'active': return new Date(student.progress.lastLoginDate).getTime() > Date.now() - 7 * 24 * 60 * 60 * 1000
          case 'struggling': return student.riskLevel === 'high'
          case 'excellent': return student.averageAccuracy >= 0.8
          default: return true
        }
      })()
      
      return matchesSearch && matchesFilter
    })

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name': return a.name.localeCompare(b.name)
        case 'level': return b.currentLevel - a.currentLevel
        case 'accuracy': return b.averageAccuracy - a.averageAccuracy
        case 'risk': 
          const riskOrder = { high: 3, medium: 2, low: 1 }
          return riskOrder[b.riskLevel] - riskOrder[a.riskLevel]
        default: return 0
      }
    })

    setFilteredStudents(filtered)
  }

  const getOverallStats = () => {
    if (students.length === 0) return { 
      totalStudents: 0, avgAccuracy: 0, activeToday: 0, 
      strugglingStudents: 0, excellentStudents: 0, totalGamesPlayed: 0 
    }
    
    const totalStudents = students.length
    const avgAccuracy = students.reduce((sum, s) => sum + s.averageAccuracy, 0) / totalStudents
    const today = new Date().toDateString()
    const activeToday = students.filter(s => s.progress.lastLoginDate === today).length
    const strugglingStudents = students.filter(s => s.riskLevel === 'high').length
    const excellentStudents = students.filter(s => s.averageAccuracy >= 0.8).length
    const totalGamesPlayed = students.reduce((sum, s) => sum + s.totalGames, 0)
    
    return { totalStudents, avgAccuracy, activeToday, strugglingStudents, excellentStudents, totalGamesPlayed }
  }

  const stats = getOverallStats()

  return (
    <div className="min-h-screen gradient-bg">
      <nav className="bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Brain className="w-8 h-8 text-primary-600" />
              <span className="text-xl font-bold text-gray-900">Teacher Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <button onClick={toggleTheme} className="btn btn-ghost btn-sm">
                {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
              <Link to="/games" className="btn btn-outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Games
              </Link>
              <button onClick={signOut} className="btn btn-ghost">Sign Out</button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome, {user?.email?.split(/[.@]/)[0]}!</h1>
          <p className="text-gray-600">Monitor all students' learning progress</p>
        </motion.div>

        {/* Overview Stats with Charts */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Total Students</h3>
              <Users className="w-6 h-6 text-blue-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalStudents}</div>
              <div className="text-gray-600">Enrolled</div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Class Average</h3>
              <TrendingUp className="w-6 h-6 text-green-500" />
            </div>
            <CircularProgress 
              value={stats.avgAccuracy * 100} 
              max={100} 
              color="#10B981" 
              label="Accuracy"
              size={100}
            />
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Games Played</h3>
              <Trophy className="w-6 h-6 text-yellow-500" />
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">{stats.totalGamesPlayed}</div>
              <div className="text-gray-600">Total Games</div>
              <div className="mt-2 text-sm text-gray-500">{stats.activeToday} active today</div>
            </div>
          </div>
          
          <div className="card p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Activity</h3>
              <BarChart3 className="w-6 h-6 text-purple-500" />
            </div>
            <CircularProgress 
              value={stats.activeToday} 
              max={stats.totalStudents} 
              color="#8B5CF6" 
              label="Active Today"
              size={100}
            />
          </div>
        </div>

        {/* Analytics Charts */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Performance Distribution</h3>
            <DonutChart 
              data={[
                { label: 'Excellent (90%+)', value: students.filter(s => s.progress.wordRecognition.averageAccuracy >= 0.9).length, color: '#10B981' },
                { label: 'Good (70-89%)', value: students.filter(s => s.progress.wordRecognition.averageAccuracy >= 0.7 && s.progress.wordRecognition.averageAccuracy < 0.9).length, color: '#F59E0B' },
                { label: 'Needs Help (<70%)', value: students.filter(s => s.progress.wordRecognition.averageAccuracy < 0.7).length, color: '#EF4444' }
              ]}
            />
          </div>
          
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Level Distribution</h3>
            <BarChart 
              data={Array.from({length: 10}, (_, i) => ({
                label: `L${i + 1}`,
                value: students.filter(s => s.progress.wordRecognition.level === i + 1).length,
                color: i < 3 ? 'bg-red-400' : i < 6 ? 'bg-yellow-400' : 'bg-green-400'
              }))}
            />
          </div>
        </div>

        {/* Enhanced Controls */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search students by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="px-3 py-2 border rounded-lg"
              >
                <option value="all">All Students ({students.length})</option>
                <option value="active">Recently Active</option>
                <option value="struggling">Needs Help</option>
                <option value="excellent">High Performers</option>
              </select>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-gray-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border rounded-lg"
                >
                  <option value="name">Sort by Name</option>
                  <option value="risk">Sort by Risk Level</option>
                  <option value="level">Sort by Level</option>
                  <option value="accuracy">Sort by Accuracy</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-blue-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-blue-600">{stats.totalGamesPlayed}</div>
              <div className="text-blue-500">Total Games</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-green-600">{stats.excellentStudents}</div>
              <div className="text-green-500">High Performers</div>
            </div>
            <div className="bg-red-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-red-600">{stats.strugglingStudents}</div>
              <div className="text-red-500">Need Support</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg text-center">
              <div className="font-semibold text-purple-600">{stats.activeToday}</div>
              <div className="text-purple-500">Active Today</div>
            </div>
          </div>
        </div>

        {/* Students List */}
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Students Progress</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                <span>High Performer</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <span>Average</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <span>Needs Support</span>
              </div>
            </div>
          </div>
          
          {filteredStudents.length > 0 ? (
            <div className="space-y-4">
              {filteredStudents.map((student, index) => (
                <motion.div
                  key={student.email}
                  className="p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                        student.riskLevel === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                        student.riskLevel === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                        'bg-gradient-to-r from-green-500 to-green-600'
                      }`}>
                        {student.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="font-semibold text-gray-900">{student.name}</div>
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            student.riskLevel === 'high' ? 'bg-red-100 text-red-700' :
                            student.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {student.riskLevel === 'high' ? '⚠️ Needs Support' :
                             student.riskLevel === 'medium' ? '📈 Improving' : '✅ On Track'}
                          </div>
                        </div>
                        <div className="text-sm text-gray-600">{student.email}</div>
                        <div className="text-xs text-gray-500">Last active: {student.lastActive} • {student.totalGames} total games</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      {/* Level */}
                      <div className="text-center">
                        <div className="text-lg font-bold text-blue-600">Lv.{student.currentLevel}</div>
                        <div className="text-xs text-gray-500">Max Level</div>
                      </div>
                      
                      {/* Accuracy */}
                      <div className="text-center">
                        <div className={`text-lg font-bold ${
                          student.averageAccuracy >= 0.8 ? 'text-green-600' :
                          student.averageAccuracy >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {(student.averageAccuracy * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-gray-500">Avg Accuracy</div>
                      </div>
                      
                      {/* View Details Button */}
                      <button
                        onClick={() => {
                          setSelectedStudent(student)
                          setShowStudentDetail(true)
                        }}
                        className="btn btn-outline btn-sm"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Students Found</h3>
              <p className="text-gray-600">
                {searchTerm ? 'Try adjusting your search terms' : 'No students have used the platform yet'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Student Detail Modal */}
      {showStudentDetail && selectedStudent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center space-x-4">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${
                    selectedStudent.riskLevel === 'high' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                    selectedStudent.riskLevel === 'medium' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
                    'bg-gradient-to-r from-green-500 to-green-600'
                  }`}>
                    {selectedStudent.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedStudent.name}'s Progress</h2>
                    <p className="text-gray-600">{selectedStudent.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStudentDetail(false)}
                  className="btn btn-ghost"
                >
                  ✕
                </button>
              </div>

              {/* Student Stats Grid */}
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.currentLevel}</div>
                  <div className="text-gray-600">Max Level</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{(selectedStudent.averageAccuracy * 100).toFixed(0)}%</div>
                  <div className="text-gray-600">Avg Accuracy</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">{selectedStudent.totalGames}</div>
                  <div className="text-gray-600">Total Games</div>
                </div>
                <div className="card p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">{selectedStudent.lastActive}</div>
                  <div className="text-gray-600">Last Active</div>
                </div>
              </div>

              {/* Detailed Progress Charts */}
              <div className="grid lg:grid-cols-2 gap-6 mb-6">
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Learning Areas Progress</h3>
                  <BarChart 
                    data={[
                      { label: 'Word Recognition', value: selectedStudent.progress.wordRecognition.level, color: 'bg-blue-500' },
                      { label: 'Letter Sequencing', value: selectedStudent.progress.letterSequencing.level, color: 'bg-green-500' },
                      { label: 'Reading Comprehension', value: selectedStudent.progress.readingComprehension.level, color: 'bg-purple-500' }
                    ]}
                  />
                </div>
                
                <div className="card p-6">
                  <h3 className="text-lg font-semibold mb-4">Accuracy by Subject</h3>
                  <DonutChart 
                    data={[
                      { label: 'Word Recognition', value: Math.round(selectedStudent.progress.wordRecognition.averageAccuracy * 100), color: '#3B82F6' },
                      { label: 'Letter Sequencing', value: Math.round(selectedStudent.progress.letterSequencing.averageAccuracy * 100), color: '#10B981' },
                      { label: 'Reading Comprehension', value: Math.round(selectedStudent.progress.readingComprehension.averageAccuracy * 100), color: '#8B5CF6' }
                    ]}
                  />
                </div>
              </div>

              {/* Recent Performance Trend */}
              <div className="card p-6 mb-6">
                <h3 className="text-lg font-semibold mb-4">Recent Performance Trend</h3>
                <LineChart 
                  data={selectedStudent.progress.wordRecognition.attempts.slice(-10).map((attempt: any, index: number) => ({
                    label: `Game ${index + 1}`,
                    value: attempt.accuracy * 100
                  }))}
                  color="#3B82F6"
                />
              </div>

              {/* Detailed Learning Areas */}
              <div className="card p-6">
                <h3 className="text-lg font-semibold mb-4">Detailed Progress by Area</h3>
                <div className="space-y-4">
                  {Object.entries(selectedStudent.progress).filter(([key]) => 
                    ['wordRecognition', 'letterSequencing', 'readingComprehension'].includes(key)
                  ).map(([gameType, progress]: [string, any]) => (
                    <div key={gameType} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <h4 className="font-medium capitalize">{gameType.replace(/([A-Z])/g, ' $1')}</h4>
                        <div className="flex items-center space-x-4">
                          <span className="text-sm text-gray-600">Level {progress.level}</span>
                          <span className="text-sm text-gray-600">{progress.totalAttempts} attempts</span>
                          <span className={`font-semibold ${
                            progress.averageAccuracy >= 0.8 ? 'text-green-600' :
                            progress.averageAccuracy >= 0.6 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {(progress.averageAccuracy * 100).toFixed(0)}% accuracy
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            progress.averageAccuracy >= 0.8 ? 'bg-green-500' :
                            progress.averageAccuracy >= 0.6 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${progress.averageAccuracy * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="card p-6 mt-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-3">
                  {selectedStudent.riskLevel === 'high' && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="font-medium text-red-800">⚠️ Immediate Attention Needed</div>
                      <div className="text-red-700 text-sm mt-1">
                        Student shows low engagement and accuracy. Consider one-on-one support or modified learning approach.
                      </div>
                    </div>
                  )}
                  {selectedStudent.riskLevel === 'medium' && (
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <div className="font-medium text-yellow-800">📈 Monitor Progress</div>
                      <div className="text-yellow-700 text-sm mt-1">
                        Student is improving but may benefit from additional practice and encouragement.
                      </div>
                    </div>
                  )}
                  {selectedStudent.riskLevel === 'low' && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="font-medium text-green-800">✅ Excellent Progress</div>
                      <div className="text-green-700 text-sm mt-1">
                        Student is performing well. Consider advanced challenges to maintain engagement.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TeacherDashboard