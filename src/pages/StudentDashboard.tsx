import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Star, TrendingUp, Clock, Target, BookOpen, Brain, AlertTriangle, CheckCircle, RefreshCw } from "lucide-react";
import { getRecentScores } from "../services/gamesService";
import { getRecommendations } from "../services/recommendationService";
import { getAssessment, type NeurologicalAssessment } from "../services/assessmentService";
import { useAuth } from "../contexts/AuthContext";
import { subscribeToNewScores } from "../lib/realtime";

export default function StudentDashboard() {
  const { user } = useAuth();
  const [scores, setScores] = useState<any[]>([]);
  const [recs, setRecs] = useState<any[]>([]);
  const [assessment, setAssessment] = useState<NeurologicalAssessment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [s, r, a] = await Promise.all([
          getRecentScores(30, user?.id), 
          getRecommendations(10, user?.id),
          user?.id ? getAssessment(user.id) : null
        ]);
        setScores(s ?? []);
        setRecs(r ?? []);
        setAssessment(a);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();

    // Refresh data every 10 seconds to show new scores
    const interval = setInterval(load, 10000);

    // Subscribe to real-time score updates
    const unsubscribe = subscribeToNewScores((newScore) => {
      if (newScore.user_id === user?.id) {
        setScores(prev => [newScore, ...prev]);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, [user?.id]);

  // Calculate real-time KPIs from backend data
  const gamesPlayed = scores.length;
  const avgAccuracy = scores.length > 0 ? scores.reduce((sum, s) => sum + (s.score || 0), 0) / scores.length : 0;
  const bestScore = scores.length > 0 ? Math.max(...scores.map(s => s.score || 0)) : 0;
  const totalTimePlayed = scores.reduce((sum, s) => sum + (s.time_taken || 0), 0); // in milliseconds
  const totalTimeMinutes = Math.round(totalTimePlayed / 60000); // convert to minutes
  const recentImprovement = scores.length >= 2 ? (scores[0]?.score || 0) - (scores[scores.length - 1]?.score || 0) : 0;

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-6xl mx-auto">
        <motion.div 
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-bold text-gray-900">Welcome back, {user?.email?.split('@')[0]}! 👋</h1>
            <button 
              onClick={() => window.location.reload()} 
              className="btn btn-ghost btn-sm"
              title="Refresh Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-gray-600">Track your learning progress and see how you're improving</p>
        </motion.div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid md:grid-cols-4 gap-6 mb-8">
              <motion.div 
                className="card p-6 bg-gradient-to-r from-blue-50 to-indigo-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mr-4">
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Games Played</p>
                    <p className="text-2xl font-bold text-gray-900">{gamesPlayed}</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-green-50 to-emerald-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mr-4">
                    <Target className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Score</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(avgAccuracy)}%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-yellow-50 to-orange-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-yellow-500 rounded-lg flex items-center justify-center mr-4">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Best Score</p>
                    <p className="text-2xl font-bold text-gray-900">{Math.round(bestScore)}%</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                className="card p-6 bg-gradient-to-r from-purple-50 to-pink-50"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mr-4">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Time Played</p>
                    <p className="text-2xl font-bold text-gray-900">{totalTimeMinutes}m</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Neurological Assessment Card */}
            {assessment && (
              <motion.div 
                className="card p-6 mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  Neurological Assessment
                </h2>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div className={`p-4 rounded-lg flex items-center ${
                    assessment.assessment.overallRisk === 'high_risk' ? 'bg-red-100 text-red-700' :
                    assessment.assessment.overallRisk === 'moderate_risk' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {assessment.assessment.overallRisk === 'high_risk' ? <AlertTriangle className="w-5 h-5 mr-2" /> :
                     assessment.assessment.overallRisk === 'moderate_risk' ? <Brain className="w-5 h-5 mr-2" /> :
                     <CheckCircle className="w-5 h-5 mr-2" />}
                    <div>
                      <div className="font-semibold">
                        {assessment.assessment.overallRisk.replace('_risk', '').replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} Risk
                      </div>
                      <div className="text-sm opacity-80">Current Level</div>
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-100 text-blue-700 rounded-lg">
                    <div className="font-semibold">{assessment.indicators.length} Indicators</div>
                    <div className="text-sm opacity-80">Patterns Detected</div>
                  </div>
                  
                  <div className={`p-4 rounded-lg ${
                    assessment.assessment.needsProfessionalAssessment ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'
                  }`}>
                    <div className="font-semibold">
                      {assessment.assessment.needsProfessionalAssessment ? 'Assessment Recommended' : 'Continue Practice'}
                    </div>
                    <div className="text-sm opacity-80">Next Step</div>
                  </div>
                </div>
                
                {assessment.indicators.length > 0 && (
                  <div className="mt-4">
                    <h3 className="font-semibold mb-2">Detected Patterns:</h3>
                    <div className="flex flex-wrap gap-2">
                      {assessment.indicators.map((indicator, index) => (
                        <span key={index} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                          {indicator.name.replace(/_/g, ' ')} ({indicator.frequency}x)
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Recommendations */}
              <motion.div 
                className="card p-6"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Star className="w-5 h-5 mr-2 text-yellow-500" />
                  Recommended for You
                </h2>
                {recs.length === 0 ? (
                  <div className="text-center py-8">
                    <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Play a few games to get personalized recommendations!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recs.slice(0, 5).map((r, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-900">{r}</div>
                        <div className="text-sm text-gray-600">
                          Recommended based on your performance patterns
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Recent Activity */}
              <motion.div 
                className="card p-6"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="w-5 h-5 mr-2 text-blue-500" />
                  Recent Activity
                </h2>
                {scores.length === 0 ? (
                  <div className="text-center py-8">
                    <Trophy className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">Start playing games to see your progress here!</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {scores.slice(0, 5).map((s) => (
                      <div key={s.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="font-medium text-gray-900">{s.game || 'Unknown Game'}</div>
                          <div className="text-sm text-gray-600">
                            {s.difficulty || 'Medium'} • {Math.round(s.score || 0)}% score
                          </div>
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(s.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            </div>

            {/* Progress Chart */}
            {scores.length > 0 && (
              <motion.div 
                className="card p-6 mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-xl font-bold text-gray-900 mb-4">Progress Over Time</h2>
                <div className="flex items-end space-x-2 h-32">
                  {scores.slice(-10).map((s, index) => (
                    <div key={s.id} className="flex-1 flex flex-col items-center">
                      <div 
                        className="w-full bg-gradient-to-t from-primary-500 to-primary-300 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-400" 
                        style={{ height: `${Math.max((s.score || 0) * 0.8, 5)}%` }}
                        title={`${s.game || 'Game'}: ${Math.round(s.score || 0)}%`}
                      />
                      <div className="text-xs text-gray-500 mt-2">
                        {new Date(s.created_at).getDate()}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </div>
  );
}