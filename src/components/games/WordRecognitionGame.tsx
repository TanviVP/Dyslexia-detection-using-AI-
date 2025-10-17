import React, { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Clock, Target, Volume2, Star, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '../../contexts/AuthContext'
import { gameConfigs, GameLevel } from '../../lib/gameConfig'
import LevelSelector from './LevelSelector'
import InteractiveButton from '../ui/InteractiveButton'
import AnimatedCard from '../ui/AnimatedCard'
import ProgressBar from '../ui/ProgressBar'
import { playSuccessSound, playErrorSound, createParticles, shakeElement } from '../../lib/gameEffects'
import { motion, AnimatePresence } from 'framer-motion'

interface WordRecognitionGameProps {
  onGameComplete?: (score: number) => void
}

const WordRecognitionGame: React.FC<WordRecognitionGameProps> = ({ onGameComplete }) => {
  const [selectedLevel, setSelectedLevel] = useState<GameLevel | null>(null)
  const [currentRound, setCurrentRound] = useState(0)
  const [score, setScore] = useState(0)
  const [gameStarted, setGameStarted] = useState(false)
  const [currentWord, setCurrentWord] = useState('')
  const [options, setOptions] = useState<string[]>([])
  const [timeLeft, setTimeLeft] = useState(10)
  const [gameComplete, setGameComplete] = useState(false)
  const [usedWords, setUsedWords] = useState<string[]>([])
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [streak, setStreak] = useState(0)
  const [showFeedback, setShowFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null)
  const { user } = useAuth()
  const navigate = useNavigate()
  const wordDisplayRef = useRef<HTMLDivElement>(null)
  
  const gameConfig = gameConfigs['word-recognition']

  const playWordSound = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.rate = 0.8
      utterance.pitch = 1
      utterance.volume = 0.8
      speechSynthesis.speak(utterance)
    }
  }

  const wordSets = {
    beginner: ['cat', 'dog', 'sun', 'car', 'run', 'big', 'red', 'hat', 'cup', 'pen', 'bat', 'man', 'box', 'toy', 'bee'],
    easy: ['house', 'water', 'happy', 'green', 'table', 'phone', 'smile', 'paper', 'light', 'music', 'shirt', 'plant', 'chair', 'bread', 'clock'],
    moderate: ['elephant', 'beautiful', 'computer', 'vacation', 'chemistry', 'telephone', 'paragraph', 'wonderful', 'dangerous', 'mountain', 'calendar', 'exercise', 'sandwich', 'dinosaur', 'umbrella'],
    hard: ['extraordinary', 'sophisticated', 'revolutionary', 'incomprehensible', 'pharmaceutical', 'archaeological', 'entrepreneurial', 'constitutional', 'environmental', 'psychological', 'technological', 'international', 'responsibility', 'characteristics', 'administration']
  }

  useEffect(() => {
    if (gameStarted && selectedLevel && currentRound < selectedLevel.questionsCount && timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      handleNextRound()
    }
  }, [timeLeft, gameStarted, currentRound, selectedLevel])

  const startGame = (level: GameLevel) => {
    setSelectedLevel(level)
    setGameStarted(true)
    setUsedWords([])
    setGameStartTime(Date.now())
    generateQuestion(level)
  }

  const generateQuestion = (level: GameLevel) => {
    const words = wordSets[level.id as keyof typeof wordSets]
    const availableWords = words.filter(word => !usedWords.includes(word))
    
    if (availableWords.length === 0) {
      setUsedWords([])
    }
    
    const wordsToUse = availableWords.length > 0 ? availableWords : words
    const correctWord = wordsToUse[Math.floor(Math.random() * wordsToUse.length)]
    
    const wrongWords = words
      .filter(w => w !== correctWord)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    const allOptions = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5)
    
    setCurrentWord(correctWord)
    setOptions(allOptions)
    setUsedWords(prev => [...prev, correctWord])
    setTimeLeft(level.timeLimit || 10)
    
    setTimeout(() => playWordSound(correctWord), 500)
  }

  const handleAnswer = (selectedWord: string) => {
    const isCorrect = selectedWord === currentWord
    
    if (isCorrect) {
      const newStreak = streak + 1
      setScore(score + 1)
      setStreak(newStreak)
      playSuccessSound()
      
      if (wordDisplayRef.current) {
        createParticles(wordDisplayRef.current, '#10B981')
      }
      
      const messages = [
        '🎉 Excellent!',
        '⭐ Perfect!',
        '🚀 Amazing!',
        '💫 Brilliant!',
        '🎯 Spot on!'
      ]
      
      let message = messages[Math.floor(Math.random() * messages.length)]
      if (newStreak >= 3) message += ` ${newStreak} in a row! 🔥`
      
      setShowFeedback({ type: 'success', message })
      toast.success(message)
    } else {
      setStreak(0)
      playErrorSound()
      
      if (wordDisplayRef.current) {
        shakeElement(wordDisplayRef.current)
      }
      
      const message = `❌ Try again! The word was "${currentWord}"`
      setShowFeedback({ type: 'error', message })
      toast.error(message)
    }
    
    setTimeout(() => {
      setShowFeedback(null)
      handleNextRound()
    }, 1500)
  }

  const handleNextRound = () => {
    if (!selectedLevel) return
    
    if (currentRound + 1 >= selectedLevel.questionsCount) {
      completeGame()
    } else {
      setCurrentRound(currentRound + 1)
      generateQuestion(selectedLevel)
    }
  }

  const completeGame = () => {
    if (!selectedLevel) return
    
    setGameComplete(true)
    const gameEndTime = Date.now()
    const gameDurationSeconds = Math.floor((gameEndTime - gameStartTime) / 1000)
    
    const result = {
      id: Date.now().toString(),
      userId: user?.id || 'anonymous',
      username: user?.email?.split('@')[0] || 'Anonymous',
      gameType: 'word-recognition',
      gameName: 'Word Recognition',
      difficulty: selectedLevel.difficulty,
      level: selectedLevel.name,
      score: score,
      totalQuestions: selectedLevel.questionsCount,
      hasDyslexia: score < selectedLevel.passingScore,
      completedAt: new Date().toISOString(),
      durationSeconds: gameDurationSeconds
    }
    
    const results = JSON.parse(localStorage.getItem('gameResults') || '[]')
    results.push(result)
    localStorage.setItem('gameResults', JSON.stringify(results))
    
    const passed = score >= selectedLevel.passingScore
    toast.success(`Game Complete! You scored ${score}/${selectedLevel.questionsCount}`, {
      description: passed ? 'Great job! No signs of dyslexia detected.' : 'You might benefit from further assessment.'
    })
    
    if (onGameComplete) {
      onGameComplete(score)
    }
  }

  const handleBack = () => {
    navigate('/games')
  }

  if (!selectedLevel) {
    return (
      <LevelSelector
        gameTitle={gameConfig.title}
        gameDescription={gameConfig.description}
        levels={gameConfig.levels}
        onLevelSelect={startGame}
        onBack={handleBack}
      />
    )
  }

  if (gameComplete) {
    return (
      <div className="min-h-screen gradient-bg p-4">
        <div className="max-w-2xl mx-auto">
          <AnimatedCard className="p-8 text-center">
            <motion.h1 
              className="text-3xl font-bold mb-4"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", duration: 0.6 }}
            >
              🎉 Game Complete!
            </motion.h1>
            
            <div className="mb-8">
              <motion.div 
                className="text-6xl font-bold text-primary-600 mb-2"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                {score}/{selectedLevel.questionsCount}
              </motion.div>
              <p className="text-xl text-gray-600 mb-4">
                {score >= selectedLevel.passingScore ? '✅ Great job! No signs of dyslexia detected.' : '⚠️ You might benefit from further assessment.'}
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-semibold">Level:</span> {selectedLevel.name}
                  </div>
                  <div>
                    <span className="font-semibold">Accuracy:</span> {Math.round((score / selectedLevel.questionsCount) * 100)}%
                  </div>
                </div>
              </div>
            </div>
            
            <div className="flex gap-4 justify-center">
              <InteractiveButton 
                onClick={() => window.location.reload()}
                variant="primary"
                particles={true}
              >
                Play Again
              </InteractiveButton>
              <InteractiveButton 
                onClick={handleBack}
                variant="outline"
              >
                Back to Games
              </InteractiveButton>
            </div>
          </AnimatedCard>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-bg p-4">
      <div className="max-w-2xl mx-auto">
        <AnimatedCard className="mb-6 p-6" delay={0.2}>
          <div className="flex justify-between items-center mb-4">
            <motion.h1 
              className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              Word Recognition - {selectedLevel.name}
            </motion.h1>
            <div className="text-right">
              <motion.div 
                className="flex items-center gap-4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600">Round</p>
                  <p className="text-lg font-bold">{currentRound + 1}/{selectedLevel.questionsCount}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-600">Score</p>
                  <p className="text-lg font-bold text-green-600">{score}</p>
                </div>
                {streak >= 2 && (
                  <motion.div 
                    className="text-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                  >
                    <p className="text-sm text-gray-600">Streak</p>
                    <p className="text-lg font-bold text-orange-500 flex items-center">
                      <Zap className="w-4 h-4 mr-1" />{streak}
                    </p>
                  </motion.div>
                )}
              </motion.div>
            </div>
          </div>
          
          <ProgressBar 
            progress={currentRound} 
            total={selectedLevel.questionsCount} 
            className="mb-4"
          />
          
          <motion.div 
            className="flex items-center justify-center text-sm text-gray-600"
            animate={{ 
              color: timeLeft <= 3 ? '#EF4444' : '#6B7280',
              scale: timeLeft <= 3 ? [1, 1.1, 1] : 1
            }}
            transition={{ duration: 0.5, repeat: timeLeft <= 3 ? Infinity : 0 }}
          >
            <Clock className="w-4 h-4 mr-1" />
            Time left: {timeLeft}s
          </motion.div>
        </AnimatedCard>

        <AnimatedCard className="p-8 text-center relative overflow-hidden" delay={0.4}>
          <AnimatePresence>
            {showFeedback && (
              <motion.div
                className={`absolute inset-0 flex items-center justify-center z-10 ${
                  showFeedback.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                } bg-opacity-90 text-white`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3 }}
              >
                <div className="text-center">
                  <motion.div
                    className="text-4xl mb-2"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    {showFeedback.type === 'success' ? '🎉' : '😅'}
                  </motion.div>
                  <p className="text-xl font-bold">{showFeedback.message}</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <h2 className="text-2xl font-bold mb-4">Which word matches the sound?</h2>
          
          <InteractiveButton
            onClick={() => playWordSound(currentWord)}
            className="mb-8 mx-auto flex items-center gap-2"
            variant="primary"
            particles={true}
          >
            <Volume2 className="w-5 h-5" />
            Play Sound Again
          </InteractiveButton>
          
          <motion.div 
            ref={wordDisplayRef}
            className="text-5xl font-bold mb-12 text-primary-600 p-6 bg-gradient-to-br from-primary-50 to-primary-100 rounded-xl border-2 border-primary-200 shadow-lg relative"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
            {currentWord}
            {streak >= 3 && (
              <motion.div
                className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold"
                initial={{ scale: 0 }}
                animate={{ scale: 1, rotate: 360 }}
                transition={{ duration: 0.5 }}
              >
                🔥
              </motion.div>
            )}
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            <AnimatePresence>
              {options.map((option, index) => (
                <motion.div
                  key={`${option}-${index}`}
                  initial={{ opacity: 0, y: 20, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <InteractiveButton
                    onClick={() => handleAnswer(option)}
                    className="w-full h-16 text-lg"
                    variant="outline"
                    particles={true}
                  >
                    {option}
                  </InteractiveButton>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </AnimatedCard>
      </div>
    </div>
  )
}

export default WordRecognitionGame