import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Eye, Star, Trophy, Lightbulb, Volume2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  letters: string[]
  targetLetter: string
  selectedIndices: number[]
  correctIndices: number[]
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  level: number
}

const LetterMirrorLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    letters: [],
    targetLetter: '',
    selectedIndices: [],
    correctIndices: [],
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    level: 1
  })

  const mirrorLetters = ['b', 'd', 'p', 'q', 'n', 'u', 'm', 'w']
  const maxRounds = 8

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'letterSequencing')
    const target = mirrorLetters[Math.floor(Math.random() * mirrorLetters.length)]
    const gridSize = Math.min(8 + difficulty.level * 2, 16)
    const letters = []
    const correctIndices = []
    
    const targetCount = Math.max(2, Math.min(4, difficulty.level))
    
    for (let i = 0; i < gridSize; i++) {
      if (i < targetCount) {
        letters.push(target)
        correctIndices.push(i)
      } else {
        const otherLetters = mirrorLetters.filter(l => l !== target)
        letters.push(otherLetters[Math.floor(Math.random() * otherLetters.length)])
      }
    }
    
    for (let i = letters.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[letters[i], letters[j]] = [letters[j], letters[i]]
      
      if (correctIndices.includes(i)) {
        correctIndices[correctIndices.indexOf(i)] = j
      }
      if (correctIndices.includes(j)) {
        correctIndices[correctIndices.indexOf(j)] = i
      }
    }

    setGameState(prev => ({
      ...prev,
      letters,
      targetLetter: target,
      correctIndices,
      selectedIndices: [],
      feedback: '',
      showHint: false,
      level: difficulty.level
    }))
    
    speakText(`Find all the ${target} letters`)
  }

  const handleLetterClick = (index: number) => {
    if (gameState.selectedIndices.includes(index)) return

    const newSelected = [...gameState.selectedIndices, index]
    const isCorrect = gameState.correctIndices.includes(index)
    const accuracy = isCorrect ? 1 : 0
    
    if (user) {
      updateGameProgress(user.email, 'letterSequencing', {
        accuracy,
        reactionTime: 1000,
        difficulty: gameState.level,
        timestamp: Date.now()
      })
    }

    setGameState(prev => ({
      ...prev,
      selectedIndices: newSelected,
      score: prev.score + (isCorrect ? 1 : 0),
      feedback: getEncouragingMessage(accuracy, true)
    }))

    const allCorrectSelected = gameState.correctIndices.every(i => 
      newSelected.includes(i) || gameState.selectedIndices.includes(i)
    )
    
    if (allCorrectSelected) {
      setTimeout(() => nextRound(), 1500)
    }
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, showHint: true }))
    speakText(`Look for the letter ${gameState.targetLetter}. It appears ${gameState.correctIndices.length} times.`)
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
      letters: [],
      targetLetter: '',
      selectedIndices: [],
      correctIndices: [],
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

  if (gameState.gameOver) {
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div className="card p-8 text-center max-w-md w-full">
          <Eye className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Visual Learning Complete!</h2>
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
            <h1 className="text-2xl font-bold">Letter Mirror Learning</h1>
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
            <p className="text-lg font-semibold text-primary-600">
              Find all "{gameState.targetLetter}" letters
            </p>
          </div>
        </div>

        <div className="card p-6 mb-6 text-center">
          <p className="text-lg mb-2">Target Letter:</p>
          <div className="text-6xl font-bold text-primary-600 bg-primary-50 rounded-lg p-4 inline-block mb-4">
            {gameState.targetLetter}
          </div>
          <div className="flex justify-center space-x-4">
            <button onClick={() => speakText(gameState.targetLetter)} className="btn btn-outline btn-sm">
              <Volume2 className="w-4 h-4 mr-2" />
              Hear Letter
            </button>
            <button onClick={showHint} className="btn btn-ghost btn-sm">
              <Lightbulb className="w-4 h-4 mr-2" />
              Hint
            </button>
          </div>
        </div>

        <div className="card p-6">
          <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
            {gameState.letters.map((letter, index) => {
              const isSelected = gameState.selectedIndices.includes(index)
              const isCorrect = gameState.correctIndices.includes(index)
              const isWrong = isSelected && !isCorrect
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleLetterClick(index)}
                  className={`aspect-square text-3xl font-bold rounded-lg border-2 transition-all ${
                    isSelected 
                      ? isCorrect 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'bg-red-100 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 hover:border-primary-400'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  disabled={isSelected}
                >
                  {letter}
                </motion.button>
              )
            })}
          </div>
          
          {gameState.showHint && (
            <motion.div className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg text-center">
              💡 Look carefully! The letter "{gameState.targetLetter}" appears {gameState.correctIndices.length} times.
            </motion.div>
          )}
          
          {gameState.feedback && (
            <motion.div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">
              {gameState.feedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LetterMirrorLearning