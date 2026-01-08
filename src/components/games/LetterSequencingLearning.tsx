import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Shuffle, Star, Trophy, Lightbulb, RotateCcw, MousePointer } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { getLearningProfile, updateGameProgress, getAdaptiveDifficulty, getEncouragingMessage, speakText } from '../../lib/learningProgress'
import { saveGameScore } from '../../services/gamesService'

interface GameState {
  targetWord: string
  scrambledLetters: string[]
  userSequence: string[]
  score: number
  round: number
  gameOver: boolean
  feedback: string
  showHint: boolean
  traceMode: boolean
  startTime: number
  level: number
  mistakes: string[]
}

const LetterSequencingLearning: React.FC = () => {
  const { user } = useAuth()
  const [saving, setSaving] = useState(false)
  const [gameState, setGameState] = useState<GameState>({
    targetWord: '',
    scrambledLetters: [],
    userSequence: [],
    score: 0,
    round: 1,
    gameOver: false,
    feedback: '',
    showHint: false,
    traceMode: false,
    startTime: 0,
    level: 1,
    mistakes: []
  })

  const wordsByLevel = {
    1: ['cat', 'dog', 'sun', 'run'],
    2: ['bird', 'tree', 'book', 'play'],
    3: ['house', 'water', 'happy', 'light'],
    4: ['friend', 'school', 'garden', 'bridge'],
    5: ['elephant', 'butterfly', 'rainbow', 'mountain']
  }

  const confusableLetters = {
    'b': 'd', 'd': 'b', 'p': 'q', 'q': 'p',
    'n': 'u', 'u': 'n', 'm': 'w', 'w': 'm'
  }

  const maxRounds = 8

  const generateRound = () => {
    if (!user) return
    
    const adaptiveDifficulty = getAdaptiveDifficulty(user.email || '', 'letterSequencing')
    const currentLevel = Math.max(1, Math.min(5, difficulty || adaptiveDifficulty.level))
    const levelWords = wordsByLevel[currentLevel as keyof typeof wordsByLevel]
    const word = levelWords[Math.floor(Math.random() * levelWords.length)]
    
    // Create scrambled letters
    const letters = word.toUpperCase().split('')
    const scrambled = [...letters]
    
    // Shuffle the letters
    for (let i = scrambled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1))
      ;[scrambled[i], scrambled[j]] = [scrambled[j], scrambled[i]]
    }
    
    setGameState(prev => ({
      ...prev,
      targetWord: word.toUpperCase(),
      scrambledLetters: scrambled,
      userSequence: [],
      feedback: '',
      showHint: false,
      traceMode: false,
      startTime: Date.now(),
      level: currentLevel
    }))
    
    // Speak the word
    setTimeout(() => speakText(`Spell the word: ${word}`), 500)
  }

  const addLetter = (letter: string, index: number) => {
    if (gameState.userSequence.length >= gameState.targetWord.length) return
    
    const newSequence = [...gameState.userSequence, letter]
    const newScrambled = gameState.scrambledLetters.filter((_, i) => i !== index)
    
    setGameState(prev => ({
      ...prev,
      userSequence: newSequence,
      scrambledLetters: newScrambled
    }))
    
    speakText(letter)
  }

  const removeLetter = (index: number) => {
    const letter = gameState.userSequence[index]
    const newSequence = gameState.userSequence.filter((_, i) => i !== index)
    const newScrambled = [...gameState.scrambledLetters, letter]
    
    setGameState(prev => ({
      ...prev,
      userSequence: newSequence,
      scrambledLetters: newScrambled
    }))
  }

  const checkWord = async () => {
    const userWord = gameState.userSequence.join('')
    const isCorrect = userWord === gameState.targetWord
    const reactionTime = Date.now() - gameState.startTime
    const accuracy = isCorrect ? 100 : 0
    
    if (!isCorrect) {
      // Track mistakes for revision mode
      const newMistakes = [...gameState.mistakes]
      if (!newMistakes.includes(gameState.targetWord)) {
        newMistakes.push(gameState.targetWord)
      }
      setGameState(prev => ({ ...prev, mistakes: newMistakes }))
    }
    
    // Save score to backend
    if (user?.id) {
      setSaving(true)
      try {
        await saveGameScore({
          userId: user.id,
          gameName: 'letter_sequencing',
          difficulty: gameState.level.toString(),
          accuracy: accuracy / 100,
          avgResponseTime: reactionTime,
          errors: isCorrect ? {} : { [gameState.targetWord]: userWord }
        })
      } catch (err) {
        console.error("Failed to save score:", err)
      } finally {
        setSaving(false)
      }
    }
    
    if (user) {
      const profile = updateGameProgress(user.email || '', 'letterSequencing', {
        accuracy: accuracy / 100,
        reactionTime,
        difficulty: gameState.level,
        timestamp: Date.now()
      })
      
      const recentAccuracy = profile.letterSequencing.averageAccuracy
      const isImprovement = profile.letterSequencing.attempts.length > 1 && 
        (accuracy / 100) > profile.letterSequencing.attempts[profile.letterSequencing.attempts.length - 2].accuracy
      
      setGameState(prev => ({
        ...prev,
        score: prev.score + (isCorrect ? 1 : 0),
        feedback: getEncouragingMessage(recentAccuracy, isImprovement)
      }))
    }
    
    if (isCorrect) {
      speakText("Perfect! You spelled it correctly!")
    } else {
      speakText(`Not quite. The correct spelling is ${gameState.targetWord}`)
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
    speakText(`The word is ${gameState.targetWord}. Listen to each letter:`)
    
    gameState.targetWord.split('').forEach((letter, index) => {
      setTimeout(() => speakText(letter), (index + 1) * 800)
    })
  }

  const enableTraceMode = () => {
    setGameState(prev => ({ ...prev, traceMode: true }))
  }

  const resetRound = () => {
    generateRound()
  }

  const resetGame = () => {
    setGameState({
      targetWord: '',
      scrambledLetters: [],
      userSequence: [],
      score: 0,
      round: 1,
      gameOver: false,
      feedback: '',
      showHint: false,
      traceMode: false,
      startTime: 0,
      level: 1,
      mistakes: []
    })
    generateRound()
  }

  useEffect(() => {
    generateRound()
  }, [user])

  if (gameState.gameOver) {
    const profile = user ? getLearningProfile(user.email) : null
    const badges = profile?.letterSequencing.badges || []
    
    return (
      <div className="min-h-screen gradient-bg flex items-center justify-center p-4">
        <motion.div 
          className="card p-8 text-center max-w-md w-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <Shuffle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-4">Spelling Practice Complete!</h2>
          <div className="space-y-2 mb-6">
            <p className="text-gray-600">Score: {gameState.score}/{maxRounds}</p>
            <p className="text-gray-600">Current Level: {gameState.level}</p>
            {gameState.mistakes.length > 0 && (
              <div className="mt-4">
                <p className="text-sm text-gray-600">Words to review:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {gameState.mistakes.map(word => (
                    <span key={word} className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {badges.length > 0 && (
              <div className="flex justify-center space-x-2 mt-4">
                {badges.map(badge => (
                  <div key={badge} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    ✏️ {badge}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={resetGame} className="btn btn-primary w-full">
            Continue Practice
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="card p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-2xl font-bold">Letter Sequencing Learning</h1>
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
            <p className="text-lg font-semibold text-primary-600">
              Arrange the letters to spell: <span className="text-2xl">{gameState.targetWord.toLowerCase()}</span>
            </p>
          </div>
        </div>

        {/* Word Building Area */}
        <div className="card p-6 mb-6">
          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Your Word:</h3>
            <div className="flex justify-center space-x-2 mb-6">
              {Array.from({ length: gameState.targetWord.length }).map((_, index) => (
                <div
                  key={index}
                  className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 relative"
                >
                  {gameState.userSequence[index] && (
                    <motion.button
                      onClick={() => removeLetter(index)}
                      className={`w-full h-full rounded-lg text-xl font-bold transition-colors ${
                        gameState.traceMode 
                          ? 'bg-purple-500 text-white hover:bg-purple-600' 
                          : 'bg-primary-500 text-white hover:bg-primary-600'
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {gameState.userSequence[index]}
                    </motion.button>
                  )}
                  {gameState.traceMode && !gameState.userSequence[index] && (
                    <div className="absolute inset-0 border-2 border-dotted border-purple-300 rounded-lg flex items-center justify-center text-purple-400 text-xs">
                      trace
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mb-6">
            <h3 className="text-lg font-semibold mb-4">Available Letters:</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {gameState.scrambledLetters.map((letter, index) => {
                const isConfusable = letter.toLowerCase() in confusableLetters
                
                return (
                  <motion.button
                    key={`${letter}-${index}`}
                    onClick={() => addLetter(letter, index)}
                    className={`w-14 h-14 border-2 rounded-lg text-xl font-bold transition-all ${
                      isConfusable 
                        ? 'bg-yellow-50 border-yellow-400 text-yellow-800 hover:bg-yellow-100' 
                        : 'bg-white border-gray-300 hover:border-primary-400 hover:bg-primary-50'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    disabled={!!gameState.feedback}
                  >
                    {letter}
                  </motion.button>
                )
              })}
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={checkWord}
              disabled={gameState.userSequence.length !== gameState.targetWord.length || !!gameState.feedback || saving}
              className="btn btn-primary"
            >
              {saving ? 'Saving...' : 'Check Spelling'}
            </button>
            
            <button
              onClick={showHint}
              disabled={!!gameState.feedback}
              className="btn btn-outline"
            >
              <Lightbulb className="w-4 h-4 mr-2" />
              Hint
            </button>
            
            <button
              onClick={enableTraceMode}
              disabled={!!gameState.feedback}
              className="btn btn-ghost"
            >
              <MousePointer className="w-4 h-4 mr-2" />
              Trace Mode
            </button>
            
            <button
              onClick={resetRound}
              disabled={!!gameState.feedback}
              className="btn btn-ghost"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </button>
          </div>

          {gameState.showHint && (
            <motion.div 
              className="mt-6 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              💡 Listen carefully to each letter sound. The word is "{gameState.targetWord.toLowerCase()}"
            </motion.div>
          )}

          {gameState.traceMode && (
            <motion.div 
              className="mt-6 p-4 bg-purple-50 text-purple-800 rounded-lg text-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              ✏️ Trace Mode: Click and drag to trace each letter shape before placing it
            </motion.div>
          )}
          
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

        {/* Letter Confusion Helper */}
        <div className="card p-4">
          <h4 className="font-semibold text-sm mb-2">💡 Letter Tips:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
            <div className="bg-yellow-50 p-2 rounded text-center">
              <span className="font-bold text-yellow-800">b vs d</span>
              <div className="text-xs text-yellow-600">b has belly on right</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded text-center">
              <span className="font-bold text-yellow-800">p vs q</span>
              <div className="text-xs text-yellow-600">p points right</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded text-center">
              <span className="font-bold text-yellow-800">n vs u</span>
              <div className="text-xs text-yellow-600">n has humps up</div>
            </div>
            <div className="bg-yellow-50 p-2 rounded text-center">
              <span className="font-bold text-yellow-800">m vs w</span>
              <div className="text-xs text-yellow-600">m has humps up</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LetterSequencingLearning