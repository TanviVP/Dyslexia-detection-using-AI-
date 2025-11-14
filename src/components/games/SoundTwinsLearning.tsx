import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Star, Trophy, Lightbulb, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  currentPair: { sound1: string; sound2: string; areSame: boolean }
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  level: number
}

const SoundTwinsLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    currentPair: { sound1: '', sound2: '', areSame: false },
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    level: 1
  })

  const soundPairs = [
    { sound1: 'pen', sound2: 'pen', areSame: true },
    { sound1: 'cat', sound2: 'cat', areSame: true },
    { sound1: 'pen', sound2: 'ben', areSame: false },
    { sound1: 'cat', sound2: 'bat', areSame: false },
    { sound1: 'ship', sound2: 'chip', areSame: false },
    { sound1: 'thin', sound2: 'fin', areSame: false }
  ]

  const maxRounds = 6

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'wordRecognition')
    const randomPair = soundPairs[Math.floor(Math.random() * soundPairs.length)]
    
    setGameState(prev => ({
      ...prev,
      currentPair: randomPair,
      feedback: '',
      showHint: false,
      level: difficulty.level
    }))
  }

  const playSequence = () => {
    speakText(gameState.currentPair.sound1, 0.7)
    setTimeout(() => {
      speakText(gameState.currentPair.sound2, 0.7)
    }, 1500)
  }

  const handleAnswer = (userAnswer: boolean) => {
    const isCorrect = userAnswer === gameState.currentPair.areSame
    const accuracy = isCorrect ? 1 : 0
    
    if (user) {
      updateGameProgress(user.email, 'wordRecognition', {
        accuracy,
        reactionTime: 1000,
        difficulty: gameState.level,
        timestamp: Date.now()
      })
    }

    setGameState(prev => ({
      ...prev,
      score: prev.score + (isCorrect ? 1 : 0),
      feedback: getEncouragingMessage(accuracy, true)
    }))

    setTimeout(() => {
      if (gameState.round >= maxRounds) {
        setGameState(prev => ({ ...prev, gameOver: true }))
      } else {
        setGameState(prev => ({ ...prev, round: prev.round + 1 }))
        generateRound()
      }
    }, 2000)
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, showHint: true }))
    speakText(`Listen carefully. First word: ${gameState.currentPair.sound1}. Second word: ${gameState.currentPair.sound2}. Are they the same?`)
  }

  const resetGame = () => {
    setGameState({
      currentPair: { sound1: '', sound2: '', areSame: false },
      score: 0,
      round: 1,
      gameOver: false,
      feedback: '',
      showHint: false,
      level: 1
    })
    generateRound()
  }

  useEffect(() => {
    generateRound()
  }, [user])

  useEffect(() => {
    if (gameState.currentPair.sound1 && !gameState.feedback) {
      setTimeout(() => playSequence(), 500)
    }
  }, [gameState.currentPair])

  if (gameState.gameOver) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div className="card p-8 text-center max-w-md w-full">
          <Volume2 className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Sound Learning Complete!</h2>
          <p className="text-gray-600 mb-6">Score: {gameState.score}/{maxRounds} • Level: {gameState.level}</p>
          <button onClick={resetGame} className="btn btn-primary w-full">Continue Learning</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-2xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Sound Twins Learning</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="font-semibold">Level {gameState.level}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-semibold">{gameState.score}/{maxRounds}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-2">Round {gameState.round} of {maxRounds}</p>
            <p className="text-lg font-semibold text-primary-600">Listen and decide: Same or Different?</p>
          </div>
        </div>

        <div className="card p-8 mb-6">
          <div className="text-center">
            <div className="flex justify-center items-center space-x-8 mb-8">
              <div className="bg-blue-50 rounded-lg p-6 min-w-[120px]">
                <Volume2 className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{gameState.currentPair.sound1}</div>
              </div>
              
              <div className="text-2xl font-bold text-gray-400">vs</div>
              
              <div className="bg-purple-50 rounded-lg p-6 min-w-[120px]">
                <Volume2 className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{gameState.currentPair.sound2}</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4 mb-6">
              <button onClick={playSequence} className="btn btn-outline">
                <RotateCcw className="w-4 h-4 mr-2" />
                Play Again
              </button>
              <button onClick={showHint} className="btn btn-ghost">
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-2 gap-6">
            <motion.button
              onClick={() => handleAnswer(true)}
              className="btn btn-success btn-lg h-20 text-xl"
              whileHover={{ scale: 1.02 }}
              disabled={!!gameState.feedback}
            >
              Same
            </motion.button>
            
            <motion.button
              onClick={() => handleAnswer(false)}
              className="btn btn-danger btn-lg h-20 text-xl"
              whileHover={{ scale: 1.02 }}
              disabled={!!gameState.feedback}
            >
              Different
            </motion.button>
          </div>
          
          {gameState.showHint && (
            <motion.div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
              💡 Listen to the sounds carefully. Focus on how each word begins and ends.
            </motion.div>
          )}
          
          {gameState.feedback && (
            <motion.div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">
              {gameState.feedback}
              <div className="text-sm mt-2">
                The sounds were: {gameState.currentPair.areSame ? 'Same' : 'Different'}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SoundTwinsLearning