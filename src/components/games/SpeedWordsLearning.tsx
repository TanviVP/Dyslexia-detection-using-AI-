import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Zap, Star, Trophy, Volume2, Lightbulb } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  images: { name: string; emoji: string; id: number }[]
  selectedItems: number[]
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHints: boolean
  level: number
}

const SpeedWordsLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    images: [],
    selectedItems: [],
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHints: false,
    level: 1
  })

  const imageItems = [
    { name: 'cat', emoji: '🐱' }, { name: 'dog', emoji: '🐶' }, { name: 'ball', emoji: '⚽' },
    { name: 'tree', emoji: '🌳' }, { name: 'car', emoji: '🚗' }, { name: 'house', emoji: '🏠' },
    { name: 'sun', emoji: '☀️' }, { name: 'moon', emoji: '🌙' }, { name: 'star', emoji: '⭐' },
    { name: 'fish', emoji: '🐟' }, { name: 'bird', emoji: '🐦' }, { name: 'flower', emoji: '🌸' }
  ]

  const maxRounds = 6

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'wordRecognition')
    const gridSize = Math.max(3, Math.min(9, 3 + difficulty.level))
    const shuffled = [...imageItems].sort(() => Math.random() - 0.5)
    const roundImages = shuffled.slice(0, gridSize).map((item, index) => ({
      ...item,
      id: index
    }))

    setGameState(prev => ({
      ...prev,
      images: roundImages,
      selectedItems: [],
      feedback: '',
      showHints: false,
      level: difficulty.level
    }))
    
    speakText('Name each picture as fast as you can!')
  }

  const handleItemClick = (id: number) => {
    if (gameState.selectedItems.includes(id)) return

    const item = gameState.images.find(img => img.id === id)
    const newSelected = [...gameState.selectedItems, id]
    
    if (user && item) {
      updateGameProgress(user.email, 'wordRecognition', {
        accuracy: 1,
        reactionTime: 1000,
        difficulty: gameState.level,
        timestamp: Date.now()
      })
    }

    setGameState(prev => ({
      ...prev,
      selectedItems: newSelected,
      score: prev.score + 1
    }))

    if (item) {
      speakText(item.name)
    }

    if (newSelected.length === gameState.images.length) {
      setGameState(prev => ({ ...prev, feedback: getEncouragingMessage(1, true) }))
      setTimeout(() => nextRound(), 2000)
    }
  }

  const showHints = () => {
    setGameState(prev => ({ ...prev, showHints: true }))
    gameState.images.forEach((item, index) => {
      setTimeout(() => speakText(item.name), index * 1000)
    })
  }

  const nextRound = () => {
    if (gameState.round >= maxRounds) {
      setGameState(prev => ({ ...prev, gameOver: true }))
    } else {
      setGameState(prev => ({ ...prev, round: prev.round + 1 }))
      generateRound()
    }
  }

  const resetGame = () => {
    setGameState({
      images: [],
      selectedItems: [],
      score: 0,
      round: 1,
      gameOver: false,
      feedback: '',
      showHints: false,
      level: 1
    })
    generateRound()
  }

  useEffect(() => {
    generateRound()
  }, [user])

  if (gameState.gameOver) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div className="card p-8 text-center max-w-md w-full">
          <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Speed Learning Complete!</h2>
          <p className="text-gray-600 mb-6">Score: {gameState.score} • Level: {gameState.level}</p>
          <button onClick={resetGame} className="btn btn-primary w-full">Continue Learning</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Speed Words Learning</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="font-semibold">Level {gameState.level}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-blue-500" />
                <span className="font-semibold">{gameState.score} pts</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-2">Round {gameState.round} of {maxRounds}</p>
            <p className="text-lg font-semibold text-primary-600">Click each picture and say its name!</p>
            <button onClick={showHints} className="btn btn-outline btn-sm mt-2">
              <Lightbulb className="w-4 h-4 mr-2" />
              Hear All Names
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-3 gap-6">
            {gameState.images.map((item) => {
              const isSelected = gameState.selectedItems.includes(item.id)
              const selectionOrder = gameState.selectedItems.indexOf(item.id) + 1
              
              return (
                <motion.button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`aspect-square rounded-xl border-2 transition-all relative flex flex-col items-center justify-center p-4 ${
                    isSelected 
                      ? 'bg-green-100 border-green-500 cursor-default' 
                      : 'bg-white border-gray-300 hover:border-primary-400 cursor-pointer'
                  }`}
                  whileHover={!isSelected ? { scale: 1.05 } : {}}
                  disabled={isSelected}
                >
                  <div className="text-6xl mb-2">{item.emoji}</div>
                  <div className="text-lg font-semibold text-gray-700">{item.name}</div>
                  
                  {isSelected && (
                    <motion.div className="absolute top-2 right-2 bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {selectionOrder}
                    </motion.div>
                  )}
                  
                  {gameState.showHints && !isSelected && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); speakText(item.name) }}
                      className="absolute top-2 left-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                  )}
                </motion.button>
              )
            })}
          </div>
          
          {gameState.feedback && (
            <motion.div className="mt-6 p-4 bg-green-50 text-green-700 rounded-lg text-center font-semibold">
              {gameState.feedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default SpeedWordsLearning