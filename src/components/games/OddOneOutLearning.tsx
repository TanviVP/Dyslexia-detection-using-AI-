import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Star, Trophy, Lightbulb, Volume2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  words: string[]
  correctAnswer: number
  selectedWord: number | null
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  level: number
}

const OddOneOutLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    words: [],
    correctAnswer: -1,
    selectedWord: null,
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    level: 1
  })

  const wordGroups = [
    { pattern: ['cat', 'bat', 'hat', 'dog'], odd: 3, hint: 'Three words rhyme, one does not' },
    { pattern: ['sun', 'fun', 'run', 'car'], odd: 3, hint: 'Look for rhyming words' },
    { pattern: ['red', 'blue', 'green', 'happy'], odd: 3, hint: 'Three are colors, one is not' },
    { pattern: ['car', 'bus', 'train', 'flower'], odd: 3, hint: 'Three are vehicles, one is not' }
  ]

  const maxRounds = 5

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'wordRecognition')
    const group = wordGroups[Math.floor(Math.random() * wordGroups.length)]
    const shuffledWords = [...group.pattern]
    
    let oddIndex = group.odd
    for (let i = shuffledWords.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[shuffledWords[i], shuffledWords[j]] = [shuffledWords[j], shuffledWords[i]]
      
      if (i === oddIndex) oddIndex = j
      else if (j === oddIndex) oddIndex = i
    }

    setGameState(prev => ({
      ...prev,
      words: shuffledWords,
      correctAnswer: oddIndex,
      selectedWord: null,
      feedback: '',
      showHint: false,
      level: difficulty.level,
      currentHint: group.hint
    }))
    
    speakText('Which word does not belong with the others?')
  }

  const handleWordClick = (index: number) => {
    if (gameState.selectedWord !== null) return

    const isCorrect = index === gameState.correctAnswer
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
      selectedWord: index,
      score: prev.score + (isCorrect ? 1 : 0),
      feedback: getEncouragingMessage(accuracy, true)
    }))

    if (isCorrect) {
      speakText('Correct! You found the odd one out!')
    } else {
      speakText(`Not quite. The odd one was "${gameState.words[gameState.correctAnswer]}"`)
    }

    setTimeout(() => {
      if (gameState.round >= maxRounds) {
        setGameState(prev => ({ ...prev, gameOver: true }))
      } else {
        setGameState(prev => ({ ...prev, round: prev.round + 1 }))
        generateRound()
      }
    }, 2500)
  }

  const showHint = () => {
    setGameState(prev => ({ ...prev, showHint: true }))
    const group = wordGroups.find(g => 
      g.pattern.every(word => gameState.words.includes(word))
    )
    if (group) {
      speakText(group.hint)
    }
  }

  const readAllWords = () => {
    gameState.words.forEach((word, index) => {
      setTimeout(() => speakText(word), index * 800)
    })
  }

  const resetGame = () => {
    setGameState({
      words: [],
      correctAnswer: -1,
      selectedWord: null,
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
          <Search className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Pattern Learning Complete!</h2>
          <p className="text-gray-600 mb-6">Score: {gameState.score}/{maxRounds} • Level: {gameState.level}</p>
          <button onClick={resetGame} className="btn btn-primary w-full">Continue Learning</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-3xl mx-auto">
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Odd One Out Learning</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="font-semibold">Level {gameState.level}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-green-500" />
                <span className="font-semibold">{gameState.score}/{maxRounds}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-2">Round {gameState.round} of {maxRounds}</p>
            <p className="text-lg font-semibold text-primary-600">Which word doesn't belong?</p>
            <div className="flex justify-center space-x-4 mt-4">
              <button onClick={readAllWords} className="btn btn-outline btn-sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Read All
              </button>
              <button onClick={showHint} className="btn btn-ghost btn-sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Hint
              </button>
            </div>
          </div>
        </div>

        <div className="card p-8">
          <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
            {gameState.words.map((word, index) => {
              const isSelected = gameState.selectedWord === index
              const isCorrect = index === gameState.correctAnswer
              const isWrong = isSelected && !isCorrect
              
              return (
                <motion.button
                  key={index}
                  onClick={() => handleWordClick(index)}
                  className={`aspect-square rounded-xl border-2 transition-all relative flex items-center justify-center p-6 text-2xl font-bold ${
                    isSelected 
                      ? isCorrect 
                        ? 'bg-green-100 border-green-500 text-green-700' 
                        : 'bg-red-100 border-red-500 text-red-700'
                      : 'bg-white border-gray-300 hover:border-primary-400 text-gray-800'
                  }`}
                  whileHover={!isSelected ? { scale: 1.02 } : {}}
                  disabled={gameState.selectedWord !== null}
                >
                  {word}
                  
                  <button 
                    onClick={(e) => { e.stopPropagation(); speakText(word) }}
                    className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-75 hover:opacity-100"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </motion.button>
              )
            })}
          </div>
          
          {gameState.showHint && (
            <motion.div className="mt-8 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
              💡 Look for patterns: Do some words rhyme? Are some the same type of thing?
            </motion.div>
          )}
          
          {gameState.feedback && (
            <motion.div className="mt-8 p-4 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">
              {gameState.feedback}
            </motion.div>
          )}
        </div>

        <div className="card p-4 mt-6">
          <h4 className="font-semibold text-sm mb-2">💡 Pattern Tips:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="bg-blue-50 p-2 rounded">🎵 Listen for rhyming sounds</div>
            <div className="bg-green-50 p-2 rounded">🏷️ Group by categories</div>
            <div className="bg-purple-50 p-2 rounded">👀 Look at word shapes</div>
            <div className="bg-orange-50 p-2 rounded">📏 Compare word lengths</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OddOneOutLearning