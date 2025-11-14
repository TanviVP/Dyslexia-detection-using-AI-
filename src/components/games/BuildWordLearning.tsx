import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Puzzle, Star, Trophy, Lightbulb, Volume2, RotateCcw } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'

interface GameState {
  targetWord: string
  scrambledLetters: string[]
  userWord: string[]
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  level: number
}

const BuildWordLearning: React.FC = () => {
  const { user } = useAuth()
  const [gameState, setGameState] = useState<GameState>({
    targetWord: '',
    scrambledLetters: [],
    userWord: [],
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    level: 1
  })

  const wordsByLevel = {
    1: ['CAT', 'DOG', 'SUN'],
    2: ['BIRD', 'TREE', 'BOOK'],
    3: ['HOUSE', 'WATER', 'HAPPY'],
    4: ['FRIEND', 'SCHOOL', 'GARDEN']
  }

  const maxRounds = 6

  const generateRound = () => {
    if (!user) return
    
    const difficulty = getAdaptiveDifficulty(user.email, 'letterSequencing')
    const level = Math.min(4, Math.max(1, difficulty.level))
    const levelWords = wordsByLevel[level as keyof typeof wordsByLevel]
    const word = levelWords[Math.floor(Math.random() * levelWords.length)]
    
    const letters = word.split('')
    const scrambled = [...letters]
    
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]]
    }
    
    setGameState(prev => ({
      ...prev,
      targetWord: word,
      scrambledLetters: scrambled,
      userWord: [],
      feedback: '',
      showHint: false,
      level
    }))
    
    speakText(`Build the word: ${word.toLowerCase()}`)
  }

  const addLetter = (letter: string, index: number) => {
    if (gameState.userWord.length >= gameState.targetWord.length) return
    
    const newUserWord = [...gameState.userWord, letter]
    const newScrambled = gameState.scrambledLetters.filter((_, i) => i !== index)
    
    setGameState(prev => ({
      ...prev,
      userWord: newUserWord,
      scrambledLetters: newScrambled
    }))
    
    speakText(letter)
  }

  const removeLetter = (index: number) => {
    const letter = gameState.userWord[index]
    const newUserWord = gameState.userWord.filter((_, i) => i !== index)
    const newScrambled = [...gameState.scrambledLetters, letter]
    
    setGameState(prev => ({
      ...prev,
      userWord: newUserWord,
      scrambledLetters: newScrambled
    }))
  }

  const submitWord = () => {
    const userWordStr = gameState.userWord.join('')
    const isCorrect = userWordStr === gameState.targetWord
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
      score: prev.score + (isCorrect ? 1 : 0),
      feedback: getEncouragingMessage(accuracy, true)
    }))

    if (isCorrect) {
      speakText('Excellent! You built the word correctly!')
    } else {
      speakText(`Not quite. The correct word is ${gameState.targetWord.toLowerCase()}`)
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
    speakText(`The word is ${gameState.targetWord.toLowerCase()}. Listen to each letter:`)
    
    gameState.targetWord.split('').forEach((letter, index) => {
      setTimeout(() => speakText(letter), (index + 1) * 800)
    })
  }

  const resetGame = () => {
    setGameState({
      targetWord: '',
      scrambledLetters: [],
      userWord: [],
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
          <Puzzle className="w-16 h-16 text-purple-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Word Building Complete!</h2>
          <p className="text-gray-600 mb-6">Score: {gameState.score}/{maxRounds} • Level: {gameState.level}</p>
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
            <h1 className="text-2xl font-bold">Build Word Learning</h1>
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-500" />
                <span className="font-semibold">Level {gameState.level}</span>
              </div>
              <div className="flex items-center">
                <Trophy className="w-5 h-5 mr-2 text-purple-500" />
                <span className="font-semibold">{gameState.score}/{maxRounds}</span>
              </div>
            </div>
          </div>
          
          <div className="text-center">
            <p className="text-lg mb-2">Round {gameState.round} of {maxRounds}</p>
            <p className="text-lg font-semibold text-primary-600">
              Build: {gameState.targetWord.toLowerCase()}
            </p>
            <div className="flex justify-center space-x-4 mt-4">
              <button onClick={() => speakText(gameState.targetWord.toLowerCase())} className="btn btn-outline btn-sm">
                <Volume2 className="w-4 h-4 mr-2" />
                Hear Word
              </button>
              <button onClick={showHint} className="btn btn-ghost btn-sm">
                <Lightbulb className="w-4 h-4 mr-2" />
                Spell Help
              </button>
            </div>
          </div>
        </div>

        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Your Word:</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {Array.from({ length: gameState.targetWord.length }).map((_, index) => (
                <div key={index} className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  {gameState.userWord[index] && (
                    <motion.button
                      onClick={() => removeLetter(index)}
                      className="w-full h-full bg-primary-500 text-white rounded-lg text-xl font-bold hover:bg-primary-600"
                      whileHover={{ scale: 1.05 }}
                    >
                      {gameState.userWord[index]}
                    </motion.button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Available Letters:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.scrambledLetters.map((letter, index) => (
                <motion.button
                  key={`${letter}-${index}`}
                  onClick={() => addLetter(letter, index)}
                  className="w-14 h-14 bg-white border-2 border-gray-300 rounded-lg text-xl font-bold hover:border-primary-400 hover:bg-primary-50"
                  whileHover={{ scale: 1.05 }}
                  disabled={!!gameState.feedback}
                >
                  {letter}
                </motion.button>
              ))}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={submitWord}
              disabled={gameState.userWord.length !== gameState.targetWord.length || !!gameState.feedback}
              className="btn btn-primary"
            >
              Check Word
            </button>
            
            <button onClick={() => generateRound()} disabled={!!gameState.feedback} className="btn btn-outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>

          {gameState.showHint && (
            <motion.div className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center">
              💡 Listen to each letter sound and put them in order to make the word.
            </motion.div>
          )}

          {gameState.feedback && (
            <motion.div className="mt-6 p-4 bg-blue-50 text-blue-700 rounded-lg text-center font-semibold">
              {gameState.feedback}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BuildWordLearning