import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Volume2, Star, Trophy, Lightbulb, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getLearningProfile, updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  currentWord: string
  options: string[]
  correctIndex: number
  selectedIndex: number | null
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  startTime: number
  level: number
  category: string
}

const WordRecognitionLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    currentWord: '',
    options: [],
    correctIndex: 0,
    selectedIndex: null,
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    startTime: 0,
    level: 1,
    category: 'animals'
  })

  const wordCategories = {
    animals: ['cat', 'dog', 'bird', 'fish', 'lion', 'tiger', 'elephant', 'monkey'],
    colors: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'brown'],
    numbers: ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight'],
    everyday: ['house', 'car', 'book', 'chair', 'table', 'phone', 'water', 'food']
  }

  const maxRounds = 10

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'wordRecognition')
    const categoryWords = wordCategories[gameState.category as keyof typeof wordCategories]
    const word = categoryWords[Math.floor(Math.random() * categoryWords.length)]
    
    // Create similar-looking options based on difficulty
    const options = [word]
    const usedWords = new Set([word])
    
    const optionsCount = Math.min(6, 2 + difficulty.level)
    
    while (options.length < optionsCount) {
      const randomWord = categoryWords[Math.floor(Math.random() * categoryWords.length)]
      if (!usedWords.has(randomWord)) {
        options.push(randomWord)
        usedWords.add(randomWord)
      }
    }
    
    // Shuffle options
    for (let i = options.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[options[i], options[j]] = [options[j], options[i]]
    }
    
    const correctIndex = options.indexOf(word)
    
    setGameState(prev => ({
      ...prev,
      currentWord: word,
      options,
      correctIndex,
      selectedIndex: null,
      feedback: '',
      showHint: false,
      startTime: Date.now(),
      level: difficulty.level
    }))
    
    // Speak the word
    setTimeout(() => speakText(word, 0.7), 500)
  }

  const handleWordSelect = (index: number) => {
    if (gameState.selectedIndex !== null) return
    
    const isCorrect = index === gameState.correctIndex
    const reactionTime = Date.now() - gameState.startTime
    const accuracy = isCorrect ? 1 : 0
    
    setGameState(prev => ({ ...prev, selectedIndex: index }))
    
    if (user) {
      const profile = updateGameProgress(user.email, 'wordRecognition', {
        accuracy,
        reactionTime,
        difficulty: gameState.level,
        timestamp: Date.now()
      })
      
      const recentAccuracy = profile.wordRecognition.averageAccuracy
      const isImprovement = profile.wordRecognition.attempts.length > 1 && 
        accuracy > profile.wordRecognition.attempts[profile.wordRecognition.attempts.length - 2].accuracy
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + (isCorrect ? 1 : 0),
        feedback: getEncouragingMessage(recentAccuracy, isImprovement)
      }))
    }
    
    if (isCorrect) {
      speakText("Correct! Well done!")
    } else {
      speakText(`Not quite. The correct word was ${gameState.currentWord}`)
    }
    
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
    speakText(`Listen again: ${gameState.currentWord}`, 0.5)
  }

  const resetGame = () => {
    setGameState({
      currentWord: '',
      options: [],
      correctIndex: 0,
      selectedIndex: null,
      score: 0,
      round: 1,
      gameOver: false,
      feedback: '',
      showHint: false,
      startTime: 0,
      level: 1,
      category: 'animals'
    })
    generateRound()
  }

  useEffect(() => {
    generateRound()
  }, [user])

  if (gameState.gameOver) {
    const profile = user ? getLearningProfile(user.email) : null
    const badges = profile?.wordRecognition.badges || []
    
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div 
          className="card p-8 text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Learning Session Complete!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-gray-600">Score: {gameState.score}/{maxRounds}</p>
            <p className="text-gray-600">Current Level: {gameState.level}</p>
            {badges.length > 0 && (
              <div className="flex justify-center space-x-2 mt-4">
                {badges.map(badge => (
                  <div key={badge} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    🏆 {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={resetGame} className="btn btn-primary w-full">
            Continue Learning
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Word Recognition Learning</h1>
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
            <p className="text-lg font-semibold text-primary-600">
              Listen and click the word you hear
            </p>
          </div>
        </div>

        {/* Audio Control */}
        <div className="card p-6 mb-6 text-center">
          <div className="mb-4">
            <Volume2 className="w-12 h-12 text-primary-500 mx-auto mb-2" />
            <p className="text-lg font-semibold">Listen carefully...</p>
          </div>
          
          <div className="flex justify-center space-x-4">
            <button 
              onClick={() => speakText(gameState.currentWord, 0.7)}
              className="btn btn-outline"
            >
              <Volume2 className="w-4 h-4 mr-2" />
              Repeat
            </button>
            
            <button 
              onClick={showHint}
              className="btn btn-ghost"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Hint
            </button>
          </div>
          
          {gameState.showHint && (
            <motion.div 
              className="mt-4 p-3 bg-yellow-50 text-yellow-800 rounded-lg"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              💡 Listen to the slower pronunciation and focus on each sound
            </motion.div>
          )}
        </div>

        {/* Word Options */}
        <div className="card p-6">
          <div className="grid grid-cols-2 gap-4">
            {gameState.options.map((word, index) => {
              const isSelected = gameState.selectedIndex === index
              const isCorrect = index === gameState.correctIndex
              const isWrong = isSelected && !isCorrect
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleWordSelect(index)}
                  className={`
                    p-6 rounded-lg border-2 text-xl font-semibold transition-all duration-200
                    ${isSelected 
                      ? isCorrect 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'bg-red-100 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }
                  `}
                  whileHover={!isSelected ? { scale: 1.02 } : {}}
                  whileTap={!isSelected ? { scale: 0.98 } : {}}
                  disabled={gameState.selectedIndex !== null}
                >
                  {word}
                </motion.button>
              )
            })}
          </div>
          
          {gameState.feedback && (
            <motion.div 
              className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              {gameState.feedback}
            </motion.div>
          )}
        </div>

        {/* Category Selector */}
        <div className="card p-4 mt-6">
          <p className="text-sm font-medium mb-2">Practice Category:</p>
          <div className="flex space-x-2">
            {Object.keys(wordCategories).map(category => (
              <button
                key={category}
                onClick={() => setGameState(prev => ({ ...prev, category }))}
                className={`px-3 py-1 rounded-full text-sm ${
                  gameState.category === category 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default WordRecognitionLearning